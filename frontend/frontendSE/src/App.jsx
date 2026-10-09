import { useEffect, useRef, useState } from "react";
import { getCourses } from "./services/courseService";
import { hasActiveSession, logout } from "./services/authService";
import "./App.css";

function App() {
  const [courses, setCourses] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signedIn, setSignedIn] = useState(hasActiveSession);
  const [logoutMessage, setLogoutMessage] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);
  const requestController = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    requestController.current = controller;

    getCourses({ signal: controller.signal })
      .then((result) => {
        setCourses(result.courses);
        setPage(result.page);
        setLimit(result.limit);
        setTotal(result.total);
      })
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => requestController.current?.abort();
  }, []);

  async function loadCourses({ nextSearch = submittedSearch, nextPage = 1 } = {}) {
    requestController.current?.abort();
    const controller = new AbortController();
    requestController.current = controller;
    setLoading(true);
    setError("");

    try {
      const result = await getCourses({
        search: nextSearch,
        page: nextPage,
        signal: controller.signal
      });
      setCourses(result.courses);
      setPage(result.page);
      setLimit(result.limit);
      setTotal(result.total);
    } catch (requestError) {
      if (requestError.name !== "AbortError") {
        setError(requestError.message);
      }
    } finally {
      if (requestController.current === controller) {
        setLoading(false);
      }
    }
  }

  async function handleSearch(event) {
    event.preventDefault();
    const normalizedSearch = search.trim();
    setSubmittedSearch(normalizedSearch);
    await loadCourses({ nextSearch: normalizedSearch, nextPage: 1 });
  }

  async function handleLogout() {
    setError("");
    setLogoutMessage("");
    setLoggingOut(true);
    try {
      await logout();
      setSignedIn(false);
      setLogoutMessage("You have been logged out.");
    } catch (logoutError) {
      setError(logoutError.message);
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <main className="page-shell">
      <header className="site-header">
        <a className="brand" href="/" aria-label="English Platform home">
          <span className="brand-mark">E</span>
          <span>English Platform</span>
        </a>
        {signedIn && (
          <button
            className="logout-button"
            disabled={loggingOut}
            onClick={handleLogout}
            type="button"
          >
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
        )}
      </header>

      <section className="hero">
        <p className="eyebrow">LEARN AT YOUR PACE</p>
        <h1>Find the right English course for you</h1>
        <p className="hero-copy">
          Explore courses and build the skills you need, one lesson at a time.
        </p>
        <form className="search-form" onSubmit={handleSearch} role="search">
          <label className="visually-hidden" htmlFor="course-search">
            Search courses
          </label>
          <input
            id="course-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by course or topic"
            type="search"
            value={search}
          />
          <button type="submit">Search</button>
        </form>
      </section>

      <section aria-labelledby="course-list-heading" className="catalogue">
        <div className="catalogue-heading">
          <div>
            <p className="eyebrow">COURSE CATALOGUE</p>
            <h2 id="course-list-heading">
              {submittedSearch
                ? `Results for “${submittedSearch}”`
                : "Explore courses"}
            </h2>
          </div>
          <span className="result-count">
            {loading ? "Loading…" : `${total} courses`}
          </span>
        </div>

        {logoutMessage && (
          <p className="status-message" role="status">
            {logoutMessage}
          </p>
        )}
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
        {loading && <p className="empty-state">Loading courses…</p>}
        {!loading && !error && courses.length === 0 && (
          <p className="empty-state">
            {submittedSearch
              ? "No courses matched your search. Try another keyword."
              : "There are no published courses yet."}
          </p>
        )}

        {!loading && courses.length > 0 && (
          <div className="course-grid">
            {courses.map((course) => (
              <article className="course-card" key={course.id}>
                <a
                  aria-label={`View ${course.title}`}
                  className="course-image-link"
                  href={`/courses/${encodeURIComponent(course.slug)}`}
                >
                  {course.thumbnail_url ? (
                    <img
                      alt=""
                      className="course-image"
                      loading="lazy"
                      src={course.thumbnail_url}
                    />
                  ) : (
                    <div aria-hidden="true" className="course-image-placeholder">
                      <span>Learn something new</span>
                    </div>
                  )}
                </a>
                <div className="course-card-content">
                  {course.category_name && (
                    <p className="course-category">{course.category_name}</p>
                  )}
                  <h3>
                    <a href={`/courses/${encodeURIComponent(course.slug)}`}>
                      {course.title}
                    </a>
                  </h3>
                  <p className="course-description">{course.description}</p>
                  {course.instructor_name && (
                    <p className="instructor-name">
                      By {course.instructor_name}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
        {!loading && total > limit && (
          <nav aria-label="Course pages" className="pagination">
            <button
              disabled={page <= 1}
              onClick={() => loadCourses({ nextPage: page - 1 })}
              type="button"
            >
              Previous
            </button>
            <span>
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <button
              disabled={page >= Math.ceil(total / limit)}
              onClick={() => loadCourses({ nextPage: page + 1 })}
              type="button"
            >
              Next
            </button>
          </nav>
        )}
      </section>
    </main>
  );
}

export default App;
