import Feed from "../components/Feed";
import PostForm from "../components/PostForm";
import { useOutletContext, useSearchParams } from "react-router-dom";

function HomePage({ posts, loading, error, onDeletePost }) {
  const { createPost, currentUser } = useOutletContext();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "foryou";

  return (
    <>
      <div className="pageHeader tabsHeader">
        <button 
          className={activeTab === "foryou" ? "tab active" : "tab"} 
          onClick={() => setSearchParams({ tab: "foryou" })}
        >
          For You
        </button>
        <button 
          className={activeTab === "following" ? "tab active" : "tab"} 
          onClick={() => setSearchParams({ tab: "following" })}
        >
          Following
        </button>
      </div>
      <PostForm onSubmit={createPost} currentUser={currentUser} />
      <Feed posts={posts} loading={loading} error={error} onDeletePost={onDeletePost} currentUser={currentUser} />
    </>
  );
}

export default HomePage;
