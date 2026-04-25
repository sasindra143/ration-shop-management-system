import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ClipboardList, Search, User, Save, Camera, X, Package, AlertTriangle, CheckCircle, Calendar, RefreshCw, ImagePlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../services/api';

/* ─── Camera Modal ─────────────────────────────────────────────── */
function CameraModal({ onCapture, onClose }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('environment'); // rear camera default
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  const startCamera = useCallback(async (mode) => {
    // Stop existing stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }
    setReady(false);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
    } catch (err) {
      setError('Camera not available. Please allow camera access or use file upload.');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, [facingMode, startCamera]);

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onCapture(dataUrl);
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    onClose();
  };

  const flipCamera = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 safe-area-top">
        <button onClick={() => { if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); onClose(); }}
          className="p-2 text-white">
          <X size={24} />
        </button>
        <span className="text-white font-semibold text-sm">📷 Take Receiver Photo</span>
        <button onClick={flipCamera} className="p-2 text-white" title="Flip Camera">
          <RefreshCw size={20} />
        </button>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative flex items-center justify-center bg-black overflow-hidden">
        {error ? (
          <div className="text-center p-6">
            <Camera size={48} className="text-gray-600 mx-auto mb-3" />
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button onClick={onClose} className="btn-secondary text-sm px-6">Close</button>
          </div>
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
            />
            {/* Viewfinder overlay */}
            {ready && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-80 border-2 border-white/60 rounded-2xl relative">
                  {/* Corner marks */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
                  <p className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-white/70 text-xs whitespace-nowrap">
                    Position face within frame
                  </p>
                </div>
              </div>
            )}
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center bg-black">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Controls */}
      {!error && (
        <div className="flex items-center justify-center py-8 bg-black/80 safe-area-bottom gap-6">
          <div className="w-14" /> {/* spacer */}
          {/* Shutter button */}
          <button
            onClick={capture}
            disabled={!ready}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center bg-white/20 hover:bg-white/30 active:scale-95 transition-all disabled:opacity-40 shadow-2xl"
          >
            <div className="w-14 h-14 rounded-full bg-white" />
          </button>
          <div className="w-14" /> {/* spacer */}
        </div>
      )}

      {/* Hidden canvas for capture */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

/* ─── Distribution Page ────────────────────────────────────────── */
export default function Distribution() {
  const location = useLocation();
  const navigate = useNavigate();
  const prefilledCard = location.state?.cardNumber || '';
  const prefilledPhoto = location.state?.photo || null;
  const fileInputRef = useRef(null);

  const [cardNumber, setCardNumber] = useState(prefilledCard);
  const [cardDetails, setCardDetails] = useState(null);
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [stock, setStock] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(prefilledPhoto);
  const [photoBase64, setPhotoBase64] = useState(prefilledPhoto || '');
  const [receiverName, setReceiverName] = useState('');
  const [showCamera, setShowCamera] = useState(false);

  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  });

  const [form, setForm] = useState({
    rice: '', bigSoap: '', smallSoap: '', wheat: '', idli: '', samiya: '', sugar: '', surf: ''
  });

  useEffect(() => {
    const [year, month] = selectedDate.split('-');
    api.get(`/stock?month=${month}&year=${year}`).then(({ data }) => setStock(data)).catch(() => {});
  }, [selectedDate]);

  useEffect(() => {
    if (prefilledCard) doSearch(prefilledCard);
  }, []);

  const doSearch = async (num) => {
    const cn = num || cardNumber;
    if (!cn.trim()) return;
    setSearching(true);
    setCardDetails(null);
    if (!prefilledPhoto) { setPhotoPreview(null); setPhotoBase64(''); }
    setReceiverName('');
    try {
      const { data } = await api.get(`/users/card/${cn.trim()}`);
      setCardDetails(data);
    } catch {
      toast.error('Card not found or inactive');
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (e) => { e.preventDefault(); doSearch(); };

  // File upload fallback
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Photo too large. Max 5MB.'); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setPhotoPreview(reader.result); setPhotoBase64(reader.result); };
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhotoPreview(null);
    setPhotoBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cardDetails) return toast.error('Please search and select a card first');
    setSubmitting(true);
    try {
      const [year, month] = selectedDate.split('-');
      const payload = {
        cardNumber: cardDetails.cardNumber,
        month: parseInt(month),
        year: parseInt(year),
        rice: Number(form.rice) || 0,
        bigSoap: Number(form.bigSoap) || 0,
        smallSoap: Number(form.smallSoap) || 0,
        wheat: Number(form.wheat) || 0,
        idli: Number(form.idli) || 0,
        samiya: Number(form.samiya) || 0,
        sugar: Number(form.sugar) || 0,
        surf: Number(form.surf) || 0,
        receiverName: receiverName.trim(),
        receiverPhoto: photoBase64,
      };
      await api.post('/transactions', payload);
      toast.success('✅ Distribution saved!');
      api.get(`/stock?month=${month}&year=${year}`).then(({ data }) => setStock(data)).catch(() => {});
      setCardNumber('');
      setCardDetails(null);
      setPhotoPreview(null);
      setPhotoBase64('');
      setReceiverName('');
      setForm({ rice: '', bigSoap: '', smallSoap: '', wheat: '', idli: '', samiya: '', sugar: '', surf: '' });
      navigate('/distribution', { replace: true, state: null });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save entry');
    } finally {
      setSubmitting(false);
    }
  };

  const stockColor = (val, threshold) =>
    val === undefined ? 'bg-gray-700' : val < threshold ? 'bg-red-500' : val < threshold * 2 ? 'bg-yellow-500' : 'bg-green-500';

  const items = [
    { label: 'Rice', key: 'rice', unit: 'kg', threshold: 500, color: 'text-white', icon: '🍚', price: 0 },
    { label: 'Big Soap', key: 'bigSoap', unit: 'pcs', threshold: 100, color: 'text-blue-400', icon: '🧼', price: 20 },
    { label: 'Small Soap', key: 'smallSoap', unit: 'pcs', threshold: 100, color: 'text-blue-300', icon: '🧼', price: 10 },
    { label: 'Wheat', key: 'wheat', unit: 'kg', threshold: 50, color: 'text-yellow-400', icon: '🌾', price: 50 },
    { label: 'Idli Rava', key: 'idli', unit: 'kg', threshold: 20, color: 'text-gray-300', icon: '🍚', price: 50 },
    { label: 'Samiya', key: 'samiya', unit: 'pkt', threshold: 20, color: 'text-cyan-400', icon: '🍜', price: 35 },
    { label: 'Sugar', key: 'sugar', unit: 'kg', threshold: 20, color: 'text-pink-200', icon: '🧂', price: 'custom' },
    { label: 'Surf', key: 'surf', unit: 'pkt', threshold: 50, color: 'text-green-400', icon: '🫧', price: 45 },
  ];

  const calculateTotalBill = () => {
    const s = Number(form.sugar) || 0;
    const sugarCost = Math.floor(s / 2) * 35 + (s % 2) * 17;
    return (
      ((Number(form.bigSoap) || 0) * 20) +
      ((Number(form.smallSoap) || 0) * 10) +
      ((Number(form.wheat) || 0) * 50) +
      ((Number(form.idli) || 0) * 50) +
      ((Number(form.samiya) || 0) * 35) +
      ((Number(form.surf) || 0) * 45) +
      sugarCost
    );
  };

  const formatMonthYear = (ds) => {
    const [y, m] = ds.split('-');
    return new Date(y, m - 1).toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <>
      {/* Camera Modal — full screen */}
      {showCamera && (
        <CameraModal
          onCapture={(dataUrl) => { setPhotoPreview(dataUrl); setPhotoBase64(dataUrl); toast.success('Photo captured!'); }}
          onClose={() => setShowCamera(false)}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-4 pb-24 lg:pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-800/40 p-4 rounded-xl border border-gray-700/50">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
              <ClipboardList className="text-blue-500 shrink-0" size={24} /> Distribution Entry
            </h1>
            <p className="text-gray-400 text-sm mt-0.5">Record stock for {formatMonthYear(selectedDate)}</p>
          </div>
          {/* Month/Year picker */}
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-28">
              <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <select className="input pl-8 w-full appearance-none text-sm"
                value={parseInt(selectedDate.split('-')[1], 10)}
                onChange={(e) => { const y=selectedDate.split('-')[0]; setSelectedDate(`${y}-${String(e.target.value).padStart(2,'0')}`); }}>
                {MONTHS.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
              </select>
            </div>
            <div className="relative w-24">
              <select className="input w-full appearance-none text-sm px-2"
                value={selectedDate.split('-')[0]}
                onChange={(e) => { const m=selectedDate.split('-')[1]; setSelectedDate(`${e.target.value}-${m}`); }}>
                {[2024,2025,2026,2027,2028,2029,2030].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Stock Preview */}
        {stock && (
          <div className="card !p-3 overflow-x-auto">
            <div className="flex items-center gap-2 mb-2 min-w-max">
              <Package size={14} className="text-blue-400 shrink-0" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Available Stock · {formatMonthYear(selectedDate)}</span>
            </div>
            <div className="flex gap-2 min-w-max pb-1">
              {items.map(({ label, key, unit, threshold, icon }) => (
                <div key={key} className={`rounded-xl p-2 text-center w-20 shrink-0 ${(stock[key]||0) < threshold ? 'bg-red-900/20 border border-red-900/40' : 'bg-gray-800'}`}>
                  <span className="text-base">{icon}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                  <p className={`text-sm font-bold ${(stock[key]||0) < threshold ? 'text-red-400' : 'text-white'}`}>
                    {stock[key] ?? 0}
                    <span className="text-[10px] font-normal text-gray-500 ml-0.5">{unit}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card space-y-5">
          {/* Step 1: Search */}
          <div>
            <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">Step 1 — Verify Ration Card</h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                <input type="text" inputMode="numeric" className="input pl-10 w-full"
                  placeholder="Enter card number (e.g. 2822595811)"
                  value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required />
              </div>
              <button type="submit" disabled={searching} className="btn-primary px-4 py-2 whitespace-nowrap text-sm shrink-0">
                {searching ? '...' : 'Verify'}
              </button>
            </form>
          </div>

          {/* Card Banner */}
          {cardDetails && (
            <div className="bg-green-900/20 border border-green-800/40 rounded-2xl p-3 flex items-center gap-3">
              <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center shrink-0">
                <User size={18} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-bold text-sm truncate">{cardDetails.headOfFamily}</p>
                <p className="text-gray-400 text-xs truncate">{cardDetails.headOfFamilyTelugu}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0 text-right text-xs">
                <div>
                  <p className="text-gray-500">Members</p>
                  <p className="text-white font-bold text-base">{cardDetails.familyMembers}</p>
                </div>
                <div>
                  <p className="text-gray-500">S.No</p>
                  <p className="text-white font-bold text-base">{cardDetails.serialNumber || '–'}</p>
                </div>
                <CheckCircle size={20} className="text-green-400" />
              </div>
            </div>
          )}

          {/* Step 2: Photo Capture */}
          <div className={`transition-opacity duration-300 ${cardDetails ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <h2 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-3">Step 2 — Receiver Photo</h2>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              {/* Photo area */}
              <div className="flex flex-col gap-2 w-full sm:w-auto">
                {photoPreview ? (
                  <div className="relative w-full sm:w-44">
                    <img src={photoPreview} alt="Receiver"
                      className="w-full sm:w-44 h-44 object-cover rounded-2xl border-2 border-green-500 shadow-lg" />
                    <button onClick={removePhoto}
                      className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 rounded-full p-1 shadow-lg z-10">
                      <X size={14} className="text-white" />
                    </button>
                    <span className="block text-xs text-green-400 mt-1 text-center font-medium">✓ Photo ready</span>
                  </div>
                ) : (
                  <div className="w-full sm:w-44 h-44 rounded-2xl border-2 border-dashed border-gray-700 flex flex-col items-center justify-center text-gray-600 text-xs text-center gap-2">
                    <Camera size={28} className="opacity-40" />
                    <span>No photo yet</span>
                  </div>
                )}

                {/* Camera + Upload buttons */}
                <div className="flex gap-2 w-full sm:w-44">
                  {/* CAMERA BUTTON — opens live camera */}
                  <button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white rounded-xl py-2.5 text-sm font-semibold transition-all shadow-lg shadow-blue-900/40"
                  >
                    <Camera size={16} /> Camera
                  </button>

                  {/* FILE UPLOAD fallback */}
                  <label
                    htmlFor="photoUpload"
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-xl py-2.5 text-sm font-medium cursor-pointer transition-all"
                    title="Upload from gallery"
                  >
                    <ImagePlus size={15} /> Gallery
                  </label>
                  <input ref={fileInputRef} id="photoUpload" type="file" accept="image/*"
                    onChange={handleFileUpload} className="hidden" />
                </div>
              </div>

              {/* Receiver name */}
              <div className="flex-1 w-full">
                <label className="label text-xs">Receiver Name (optional)</label>
                <input type="text" className="input w-full" placeholder="Name of person collecting"
                  value={receiverName} onChange={(e) => setReceiverName(e.target.value)} />
                <p className="text-gray-600 text-xs mt-2">
                  💡 Tip: Tap <strong className="text-gray-400">Camera</strong> to open live camera, or <strong className="text-gray-400">Gallery</strong> to pick from photos.
                </p>
              </div>
            </div>
          </div>

          {/* Step 3: Quantities */}
          <form onSubmit={handleSubmit} className={`space-y-4 transition-opacity duration-300 ${cardDetails ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
            <h3 className="text-xs font-semibold text-blue-400 uppercase tracking-wider border-t border-gray-800 pt-4">
              Step 3 — Commodity Quantities
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {items.map(({ key, label, unit, color, icon, price }) => (
                <div key={key} className="bg-gray-800/60 rounded-xl p-3 border border-gray-700/50 flex flex-col justify-between">
                  <div>
                    <label className={`flex items-center gap-1.5 text-xs font-semibold mb-1 ${color}`}>
                      <span>{icon}</span> {label}
                    </label>
                    <span className="text-[11px] font-medium bg-gray-900/80 px-2 py-0.5 rounded text-gray-400 inline-block mb-2">
                      {price === 'custom' ? '₹17/1 | ₹35/2' : price > 0 ? `₹${price}/${unit}` : 'Free'}
                    </span>
                  </div>
                  <div>
                    <input
                      type="number" step="0.1" min="0"
                      className="input w-full text-center text-lg font-bold py-2"
                      value={form[key]}
                      onChange={e => setForm({ ...form, [key]: e.target.value })}
                      placeholder="0"
                      inputMode="decimal"
                    />
                    {stock && form[key] && Number(form[key]) > (stock[key] || 0) && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertTriangle size={10} /> Exceeds stock ({stock[key] || 0})
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total Bill Box */}
            <div className="bg-green-900/20 border border-green-500/30 rounded-2xl p-4 flex items-center justify-between mt-6">
              <div>
                <p className="text-gray-400 text-sm font-medium">Total Bill amount</p>
                <p className="text-[10px] text-green-400/70 mt-0.5">Calculated automatically</p>
              </div>
              <div className="text-3xl font-bold text-green-400">
                ₹{calculateTotalBill()}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !cardDetails}
              className="btn-primary w-full py-4 flex justify-center items-center gap-2 text-base font-semibold rounded-2xl disabled:opacity-40 active:scale-[0.98] transition-all mt-4"
            >
              <Save size={20} />
              {submitting ? 'Saving...' : 'Submit Entry & Deduct Stock'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
