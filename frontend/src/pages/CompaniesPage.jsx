import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import useAuth from "../hooks/useAuth.jsx";

const CompaniesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyProblems, setCompanyProblems] = useState([]);

  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingProblems, setLoadingProblems] = useState(false);

  const [errorCompanies, setErrorCompanies] = useState("");
  const [errorProblems, setErrorProblems] = useState("");

  // =======================
  // FETCH COMPANIES
  // =======================
  useEffect(() => {
    let isMounted = true;

    const fetchCompanies = async () => {
      try {
        setLoadingCompanies(true);
        setErrorCompanies("");

        const res = await api.get("/companies");

        if (isMounted) {
          setCompanies(res.data || []);
        }
      } catch (error) {
        console.error("Fetch companies error:", error);
        if (isMounted) {
          setErrorCompanies("Failed to fetch companies.");
        }
      } finally {
        if (isMounted) {
          setLoadingCompanies(false);
        }
      }
    };

    fetchCompanies();

    return () => {
      isMounted = false;
    };
  }, []);

  // =======================
  // FETCH COMPANY PROGRAMS
  // =======================
  const handleCompanyClick = async (companyId) => {
    if (!user?.id) return;

    setSelectedCompany(companyId);
    setCompanyProblems([]);
    setLoadingProblems(true);
    setErrorProblems("");

    try {
      const res = await api.get(`/companies/${companyId}/programs`, {
        params: { userId: user.id },
      });

      setCompanyProblems(res.data || []);
    } catch (error) {
      console.error("Fetch company programs error:", error);
      setErrorProblems("Failed to fetch company problems.");
    } finally {
      setLoadingProblems(false);
    }
  };

  return (
    <div className="protected-layout">
      <main className="content">
          <div className="page-header">
            <h1 className="page-title">Companies</h1>
            <p className="page-subtitle">
              Explore coding challenges from top tech companies
            </p>
          </div>

          <div className="companies-container">
            {/* =======================
                COMPANY LIST
            ======================= */}
            <div className="company-list-section">
              <div className="section-header">
                <h2 className="section-title">All Companies</h2>
                <span className="company-count">
                  {!loadingCompanies && companies.length > 0 && (
                    <>{companies.length} companies</>
                  )}
                </span>
              </div>

              <div className="section-content">
                {loadingCompanies && (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading companies...</p>
                  </div>
                )}

                {!loadingCompanies && errorCompanies && (
                  <div className="error-state">
                    <svg
                      className="error-icon"
                      fill="none"
                      strokeWidth="2"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <p>{errorCompanies}</p>
                  </div>
                )}

                {!loadingCompanies &&
                  !errorCompanies &&
                  companies.length === 0 && (
                    <div className="empty-state">
                      <svg
                        className="empty-icon"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                      <p>No companies available.</p>
                    </div>
                  )}

                {!loadingCompanies &&
                  !errorCompanies &&
                  companies.length > 0 && (
                    <ul className="company-list">
                      {companies.map((company) => (
                        <li key={company.id} className="company-item">
                          <button
                            className={`company-button ${
                              selectedCompany === company.id ? "active" : ""
                            }`}
                            onClick={() => handleCompanyClick(company.id)}
                          >
                            <span className="company-name">{company.name}</span>
                            <svg
                              className="chevron-icon"
                              fill="none"
                              strokeWidth="2"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
              </div>
            </div>

            {/* =======================
                COMPANY PROBLEMS
            ======================= */}
            {selectedCompany && (
              <div className="company-problems-section">
                <div className="section-header">
                  <h2 className="section-title">Problems</h2>
                  <span className="problem-count">
                    {!loadingProblems && companyProblems.length > 0 && (
                      <>{companyProblems.length} challenges</>
                    )}
                  </span>
                </div>

                <div className="section-content">
                  {loadingProblems && (
                    <div className="loading-state">
                      <div className="spinner"></div>
                      <p>Loading problems...</p>
                    </div>
                  )}

                  {!loadingProblems && errorProblems && (
                    <div className="error-state">
                      <svg
                        className="error-icon"
                        fill="none"
                        strokeWidth="2"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                      <p>{errorProblems}</p>
                    </div>
                  )}

                  {!loadingProblems &&
                    !errorProblems &&
                    companyProblems.length === 0 && (
                      <div className="empty-state">
                        <svg
                          className="empty-icon"
                          fill="none"
                          strokeWidth="2"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <p>No problems available for this company.</p>
                      </div>
                    )}

                  {!loadingProblems &&
                    !errorProblems &&
                    companyProblems.length > 0 && (
                      <ul className="problem-list">
                        {companyProblems.map((problem) => (
                          <li key={problem.id} className="problem-item">
                            <button
                              className={`problem-button ${
                                problem.is_solved ? "solved" : "unsolved"
                              }`}
                              onClick={() => navigate(`/problems/${problem.id}`)}
                            >
                              <div className="problem-content">
                                <h3 className="problem-title">
                                  {problem.title}
                                </h3>
                                <span
                                  className={`problem-status ${
                                    problem.is_solved ? "solved" : "unsolved"
                                  }`}
                                >
                                  {problem.is_solved ? (
                                    <>
                                      <svg
                                        className="status-icon"
                                        fill="none"
                                        strokeWidth="2"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                      Solved
                                    </>
                                  ) : (
                                    <>
                                      <svg
                                        className="status-icon"
                                        fill="none"
                                        strokeWidth="2"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                      Unsolved
                                    </>
                                  )}
                                </span>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                </div>
              </div>
            )}
          </div>
        </main>

      <style jsx>{`
        /* Page Header */
        .page-header {
          margin-bottom: 2rem;
        }

        .page-title {
          font-size: 2rem;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 0.5rem 0;
        }

        .page-subtitle {
          font-size: 1rem;
          color: #6b7280;
          margin: 0;
        }

        /* Companies Container */
        .companies-container {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 2rem;
          margin-top: 2rem;
        }

        @media (max-width: 968px) {
          .companies-container {
            grid-template-columns: 1fr;
          }
        }

        /* Section Styles */
        .company-list-section,
        .company-problems-section {
          background: #ffffff;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e5e7eb;
          background: #f9fafb;
        }

        .section-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
        }

        .company-count,
        .problem-count {
          font-size: 0.875rem;
          color: #6b7280;
          font-weight: 500;
        }

        .section-content {
          padding: 1.5rem;
        }

        /* Company List */
        .company-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .company-item {
          list-style: none;
        }

        .company-button {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.25rem;
          background: #f9fafb;
          border: 2px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.95rem;
          font-weight: 500;
          color: #374151;
          text-align: left;
        }

        .company-button:hover {
          background: #f3f4f6;
          border-color: #e5e7eb;
        }

        .company-button.active {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #1e40af;
        }

        .company-name {
          flex: 1;
        }

        .chevron-icon {
          width: 1.25rem;
          height: 1.25rem;
          opacity: 0.5;
          transition: all 0.2s ease;
        }

        .company-button:hover .chevron-icon,
        .company-button.active .chevron-icon {
          opacity: 1;
          transform: translateX(2px);
        }

        /* Problem List */
        .problem-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .problem-item {
          list-style: none;
        }

        .problem-button {
          width: 100%;
          padding: 1.25rem;
          background: #ffffff;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
        }

        .problem-button:hover {
          border-color: #d1d5db;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          transform: translateY(-1px);
        }

        .problem-button.solved {
          background: #f0fdf4;
          border-color: #86efac;
        }

        .problem-button.solved:hover {
          border-color: #4ade80;
        }

        .problem-button.unsolved {
          background: #fefce8;
          border-color: #fde047;
        }

        .problem-button.unsolved:hover {
          border-color: #facc15;
        }

        .problem-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .problem-title {
          font-size: 1rem;
          font-weight: 600;
          color: #1a1a1a;
          margin: 0;
          flex: 1;
        }

        .problem-status {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.375rem 0.75rem;
          border-radius: 6px;
          white-space: nowrap;
        }

        .problem-status.solved {
          background: #dcfce7;
          color: #15803d;
        }

        .problem-status.unsolved {
          background: #fef9c3;
          color: #a16207;
        }

        .status-icon {
          width: 1rem;
          height: 1rem;
        }

        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          color: #6b7280;
        }

        .spinner {
          width: 2.5rem;
          height: 2.5rem;
          border: 3px solid #e5e7eb;
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Error State */
        .error-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          color: #dc2626;
          text-align: center;
        }

        .error-icon {
          width: 3rem;
          height: 3rem;
          margin-bottom: 1rem;
        }

        /* Empty State */
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 3rem 1rem;
          color: #9ca3af;
          text-align: center;
        }

        .empty-icon {
          width: 3rem;
          height: 3rem;
          margin-bottom: 1rem;
        }
      `}</style>
    </div>
  );
};

export default CompaniesPage;