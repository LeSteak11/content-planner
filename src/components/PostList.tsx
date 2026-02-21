import { Post } from '../types';

interface PostListProps {
  posts: Post[];
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
}

export default function PostList({ posts, onEdit, onDelete }: PostListProps) {
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const truncateCaption = (caption: string) => {
    return caption.length > 100 ? caption.substring(0, 100) + '...' : caption;
  };

  if (posts.length === 0) {
    return (
      <div className="empty-state">
        <p>No posts yet. Create your first post to get started.</p>
      </div>
    );
  }

  return (
    <div className="post-list">
      {posts.map((post) => (
        <div key={post.id} className="post-card">
          <div className="post-card-content">
            <div className="post-header">
              <h3>@{post.username}</h3>
              <div className="post-actions">
                <button onClick={() => onEdit(post)} className="btn-edit">
                  Edit
                </button>
                <button onClick={() => onDelete(post.id)} className="btn-delete">
                  Delete
                </button>
              </div>
            </div>

            <p className="post-caption">{truncateCaption(post.caption)}</p>

            <div className="post-meta">
              <div className="platforms">
                {post.platforms.map((platform) => (
                  <span key={platform} className="platform-badge">
                    {platform}
                  </span>
                ))}
              </div>

              <div className="scheduled-date">
                <strong>Scheduled:</strong> {formatDate(post.scheduled_at)}
              </div>

              <div className="media-count">
                <strong>Media:</strong> {post.media_paths.length} file(s)
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
