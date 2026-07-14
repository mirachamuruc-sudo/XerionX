import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, LayoutDashboard, Users, ShoppingBag, Terminal, Zap, Key, Settings, HelpCircle, X, ChevronRight, ChevronLeft 
} from 'lucide-react';
import { Language } from '../types';
import { translations } from '../locales';

interface OnboardingProps {
  lang: Language;
  onClose: () => void;
}

export default function Onboarding({ lang, onClose }: OnboardingProps) {
  const t = translations[lang];
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: <Sparkles className="w-12 h-12 text-indigo-400" />,
      title: lang === 'de' ? 'Willkommen bei OmniSaaS!' : 'Welcome to OmniSaaS!',
      desc: lang === 'de' 
        ? 'Lass uns eine kurze, interaktive Tour durch deine neue Entwickler-Zentrale machen. In wenigen Schritten erfährst du, wie du das volle Potenzial unserer integrierten KI und API-Tools ausschöpfst.'
        : 'Let\'s take a quick interactive tour of your developer headquarters. Learn how to unleash the maximum power of our built-in Gemini AI and developer API tools.'
    },
    {
      icon: <LayoutDashboard className="w-12 h-12 text-purple-400" />,
      title: lang === 'de' ? 'Das Zentrale Dashboard' : 'Your Central Dashboard',
      desc: lang === 'de'
        ? 'Behalte deine Credits, deinen täglichen KI-Verbrauch und deine API-Auslastung live im Blick. Hier siehst du Statistiken, Systembenachrichtigungen und den Verbindungsstatus deiner Roblox- und Discord-Systeme.'
        : 'Monitor active credits, daily AI usage, and API throughput live. Review interactive charts, system notification alerts, and active Roblox/Discord connector states.'
    },
    {
      icon: <Sparkles className="w-12 h-12 text-teal-400" />,
      title: lang === 'de' ? 'Gemini AI Chat & Workspace' : 'Gemini AI Chat & Workspace',
      desc: lang === 'de'
        ? 'Unser KI-Zentrum: Chatte live, lade Bilder für intelligente visuelle Analysen hoch oder lass dir Code schreiben und debuggen. Jede Anfrage verbraucht Credits, reguliert durch ein faires Cooldown-Sicherheits-System.'
        : 'Our AI hub: Chat in real time, upload image files for visual inspection, or generate pristine code. Prompts consume credits, managed securely via the cooldown safety protocol.'
    },
    {
      icon: <Users className="w-12 h-12 text-pink-400" />,
      title: lang === 'de' ? 'Team Workspaces & Rollen' : 'Team Workspaces & Roles',
      desc: lang === 'de'
        ? 'Erstelle eigene Entwicklergilden! Lade Kollegen ein, weise detaillierte Rollen (Owner, Admin, Developer, Member) zu und teile gemeinschaftliche Credit-Guthaben oder API-Schlüssel gesichert im Team.'
        : 'Form custom developer guilds! Invite teammates, assign granular roles (Owner, Admin, Dev, Member), and distribute shared credit quotas and API credentials securely.'
    },
    {
      icon: <Terminal className="w-12 h-12 text-yellow-400" />,
      title: lang === 'de' ? 'Roblox & Discord Integration' : 'Roblox & Discord Integrations',
      desc: lang === 'de'
        ? 'Der Traum für Roblox-Devs: Konfiguriere Universe-IDs und generiere voll funktionsfähige Lua-Skripte (z.B. für Leaderstats, DataStore-Saves oder Join-Logs), die du sofort kopieren und in Studio nutzen kannst.'
        : 'Designed for Roblox developers: Configure Universe-IDs and generate modular Lua scripts (such as leaderstats, DataStores, join/leave loggers) directly copy-pasteable into Studio.'
    },
    {
      icon: <Zap className="w-12 h-12 text-blue-400" />,
      title: lang === 'de' ? 'Webhooks & API Keys' : 'Webhooks & API Key Vault',
      desc: lang === 'de'
        ? 'Nutze den verschlüsselten API-Tresor für Gemini-, GitHub- und Discord-Keys. Erstelle und triggere Live-Webhooks und beobachte Logdaten im detaillierten Zustellungsverlauf.'
        : 'Access the encrypted API Key Vault to stash credentials. Create and trigger webhooks live, inspecting body payloads and response statuses inside our unified telemetry logger.'
    },
    {
      icon: <ShoppingBag className="w-12 h-12 text-emerald-400" />,
      title: lang === 'de' ? 'Premium Shop & Abrechnung' : 'Shop & Sandbox Billings',
      desc: lang === 'de'
        ? 'Brauchst du mehr Power? Upgrade auf Premium- oder Team-Pläne, lade dein Credit-Konto auf und teste Rabattcodes wie "PRO50" (50% Rabatt) oder "OMNI100" (Kostenloser Premium-Testzugang) mit direktem Rechnungs-Download.'
        : 'Need more power? Upgrade to Premium/Team tiers, buy credit packs, and test promotional codes such as "PRO50" (50% Off) or "OMNI100" (Free premium test plan) with direct invoice downloads.'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden relative p-8 flex flex-col justify-between min-h-[420px]"
      >
        {/* Top bar */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-1.5 text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
            <Settings className="w-3.5 h-3.5 animate-spin" />
            <span>Tour: Step {currentStep + 1} of {steps.length}</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-all p-1 hover:bg-slate-800 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dynamic Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center text-center space-y-4 my-auto"
          >
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-full shadow-inner mb-2">
              {steps[currentStep].icon}
            </div>
            <h3 className="text-xl font-bold text-slate-100">{steps[currentStep].title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">{steps[currentStep].desc}</p>
          </motion.div>
        </AnimatePresence>

        {/* Actions Footer */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-800/80">
          <button
            onClick={onClose}
            className="text-xs text-slate-500 hover:text-slate-300 font-medium cursor-pointer"
          >
            {t.onboardingSkip}
          </button>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-sm transition-all flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>{t.onboardingPrev}</span>
              </button>
            )}
            
            <button
              onClick={handleNext}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all shadow-md shadow-indigo-500/10 flex items-center gap-1 cursor-pointer"
            >
              <span>{currentStep === steps.length - 1 ? t.onboardingFinish : t.onboardingNext}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
