import React, { useEffect, useState, useMemo } from "react";
import api from "../services/api";

const LeaderboardPage = () => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [search, setSearch] = useState("");

  const currentUsername = localStorage.getItem("username");

  useEffect(() => {
    api.get("/leaderboard").then((res) => {
      setLeaderboard(res.data || []);
    });
  }, []);

  // current logged user info + rank
  const currentUser = useMemo(() => {
    if (!leaderboard.length || !currentUsername) return null;

    const index = leaderboard.findIndex(
      (u) => u.username === currentUsername
    );

    if (index === -1) return null;

    return {
      username: leaderboard[index].username,
      solved: leaderboard[index].solved,
      score: leaderboard[index].score,
      rank: index + 1,
      total: leaderboard.length,
    };
  }, [leaderboard, currentUsername]);

  // search ONLY by username (STRICT)
  const filteredLeaderboard = useMemo(() => {
    if (!search.trim()) return leaderboard;

    const searchLower = search.trim().toLowerCase();

    return leaderboard.filter(
      (u) =>
        u.username &&
        u.username.toLowerCase().includes(searchLower)
    );
  }, [leaderboard, search]);

  // searched user exact match info
  const searchedUser = useMemo(() => {
    if (!search.trim()) return null;

    const searchLower = search.trim().toLowerCase();

    const index = leaderboard.findIndex(
      (u) =>
        u.username &&
        u.username.toLowerCase() === searchLower
    );

    if (index === -1) return null;

    return {
      username: leaderboard[index].username,
      solved: leaderboard[index].solved,
      score: leaderboard[index].score,
      rank: index + 1,
    };
  }, [leaderboard, search]);

  // Helper function to get medal/trophy for top 3
  const getRankBadge = (rank) => {
    if (rank === 1) return { emoji: "🥇", color: "from-yellow-400 to-yellow-600", text: "text-yellow-900" };
    if (rank === 2) return { emoji: "🥈", color: "from-gray-300 to-gray-500", text: "text-gray-900" };
    if (rank === 3) return { emoji: "🥉", color: "from-orange-400 to-orange-600", text: "text-orange-900" };
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-10">

        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
              <span className="text-3xl">🏆</span>
            </div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Leaderboard
              </h1>
              <p className="text-gray-600 text-lg mt-1">
                Compete with the best problem solvers
              </p>
            </div>
          </div>
        </div>

        {/* Current User Rank Card */}
        {currentUser && (
          <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-8 shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"/>
                </svg>
                <p className="text-white text-sm font-semibold uppercase tracking-wider opacity-90">
                  Your Position
                </p>
              </div>

              <div className="flex items-baseline gap-3 mb-3">
                <p className="text-6xl font-bold text-white">
                  #{currentUser.rank}
                </p>
                <div className="px-4 py-2 bg-white bg-opacity-20 rounded-xl backdrop-blur-sm">
                  <p className="text-white text-sm font-medium">
                    Top {Math.round((currentUser.rank / currentUser.total) * 100)}%
                  </p>
                </div>
              </div>

              <p className="text-white text-base opacity-90 mb-6">
                You are ranked <span className="font-bold">#{currentUser.rank}</span> out of{" "}
                <span className="font-bold">{currentUser.total}</span> competitors
              </p>

              <div className="grid grid-cols-3 gap-6">
                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                    </svg>
                    <p className="text-white text-sm opacity-80 font-medium">Username</p>
                  </div>
                  <p className="text-white font-bold text-lg">{currentUser.username}</p>
                </div>

                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <p className="text-white text-sm opacity-80 font-medium">Solved</p>
                  </div>
                  <p className="text-white font-bold text-lg">{currentUser.solved}</p>
                </div>

                <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-2xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <p className="text-white text-sm opacity-80 font-medium">Score</p>
                  </div>
                  <p className="text-white font-bold text-lg">{currentUser.score}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search input */}
        <div className="mb-6 relative">
          <svg 
            className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
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
            placeholder="🔍 Search by username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-14 pr-6 py-4 rounded-2xl border-2 border-indigo-200 bg-white shadow-md focus:ring-4 focus:ring-indigo-200 focus:border-indigo-400 focus:outline-none transition-all duration-200 text-gray-700 font-medium"
          />
        </div>

        {/* Exact searched user info */}
        {searchedUser && (
          <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 to-orange-400 p-6 shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-20 rounded-full -mr-16 -mt-16"></div>
            <div className="relative z-10 flex items-center gap-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
              </svg>
              <div className="text-white">
                <p className="text-sm font-semibold opacity-90 mb-1">Found User</p>
                <p className="text-lg font-bold">
                  Rank #{searchedUser.rank} • {searchedUser.username} • 
                  {searchedUser.solved} solved • {searchedUser.score} points
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard table */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          
          <div className="overflow-x-auto">
            <table className="w-full">

              <thead>
                <tr className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                  <th className="px-6 py-5 text-left font-bold text-sm uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-5 text-left font-bold text-sm uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-5 text-left font-bold text-sm uppercase tracking-wider">
                    Problems Solved
                  </th>
                  <th className="px-6 py-5 text-left font-bold text-sm uppercase tracking-wider">
                    Total Score
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">

                {filteredLeaderboard.map((u) => {

                  const rank =
                    leaderboard.findIndex(
                      (user) => user.username === u.username
                    ) + 1;

                  const isCurrentUser =
                    u.username === currentUsername;

                  const rankBadge = getRankBadge(rank);

                  return (
                   <tr
                 key={u.id}
                 className={`transition-all duration-200 ${
                isCurrentUser ? "bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 hover:from-green-100 hover:to-emerald-100"
                 : "hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50"
                   }`}
                >


                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          {rankBadge ? (
                            <div className={`flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r ${rankBadge.color} rounded-xl shadow-md`}>
                              <span className="text-2xl">{rankBadge.emoji}</span>
                              <span className={`font-bold text-lg ${rankBadge.text}`}>
                                #{rank}
                              </span>
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md">
                              <span className="text-white font-bold text-lg">
                                {rank}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                            {u.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 text-base">
                              {u.username}
                            </p>
                            {isCurrentUser && (
                              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-500 text-white text-xs font-bold rounded-full shadow">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span className="text-green-600 font-bold text-lg">
                            {u.solved}
                          </span>
                          <span className="text-gray-400 text-sm">
                            problems
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                          <span className="text-indigo-600 font-bold text-lg">
                            {u.score}
                          </span>
                          <span className="text-gray-400 text-sm">
                            points
                          </span>
                        </div>
                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

            {filteredLeaderboard.length === 0 && (
              <div className="py-16 text-center">
                <svg className="mx-auto w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500 text-xl font-semibold">No users found</p>
                <p className="text-gray-400 text-sm mt-2">Try a different search term</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default LeaderboardPage;