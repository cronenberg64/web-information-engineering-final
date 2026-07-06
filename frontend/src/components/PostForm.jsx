import { useState } from "react";
import { Image, Clock } from "lucide-react";

function PostForm({ onSubmit, currentUser, replyToId = null, onReplySuccess }) {
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [duration, setDuration] = useState("24h");
  const [showMediaInput, setShowMediaInput] = useState(false);

  async function handleSubmit() {
    if (!content.trim()) return;

    await onSubmit(content, mediaUrl, duration, replyToId);

    setContent("");
    setMediaUrl("");
    setDuration("24h");
    setShowMediaInput(false);
    if (onReplySuccess) onReplySuccess();
  }

  return (
    <section className="createPost">
      <div className="postAvatar">
        {currentUser?.username?.[0]?.toUpperCase() || "?"}
      </div>
      <div className="composeContent">
        <textarea
          placeholder="What is happening?!"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="composeTextarea"
        />
        {showMediaInput && (
          <input 
            type="text" 
            placeholder="Image URL..." 
            value={mediaUrl} 
            onChange={e => setMediaUrl(e.target.value)}
            className="mediaInput"
          />
        )}
        <div className="formActions">
          <div className="formOptions">
            <button 
              className="optionBtn" 
              onClick={() => setShowMediaInput(!showMediaInput)}
              title="Add Image"
            >
              <Image size={18} />
            </button>
            <div className="durationSelect">
              <Clock size={16} className="text-muted" />
              <select value={duration} onChange={e => setDuration(e.target.value)}>
                <option value="24h">24 Hours</option>
                <option value="3d">3 Days</option>
                <option value="1w">1 Week</option>
              </select>
            </div>
          </div>
          <div className="formSubmit">
            <span className={`charCount ${content.length > 280 ? "text-danger" : "text-muted"}`}>
              {content.length > 0 && `${content.length} / 280`}
            </span>
            <button 
              className="postButton" 
              onClick={handleSubmit} 
              disabled={content.length > 280 || content.length === 0}
            >
              {replyToId ? "Reply" : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PostForm;