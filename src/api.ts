import { invoke } from '@tauri-apps/api/tauri';
import { open } from '@tauri-apps/api/dialog';
import { Post, CreatePostInput, UpdatePostInput } from './types';

export const api = {
  async createPost(input: CreatePostInput): Promise<Post> {
    return invoke('create_post', { input });
  },

  async getAllPosts(): Promise<Post[]> {
    return invoke('get_all_posts');
  },

  async getPost(id: string): Promise<Post> {
    return invoke('get_post', { id });
  },

  async updatePost(input: UpdatePostInput): Promise<Post> {
    return invoke('update_post', { input });
  },

  async deletePost(id: string): Promise<void> {
    return invoke('delete_post', { id });
  },

  async saveMediaFiles(filePaths: string[]): Promise<string[]> {
    return invoke('save_media_files', { filePaths });
  },

  async selectFiles(): Promise<string[] | null> {
    const selected = await open({
      multiple: true,
      filters: [
        {
          name: 'Media',
          extensions: ['jpg', 'jpeg', 'png', 'webp', 'mp4', 'mov']
        }
      ]
    });

    if (!selected) return null;
    return Array.isArray(selected) ? selected : [selected];
  }
};
