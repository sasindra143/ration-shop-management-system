import { useState } from 'react';
import { FileText, Download, Calendar, X, Image } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function Reports() {
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const [monthVal, setMonthVal] = useState(defaultMonth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);

  const parsedMonth = monthVal ? parseInt(monthVal.split('-')[1]) : now.getMonth() + 1;
  const parsedYear  = monthVal ? parseInt(monthVal.split('-')[0]) : now.getFullYear();

  const MONTHS = ['','January','February','March','April','May','June','July','August','September','October','November','December'];

  const fetchReport = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setData(null);
    try {
      const [detailRes, sumRes] = await Promise.all([
        api.get(`/reports/monthly-detail?month=${parsedMonth}&year=${parsedYear}`),
        api.get(`/reports/monthly?month=${parsedMonth}&year=${parsedYear}`),
      ]);
      setData({ details: detailRes.data, summary: sumRes.data[0] || null });
      if (detailRes.data.length === 0) toast.error('No distribution records found for this month');
    } catch {
      toast.error('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = () => {
    if (!data?.details?.length) return;
    const doc = new jsPDF('landscape');
    const monthName = MONTHS[parsedMonth];
    doc.setFontSize(18);
    doc.text('Government Ration Shop - Distribution Report', 14, 18);
    doc.setFontSize(11);
    doc.text(`Shop: 0806015 | Village: Sunkesula | Period: ${monthName} ${parsedYear}`, 14, 28);
    doc.text(`Total Families Served: ${data.summary?.totalCards || 0}`, 14, 36);

    const tableColumn = ['Date', 'Card No', 'Head of Family', 'Units', 'Rice(kg)', 'Soaps(pcs)', 'Wheat(kg)', 'Idli(kg)', 'Samiya(kg)', 'Surf(pkts)', 'Receiver'];
    const tableRows = data.details.map(t => [
      new Date(t.date).toLocaleDateString('en-IN'),
      t.cardNumber,
      t.headOfFamily,
      t.familyMembers,
      t.rice || 0,
      t.soaps || 0,
      t.wheat || 0,
      t.idli || 0,
      t.samiya || 0,
      t.surf || 0,
      t.receiverName || '-',
    ]);
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 42,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [37, 99, 235] },
    });

    const fy = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.text('Monthly Totals:', 14, fy);
    doc.text(`Rice: ${data.summary?.totalRice || 0} kg`, 14, fy + 8);
    doc.text(`Soaps: ${data.summary?.totalSoaps || 0} pcs`, 60, fy + 8);
    doc.text(`Wheat: ${data.summary?.totalWheat || 0} kg`, 105, fy + 8);
    doc.text(`Idli: ${data.summary?.totalIdli || 0} kg`, 145, fy + 8);
    doc.text(`Samiya: ${data.summary?.totalSamiya || 0} kg`, 190, fy + 8);
    doc.text(`Surf: ${data.summary?.totalSurf || 0} pkts`, 235, fy + 8);
    doc.save(`Ration_Report_${monthName}_${parsedYear}.pdf`);
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3 mb-1">
          <FileText className="text-blue-500 shrink-0" /> Monthly Reports
        </h1>
        <p className="text-gray-400 text-sm">Generate and download monthly distribution logs.</p>
      </div>

      {/* Filter Card */}
      <div className="card">
        <form onSubmit={fetchReport} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex gap-2 flex-1 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-32">
              <label className="label flex items-center gap-2">
                <Calendar size={14} /> Month
              </label>
              <select
                className="input w-full appearance-none px-3"
                value={parseInt(monthVal.split('-')[1], 10)}
                onChange={(e) => {
                  const y = monthVal.split('-')[0];
                  setMonthVal(`${y}-${String(e.target.value).padStart(2, '0')}`);
                }}
              >
                {MONTHS.slice(1).map((m, i) => (
                  <option key={i} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div className="relative flex-1 sm:w-28">
              <label className="label">Year</label>
              <select
                className="input w-full appearance-none px-3"
                value={monthVal.split('-')[0]}
                onChange={(e) => {
                  const m = monthVal.split('-')[1];
                  setMonthVal(`${e.target.value}-${m}`);
                }}
              >
                {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary flex items-center gap-2 w-full sm:w-auto py-2 px-6"
          >
            {loading ? 'Loading...' : 'View Report'}
          </button>
        </form>
      </div>

      {/* Report Results */}
      {data?.details && data.details.length > 0 && (
        <div className="space-y-5">
          {/* Period Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-white">
              {MONTHS[parsedMonth]} {parsedYear} — Distribution Report
            </h2>
            <button onClick={generatePDF} className="btn-success flex items-center gap-2 w-full sm:w-auto justify-center">
              <Download size={18} /> Download PDF
            </button>
          </div>

          {/* Summary Stats */}
          {data.summary && (
            <div className="grid grid-cols-3 sm:grid-cols-7 gap-3">
              {[
                { label: 'Families', value: data.summary.totalCards, unit: '' },
                { label: 'Rice', value: data.summary.totalRice, unit: 'kg' },
                { label: 'Soaps', value: data.summary.totalSoaps, unit: 'pcs' },
                { label: 'Wheat', value: data.summary.totalWheat, unit: 'kg' },
                { label: 'Idli Rava', value: data.summary.totalIdli, unit: 'kg' },
                { label: 'Samiya', value: data.summary.totalSamiya, unit: 'kg' },
                { label: 'Surf', value: data.summary.totalSurf, unit: 'pkts' },
              ].map(({ label, value, unit }) => (
                <div key={label} className="bg-gray-800 rounded-xl p-3 border border-gray-700">
                  <span className="block text-xs text-gray-400 mb-1">{label}</span>
                  <span className="text-lg font-bold text-white">{value ?? 0}
                    {unit && <span className="text-xs font-normal text-gray-500 ml-1">{unit}</span>}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Table — scrollable on mobile */}
          <div className="table-wrap">
            <table className="table min-w-[600px]">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Card No</th>
                  <th>Head of Family</th>
                  <th>Units</th>
                  <th>Items Distributed</th>
                  <th>Receiver</th>
                  <th>Photo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data.details.map(t => (
                  <tr key={t._id}>
                    <td className="whitespace-nowrap text-xs">
                      {new Date(t.date).toLocaleDateString('en-IN')}
                    </td>
                    <td className="font-mono text-xs">{t.cardNumber}</td>
                    <td className="font-medium text-white text-sm">{t.headOfFamily}</td>
                    <td className="text-center">{t.familyMembers}</td>
                    <td className="text-xs text-gray-400 space-x-1">
                      {t.rice > 0 && <span className="text-white">R:{t.rice}</span>}
                      {t.soaps > 0 && <span className="text-blue-400">So:{t.soaps}</span>}
                      {t.wheat > 0 && <span className="text-yellow-400">W:{t.wheat}</span>}
                      {t.idli > 0 && <span className="text-gray-300">I:{t.idli}</span>}
                      {t.samiya > 0 && <span className="text-cyan-400">Sa:{t.samiya}</span>}
                      {t.surf > 0 && <span className="text-green-400">Su:{t.surf}</span>}
                    </td>
                    <td className="text-sm text-gray-300">{t.receiverName || '-'}</td>
                    <td>
                      {t.receiverPhoto ? (
                        <button onClick={() => setLightboxPhoto(t.receiverPhoto)} className="group">
                          <img
                            src={t.receiverPhoto}
                            alt="receiver"
                            className="w-10 h-10 rounded-lg object-cover border border-gray-700 group-hover:border-blue-500 transition-all"
                          />
                        </button>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center">
                          <Image size={14} className="text-gray-600" />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {data?.details && data.details.length === 0 && (
        <div className="card text-center py-16 text-gray-500">
          <FileText size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">No records found for {MONTHS[parsedMonth]} {parsedYear}</p>
          <p className="text-sm mt-1">Try selecting a different month.</p>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="relative max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute -top-3 -right-3 bg-red-600 hover:bg-red-700 rounded-full p-1.5 shadow-lg z-10"
            >
              <X size={16} className="text-white" />
            </button>
            <img
              src={lightboxPhoto}
              alt="Receiver full"
              className="w-full rounded-2xl border-2 border-gray-700 shadow-2xl"
            />
            <p className="text-center text-gray-400 text-xs mt-2">Receiver Photo</p>
          </div>
        </div>
      )}
    </div>
  );
}
