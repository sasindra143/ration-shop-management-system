import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const [cardsRes, txRes] = await Promise.all([
        api.get(`/users?search=${query}&limit=5`),
        api.get(`/transactions?cardNumber=${query}&limit=5`)
      ]);
      setResults({ cards: cardsRes.data.cards, transactions: txRes.data.transactions || txRes.data });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center py-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-4">
          Global Search
        </h1>
        <p className="text-gray-400">Search across ration cards and distribution history</p>
      </div>

      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-12">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={24} />
        <input
          type="text"
          className="w-full bg-gray-900 border-2 border-gray-800 focus:border-blue-600 rounded-2xl pl-14 pr-32 py-4 text-lg text-white placeholder-gray-500 shadow-2xl transition-all"
          placeholder="Search by card number or name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" disabled={loading} className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 rounded-xl transition-colors">
          {loading ? '...' : 'Search'}
        </button>
      </form>

      {results && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Card Results */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Ration Cards Found ({results.cards.length})</h3>
            {results.cards.length > 0 ? (
              <div className="grid gap-4">
                {results.cards.map(card => (
                  <div key={card._id} className="card flex items-center justify-between hover:border-blue-800 transition-colors">
                    <div>
                      <p className="font-bold text-white text-lg">{card.headOfFamily}</p>
                      <p className="text-gray-400 font-mono">{card.cardNumber} • {card.familyMembers} Units</p>
                    </div>
                    <Link to="/distribution" state={{ cardNumber: card.cardNumber }} className="btn-secondary text-sm">
                      Distribute
                    </Link>
                  </div>
                ))}
              </div>
            ) : <p className="text-gray-500">No cards matched your query.</p>}
          </div>

          {/* Transaction Results */}
          <div>
            <h3 className="text-lg font-bold text-white mb-4 border-b border-gray-800 pb-2">Recent Distributions for '{query}'</h3>
            {results.transactions.length > 0 ? (
              <div className="table-wrap">
                <table className="table">
                  <thead>
                    <tr><th>Date</th><th>Month/Year</th><th>Items</th></tr>
                  </thead>
                  <tbody>
                    {results.transactions.map(tx => (
                      <tr key={tx._id}>
                        <td>{new Date(tx.date).toLocaleDateString()}</td>
                        <td>{tx.month}/{tx.year}</td>
                        <td className="text-gray-400">R:{tx.rice} W:{tx.wheat} S:{tx.sugar} K:{tx.kerosene} D:{tx.dall}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-gray-500">No transactions matched your query.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
