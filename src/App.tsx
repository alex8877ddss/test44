import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Settings, Home, Sparkles } from 'lucide-react';
import HomePage from './pages/HomePage';
import AdminPanel from './components/AdminPanel';
import AdminAuth from './components/AdminAuth';
import InstallPage from './components/InstallPage';
import InstallationGuard from './components/InstallationGuard';
import { useAuth } from './hooks/useAuth';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <Routes>
          <Route path="/install" element={<InstallPage />} />
          <Route path="/*" element={
            <InstallationGuard>
              <MainApp user={user} />
            </InstallationGuard>
          } />
        </Routes>
      </div>
    </Router>
  );
}

const MainApp: React.FC<{ user: any }> = ({ user }) => {
  return (
    <>
      {/* Navigation */}
      <nav className="bg-gray-800/50 backdrop-blur-xl border-b border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/25">
                <Sparkles className="text-white font-bold text-sm w-4 h-4" />
              </div>
              AirdropHub
            </Link>
            
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white transition-colors"
              >
                <Home className="w-4 h-4" />
                Home
              </Link>
              <Link
                to="/admin"
                className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:text-white transition-colors"
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Routes */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route 
          path="/admin" 
          element={user ? <AdminPanel /> : <AdminAuth />} 
        />
      </Routes>
    </>
  );
};

export default App;