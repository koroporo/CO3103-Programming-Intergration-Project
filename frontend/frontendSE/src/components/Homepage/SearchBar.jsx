import './SearchBar.css';

export default function SearchBar() {
  return (
    <form className="search-bar" role="search" onSubmit={(event) => event.preventDefault()}>
      <svg
        className="search-bar__icon"
        aria-hidden="true"
        viewBox="0 0 16 16"
        fill="none"
      >
        <circle cx="7" cy="7" r="4.5" stroke="currentColor" />
        <path d="m10.5 10.5 3 3" stroke="currentColor" strokeLinecap="round" />
      </svg>
      <input type="search" aria-label="Search courses" placeholder="Search" />
    </form>
  );
}
