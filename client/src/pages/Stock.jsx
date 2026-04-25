import { useState, useEffect } from 'react';
import { Package, Plus, Save, AlertTriangle, RefreshCw, TrendingUp, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

export default function Stock() {
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize with current month and year
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [addForm, setAddForm] = useState({ rice: '', bigSoap: '', smallSoap: '', wheat: '', idli: '', samiya: '', sugar: '', surf: '' });
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { 
    fetchStock(); 
  }, [selectedDate]); // Re-fetch when date changes

  const fetchStock = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [year, month] = selectedDate.split('-');
      const { data } = await api.get(`/stock?month=${month}&year=${year}`);
      setStock(data);
    } catch {
      toast.error('Failed to load stock data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const [year, month] = selectedDate.split('-');
      const payload = {
        month: parseInt(month),
        year: parseInt(year),
        rice: Number(addForm.rice) || 0,
        bigSoap: Number(addForm.bigSoap) || 0,
        smallSoap: Number(addForm.smallSoap) || 0,
        wheat: Number(addForm.wheat) || 0,
        idli: Number(addForm.idli) || 0,
        samiya: Number(addForm.samiya) || 0,
        sugar: Number(addForm.sugar) || 0,
        surf: Number(addForm.surf) || 0,
      };
      const { data } = await api.post('/stock', payload);
      setStock(data);
      setAddForm({ rice: '', bigSoap: '', smallSoap: '', wheat: '', idli: '', samiya: '', sugar: '', surf: '' });
      toast.success('Stock updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setSubmitting(false);
    }
  };

  const items = [
    { key: 'rice',      label: 'Rice',       unit: 'kg',   color: 'white',  threshold: 500, icon: '🍚' },
    { key: 'bigSoap',   label: 'Big Soap',   unit: 'pcs',  color: 'blue',   threshold: 100, icon: '🧼' },
    { key: 'smallSoap', label: 'Small Soap', unit: 'pcs',  color: 'blue',   threshold: 100, icon: '🧼' },
    { key: 'wheat',     label: 'Wheat',      unit: 'kg',   color: 'yellow', threshold: 50,  icon: '🌾' },
    { key: 'idli',      label: 'Idli Rava',  unit: 'kg',   color: 'gray',   threshold: 20,  icon: '🍚' },
    { key: 'samiya',    label: 'Samiya',     unit: 'pkt',  color: 'cyan',   threshold: 20,  icon: '🍜' },
    { key: 'sugar',     label: 'Sugar',      unit: 'kg',   color: 'white',  threshold: 20,  icon: '🧂' },
    { key: 'surf',      label: 'Surf',       unit: 'pkt', color: 'green',  threshold: 50,  icon: '🫧' },
  ];

  const colorMap = {
    white:  { bar: 'bg-gray-100',   text: 'text-gray-100',   bg: 'bg-gray-800/20',   border: 'border-gray-600/40' },
    blue:   { bar: 'bg-blue-500',   text: 'text-blue-400',   bg: 'bg-blue-900/20',   border: 'border-blue-900/40' },
    yellow: { bar: 'bg-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-900/20', border: 'border-yellow-900/40' },
    gray:   { bar: 'bg-gray-400',   text: 'text-gray-300',   bg: 'bg-gray-800/50',   border: 'border-gray-700' },
    cyan:   { bar: 'bg-cyan-500',   text: 'text-cyan-400',   bg: 'bg-cyan-900/20',   border: 'border-cyan-900/40' },
    green:  { bar: 'bg-green-500',  text: 'text-green-400',  bg: 'bg-green-900/20',  border: 'border-green-900/40' },
  };

  const formatMonthYear = (dateString) => {
    const [y, m] = dateString.split('-');
    const date = new Date(y, m - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Package className="text-blue-500 shrink-0" /> Stock Management
          </h1>
          <p className="text-gray-400 mt-1 text-sm">View and update stock for {formatMonthYear(selectedDate)}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Month/Year Picker */}
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-32">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar size={16} className="text-gray-400" />
              </div>
              <select
                className="input pl-10 w-full appearance-none"
                value={parseInt(selectedDate.split('-')[1], 10)}
                onChange={(e) => {
                  const y = selectedDate.split('-')[0];
                  setSelectedDate(`${y}-${String(e.target.value).padStart(2, '0')}`);
                }}
              >
                {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="relative flex-1 sm:w-28">
              <select
                className="input w-full appearance-none"
                value={selectedDate.split('-')[0]}
                onChange={(e) => {
                  const m = selectedDate.split('-')[1];
                  setSelectedDate(`${e.target.value}-${m}`);
                }}
              >
                {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={() => fetchStock(true)}
            disabled={refreshing}
            className="btn-secondary flex items-center justify-center gap-2 text-sm py-2 w-full sm:w-auto"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Current Stock Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map(({ key, label, unit, color, threshold, icon }) => {
          const val = stock?.[key] ?? 0;
          const pct = Math.min(100, (val / (threshold * 3)) * 100);
          const isLow = val < threshold;
          const c = colorMap[color];
          return (
            <div key={key} className={`card !p-4 ${isLow ? 'border-red-800 bg-red-900/10' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xl">{icon}</span>
                {isLow && <AlertTriangle size={15} className="text-red-400" />}
              </div>
              <p className="text-gray-400 text-xs mb-1">{label}</p>
              <p className={`text-2xl font-bold ${isLow ? 'text-red-400' : 'text-white'}`}>
                {val}
                <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
              </p>
              {/* Progress bar */}
              <div className="h-1.5 rounded-full bg-gray-700 mt-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${isLow ? 'bg-red-500' : c.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              {isLow && (
                <p className="text-xs text-red-400 mt-1.5">⚠ Low Stock</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Stock Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <Plus size={18} className="text-green-500" /> Add Receipts ({formatMonthYear(selectedDate)})
          </h2>
          <form onSubmit={handleAddStock} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {items.map(({ key, label, unit }) => (
                <div key={key}>
                  <label className="label">{label} ({unit})</label>
                  <input
                    type="number" min="0" step="0.1"
                    className="input"
                    value={addForm[key]}
                    onChange={e => setAddForm({ ...addForm, [key]: e.target.value })}
                    placeholder="0"
                    inputMode="decimal"
                  />
                </div>
              ))}
            </div>
            <button type="submit" disabled={submitting} className="btn-success w-full flex items-center justify-center gap-2 py-3 mt-2">
              <Save size={18} /> {submitting ? 'Updating...' : 'Update Inventory'}
            </button>
          </form>
        </div>

        {/* Stock Info Panel */}
        <div className="card">
          <h2 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-400" /> Stock Summary
          </h2>
          <div className="space-y-3">
            {items.map(({ key, label, unit, threshold }) => {
              const val = stock?.[key] ?? 0;
              const isLow = val < threshold;
              return (
                <div key={key} className={`flex items-center justify-between p-3 rounded-xl ${isLow ? 'bg-red-900/20 border border-red-900/40' : 'bg-gray-800/50 border border-gray-800'}`}>
                  <span className="text-gray-300 text-sm font-medium">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className={`font-bold ${isLow ? 'text-red-400' : 'text-white'}`}>
                      {val} <span className="text-xs font-normal text-gray-500">{unit}</span>
                    </span>
                    {isLow && (
                      <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle size={10} /> Low
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {stock?.lastUpdated && (
            <p className="text-xs text-gray-600 mt-4 text-center">
              Last updated: {new Date(stock.lastUpdated).toLocaleString('en-IN')}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
