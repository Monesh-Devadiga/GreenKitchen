import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Recipes from './components/Recipes';
import RecipeForm from './components/RecipeForm';
import Reviews from './components/Reviews';
import Categories from './components/Categories';
import Cuisines from './components/Cuisines';
import Ingredients from './components/Ingredients';
import Tags from './components/Tags';
import Users from './components/Users';
import DataExplorer from './components/DataExplorer';
import Home from './components/Home';
import Auth from './components/Auth';
import Footer from './components/Footer';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('greenkitchen_user');
      if (stored) {
        setCurrentUser(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to read stored user:', e);
    }
  }, []);

  const handleLogout = () => {
    try {
      localStorage.removeItem('greenkitchen_token');
      localStorage.removeItem('greenkitchen_user');
    } catch (e) {
      console.error('Failed to clear auth storage:', e);
    }
    setCurrentUser(null);
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-brand">
              <div className="logo-mark">GK</div>
              <div>
                <div className="logo-title">GreenKitchen</div>
                <div className="logo-tagline">Fresh recipes & reviews</div>
              </div>
            </div>
            <div className="nav-links">
              <Link to="/">Home</Link>
              <Link to="/recipes">Recipes</Link>
              <Link to="/reviews">Reviews</Link>
              <Link to="/categories">Categories</Link>
              <Link to="/cuisines">Cuisines</Link>
              <Link to="/ingredients">Ingredients</Link>
              <Link to="/tags">Tags</Link>
              <Link to="/users">Users</Link>
              <Link to="/explore">Data Explorer</Link>
              {currentUser ? (
                <div className="nav-user">
                  <div className="nav-user-avatar">
                    {currentUser.username?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <span className="nav-user-name">{currentUser.username}</span>
                  <button className="nav-logout-button" onClick={handleLogout}>
                    Logout
                  </button>
                </div>
              ) : (
                <Link to="/auth">Login</Link>
              )}
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/recipes" element={<Recipes currentUser={currentUser} />} />
            <Route path="/recipe/new" element={<RecipeForm currentUser={currentUser} />} />
            <Route path="/recipe/edit/:id" element={<RecipeForm currentUser={currentUser} />} />
            <Route path="/reviews" element={<Reviews />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/cuisines" element={<Cuisines />} />
            <Route path="/ingredients" element={<Ingredients />} />
            <Route path="/tags" element={<Tags />} />
            <Route path="/users" element={<Users />} />
            <Route path="/explore" element={<DataExplorer />} />
            <Route path="/auth" element={<Auth onAuth={setCurrentUser} />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;

