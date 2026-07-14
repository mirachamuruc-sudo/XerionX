import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Bot, Settings, Shield, Terminal, Send, Check, Play, MessageSquare, ListFilter, AlertCircle 
} from 'lucide-react';
import { Language, UserProfile, Team, DiscordConfig } from '../types';

interface DiscordViewProps {
  lang: Language;
  user: UserProfile;
  team: Team | null;
  onSaveConfig: (teamId: string, config: Partial<DiscordConfig>) => Promise<any>;
}

export default function DiscordView({
  lang,
  user,
  team,
  onSaveConfig
}: DiscordViewProps) {
  const [botToken, setBotToken] = useState('');
  const [guildId, setGuildId] = useState('');
  const [logChannelId, setLogChannelId] = useState('');
  const [welcomeChannelId, setWelcomeChannelId] = useState('');
  const [adminRoleId, setAdminRoleId] = useState('');

  // Rich Embed states
  const [embedTitle, setEmbedTitle] = useState('OmniSaaS Server Update');
  const [embedDesc, setEmbedDesc] = useState('Unser Roblox-Server wurde erfolgreich aktualisiert. Version 2.15 ist jetzt live!');
  const [embedColor, setEmbedColor] = useState('#6366f1'); // default indigo

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [testSent, setTestSent] = useState(false);

  // Load existing configuration
  useEffect(() => {
    if (team) {
      setLoading(true);
      fetch(`/api/teams/${team.id}/discord`)
        .then(res => res.json())
        .then(data => {
          if (data.config) {
            setBotToken(data.config.botToken || '');
            setGuildId(data.config.guildId || '');
            setLogChannelId(data.config.logChannelId || '');
            setWelcomeChannelId(data.config.welcomeChannelId || '');
            setAdminRoleId(data.config.adminRoleId || '');
          }
        })
        .finally(() => setLoading(false));
    }
  }, [team?.id]);

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team) return;
    setLoading(true);
    setSuccessMsg(null);
    try {
      await onSaveConfig(team.id, {
        botToken,
        guildId,
        logChannelId,
        welcomeChannelId,
        adminRoleId
      });
      setSuccessMsg(lang === 'de' ? 'Discord-Konfiguration gespeichert!' : 'Discord connection saved!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendTestEmbed = async () => {
    if (!team) return;
    setLoading(true);
    setTestSent(false);
    try {
      const res = await fetch('/api/discord/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId: team.id,
          title: embedTitle,
          message: embedDesc,
          color: parseInt(embedColor.replace('#', ''), 16)
        })
      });
      if (!res.ok) throw new Error('Test-Senden fehlgeschlagen');
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!team) {
    return (
      <div className="text-center py-20 bg-slate-900/10 border border-slate-900 rounded-2xl max-w-xl mx-auto p-8 space-y-4">
        <Bot className="w-12 h-12 text-indigo-400/20 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">{lang === 'de' ? 'Team erforderlich' : 'Team Workspace Required'}</h3>
        <p className="text-slate-400 text-xs">
          Um Discord-Bots zu konfigurieren und Daten-Schnittstellen einzurichten, musst du dich zuerst in einem Team befinden oder ein Team gründen.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      
      {/* Upper Header */}
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <Bot className="w-6 h-6 text-indigo-400 animate-bounce" />
          <span>{lang === 'de' ? 'Discord Bot Controller & Webhooks' : 'Discord Bot Integration'}</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {lang === 'de' ? 'Verwalte Discord-Bot Token, Channel-IDs und richte automatische Rich Embed-Meldungen ein.' : 'Manage developer bot tokens, configure logging targets, and test rich embeds.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Discord Config inputs */}
        <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl space-y-5">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-900 pb-3">
            <Settings className="w-4.5 h-4.5 text-indigo-400" />
            <span>Discord Bot Credentials</span>
          </h3>

          {successMsg && (
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-4 text-xs text-slate-300">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Discord Bot Token</label>
              <input
                type="password"
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                placeholder="MTE5MjM4NDcx...••••••••••••"
              />
              <span className="text-[10px] text-slate-500 block">Sicherer Token für deinen benutzerdefinierten Discord-Bot. Wird verschlüsselt im Backend verarbeitet.</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Server Guild ID</label>
                <input
                  type="text"
                  value={guildId}
                  onChange={(e) => setGuildId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="1098273645283746"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Admin Role ID</label>
                <input
                  type="text"
                  value={adminRoleId}
                  onChange={(e) => setAdminRoleId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="10293847562839401"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Logging Channel ID</label>
                <input
                  type="text"
                  value={logChannelId}
                  onChange={(e) => setLogChannelId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="1102938475628394"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Welcome Channel ID</label>
                <input
                  type="text"
                  value={welcomeChannelId}
                  onChange={(e) => setWelcomeChannelId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="1102938475628395"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg text-xs shadow-md shadow-indigo-500/15 cursor-pointer"
            >
              {loading ? 'Speichere...' : lang === 'de' ? 'Discord credentials speichern' : 'Commit Configuration'}
            </button>
          </form>
        </div>

        {/* Right Column: Interactive Embed builder */}
        <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl flex flex-col justify-between space-y-5">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-900 pb-3">
              <MessageSquare className="w-4.5 h-4.5 text-indigo-400" />
              <span>{lang === 'de' ? 'Live Rich Embed Builder' : 'Interactive Embed Forwarder'}</span>
            </h3>

            {testSent && (
              <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4.5 h-4.5" />
                <span>{lang === 'de' ? 'Rich Embed erfolgreich an den Discord-Kanal übertragen!' : 'Rich Embed queued successfully to Discord log channels!'}</span>
              </div>
            )}

            <div className="space-y-4 text-xs text-slate-300">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Embed Title</label>
                <input
                  type="text"
                  value={embedTitle}
                  onChange={(e) => setEmbedTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-200"
                />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Embed Description</label>
                <textarea
                  rows={2}
                  value={embedDesc}
                  onChange={(e) => setEmbedDesc(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Accent Theme Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={embedColor}
                    onChange={(e) => setEmbedColor(e.target.value)}
                    className="w-12 h-9 bg-slate-950 border border-slate-800 rounded-lg p-1 focus:outline-none focus:border-indigo-500 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={embedColor}
                    onChange={(e) => setEmbedColor(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 text-xs text-slate-200 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Render Mock Preview of the embed */}
          <div className="border border-slate-900 rounded-xl bg-slate-950 p-4 font-sans text-xs space-y-2.5">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <span className="font-bold text-slate-300">OmniSaaS Bot</span>
              <span className="bg-indigo-600 text-white text-[9px] px-1 rounded uppercase tracking-wider">BOT</span>
            </div>
            
            {/* Embed layout representation */}
            <div className="flex gap-3 bg-slate-900 p-3 rounded-lg border-l-4 border-l-indigo-500" style={{ borderLeftColor: embedColor }}>
              <div className="space-y-1.5 flex-1">
                <h4 className="font-bold text-slate-100 text-sm">{embedTitle || 'Server Notification'}</h4>
                <p className="text-slate-400 leading-relaxed">{embedDesc || 'Enter description above...'}</p>
                <span className="text-[10px] text-slate-500 font-mono block">OmniSaaS Logger Service • Heute</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSendTestEmbed}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-indigo-400 hover:text-white font-semibold py-3 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Embed-Meldung jetzt testen</span>
          </button>
        </div>

      </div>
    </div>
  );
}
