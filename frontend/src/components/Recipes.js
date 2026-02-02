import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getRecipes, deleteRecipe } from '../api/api';
import './Recipes.css';

const Recipes = ({ currentUser }) => {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showListModal, setShowListModal] = useState(false);
  const navigate = useNavigate();

  const handleAddRecipe = () => {
    if (!currentUser) {
      alert('Please login to add recipes.');
      navigate('/auth');
    } else {
      navigate('/recipe/new');
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    try {
      const response = await getRecipes();
      setRecipes(response.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      alert('Failed to fetch recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      try {
        await deleteRecipe(id);
        setRecipes(recipes.filter(recipe => recipe.id !== id));
        alert('Recipe deleted successfully');
      } catch (error) {
        console.error('Error deleting recipe:', error);
        alert('Failed to delete recipe');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading recipes...</div>;
  }

  const filteredRecipes = recipes.filter(recipe => {
    const haystack = [
      recipe.title,
      recipe.description,
      recipe.author_name,
      recipe.category_name,
      recipe.cuisine_name,
      recipe.tags ? recipe.tags.join(' ') : ''
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(searchTerm.trim().toLowerCase());
  });

  return (
    <div className="recipes-container">
      <div className="page-header">
        <h2>All Recipes</h2>
        <div className="page-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleAddRecipe}>
            + Add New Recipe
          </button>
          <button
            className="btn btn-secondary"
            style={{ marginLeft: '0.5rem' }}
            onClick={() => setShowListModal(true)}
          >
            View Listed Recipes
          </button>
        </div>
      </div>

      {(filteredRecipes.length === 0 && recipes.length > 0) ? (
        <div className="empty-state">
          <p>No recipes found for that search.</p>
        </div>
      ) : recipes.length === 0 ? (
        <div className="empty-state">
          <p>No recipes found. Create your first recipe!</p>
        </div>
      ) : (
        <div className="recipes-grid">
          {filteredRecipes.map(recipe => (
            <div key={recipe.id} className="recipe-card">
              <div className="recipe-header">
                <h3>{recipe.title}</h3>
                <div className="recipe-actions">
                  <button className="btn-icon" onClick={() => navigate(`/recipe/edit/${recipe.id}`)}>
                    ✏️
                  </button>
                  <button className="btn-icon" onClick={() => handleDelete(recipe.id)}>
                    🗑️
                  </button>
                </div>
              </div>
              
              <p className="recipe-description">{recipe.description}</p>
              
              <div className="recipe-meta">
                <span>👤 {recipe.author_name || 'Unknown'}</span>
                <span>🍽️ {recipe.servings} servings</span>
                <span>⏱️ {recipe.prep_time_minutes + recipe.cook_time_minutes} min</span>
              </div>
              
              <div className="recipe-tags">
                {recipe.category_name && <span className="tag">{recipe.category_name}</span>}
                {recipe.cuisine_name && <span className="tag">{recipe.cuisine_name}</span>}
                {recipe.tags && recipe.tags.map((tag, idx) => (
                  <span key={idx} className="tag">{tag}</span>
                ))}
              </div>
              
              {recipe.ingredients && recipe.ingredients.length > 0 && (
                <div className="recipe-ingredients">
                  <strong>Ingredients:</strong>
                  <ul>
                    {recipe.ingredients.slice(0, 3).map((ing, idx) => (
                      <li key={idx}>{ing.name} {ing.quantity && `(${ing.quantity} ${ing.unit || ''})`}</li>
                    ))}
                    {recipe.ingredients.length > 3 && <li>...</li>}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showListModal && (
        <div className="form-modal">
          <div className="form-modal-content">
            <h3>All Recipes (ID &amp; Name)</h3>
            <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '1rem' }}>
              {recipes.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '0.5rem 0',
                    borderBottom: '1px solid #e2e8f0',
                  }}
                >
                  <span>#{r.id}</span>
                  <span>{r.title}</span>
                </div>
              ))}
            </div>
            <div className="form-actions" style={{ marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => setShowListModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Recipes;

