import { useEffect, useState } from "react";
import Feed from "./components/Feed";
import PostForm from "./components/PostForm";
import { Routes, Route, useParams, Link, useLocation } from "react-router-dom";
import ProfilePage from "./components/ProfilePage";

function FeedPage({ posts }) {
  return <Feed posts={posts} />;
}

function HashtagPage({ posts, loadPosts }) {
  const { tag } = useParams();

  useEffect(() => {
    loadPosts(tag);
  }, [tag]);

  return <Feed posts={posts} />;
}

function App() {
  const [posts, setPosts] = useState([]);
  const [navOpen, setNavOpen] = useState(false);

  async function loadPosts(tag = null) {
    const url = tag
      ? `http://localhost:3000/api/hashtags/${tag}`
      : "http://localhost:3000/api/posts";

    const res = await fetch(url);
    const data = await res.json();

    setPosts(data);
  }

  async function createPost(content) {
    await fetch("http://localhost:3000/api/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: 1,
        content
      })
    });

    await loadPosts();
  }

  const location = useLocation();
  useEffect(() => {
    const path = location.pathname;

    if (path === "/") {
      loadPosts();
      return;
    }

    if (path.startsWith("/hashtags/")) {
      const tag = path.split("/")[2];
      loadPosts(tag);
    }
  }, [location.pathname]);

  useEffect(() => {
    function handleEsc(e) {
      if (e.key === "Escape") {
        setNavOpen(false);
      }
    }

    document.body.addEventListener("keydown", handleEsc);

    return () => {
      document.body.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <>
      <header>
        <div className="logo">Posts</div>

        <button
          className="menuButton"
          aria-label="Open menu"
          onClick={() => setNavOpen(true)}
        >
          ⿻
        </button>
      </header>

      <main className="grid">
        <nav
          className={navOpen ? "nav-open" : ""}
          onClick={() => setNavOpen(false)}
        >
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>

            <li>
              <Link to="/profile/demo">Profile</Link>
            </li>

            <li>
              <Link to="/settings">Settings</Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route
            path="/"
            element={<FeedPage posts={posts} />}
          />

          <Route
            path="/hashtags/:tag"
            element={
              <HashtagPage
                posts={posts}
                loadPosts={loadPosts}
              />
            }
          />

          <Route
            path="/profile/:username"
            element={<ProfilePage />}
          />
        </Routes>

        <PostForm onSubmit={createPost} />
      </main>
    </>
  );
}

export default App;