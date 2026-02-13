import { NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth";

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col p-6 shadow-2xl">
      
      {/* Logo/Brand Section */}
      <div className="mb-10 text-center">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold">{'</>'}</span>
        </div>
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          CodePlatform
        </h2>
        <p className="text-xs text-slate-400 mt-1">Master Your Skills</p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-2">
        <NavLink 
          to="/home" 
          className={({ isActive }) =>
            `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1'
            }`
          }
        >
          <span className="text-lg">🏠</span>
          <span>Home</span>
        </NavLink>

        <NavLink 
          to="/problems" 
          className={({ isActive }) =>
            `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1'
            }`
          }
        >
          <span className="text-lg">💻</span>
          <span>Problems</span>
        </NavLink>

        <NavLink 
          to="/companies" 
          className={({ isActive }) =>
            `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1'
            }`
          }
        >
          <span className="text-lg">🏢</span>
          <span>Companies</span>
        </NavLink>

        <NavLink 
          to="/leaderboard" 
          className={({ isActive }) =>
            `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1'
            }`
          }
        >
          <span className="text-lg">🏆</span>
          <span>Leaderboard</span>
        </NavLink>

        <NavLink 
          to="/profile" 
          className={({ isActive }) =>
            `group flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive 
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/50' 
                : 'text-slate-300 hover:bg-slate-800 hover:text-white hover:translate-x-1'
            }`
          }
        >
          <span className="text-lg">👤</span>
          <span>Profile</span>
        </NavLink>
      </nav>

      <div className="sticky bottom-0 bg-slate-900 pt-4">
    <button
      onClick={handleLogout}
      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/50 hover:scale-105 flex items-center justify-center gap-2"
    >
      <span className="text-lg">🚪</span>
      <span>Logout</span>
    </button>

    {/* Footer */}
    <div className="mt-4 pt-4 border-t border-slate-700 text-center">
      <p className="text-xs text-slate-500">© 2024 CodePlatform</p>
    </div>
  </div>
    </aside>
  );
};

export default Sidebar;