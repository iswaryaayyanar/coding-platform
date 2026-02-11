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

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 px-6 py-10">

      {/* Title */}
      <h1 className="text-4xl font-bold text-indigo-700 mb-6">
        🏆 Leaderboard
      </h1>

      {/* Current User Rank Card */}
      {currentUser && (
        <div className="w-full mb-6 p-6 rounded-2xl bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg">

          <p className="text-sm opacity-90">Your Position</p>

          <p className="text-3xl font-bold">
            Rank #{currentUser.rank}
          </p>

          <p className="text-sm opacity-90 mb-3">
            You are ranked #{currentUser.rank} out of {currentUser.total} users
          </p>

          <div className="flex gap-6 flex-wrap">

            <div>
              <p className="text-sm opacity-80">Username</p>
              <p className="font-semibold">{currentUser.username}</p>
            </div>

            <div>
              <p className="text-sm opacity-80">Solved</p>
              <p className="font-semibold">{currentUser.solved}</p>
            </div>

            <div>
              <p className="text-sm opacity-80">Score</p>
              <p className="font-semibold">{currentUser.score}</p>
            </div>

          </div>

        </div>
      )}

      {/* Search input */}
      <input
        type="text"
        placeholder="Search by username only..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-4 px-4 py-3 rounded-xl border border-indigo-200 shadow-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none"
      />

      {/* Exact searched user info */}
      {searchedUser && (
        <div className="mb-4 p-4 bg-yellow-400 text-white rounded-xl shadow">
          Found: Rank #{searchedUser.rank} | {searchedUser.username} |
          Solved: {searchedUser.solved} | Score: {searchedUser.score}
        </div>
      )}

      {/* Leaderboard table */}
      <div className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">

        <table className="w-full">

          <thead className="bg-gradient-to-r from-indigo-200 to-blue-200">
            <tr>
              <th className="px-6 py-4 text-left">Rank</th>
              <th className="px-6 py-4 text-left">Username</th>
              <th className="px-6 py-4 text-left">Solved</th>
              <th className="px-6 py-4 text-left">Score</th>
            </tr>
          </thead>

          <tbody>

            {filteredLeaderboard.map((u) => {

              const rank =
                leaderboard.findIndex(
                  (user) => user.username === u.username
                ) + 1;

              const isCurrentUser =
                u.username === currentUsername;

              return (
                <tr
                  key={u.id}
                  className={`border-t hover:bg-indigo-50 ${
                    isCurrentUser
                      ? "bg-green-100 border-l-4 border-green-500"
                      : ""
                  }`}
                >

                  <td className="px-6 py-4 font-bold">
                    #{rank}
                  </td>

                  <td className="px-6 py-4">
                    {u.username}
                    {isCurrentUser && (
                      <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">
                        You
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-green-600 font-semibold">
                    {u.solved}
                  </td>

                  <td className="px-6 py-4 text-blue-600 font-semibold">
                    {u.score}
                  </td>

                </tr>
              );
            })}

          </tbody>

        </table>

      </div>

    </div>
  );
};

export default LeaderboardPage;