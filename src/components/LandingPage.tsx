import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Terminal, Sparkles, Shield, Cpu, RefreshCw, Zap, Users, Code, MessagesSquare, 
  ChevronDown, HelpCircle, Send, ArrowRight, MessageSquareCode, Check, Star 
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../locales';

interface LandingPageProps {
  lang: Language;
  onNavigate: (view: string) => void;
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export default function LandingPage({ lang, onNavigate, onOpenAuth }: LandingPageProps) {
  const t = translations[lang];
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [formSubmitted, setFormSubmitted] = useState(false);

  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-indigo-400" />,
      title: lang === 'de' ? 'Gemini AI Chat & Analyse' : 'Gemini AI Chat & Analysis',
      desc: lang === 'de' ? 'Unterhalte dich mit fortschrittlichster KI, analysiere Bilder und lade Entwicklerdateien zur Fehlerbehebung hoch.' : 'Chat with leading generative AI, analyze screenshots, and upload developer files to debug code instantly.'
    },
    {
      icon: <Code className="w-6 h-6 text-purple-400" />,
      title: lang === 'de' ? 'Roblox Script Generator' : 'Roblox Script Generator',
      desc: lang === 'de' ? 'Generiere fehlerfreie, strukturierte Lua-Skripte für Join-Logs, DataStores, Moderation oder Server-Telemetrie.' : 'Generate optimized, production-ready Lua scripts for player join logs, DataStores, moderation systems, or server telemetry.'
    },
    {
      icon: <Cpu className="w-6 h-6 text-teal-400" />,
      title: lang === 'de' ? 'Discord Bot Controller' : 'Discord Bot Controller',
      desc: lang === 'de' ? 'Verwalte Bot-Token, baue Rich-Embed-Benachrichtigungen und leite automatische Spielereignisse auf deine Server.' : 'Manage developer bot tokens, build rich embeds, and stream real-time game events to your designated Discord server channels.'
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      title: lang === 'de' ? 'Zentralisiertes Webhook-System' : 'Centralized Webhook System',
      desc: lang === 'de' ? 'Erstelle und teste Discord-, Roblox- oder GitHub-Webhooks live mit Echtzeit-Zustellungsverlauf und detaillierten Head-Logs.' : 'Deploy and test Discord, Roblox, or GitHub webhooks with real-time delivery payloads, statusCode tracking, and logging.'
    },
    {
      icon: <Users className="w-6 h-6 text-pink-400" />,
      title: lang === 'de' ? 'Echte Team-Workspaces' : 'True Team Workspaces',
      desc: lang === 'de' ? 'Arbeite mit Kollegen zusammen. Verteile Credits, verwalte Rollen (Admin, Dev, Member) und überwache Logs.' : 'Collaborate with colleagues. Allocate monthly credits, assign strict team roles (Admin, Dev, Member), and review unified system logs.'
    },
    {
      icon: <Shield className="w-6 h-6 text-blue-400" />,
      title: lang === 'de' ? 'Sicherer API-Key-Tresor' : 'Secure API Key Vault',
      desc: lang === 'de' ? 'Sichere Passwörter und Tokens für Gemini, OpenAI, Supabase, Vercel und GitHub verschlüsselt auf Server-Ebene.' : 'Store developer keys (Gemini, OpenAI, Supabase, Vercel, GitHub) securely encrypted server-side, masked from client view.'
    }
  ];

  const faqs = [
    {
      q: lang === 'de' ? 'Wie funktioniert das Credit-System?' : 'How does the Credit system work?',
      a: lang === 'de' 
        ? 'Jedes Benutzerkonto erhält bei der Registrierung ein Startguthaben. Jede Chat-Interaktion, Bildanalyse oder API-Anfrage verbraucht Credits. Bei Erschöpfung greift ein intelligentes Cooldown-System zum Schutz vor Missbrauch.'
        : 'Every account receives starting credits. Chat messages, image analysis, and API queries consume credits. If credits run out, an intelligent cooldown timer acts to prevent abuse and manage API resources.'
    },
    {
      q: lang === 'de' ? 'Ist meine API-Schlüssel-Speicherung sicher?' : 'Is my API key storage secure?',
      a: lang === 'de'
        ? 'Ja. Alle eingetragenen Entwicklerschlüssel werden serverseitig verschlüsselt gespeichert und niemals im Klartext an den Browser übertragen. Zugriff erhalten ausschließlich autorisierte Owner oder Team-Admins.'
        : 'Yes. All developer keys are encrypted and processed on our secure full-stack backend. They are masked on the UI, and never exposed to client-side browsers, ensuring strict credentials safety.'
    },
    {
      q: lang === 'de' ? 'Kann ich Roblox und Discord miteinander koppeln?' : 'Can I bridge Roblox and Discord together?',
      a: lang === 'de'
        ? 'Absolut! Mit unseren Webhook-Schnittstellen und dem Lua Script Generator kannst du im Spiel auftretende Ereignisse (z. B. Spieler-Join oder Fehler) direkt als Rich Embed an deinen Discord-Kanal senden.'
        : 'Absolutely! Our Roblox integrations and Lua Script Generator allow you to forward in-game events (such as player joins, logs, or server errors) directly to Discord channels as high-contrast Rich Embeds.'
    }
  ];

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) return;
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setContactForm({ name: '', email: '', message: '' });
    }, 4000);
  };

  return (
    <div className="relative overflow-hidden bg-slate-950 text-slate-100 min-h-screen font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Background Decorative Glow Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-[40%] right-1/4 w-[600px] h-[600px] bg-purple-900/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-teal-950/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-indigo-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>{t.tagline}</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 via-indigo-200 to-teal-200 leading-tight">
            {t.heroTitle}
          </h1>

          <p className="text-lg text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
            {t.heroSubtitle}
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
            <button
              onClick={() => onOpenAuth('register')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-8 py-3.5 rounded-lg shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>{t.getStarted}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <a
              href="#features"
              className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white font-medium px-8 py-3.5 rounded-lg transition-all"
            >
              {t.viewFeatures}
            </a>
          </div>
        </motion.div>

        {/* Feature Dashboard Preview Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="mt-16 mx-auto max-w-5xl rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-md p-3 shadow-2xl relative"
        >
          <div className="absolute -top-3 left-10 flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          
          <div className="rounded-xl overflow-hidden bg-slate-950 p-6 text-left border border-slate-900">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Column: Terminal info */}
              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  <span className="font-mono text-sm text-slate-400">omnisaas-terminal@cloud-run</span>
                </div>
                <div className="font-mono text-xs sm:text-sm space-y-2 text-slate-300">
                  <p className="text-slate-500">// Bootstrapping live server components...</p>
                  <p><span className="text-teal-400">✔</span> Express REST API running on port 3000</p>
                  <p><span className="text-teal-400">✔</span> SQLite SQLite self-healing database linked</p>
                  <p><span className="text-indigo-400">✔</span> Google Gemini AI client initialized with model: <span className="text-purple-400">gemini-3.5-flash</span></p>
                  <p className="text-slate-500">// Testing webhooks routing connection...</p>
                  <p><span className="text-yellow-400">➔</span> Sending discord embed log event to channel #telemetry...</p>
                  <p className="text-green-400">[HTTP 200] Delivery success. Payload sent safely.</p>
                </div>
              </div>
              {/* Right Column: Visual Mock Widget */}
              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-800 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Live Credits Monitor</h4>
                  <div className="text-3xl font-mono font-bold text-slate-100 flex items-baseline gap-1">
                    <span>4,890</span>
                    <span className="text-xs text-indigo-400">/ 5,000 Credits</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full mt-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-teal-400 h-full w-[95%]" />
                  </div>
                </div>
                
                <div className="mt-4 border-t border-slate-800/80 pt-3 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Roblox Place ID:</span>
                    <span className="font-mono text-teal-400">14210982552</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Discord Bot:</span>
                    <span className="text-green-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Connected
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 px-4 max-w-7xl mx-auto border-t border-slate-900 scroll-mt-10">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
            {t.featuresTitle}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {t.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5, borderColor: 'rgba(99, 102, 241, 0.3)' }}
              className="bg-slate-900/30 backdrop-blur-sm border border-slate-800 p-6 rounded-xl space-y-4 transition-all hover:bg-slate-900/50"
            >
              <div className="p-3 bg-slate-950/60 rounded-lg w-fit border border-slate-800">
                {feat.icon}
              </div>
              <h3 className="text-lg font-semibold text-slate-100">{feat.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
            {t.pricingTitle}
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {t.pricingSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* FREE PLAN */}
          <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-100">FREE</h3>
                <p className="text-sm text-slate-400 mt-2">{t.freePlanDesc}</p>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-4xl font-bold text-slate-100">€0</span>
                <span className="text-slate-400">/ {lang === 'de' ? 'dauerhaft' : 'forever'}</span>
              </div>
              <ul className="space-y-3.5 text-sm text-slate-300 border-t border-slate-800 pt-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>500 Start-Credits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Basic Gemini 3.5 AI Chat</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1 Webhook-Kanal</span>
                </li>
                <li className="flex items-center gap-2 text-slate-500 line-through">
                  <span>Roblox Script Builder</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={() => onOpenAuth('register')}
              className="mt-8 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-lg font-medium transition-all cursor-pointer"
            >
              {lang === 'de' ? 'Kostenlos starten' : 'Start Free'}
            </button>
          </div>

          {/* PREMIUM PLAN */}
          <div className="bg-slate-900/40 border-2 border-indigo-500/50 p-8 rounded-2xl flex flex-col justify-between relative shadow-xl shadow-indigo-500/5">
            <div className="absolute top-4 right-4 bg-indigo-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-wider">
              <Star className="w-3 h-3 fill-current" />
              <span>Popular</span>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-100">PREMIUM</h3>
                <p className="text-sm text-slate-400 mt-2">{t.premiumPlanDesc}</p>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-4xl font-bold text-slate-100">€14.99</span>
                <span className="text-slate-400">/ {lang === 'de' ? 'Monat' : 'month'}</span>
              </div>
              <ul className="space-y-3.5 text-sm text-slate-300 border-t border-indigo-500/20 pt-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-indigo-300">5.000 Credits inklusive</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unbegrenzter Gemini Chat & Image Analysen</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Premium Lua Script Generator</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Discord Bot & Webhook Live Console</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={() => onOpenAuth('register')}
              className="mt-8 w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-medium shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              {lang === 'de' ? 'Premium freischalten' : 'Unlock Premium'}
            </button>
          </div>

          {/* TEAM PLAN */}
          <div className="bg-slate-900/30 border border-slate-800 p-8 rounded-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-100">TEAM</h3>
                <p className="text-sm text-slate-400 mt-2">{t.teamPlanDesc}</p>
              </div>
              <div className="flex items-baseline gap-1 font-mono">
                <span className="text-4xl font-bold text-slate-100">€49.99</span>
                <span className="text-slate-400">/ {lang === 'de' ? 'Monat' : 'month'}</span>
              </div>
              <ul className="space-y-3.5 text-sm text-slate-300 border-t border-slate-800 pt-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold text-teal-300">15.000 Team-Credits</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Team Workspaces & Rollenverwaltung</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Geteilter Roblox & Discord Tresor</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Prioritäts-API Support</span>
                </li>
              </ul>
            </div>
            <button 
              onClick={() => onOpenAuth('register')}
              className="mt-8 w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-3 rounded-lg font-medium transition-all cursor-pointer"
            >
              {lang === 'de' ? 'Team erstellen' : 'Deploy Team'}
            </button>
          </div>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-20 px-4 max-w-4xl mx-auto border-t border-slate-900">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
            {t.faqTitle}
          </h2>
          <p className="text-slate-400 text-sm">
            {t.faqSubtitle}
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-slate-800 rounded-xl bg-slate-900/10 overflow-hidden transition-all">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex justify-between items-center p-5 text-left font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-5 h-5 text-indigo-400 transition-all ${openFaq === index ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === index && (
                <div className="p-5 pt-0 text-slate-400 text-sm border-t border-slate-800/40 bg-slate-950/20 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 max-w-3xl mx-auto border-t border-slate-900 pb-32">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-300">
            {t.contactTitle}
          </h2>
          <p className="text-slate-400 text-sm">
            {t.contactSubtitle}
          </p>
        </div>

        <form onSubmit={handleContactSubmit} className="bg-slate-900/20 border border-slate-800 p-8 rounded-2xl space-y-5 backdrop-blur-md">
          {formSubmitted ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-6 text-center text-teal-400 font-medium"
            >
              <Check className="w-12 h-12 mx-auto mb-4 bg-teal-500/10 p-2.5 rounded-full border border-teal-500/20" />
              <p>{lang === 'de' ? 'Vielen Dank! Ihre Nachricht wurde sicher verschickt.' : 'Thank you! Your message has been sent successfully.'}</p>
            </motion.div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.nameLabel}</label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.emailLabel}</label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.messageLabel}</label>
                <textarea
                  rows={4}
                  required
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm focus:outline-none focus:border-indigo-500 text-slate-100 resize-none"
                  placeholder={lang === 'de' ? 'Wie können wir helfen?' : 'How can we help you?'}
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-3 rounded-lg shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.sendButton}</span>
                <Send className="w-4 h-4" />
              </button>
            </>
          )}
        </form>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-4 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 {t.brand} Inc. All rights reserved. Built with Gemini AI & Node.js on Cloud Run.</p>
          <div className="flex gap-4">
            <a href="#features" className="hover:text-slate-300 transition-all">Features</a>
            <a href="#pricing" className="hover:text-slate-300 transition-all">Pricing</a>
            <a href="#faq" className="hover:text-slate-300 transition-all">FAQ</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
