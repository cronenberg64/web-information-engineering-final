import { useState, useRef } from "react";
import { Image, Clock, X } from "lucide-react";
import { apiClient, resolveAssetUrl } from "../lib/api";
import ImageCropper from "./ImageCropper";

function PostForm({ onSubmit, currentUser, replyToId = null, onReplySuccess, onCancel }) {
  const [content, setContent] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [duration, setDuration] = useState("24h");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const isReply = !!replyToId;

  async function handleSubmit() {
    if (!content.trim() && !mediaFile) return;

    setIsUploading(true);
    let uploadedUrl = "";

    if (mediaFile && !isReply) {
      const formData = new FormData();
      formData.append("image", mediaFile);
      try {
        const res = await apiClient("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          uploadedUrl = data.url;
        }
      } catch (err) {
        console.error("Failed to upload image", err);
      }
    }

    const newPost = await onSubmit(content, uploadedUrl, duration, replyToId);

    setContent("");
    setMediaFile(null);
    setDuration("24h");
    setIsUploading(false);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    if (onReplySuccess) onReplySuccess(newPost);
  }

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setCropImageSrc(event.target.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropComplete = (croppedFile) => {
    setMediaFile(croppedFile);
    setCropImageSrc(null);
  };

  if (cropImageSrc) {
    return (
      <ImageCropper
        imageSrc={cropImageSrc}
        aspect={4 / 3} // Aspect ratio for posts can be 4:3 or free. Let's use 4/3.
        onCropComplete={handleCropComplete}
        onCancel={() => setCropImageSrc(null)}
      />
    );
  }

  return (
    <section className={isReply ? "replyPostForm" : "createPost"}>
      <div 
        className={isReply ? "replyAvatar" : "postAvatar"}
        style={currentUser?.profile_picture_url ? { backgroundImage: `url(${resolveAssetUrl(currentUser.profile_picture_url)})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : {}}
      >
        {currentUser?.username?.[0]?.toUpperCase() || "?"}
      </div>
      <div className="composeContent">
        <textarea
          ref={textareaRef}
          placeholder={isReply ? "Add a reply..." : "What is happening?!"}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            e.target.style.height = 'auto';
            e.target.style.height = e.target.scrollHeight + 'px';
          }}
          className={isReply ? "replyTextarea" : "composeTextarea"}
          rows={isReply ? 1 : 3}
          style={{ overflow: 'hidden' }}
        />
        {!isReply && mediaFile && (
          <div className="mediaPreview" style={{ position: "relative", margin: "8px 0", borderRadius: "12px", overflow: "hidden", display: "flex", justifyContent: "center", background: "var(--bg-hover)" }}>
            <img src={URL.createObjectURL(mediaFile)} alt="Preview" style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain", display: "block" }} />
            <button 
              className="optionBtn" 
              onClick={() => setMediaFile(null)} 
              style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.6)", color: "white", padding: "4px" }}
            >
              <X size={16} />
            </button>
          </div>
        )}
        <div className={isReply ? "replyActions" : "formActions"}>
          {!isReply && (
            <div className="formOptions">
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                style={{ display: "none" }} 
                onChange={handleFileSelect} 
              />
              <button 
                className="optionBtn" 
                onClick={() => fileInputRef.current?.click()}
                title="Upload Image"
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
          )}
          <div className="formSubmit" style={isReply ? { width: '100%', justifyContent: 'flex-end', gap: '8px' } : {}}>
            {!isReply && (
              <span className={`charCount ${content.length > 280 ? "text-danger" : "text-muted"}`}>
                {content.length > 0 && `${content.length} / 280`}
              </span>
            )}
            {isReply && onCancel && (
              <button className="cancelReplyButton" onClick={onCancel}>Cancel</button>
            )}
            <button 
              className={isReply ? "replySubmitButton" : "postButton"} 
              onClick={handleSubmit} 
              disabled={content.length > 280 || (content.length === 0 && !mediaFile) || isUploading}
            >
              {isUploading ? "..." : isReply ? "Reply" : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PostForm;