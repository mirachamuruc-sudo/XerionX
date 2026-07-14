import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Key, Plus, Trash2, Eye, EyeOff, Check, Copy, ShieldCheck, Database, Calendar, AlertCircle 
} from 'lucide-react';
import { Language, UserProfile, Team, ApiKeyEntry } from '../types';

interface ApiKeyAuditLog {
  id: string;
  username: string;
  keyName: string;
  action: string;
  timestamp: string;
}

interface ApiKeyViewProps {
  lang: Language;
  user: UserProfile;
  team: Team | null;
  onSaveKey: (teamId: string, name: string, service: string, keyVal: string) => Promise<any>;
  onDeleteKey: (teamId: string, entryId: string) => Promise<any>;
}

export default function ApiKeyView({
  lang,
  user,
  team,
  onSaveKey,
  onDeleteKey
}: ApiKeyViewProps) {
  const [keys, setKeys] = useState<ApiKeyEntry[]>([]);
  const [audits, setAudits] = useState<ApiKeyAuditLog[]>([]);
  
  const [keyName, setKeyName] = useState('');
  const [keyService, setKeyService] = useState('GEMINI_API');
  const [keyVal, setKeyVal] = useState('');

  const [visibleKeyId, setVisibleKeyId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load API keys vault & Audits
  useEffect(() => {
    if (team) {
      setLoading(true);
      Promise.all([
        fetch(`/api/teams/${team.id}/keys`).then(res => res.json()),
        fetch(`/api/teams/${team.id}/keys/audit`).then(res => res.json())
      ])
        .then(([keysData, auditsData]) => {
          setKeys(keysData.keys || []);
          setAudits(auditsData.audits || []);
        })
        .finally(() => setLoading(false));
    }
  }, [team?.id]);

  const handleAddKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !keyName || !keyVal) return;
    setLoading(true);
    setSuccessMsg(null);
    try {
      await onSaveKey(team.id, keyName, keyService, keyVal);
      // Reload keys and audits
      const [keysData, auditsData] = await Promise.all([
        fetch(`/api/teams/${team.id}/keys`).then(res => res.json()),
        fetch(`/api/teams/${team.id}/keys/audit`).then(res => res.json())
      ]);
      setKeys(keysData.keys || []);
      setAudits(auditsData.audits || []);
      setKeyName('');
      setKeyVal('');
      setSuccessMsg(lang === 'de' ? 'API-Schlüssel sicher hinterlegt!' : 'API Credentials vaulted securely!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteKey = async (id: string) => {
    if (!team) return;
    if (confirm(lang === 'de' ? 'API-Schlüssel permanent löschen?' : 'Are you sure you want to delete this secret key permanently?')) {
      setLoading(true);
      try {
        await onDeleteKey(team.id, id);
        // Reload
        const [keysData, auditsData] = await Promise.all([
          fetch(`/api/teams/${team.id}/keys`).then(res => res.json()),
          fetch(`/api/teams/${team.id}/keys/audit`).then(res => res.json())
        ]);
        setKeys(keysData.keys || []);
        setAudits(auditsData.audits || []);
      } catch (err: any) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCopyKey = (val: string, id: string) => {
    navigator.clipboard.writeText(val);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!team) {
    return (
      <div className="text-center py-20 bg-slate-900/10 border border-slate-900 rounded-2xl max-w-xl mx-auto p-8 space-y-4">
        <Key className="w-12 h-12 text-indigo-400/20 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">{lang === 'de' ? 'Team erforderlich' : 'Team Workspace Required'}</h3>
        <p className="text-slate-400 text-xs">
          Um API-Schlüssel sicher zu hinterlegen, musst du dich zuerst in einem Team befinden oder ein Team gründen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      
      {/* Upper header */}
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <Key className="w-6 h-6 text-indigo-400" />
          <span>{lang === 'de' ? 'Verschlüsselter API Key Vault' : 'Credentials Key Vault'}</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {lang === 'de' ? 'Verschlüssele und hinterlege sensible API-Schlüssel für Gemini, GitHub oder Discord.' : 'Stash sensitive developer tokens for Gemini AI, Roblox, GitHub, and custom services.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Add Secret key Form & active Credentials list */}
        <div className="space-y-6 lg:col-span-1">
          {/* Create credentials block */}
          <div className="bg-slate-900/20 border border-slate-800 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 pb-2 border-b border-slate-900">
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>{lang === 'de' ? 'Schlüssel hinzufügen' : 'Vault Credentials'}</span>
            </h3>

            {successMsg && (
              <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddKey} className="space-y-4 text-xs text-slate-300">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Key Label Name</label>
                <input
                  type="text"
                  required
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Production Gemini Key"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Service target</label>
                <select
                  value={keyService}
                  onChange={(e) => setKeyService(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="GEMINI_API">GEMINI AI SDK</option>
                  <option value="ROBLOX_API">ROBLOX OPEN CLOUD</option>
                  <option value="DISCORD_BOT">DISCORD BOT BOT</option>
                  <option value="GITHUB_TOKEN">GITHUB DEPLOY VAULT</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Secret Key Value</label>
                <input
                  type="password"
                  required
                  value={keyVal}
                  onChange={(e) => setKeyVal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="AIzaSy... / ghp_..."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg text-xs transition-all shadow-md shadow-indigo-500/15 cursor-pointer"
              >
                {loading ? 'Hinterlege...' : 'Hinterlegen'}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Credentials list & Audit Logs trail */}
        <div className="lg:col-span-2 space-y-6">
          {/* Secrets Vault Grid */}
          <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-400" />
              <span>Geparkte API-Schlüssel ({keys.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {keys.length === 0 ? (
                <p className="text-slate-500 text-xs py-4 col-span-2 text-center">Keine geheimen Schlüssel gespeichert.</p>
              ) : (
                keys.map((k) => (
                  <div key={k.id} className="bg-slate-950 border border-slate-900 rounded-xl p-4 space-y-3 relative overflow-hidden">
                    <div className="flex justify-between items-start gap-2">
                      <div className="space-y-0.5 overflow-hidden">
                        <span className="font-bold text-xs text-slate-200 block truncate">{k.name}</span>
                        <span className="text-[10px] font-mono text-indigo-400 block">{k.service}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteKey(k.id)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-900/40 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Masked secret string layout with action buttons */}
                    <div className="flex items-center justify-between gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800 text-[11px] font-mono">
                      <span className="text-slate-400 truncate flex-1">
                        {visibleKeyId === k.id ? k.value : '••••••••••••••••••••••••'}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setVisibleKeyId(visibleKeyId === k.id ? null : k.id)}
                          className="text-slate-500 hover:text-slate-300 p-1"
                        >
                          {visibleKeyId === k.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleCopyKey(k.value, k.id)}
                          className="text-slate-500 hover:text-slate-300 p-1 cursor-pointer"
                        >
                          {copiedId === k.id ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[9px] text-slate-500 font-mono">
                      <span>Vault-Verbindung: AES-GCM</span>
                      <span>{new Date(k.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Key Access Audit Log */}
          <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl space-y-4">
            <h3 className="font-bold text-sm text-slate-200 border-b border-slate-900 pb-2">API-Schlüssel Zugriffs-Audit-Protokoll</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                    <th className="pb-3">User</th>
                    <th className="pb-3">Schlüssel</th>
                    <th className="pb-3">Aktion</th>
                    <th className="pb-3 text-right">Datum / Uhrzeit</th>
                  </tr>
                </thead>
                <tbody>
                  {audits.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-slate-500">Noch keine Sicherheitsaudits vorhanden.</td>
                    </tr>
                  ) : (
                    audits.map((aud, idx) => (
                      <tr key={aud.id || idx} className="border-b border-slate-950 text-slate-300 hover:bg-slate-900/5">
                        <td className="py-3 font-semibold">{aud.username}</td>
                        <td className="py-3 font-mono text-indigo-400 text-[11px]">{aud.keyName}</td>
                        <td className="py-3">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            aud.action === 'DECRYPT' ? 'bg-teal-500/10 text-teal-400' :
                            aud.action === 'VAULTED' ? 'bg-indigo-500/10 text-indigo-400' :
                            'bg-red-500/10 text-red-400'
                          }`}>
                            {aud.action}
                          </span>
                        </td>
                        <td className="py-3 text-[10px] text-slate-500 text-right">{new Date(aud.timestamp).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
