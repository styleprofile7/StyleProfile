import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Profile({ userId }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/profile?user_id=${userId}`)
      .then(response => setProfile(response.data))
      .catch(() => setProfile({ error: 'Failed to load profile' }));
  }, [userId]);

  if (!profile) return <div>Loading...</div>;

  if (profile.error) return <p>{profile.error}</p>;

  return (
    <section className="profile-container">
      <h2>Your Style Profile</h2>

      <div className="user-info">
        <p><strong>Username:</strong> {profile.username}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Archetype:</strong> {profile.archetype}</p>
      </div>

      <div className="stats-section">
        <h3>Style Stats</h3>
        <pre>{JSON.stringify(profile.stats, null, 2)}</pre>
      </div>

      <div className="liked-brands">
        <h3>Liked Brands</h3>
        <ul>
          {profile.likedBrands?.map((brand) => (
            <li key={brand}>{brand}</li>
          ))}
        </ul>
      </div>

      <div className="style-tips">
        <h3>Style Tips</h3>
        <ul>
          {profile.styleTips?.map((tip, idx) => (
            <li key={idx}>{tip}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
  
  return (
    <section>
      <h2>Your Style Profile</h2>
      {profile.error ? (
        <p>{profile.error}</p>
      ) : (
        <div>
          <p><strong>Username:</strong> {profile.username}</p>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Archetype:</strong> {profile.archetype}</p>
        </div>
      )}
    </section>
  );
}

export default Profile;
