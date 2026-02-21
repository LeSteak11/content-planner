import { useState, useEffect } from 'react';
import PostList from './components/PostList';
import PostForm from './components/PostForm';
import { Post } from './types';
import { api } from './api';

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const allPosts = await api.getAllPosts();
      setPosts(allPosts);
    } catch (error) {
      console.error('Failed to load posts:', error);
    }
  };

  const handleCreate = async (input: any) => {
    try {
      await api.createPost(input);
      await loadPosts();
      setView('list');
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('Failed to create post');
    }
  };

  const handleUpdate = async (input: any) => {
    try {
      await api.updatePost(input);
      await loadPosts();
      setView('list');
      setEditingPost(null);
    } catch (error) {
      console.error('Failed to update post:', error);
      alert('Failed to update post');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      await api.deletePost(id);
      await loadPosts();
    } catch (error) {
      console.error('Failed to delete post:', error);
      alert('Failed to delete post');
    }
  };

  const handleEdit = (post: Post) => {
    setEditingPost(post);
    setView('edit');
  };

  const handleCancel = () => {
    setView('list');
    setEditingPost(null);
  };

  return (
    <div className="app">
      <header>
        <h1>Content Planner</h1>
        {view === 'list' && (
          <button onClick={() => setView('create')} className="btn-primary">
            Create New Post
          </button>
        )}
        {(view === 'create' || view === 'edit') && (
          <button onClick={handleCancel} className="btn-secondary">
            Back to List
          </button>
        )}
      </header>

      <main>
        {view === 'list' && (
          <PostList
            posts={posts}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {view === 'create' && (
          <PostForm
            onSubmit={handleCreate}
            onCancel={handleCancel}
          />
        )}

        {view === 'edit' && editingPost && (
          <PostForm
            post={editingPost}
            onSubmit={handleUpdate}
            onCancel={handleCancel}
          />
        )}
      </main>
    </div>
  );
}

export default App;
