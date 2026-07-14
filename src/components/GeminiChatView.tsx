import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, Sparkles, Image, FileText, Code, Trash, Plus, ChevronLeft, ChevronRight, 
  Copy, Check, AlertCircle, RefreshCw, Paperclip, X, Clock, Terminal, Bot 
} from 'lucide-react';
import { Language, UserProfile, ChatSession, ChatMessage } from '../types';
import { translations } from '../locales';

interface GeminiChatViewProps {
  lang: Language;
  user: UserProfile;
  chats: ChatSession[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onAddChat: (title?: string) => void;
  onDeleteChat: (id: string) => void;
  onSendMessage: (text: string, image?: string, file?: any) => Promise<any>;
  onReloadDemoCredits: () => void;
}

export default function GeminiChatView({
  lang,
  user,
  chats,
  activeChatId,
  onSelectChat,
  onAddChat,
  onDeleteChat,
  onSendMessage,
  onReloadDemoCredits
}: GeminiChatViewProps) {
  const t = translations[lang];
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<{ name: string; size: number; type: string; content?: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [cooldownCountdown, setCooldownCountdown] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId) || null;

  // Track active cooldowns dynamically
  useEffect(() => {
    const interval = setInterval(() => {
      if (user.cooldownUntil) {
        const diff = new Date(user.cooldownUntil).getTime() - Date.now();
        if (diff <= 0) {
          setCooldownCountdown(null);
        } else {
          const hours = Math.floor(diff / 3600000).toString().padStart(2, '0');
          const minutes = Math.floor((diff % 3600000) / 60000).toString().padStart(2, '0');
          const seconds = Math.floor((diff % 60000) / 1000).toString().padStart(2, '0');
          setCooldownCountdown(`${hours}:${minutes}:${seconds}`);
        }
      } else {
        setCooldownCountdown(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [user.cooldownUntil]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages?.length, sending]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile({
          name: file.name,
          size: file.size,
          type: file.type,
          content: reader.result as string
        });
      };
      reader.readAsText(file);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedImage && !selectedFile) return;

    // Check cooldown
    if (cooldownCountdown) return;

    setSending(true);
    const textToSend = selectedFile 
      ? `[DATEI HOCHGELADEN: ${selectedFile.name} (${selectedFile.type})]\n\nInhalt:\n\`\`\`\n${selectedFile.content || ''}\n\`\`\`\n\nFrage des Benutzers:\n${inputText}`
      : inputText;

    try {
      await onSendMessage(textToSend, selectedImage || undefined, selectedFile ? { name: selectedFile.name, size: selectedFile.size, type: selectedFile.type } : undefined);
      setInputText('');
      setSelectedImage(null);
      setSelectedFile(null);
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    {
      title: lang === 'de' ? 'Roblox Join-Logger' : 'Roblox Join-Logger',
      prompt: lang === 'de' ? 'Generiere ein Roblox Lua Script für Join/Leave Logs an einen Discord Webhook.' : 'Generate a Roblox Lua script that posts player join/leave logs to a Discord webhook.'
    },
    {
      title: lang === 'de' ? 'Discord Slash Command' : 'Discord Slash Command',
      prompt: lang === 'de' ? 'Erstelle einen Discord.js v14 Slash Command für ein Benutzer-Mute-System.' : 'Build a Discord.js v14 Slash Command for muting a player with database support.'
    },
    {
      title: lang === 'de' ? 'API Key verschlüsseln' : 'Encrypt API Keys',
      prompt: lang === 'de' ? 'Erkläre mir, wie ich API-Schlüssel sicher in einer Node.js Express Anwendung verwalte.' : 'Explain how to securely manage and store developer API keys in an Express.js backend.'
    }
  ];

  // Helper parser for simple formatting of code-blocks and raw texts
  const renderMessageContent = (text: string, msgId: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const lines = part.split('\n');
        const langHeader = lines[0].replace('```', '').trim() || 'javascript';
        const codeText = lines.slice(1, -1).join('\n');
        const codeId = `${msgId}-code-${index}`;

        return (
          <div key={index} className="my-3.5 border border-slate-800 rounded-lg overflow-hidden bg-slate-950/80 font-mono text-xs">
            <div className="bg-slate-900 px-4 py-2 flex justify-between items-center text-slate-400 border-b border-slate-950">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                {langHeader}
              </span>
              <button
                onClick={() => handleCopyCode(codeText, codeId)}
                className="hover:text-slate-200 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {copiedId === codeId ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-slate-300 leading-relaxed max-h-96">
              <code>{codeText}</code>
            </pre>
          </div>
        );
      } else {
        // Render simple inline code or newlines
        return (
          <p key={index} className="whitespace-pre-wrap leading-relaxed text-sm">
            {part.split(/(`[^`]+`)/g).map((subPart, subIdx) => {
              if (subPart.startsWith('`')) {
                return (
                  <code key={subIdx} className="bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-indigo-400 font-mono text-xs">
                    {subPart.replace(/`/g, '')}
                  </code>
                );
              }
              return subPart;
            })}
          </p>
        );
      }
    });
  };

  return (
    <div className="flex h-[calc(screen-200px)] min-h-[580px] bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden relative">
      
      {/* Dynamic Cooldown overlay modal if active */}
      {cooldownCountdown && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col justify-center items-center text-center p-6 space-y-6">
          <Clock className="w-16 h-16 text-yellow-500 animate-pulse bg-yellow-500/10 p-4 rounded-full border border-yellow-500/20" />
          <div className="space-y-2 max-w-md">
            <h3 className="text-xl font-bold text-slate-100">{t.cooldownActive}!</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              {lang === 'de' 
                ? 'Du hast dein stündliches/tägliches Freikontingent aufgebraucht. Bitte lade dein Demoguthaben auf oder warte auf die automatische Zurücksetzung.' 
                : 'You have depleted your allocated token/credit quota. Please purchase/reload sandbox demo credits or wait for your plan hourly reset.'}
            </p>
          </div>
          <div className="text-4xl font-mono font-bold text-yellow-500 tracking-wider">
            {cooldownCountdown}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onReloadDemoCredits}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-2.5 rounded-lg text-sm shadow-lg shadow-indigo-500/10 transition-all cursor-pointer"
            >
              Credits aufladen (Free Topup)
            </button>
            <button
              onClick={() => onSelectChat('dummy-cancel-cooldown')} // force close warning visually by clicking away or trigger profile resetting
              className="text-slate-500 hover:text-slate-300 text-xs transition-all font-medium"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Sidebar: Collapsible session selection list */}
      <div 
        className={`${
          sidebarOpen ? 'w-64 sm:w-72' : 'w-0'
        } shrink-0 bg-slate-900/40 border-r border-slate-900 flex flex-col justify-between transition-all duration-300 overflow-hidden relative`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-slate-900 flex justify-between items-center gap-2">
            <span className="font-bold text-xs uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>Conversations</span>
            </span>
            <button
              onClick={() => onAddChat()}
              className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-indigo-400 p-2 rounded-lg transition-all flex items-center gap-1 cursor-pointer"
              title="Neues Gespräch"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Session List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 max-h-[380px]">
            {chats.length === 0 ? (
              <p className="text-slate-500 text-xs text-center py-6">Keine Chatverläufe.</p>
            ) : (
              chats.map((ch) => (
                <div
                  key={ch.id}
                  onClick={() => onSelectChat(ch.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between gap-2 group transition-all cursor-pointer ${
                    activeChatId === ch.id 
                      ? 'bg-indigo-600/10 border-indigo-500/30 text-slate-100' 
                      : 'bg-transparent border-transparent hover:bg-slate-900/30 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <Sparkles className={`w-4 h-4 shrink-0 ${activeChatId === ch.id ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span className="text-xs truncate font-medium">{ch.title}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(ch.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-red-400 p-1 hover:bg-slate-950/60 rounded transition-all cursor-pointer"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* User credits indicators on sidebar bottom */}
        <div className="p-4 border-t border-slate-900 bg-slate-950/40 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">Verfügbare Credits:</span>
            <span className="font-mono font-bold text-indigo-400">{user.geminiCredits}</span>
          </div>
          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-teal-400 h-full transition-all" 
              style={{ width: `${Math.min(100, (user.geminiCredits / 2500) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main chat viewport */}
      <div className="flex-1 flex flex-col justify-between bg-slate-950 relative">
        {/* Toggle sidebar button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute left-4 top-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 p-2 rounded-lg transition-all z-10 cursor-pointer"
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Upper Diagnostic Banner */}
        <div className="px-16 py-4 border-b border-slate-900 flex justify-between items-center text-xs bg-slate-900/10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-semibold text-slate-300">
              {activeChat ? activeChat.title : lang === 'de' ? 'Wähle ein Gespräch' : 'Select a conversation'}
            </span>
          </div>
          <div className="text-slate-500 font-mono text-[10px] hidden sm:block">
            Muster-Tarif: <span className="text-indigo-400">{user.plan}</span> | Host: <span className="text-teal-400">Express-Engine</span>
          </div>
        </div>

        {/* Messages feed */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[460px]">
          {!activeChat ? (
            /* Choose or start chat view */
            <div className="h-full flex flex-col justify-center items-center text-center space-y-6 max-w-xl mx-auto py-12">
              <Sparkles className="w-12 h-12 text-indigo-400 bg-indigo-500/10 p-3 rounded-full border border-indigo-500/20" />
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-100">Starte ein neues KI-Gespräch</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Löse komplexe Programmierprobleme, analysiere Screenshots von Benutzeroberflächen oder lasse dir Skripte für deine Roblox- und Discord-Projekte anpassen.
                </p>
              </div>

              {/* Quick Prompts options */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                {quickPrompts.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      onAddChat(qp.title);
                      setTimeout(() => {
                        setInputText(qp.prompt);
                      }, 100);
                    }}
                    className="p-3 text-left bg-slate-900/30 hover:bg-slate-900/60 border border-slate-800 rounded-xl transition-all space-y-1.5 cursor-pointer text-xs"
                  >
                    <span className="font-bold text-indigo-400 block">{qp.title}</span>
                    <span className="text-slate-400 line-clamp-2 text-[11px] leading-relaxed">{qp.prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : activeChat.messages.length === 0 ? (
            /* Chat is active but has zero messages */
            <div className="h-full flex flex-col justify-center items-center text-center text-slate-500 text-xs py-20">
              <Bot className="w-10 h-10 text-indigo-500/20 mb-3" />
              <p>Schreibe deine erste Nachricht, um die Gemini-Schnittstelle zu aktivieren.</p>
            </div>
          ) : (
            /* Render active messages list */
            <div className="space-y-4">
              {activeChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-4 p-4 rounded-xl border ${
                    msg.sender === 'user' 
                      ? 'bg-slate-900/30 border-slate-800/80 ml-12 flex-row-reverse text-right' 
                      : 'bg-slate-900/10 border-slate-900 mr-12 text-left'
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                    msg.sender === 'user' 
                      ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400' 
                      : 'bg-purple-600/10 border-purple-500/20 text-purple-400'
                  }`}>
                    {msg.sender === 'user' ? 'U' : 'G'}
                  </div>

                  {/* Text + Media display wrapper */}
                  <div className="space-y-2.5 flex-1 overflow-hidden">
                    <div className="flex items-center gap-2 justify-between">
                      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">
                        {msg.sender === 'user' ? 'Dein Prompt' : 'Gemini AI Response'}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Display attached image if any */}
                    {msg.image && (
                      <div className="my-2 max-w-sm rounded-lg overflow-hidden border border-slate-800 bg-slate-950 p-1 flex justify-start">
                        <img src={msg.image} alt="User attachment" className="max-h-48 object-contain rounded" referrerPolicy="no-referrer" />
                      </div>
                    )}

                    {/* Display file tag if any */}
                    {msg.file && (
                      <div className="my-2 p-2.5 bg-slate-950 border border-slate-800 rounded-lg inline-flex items-center gap-2.5 text-xs text-slate-300">
                        <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span className="font-medium font-mono">{msg.file.name}</span>
                        <span className="text-slate-500">({Math.round(msg.file.size / 1024)} KB)</span>
                      </div>
                    )}

                    {/* Message Text Block */}
                    <div className="text-slate-300 leading-relaxed text-left">
                      {renderMessageContent(msg.text, msg.id)}
                    </div>

                    {msg.creditsUsed !== undefined && msg.creditsUsed > 0 && (
                      <div className="pt-2 text-[10px] font-mono text-slate-500">
                        Verbrauchte Einheiten: <span className="text-indigo-400 font-semibold">{msg.creditsUsed} Credits</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Spinner if message generating */}
              {sending && (
                <div className="flex gap-4 p-4 rounded-xl border bg-slate-900/5 border-slate-900 mr-12 text-left">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center animate-spin">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-semibold">Gemini is writing...</span>
                    <div className="h-4 bg-slate-900 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-slate-900 rounded w-1/2 animate-pulse mt-1" />
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Text Form Area */}
        {activeChat && (
          <div className="p-4 border-t border-slate-900 bg-slate-950 space-y-3.5">
            
            {/* Attachments previews bar */}
            {(selectedImage || selectedFile) && (
              <div className="flex gap-3 flex-wrap">
                {selectedImage && (
                  <div className="relative p-1 bg-slate-900 border border-slate-800 rounded-lg max-w-[120px] shrink-0">
                    <img src={selectedImage} alt="Preview" className="h-14 w-full object-cover rounded" referrerPolicy="no-referrer" />
                    <button
                      onClick={() => setSelectedImage(null)}
                      className="absolute -top-1.5 -right-1.5 bg-red-600 hover:bg-red-500 text-white rounded-full p-1 shadow-md transition-all cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                {selectedFile && (
                  <div className="relative p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-xs flex items-center gap-2 shrink-0">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    <span className="font-mono max-w-[150px] truncate">{selectedFile.name}</span>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="text-slate-500 hover:text-slate-300 transition-all cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Input & attachments actions buttons bar */}
            <form onSubmit={handleSend} className="flex gap-2 items-center">
              
              {/* Hidden file inputs */}
              <input
                type="file"
                ref={imageInputRef}
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <input
                type="file"
                ref={fileInputRef}
                accept=".txt,.js,.ts,.json,.lua,.py,.go"
                onChange={handleFileChange}
                className="hidden"
              />

              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => imageInputRef.current?.click()}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 p-2.5 rounded-lg border border-slate-800 transition-all cursor-pointer"
                  title="Bild hochladen (Image analysis - 40 Credits)"
                >
                  <Image className="w-4.5 h-4.5" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-indigo-400 p-2.5 rounded-lg border border-slate-800 transition-all cursor-pointer"
                  title="Datei hochladen (Text/Code analysis - size-based Credits)"
                >
                  <Paperclip className="w-4.5 h-4.5" />
                </button>
              </div>

              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={lang === 'de' ? 'Stelle eine Frage zu Roblox, Discord, Code...' : 'Ask about Roblox, Discord bots, Lua script adjustments...'}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg py-2.5 px-4 text-sm focus:outline-none focus:border-indigo-500 text-slate-100 placeholder:text-slate-500"
              />

              <button
                type="submit"
                disabled={sending || (!inputText.trim() && !selectedImage && !selectedFile)}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/80 text-white p-2.5 rounded-lg transition-all shadow-md shadow-indigo-500/15 cursor-pointer"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </form>

            <div className="flex justify-between items-center text-[10px] text-slate-500 px-1">
              <span>➔ Chat-Prompt: <span className="text-indigo-400">10 Credits</span> | Bild-Analyse: <span className="text-indigo-400">50 Credits</span></span>
              <span>Modell: <span className="text-slate-400 font-bold">gemini-3.5-flash</span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
