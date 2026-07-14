import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, LayoutDashboard, Bot, Users, Gamepad2, Settings, ShieldAlert, Key, 
  ShoppingBag, HelpCircle, LogOut, Moon, Sun, Languages, Bell, Menu, X, Coins,
  User, CheckCircle2, AlertTriangle, ChevronRight, Zap, RefreshCw
} from 'lucide-react';

import { 
  Language, UserProfile, Notification, Team, CreditTransaction, ChatSession, 
  TeamRole, RobloxConfig, DiscordConfig, Webhook, WebhookLog, ApiKeyEntry 
} from './types';
import { translations } from './locales';

// Import newly created sub-views and overlays
import LandingPage from './components/LandingPage';
import AuthScreen from './components/AuthScreen';
import Onboarding from './components/Onboarding';
import DashboardView from './components/DashboardView';
import GeminiChatView from './components/GeminiChatView';
import TeamsView from './components/TeamsView';
import RobloxView from './components/RobloxView';
import DiscordView from './components/DiscordView';
import WebhookView from './components/WebhookView';
import ApiKeyView from './components/ApiKeyView';
import ShopView from './components/ShopView';
import AdminPanelView from './components/AdminPanelView';

export default function App() {
  // Localization state
  const [lang, setLang] = useState<Language>('de');
  const t = translations[lang];

  // Global Auth Session
  const [user, setUser] = useState<UserProfile | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  // Active Screen / View selector
  // Views: 'home' (Landing page), 'dashboard', 'chat', 'teams', 'roblox', 'discord', 'webhooks', 'apikey', 'shop', 'admin'
  const [currentView, setCurrentView] = useState<string>('home');
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Onboarding tour status
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Dynamic dashboard lists state
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // Load existing session state on load
  useEffect(() => {
    fetch('/api/auth/profile')
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
          setCurrentView('dashboard');
          
          // Trigger onboarding automatically for brand new registrations/logins if not completed
          if (data.user.geminiCredits === 2500 && data.user.plan === 'FREE') {
            setShowOnboarding(true);
          }
        }
      })
      .catch(err => console.error("Session profile error:", err))
      .finally(() => setCheckingSession(false));
  }, []);

  // Sync dashboard lists if user logged in
  const syncDashboardData = async () => {
    if (!user) return;
    try {
      const [notRes, txRes, teamsRes, chatsRes] = await Promise.all([
        fetch('/api/notifications').then(r => r.json()),
        fetch('/api/transactions').then(r => r.json()),
        fetch('/api/teams').then(r => r.json()),
        fetch('/api/chats').then(r => r.json())
      ]);

      setNotifications(notRes.notifications || []);
      setTransactions(txRes.transactions || []);
      setTeams(teamsRes.teams || []);
      setChats(chatsRes.chats || []);
      
      if (chatsRes.chats?.length > 0 && !activeChatId) {
        setActiveChatId(chatsRes.chats[0].id);
      }
    } catch (err) {
      console.error("Failed to sync dashboard data:", err);
    }
  };

  useEffect(() => {
    if (user) {
      syncDashboardData();
    }
  }, [user]);

  // Handle Authentication successes
  const handleLoginSuccess = (profile: UserProfile) => {
    setUser(profile);
    setCurrentView('dashboard');
    // If user has premium credits or free brand-new, pop onboarding walkthrough
    if (profile.geminiCredits === 2500) {
      setShowOnboarding(true);
    }
  };

  // Sign out operation
  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setCurrentView('home');
      setTeams([]);
      setChats([]);
      setActiveChatId(null);
    } catch (err) {
      console.error(err);
    }
  };

  // Reload demo sandbox credits (FREE Refills topup)
  const handleReloadDemoCredits = async () => {
    if (!user) return;
    try {
      const res = await fetch('/api/auth/reload-credits', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setUser(data.user);
      syncDashboardData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Chat actions
  const handleAddChat = async (customTitle?: string) => {
    if (!user) return;
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: customTitle || (lang === 'de' ? 'Neues Gespräch' : 'New Thread') })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Refresh list
      const listRes = await fetch('/api/chats').then(r => r.json());
      setChats(listRes.chats || []);
      setActiveChatId(data.chatId);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteChat = async (id: string) => {
    try {
      await fetch(`/api/chats/${id}`, { method: 'DELETE' });
      const listRes = await fetch('/api/chats').then(r => r.json());
      setChats(listRes.chats || []);
      if (activeChatId === id) {
        setActiveChatId(listRes.chats?.[0]?.id || null);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSendMessage = async (text: string, image?: string, file?: any) => {
    if (!activeChatId) return;
    try {
      const res = await fetch(`/api/chats/${activeChatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, image, file })
      });
      const data = await res.json();
      if (!res.ok) {
        // Trigger profile refresh in case they triggered cooldown
        const profRes = await fetch('/api/auth/profile').then(r => r.json());
        if (profRes.user) setUser(profRes.user);
        throw new Error(data.error || 'Fehler beim Senden');
      }

      // Sync user profile state dynamically (updated credits)
      const profRes = await fetch('/api/auth/profile').then(r => r.json());
      if (profRes.user) setUser(profRes.user);

      // Refresh chats
      const chatsRes = await fetch('/api/chats').then(r => r.json());
      setChats(chatsRes.chats || []);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Team actions proxies
  const handleAddTeam = async (name: string, desc: string, logo: string, banner: string) => {
    const res = await fetch('/api/teams', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: desc, logo, banner })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    
    // sync
    syncDashboardData();
    return data;
  };

  const handleDeleteTeam = async (id: string) => {
    const res = await fetch(`/api/teams/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error);
    }
    syncDashboardData();
  };

  const handleAddMember = async (teamId: string, email: string, role: TeamRole, limit: number) => {
    const res = await fetch(`/api/teams/${teamId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role, limit })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error);
    }
    syncDashboardData();
  };

  const handleRemoveMember = async (teamId: string, userId: string) => {
    const res = await fetch(`/api/teams/${teamId}/members/${userId}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error);
    }
    syncDashboardData();
  };

  const handleAdjustMemberCredits = async (teamId: string, userId: string, limit: number) => {
    const res = await fetch(`/api/teams/${teamId}/members/${userId}/limit`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error);
    }
    syncDashboardData();
  };

  // Save Roblox/Discord configurations
  const handleSaveRobloxConfig = async (teamId: string, config: Partial<RobloxConfig>) => {
    const res = await fetch(`/api/teams/${teamId}/roblox`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error);
    }
  };

  const handleSaveDiscordConfig = async (teamId: string, config: Partial<DiscordConfig>) => {
    const res = await fetch(`/api/teams/${teamId}/discord`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error);
    }
  };

  // Webhooks management
  const handleAddWebhook = async (teamId: string, name: string, url: string, events: string[]) => {
    const res = await fetch(`/api/teams/${teamId}/webhooks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, url, events })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  };

  const handleDeleteWebhook = async (teamId: string, webhookId: string) => {
    const res = await fetch(`/api/teams/${teamId}/webhooks/${webhookId}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error);
    }
  };

  // API Key vault
  const handleSaveApiKey = async (teamId: string, name: string, service: string, keyVal: string) => {
    const res = await fetch(`/api/teams/${teamId}/keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, service, value: keyVal })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    return data;
  };

  const handleDeleteApiKey = async (teamId: string, entryId: string) => {
    const res = await fetch(`/api/teams/${teamId}/keys/${entryId}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error);
    }
  };

  const handlePurchaseCreditsSuccess = async (amount: number, price: number, planChange?: string) => {
    // Reload profile
    const profRes = await fetch('/api/auth/profile').then(r => r.json());
    if (profRes.user) setUser(profRes.user);
    syncDashboardData();
  };

  const handleMarkNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read', { method: 'POST' });
      syncDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center text-slate-400 space-y-4">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
        <span className="text-xs uppercase tracking-widest font-mono">Initializing System Node...</span>
      </div>
    );
  }

  // Active Team representation helper
  const activeTeamObj = teams[0] || null;

  return (
    <div className="bg-slate-950 min-h-screen text-slate-100 antialiased flex flex-col font-sans">
      
      {/* Onboarding tour guide modal overlay */}
      <AnimatePresence>
        {showOnboarding && (
          <Onboarding lang={lang} onClose={() => setShowOnboarding(false)} />
        )}
      </AnimatePresence>

      {/* LANDING PAGE ROUTING (Guest / Logged out or explicitly homepage) */}
      {currentView === 'home' && (
        <LandingPage 
          lang={lang} 
          onNavigate={(view) => {
            if (view === 'auth') setCurrentView('auth');
            else {
              const el = document.getElementById(view);
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onOpenAuth={(mode) => {
            setCurrentView('auth');
          }}
        />
      )}

      {/* LOGIN / REGISTRATION SYSTEM VIEW */}
      {currentView === 'auth' && !user && (
        <AuthScreen 
          lang={lang} 
          onSetLang={setLang} 
          onLoginSuccess={handleLoginSuccess} 
        />
      )}

      {/* FULL DASHBOARD / SYSTEM VIEW (Only when user logged in) */}
      {user && currentView !== 'home' && (
        <div className="flex-1 flex overflow-hidden min-h-screen">
          
          {/* Dynamic Sidebar (Desktop) */}
          <aside className="hidden md:flex w-64 bg-slate-900/30 border-r border-slate-900 flex-col justify-between p-4 shrink-0">
            <div className="space-y-6">
              {/* Logo / Title */}
              <div className="flex items-center gap-2.5 px-3 py-2 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <span className="font-extrabold tracking-tight text-slate-100">{t.brand}</span>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1">
                {[
                  { id: 'dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: t.dashboard },
                  { id: 'chat', icon: <Bot className="w-4 h-4" />, label: 'Gemini Chat' },
                  { id: 'teams', icon: <Users className="w-4 h-4" />, label: 'Teams' },
                  { id: 'roblox', icon: <Gamepad2 className="w-4 h-4" />, label: 'Roblox Sync' },
                  { id: 'discord', icon: <Bot className="w-4 h-4" />, label: 'Discord Bot' },
                  { id: 'webhooks', icon: <Zap className="w-4 h-4" />, label: 'Webhooks Gateway' },
                  { id: 'apikey', icon: <Key className="w-4 h-4" />, label: 'API Key Vault' },
                  { id: 'shop', icon: <ShoppingBag className="w-4 h-4" />, label: 'Booster Shop' }
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      currentView === item.id 
                        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/20 shadow-inner font-bold' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/20 border border-transparent'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}

                {/* Admin specific trigger */}
                {user.role === 'admin' && (
                  <button
                    onClick={() => setCurrentView('admin')}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all border ${
                      currentView === 'admin'
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'text-red-400/80 hover:text-red-400 hover:bg-red-500/5 border-transparent'
                    }`}
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>{lang === 'de' ? 'Admin Leitstand' : 'Admin Control'}</span>
                  </button>
                )}
              </nav>
            </div>

            {/* Sidebar Bottom section: Profile & Quick toggles */}
            <div className="space-y-4 border-t border-slate-900/60 pt-4">
              {/* Profile widget */}
              <div className="flex items-center gap-3 px-3 py-2 bg-slate-950/40 border border-slate-900 rounded-xl">
                <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center">
                  {user.username.slice(0, 1).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <span className="font-bold text-xs text-slate-200 block truncate">{user.username}</span>
                  <span className="text-[10px] text-indigo-400 font-mono block uppercase">{user.plan} PLAN</span>
                </div>
              </div>

              {/* Languages switch + Onboarding help trigger */}
              <div className="flex justify-between items-center px-1 text-slate-400 text-xs">
                <button
                  onClick={() => setShowOnboarding(true)}
                  className="flex items-center gap-1 hover:text-slate-200"
                  title="Hilfe-Tour starten"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Tour</span>
                </button>

                <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-900 rounded-full px-2 py-1 text-[10px]">
                  <button onClick={() => setLang('de')} className={`${lang === 'de' ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>DE</button>
                  <span className="text-slate-800">|</span>
                  <button onClick={() => setLang('en')} className={`${lang === 'en' ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>EN</button>
                </div>
              </div>

              {/* Log out */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 hover:text-slate-300 rounded-lg text-xs font-semibold cursor-pointer transition-all"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.logout}</span>
              </button>
            </div>
          </aside>

          {/* Dynamic Sidebar (Mobile hamburger version) */}
          <AnimatePresence>
            {showMobileSidebar && (
              <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[99] md:hidden">
                <motion.div
                  initial={{ x: -250 }}
                  animate={{ x: 0 }}
                  exit={{ x: -250 }}
                  className="w-64 bg-slate-900 min-h-screen p-4 flex flex-col justify-between"
                >
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                        <span className="font-extrabold text-slate-100">{t.brand}</span>
                      </div>
                      <button onClick={() => setShowMobileSidebar(false)} className="text-slate-400">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <nav className="space-y-1">
                      {[
                        { id: 'dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: t.dashboard },
                        { id: 'chat', icon: <Bot className="w-4 h-4" />, label: 'Gemini Chat' },
                        { id: 'teams', icon: <Users className="w-4 h-4" />, label: 'Teams' },
                        { id: 'roblox', icon: <Gamepad2 className="w-4 h-4" />, label: 'Roblox Sync' },
                        { id: 'discord', icon: <Bot className="w-4 h-4" />, label: 'Discord Bot' },
                        { id: 'webhooks', icon: <Zap className="w-4 h-4" />, label: 'Webhooks Gateway' },
                        { id: 'apikey', icon: <Key className="w-4 h-4" />, label: 'API Key Vault' },
                        { id: 'shop', icon: <ShoppingBag className="w-4 h-4" />, label: 'Booster Shop' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          onClick={() => { setCurrentView(item.id); setShowMobileSidebar(false); }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold ${
                            currentView === item.id ? 'bg-indigo-600/10 text-indigo-400 font-bold' : 'text-slate-400'
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-3 py-2 text-slate-400 text-xs font-semibold"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* Main content viewport container */}
          <main className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-8">
            
            {/* Upper mobile top navigation bar */}
            <div className="flex md:hidden justify-between items-center pb-4 border-b border-slate-900 mb-6">
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="text-slate-300 p-2 bg-slate-900 border border-slate-800 rounded-lg"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse" />
                <span className="font-extrabold text-slate-100">{t.brand}</span>
              </div>

              <div className="w-9 h-9 bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center font-bold text-sm">
                {user.username.slice(0, 1).toUpperCase()}
              </div>
            </div>

            {/* Render sub-views dynamically based on the state */}
            {currentView === 'dashboard' && (
              <DashboardView
                lang={lang}
                user={user}
                team={activeTeamObj}
                notifications={notifications}
                transactions={transactions}
                onMarkNotificationsRead={handleMarkNotificationsRead}
                onNavigate={setCurrentView}
                onReloadDemoCredits={handleReloadDemoCredits}
              />
            )}

            {currentView === 'chat' && (
              <GeminiChatView
                lang={lang}
                user={user}
                chats={chats}
                activeChatId={activeChatId}
                onSelectChat={setActiveChatId}
                onAddChat={handleAddChat}
                onDeleteChat={handleDeleteChat}
                onSendMessage={handleSendMessage}
                onReloadDemoCredits={handleReloadDemoCredits}
              />
            )}

            {currentView === 'teams' && (
              <TeamsView
                lang={lang}
                user={user}
                teams={teams}
                onAddTeam={handleAddTeam}
                onDeleteTeam={handleDeleteTeam}
                onAddMember={handleAddMember}
                onRemoveMember={handleRemoveMember}
                onAdjustMemberCredits={handleAdjustMemberCredits}
              />
            )}

            {currentView === 'roblox' && (
              <RobloxView
                lang={lang}
                user={user}
                team={activeTeamObj}
                onSaveConfig={handleSaveRobloxConfig}
              />
            )}

            {currentView === 'discord' && (
              <DiscordView
                lang={lang}
                user={user}
                team={activeTeamObj}
                onSaveConfig={handleSaveDiscordConfig}
              />
            )}

            {currentView === 'webhooks' && (
              <WebhookView
                lang={lang}
                user={user}
                team={activeTeamObj}
                onAddWebhook={handleAddWebhook}
                onDeleteWebhook={handleDeleteWebhook}
              />
            )}

            {currentView === 'apikey' && (
              <ApiKeyView
                lang={lang}
                user={user}
                team={activeTeamObj}
                onSaveKey={handleSaveApiKey}
                onDeleteKey={handleDeleteApiKey}
              />
            )}

            {currentView === 'shop' && (
              <ShopView
                lang={lang}
                user={user}
                onPurchaseCredits={handlePurchaseCreditsSuccess}
              />
            )}

            {currentView === 'admin' && (
              <AdminPanelView
                lang={lang}
                user={user}
              />
            )}

          </main>
        </div>
      )}

    </div>
  );
}
