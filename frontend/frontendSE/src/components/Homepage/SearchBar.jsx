import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

export default function SearchBar() {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    const trimmed = keyword.trim();
    navigate(trimmed ? `/courses?search=${encodeURIComponent(trimmed)}` : '/courses');
  }

  return (
    <form className="search-bar" role="search" onSubmit={handleSubmit}>
      <svg
        className="search-bar__icon"
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
      >
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" />
        <path d="m10.5 10.5 3 3" stroke="currentColor" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        aria-label="Search courses"
        placeholder="Search"
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
      />
    </form>
  );
}