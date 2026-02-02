import React, { useState, useEffect } from 'react';
import { getReviews, deleteReview, getRecipes, getUsers, createReview, updateReview } from '../api/api';
import './TableComponent.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({
    recipe_id: '',
    user_id: '',
    rating: '',
    comment: ''
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('greenkitchen_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to read stored user:', e);
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reviewsRes, recipesRes, usersRes] = await Promise.all([
        getReviews(),
        getRecipes(),
        getUsers()
      ]);
      setReviews(reviewsRes.data);
      setRecipes(recipesRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert('You must be logged in to add or edit reviews.');
      return;
    }

    // Enforce that the selected recipe is not authored by the current user (extra safety on frontend)
    const selectedRecipe = recipes.find(r => String(r.id) === String(formData.recipe_id));
    if (selectedRecipe && selectedRecipe.author_id === currentUser.id) {
      alert('You cannot review your own recipe.');
      return;
    }

    const payload = {
      ...formData,
      user_id: currentUser.id
    };

    try {
      if (editingReview) {
        await updateReview(editingReview.id, payload);
        alert('Review updated successfully');
      } else {
        await createReview(payload);
        alert('Review created successfully');
      }
      setShowForm(false);
      setEditingReview(null);
      setFormData({ recipe_id: '', user_id: '', rating: '', comment: '' });
      fetchData();
    } catch (error) {
      console.error('Error saving review:', error);
      alert('Failed to save review');
    }
  };

  const handleEdit = (review) => {
    setEditingReview(review);
    setFormData({
      recipe_id: review.recipe_id,
      user_id: review.user_id,
      rating: review.rating,
      comment: review.comment || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteReview(id);
        setReviews(reviews.filter(r => r.id !== id));
        alert('Review deleted successfully');
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Failed to delete review');
      }
    }
  };

  const filteredReviews = reviews.filter(review => {
    const haystack = `${review.recipe_title} ${review.username} ${review.comment || ''}`.toLowerCase();
    return haystack.includes(searchTerm.trim().toLowerCase());
  });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="table-container">
      <div className="page-header">
        <h2>Reviews</h2>
        <div className="table-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => {
            if (!currentUser) {
              alert('Please login first to add a review.');
              return;
            }
            setShowForm(true);
            setEditingReview(null);
            setFormData({ recipe_id: '', user_id: currentUser.id, rating: '', comment: '' });
          }}>
            + Add Review
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <h3>{editingReview ? 'Edit Review' : 'Add Review'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Recipe</label>
                <select
                  value={formData.recipe_id}
                  onChange={(e) => setFormData({ ...formData, recipe_id: e.target.value })}
                  required
                >
                  <option value="">Select Recipe</option>
                  {recipes
                    .filter(r => !currentUser || r.author_id !== currentUser.id)
                    .map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>User</label>
                <input
                  type="text"
                  value={currentUser ? currentUser.username : ''}
                  disabled
                />
              </div>
              <div className="form-group">
                <label>Rating (1-5)</label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Comment</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  rows="4"
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-cancel" onClick={() => {
                  setShowForm(false);
                  setEditingReview(null);
                }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Recipe</th>
              <th>User</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map(review => (
              <tr key={review.id}>
                <td>{review.id}</td>
                <td>{review.recipe_title}</td>
                <td>{review.username}</td>
                <td>{'⭐'.repeat(review.rating)}</td>
                <td>{review.comment || '-'}</td>
                <td>{new Date(review.created_at).toLocaleDateString()}</td>
                <td>
                  <button className="btn-icon" onClick={() => handleEdit(review)}>✏️</button>
                  <button className="btn-icon" onClick={() => handleDelete(review.id)}>🗑️</button>
                </td>
              </tr>
            ))}
            {filteredReviews.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '1rem' }}>
                  {reviews.length === 0 ? 'No reviews yet.' : 'No reviews match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reviews;

