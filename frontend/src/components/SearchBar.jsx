import React, { useState } from 'react';
import { Search } from 'lucide-react';

export const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <Search size={20} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search resources..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn-primary search-submit-btn">Search</button>
      </div>
    </form>
  );
};
