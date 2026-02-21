// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
mod models;
mod commands;

use std::sync::Mutex;
use tauri::State;

pub struct AppState {
    db: Mutex<rusqlite::Connection>,
    media_dir: std::path::PathBuf,
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let app_dir = app.path_resolver()
                .app_data_dir()
                .expect("Failed to get app data directory");
            
            // Create app directory if it doesn't exist
            std::fs::create_dir_all(&app_dir)?;
            
            // Create media directory
            let media_dir = app_dir.join("media");
            std::fs::create_dir_all(&media_dir)?;
            
            // Initialize database
            let db_path = app_dir.join("posts.db");
            let conn = rusqlite::Connection::open(db_path)?;
            db::init_db(&conn)?;
            
            // Set up app state
            app.manage(AppState {
                db: Mutex::new(conn),
                media_dir,
            });
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::create_post,
            commands::get_all_posts,
            commands::get_post,
            commands::update_post,
            commands::delete_post,
            commands::save_media_files,
            commands::get_media_dir,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
