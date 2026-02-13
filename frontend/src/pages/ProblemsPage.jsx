import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth";

const ProblemsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [difficultyOrder, setDifficultyOrder] = useState("asc"); // asc or desc
  const [statusFilter, setStatusFilter] = useState("all"); // all, solved, unsolved
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await api.get("/problems", {
          params: { userId: user.id },
        });

        setProblems(res.data);
        setFilteredProblems(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch problems");
      }
    };

    if (user?.id) fetchProblems();
  }, [user]);

  // Handle sorting and filtering
  useEffect(() => {
    let list = [...problems];

    // Filter by search query
    if (searchQuery) {
      list = list.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by solved status
    if (statusFilter === "solved") list = list.filter((p) => p.is_solved);
    if (statusFilter === "unsolved") list = list.filter((p) => !p.is_solved);

    // Sort by difficulty
    list.sort((a, b) => {
      const diffOrder = ["Easy", "Medium", "Hard"];
      const indexA = diffOrder.indexOf(a.difficulty);
      const indexB = diffOrder.indexOf(b.difficulty);

      return difficultyOrder === "asc" ? indexA - indexB : indexB - indexA;
    });

    setFilteredProblems(list);
  }, [problems, statusFilter, difficultyOrder, searchQuery]);

  const stats = {
    total: problems.length,
    solved: problems.filter((p) => p.is_solved).length,
    easy: problems.filter((p) => p.difficulty === "Easy").length,
    medium: problems.filter((p) => p.difficulty === "Medium").length,
    hard: problems.filter((p) => p.difficulty === "Hard").length,
  };

  return (
    <div className="problems-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            <svg className="hero-icon" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
            </svg>
            Coding Challenges
          </h1>
          <p className="hero-subtitle">
            Master your skills with {stats.total} curated problems
          </p>
        </div>

        {/* Stats Cards */}
        <div className="stats-container">
          <div className="stat-card">
            <div className="stat-icon total">
              <svg fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Problems</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon solved">
              <svg fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">{stats.solved}</span>
              <span className="stat-label">Solved</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon progress">
              <svg fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div className="stat-info">
              <span className="stat-value">
                {stats.total > 0 ? Math.round((stats.solved / stats.total) * 100) : 0}%
              </span>
              <span className="stat-label">Progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Filters Section */}
        <div className="filters-section">
          {/* Search Bar */}
          <div className="search-wrapper">
            <svg className="search-icon" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search problems..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="clear-search">
                <svg fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          <div className="filters-group">
            {/* Difficulty Filter */}
            <div className="filter-control">
              <label className="filter-label">
                <svg className="filter-icon" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                </svg>
                Difficulty
              </label>
              <select
                value={difficultyOrder}
                onChange={(e) => setDifficultyOrder(e.target.value)}
                className="filter-select"
              >
                <option value="asc">Easy → Hard</option>
                <option value="desc">Hard → Easy</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="filter-control">
              <label className="filter-label">
                <svg className="filter-icon" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
                </svg>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Problems</option>
                <option value="solved">Solved Only</option>
                <option value="unsolved">Unsolved Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-banner">
            <svg className="error-icon" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}

        {/* Results Count */}
        <div className="results-header">
          <h2 className="results-title">
            {filteredProblems.length} {filteredProblems.length === 1 ? "Problem" : "Problems"} Found
          </h2>
          {searchQuery && (
            <span className="search-badge">
              Searching for: <strong>{searchQuery}</strong>
            </span>
          )}
        </div>

        {/* Problems Grid */}
        {filteredProblems.length > 0 ? (
          <div className="problems-grid">
            {filteredProblems.map((p) => (
              <div
                key={p.id}
                onClick={() => navigate(`/problems/${p.id}`)}
                className={`problem-card ${p.is_solved ? "solved-card" : ""}`}
              >
                {/* Card Header */}
                <div className="card-header">
                  <h3 className="card-title">{p.title}</h3>
                  {p.is_solved && (
                    <div className="solved-badge">
                      <svg fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Card Description */}
                <p className="card-description">
                  {p.description || "No description available."}
                </p>

                {/* Card Footer */}
                <div className="card-footer">
                  <span className={`difficulty-badge ${p.difficulty.toLowerCase()}`}>
                    <span className="difficulty-dot"></span>
                    {p.difficulty}
                  </span>
                  <div className="card-arrow">
                    <svg fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <svg className="empty-icon" fill="none" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <h3 className="empty-title">No problems found</h3>
            <p className="empty-text">
              Try adjusting your filters or search query
            </p>
            {(searchQuery || statusFilter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                }}
                className="reset-button"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>

      <style >{`
        .problems-page {
          min-height: 100vh;
          background: linear-gradient(to bottom, #f9fafb 0%, #ffffff 100%);
          padding-bottom: 4rem;
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 3rem 2rem;
          margin-bottom: 2rem;
        }

        .hero-content {
          max-width: 1400px;
          margin: 0 auto 2rem auto;
          text-align: center;
          color: white;
        }

        .hero-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin: 0 0 0.75rem 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .hero-icon {
          width: 3rem;
          height: 3rem;
        }

        .hero-subtitle {
          font-size: 1.125rem;
          opacity: 0.95;
          margin: 0;
        }

        .stats-container {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
        }

        .stat-card {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 16px;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          transition: all 0.3s;
        }

        .stat-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.25);
        }

        .stat-icon {
          width: 3rem;
          height: 3rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .stat-icon.total {
          background: #3b82f6;
        }

        .stat-icon.solved {
          background: #10b981;
        }

        .stat-icon.progress {
          background: #f59e0b;
        }

        .stat-icon svg {
          width: 1.5rem;
          height: 1.5rem;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
          color: white;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
        }

        .stat-label {
          font-size: 0.875rem;
          opacity: 0.9;
        }

        /* Main Content */
        .main-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        /* Filters Section */
        .filters-section {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .search-wrapper {
          position: relative;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1.25rem;
          height: 1.25rem;
          color: #9ca3af;
        }

        .search-input {
          width: 100%;
          padding: 0.875rem 1rem 0.875rem 3rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          transition: all 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        .clear-search {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          padding: 0.25rem;
          cursor: pointer;
          color: #9ca3af;
          transition: color 0.2s;
        }

        .clear-search:hover {
          color: #6366f1;
        }

        .clear-search svg {
          width: 1.25rem;
          height: 1.25rem;
        }

        .filters-group {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .filter-control {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
          min-width: 200px;
        }

        .filter-label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #374151;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .filter-icon {
          width: 1rem;
          height: 1rem;
          color: #6366f1;
        }

        .filter-select {
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 0.95rem;
          background: white;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-select:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
        }

        /* Error Banner */
        .error-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 2rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #dc2626;
        }

        .error-icon {
          width: 1.5rem;
          height: 1.5rem;
          flex-shrink: 0;
        }

        /* Results Header */
        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .results-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
        }

        .search-badge {
          font-size: 0.875rem;
          color: #6b7280;
        }

        /* Problems Grid */
        .problems-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.5rem;
        }

        .problem-card {
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 1.5rem;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          position: relative;
          overflow: hidden;
        }

        .problem-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(to right, #6366f1, #8b5cf6);
          transform: scaleX(0);
          transition: transform 0.3s;
        }

        .problem-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
          border-color: #6366f1;
        }

        .problem-card:hover::before {
          transform: scaleX(1);
        }

        .problem-card.solved-card {
          background: linear-gradient(to bottom right, #f0fdf4 0%, #ffffff 100%);
          border-color: #86efac;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .card-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0;
          flex: 1;
        }

        .solved-badge {
          width: 2rem;
          height: 2rem;
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .solved-badge svg {
          width: 1.25rem;
          height: 1.25rem;
        }

        .card-description {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.5;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
        }

        .difficulty-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.375rem 0.875rem;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
        }

        .difficulty-badge.easy {
          background: #dcfce7;
          color: #15803d;
        }

        .difficulty-badge.medium {
          background: #fef3c7;
          color: #a16207;
        }

        .difficulty-badge.hard {
          background: #fee2e2;
          color: #b91c1c;
        }

        .difficulty-dot {
          width: 0.5rem;
          height: 0.5rem;
          border-radius: 50%;
        }

        .difficulty-badge.easy .difficulty-dot {
          background: #15803d;
        }

        .difficulty-badge.medium .difficulty-dot {
          background: #a16207;
        }

        .difficulty-badge.hard .difficulty-dot {
          background: #b91c1c;
        }

        .card-arrow {
          width: 2rem;
          height: 2rem;
          background: #f3f4f6;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          transition: all 0.2s;
        }

        .problem-card:hover .card-arrow {
          background: #6366f1;
          color: white;
          transform: translateX(4px);
        }

        .card-arrow svg {
          width: 1.25rem;
          height: 1.25rem;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
        }

        .empty-icon {
          width: 4rem;
          height: 4rem;
          color: #d1d5db;
          margin: 0 auto 1.5rem auto;
        }

        .empty-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 0.5rem 0;
        }

        .empty-text {
          font-size: 1rem;
          color: #6b7280;
          margin: 0 0 1.5rem 0;
        }

        .reset-button {
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .reset-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-title {
            font-size: 2rem;
          }

          .hero-icon {
            width: 2rem;
            height: 2rem;
          }

          .stats-container {
            grid-template-columns: 1fr;
          }

          .problems-grid {
            grid-template-columns: 1fr;
          }

          .filters-group {
            flex-direction: column;
          }

          .filter-control {
            min-width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default ProblemsPage;