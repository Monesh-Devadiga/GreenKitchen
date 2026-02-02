import React, { useState, useEffect } from 'react';
import { getCuisines, createCuisine, updateCuisine, deleteCuisine } from '../api/api';
import './TableComponent.css';

const Cuisines = () => {
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCuisine, setEditingCuisine] = useState(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    fetchCuisines();
  }, []);

  const fetchCuisines = async () => {
    try {
      const response = await getCuisines();
      setCuisines(response.data);
    } catch (error) {
      console.error('Error fetching cuisines:', error);
      alert('Failed to fetch cuisines');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCuisine) {
        await updateCuisine(editingCuisine.id, formData);
        alert('Cuisine updated successfully');
      } else {
        await createCuisine(formData);
        alert('Cuisine created successfully');
      }
      setShowForm(false);
      setEditingCuisine(null);
      setFormData({ name: '' });
      fetchCuisines();
    } catch (error) {
      console.error('Error saving cuisine:', error);
      alert('Failed to save cuisine');
    }
  };

  const handleEdit = (cuisine) => {
    setEditingCuisine(cuisine);
    setFormData({ name: cuisine.name });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this cuisine?')) {
      try {
        await deleteCuisine(id);
        setCuisines(cuisines.filter(c => c.id !== id));
        alert('Cuisine deleted successfully');
      } catch (error) {
        console.error('Error deleting cuisine:', error);
        alert('Failed to delete cuisine');
      }
    }
  };

  const filteredCuisines = cuisines.filter(cuisine =>
    cuisine.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="table-container">
      <div className="page-header">
        <h2>Cuisines</h2>
        <div className="table-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Search cuisines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => {
            setShowForm(true);
            setEditingCuisine(null);
            setFormData({ name: '' });
          }}>
            + Add Cuisine
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <h3>{editingCuisine ? 'Edit Cuisine' : 'Add Cuisine'}</h3>
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
                  setEditingCuisine(null);
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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCuisines.map(cuisine => (
              <tr key={cuisine.id}>
                <td>{cuisine.id}</td>
                <td>{cuisine.name}</td>
                <td>
                  <button className="btn-icon" onClick={() => handleEdit(cuisine)}>✏️</button>
                  <button className="btn-icon" onClick={() => handleDelete(cuisine.id)}>🗑️</button>
                </td>
              </tr>
            ))}
            {filteredCuisines.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>
                  {cuisines.length === 0 ? 'No cuisines yet.' : 'No cuisines match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Cuisines;

