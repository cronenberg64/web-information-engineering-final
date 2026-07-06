import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiClient } from "../lib/api";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import { Search } from "lucide-react";

function ExplorePage() {
  const [hashtags, setHashtags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], hashtags: [] });

  useEffect(() => {
    async function fetchTrending() {
      try {
        const res = await apiClient("http://localhost:3000/api/hashtags/trending");
        if (res.ok) {
          const data = await res.json();
          setHashtags(data);
        } else {
          setError("Failed to load trending hashtags");
        }
      } catch (err) {
        setError("Network error loading hashtags");
      } finally {
        setLoading(false);
      }
    }
    fetchTrending();
  }, []);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults({ users: [], hashtags: [] });
      return;
    }

    const timer = setTimeout(async () => {
      const res = await apiClient(`http://localhost:3000/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <>
      <div className="pageHeader">
        <h2>Explore</h2>
      </div>

      <div className="searchContainer" style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-hover)', padding: '8px 12px', borderRadius: '24px' }}>
          <Search size={20} className="text-muted" style={{ marginRight: '8px' }} />
          <input 
            type="text" 
            placeholder="Search users or hashtags..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ border: 'none', background: 'none', outline: 'none', color: 'var(--text-color)', width: '100%' }}
          />
        </div>
      </div>

      {searchQuery.trim().length > 0 ? (
        <div className="searchResults" style={{ padding: '16px' }}>
          <h3>Search Results</h3>
          
          <div style={{ marginTop: '16px' }}>
            <h4 className="text-muted text-sm">Users</h4>
            {searchResults.users.length === 0 && <p className="text-muted text-sm">No users found.</p>}
            {searchResults.users.map(u => (
              <div key={u.id} style={{ padding: '8px 0' }}>
                <Link to={`/profile/${u.username}`} style={{ fontWeight: 'bold' }}>{u.display_name}</Link> <span className="text-muted">@{u.username}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '16px' }}>
            <h4 className="text-muted text-sm">Hashtags</h4>
            {searchResults.hashtags.length === 0 && <p className="text-muted text-sm">No hashtags found.</p>}
            {searchResults.hashtags.map(h => (
              <div key={h.name} style={{ padding: '8px 0' }}>
                <Link to={`/hashtags/${h.name}`} style={{ color: 'var(--primary)' }}>#{h.name}</Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="trendingList">
          {loading && <LoadingSpinner />}
          {error && <ErrorMessage message={error} />}
          {!loading && !error && hashtags.length === 0 && (
            <p className="text-muted" style={{ padding: "16px" }}>No trending topics found.</p>
          )}
          {!loading && !error && hashtags.length > 0 && (
            <div className="hashtagGrid">
              {hashtags.map((tag, i) => (
                <Link key={tag.name} to={`/hashtags/${tag.name}`} className="trendingCard">
                  <span className="trendingRank">{i + 1} · Trending</span>
                  <span className="trendingName">#{tag.name}</span>
                  <span className="trendingCount">{tag.count} posts</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default ExplorePage;
