import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Sidebar from './components/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import RationCards from './pages/RationCards';
import CardForm from './pages/CardForm';
import Distribution from './pages/Distribution';
import Stock from './pages/Stock';
import Reports from './pages/Reports';
import Search from './pages/Search';

function Layout({ children }) {
  return (
    <div className="flex bg-gray-950 min-h-screen">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 md:p-8 overflow-y-auto mt-14 lg:mt-0">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1f2937', color: '#f3f4f6', border: '1px solid #374151' }
        }}/>
        <Router>
          <Routes>
            {/* Redirect old auth routes to home */}
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/signup" element={<Navigate to="/" replace />} />

            {/* Direct CRM access — no login required */}
            <Route path="/" element={<Layout><Dashboard /></Layout>} />

            <Route path="/cards" element={<Layout><RationCards /></Layout>} />
            <Route path="/cards/new" element={<Layout><CardForm /></Layout>} />
            <Route path="/cards/:id/edit" element={<Layout><CardForm /></Layout>} />

            <Route path="/distribution" element={<Layout><Distribution /></Layout>} />
            <Route path="/stock" element={<Layout><Stock /></Layout>} />
            <Route path="/reports" element={<Layout><Reports /></Layout>} />
            <Route path="/search" element={<Layout><Search /></Layout>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
