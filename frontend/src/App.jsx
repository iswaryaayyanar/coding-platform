import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Homepage from "./pages/HomePage";
import ProblemsPage from "./pages/ProblemsPage";
import CompaniesPage from "./pages/CompaniesPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProfilePage from "./pages/ProfilePage";
import ProblemDetails from "./pages/ProblemDetails";
import ProtectedLayout from "./components/layout/ProtectedLayout";
import useAuth from "./hooks/useAuth";

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/home" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/home" />} />

      {/* Protected */}
      <Route element={user ? <ProtectedLayout /> : <Navigate to="/login" />}>
        <Route path="/home" element={<Homepage />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/problems/:problemId" element={<ProblemDetails />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>

      {/* Default */}
      <Route path="*" element={<Navigate to="/home" />} />
    </Routes>
  );
}

export default App;
