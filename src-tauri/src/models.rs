use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Post {
    pub id: String,
    pub username: String,
    pub caption: String,
    pub media_paths: Vec<String>,
    pub platforms: Vec<String>,
    pub scheduled_at: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct CreatePostInput {
    pub username: String,
    pub caption: String,
    pub media_paths: Vec<String>,
    pub platforms: Vec<String>,
    pub scheduled_at: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdatePostInput {
    pub id: String,
    pub username: String,
    pub caption: String,
    pub media_paths: Vec<String>,
    pub platforms: Vec<String>,
    pub scheduled_at: String,
}
