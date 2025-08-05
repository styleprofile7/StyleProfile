import React, { useState, useEffect } from 'react';
import Chart from 'chart.js/auto';

const Feed = () => {
  const [filter, setFilter] = useState('Show All');
  const [publicClosets, setPublicClosets] = useState([
    { id: 1, name: "User1", persona: "Trendsetter", images: ["https://via.placeholder.com/150"], points: 150 },
    { id: 2, name: "User2", persona: "Classic", images: ["https://via.placeholder.com/150"], points: 120 },
  ]);

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleRating = (closetId, rating) => {
    setPublicClosets(publicClosets.map(closet =>
      closet.id === closetId ? { ...closet, points: closet.points + 5 * rating } : closet
    ));
    if (rating === 5) {
      alert(`Added to moodboard from ${publicClosets.find(c => c.id === closetId).name}'s closet!`);
    }
  };

  useEffect(() => {
    const ctx = document.getElementById('feedChart').getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Trendsetter', 'Classic'],
        datasets: [{
          label: 'Average Points',
          data: [140, 120],
          backgroundColor: '#FFFFFF',
        }],
      },
    });
  }, []);

  const filteredClosets = publicClosets.filter(closet =>
    filter === 'Show All' || closet.persona === filter
  );

  return (
    <div className="p-6">
      <div className="tile p-6 rounded-lg mb-6">
        <h2 className="text-2xl font-bold mb-4">Fit or Not Feed</h2>
        <select
          value={filter}
          onChange={handleFilterChange}
          className="mb-4 p-2 border border-gray-600 rounded bg-gray-900 w-full max-w-xs text-lg"
        >
          <option>Show All</option>
          <option>Trendsetter</option>
          <option>Classic</option>
        </select>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClosets.map((closet) => (
            <div key={closet.id} className="tile p-4 rounded-lg">
              <img src={closet.images[0]} alt="Outfit" className="w-full h-48 object-cover rounded-lg mb-4" />
              <p className="text-lg font-semibold">{closet.name} ({closet.persona})</p>
              <p className="text-lg">Points: {closet.points}</p>
              <div className="flex justify-between mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    className="text-yellow-400 text-xl"
                    onClick={() => handleRating(closet.id, star)}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-2">Feed Stats</h3>
          <canvas id="feedChart" className="w-full h-32"></canvas>
        </div>
      </div>
    </div>
  );
};

export default Feed;
