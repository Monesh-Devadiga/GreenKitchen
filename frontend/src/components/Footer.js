import React from 'react';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="footer-links">
          <a href="#press">Press &amp; Media</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms &amp; Conditions</a>
          <a href="#accessibility">Accessibility Statement</a>
        </div>
        <div className="footer-social">
          <a href="#facebook" aria-label="Facebook">𝌆</a>
          <a href="#threads" aria-label="Threads">@</a>
          <a href="#instagram" aria-label="Instagram">◎</a>
          <a href="#pinterest" aria-label="Pinterest">ꕤ</a>
          <a href="#youtube" aria-label="YouTube">▶</a>
        </div>
      </div>

      <div className="footer-copy">
        © {year} GreenKitchen — Authentic plant-forward recipes &amp; reviews
      </div>

      <div className="footer-note">
        Information from your device can be used to personalize your experience.
      </div>

      <div className="footer-legal-links">
        <a href="#privacy-optout">Do not sell or share my personal information.</a>
        <a href="#content-use">Terms of Content Use</a>
      </div>

      <div className="footer-partner">
        A GREENKITCHEN NETWORK SITE
      </div>
    </footer>
  );
};

export default Footer;

