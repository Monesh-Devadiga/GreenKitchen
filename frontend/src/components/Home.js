import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <section className="home-hero">
        <div className="home-hero-layout">
          <div className="home-hero-text">
            <h1>Welcome to GreenKitchen</h1>
            <p>
              GreenKitchen is a simple recipe and reviews hub where you can explore dishes,
              see what other home cooks are making, and share your own creations.
            </p>
            <p>
              Browse recipes by cuisine and category, see the ingredients and step‑by‑step
              instructions, and read honest feedback from the community.
            </p>
          </div>
          <div className="home-hero-image-wrapper">
            <img
              className="home-hero-image"
              src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
              alt="Colorful fresh food dishes on a table"
            />
          </div>
        </div>
      </section>

      <section className="home-section">
        <h2>What you can do here</h2>
        <div className="home-cards">
          <div className="home-card">
            <h3>Discover Recipes</h3>
            <p>
              Explore all recipes with details like servings, total time, ingredients,
              instructions, tags, cuisines and categories.
            </p>
          </div>
          <div className="home-card">
            <h3>Rate & Review</h3>
            <p>
              Log in to give ratings and comments on other users&apos; recipes, and see
              what people think about each dish.
            </p>
          </div>
          <div className="home-card">
            <h3>Organize by Tags</h3>
            <p>
              Use tags to group similar recipes together (for example &quot;Healthy&quot;,
              &quot;Quick Dinner&quot;, or &quot;Party Food&quot;), and easily see which
              recipes share the same theme.
            </p>
          </div>
        </div>
      </section>

      <section className="home-section">
        <h2>Data overview</h2>
        <p>
          Behind the scenes, GreenKitchen connects multiple tables – users, recipes,
          ingredients, tags, reviews, categories and cuisines – so you get a complete
          view of each dish and its feedback.
        </p>
        <p>
          Use the Data Explorer page to see combined information like top recipes,
          recent reviews, and the most active contributors in one place.
        </p>
      </section>
    </div>
  );
};

export default Home;


