export interface Post {
  id: string;
  username: string;
  caption: string;
  media_paths: string[];
  platforms: string[];
  scheduled_at: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePostInput {
  username: string;
  caption: string;
  media_paths: string[];
  platforms: string[];
  scheduled_at: string;
}

export interface UpdatePostInput extends CreatePostInput {
  id: string;
}
