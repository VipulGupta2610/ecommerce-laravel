import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Ruler, Check } from 'lucide-react';
import { sizeService } from '../../services/api';

export default function SizesList() {
  const [sizes, setSizes] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const res = await sizeService.getSizes();
      setSizes(res.data.data || []);
    } catch (err) {
      console.error('Error fetching sizes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  const handleAddSize = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setSaving(true);

    try {
      await sizeService.createSize({ name: name.trim() });
      setName('');
      fetchSizes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add size');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this size?')) return;
    try {
      await sizeService.deleteSize(id);
      setSizes((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      alert('Failed to delete size: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">Sizes Management</h1>
        <p className="text-xs text-slate-500">Configure sizing measurements available for apparel and footwear</p>
      </div>

      {/* Add New Size Inline Form */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
          Add New Size Option
        </h3>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-semibold mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleAddSize} className="flex gap-3">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. S, M, L, XL, 42 EU, 10 US..."
            className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 focus:bg-white transition-all font-semibold"
          />
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            <span>{saving ? 'Adding...' : 'Add Size'}</span>
          </button>
        </form>
      </div>

      {/* Sizes Cards Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
          Configured Size Tags ({sizes.length})
        </h3>

        {loading ? (
          <p className="text-xs text-slate-400 py-6 text-center font-bold">Loading sizes...</p>
        ) : sizes.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No sizes defined.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {sizes.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-blue-500 hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-2">
                  <Ruler className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600" />
                  <span className="text-xs font-black text-slate-900">{s.name}</span>
                </div>
                <button
                  onClick={() => handleDelete(s.id)}
                  className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
