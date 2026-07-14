import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Sparkles, AlertCircle, CheckCircle, Languages, Eye, EyeOff } from 'lucide-react';
import { Language, UserProfile } from '../types';
import { translations } from '../locales';

interface AuthScreenProps {
  lang: Language;
  onSetLang: (lang: Language) => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export default function AuthScreen({ lang, onSetLang, onLoginSuccess }: AuthScreenProps) {
  const t = translations[lang];
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // 2FA states
  const [show2FA, setShow2FA] = useState(false);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Set up listener for real popup OAuth callbacks (from server callback endpoints)
  React.useEffect(() => {
    const handleOAuthMessage = (event: MessageEvent) => {
      const origin = event.origin;
      // Allow local development and container preview origins
      if (!origin.endsWith('.run.app') && !origin.includes('localhost') && !origin.includes('127.0.0.1')) {
        return;
      }
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        if (event.data.user) {
          onLoginSuccess(event.data.user);
        } else {
          setError(lang === 'de' ? 'Fehler beim Abrufen der OAuth-Benutzerdaten.' : 'Error fetching OAuth user details.');
        }
        setLoading(false);
      } else if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setError(event.data.error || 'OAuth-Fehler');
        setLoading(false);
      }
    };

    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, [onLoginSuccess, lang]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login fehlgeschlagen');
        
        // Handle 2FA trigger
        if (data.require2FA) {
          setShow2FA(true);
          setTempToken(data.tempToken);
          setInfo(lang === 'de' ? 'Ein 6-stelliger 2FA-Sicherheitscode wurde an Ihre E-Mail gesendet.' : 'A 6-digit 2FA security code has been sent to your email.');
        } else {
          onLoginSuccess(data.user);
        }
      } else if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, username, language: lang })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registrierung fehlgeschlagen');
        onLoginSuccess(data.user);
      } else {
        // Forgot Password
        const res = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Fehler beim Senden');
        setInfo(t.verificationSent);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: otpCode, tempToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '2FA Verifizierung fehlgeschlagen');
      
      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'discord') => {
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      // Fetch the live OAuth authorize URL from the backend
      const res = await fetch(`/api/auth/${provider}/url`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'OAuth-Fehler beim Abrufen der URL');
      }

      // Open the OAuth provider URL directly in a secure popup
      const width = 600;
      const height = 750;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;

      const popup = window.open(
        data.url,
        `${provider}_oauth_popup`,
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
      );

      if (!popup) {
        throw new Error(lang === 'de' ? 'Popup blockiert! Bitte erlauben Sie Popups für diese Website, um fortzufahren.' : 'Popup blocked! Please allow popups to continue.');
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4">
      
      {/* Background Orbs */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      {/* Logo Area */}
      <div className="mb-8 text-center space-y-2 relative">
        <div className="flex justify-center items-center gap-2 text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-indigo-300">
          <Sparkles className="w-8 h-8 text-indigo-400" />
          <span>{t.brand}</span>
        </div>
        <p className="text-slate-500 text-xs uppercase tracking-widest">{t.tagline}</p>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-slate-900/40 border border-slate-800 rounded-2xl p-8 backdrop-blur-md shadow-2xl relative"
      >
        {/* Languages absolute switch */}
        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 rounded-full px-2 py-1 text-xs">
          <Languages className="w-3.5 h-3.5 text-slate-400" />
          <button
            onClick={() => onSetLang('de')}
            className={`cursor-pointer ${lang === 'de' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
          >
            DE
          </button>
          <span className="text-slate-700">|</span>
          <button
            onClick={() => onSetLang('en')}
            className={`cursor-pointer ${lang === 'en' ? 'text-indigo-400 font-bold' : 'text-slate-400'}`}
          >
            EN
          </button>
        </div>

        {/* Dynamic header depending on the mode */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100">
            {mode === 'login' ? t.welcomeBack : mode === 'register' ? t.createAccount : t.resetPassword}
          </h2>
          {mode === 'forgot' && (
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {t.forgotPassSubtitle}
            </p>
          )}
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2.5 text-red-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success / Info notification */}
        {info && (
          <div className="mb-4 p-3.5 bg-teal-500/10 border border-teal-500/20 rounded-lg flex items-start gap-2.5 text-teal-400 text-xs">
            <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{info}</span>
          </div>
        )}

        {show2FA ? (
          <form onSubmit={handleVerify2FA} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block text-center">
                {lang === 'de' ? '6-stelliger 2FA Sicherheitscode' : '6-Digit 2FA Security Code'}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 text-slate-100 font-mono tracking-widest text-center text-lg"
                  placeholder="123456"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium py-3 rounded-lg shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 transition-all text-sm mt-2 cursor-pointer"
            >
              {loading ? 'Verifying...' : lang === 'de' ? 'Code verifizieren' : 'Verify Code'}
            </button>
            
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => { setShow2FA(false); setTempToken(null); setInfo(null); setError(null); }}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
              >
                {lang === 'de' ? 'Abbrechen & Zurück' : 'Cancel & Go Back'}
              </button>
            </div>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.usernameLabel}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                      placeholder="e.g. MasterCoder"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.emailLabel}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                    placeholder="developer@omnisaas.dev"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t.passwordLabel}</label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                      >
                        {t.forgotPassword}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-lg py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-indigo-500 text-slate-100"
                      placeholder="••••••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-medium py-3 rounded-lg shadow-lg shadow-indigo-500/15 hover:shadow-indigo-500/25 transition-all text-sm mt-2 cursor-pointer"
              >
                {loading ? 'Processing...' : mode === 'login' ? t.login : mode === 'register' ? t.register : t.resetPassword}
              </button>
            </form>

            {mode !== 'forgot' && (
              <div className="mt-6 space-y-4">
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-800" />
                  <span className="flex-shrink mx-4 text-slate-500 text-xs uppercase tracking-widest">{t.orContinueWith}</span>
                  <div className="flex-grow border-t border-slate-800" />
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  <button
                    onClick={() => handleSocialLogin('google')}
                    className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                    </svg>
                    <span>Google</span>
                  </button>
                  <button
                    onClick={() => handleSocialLogin('discord')}
                    className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 font-medium cursor-pointer"
                  >
                    <svg className="w-4 h-4 shrink-0 text-indigo-400" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.57-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025 13 13 0 0 0-3.257 1.011.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.2 13.2 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.818-1.329a.05.05 0 0 0-.01-.059.05.05 0 0 0-.018-.011 8.8 8.8 0 0 1-1.248-.595.05.05 0 0 1-.005-.085q.088-.067.171-.137a.05.05 0 0 1 .057-.006c2.504 1.144 5.215 1.144 7.674 0a.05.05 0 0 1 .058.006q.083.07.172.137a.05.05 0 0 1-.005.086 8 8 0 0 1-1.25.595.05.05 0 0 0-.028.07c.247.466.52.908.819 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.233-6.444-1.258-9.107a.04.04 0 0 0-.02-.019M5.116 8.948c-.785 0-1.43-.722-1.43-1.611s.63-1.612 1.43-1.612c.803 0 1.437.727 1.43 1.612s-.627 1.611-1.43 1.611Zm4.702 0c-.785 0-1.43-.722-1.43-1.611s.63-1.612 1.43-1.612c.803 0 1.437.727 1.43 1.612s-.627 1.611-1.43 1.611Z"/>
                    </svg>
                    <span>Discord</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Navigation links below block */}
        <div className="mt-8 text-center text-xs">
          {!show2FA && (
            mode === 'login' ? (
              <button
                onClick={() => { setMode('register'); setError(null); setInfo(null); }}
                className="text-slate-400 hover:text-indigo-400 transition-all font-medium cursor-pointer"
              >
                {t.dontHaveAccount}
              </button>
            ) : (
              <button
                onClick={() => { setMode('login'); setError(null); setInfo(null); }}
                className="text-slate-400 hover:text-indigo-400 transition-all font-medium cursor-pointer"
              >
                {t.alreadyHaveAccount}
              </button>
            )
          )}
        </div>
      </motion.div>
    </div>
  );
}
