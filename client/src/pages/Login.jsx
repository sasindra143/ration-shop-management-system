import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { username, password });
      login(data);
      toast.success('Login successful!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-950 to-gray-950">
      <div className="card w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <svg className="w-48 h-48 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 7l10-5-10-5-10 5 10 5z"/></svg>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Government Ration Shop</h2>
        <p className="text-gray-400 mb-8 relative z-10">Sign in to the distribution portal - Shop #0806015</p>
        
        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <label className="label">Username</label>
            <input 
              type="text" 
              className="input w-full" 
              placeholder="e.g. admin"
              value={username} onChange={(e) => setUsername(e.target.value)} required 
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input 
              type="password" 
              className="input w-full" 
              placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required 
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-4 relative overflow-hidden group">
            <span className="relative z-10">{loading ? 'Authenticating...' : 'Sign In'}</span>
            <div className="absolute inset-0 h-full w-0 bg-white/20 transition-[width] group-hover:w-full ease-out duration-300"></div>
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm relative z-10">
          New here? <Link to="/signup" className="text-blue-500 hover:underline">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
