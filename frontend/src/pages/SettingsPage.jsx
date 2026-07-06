import { useState } from "react";
import { apiClient } from "../lib/api";

function SettingsPage({ currentUser, onLogout, onProfileUpdate }) {
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient("http://localhost:3000/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_name: displayName, password: password || undefined })
      });
      if (res.ok) {
        const data = await res.json();
        setMessage("Profile updated successfully!");
        if (onProfileUpdate) onProfileUpdate(data.user);
        setPassword("");
      } else {
        const data = await res.json();
        setMessage(data.error || "Failed to update profile");
      }
    } catch (err) {
      setMessage("Network error");
    }
  };

  return (
    <section className="settingsPage" style={{ padding: '16px' }}>
      <div className="pageHeader" style={{ padding: '0 0 16px 0' }}>
        <h2>Settings</h2>
      </div>
      <p>Signed in as @{currentUser}</p>

      <form onSubmit={handleUpdate} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px', maxWidth: '400px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="display_name" style={{ color: 'var(--text-muted)' }}>Display Name</label>
          <input 
            type="text" 
            id="display_name" 
            value={displayName} 
            onChange={e => setDisplayName(e.target.value)} 
            placeholder="New Display Name"
            className="authInput"
          />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="password" style={{ color: 'var(--text-muted)' }}>New Password</label>
          <input 
            type="password" 
            id="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            placeholder="Leave blank to keep same"
            className="authInput"
          />
        </div>
        
        {message && <p style={{ color: message.includes('success') ? 'var(--success)' : 'var(--danger)' }}>{message}</p>}

        <button type="submit" className="postButton" style={{ alignSelf: 'flex-start' }}>Save Changes</button>
      </form>

      <hr style={{ margin: '32px 0', borderColor: 'var(--border-color)' }} />

      <button
        className="authButton"
        style={{ backgroundColor: 'var(--bg-hover)', color: 'var(--danger)', border: '1px solid var(--danger)' }}
        onClick={onLogout}
        type="button"
      >
        Log out
      </button>
    </section>
  );
}

export default SettingsPage;
