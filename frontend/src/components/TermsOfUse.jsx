import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export const TermsOfUse = () => {
  return (
    <div className="terms-container">
      <div className="terms-card">
        <Link to="/" className="back-link">
          <ArrowLeft size={18} /> Back to Home
        </Link>
        
        <div className="terms-header">
          <div className="terms-icon">
            <Shield size={32} />
          </div>
          <h1>Terms of Use</h1>
          <p>Last updated: May 13, 2026</p>
        </div>

        <div className="terms-content">
          <section>
            <h2>1. Purpose of the Platform</h2>
            <p>
              The AAU Community Resource Sharing (AAU CRS) hub is designed exclusively for the students and faculty 
              of Addis Ababa University. Its primary goal is to facilitate the secure exchange of academic materials, 
              including lecture notes, research papers, and study guides.
            </p>
          </section>

          <section>
            <h2>2. User Responsibility</h2>
            <p>
              Users are responsible for all activity conducted through their account. You must maintain the 
              confidentiality of your login credentials and immediately report any unauthorized access.
            </p>
          </section>

          <section>
            <h2>3. Academic Integrity</h2>
            <p>
              This platform must not be used to facilitate academic dishonesty. Sharing of exam answers, 
              unauthorized collaboration on individual assignments, or any other violation of the AAU 
              Student Code of Conduct is strictly prohibited.
            </p>
          </section>

          <section>
            <h2>4. Data Protection & Privacy</h2>
            <p>
              By using this platform, you agree to our security auditing practices. All system actions are 
              logged to ensure the safety and integrity of the community. Your data is encrypted and handled 
              according to the University's digital privacy standards.
            </p>
          </section>

          <section>
            <h2>5. Content Moderation</h2>
            <p>
              AAU CRS reserves the right to suspend any content or user account that violates these terms. 
              Suspensions are handled by authorized administrators and are subject to review.
            </p>
          </section>
        </div>

        <div className="terms-footer">
          <p>By registering, you acknowledge that you have read and agreed to these terms.</p>
        </div>
      </div>
    </div>
  );
};
