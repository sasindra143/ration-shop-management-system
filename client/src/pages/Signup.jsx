import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function Signup() {
  const [form, setForm] = useState({
    name: '',
    username: '', // email
    password: '',
    shopNumber: '0806015'
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data);
      toast.success('Registration successful! Welcome to the portal.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-950 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-gray-950 to-gray-950 pt-20">
      <div className="card w-full max-w-md relative overflow-hidden">
        <div className="absolute top-0 left-0 p-4 opacity-5 pointer-events-none">
          <svg className="w-48 h-48 text-blue-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 7l10-5-10-5-10 5 10 5z"/></svg>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-2 relative z-10">Join Ration Shop CRM</h2>
        <p className="text-gray-400 mb-8 relative z-10">Create an operator account for Shop #0806015</p>
        
        <form onSubmit={handleSignup} className="space-y-5 relative z-10">
          <div>
            <label className="label">Full Name</label>
            <input 
              type="text" 
              className="input w-full" 
              placeholder="Your Name"
              value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required 
            />
          </div>
          <div>
            <label className="label">Username / Email</label>
            <input 
              type="text" 
              className="input w-full" 
              placeholder="e.g. sasi@example.com"
              value={form.username} onChange={(e) => setForm({...form, username: e.target.value})} required 
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input 
              type="password" 
              className="input w-full" 
              placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required 
            />
          </div>
          
          <button type="submit" disabled={loading} className="btn-primary w-full py-3 mt-4">
            {loading ? 'Creating Account...' : 'Continue to Dashboard'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm relative z-10">
          Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
}
