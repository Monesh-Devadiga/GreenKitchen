import React, { useEffect, useState } from 'react';
import { getOverview } from '../api/api';
import './DataExplorer.css';

const DataExplorer = () => {
  const [data, setData] = useState({
    recipeSummaries: [],
    recentReviews: [],
    activeUsers: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const response = await getOverview();
        setData(response.data);
      } catch (err) {
        console.error(err);
        setError('Unable to load data explorer');
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  if (loading) {
    return <div className="loading">Loading data explorer...</div>;
  }

  if (error) {
    return <div className="error-card">{error}</div>;
  }

  return (
    <div className="explorer-container">
      <div className="section">
        <div className="section-header">
          <h2>Recipes with Reviews & Tags</h2>
          <p>Combined data from recipes, users, reviews, categories, cuisines & tags</p>
        </div>
        <div className="cards-grid">
          {data.recipeSummaries.map(recipe => (
            <div key={recipe.id} className="explorer-card">
              <div className="card-header">
                <h3>{recipe.title}</h3>
                <span className="badge">{recipe.cuisine || 'No cuisine'}</span>
              </div>
              <p className="meta">
                👩‍🍳 {recipe.author || 'Unknown'} · 📂 {recipe.category || 'Uncategorized'}
              </p>
              <p className="stats">
                ⭐ {recipe.avg_rating} average · 💬 {recipe.review_count} reviews
              </p>
              {recipe.tags && (
                <div className="tags">
                  {recipe.tags.split(', ').map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="section two-column">
        <div>
          <div className="section-header">
            <h2>Recent Reviews</h2>
            <p>Joined data from reviews, users & recipes</p>
          </div>
          <div className="list">
            {data.recentReviews.map(review => (
              <div key={review.id} className="list-item">
                <div>
                  <div className="list-title">{review.recipe_title}</div>
                  <div className="list-meta">
                    ⭐ {review.rating} · by {review.username}
                  </div>
                  <p className="list-comment">{review.comment || 'No comment provided.'}</p>
                </div>
                <span className="list-date">
                  {new Date(review.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="section-header">
            <h2>Most Active Contributors</h2>
            <p>Users with combined recipe + review activity</p>
          </div>
          <div className="list">
            {data.activeUsers.map(user => (
              <div key={user.id} className="list-item">
                <div>
                  <div className="list-title">{user.username}</div>
                  <div className="list-meta">{user.email}</div>
                </div>
                <div className="contrib-pill">
                  🍽 {user.recipes_created} recipes · 💬 {user.reviews_written} reviews
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExplorer;

