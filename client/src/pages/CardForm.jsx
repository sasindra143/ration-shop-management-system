import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { UserPlus, ArrowLeft, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function CardForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    cardNumber: '',
    headOfFamily: '',
    headOfFamilyTelugu: '',
    address: 'SUNKESULA',
    familyMembers: 1,
    category: 'PHH',
    mduCode: 'PR06006'
  });

  useEffect(() => {
    if (isEdit) {
      api.get(`/users/${id}`).then(({ data }) => {
        setForm(data);
        setLoading(false);
      }).catch(() => {
        toast.error('Card not found');
        navigate('/cards');
      });
    }
  }, [id, navigate, isEdit]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEdit) {
        await api.put(`/users/${id}`, form);
        toast.success('Card updated successfully');
      } else {
        await api.post('/users', form);
        toast.success('Card added successfully');
      }
      navigate('/cards');
    } catch (err) {
      toast.error(err.response?.data?.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-white">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
        <ArrowLeft size={16} /> Back to Cards
      </button>

      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <UserPlus className="text-blue-500" /> {isEdit ? 'Edit Ration Card' : 'Add New Ration Card'}
        </h1>
        <p className="text-gray-400 mt-1">Fill in the details for the head of family.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="label">Card Number *</label>
              <input type="text" className="input" value={form.cardNumber} onChange={e => setForm({...form, cardNumber: e.target.value})} required placeholder="e.g. 2822595811" />
            </div>

            <div>
              <label className="label">Head of Family (English) *</label>
              <input type="text" className="input" value={form.headOfFamily} onChange={e => setForm({...form, headOfFamily: e.target.value})} required placeholder="Name" />
            </div>
            <div>
              <label className="label">Head of Family (Telugu)</label>
              <input type="text" className="input" value={form.headOfFamilyTelugu} onChange={e => setForm({...form, headOfFamilyTelugu: e.target.value})} placeholder="పేరు" />
            </div>

            <div>
              <label className="label">Family Units *</label>
              <input type="number" min="1" className="input" value={form.familyMembers} onChange={e => setForm({...form, familyMembers: e.target.value})} required />
            </div>

            <div>
              <label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                <option value="PHH">PHH</option>
                <option value="APL">APL</option>
                <option value="BPL">BPL</option>
                <option value="Antyodaya">Antyodaya</option>
              </select>
            </div>
            <div>
              <label className="label">MDU Code</label>
              <input type="text" className="input" value={form.mduCode} onChange={e => setForm({...form, mduCode: e.target.value})} />
            </div>

            <div className="md:col-span-2">
              <label className="label">Address</label>
              <textarea className="input" rows="2" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-800 flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex items-center gap-2">
              <Save size={18} /> {submitting ? 'Saving...' : 'Save Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
