import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Gamepad2, Save, Code, Copy, Check, FileCode, Sliders, Play, AlertCircle, RefreshCw 
} from 'lucide-react';
import { Language, UserProfile, Team, RobloxConfig } from '../types';

interface RobloxViewProps {
  lang: Language;
  user: UserProfile;
  team: Team | null;
  onSaveConfig: (teamId: string, config: Partial<RobloxConfig>) => Promise<any>;
}

export default function RobloxView({
  lang,
  user,
  team,
  onSaveConfig
}: RobloxViewProps) {
  const [apiKey, setApiKey] = useState('');
  const [universeId, setUniverseId] = useState('');
  const [placeId, setPlaceId] = useState('');
  const [datastoreKey, setDatastoreKey] = useState('OmniSaaSPlayerSaves');
  const [messagingTopic, setMessagingTopic] = useState('GlobalAnnouncements');
  const [privateServerData, setPrivateServerData] = useState('{}');

  const [activeScriptType, setActiveScriptType] = useState<'join_leave' | 'datastore' | 'moderation' | 'diagnostics'>('join_leave');
  const [generatedScript, setGeneratedScript] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Load existing config on mount
  useEffect(() => {
    if (team) {
      setLoading(true);
      fetch(`/api/teams/${team.id}/roblox`)
        .then(res => res.json())
        .then(data => {
          if (data.config) {
            setApiKey(data.config.apiKey || '');
            setUniverseId(data.config.universeId || '');
            setPlaceId(data.config.placeId || '');
            setDatastoreKey(data.config.datastoreKey || 'OmniSaaSPlayerSaves');
            setMessagingTopic(data.config.messagingServiceTopic || 'GlobalAnnouncements');
            setPrivateServerData(data.config.privateServerData || '{}');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [team?.id]);

  // Generate Script live when inputs change
  useEffect(() => {
    fetch('/api/roblox/script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: activeScriptType,
        placeId,
        universeId,
        datastoreKey,
        messagingTopic
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.script) setGeneratedScript(data.script);
      });
  }, [activeScriptType, placeId, universeId, datastoreKey, messagingTopic]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;
    setLoading(true);
    setSuccessMsg(null);
    try {
      await onSaveConfig(team.id, {
        apiKey,
        universeId,
        placeId,
        datastoreKey,
        messagingServiceTopic: messagingTopic,
        privateServerData
      });
      setSuccessMsg(lang === 'de' ? 'Roblox-Konfiguration erfolgreich gespeichert!' : 'Roblox sync config saved successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(generatedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!team) {
    return (
      <div className="text-center py-20 bg-slate-900/10 border border-slate-900 rounded-2xl max-w-xl mx-auto p-8 space-y-4">
        <Gamepad2 className="w-12 h-12 text-indigo-400/20 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">{lang === 'de' ? 'Team erforderlich' : 'Team Workspace Required'}</h3>
        <p className="text-slate-400 text-xs">
          Um Roblox-Dienste zu konfigurieren und Daten-Schnittstellen einzurichten, musst du dich zuerst in einem Team befinden oder ein Team gründen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      
      {/* Upper header */}
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <Gamepad2 className="w-6 h-6 text-indigo-400 animate-pulse" />
          <span>{lang === 'de' ? 'Roblox Integration & Script Generator' : 'Roblox Cloud API Integration'}</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {lang === 'de' ? 'Verknüpfe Universe-Daten und generiere voll funktionsfähige Lua-Skripte.' : 'Sync Game assets, configure Open Cloud endpoints, and generate modular Lua scripts.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Roblox parameters sync Form */}
        <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl space-y-5">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-900 pb-3">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Roblox Cloud Config</span>
          </h3>

          {successMsg && (
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs text-slate-300">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Universe ID</label>
                <input
                  type="text"
                  value={universeId}
                  onChange={(e) => setUniverseId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="e.g. 5981240211"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Place ID</label>
                <input
                  type="text"
                  value={placeId}
                  onChange={(e) => setPlaceId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="e.g. 14210982552"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Open Cloud API Key</label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                placeholder="ro_cloud_key_••••••••••••"
              />
              <span className="text-[10px] text-slate-500 block">Ermöglicht den Datenaustausch über MessagingService und DataStores direkt über unser Gateway.</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">DataStore Key Name</label>
                <input
                  type="text"
                  value={datastoreKey}
                  onChange={(e) => setDatastoreKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="LivePlayerSaves"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">MessagingService Topic</label>
                <input
                  type="text"
                  value={messagingTopic}
                  onChange={(e) => setMessagingTopic(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="GlobalAnnouncements"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Private Server JSON Data</label>
              <textarea
                rows={3}
                value={privateServerData}
                onChange={(e) => setPrivateServerData(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 font-mono resize-none"
                placeholder='{"customMessage": "Willkommen!"}'
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg text-xs shadow-md shadow-indigo-500/15 cursor-pointer"
            >
              {loading ? 'Speichere...' : lang === 'de' ? 'Integration speichern' : 'Commit Configuration'}
            </button>
          </form>
        </div>

        {/* Right Column: Roblox Lua script Generator output */}
        <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-900 pb-3">
              <FileCode className="w-4 h-4 text-indigo-400" />
              <span>{lang === 'de' ? 'Roblox Lua Script Generator' : 'Interactive Lua Script Generator'}</span>
            </h3>

            {/* Selector bar */}
            <div className="flex gap-1 bg-slate-950 border border-slate-800 p-1 rounded-lg text-[10px] sm:text-xs">
              <button
                onClick={() => setActiveScriptType('join_leave')}
                className={`flex-1 py-1.5 rounded transition-all font-semibold cursor-pointer ${activeScriptType === 'join_leave' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Join Logs
              </button>
              <button
                onClick={() => setActiveScriptType('datastore')}
                className={`flex-1 py-1.5 rounded transition-all font-semibold cursor-pointer ${activeScriptType === 'datastore' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                DataStore Sync
              </button>
              <button
                onClick={() => setActiveScriptType('moderation')}
                className={`flex-1 py-1.5 rounded transition-all font-semibold cursor-pointer ${activeScriptType === 'moderation' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Moderation
              </button>
              <button
                onClick={() => setActiveScriptType('diagnostics')}
                className={`flex-1 py-1.5 rounded transition-all font-semibold cursor-pointer ${activeScriptType === 'diagnostics' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Diagnostics
              </button>
            </div>
          </div>

          {/* Script view panel */}
          <div className="relative flex-1 bg-slate-950 rounded-xl border border-slate-900 p-4 font-mono text-xs overflow-hidden">
            <button
              onClick={handleCopyScript}
              className="absolute top-3 right-3 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded p-1.5 transition-all text-[10px] flex items-center gap-1 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-teal-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
            <pre className="overflow-auto max-h-72 h-full text-left text-slate-300 leading-relaxed pr-2">
              <code>{generatedScript}</code>
            </pre>
          </div>

          <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-lg flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
            <AlertCircle className="w-4.5 h-4.5 text-indigo-400 shrink-0 mt-0.5" />
            <p>
              {lang === 'de' 
                ? 'Dieses Lua-Skript ist vollständig optimiert. Trage den Webhook aus dem Webhook-Tab in den oberen Platzhalter ein, füge das Skript in ServerScriptService ein und aktiviere HTTP-Requests in den Spiel-Einstellungen.' 
                : 'This Lua script is production-ready. Fill the generated webhook URL placeholder, paste it into ServerScriptService inside your Roblox project, and make sure HTTP Requests are enabled.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
