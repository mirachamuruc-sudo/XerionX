import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, Shield, Cpu, RefreshCw, Zap, Users, Code, Activity, Bell, HelpCircle, AlertTriangle, 
  Coins, TrendingUp, Calendar, ArrowUpRight, CheckCircle2, Bot 
} from 'lucide-react';
import { Language, UserProfile, Notification, Team, CreditTransaction } from '../types';
import { translations } from '../locales';

interface DashboardViewProps {
  lang: Language;
  user: UserProfile;
  team: Team | null;
  notifications: Notification[];
  transactions: CreditTransaction[];
  onMarkNotificationsRead: () => void;
  onNavigate: (view: string) => void;
  onReloadDemoCredits: () => void;
}

export default function DashboardView({
  lang,
  user,
  team,
  notifications,
  transactions,
  onMarkNotificationsRead,
  onNavigate,
  onReloadDemoCredits
}: DashboardViewProps) {
  const t = translations[lang];
  const [activeChartTab, setActiveChartTab] = useState<'credits' | 'usage'>('credits');

  // Simple, incredibly beautiful SVG chart data representation
  const weeklyUsage = [120, 240, 150, 480, 200, 310, user.dailyUsage];
  const daysOfWeek = lang === 'de' ? ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const maxVal = Math.max(...weeklyUsage, 500);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-6">
      
      {/* Upper Welcome Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 flex items-center gap-2">
            <span>{lang === 'de' ? `Willkommen zurück, ${user.username}!` : `Welcome back, ${user.username}!`}</span>
            <span className="text-xs font-mono bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-full border border-indigo-500/20 uppercase tracking-widest">{user.plan} PLAN</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {lang === 'de' ? 'Hier ist die Live-Übersicht deines Entwickler-Kontos.' : 'Here is the live telemetry of your developer workspace.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onReloadDemoCredits}
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <RefreshCw className="w-4 h-4 text-indigo-400" />
            <span>{t.viewDemoCredits}</span>
          </button>
          
          {user.plan === 'FREE' && (
            <button
              onClick={() => onNavigate('shop')}
              className="bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold px-4 py-2 rounded-lg text-sm shadow-md shadow-indigo-500/10 flex items-center gap-1 transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>{t.upgradeToPremium}</span>
            </button>
          )}
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1: Gemini Credits */}
        <div className="bg-slate-900/30 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t.credits}</span>
            <div className="text-2xl font-mono font-bold text-slate-100">{user.geminiCredits}</div>
            <span className="text-xs text-indigo-400">Verfügbare Einheiten</span>
          </div>
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Coins className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Daily Usage */}
        <div className="bg-slate-900/30 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t.dailyUsage}</span>
            <div className="text-2xl font-mono font-bold text-slate-100">{user.dailyUsage}</div>
            <span className="text-xs text-slate-500">Heutiger KI-Verbrauch</span>
          </div>
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-lg border border-teal-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Monthly Usage */}
        <div className="bg-slate-900/30 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t.monthlyUsage}</span>
            <div className="text-2xl font-mono font-bold text-slate-100">{user.monthlyUsage}</div>
            <span className="text-xs text-slate-500">Abrechnungsmonat</span>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg border border-purple-500/20">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Platform Plan */}
        <div className="bg-slate-900/30 border border-slate-800/80 p-5 rounded-xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t.activePlan}</span>
            <div className="text-2xl font-bold text-slate-100">{user.plan}</div>
            <span className="text-xs text-yellow-400 font-semibold cursor-pointer" onClick={() => onNavigate('shop')}>
              Upgrade verwalten ➔
            </span>
          </div>
          <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-lg border border-yellow-500/20">
            <Zap className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Charts & Activity panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Interactive Telemetry Chart */}
        <div className="lg:col-span-2 bg-slate-900/20 border border-slate-800 p-6 rounded-xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-900 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-400" />
                <span>KI-Analysen & Credit-Protokoll</span>
              </h3>
              <p className="text-xs text-slate-500">Live-Statistik über die letzten 7 Tage.</p>
            </div>
            
            <div className="flex gap-1.5 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
              <button
                onClick={() => setActiveChartTab('credits')}
                className={`px-3 py-1.5 rounded-md transition-all font-medium cursor-pointer ${activeChartTab === 'credits' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Credits
              </button>
              <button
                onClick={() => setActiveChartTab('usage')}
                className={`px-3 py-1.5 rounded-md transition-all font-medium cursor-pointer ${activeChartTab === 'usage' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Requests
              </button>
            </div>
          </div>

          {/* Core SVG Chart layout */}
          <div className="relative h-64 w-full bg-slate-950/60 rounded-xl p-4 flex flex-col justify-between border border-slate-900">
            
            {/* Grid Line lines */}
            <div className="absolute inset-0 flex flex-col justify-between p-4 py-8 pointer-events-none opacity-[0.03]">
              <div className="border-b border-slate-100 w-full" />
              <div className="border-b border-slate-100 w-full" />
              <div className="border-b border-slate-100 w-full" />
              <div className="border-b border-slate-100 w-full" />
            </div>

            {/* Custom SVG Drawing */}
            <div className="h-full w-full flex items-end justify-between gap-4 pt-4 px-2">
              {weeklyUsage.map((val, idx) => {
                const percent = (val / maxVal) * 100;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-10 scale-0 group-hover:scale-100 transition-all bg-slate-900 border border-slate-800 text-slate-200 text-[10px] font-mono px-2 py-1 rounded shadow-lg z-10 whitespace-nowrap">
                      {val} Credits consumed
                    </div>
                    {/* Bar graphic */}
                    <div className="w-full bg-slate-900/60 border border-slate-800/40 rounded-t-lg overflow-hidden h-40 flex items-end">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${percent}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.05 }}
                        className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg group-hover:brightness-110 transition-all"
                      />
                    </div>
                    {/* label */}
                    <span className="text-[10px] font-mono text-slate-500 mt-2.5">{daysOfWeek[idx]}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick diagnostic helper summary below graph */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-lg">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Peak-Day Limit</span>
              <span className="font-mono text-sm font-semibold text-indigo-400">{maxVal} Credits</span>
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-lg">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Total Transactions</span>
              <span className="font-mono text-sm font-semibold text-slate-300">{transactions.length} txs</span>
            </div>
            <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-lg">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest block">Core API Health</span>
              <span className="text-sm font-semibold text-emerald-400 flex items-center justify-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Stable
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Platform Integration Status & System Alerts */}
        <div className="space-y-6">
          {/* Notifications Panel */}
          <div className="bg-slate-900/20 border border-slate-800 p-5 rounded-xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
                <Bell className="w-4 h-4 text-indigo-400 animate-bounce" />
                <span>Benachrichtigungen ({notifications.filter(n => !n.isRead).length})</span>
              </h3>
              {notifications.some(n => !n.isRead) && (
                <button
                  onClick={onMarkNotificationsRead}
                  className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                >
                  Alle gelesen markieren
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {notifications.length === 0 ? (
                <p className="text-slate-500 text-xs text-center py-4">Keine neuen Meldungen.</p>
              ) : (
                notifications.map((not, idx) => (
                  <div 
                    key={not.id || idx} 
                    className={`p-3 rounded-lg border text-xs leading-relaxed transition-all ${
                      not.isRead ? 'bg-slate-950/20 border-slate-900/60 text-slate-400' : 'bg-slate-950 border-indigo-900/40 text-slate-200 font-medium'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className={`font-semibold capitalize text-[10px] ${
                        not.type === 'success' ? 'text-teal-400' : not.type === 'warning' ? 'text-yellow-400' : not.type === 'error' ? 'text-red-400' : 'text-indigo-400'
                      }`}>
                        ● {not.type}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">{new Date(not.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                    <p>{not.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Integration Connectors Status */}
          <div className="bg-slate-900/20 border border-slate-800 p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>Verbundene Entwickler-Systeme</span>
            </h3>

            <div className="space-y-3 text-xs">
              {/* Connector 1: Roblox Server Logs */}
              <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-900 rounded-lg">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-300 block">Roblox Integration</span>
                  <span className="text-[10px] text-slate-500">Universe ID: {team ? "5981240211" : "Keine verknüpft"}</span>
                </div>
                <span className="px-2 py-1 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> ACTIVE
                </span>
              </div>

              {/* Connector 2: Discord Bot Stream */}
              <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-900 rounded-lg">
                <div className="space-y-0.5">
                  <span className="font-semibold text-slate-300 block">Discord Client Bot</span>
                  <span className="text-[10px] text-slate-500">Guild Link Status</span>
                </div>
                <span className="px-2 py-1 rounded bg-teal-500/10 border border-teal-500/20 text-teal-400 text-[10px] font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" /> ONLINE
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit transaction log table */}
      <div className="bg-slate-900/20 border border-slate-800 p-6 rounded-xl space-y-4">
        <h3 className="text-lg font-bold text-slate-200">Kürzliche Credit-Transaktionen</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">ID</th>
                <th className="pb-3 font-semibold">Aktionstyp</th>
                <th className="pb-3 font-semibold">Beschreibung</th>
                <th className="pb-3 font-semibold">Betrag</th>
                <th className="pb-3 font-semibold">Datum</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">Noch keine Transaktionen vorhanden.</td>
                </tr>
              ) : (
                transactions.map((tx, idx) => (
                  <tr key={tx.id || idx} className="border-b border-slate-900/40 text-slate-300 hover:bg-slate-900/20">
                    <td className="py-3 font-mono text-slate-500 text-[10px]">{tx.id.slice(0, 10)}</td>
                    <td className="py-3 font-bold">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                        tx.amount > 0 ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{tx.description}</td>
                    <td className={`py-3 font-mono font-semibold ${tx.amount > 0 ? 'text-teal-400' : 'text-slate-300'}`}>
                      {tx.amount > 0 ? `+${tx.amount}` : tx.amount} Credits
                    </td>
                    <td className="py-3 text-[10px] text-slate-500">{new Date(tx.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
