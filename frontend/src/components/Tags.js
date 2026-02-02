import React, { useState, useEffect } from 'react';
import { getTags, createTag, updateTag, deleteTag, updateTagRecipes, copyRecipeTags, getRecipes } from '../api/api';
import './TableComponent.css';

const Tags = () => {
  const [tags, setTags] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingTag, setEditingTag] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  const [showRecipesForm, setShowRecipesForm] = useState(false);
  const [recipesFormTag, setRecipesFormTag] = useState(null);
  const [recipesInput, setRecipesInput] = useState('');
  const [fromRecipeId, setFromRecipeId] = useState('');
  const [toRecipeId, setToRecipeId] = useState('');

  useEffect(() => {
    fetchTags();
    fetchRecipes();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await getTags();
      setTags(response.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
      alert('Failed to fetch tags');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTag) {
        await updateTag(editingTag.id, formData);
        alert('Tag updated successfully');
      } else {
        await createTag(formData);
        alert('Tag created successfully');
      }
      setShowForm(false);
      setEditingTag(null);
      setFormData({ name: '' });
      fetchTags();
    } catch (error) {
      console.error('Error saving tag:', error);
      alert('Failed to save tag');
    }
  };

  const fetchRecipes = async () => {
    try {
      const response = await getRecipes();
      setRecipes(response.data);
    } catch (error) {
      console.error('Error fetching recipes for tag helper:', error);
    }
  };

  const handleEdit = (tag) => {
    setEditingTag(tag);
    setFormData({ name: tag.name });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tag?')) {
      try {
        await deleteTag(id);
        setTags(tags.filter(t => t.id !== id));
        alert('Tag deleted successfully');
      } catch (error) {
        console.error('Error deleting tag:', error);
        alert('Failed to delete tag');
      }
    }
  };

  const openRecipesForm = (tag) => {
    setRecipesFormTag(tag);
    setRecipesInput(tag.recipe_ids || '');
    setShowRecipesForm(true);
  };

  const handleRecipesSubmit = async (e) => {
    e.preventDefault();
    if (!recipesFormTag) return;

    const ids = recipesInput
      .split(',')
      .map(v => v.trim())
      .filter(v => v !== '' && !isNaN(Number(v)))
      .map(v => Number(v));

    try {
      await updateTagRecipes(recipesFormTag.id, ids);
      alert('Tag recipes updated successfully');
      setShowRecipesForm(false);
      setRecipesFormTag(null);
      setRecipesInput('');
      fetchTags();
    } catch (error) {
      console.error('Error updating tag recipes:', error);
      alert('Failed to update tag recipes');
    }
  };

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="table-container">
      <div className="page-header">
        <h2>Tags</h2>
        <div className="table-actions">
          <input
            type="text"
            className="search-input"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-primary" onClick={() => {
            setShowForm(true);
            setEditingTag(null);
            setFormData({ name: '' });
          }}>
            + Add Tag
          </button>
        </div>
      </div>

      <div className="tag-helper-bar">
        <span>Tag one recipe with another recipe&apos;s tags:</span>
        <div className="tag-helper-inputs">
          <span>Tag</span>
          <select
            value={fromRecipeId}
            onChange={(e) => setFromRecipeId(e.target.value)}
          >
            <option value="">Select source recipe</option>
            {recipes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id} - {r.title}
              </option>
            ))}
          </select>
          <span>with</span>
          <select
            value={toRecipeId}
            onChange={(e) => setToRecipeId(e.target.value)}
          >
            <option value="">Select target recipe</option>
            {recipes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id} - {r.title}
              </option>
            ))}
          </select>
          <button
            className="btn btn-secondary"
            onClick={async () => {
              const fromId = Number(fromRecipeId);
              const toId = Number(toRecipeId);
              if (!fromId || !toId) {
                alert('Please enter both source and target recipe IDs.');
                return;
              }
              if (fromId === toId) {
                alert('Source and target recipes must be different.');
                return;
              }
              try {
                await copyRecipeTags(fromId, toId);
                alert(`Tags from recipe ${fromId} applied to recipe ${toId}.`);
                setFromRecipeId('');
                setToRecipeId('');
                fetchTags();
              } catch (error) {
                console.error('Error copying recipe tags:', error);
                alert('Failed to tag recipe with another recipe.');
              }
            }}
          >
            Tag
          </button>
        </div>
      </div>

      {showForm && (
        <div className="form-modal">
          <div className="form-modal-content">
            <h3>{editingTag ? 'Edit Tag' : 'Add Tag'}</h3>
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
                  setEditingTag(null);
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
            {filteredTags.map(tag => (
              <tr key={tag.id}>
                <td>{tag.id}</td>
                <td>{tag.name}</td>
                <td>{tag.recipe_ids || '-'}</td>
                <td>
                  <button className="btn-icon" onClick={() => handleEdit(tag)}>✏️</button>
                  <button className="btn-icon" onClick={() => openRecipesForm(tag)}>🔗</button>
                  <button className="btn-icon" onClick={() => handleDelete(tag.id)}>🗑️</button>
                </td>
              </tr>
            ))}
            {filteredTags.length === 0 && (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center', padding: '1rem' }}>
                  {tags.length === 0 ? 'No tags yet.' : 'No tags match your search.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showRecipesForm && recipesFormTag && (
        <div className="form-modal">
          <div className="form-modal-content">
            <h3>Link Tag to Recipes: {recipesFormTag.name}</h3>
            <form onSubmit={handleRecipesSubmit}>
              <div className="form-group">
                <label>Recipe IDs (comma separated)</label>
                <input
                  type="text"
                  value={recipesInput}
                  onChange={(e) => setRecipesInput(e.target.value)}
                  placeholder="e.g. 1, 2, 5"
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-cancel"
                  onClick={() => {
                    setShowRecipesForm(false);
                    setRecipesFormTag(null);
                    setRecipesInput('');
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tags;

