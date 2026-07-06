import { Link } from "react-router-dom";
import { Apple } from "lucide-react";
import "./LandingPage.css";

const FAKE_POSTS = [
  { user: "Alice", handle: "@alice", text: "Just had the best coffee ever! ☕️", delay: "0s", top: "15%", left: "15%" },
  { user: "Bob", handle: "@bob", text: "Can't wait for the weekend!", delay: "2.5s", top: "35%", left: "45%" },
  { user: "Charlie", handle: "@charlie", text: "Does anyone know how to fix a flat tire?", delay: "5s", top: "55%", left: "10%" },
  { user: "Diana", handle: "@diana", text: "Watching the sunset 🌅", delay: "7.5s", top: "75%", left: "35%" },
  { user: "Eve", handle: "@eve", text: "Learning React is so fun!", delay: "10s", top: "25%", left: "60%" },
];

function LandingPage() {
  return (
    <div className="landing-container">
      <div className="landing-left">
        <div className="falling-posts-container">
          {FAKE_POSTS.map((post, i) => (
            <div key={i} className="falling-post" style={{ animationDelay: post.delay, top: post.top, left: post.left }}>
              <div className="fp-header">
                <strong>{post.user}</strong> <span>{post.handle}</span>
              </div>
              <p className="fp-text">{post.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="landing-right">
        <Apple size={48} className="landing-logo-small" />
        <h1 className="landing-title">Happening now. <br/>Gone tomorrow.</h1>
        <h2 className="landing-subtitle">Join Apple Tree today and share posts that automatically expire.</h2>
        
        <div className="landing-actions">
          <Link to="/login" state={{ isLogin: false }} className="landing-btn-primary">
            Create account
          </Link>
          
          <div className="landing-divider">
            <div className="landing-line"></div>
            <span>or</span>
            <div className="landing-line"></div>
          </div>
          
          <div className="landing-login-prompt">
            <h3>Already have an account?</h3>
            <Link to="/login" state={{ isLogin: true }} className="landing-btn-secondary">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
