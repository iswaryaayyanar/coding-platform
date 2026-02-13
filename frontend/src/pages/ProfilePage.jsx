import React, { useEffect, useState } from "react";
import api from "../services/api";

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (!userId) return setLoading(false);

        const res = await api.get(`/profile/${userId}`);
        setProfile(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-xl p-12">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 text-xl font-semibold">Profile not found</p>
        </div>
      </div>
    );
  }

  // ===============================
  // DATA
  // ===============================
  const {
    username,
    created_at,
    stats = {},
    recentActivity = [],
    companyProgress = [],
    heatmap = [],
    achievements = []
  } = profile;

  const {
    solved = 0,
    score = 0,
    streak = 0,
    easy = 0,
    medium = 0,
    hard = 0,
    rank = "-"
  } = stats;

  const total = easy + medium + hard || 1;

  // ===============================
  // HEATMAP HELPER
  // ===============================
  const heatMapDict = {};
  heatmap.forEach(d => (heatMapDict[d.date] = d.count));

  const generateHeatDays = () => {
    const days = [];
    for (let i = 89; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      days.push({ date: key, count: heatMapDict[key] || 0 });
    }
    return days;
  };

  // ===============================
  // UI
  // ===============================
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">

        {/* HEADER CARD */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden mb-8">
          
          {/* Gradient Banner */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 relative">
            <div className="absolute inset-0 bg-white opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 rounded-full -mr-32 -mt-32"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full -ml-24 -mb-24"></div>
            </div>
          </div>

          <div className="px-8 pb-8">
            {/* Avatar and Info */}
            <div className="flex items-end gap-6 mt-16 mb-6">
              <div className="relative">
                <div className="w-32 h-40 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-5xl font-bold shadow-2xl border-4 border-white">
                  {username.charAt(0).toUpperCase()}
                </div>
                {streak > 0 && (
                  <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-orange-400 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg flex items-center gap-1">
                    🔥 {streak}
                  </div>
                )}
              </div>

              <div className="flex-1 pb-4">
                <h2 className="text-4xl font-bold text-gray-800 mb-2">{username}</h2>
                <div className="flex items-center gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                    <span className="font-semibold">Rank #{rank}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                    </svg>
                    <span>Joined {new Date(created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Stat 
                label="Problems Solved" 
                value={solved} 
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                }
                gradient="from-green-400 to-emerald-500"
              />
              <Stat 
                label="Total Score" 
                value={score}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                  </svg>
                }
                gradient="from-indigo-400 to-purple-500"
              />
              <Stat 
                label="Day Streak" 
                value={`${streak} 🔥`}
                icon={
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
                  </svg>
                }
                gradient="from-orange-400 to-red-500"
              />
            </div>
          </div>
        </div>

        {/* TABS AND CONTENT */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          
          {/* TABS */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <div className="flex flex-wrap gap-2 px-8 py-6">
              {[
                { id: "overview", label: "Overview", icon: "📊" },
                { id: "companies", label: "Companies", icon: "🏢" },
                { id: "heatmap", label: "Activity", icon: "📅" },
                { id: "achievements", label: "Achievements", icon: "🏆" },
                { id: "activity", label: "Recent", icon: "⚡" }
              ].map(tab => (
                <button
                  key={tab.id}
                  className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105"
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* CONTENT */}
          <div className="p-8">

            {/* OVERVIEW */}
            {activeTab === "overview" && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Difficulty Progress</h3>
                </div>

                <div className="space-y-6">
                  <Progress 
                    label="Easy" 
                    value={easy} 
                    max={total} 
                    color="from-green-400 to-emerald-500"
                    bgColor="bg-green-100"
                  />
                  <Progress 
                    label="Medium" 
                    value={medium} 
                    max={total}
                    color="from-yellow-400 to-orange-500"
                    bgColor="bg-yellow-100"
                  />
                  <Progress 
                    label="Hard" 
                    value={hard} 
                    max={total}
                    color="from-red-400 to-pink-500"
                    bgColor="bg-red-100"
                  />
                </div>

                {/* Summary Stats */}
                <div className="mt-8 grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                    <div className="text-3xl font-bold text-green-600">{easy}</div>
                    <div className="text-sm text-gray-600 mt-1">Easy Solved</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl border border-yellow-200">
                    <div className="text-3xl font-bold text-yellow-600">{medium}</div>
                    <div className="text-sm text-gray-600 mt-1">Medium Solved</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border border-red-200">
                    <div className="text-3xl font-bold text-red-600">{hard}</div>
                    <div className="text-sm text-gray-600 mt-1">Hard Solved</div>
                  </div>
                </div>
              </div>
            )}

            {/* COMPANY */}
            {activeTab === "companies" && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Company Progress</h3>
                </div>

                {companyProgress.length > 0 ? (
                  <div className="space-y-3">
                    {companyProgress.map((c, i) => (
                      <div 
                        key={i} 
                        className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                            {c.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-gray-800 text-lg group-hover:text-indigo-600 transition-colors">
                            {c.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm">
                          <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                          </svg>
                          <span className="font-bold text-gray-800">{c.solved}</span>
                          <span className="text-gray-500 text-sm">solved</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <p className="text-lg font-medium">No company data yet</p>
                  </div>
                )}
              </div>
            )}

            {/* HEATMAP */}
            {activeTab === "heatmap" && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">90 Day Activity</h3>
                    <p className="text-gray-500 text-sm">Your coding consistency over the past 3 months</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl border border-purple-200">
                  <div className="grid gap-2"style={{ gridTemplateColumns: "repeat(15, minmax(0, 1fr))" }}>
                    {generateHeatDays().map((d, i) => (
                      <div
                        key={i}
                        className="w-4 h-4 rounded-sm transition-all duration-200 hover:scale-125 cursor-pointer"
                        style={{
                          backgroundColor: d.count 
                            ? `rgba(139, 92, 246, ${Math.min(1, d.count / 5)})`
                            : '#e9d5ff',
                          opacity: d.count ? 1 : 0.3
                        }}
                        title={`${d.date}: ${d.count} problems`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <span className="text-sm text-gray-500">Less</span>
                    <div className="flex gap-2">
                      {[0.2, 0.4, 0.6, 0.8, 1].map((opacity, i) => (
                        <div
                          key={i}
                          className="w-4 h-4 rounded-sm"
                          style={{ backgroundColor: `rgba(139, 92, 246, ${opacity})` }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-500">More</span>
                  </div>
                </div>
              </div>
            )}

            {/* ACHIEVEMENTS */}
            {activeTab === "achievements" && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                    <span className="text-2xl">🏆</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Achievements</h3>
                </div>

                {achievements.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {achievements.map((a, i) => (
                      <div
                        key={i}
                        className={`p-6 rounded-2xl border-2 transition-all duration-200 ${
                          a.unlocked
                            ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-md hover:shadow-lg"
                            : "bg-gray-50 border-gray-200 opacity-50"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`text-4xl ${a.unlocked ? "" : "grayscale"}`}>
                            🏆
                          </div>
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-lg mb-1">{a.title}</h4>
                            {a.unlocked ? (
                              <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                                </svg>
                                Unlocked
                              </span>
                            ) : (
                              <span className="text-gray-400 text-sm">🔒 Locked</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <p className="text-lg font-medium">No achievements yet</p>
                  </div>
                )}
              </div>
            )}

            {/* ACTIVITY */}
            {activeTab === "activity" && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Recent Activity</h3>
                </div>

                {recentActivity.length > 0 ? (
                  <div className="space-y-3">
                    {recentActivity.map((item, i) => (
                      <div 
                        key={i}
                        className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-200 group"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                            </svg>
                          </div>
                          <div className="flex-1">
                            <strong className="text-gray-800 text-lg group-hover:text-indigo-600 transition-colors block">
                              {item.title}
                            </strong>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className={`inline-flex px-2 py-1 rounded-lg text-xs font-semibold ${
                                  item.difficulty === "Easy"
                                    ? "bg-green-100 text-green-700"
                                    : item.difficulty === "Medium"
                                    ? "bg-yellow-100 text-yellow-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {item.difficulty}
                              </span>
                              <span className="text-gray-400 text-sm">
                                {new Date(item.solved_at).toLocaleDateString('en-US', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <svg className="w-16 h-16 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-lg font-medium">No recent activity</p>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

// ===============================
// SMALL COMPONENTS
// ===============================

const Stat = ({ label, value, icon, gradient }) => (
  <div className="relative group">
    <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-10 rounded-2xl group-hover:opacity-20 transition-opacity`}></div>
    <div className="relative p-6 bg-white bg-opacity-50 backdrop-blur-sm rounded-2xl border-2 border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-lg">
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${gradient} flex items-center justify-center text-white mb-4 shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-3xl font-bold text-gray-800 mb-2">{value}</h3>
      <p className="text-gray-600 font-medium">{label}</p>
    </div>
  </div>
);

const Progress = ({ label, value, max, color, bgColor }) => {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-gray-800 text-lg">{label}</span>
          <span className={`px-3 py-1 ${bgColor} rounded-lg font-bold text-sm`}>
            {value} problems
          </span>
        </div>
        <span className="text-gray-600 font-semibold text-lg">{percentage}%</span>
      </div>
      <div className={`h-3 ${bgColor} rounded-full overflow-hidden shadow-inner`}>
        <div
          className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500 shadow-lg`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProfilePage;