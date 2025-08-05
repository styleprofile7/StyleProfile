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