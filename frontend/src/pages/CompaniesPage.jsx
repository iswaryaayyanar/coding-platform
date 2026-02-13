import React, { useEffect, useState } from "react";
import api from "../services/api";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";

const CompaniesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [difficultyOrder, setDifficultyOrder] = useState("asc");
  const [statusFilter, setStatusFilter] = useState("all");

  const [error, setError] = useState("");

  // =============================
  // FETCH ALL PROBLEMS
  // =============================
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

  // =============================
  // FILTER + SORT
  // =============================
  useEffect(() => {
    let list = [...problems];

    // Search by problem title OR company name
    if (searchQuery) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.company_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter === "solved") {
      list = list.filter((p) => p.is_solved);
    }
    if (statusFilter === "unsolved") {
      list = list.filter((p) => !p.is_solved);
    }

    // Difficulty sort
    const order = ["Easy", "Medium", "Hard"];

    list.sort((a, b) => {
      const indexA = order.indexOf(a.difficulty);
      const indexB = order.indexOf(b.difficulty);

      return difficultyOrder === "asc"
        ? indexA - indexB
        : indexB - indexA;
    });

    setFilteredProblems(list);
  }, [problems, searchQuery, statusFilter, difficultyOrder]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto p-8">

        {/* Header Section */}
        <div className="mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Company Wise Coding Problems
          </h1>
          <p className="text-gray-600 text-lg">
            Master coding challenges from top tech companies
          </p>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8">
          <div className="flex flex-wrap gap-4">

            {/* Search Input */}
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <svg 
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
                <input
                  type="text"
                  placeholder="Search by problem or company..."
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-700"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Difficulty Sort */}
            <div className="relative">
              <select
                value={difficultyOrder}
                onChange={(e) => setDifficultyOrder(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 text-gray-700 font-medium bg-white cursor-pointer"
              >
                <option value="asc">📈 Easy → Hard</option>
                <option value="desc">📉 Hard → Easy</option>
              </select>
              <svg 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100 transition-all duration-200 text-gray-700 font-medium bg-white cursor-pointer"
              >
                <option value="all">📋 All Problems</option>
                <option value="solved">✅ Solved</option>
                <option value="unsolved">⏳ Unsolved</option>
              </select>
              <svg 
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

          </div>

          {/* Stats Bar */}
          <div className="mt-6 pt-6 border-t border-gray-100 flex gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{filteredProblems.length}</div>
              <div className="text-sm text-gray-500">Total Problems</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {filteredProblems.filter(p => p.is_solved).length}
              </div>
              <div className="text-sm text-gray-500">Solved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {filteredProblems.filter(p => !p.is_solved).length}
              </div>
              <div className="text-sm text-gray-500">Remaining</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-center gap-3">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        )}

        {/* Problems Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
                    Problem Title
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-4 text-left font-semibold text-sm uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProblems.map((p, index) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 cursor-pointer transition-all duration-200 group"
                    onClick={() => navigate(`/problems/${p.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                          {p.title}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 font-medium text-sm border border-blue-200">
                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
                        </svg>
                        {p.company_name}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg font-semibold text-sm border-2 ${
                          p.difficulty === "Easy"
                            ? "bg-gradient-to-r from-green-100 to-green-50 text-green-700 border-green-300"
                            : p.difficulty === "Medium"
                            ? "bg-gradient-to-r from-yellow-100 to-yellow-50 text-yellow-700 border-yellow-300"
                            : "bg-gradient-to-r from-red-100 to-red-50 text-red-700 border-red-300"
                        }`}
                      >
                        {p.difficulty === "Easy" && "🟢"}
                        {p.difficulty === "Medium" && "🟡"}
                        {p.difficulty === "Hard" && "🔴"}
                        <span className="ml-1.5">{p.difficulty}</span>
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      {p.is_solved ? (
                        <div className="flex items-center gap-2 text-green-600 font-semibold">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span>Solved</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400 font-medium">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                          </svg>
                          <span>Pending</span>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProblems.length === 0 && (
              <div className="py-16 text-center">
                <svg className="mx-auto w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 text-lg font-medium">No problems found</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your filters</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CompaniesPage;