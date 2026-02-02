import React, { useState, useEffect } from 'react';
import { getIngredients, createIngredient, deleteIngredient, getRecipes } from '../api/api';
import './TableComponent.css';

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '' });
  const [showRecipesModal, setShowRecipesModal] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(false);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await getIngredients();
      setIngredients(response.data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
      alert('Failed to fetch ingredients');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createIngredient(formData);
      alert('Ingredient created successfully');
      setShowForm(false);
      setFormData({ name: '' });
      fetchIngredients();
    } catch (error) {
      console.error('Error saving ingredient:', error);
      alert('Failed to save ingredient');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this ingredient?')) {
      try {
        await deleteIngredient(id);
        setIngredients(ingredients.filter(i => i.id !== id));
        alert('Ingredient deleted successfully');
      } catch (error) {
        console.error('Error deleting ingredient:', error);
        alert('Failed to delete ingredient');
      }
    }
  };

  const handleShowRecipes = async () => {
    setShowRecipesModal(true);
    setLoadingRecipes(true);
    try {
      const response = await getRecipes();
      setRecipes(response.data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      alert('Failed to fetch recipes');
    } finally {
      setLoadingRecipes(false);
    }
  };

  const filteredIngredients = ingredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="table-container">
      <div className="page-header">
        <h2>Ingredients</h2>
        <div className="table-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Search ingredients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => {
            setShowForm(true);
            setFormData({ name: '' });
          }}>
            + Add Ingredient
          </button>
          <button className="btn btn-secondary" onClick={handleShowRecipes} style={{ marginLeft: '0.5rem' }}>
            View All Recipes
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <h3>Add Ingredient</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="button" className="btn btn-cancel" onClick={() => {
                  setShowForm(false);
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
              <th>Name</th>
              <th>Recipe IDs</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIngredients.map(ingredient => (
              <tr key={ingredient.id}>
                <td>{ingredient.id}</td>
                <td>{ingredient.name}</td>
                <td>{ingredient.recipe_ids || '-'}</td>
                <td>
                  <button className="btn-icon" onClick={() => handleDelete(ingredient.id)}>🗑️</button>
                </td>
              </tr>
            ))}
            {filteredIngredients.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>
                  {ingredients.length === 0 ? 'No ingredients yet.' : 'No ingredients match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showRecipesModal && (
        <div className="form-modal">
          <div className="form-modal-content">
            <h3>All Recipes (ID & Name)</h3>
            {loadingRecipes ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading recipes...</div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto', marginTop: '1rem' }}>
                {recipes.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2rem' }}>No recipes found.</div>
                ) : (
                  recipes.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0',
                        borderBottom: '1px solid #e2e8f0',
                      }}
                    >
                      <span><strong>#{r.id}</strong></span>
                      <span>{r.title}</span>
                    </div>
                  ))
                )}
              </div>
            )}
            <div className="form-actions" style={{ marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-cancel"
                onClick={() => setShowRecipesModal(false)}
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

export default Ingredients;

