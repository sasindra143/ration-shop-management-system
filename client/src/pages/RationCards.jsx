import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Users, Search, Plus, Edit, Trash2, ChevronLeft, ChevronRight, Filter, Calendar, Camera, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function RationCards() {
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const LIMIT = 20;

  // Quick distribution modal state
  const [selectedCard, setSelectedCard] = useState(null);
  const [quickPhoto, setQuickPhoto] = useState(null);
  const [quickPhotoBase64, setQuickPhotoBase64] = useState('');

  useEffect(() => {
    fetchCards();
  }, [page, search, status, selectedDate]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const [year, month] = selectedDate.split('-');
      const { data } = await api.get(`/users?page=${page}&limit=${LIMIT}&search=${search}&status=${status}&month=${month}&year=${year}`);
      setCards(data.cards);
      setTotalPages(data.pages);
      setTotalCount(data.total);
    } catch (err) {
      toast.error('Failed to fetch ration cards');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this card?')) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success('Card deactivated');
      fetchCards();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleQuickPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { toast.error('Photo too large. Max 3MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setQuickPhoto(reader.result); setQuickPhotoBase64(reader.result); };
    reader.readAsDataURL(file);
  };

  const formatMonthYear = (ds) => {
    const [y, m] = ds.split('-');
    return new Date(y, m - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const StatusBadge = ({ s }) => {
    const cls = { all: 'bg-gray-700 text-gray-300', pending: 'bg-red-900/60 text-red-300', received: 'bg-green-900/60 text-green-300' };
    return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${cls[s]}`}>{s.charAt(0).toUpperCase() + s.slice(1)}</span>;
  };

  return (
    <div className="space-y-4 pb-20 lg:pb-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <Users className="text-blue-500 shrink-0" size={26} /> Ration Cards
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {totalCount} {status === 'all' ? 'total' : status} cards · {formatMonthYear(selectedDate)}
          </p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/cards/new" className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
            <Plus size={16} /> Add Card
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card !p-3 flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
          <input
            type="text"
            className="input pl-10 w-full"
            placeholder="Search card number or name..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        {/* Month + Year + Status */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              className="input pl-8 w-full appearance-none text-sm"
              value={parseInt(selectedDate.split('-')[1], 10)}
              onChange={(e) => { setSelectedDate(`${selectedDate.split('-')[0]}-${String(e.target.value).padStart(2,'0')}`); setPage(1); }}
            >
              {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
            </select>
          </div>
          <div className="relative w-24">
            <select
              className="input w-full appearance-none text-sm px-2"
              value={selectedDate.split('-')[0]}
              onChange={(e) => { setSelectedDate(`${e.target.value}-${selectedDate.split('-')[1]}`); setPage(1); }}
            >
              {[2024,2025,2026,2027,2028,2029,2030].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="relative flex-1">
            <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <select
              className="input pl-8 w-full appearance-none text-sm"
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="received">Received</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="space-y-2 lg:hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-500">Loading...</div>
        ) : cards.length === 0 ? (
          <div className="text-center py-10 text-gray-500 card">No records found.</div>
        ) : (
          cards.map((card, idx) => (
            <div key={card._id} className="card !p-3 flex items-start gap-3">
              {/* Serial number badge */}
              <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-900/40 border border-blue-800/50 flex items-center justify-center">
                <span className="text-blue-300 text-xs font-bold">{card.serialNumber || ((page-1)*LIMIT + idx + 1)}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-sm truncate">{card.headOfFamily}</p>
                    <p className="text-blue-400/80 text-xs truncate">{card.headOfFamilyTelugu}</p>
                    <p className="text-gray-500 text-xs font-mono mt-0.5">{card.cardNumber}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`badge-${card.category?.toLowerCase() || 'phh'} text-xs`}>{card.category}</span>
                    <span className="text-xs text-gray-400">{card.familyMembers} members</span>
                  </div>
                </div>
                {/* Actions */}
                <div className="flex gap-2 mt-2">
                  {status !== 'received' && (
                    <Link
                      to="/distribution"
                      state={{ cardNumber: card.cardNumber }}
                      className="flex-1 bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 text-xs text-center py-1.5 rounded-lg border border-blue-800/50 transition-colors font-medium"
                    >
                      Enter Distribution
                    </Link>
                  )}
                  {/* Camera capture */}
                  <label
                    className="flex items-center gap-1 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-xs rounded-lg border border-gray-700 cursor-pointer transition-colors"
                    htmlFor={`cam-${card._id}`}
                  >
                    <Camera size={12} /> Photo
                  </label>
                  <input
                    id={`cam-${card._id}`}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      setSelectedCard(card);
                      handleQuickPhoto(e);
                    }}
                  />
                  {user?.role === 'admin' && (
                    <button onClick={() => handleDelete(card._id)} className="p-1.5 text-gray-600 hover:text-red-500 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th className="w-12">S.No</th>
                <th>Card Number</th>
                <th>Head of Family</th>
                <th className="w-20 text-center">Members</th>
                <th className="w-20">Category</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-10 text-gray-500">Loading...</td></tr>
              ) : cards.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-10 text-gray-500">No records found.</td></tr>
              ) : (
                cards.map((card, idx) => (
                  <tr key={card._id} className="hover:bg-gray-800/40 transition-colors">
                    <td className="text-gray-500 text-xs font-mono text-center">
                      {card.serialNumber || ((page-1)*LIMIT + idx + 1)}
                    </td>
                    <td className="font-mono text-sm font-medium text-white">{card.cardNumber}</td>
                    <td>
                      <div className="text-white font-medium">{card.headOfFamily}</div>
                      <div className="text-xs text-blue-400/70">{card.headOfFamilyTelugu}</div>
                    </td>
                    <td className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-900/40 text-blue-300 font-bold text-sm border border-blue-800/50">
                        {card.familyMembers}
                      </span>
                    </td>
                    <td><span className={`badge-${card.category?.toLowerCase() || 'phh'}`}>{card.category}</span></td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {status !== 'received' && (
                          <Link to="/distribution" state={{ cardNumber: card.cardNumber }} className="text-blue-400 hover:text-blue-300 text-xs font-medium">
                            Distribute
                          </Link>
                        )}
                        <label htmlFor={`cam-desk-${card._id}`} className="text-gray-400 hover:text-white cursor-pointer transition-colors" title="Take Photo">
                          <Camera size={15} />
                        </label>
                        <input id={`cam-desk-${card._id}`} type="file" accept="image/*" capture="environment" className="hidden"
                          onChange={(e) => { setSelectedCard(card); handleQuickPhoto(e); }} />
                        {user?.role === 'admin' && (
                          <>
                            <Link to={`/cards/${card._id}/edit`} className="text-gray-400 hover:text-white">
                              <Edit size={15} />
                            </Link>
                            <button onClick={() => handleDelete(card._id)} className="text-gray-400 hover:text-red-500">
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="p-4 bg-gray-900 flex items-center justify-between border-t border-gray-800">
          <span className="text-sm text-gray-500">Page {page} of {totalPages || 1} · {totalCount} total</span>
          <div className="flex gap-2">
            <button disabled={page === 1 || loading} onClick={() => setPage(p => p-1)}
              className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 disabled:opacity-30">
              <ChevronLeft size={16} />
            </button>
            <button disabled={page === totalPages || totalPages === 0 || loading} onClick={() => setPage(p => p+1)}
              className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 disabled:opacity-30">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Pagination */}
      <div className="flex items-center justify-between lg:hidden px-1">
        <span className="text-xs text-gray-500">Page {page}/{totalPages || 1}</span>
        <div className="flex gap-2">
          <button disabled={page === 1 || loading} onClick={() => setPage(p => p-1)}
            className="px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 disabled:opacity-30 text-sm">
            ← Prev
          </button>
          <button disabled={page === totalPages || totalPages === 0 || loading} onClick={() => setPage(p => p+1)}
            className="px-3 py-1.5 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 disabled:opacity-30 text-sm">
            Next →
          </button>
        </div>
      </div>

      {/* Quick Photo Preview Modal */}
      {quickPhoto && selectedCard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 w-full max-w-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-sm">Photo Captured</h3>
              <button onClick={() => { setQuickPhoto(null); setSelectedCard(null); }} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <img src={quickPhoto} alt="Captured" className="w-full h-48 object-cover rounded-xl border border-gray-700 mb-3" />
            <p className="text-gray-400 text-xs mb-3">
              Card: <span className="text-white">{selectedCard.headOfFamily}</span> ({selectedCard.cardNumber})
            </p>
            <div className="flex gap-2">
              <Link
                to="/distribution"
                state={{ cardNumber: selectedCard.cardNumber, photo: quickPhoto }}
                className="flex-1 btn-primary text-center text-sm py-2"
                onClick={() => { setQuickPhoto(null); setSelectedCard(null); }}
              >
                Continue to Distribution
              </Link>
              <button onClick={() => { setQuickPhoto(null); setSelectedCard(null); }}
                className="flex-1 btn-secondary text-sm py-2">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
