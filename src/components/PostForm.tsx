import { useState } from 'react';
import { Post, CreatePostInput, UpdatePostInput } from '../types';
import { api } from '../api';

interface PostFormProps {
  post?: Post;
  onSubmit: (input: CreatePostInput | UpdatePostInput) => void;
  onCancel: () => void;
}

const PLATFORMS = ['Instagram', 'Threads', 'TikTok'];

export default function PostForm({ post, onSubmit, onCancel }: PostFormProps) {
  const [username, setUsername] = useState(post?.username || '');
  const [caption, setCaption] = useState(post?.caption || '');
  const [mediaPaths, setMediaPaths] = useState<string[]>(post?.media_paths || []);
  const [platforms, setPlatforms] = useState<string[]>(post?.platforms || []);
  const [scheduledAt, setScheduledAt] = useState(
    post?.scheduled_at
      ? new Date(post.scheduled_at).toISOString().slice(0, 16)
      : ''
  );
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleSelectFiles = async () => {
    const selected = await api.selectFiles();
    if (!selected) return;

    if (selected.length < 2 || selected.length > 20) {
      alert('Please select between 2 and 20 files');
      return;
    }

    try {
      setLoading(true);
      const savedPaths = await api.saveMediaFiles(selected);
      setMediaPaths(savedPaths);
    } catch (error) {
      console.error('Failed to save media files:', error);
      alert('Failed to save media files');
    } finally {
      setLoading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length < 2 || files.length > 20) {
      alert('Please select between 2 and 20 files');
      return;
    }

    const filePaths = files.map((f) => (f as any).path || '');

    try {
      setLoading(true);
      const savedPaths = await api.saveMediaFiles(filePaths);
      setMediaPaths(savedPaths);
    } catch (error) {
      console.error('Failed to save media files:', error);
      alert('Failed to save media files');
    } finally {
      setLoading(false);
    }
  };

  const togglePlatform = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      alert('Username is required');
      return;
    }

    if (!caption.trim()) {
      alert('Caption is required');
      return;
    }

    if (mediaPaths.length < 2 || mediaPaths.length > 20) {
      alert('Please select between 2 and 20 media files');
      return;
    }

    if (platforms.length === 0) {
      alert('Please select at least one platform');
      return;
    }

    if (!scheduledAt) {
      alert('Scheduled date/time is required');
      return;
    }

    const input = {
      username: username.trim(),
      caption: caption.trim(),
      media_paths: mediaPaths,
      platforms,
      scheduled_at: new Date(scheduledAt).toISOString(),
      ...(post && { id: post.id }),
    };

    onSubmit(input);
  };

  return (
    <form onSubmit={handleSubmit} className="post-form">
      <h2>{post ? 'Edit Post' : 'Create New Post'}</h2>

      <div className="form-group">
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="e.g., kayleighfit"
        />
      </div>

      <div className="form-group">
        <label htmlFor="caption">Caption</label>
        <textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write your caption here..."
          rows={6}
        />
      </div>

      <div className="form-group">
        <label>Media Upload (2-20 files)</label>
        <div
          className={`media-upload ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {mediaPaths.length === 0 ? (
            <div className="upload-prompt">
              <p>Drag and drop files here</p>
              <p>or</p>
              <button
                type="button"
                onClick={handleSelectFiles}
                disabled={loading}
                className="btn-secondary"
              >
                {loading ? 'Saving...' : 'Select Files'}
              </button>
              <p className="upload-hint">
                Images: jpg, jpeg, png, webp | Videos: mp4, mov
              </p>
            </div>
          ) : (
            <div className="media-selected">
              <p>{mediaPaths.length} file(s) selected</p>
              <button
                type="button"
                onClick={handleSelectFiles}
                className="btn-secondary"
              >
                Change Files
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="form-group">
        <label>Platforms</label>
        <div className="platform-toggles">
          {PLATFORMS.map((platform) => (
            <label key={platform} className="platform-checkbox">
              <input
                type="checkbox"
                checked={platforms.includes(platform)}
                onChange={() => togglePlatform(platform)}
              />
              <span>{platform}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="scheduledAt">Scheduled Date & Time</label>
        <input
          type="datetime-local"
          id="scheduledAt"
          value={scheduledAt}
          onChange={(e) => setScheduledAt(e.target.value)}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-primary">
          {post ? 'Update Post' : 'Save Post'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
      </div>
    </form>
  );
}
