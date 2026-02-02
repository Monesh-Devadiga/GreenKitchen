import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getRecipe, createRecipe, updateRecipe, getCategories, getCuisines, getUsers } from '../api/api';
import './RecipeForm.css';

const RecipeForm = ({ currentUser }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  // Check if user is logged in
  useEffect(() => {
    if (!currentUser) {
      alert('Please login to add or edit recipes.');
      navigate('/auth');
    }
  }, [currentUser, navigate]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    servings: '',
    prep_time_minutes: '',
    cook_time_minutes: '',
    author_name: '',
    category_name: '',
    cuisine_name: '',
    ingredients: [{ name: '', quantity: '', unit: '' }],
    instructions: [{ step_number: 1, description: '' }],
    tags: []
  });
  
  const [categories, setCategories] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [users, setUsers] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDropdowns();
    if (isEdit) {
      fetchRecipe();
    }
  }, [id]);

  const fetchDropdowns = async () => {
    try {
      const [catsRes, cuisRes, usersRes] = await Promise.all([
        getCategories(),
        getCuisines(),
        getUsers()
      ]);
      setCategories(catsRes.data);
      setCuisines(cuisRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error fetching dropdowns:', error);
    }
  };

  const fetchRecipe = async () => {
    try {
      const response = await getRecipe(id);
      const recipe = response.data;
      setFormData({
        title: recipe.title || '',
        description: recipe.description || '',
        servings: recipe.servings || '',
        prep_time_minutes: recipe.prep_time_minutes || '',
        cook_time_minutes: recipe.cook_time_minutes || '',
        author_name: recipe.author_name || '',
        category_name: recipe.category_name || '',
        cuisine_name: recipe.cuisine_name || '',
        ingredients: recipe.ingredients && recipe.ingredients.length > 0 
          ? recipe.ingredients.map(ing => ({ name: ing.name, quantity: ing.quantity || '', unit: ing.unit || '' }))
          : [{ name: '', quantity: '', unit: '' }],
        instructions: recipe.instructions && recipe.instructions.length > 0
          ? recipe.instructions.map(inst => ({ step_number: inst.step_number, description: inst.description }))
          : [{ step_number: 1, description: '' }],
        tags: recipe.tags ? recipe.tags.map(t => t.name || t) : []
      });
    } catch (error) {
      console.error('Error fetching recipe:', error);
      alert('Failed to fetch recipe');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', quantity: '', unit: '' }]
    });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index].description = value;
    newInstructions[index].step_number = index + 1;
    setFormData({ ...formData, instructions: newInstructions });
  };

  const addInstruction = () => {
    setFormData({
      ...formData,
      instructions: [...formData.instructions, { step_number: formData.instructions.length + 1, description: '' }]
    });
  };

  const removeInstruction = (index) => {
    const newInstructions = formData.instructions.filter((_, i) => i !== index);
    newInstructions.forEach((inst, idx) => {
      inst.step_number = idx + 1;
    });
    setFormData({ ...formData, instructions: newInstructions });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData({ ...formData, tags: formData.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check authentication before submitting
    if (!currentUser) {
      alert('Please login to add or edit recipes.');
      navigate('/auth');
      return;
    }
    
    setLoading(true);

    try {
      const data = {
        ...formData,
        servings: parseInt(formData.servings) || null,
        prep_time_minutes: parseInt(formData.prep_time_minutes) || null,
        cook_time_minutes: parseInt(formData.cook_time_minutes) || null,
        author_id: null,
        category_id: null,
        cuisine_id: null,
        ingredients: formData.ingredients.filter(ing => ing.name.trim() !== ''),
        instructions: formData.instructions.filter(inst => inst.description.trim() !== '')
      };

      const author = users.find(
        user => user.username.toLowerCase() === formData.author_name.trim().toLowerCase()
      );
      const category = categories.find(
        cat => cat.name.toLowerCase() === formData.category_name.trim().toLowerCase()
      );
      const cuisine = cuisines.find(
        cuis => cuis.name.toLowerCase() === formData.cuisine_name.trim().toLowerCase()
      );

      if (formData.author_name && !author) {
        alert('Please select an existing author from the suggestions.');
        setLoading(false);
        return;
      }

      if (formData.category_name && !category) {
        alert('Please select an existing category from the suggestions.');
        setLoading(false);
        return;
      }

      if (formData.cuisine_name && !cuisine) {
        alert('Please select an existing cuisine from the suggestions.');
        setLoading(false);
        return;
      }

      data.author_id = author ? author.id : null;
      data.category_id = category ? category.id : null;
      data.cuisine_id = cuisine ? cuisine.id : null;

      if (isEdit) {
        await updateRecipe(id, data);
        alert('Recipe updated successfully!');
      } else {
        await createRecipe(data);
        alert('Recipe created successfully!');
      }
      navigate('/');
    } catch (error) {
      console.error('Error saving recipe:', error);
      alert('Failed to save recipe');
    } finally {
      setLoading(false);
    }
  };

  // Don't render form if user is not logged in
  if (!currentUser) {
    return (
      <div className="recipe-form-container">
        <div className="form-card">
          <h2>Authentication Required</h2>
          <p>Please login to add or edit recipes.</p>
          <button className="btn btn-primary" onClick={() => navigate('/auth')}>
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="recipe-form-container">
      <div className="form-card">
        <h2>{isEdit ? 'Edit Recipe' : 'Create New Recipe'}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Servings</label>
              <input
                type="number"
                name="servings"
                value={formData.servings}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Prep Time (minutes)</label>
              <input
                type="number"
                name="prep_time_minutes"
                value={formData.prep_time_minutes}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Cook Time (minutes)</label>
              <input
                type="number"
                name="cook_time_minutes"
                value={formData.cook_time_minutes}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Author</label>
              <input
                type="text"
                name="author_name"
                list="authors-list"
                placeholder="Start typing to search authors"
                value={formData.author_name}
                onChange={handleChange}
              />
              <datalist id="authors-list">
                {users.map(user => (
                  <option key={user.id} value={user.username} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label>Category</label>
              <input
                type="text"
                name="category_name"
                list="categories-list"
                placeholder="Start typing to search categories"
                value={formData.category_name}
                onChange={handleChange}
              />
              <datalist id="categories-list">
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label>Cuisine</label>
              <input
                type="text"
                name="cuisine_name"
                list="cuisines-list"
                placeholder="Start typing to search cuisines"
                value={formData.cuisine_name}
                onChange={handleChange}
              />
              <datalist id="cuisines-list">
                {cuisines.map(cuisine => (
                  <option key={cuisine.id} value={cuisine.name} />
                ))}
              </datalist>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <label>Ingredients</label>
              <button type="button" className="btn btn-secondary" onClick={addIngredient}>
                + Add Ingredient
              </button>
            </div>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-row">
                <input
                  type="text"
                  placeholder="Ingredient name"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Quantity"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                />
                <input
                  type="text"
                  placeholder="Unit"
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                />
                <button type="button" className="btn-remove" onClick={() => removeIngredient(index)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="form-section">
            <div className="section-header">
              <label>Instructions</label>
              <button type="button" className="btn btn-secondary" onClick={addInstruction}>
                + Add Step
              </button>
            </div>
            {formData.instructions.map((instruction, index) => (
              <div key={index} className="instruction-row">
                <span className="step-number">{index + 1}</span>
                <textarea
                  placeholder="Instruction description"
                  value={instruction.description}
                  onChange={(e) => handleInstructionChange(index, e.target.value)}
                  rows="2"
                />
                <button type="button" className="btn-remove" onClick={() => removeInstruction(index)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="form-section">
            <label>Tags</label>
            <div className="tag-input-group">
              <input
                type="text"
                placeholder="Add a tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <button type="button" className="btn btn-secondary" onClick={handleAddTag}>
                Add Tag
              </button>
            </div>
            <div className="tags-display">
              {formData.tags.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}>×</button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-cancel" onClick={() => navigate('/')}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : (isEdit ? 'Update Recipe' : 'Create Recipe')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeForm;

