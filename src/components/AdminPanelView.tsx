import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, Settings, Cpu, Database, Save, UserX, UserCheck, AlertCircle, Check, Play, RefreshCw 
} from 'lucide-react';
import { Language, UserProfile } from '../types';

interface AdminPanelViewProps {
  lang: Language;
  user: UserProfile;
}

export default function AdminPanelView({ lang, user }: AdminPanelViewProps) {
  const [activeTab, setActiveTab] = useState<'telemetry' | 'users' | 'db_editor'>('telemetry');
  const [systemUsers, setSystemUsers] = useState<any[]>([]);
  const [dbJson, setDbJson] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live Performance Stats states
  const [cpuLoad, setCpuLoad] = useState(14.5);
  const [ramUsed, setRamUsed] = useState(182.2);

  useEffect(() => {
    // Live fluctuates statistics mock
    const timer = setInterval(() => {
      setCpuLoad(prev => Math.max(2, Math.min(99, Number((prev + (Math.random() * 6 - 3)).toFixed(1)))));
      setRamUsed(prev => Math.max(120, Math.min(512, Number((prev + (Math.random() * 2 - 1)).toFixed(1)))));
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, dbRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/db')
      ]);
      const usersData = await usersRes.json();
      const dbData = await dbRes.json();
      
      setSystemUsers(usersData.users || []);
      setDbJson(JSON.stringify(dbData.db, null, 2));
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleBan = async (uid: string, currentBanState: boolean) => {
    setLoading(true);
    setSuccessMsg(null);
    try {
      const res = await fetch(`/api/admin/users/${uid}/ban`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ban: !currentBanState })
      });
      if (!res.ok) throw new Error('Ban-Toggle fehlgeschlagen');
      
      setSuccessMsg(currentBanState ? 'Benutzer erfolgreich entsperrt!' : 'Benutzer erfolgreich gesperrt!');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDb = async () => {
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      // Validate JSON formatting
      const parsed = JSON.parse(dbJson);
      
      const res = await fetch('/api/admin/db', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ db: parsed })
      });
      if (!res.ok) throw new Error('Datenbank speichern fehlgeschlagen');
      
      setSuccessMsg(lang === 'de' ? 'Rohdatenbank erfolgreich aktualisiert!' : 'Raw database written successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
      loadData();
    } catch (err: any) {
      setErrorMsg(lang === 'de' ? `Syntaxfehler: ${err.message}` : `JSON Formatting Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Check safety block
  if (user.role !== 'admin') {
    return (
      <div className="text-center py-20 bg-slate-900/10 border border-slate-900 rounded-2xl max-w-xl mx-auto p-8 space-y-4">
        <ShieldAlert className="w-12 h-12 text-red-500/20 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">{lang === 'de' ? 'Zugriff verweigert' : 'Admin Authorization Required'}</h3>
        <p className="text-slate-400 text-xs">
          Diese Sektion ist ausschließlich System-Administratoren vorbehalten. Dein Benutzerprofil besitzt nicht die erforderliche Freigabe.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      
      {/* Upper header */}
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-500" />
          <span>{lang === 'de' ? 'System-Admin Leitstand' : 'Administrative Center'}</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {lang === 'de' ? 'Echtzeit-Auslastung überwachen, Benutzerkonten sperren und die JSON-Datenbank live manipulieren.' : 'Stash live system resources, block abusive users, and edit the raw database file directly.'}
        </p>
      </div>

      {/* Selector Tabs */}
      <div className="flex gap-2 border-b border-slate-900 pb-2">
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${activeTab === 'telemetry' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Auslastung & Telemetrie
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          Benutzer verwalten
        </button>
        <button
          onClick={() => setActiveTab('db_editor')}
          className={`px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all ${activeTab === 'db_editor' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          JSON Datenbank-Editor
        </button>
      </div>

      {successMsg && (
        <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400 text-xs font-semibold flex items-center gap-2 max-w-2xl">
          <Check className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-2 max-w-2xl">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Dynamic Tabs Content */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* TAB 1: performance Telemetry */}
        {activeTab === 'telemetry' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* CPU */}
            <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 uppercase font-semibold">Server CPU-Load</span>
                <Cpu className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-mono font-bold text-slate-100">{cpuLoad}%</div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full transition-all duration-1000" style={{ width: `${cpuLoad}%` }} />
              </div>
            </div>

            {/* RAM */}
            <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 uppercase font-semibold">Active RAM Memory</span>
                <Database className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-3xl font-mono font-bold text-slate-100">{ramUsed} MB</div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full transition-all duration-1000" style={{ width: `${(ramUsed / 512) * 100}%` }} />
              </div>
            </div>

            {/* API Health Nodes */}
            <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl space-y-3 text-xs">
              <span className="text-slate-400 uppercase font-semibold block pb-1 border-b border-slate-900">Health Registry</span>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">Gemini Gateway Proxy</span>
                  <span className="text-emerald-400 font-mono">● ONLINE (SLA)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Database Streamer</span>
                  <span className="text-emerald-400 font-mono">● HEALTHY</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Vite SSR Pipeline</span>
                  <span className="text-indigo-400 font-mono">● STABLE</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Users bans list table */}
        {activeTab === 'users' && (
          <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl space-y-4">
            <h3 className="font-bold text-sm text-slate-200">Registered Platform Users</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">User</th>
                    <th className="pb-3 font-semibold">UID</th>
                    <th className="pb-3 font-semibold">Rolle</th>
                    <th className="pb-3 font-semibold">Plan</th>
                    <th className="pb-3 font-semibold">Credits Left</th>
                    <th className="pb-3 font-semibold">Ban Status</th>
                    <th className="pb-3 font-semibold text-right">Aktionen</th>
                  </tr>
                </thead>
                <tbody>
                  {systemUsers.map((u) => (
                    <tr key={u.uid} className="border-b border-slate-900 text-slate-300 hover:bg-slate-900/5">
                      <td className="py-3 font-medium flex flex-col">
                        <span>{u.username}</span>
                        <span className="text-[10px] text-slate-500">{u.email}</span>
                      </td>
                      <td className="py-3 font-mono text-[10px] text-slate-500">{u.uid}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-950 border border-slate-900">
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-bold text-indigo-400">{u.plan || 'FREE'}</td>
                      <td className="py-3 font-mono">{u.geminiCredits || 0}</td>
                      <td className="py-3 font-mono">
                        {u.banned ? (
                          <span className="text-red-400 font-bold">● BANNED</span>
                        ) : (
                          <span className="text-emerald-400">● ACTIVE</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        {u.uid !== user.uid && (
                          <button
                            onClick={() => handleToggleBan(u.uid, u.banned || false)}
                            className={`p-1.5 rounded transition-all text-xs font-semibold cursor-pointer ${
                              u.banned 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {u.banned ? 'Unban' : 'Ban User'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: raw JSON db editor */}
        {activeTab === 'db_editor' && (
          <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Raw JSON Database file Editor</h3>
                <p className="text-[11px] text-slate-500">Dieser Editor manipuliert die `/data/db.json` direkt auf Server-Ebene.</p>
              </div>
              <button
                onClick={handleSaveDb}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-500/10"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Änderungen speichern</span>
              </button>
            </div>

            <textarea
              rows={15}
              value={dbJson}
              onChange={(e) => setDbJson(e.target.value)}
              className="w-full bg-slate-950 border border-slate-900 rounded-xl p-4 text-[11px] font-mono focus:outline-none focus:border-indigo-500 text-slate-200 resize-y"
            />
          </div>
        )}

      </div>
    </div>
  );
}
