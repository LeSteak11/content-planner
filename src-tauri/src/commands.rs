use crate::models::{CreatePostInput, Post, UpdatePostInput};
use crate::AppState;
use chrono::Utc;
use std::fs;
use std::path::PathBuf;
use tauri::State;
use uuid::Uuid;

#[tauri::command]
pub fn create_post(
    state: State<AppState>,
    input: CreatePostInput,
) -> Result<Post, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    
    let id = Uuid::new_v4().to_string();
    let now = Utc::now().to_rfc3339();
    
    let post = Post {
        id: id.clone(),
        username: input.username,
        caption: input.caption,
        media_paths: input.media_paths.clone(),
        platforms: input.platforms.clone(),
        scheduled_at: input.scheduled_at,
        created_at: now.clone(),
        updated_at: now,
    };
    
    db.execute(
        "INSERT INTO posts (id, username, caption, media_paths, platforms, scheduled_at, created_at, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
        rusqlite::params![
            &post.id,
            &post.username,
            &post.caption,
            serde_json::to_string(&post.media_paths).map_err(|e| e.to_string())?,
            serde_json::to_string(&post.platforms).map_err(|e| e.to_string())?,
            &post.scheduled_at,
            &post.created_at,
            &post.updated_at,
        ],
    )
    .map_err(|e| e.to_string())?;
    
    Ok(post)
}

#[tauri::command]
pub fn get_all_posts(state: State<AppState>) -> Result<Vec<Post>, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = db
        .prepare("SELECT id, username, caption, media_paths, platforms, scheduled_at, created_at, updated_at FROM posts ORDER BY scheduled_at ASC")
        .map_err(|e| e.to_string())?;
    
    let posts = stmt
        .query_map([], |row| {
            let media_paths_str: String = row.get(3)?;
            let platforms_str: String = row.get(4)?;
            
            Ok(Post {
                id: row.get(0)?,
                username: row.get(1)?,
                caption: row.get(2)?,
                media_paths: serde_json::from_str(&media_paths_str).unwrap_or_default(),
                platforms: serde_json::from_str(&platforms_str).unwrap_or_default(),
                scheduled_at: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<Post>, _>>()
        .map_err(|e| e.to_string())?;
    
    Ok(posts)
}

#[tauri::command]
pub fn get_post(state: State<AppState>, id: String) -> Result<Post, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    
    let mut stmt = db
        .prepare("SELECT id, username, caption, media_paths, platforms, scheduled_at, created_at, updated_at FROM posts WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    
    let post = stmt
        .query_row([id], |row| {
            let media_paths_str: String = row.get(3)?;
            let platforms_str: String = row.get(4)?;
            
            Ok(Post {
                id: row.get(0)?,
                username: row.get(1)?,
                caption: row.get(2)?,
                media_paths: serde_json::from_str(&media_paths_str).unwrap_or_default(),
                platforms: serde_json::from_str(&platforms_str).unwrap_or_default(),
                scheduled_at: row.get(5)?,
                created_at: row.get(6)?,
                updated_at: row.get(7)?,
            })
        })
        .map_err(|e| e.to_string())?;
    
    Ok(post)
}

#[tauri::command]
pub fn update_post(
    state: State<AppState>,
    input: UpdatePostInput,
) -> Result<Post, String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    
    let now = Utc::now().to_rfc3339();
    
    db.execute(
        "UPDATE posts SET username = ?1, caption = ?2, media_paths = ?3, platforms = ?4, scheduled_at = ?5, updated_at = ?6 WHERE id = ?7",
        rusqlite::params![
            &input.username,
            &input.caption,
            serde_json::to_string(&input.media_paths).map_err(|e| e.to_string())?,
            serde_json::to_string(&input.platforms).map_err(|e| e.to_string())?,
            &input.scheduled_at,
            &now,
            &input.id,
        ],
    )
    .map_err(|e| e.to_string())?;
    
    get_post(state, input.id)
}

#[tauri::command]
pub fn delete_post(state: State<AppState>, id: String) -> Result<(), String> {
    let db = state.db.lock().map_err(|e| e.to_string())?;
    
    // Get post to retrieve media paths for deletion
    let mut stmt = db
        .prepare("SELECT media_paths FROM posts WHERE id = ?1")
        .map_err(|e| e.to_string())?;
    
    let media_paths_str: String = stmt
        .query_row([&id], |row| row.get(0))
        .map_err(|e| e.to_string())?;
    
    let media_paths: Vec<String> = serde_json::from_str(&media_paths_str).unwrap_or_default();
    
    // Delete post from database
    db.execute("DELETE FROM posts WHERE id = ?1", [&id])
        .map_err(|e| e.to_string())?;
    
    // Delete associated media files
    for path in media_paths {
        let file_path = PathBuf::from(&path);
        if file_path.exists() {
            let _ = fs::remove_file(file_path);
        }
    }
    
    Ok(())
}

#[tauri::command]
pub fn save_media_files(
    state: State<AppState>,
    file_paths: Vec<String>,
) -> Result<Vec<String>, String> {
    let mut saved_paths = Vec::new();
    
    for path in file_paths {
        let source = PathBuf::from(&path);
        
        if !source.exists() {
            return Err(format!("File not found: {}", path));
        }
        
        // Generate unique filename
        let extension = source
            .extension()
            .and_then(|e| e.to_str())
            .unwrap_or("");
        let filename = format!("{}.{}", Uuid::new_v4(), extension);
        let dest = state.media_dir.join(&filename);
        
        fs::copy(&source, &dest).map_err(|e| e.to_string())?;
        
        saved_paths.push(dest.to_string_lossy().to_string());
    }
    
    Ok(saved_paths)
}

#[tauri::command]
pub fn get_media_dir(state: State<AppState>) -> String {
    state.media_dir.to_string_lossy().to_string()
}
