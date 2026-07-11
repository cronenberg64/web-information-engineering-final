import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiClient, resolveAssetUrl } from "../lib/api";
import { Heart, Trash2, Clock, MessageSquare, Repeat2 } from "lucide-react";
import PostForm from "./PostForm";

function formatTimestamp(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString.replace(" ", "T") + "Z");
  const now = new Date();
  const diffMs = now - date;
  
  if (diffMs < 60000) return "just now";
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h`;
  
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function Post({ post, onDelete, currentUser, isReply = false }) {
  const words = post.content.split(" ");
  const isAuthor = currentUser && currentUser.id === post.user_id;
  const timeStr = formatTimestamp(post.created_at);

  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);

  const [timeRemaining, setTimeRemaining] = useState("");
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);

  const [isReposted, setIsReposted] = useState(post.is_reposted);
  const [repostCount, setRepostCount] = useState(post.repost_count || 0);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [localReplies, setLocalReplies] = useState([]);
  const [fetchedReplies, setFetchedReplies] = useState([]);
  const [repliesOffset, setRepliesOffset] = useState(0);
  const [hasMoreReplies, setHasMoreReplies] = useState(false);
  const [isLoadingReplies, setIsLoadingReplies] = useState(false);
  const [hasFetchedReplies, setHasFetchedReplies] = useState(false);

  async function loadReplies(offset = repliesOffset) {
    setIsLoadingReplies(true);
    try {
      const res = await apiClient(`/api/posts/${post.id}/replies?limit=10&offset=${offset}`);
      if (res.ok) {
        const data = await res.json();
        setFetchedReplies(prev => offset === 0 ? data.replies : [...prev, ...data.replies]);
        setHasMoreReplies(data.hasMore);
        setRepliesOffset(offset + 10);
        setHasFetchedReplies(true);
      }
    } catch (err) {
      console.error("Failed to load replies", err);
    }
    setIsLoadingReplies(false);
  }

  useEffect(() => {
    function updateCountdown() {
      if (!post.expires_at) return;
      
      // SQLite datetime('now') is UTC: "YYYY-MM-DD HH:MM:SS"
      // Convert to valid ISO format for JS Date parsing
      const expiresStr = post.expires_at.replace(" ", "T") + "Z";
      const expiresAt = new Date(expiresStr);
      const now = new Date();
      const diffMs = expiresAt - now;

      if (diffMs <= 0) {
        setTimeRemaining("expired");
        setIsExpiringSoon(true);
        return;
      }

      const diffMins = Math.floor(diffMs / 60000);
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;

      setTimeRemaining(`expires in ${hours}h ${mins}m`);
      setIsExpiringSoon(hours < 1);
    }

    updateCountdown();
    const intervalId = setInterval(updateCountdown, 60000);
    return () => clearInterval(intervalId);
  }, [post.expires_at]);

  const toggleLike = async () => {
    if (!currentUser) {
      alert("You must be logged in to like posts");
      return;
    }
    
    try {
      const method = isLiked ? "DELETE" : "POST";
      const res = await apiClient(`/api/posts/${post.id}/like`, {
        method,
      });

      if (res.ok) {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to toggle like");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to toggle like");
    }
  };

  const toggleRepost = async () => {
    if (!currentUser) {
      alert("You must be logged in to repost");
      return;
    }
    
    try {
      const method = isReposted ? "DELETE" : "POST";
      const res = await apiClient(`/api/posts/${post.id}/repost`, {
        method,
      });

      if (res.ok) {
        setIsReposted(!isReposted);
        setRepostCount(prev => isReposted ? prev - 1 : prev + 1);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to toggle repost");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to toggle repost");
    }
  };

  return (
    <article className={`post ${isReply ? 'isReply' : ''}`}>
      <div 
        className="postAvatar"
        style={post.profile_picture_url ? { backgroundImage: `url(${resolveAssetUrl(post.profile_picture_url)})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : {}}
      >
        {post.username[0].toUpperCase()}
      </div>
      <div className="postContent">
        <header className="post-meta">
          <div className="postAuthorInfo">
            <Link to={`/profile/${post.username}`}>
              <span className="postDisplayName">{post.display_name || post.username}</span>
              <span className="postUsername text-muted">@{post.username}</span>
            </Link>
            <span className="text-muted">·</span>
            <span className="text-muted postTime" title={new Date(post.created_at.replace(" ", "T") + "Z").toLocaleString()}>
              {timeStr}
            </span>
            {timeRemaining && (
              <>
                <span className="text-muted" style={{ marginLeft: '4px', marginRight: '4px' }}>·</span>
                <Clock size={12} className={isExpiringSoon ? "text-danger" : "text-muted"} style={{ marginRight: '2px', alignSelf: 'center' }} />
                <span className={isExpiringSoon ? "text-danger postTime" : "text-muted postTime"} title={`Expires in ${timeRemaining.replace("expires in ", "")}`}>
                  {timeRemaining.replace("expires in ", "")} left
                </span>
              </>
            )}
          </div>
          {isAuthor && (
            <button 
              onClick={() => {
                if (window.confirm("Delete this post?")) {
                  onDelete();
                }
              }}
              className="postDeleteButton"
              title="Delete post"
            >
              <Trash2 size={18} />
            </button>
          )}
        </header>

        <p className="postText">
          {words.map((word, index) => {
            if (word.startsWith("#")) {
              const tag = word.slice(1);

              return (
                <Link
                  key={index}
                  className="hashtag"
                  to={`/hashtags/${tag}`}
                >
                  {word}{" "}
                </Link>
              );
            }

            return (
              <span key={index}>
                {word}{" "}
              </span>
            );
          })}
        </p>
        
        {post.media_url && (
          <div className="postMedia">
            <img src={post.media_url} alt="Post media" loading="lazy" />
          </div>
        )}
        
        <footer className="post-footer">
          <button 
            className="postActionButton" 
            onClick={() => {
              if (!showReplyForm && !hasFetchedReplies) {
                loadReplies(0);
              }
              setShowReplyForm(!showReplyForm);
            }}
            title="Reply"
          >
            <MessageSquare size={18} />
            {post.reply_count + localReplies.length > 0 && <span className="actionCount">{post.reply_count + localReplies.length}</span>}
          </button>
          
          <button 
            onClick={toggleRepost}
            className={`postActionButton repostButton ${isReposted ? "reposted" : ""}`}
            title="Repost"
          >
            <Repeat2 size={18} />
            {repostCount > 0 && <span className="actionCount">{repostCount}</span>}
          </button>

          <button 
            onClick={toggleLike}
            className={`postActionButton likeButton ${isLiked ? "liked" : ""}`}
            title="Like post"
          >
            <Heart size={18} fill={isLiked ? "currentColor" : "none"} />
            {likeCount > 0 && <span className="actionCount">{likeCount}</span>}
          </button>
        </footer>

        {showReplyForm && (
          <div className="repliesSection">
            <div className="replyFormContainer" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border-color)', marginBottom: '12px' }}>
              <PostForm 
                onSubmit={async (content, mediaUrl, duration, replyToId) => {
                  const res = await apiClient("/api/posts", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ content, media_url: mediaUrl, duration, reply_to_id: replyToId })
                  });
                  if (res.ok) {
                    return await res.json();
                  }
                  return null;
                }} 
                currentUser={currentUser} 
                replyToId={post.id} 
                onReplySuccess={(newPost) => {
                  if (newPost) {
                    setLocalReplies(prev => [...prev, newPost]);
                  }
                }}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
            
            {(fetchedReplies.length > 0 || localReplies.length > 0) && (
              <div className="repliesList" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[...fetchedReplies, ...localReplies].map(reply => (
                  <Post 
                    key={reply.id} 
                    post={reply} 
                    currentUser={currentUser} 
                    isReply={true}
                    onDelete={() => {
                      setFetchedReplies(prev => prev.filter(r => r.id !== reply.id));
                      setLocalReplies(prev => prev.filter(r => r.id !== reply.id));
                    }}
                  />
                ))}
                
                {hasMoreReplies && (
                  <button 
                    onClick={() => loadReplies(repliesOffset)}
                    disabled={isLoadingReplies}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      padding: '8px',
                      fontWeight: 'bold',
                      alignSelf: 'center',
                      marginTop: '8px'
                    }}
                  >
                    {isLoadingReplies ? "Loading..." : "Show more replies"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default Post;