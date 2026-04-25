import { useState, useEffect } from 'react';
import { Users, Truck, Package, AlertCircle, ShoppingBag, BarChart2, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import api from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pendingSearch, setPendingSearch] = useState('');
  const [receivedSearch, setReceivedSearch] = useState('');

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const [year, month] = selectedDate.split('-');
        const { data } = await api.get(`/reports/dashboard?month=${month}&year=${year}`);
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [selectedDate]);

  if (loading && !stats) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-gray-800 rounded w-3/4"></div></div></div>;
  if (!stats) return null;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const barData = {
    labels: [...stats.last6Months].reverse().map(d => `${monthNames[d._id.month - 1]} ${d._id.year}`),
    datasets: [{
      label: 'Families Served',
      data: [...stats.last6Months].reverse().map(d => d.count),
      backgroundColor: '#3b82f6',
      borderRadius: 6,
    }]
  };

  const doughnutData = {
    labels: ['Completed', 'Pending'],
    datasets: [{
      data: [stats.monthlyDistributions, stats.pendingCards],
      backgroundColor: ['#10b981', '#ef4444'],
      borderWidth: 0,
      cutout: '75%',
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: '#9ca3af' } } },
    scales: {
      x: { grid: { color: '#374151', display: false }, ticks: { color: '#9ca3af' } },
      y: { grid: { color: '#374151' }, ticks: { color: '#9ca3af' } }
    }
  };

  const formatMonthYear = (dateString) => {
    const [y, m] = dateString.split('-');
    const date = new Date(y, m - 1);
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-gray-400 mt-1">Sunkesula Village • Shop #0806015</p>
        </div>
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
              {monthNames.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
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
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="p-3 bg-blue-900/40 text-blue-500 rounded-xl"><Users size={24} /></div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Total Ration Cards</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.totalCards}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="p-3 bg-green-900/40 text-green-500 rounded-xl"><Truck size={24} /></div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Distributed Today</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.todayDistributions}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="p-3 bg-purple-900/40 text-purple-500 rounded-xl"><ShoppingBag size={24} /></div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Served ({formatMonthYear(selectedDate)})</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.monthlyDistributions}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="p-3 bg-red-900/40 text-red-500 rounded-xl"><AlertCircle size={24} /></div>
          <div>
            <p className="text-gray-400 text-sm font-medium">Pending ({formatMonthYear(selectedDate)})</p>
            <p className="text-3xl font-bold text-white mt-1">{stats.pendingCards}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <BarChart2 size={20} className="text-blue-500"/> Distribution Trends (Last 6 Months)
          </h3>
          <div className="h-72">
            {stats.last6Months.length > 0 ? (
              <Bar data={barData} options={chartOptions} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No data available yet</div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-6">Completion ({formatMonthYear(selectedDate)})</h3>
          <div className="h-56 relative">
             <Doughnut 
               data={doughnutData} 
               options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', padding: 20 } } } }} 
             />
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none -mt-8">
                <span className="text-2xl font-bold text-white">
                  {stats.totalCards > 0 ? Math.round((stats.monthlyDistributions / stats.totalCards) * 100) : 0}%
                </span>
             </div>
          </div>
        </div>
      </div>
      
      {/* Monthly commodity totals */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Commodities Distributed ({formatMonthYear(selectedDate)})</h3>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
            <p className="text-gray-400 text-sm">Rice</p>
            <p className="text-xl font-bold text-white">{stats.monthlyTotals?.rice || 0} kg</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
            <p className="text-gray-400 text-sm">Soaps</p>
            <p className="text-xl font-bold text-white">{stats.monthlyTotals?.soaps || 0} pcs</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
            <p className="text-gray-400 text-sm">Wheat</p>
            <p className="text-xl font-bold text-white">{stats.monthlyTotals?.wheat || 0} kg</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
            <p className="text-gray-400 text-sm">Idli Rava</p>
            <p className="text-xl font-bold text-white">{stats.monthlyTotals?.idli || 0} kg</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
            <p className="text-gray-400 text-sm">Samiya</p>
            <p className="text-xl font-bold text-white">{stats.monthlyTotals?.samiya || 0} kg</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center border border-gray-700">
            <p className="text-gray-400 text-sm">Surf</p>
            <p className="text-xl font-bold text-white">{stats.monthlyTotals?.surf || 0} pkts</p>
          </div>
        </div>
      </div>

      {/* Pending & Received Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card flex flex-col h-[600px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Clock size={20} className="text-red-400" /> Pending Cards ({stats.pendingList?.length || 0})
            </h3>
            <div className="relative w-full sm:w-48">
              <input
                type="text"
                placeholder="Search pending..."
                className="input text-sm py-1.5 pl-8 w-full"
                value={pendingSearch}
                onChange={(e) => setPendingSearch(e.target.value)}
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 pr-2 space-y-2 custom-scrollbar">
            {stats.pendingList?.length > 0 ? (
              stats.pendingList
                .filter(c => c.cardNumber.includes(pendingSearch) || c.headOfFamily.toLowerCase().includes(pendingSearch.toLowerCase()))
                .map((card, idx) => (
                <div key={idx} className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-center border border-gray-700">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500 font-mono w-8">{card.serialNumber || '-'}</span>
                    <div>
                      <p className="text-white font-medium text-sm">{card.headOfFamily}</p>
                      <p className="text-gray-500 text-xs font-mono">{card.cardNumber}</p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-red-900/50 text-red-400 px-2 py-1 rounded-md font-medium uppercase tracking-wider">Pending</span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                 <CheckCircle size={32} className="text-green-500 mb-2 opacity-50" />
                 <p>All cards served!</p>
              </div>
            )}
            {stats.pendingList?.filter(c => c.cardNumber.includes(pendingSearch) || c.headOfFamily.toLowerCase().includes(pendingSearch.toLowerCase())).length === 0 && stats.pendingList?.length > 0 && (
               <p className="text-center text-gray-500 text-sm mt-4">No matching pending cards found.</p>
            )}
          </div>
        </div>

        <div className="card flex flex-col h-[600px]">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckCircle size={20} className="text-green-400" /> Received Cards ({stats.receivedList?.length || 0})
            </h3>
            <div className="relative w-full sm:w-48">
              <input
                type="text"
                placeholder="Search received..."
                className="input text-sm py-1.5 pl-8 w-full"
                value={receivedSearch}
                onChange={(e) => setReceivedSearch(e.target.value)}
              />
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>
          </div>
          <div className="overflow-y-auto flex-1 pr-2 space-y-2 custom-scrollbar">
            {stats.receivedList?.length > 0 ? (
              stats.receivedList
                .filter(t => t.cardNumber.includes(receivedSearch) || t.headOfFamily.toLowerCase().includes(receivedSearch.toLowerCase()))
                .map((tx, idx) => (
                <div key={idx} className="bg-gray-800/50 rounded-lg p-3 flex justify-between items-center border border-gray-700">
                  <div>
                    <p className="text-white font-medium text-sm">{tx.headOfFamily}</p>
                    <p className="text-gray-500 text-xs font-mono">{tx.cardNumber}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] bg-green-900/50 text-green-400 px-2 py-1 rounded-md mb-1 inline-block font-medium uppercase tracking-wider">Received</span>
                    <p className="text-gray-500 text-[10px]">{new Date(tx.date).toLocaleDateString('en-IN', {day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit'})}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                 <Clock size={32} className="mb-2 opacity-50" />
                 <p>No distributions yet.</p>
              </div>
            )}
             {stats.receivedList?.filter(t => t.cardNumber.includes(receivedSearch) || t.headOfFamily.toLowerCase().includes(receivedSearch.toLowerCase())).length === 0 && stats.receivedList?.length > 0 && (
               <p className="text-center text-gray-500 text-sm mt-4">No matching received cards found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
