import React, { useState, useMemo } from 'react';
import { 
  Sun, Moon, Coffee, Calendar, Globe, AlertCircle, 
  Plus, Trash2, Edit2, X, Check, Clock 
} from 'lucide-react';

// Holiday Data for 2026 - Optimized for Global Training Planning
const HOLIDAYS_2026 = [
  { date: '2026-01-01', name: "New Year's Day", regions: ['Global'] },
  { date: '2026-01-19', name: "MLK Jr. Day", regions: ['US'] },
  { date: '2026-02-16', name: "Presidents' Day / Carnival", regions: ['US', 'BR'] },
  { date: '2026-02-17', name: "Chinese New Year", regions: ['SG', 'CN'] },
  { date: '2026-04-03', name: "Good Friday", regions: ['Global'] },
  { date: '2026-05-01', name: "Labor Day", regions: ['EU', 'SG', 'BR'] },
  { date: '2026-05-25', name: "Memorial Day", regions: ['US'] },
  { date: '2026-07-04', name: "Independence Day", regions: ['US'] },
  { date: '2026-08-09', name: "National Day", regions: ['SG'] },
  { date: '2026-09-07', name: "Labor Day", regions: ['US'] },
  { date: '2026-12-25', name: "Christmas Day", regions: ['Global'] },
];

const INITIAL_ZONES = [
  { id: '1', label: 'PST', zoneName: 'America/Los_Angeles', city: 'Los Angeles', color: 'bg-blue-500', regionTag: 'US' },
  { id: '2', label: 'EST', zoneName: 'America/New_York', city: 'New York', color: 'bg-indigo-500', regionTag: 'US' },
  { id: '3', label: 'Brasilia', zoneName: 'America/Sao_Paulo', city: 'São Paulo', color: 'bg-green-600', regionTag: 'BR' },
  { id: '4', label: 'CET', zoneName: 'Europe/Paris', city: 'Paris', color: 'bg-orange-500', regionTag: 'EU' },
  { id: '5', label: 'SST/CST', zoneName: 'Asia/Singapore', city: 'Singapore', color: 'bg-red-500', regionTag: 'SG' },
];

export default function App() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [baseHalfHour, setBaseHalfHour] = useState(12 * 2); 
  const [zones, setZones] = useState(INITIAL_ZONES);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ label: '', zoneName: 'UTC', city: '', regionTag: 'Global' });

  // Core Logic: Calculate offset based on IANA name and selected date (Daylight Savings Aware)
  const getOffsetAtDate = (zoneName, dateStr) => {
    try {
      const date = new Date(dateStr);
      // We use string conversion to force the browser's Intl engine to calculate the correct localized time
      const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
      const tzDate = new Date(date.toLocaleString('en-US', { timeZone: zoneName }));
      return (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
    } catch (e) {
      return 0;
    }
  };

  const getZoneTimeData = (zoneName, halfHourIndex, dateStr) => {
    const offset = getOffsetAtDate(zoneName, dateStr);
    let totalHalfHours = (halfHourIndex + (offset * 2) + 48) % 48;
    const hour = Math.floor(totalHalfHours / 2);
    const minutes = (totalHalfHours % 2) * 30;
    return { hour, minutes, offset };
  };

  const getHourStatus = (h) => {
    if (h >= 9 && h <= 17) return 'work';
    if (h >= 18 && h <= 21) return 'evening';
    if (h >= 22 || h <= 5) return 'sleep';
    return 'early';
  };

  const currentHolidays = useMemo(() => {
    return HOLIDAYS_2026.filter(h => h.date === selectedDate);
  }, [selectedDate]);

  const formatTime = (hour, minutes) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    let displayH = hour % 12;
    if (displayH === 0) displayH = 12;
    const displayM = minutes === 0 ? '00' : '30';
    return `${displayH}:${displayM} ${period}`;
  };

  const handleSaveZone = () => {
    if (editingId) {
      setZones(zones.map(z => z.id === editingId ? { ...z, ...formData } : z));
    } else {
      setZones([...zones, { ...formData, id: Date.now().toString(), color: 'bg-slate-500' }]);
    }
    setIsAdding(false);
    setEditingId(null);
    setFormData({ label: '', zoneName: 'UTC', city: '', regionTag: 'Global' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
        
        {/* Navigation Bar */}
        <div className="p-6 bg-slate-900 text-white flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Globe className="text-blue-400" />
              Global Planner
            </h1>
            <p className="text-slate-400 text-xs uppercase tracking-widest font-bold">2026 Training Schedule</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-xl border border-slate-700">
              <Calendar size={18} className="text-blue-400" />
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white outline-none cursor-pointer text-sm font-mono"
              />
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-blue-600 hover:bg-blue-500 p-2.5 rounded-xl transition-all shadow-lg active:scale-95"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        {/* Holiday Notification Area */}
        {currentHolidays.length > 0 && (
          <div className="bg-rose-50 border-b border-rose-100 p-4 flex items-start gap-3 animate-in slide-in-from-top duration-300">
            <AlertCircle className="text-rose-600 mt-1" />
            <div>
              <p className="font-bold text-rose-900 text-sm italic">Training Risk: Local Holidays</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {currentHolidays.map((h, i) => (
                  <span key={i} className="bg-white px-2 py-0.5 rounded border border-rose-200 text-[10px] text-rose-800 font-black uppercase">
                    {h.name} ({h.regions.join(', ')})
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Central Scrubber Control */}
        <div className="p-6 md:p-10 border-b border-slate-100 bg-slate-50/30">
          <div className="relative pt-2 pb-8">
            <div className="flex justify-between text-[10px] text-slate-400 mb-4 uppercase font-black tracking-widest">
              <span>00:00 UTC</span>
              <span>12:00 UTC</span>
              <span>23:30 UTC</span>
            </div>
            <input 
              type="range" min="0" max="47" step="1"
              value={baseHalfHour} 
              onChange={(e) => setBaseHalfHour(parseInt(e.target.value))}
              className="w-full h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="absolute bottom-0 left-0 right-0 flex justify-center">
               <div className="bg-white border border-slate-200 text-slate-700 px-5 py-1.5 rounded-full text-xs font-bold shadow-sm flex items-center gap-3">
                 <Clock size={14} className="text-blue-500" />
                 <span className="opacity-50 font-medium">UTC MASTER:</span>
                 <span className="font-mono">{formatTime(Math.floor(baseHalfHour/2), (baseHalfHour%2)*30)}</span>
               </div>
            </div>
          </div>
        </div>

        {/* Zone List Area */}
        <div className="p-4 md:p-6 space-y-4">
          {zones.map((zone) => {
            const { hour, minutes, offset } = getZoneTimeData(zone.zoneName, baseHalfHour, selectedDate);
            const status = getHourStatus(hour);
            const isHoliday = currentHolidays.some(h => h.regions.includes(zone.regionTag) || h.regions.includes('Global'));

            return (
              <div key={zone.id} className={`group relative flex flex-col md:flex-row md:items-center gap-5 p-5 rounded-2xl border-2 transition-all ${
                status === 'work' ? 'border-blue-200 bg-blue-50/30 shadow-sm' : 'border-slate-100 bg-white'
              }`}>
                <div className={`hidden md:block w-2 h-14 rounded-full ${zone.color} shadow-inner`} />

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-black text-slate-900 tracking-tight text-lg">{zone.label}</span>
                    <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-bold uppercase">
                      {zone.city} (GMT{offset >= 0 ? `+${offset}` : offset})
                    </span>
                    {isHoliday && <span className="text-[9px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-black tracking-tighter uppercase">HOLIDAY ALERT</span>}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-mono font-bold text-slate-800 tracking-tighter">
                      {formatTime(hour, minutes)}
                    </div>
                    {status === 'work' && <span className="text-[10px] text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg font-black uppercase flex items-center gap-1.5 shadow-sm border border-blue-200"><Coffee size={12}/> Training window</span>}
                    {status === 'sleep' && <span className="text-[10px] text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg font-bold uppercase flex items-center gap-1.5"><Moon size={12}/> Sleeping</span>}
                  </div>
                </div>

                {/* Desktop Timeline Bar */}
                <div className="hidden lg:flex flex-[1.5] h-2.5 gap-0.5 items-center px-4">
                  {[...Array(48)].map((_, i) => {
                    const { hour: h } = getZoneTimeData(zone.zoneName, i, selectedDate);
                    const s = getHourStatus(h);
                    const isActive = i === baseHalfHour;
                    return (
                      <div key={i} className={`flex-1 h-full rounded-full transition-all ${
                        isActive ? 'bg-slate-900 scale-y-[2.5] z-10' : 
                        s === 'work' ? 'bg-blue-400/60' : 'bg-slate-200'
                      }`} />
                    );
                  })}
                </div>

                {/* Edit/Delete Actions */}
                <div className="flex gap-2 md:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingId(zone.id); setFormData(zone); }} className="p-2.5 hover:bg-blue-50 rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => setZones(zones.filter(z => z.id !== zone.id))} className="p-2.5 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Add/Edit Timezone */}
        {(isAdding || editingId) && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden p-8 space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-black text-xl text-slate-900 tracking-tight">{editingId ? 'Edit Location' : 'Add Location'}</h2>
                <button onClick={() => { setIsAdding(false); setEditingId(null); }} className="p-2 hover:bg-slate-100 rounded-full"><X size={24}/></button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Display Label</label>
                  <input value={formData.label} onChange={e => setFormData({...formData, label: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" placeholder="e.g. Lead Dev (PST)" />
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Region / Timezone</label>
                  <select value={formData.zoneName} onChange={e => setFormData({...formData, zoneName: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold appearance-none">
                    <optgroup label="Americas">
                      <option value="America/Los_Angeles">PST/PDT (L.A./Vancouver)</option>
                      <option value="America/New_York">EST/EDT (N.Y./Toronto)</option>
                      <option value="America/Sao_Paulo">Brasilia Time (São Paulo)</option>
                    </optgroup>
                    <optgroup label="Europe/Africa">
                      <option value="Europe/London">London (GMT/BST)</option>
                      <option value="Europe/Paris">Central Europe (CET/CEST)</option>
                    </optgroup>
                    <optgroup label="Asia/Pacific">
                      <option value="Asia/Singapore">Singapore (SST)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                      <option value="Australia/Sydney">Sydney (AEST/AEDT)</option>
                    </optgroup>
                    <option value="UTC">Universal Time (UTC)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">City Name</label>
                  <input value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-blue-500 transition-all font-bold" placeholder="e.g. San Francisco" />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block px-1">Holiday Track</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['US', 'EU', 'SG', 'BR', 'Global'].map(tag => (
                      <button 
                        key={tag}
                        onClick={() => setFormData({...formData, regionTag: tag})}
                        className={`py-2 rounded-xl text-[10px] font-black border-2 transition-all ${formData.regionTag === tag ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-slate-100 text-slate-400'}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={handleSaveZone} className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl active:scale-[0.98] mt-4">
                {editingId ? 'Update Settings' : 'Create Location'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
