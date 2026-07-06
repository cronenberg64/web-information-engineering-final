import { useEffect } from "react";
import { useParams } from "react-router-dom";
import Feed from "../components/Feed";
import { useOutletContext } from "react-router-dom";

function HashtagPage({ posts, loading, error, loadPosts, onDeletePost }) {
  const { tag } = useParams();
  const { currentUser } = useOutletContext();

  useEffect(() => {
    loadPosts(tag);
  }, [tag, loadPosts]);

  return (
    <>
      <div className="pageHeader">
        <h2>#{tag}</h2>
      </div>
      <Feed posts={posts} loading={loading} error={error} onDeletePost={onDeletePost} currentUser={currentUser} />
    </>
  );
}

export default HashtagPage;
