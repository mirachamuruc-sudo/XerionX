import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Zap, Copy, Check, Play, RefreshCw, Trash2, Send, Code, Plus, AlertCircle 
} from 'lucide-react';
import { Language, UserProfile, Team, Webhook, WebhookLog } from '../types';

interface WebhookViewProps {
  lang: Language;
  user: UserProfile;
  team: Team | null;
  onAddWebhook: (teamId: string, name: string, url: string, events: string[]) => Promise<any>;
  onDeleteWebhook: (teamId: string, webhookId: string) => Promise<any>;
}

export default function WebhookView({
  lang,
  user,
  team,
  onAddWebhook,
  onDeleteWebhook
}: WebhookViewProps) {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<string[]>(['MEMBER_JOINED', 'CREDIT_DEPLETED']);

  const [activeWebhookId, setActiveWebhookId] = useState<string | null>(null);
  const [testPayload, setTestPayload] = useState('{\n  "event": "MEMBER_JOINED",\n  "timestamp": "2026-07-14T00:00:00Z",\n  "data": {\n    "username": "GuestDev",\n    "role": "MEMBER"\n  }\n}');

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [testResponse, setTestResponse] = useState<any | null>(null);

  // Load existing Webhooks & Webhook Logs
  useEffect(() => {
    if (team) {
      setLoading(true);
      Promise.all([
        fetch(`/api/teams/${team.id}/webhooks`).then(res => res.json()),
        fetch(`/api/teams/${team.id}/webhooks/logs`).then(res => res.json())
      ])
        .then(([webhooksData, logsData]) => {
          setWebhooks(webhooksData.webhooks || []);
          setLogs(logsData.logs || []);
          if (webhooksData.webhooks?.length > 0) {
            setActiveWebhookId(webhooksData.webhooks[0].id);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [team?.id]);

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!team || !name || !url) return;
    setLoading(true);
    setSuccessMsg(null);
    try {
      const res = await onAddWebhook(team.id, name, url, selectedEvents);
      const updated = await fetch(`/api/teams/${team.id}/webhooks`).then(r => r.json());
      setWebhooks(updated.webhooks || []);
      setActiveWebhookId(res.webhookId);
      setName('');
      setUrl('');
      setSuccessMsg(lang === 'de' ? 'Webhook erfolgreich hinzugefügt!' : 'Webhook created successfully!');
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    if (!team) return;
    if (confirm(lang === 'de' ? 'Webhook wirklich löschen?' : 'Are you sure you want to delete this Webhook?')) {
      setLoading(true);
      try {
        await onDeleteWebhook(team.id, id);
        const updated = await fetch(`/api/teams/${team.id}/webhooks`).then(r => r.json());
        setWebhooks(updated.webhooks || []);
        if (activeWebhookId === id) {
          setActiveWebhookId(updated.webhooks?.[0]?.id || null);
        }
      } catch (err: any) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTestTrigger = async () => {
    if (!team || !activeWebhookId) return;
    setLoading(true);
    setTestResponse(null);
    try {
      const res = await fetch(`/api/teams/${team.id}/webhooks/${activeWebhookId}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload: JSON.parse(testPayload) })
      });
      const data = await res.json();
      setTestResponse(data);
      // Reload logs
      const logsRes = await fetch(`/api/teams/${team.id}/webhooks/logs`).then(r => r.json());
      setLogs(logsRes.logs || []);
    } catch (err: any) {
      setTestResponse({ error: err.message, status: 'FAILED' });
    } finally {
      setLoading(false);
    }
  };

  const toggleEvent = (event: string) => {
    if (selectedEvents.includes(event)) {
      setSelectedEvents(selectedEvents.filter(e => e !== event));
    } else {
      setSelectedEvents([...selectedEvents, event]);
    }
  };

  if (!team) {
    return (
      <div className="text-center py-20 bg-slate-900/10 border border-slate-900 rounded-2xl max-w-xl mx-auto p-8 space-y-4">
        <Zap className="w-12 h-12 text-indigo-400/20 mx-auto" />
        <h3 className="text-lg font-bold text-slate-200">{lang === 'de' ? 'Team erforderlich' : 'Team Workspace Required'}</h3>
        <p className="text-slate-400 text-xs">
          Um Webhooks einzurichten, musst du dich zuerst in einem Team befinden oder ein Team gründen.
        </p>
      </div>
    );
  }

  const activeWebhook = webhooks.find(w => w.id === activeWebhookId) || null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      
      {/* Upper header */}
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <Zap className="w-6 h-6 text-indigo-400" />
          <span>{lang === 'de' ? 'Entwickler-Webhooks' : 'Webhooks Gateway'}</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {lang === 'de' ? 'Triggere HTTP POST Payloads bei wichtigen Systemevents wie Credit-Auslastung oder Neuregistrierungen.' : 'Configure secure HTTP POST webhooks, manage event filters, and test delivery payloads live.'}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Add Webhook Form & active Webhooks list */}
        <div className="space-y-6 lg:col-span-1">
          {/* Create webhook block */}
          <div className="bg-slate-900/20 border border-slate-800 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 pb-2 border-b border-slate-900">
              <Plus className="w-4 h-4 text-indigo-400" />
              <span>{lang === 'de' ? 'Webhook registrieren' : 'Register Webhook'}</span>
            </h3>

            {successMsg && (
              <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddWebhook} className="space-y-4 text-xs text-slate-300">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Webhook Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  placeholder="e.g. Discord Logger"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Endpoint URL</label>
                <input
                  type="url"
                  required
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                  placeholder="https://discord.com/api/webhooks/..."
                />
              </div>

              {/* Event Filters checkboxes */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Trigger Events</label>
                <div className="space-y-2">
                  {['MEMBER_JOINED', 'CREDIT_DEPLETED', 'CONFIG_CHANGED'].map((evt) => (
                    <label key={evt} className="flex items-center gap-2 cursor-pointer text-xs">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(evt)}
                        onChange={() => toggleEvent(evt)}
                        className="rounded border-slate-800 text-indigo-600 focus:ring-0 focus:ring-offset-0 bg-slate-950"
                      />
                      <span className="font-mono text-[11px] text-slate-300">{evt}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg text-xs transition-all shadow-md shadow-indigo-500/15 cursor-pointer"
              >
                {loading ? 'Adding...' : 'Webhook registrieren'}
              </button>
            </form>
          </div>

          {/* Active Webhooks List */}
          <div className="bg-slate-900/20 border border-slate-800 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-900 pb-2">Registrierte Webhooks ({webhooks.length})</h3>
            <div className="space-y-3">
              {webhooks.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-4">Noch keine Webhooks verknüpft.</p>
              ) : (
                webhooks.map((w) => (
                  <div
                    key={w.id}
                    onClick={() => setActiveWebhookId(w.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                      activeWebhookId === w.id 
                        ? 'bg-indigo-600/10 border-indigo-500/30' 
                        : 'bg-slate-950 border-slate-900 hover:bg-slate-900/30'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="overflow-hidden space-y-1">
                        <span className="font-bold text-xs text-slate-200 block truncate">{w.name}</span>
                        <span className="font-mono text-[10px] text-slate-500 block truncate">{w.url}</span>
                      </div>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteWebhook(w.id);
                        }}
                        className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-900/40 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex gap-1 flex-wrap mt-2.5">
                      {w.events.map(ev => (
                        <span key={ev} className="bg-slate-900 text-indigo-400 border border-slate-800 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded uppercase">
                          {ev}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column: Interactive Sandbox Test Payload runner */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl space-y-5">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-900 pb-3">
              <Code className="w-4.5 h-4.5 text-indigo-400" />
              <span>{lang === 'de' ? 'Live Payload Delivery Simulator' : 'Dynamic Payload Simulation'}</span>
            </h3>

            {activeWebhook ? (
              <div className="space-y-4">
                <div className="text-xs space-y-1.5">
                  <span className="text-slate-400 font-semibold">Ausgewählter Webhook:</span>
                  <div className="p-3 bg-slate-950 border border-slate-900 rounded-lg text-slate-300 font-mono text-[11px] truncate">
                    {activeWebhook.url}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Custom JSON Body Payload</label>
                  <textarea
                    rows={6}
                    value={testPayload}
                    onChange={(e) => setTestPayload(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 resize-none"
                  />
                </div>

                <button
                  onClick={handleTestTrigger}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-5 py-3 rounded-lg text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-500/10"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Payload jetzt übertragen</span>
                </button>

                {/* Show simulation response result */}
                {testResponse && (
                  <div className="border border-slate-900 rounded-xl bg-slate-950 overflow-hidden text-xs">
                    <div className="bg-slate-900 px-4 py-2 border-b border-slate-950 flex justify-between items-center text-slate-400">
                      <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-indigo-400">Response Metadata</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        testResponse.status === 'SUCCESS' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        HTTP {testResponse.code || 500} {testResponse.status}
                      </span>
                    </div>
                    <pre className="p-4 text-slate-300 font-mono text-[11px] overflow-auto max-h-40 text-left">
                      <code>{JSON.stringify(testResponse, null, 2)}</code>
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-500 text-xs text-center py-6">Registriere oder wähle einen Webhook aus, um Simulationen durchzuführen.</p>
            )}
          </div>

          {/* Webhook Deliveries Log Table */}
          <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl space-y-4">
            <h3 className="font-bold text-sm text-slate-200 border-b border-slate-900 pb-2">Empfangene Webhook Zustellungslogs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400">
                    <th className="pb-3 font-semibold">Webhook ID</th>
                    <th className="pb-3 font-semibold">Event</th>
                    <th className="pb-3 font-semibold">HTTP Code</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Zeit</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-slate-500">Noch kein Log-Verlauf verfügbar.</td>
                    </tr>
                  ) : (
                    logs.map((log, idx) => (
                      <tr key={log.id || idx} className="border-b border-slate-950 text-slate-300 hover:bg-slate-900/5">
                        <td className="py-3 font-mono text-slate-500 text-[10px]">{log.webhookId.slice(0, 10)}</td>
                        <td className="py-3 font-mono text-slate-400 font-semibold">{log.event}</td>
                        <td className="py-3 font-mono font-bold">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            log.statusCode < 300 ? 'bg-teal-500/10 text-teal-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {log.statusCode}
                          </span>
                        </td>
                        <td className="py-3 capitalize text-[10px] font-mono">{log.status}</td>
                        <td className="py-3 text-[10px] text-slate-500 text-right">{new Date(log.timestamp).toLocaleString()}</td>
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
