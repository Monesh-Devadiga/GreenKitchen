import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('greenkitchen_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Recipes
export const getRecipes = () => api.get('/recipes');
export const getRecipe = (id) => api.get(`/recipes/${id}`);
export const createRecipe = (data) => api.post('/recipes', data);
export const updateRecipe = (id, data) => api.put(`/recipes/${id}`, data);
export const deleteRecipe = (id) => api.delete(`/recipes/${id}`);

// Reviews
export const getReviews = () => api.get('/reviews');
export const getRecipeReviews = (recipeId) => api.get(`/reviews/recipe/${recipeId}`);
export const createReview = (data) => api.post('/reviews', data);
export const updateReview = (id, data) => api.put(`/reviews/${id}`, data);
export const deleteReview = (id) => api.delete(`/reviews/${id}`);

// Categories
export const getCategories = () => api.get('/categories');
export const createCategory = (data) => api.post('/categories', data);
export const updateCategory = (id, data) => api.put(`/categories/${id}`, data);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Cuisines
export const getCuisines = () => api.get('/cuisines');
export const createCuisine = (data) => api.post('/cuisines', data);
export const updateCuisine = (id, data) => api.put(`/cuisines/${id}`, data);
export const deleteCuisine = (id) => api.delete(`/cuisines/${id}`);

// Ingredients
export const getIngredients = () => api.get('/ingredients');
export const createIngredient = (data) => api.post('/ingredients', data);
export const updateIngredient = (id, data) => api.put(`/ingredients/${id}`, data);
export const deleteIngredient = (id) => api.delete(`/ingredients/${id}`);

// Tags
export const getTags = () => api.get('/tags');
export const createTag = (data) => api.post('/tags', data);
export const updateTag = (id, data) => api.put(`/tags/${id}`, data);
export const deleteTag = (id) => api.delete(`/tags/${id}`);
export const updateTagRecipes = (id, recipeIds) =>
  api.put(`/tags/${id}/recipes`, { recipe_ids: recipeIds });
export const copyRecipeTags = (fromId, toId) =>
  api.post('/tags/copy-recipe-tags', {
    from_recipe_id: fromId,
    to_recipe_id: toId,
  });

// Users
export const getUsers = () => api.get('/users');
export const getUser = (id) => api.get(`/users/${id}`);
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Overview / cross-table data
export const getOverview = () => api.get('/overview');

export default api;

