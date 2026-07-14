import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, Check, CreditCard, Gift, FileText, Sparkles, Download, Zap, RefreshCw, AlertCircle 
} from 'lucide-react';
import { Language, UserProfile, CreditTransaction } from '../types';
import { translations } from '../locales';

interface ShopViewProps {
  lang: Language;
  user: UserProfile;
  onPurchaseCredits: (amount: number, price: number, planChange?: string) => Promise<any>;
}

export default function ShopView({
  lang,
  user,
  onPurchaseCredits
}: ShopViewProps) {
  const t = translations[lang];

  // Coupon promo code states
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0); // fraction e.g. 0.5 for 50%, 1.0 for 100%
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Package states
  const [selectedPack, setSelectedPack] = useState<{ name: string; credits: number; price: number; type: 'refill' | 'tier' } | null>(null);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCVC, setCardCVC] = useState('123');

  const [loading, setLoading] = useState(false);
  const [successTx, setSuccessTx] = useState<{ id: string; name: string; amount: number; price: number; code?: string } | null>(null);

  // Subscriptions & packets items definitions
  const tiers = [
    { name: 'FREE', price: 0, credits: 50, features: ['50 Standard Credits / Tag', 'Roblox Lua Code Generator', 'Discord Embed Streamer', 'Community Support'] },
    { name: 'PREMIUM', price: 29.99, credits: 2500, features: ['2500 Premium Credits / Monat', 'Unbegrenzte Roblox & Discord Syncs', 'API Key Vault & Deliveries Gateway', 'Priorisierter Gemini-3.5 Cooldown', 'SLA Support'] },
    { name: 'ENTERPRISE', price: 149.99, credits: 15000, features: ['15.000 High-Capacity Credits', 'Dedizierter API Gateway Node', 'Voller Admin Workspace Dashboard', 'Premium SLA Support', 'Unbegrenzte Mitglieder'] }
  ];

  const refills = [
    { name: 'Mini Booster Pack', credits: 500, price: 9.99 },
    { name: 'Mega Booster Pack', credits: 2000, price: 29.99 },
    { name: 'Developer Sovereign Pack', credits: 5000, price: 59.99 }
  ];

  const handleApplyPromo = () => {
    setPromoError(null);
    const code = promoCode.trim().toUpperCase();
    if (code === 'PRO50') {
      setAppliedDiscount(0.5);
      setAppliedPromo('PRO50');
    } else if (code === 'OMNI100') {
      setAppliedDiscount(1.0);
      setAppliedPromo('OMNI100');
    } else {
      setPromoError(lang === 'de' ? 'Ungültiger Code! Versuche PRO50 (50%) oder OMNI100 (100% Premium-Test)' : 'Invalid promotion code! Try PRO50 (50%) or OMNI100 (100% Free Premium)');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPack) return;
    setLoading(true);

    const priceAfterDiscount = selectedPack.price * (1 - appliedDiscount);

    try {
      // API call to sandbox check out endpoint
      const res = await fetch('/api/shop/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          packageName: selectedPack.name,
          credits: selectedPack.credits,
          price: priceAfterDiscount,
          isTier: selectedPack.type === 'tier',
          promoCode: appliedPromo
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout fehlgeschlagen');

      // Update local state indicators
      await onPurchaseCredits(selectedPack.credits, priceAfterDiscount, selectedPack.type === 'tier' ? selectedPack.name : undefined);
      
      setSuccessTx({
        id: data.transactionId || 'SANDBOX_TX_' + Math.floor(Math.random() * 9000000),
        name: selectedPack.name,
        amount: selectedPack.credits,
        price: priceAfterDiscount,
        code: appliedPromo || undefined
      });
      setSelectedPack(null);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Generate and download a mock text/txt formatted bill invoice for enterprise records sync
  const handleDownloadInvoice = () => {
    if (!successTx) return;
    const dateStr = new Date().toLocaleString();
    const invoiceContent = `
=========================================
          OMNISAAS DEVELOPER PLATFORM
              OFFICIAL BILL INVOICE
=========================================
Transaction ID: ${successTx.id}
Date: ${dateStr}
Customer Name: ${user.username}
Customer Email: ${user.email}
Account UID: ${user.uid}
-----------------------------------------
Product Purchased: ${successTx.name}
Credits Refilled: +${successTx.amount} Credits
Subscription Tier Status: ${user.plan}
-----------------------------------------
Base Subtotal: $${(successTx.price / (1 - appliedDiscount) || 0).toFixed(2)}
Applied Coupon Promo: ${successTx.code || 'None'}
Discount Applied: ${(appliedDiscount * 100)}%
TOTAL AMOUNT PAID: $${successTx.price.toFixed(2)} (SANDBOX PAYMENTS)
=========================================
Thank you for building on the OmniSaaS cloud platform!
For SLA support email support@omnisaas.dev
=========================================
`;
    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `OmniSaaS_Invoice_${successTx.id}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // State to check if a real payment gateway (Stripe/etc) is configured
  const isPaymentConfigured = false;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 py-6">
      
      {/* Upper header */}
      <div className="border-b border-slate-900 pb-5">
        <h1 className="text-2xl font-extrabold text-slate-100 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-indigo-400" />
          <span>{lang === 'de' ? 'Abonnements & Credit-Refills' : 'Booster Shop & Billings'}</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {lang === 'de' ? 'Lade dein Guthaben auf, upgrade deinen Plan und lade Sandbox-Rechnungen herunter.' : 'Top up your account quota, buy credit bundles, or switch subscription tiers.'}
        </p>
      </div>

      {/* Payment Provider Missing Warning Banner */}
      {!isPaymentConfigured && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-xs leading-relaxed">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <div>
            <span className="font-bold block mb-1">PRODUKTIONS-MODUS AKTIV (KÄUFE DEAKTIVIERT)</span>
            Gemäß den Produktionsrichtlinien sind sämtliche Demo-Transaktionen oder fingierte Käufe deaktiviert. Da derzeit kein realer Zahlungsdienst (z. B. Stripe) angebunden ist, sind alle Produkte als <strong>Nicht verfügbar</strong> markiert. Das Checkout-Terminal ist gesperrt.
          </div>
        </div>
      )}

      {/* Success checkout panel */}
      {successTx && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-6 bg-teal-500/10 border border-teal-500/30 rounded-xl max-w-2xl mx-auto text-center space-y-4"
        >
          <Sparkles className="w-12 h-12 text-teal-400 mx-auto" />
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold text-teal-400">{lang === 'de' ? 'Kauf erfolgreich abgeschlossen!' : 'Payment Complete'}</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              {lang === 'de' 
                ? `Du hast erfolgreich '${successTx.name}' gekauft. Dir wurden ${successTx.amount} Credits gutgeschrieben.` 
                : `You successfully completed checkout for '${successTx.name}'. Added ${successTx.amount} Credits.`}
            </p>
          </div>

          <div className="flex gap-2.5 justify-center">
            <button
              onClick={handleDownloadInvoice}
              className="bg-teal-600 hover:bg-teal-500 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{lang === 'de' ? 'Rechnung herunterladen (TXT)' : 'Download Bill Invoice'}</span>
            </button>
            <button
              onClick={() => setSuccessTx(null)}
              className="text-slate-400 hover:text-slate-300 text-xs transition-all"
            >
              Zurück zum Shop
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Catalog View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: subscription Tiers */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Wähle deinen Tarif</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {tiers.map((t) => (
              <div 
                key={t.name} 
                className={`bg-slate-900/20 border rounded-2xl p-5 flex flex-col justify-between space-y-5 relative ${
                  user.plan === t.name 
                    ? 'border-indigo-500 bg-indigo-500/5' 
                    : 'border-slate-800'
                }`}
              >
                {user.plan === t.name && (
                  <span className="absolute -top-2.5 right-4 bg-indigo-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Dein Plan
                  </span>
                )}

                <div className="space-y-3">
                  <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">{t.name}</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-slate-100">${t.price}</span>
                    <span className="text-[10px] text-slate-500">/monat</span>
                  </div>
                  <span className="font-mono text-[10px] text-indigo-400 block">+{t.credits} Credits / Refresh</span>
                  
                  <div className="border-t border-slate-900 pt-3 space-y-2 text-[11px] text-slate-400">
                    {t.features.map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {t.price === 0 ? (
                  <button
                    onClick={() => setSelectedPack({ name: t.name + ' Plan Upgrade', credits: t.credits, price: t.price, type: 'tier' })}
                    disabled={user.plan === t.name}
                    className={`w-full py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                      user.plan === t.name 
                        ? 'bg-slate-950 text-slate-600' 
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/15'
                    }`}
                  >
                    {user.plan === t.name ? 'Aktueller Plan' : 'Auswählen'}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 rounded-lg text-xs font-semibold bg-slate-950/80 text-red-400/80 border border-red-500/20 cursor-not-allowed"
                  >
                    {lang === 'de' ? 'Nicht verfügbar' : 'Not Available'}
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Refills Booster packs catalog */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Credit Booster Packs</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {refills.map((p) => (
                <div key={p.name} className="bg-slate-900/10 border border-slate-900 p-5 rounded-2xl flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-200 block truncate">{p.name}</span>
                    <span className="text-xs font-mono text-indigo-400 font-semibold">+{p.credits} Credits Refill</span>
                  </div>
                  
                  <div className="flex justify-between items-baseline">
                    <span className="text-slate-500 text-[10px]">Sofort-Refill</span>
                    <span className="text-lg font-extrabold text-slate-100">${p.price}</span>
                  </div>

                  <button
                    disabled
                    className="w-full py-2.5 rounded-lg text-xs font-semibold bg-slate-950/80 text-red-400/80 border border-red-500/20 cursor-not-allowed"
                  >
                    {lang === 'de' ? 'Nicht verfügbar' : 'Not Available'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Coupon promo code input & Checkout terminal */}
        <div className="space-y-6">
          {/* Coupon codes panel */}
          <div className="bg-slate-900/20 border border-slate-800 p-5 rounded-xl space-y-4">

            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-1.5 border-b border-slate-900 pb-2">
              <Gift className="w-4.5 h-4.5 text-indigo-400" />
              <span>Gutscheincodes / Rabatte</span>
            </h3>

            {appliedPromo && (
              <div className="p-2.5 bg-teal-500/10 border border-teal-500/20 rounded-lg text-teal-400 text-xs font-semibold flex items-center justify-between">
                <span>Code angewendet: {appliedPromo}</span>
                <span>-{(appliedDiscount * 100)}%</span>
              </div>
            )}

            {promoError && (
              <div className="p-2.5 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{promoError}</span>
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                placeholder="PRO50 oder OMNI100"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500 text-slate-200 uppercase font-mono"
              />
              <button
                onClick={handleApplyPromo}
                className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs px-3.5 rounded-lg cursor-pointer"
              >
                Anwenden
              </button>
            </div>
          </div>

          {/* Sandbox Credit Card checkout modal preview */}
          <AnimatePresence>
            {selectedPack && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 15 }}
                className="bg-slate-900/40 border border-indigo-500/20 p-5 rounded-xl space-y-4"
              >
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                  <CreditCard className="w-4.5 h-4.5 text-indigo-400" />
                  <span>Sandbox Checkout Terminal</span>
                </h3>

                <div className="border-t border-slate-800/80 pt-3 text-xs space-y-2">
                  <div className="flex justify-between text-slate-400">
                    <span>Produkt:</span>
                    <span className="text-slate-200 font-semibold">{selectedPack.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Booster Credits:</span>
                    <span className="text-indigo-400 font-mono">+{selectedPack.credits} Units</span>
                  </div>
                  
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-teal-400">
                      <span>Rabatt ({appliedPromo}):</span>
                      <span>-{(appliedDiscount * 100)}%</span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm font-bold text-slate-100 pt-1.5 border-t border-slate-850">
                    <span>Endpreis:</span>
                    <span>${(selectedPack.price * (1 - appliedDiscount)).toFixed(2)}</span>
                  </div>
                </div>

                {/* Simulated payment fields */}
                <form onSubmit={handleCheckout} className="space-y-3.5 text-xs">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold block">Credit Card (Sandbox-Safe)</label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 uppercase">Expiry</label>
                      <input
                        type="text"
                        required
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500">CVC</label>
                      <input
                        type="password"
                        required
                        value={cardCVC}
                        onChange={(e) => setCardCVC(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 rounded-lg text-xs transition-all shadow-md shadow-indigo-500/10 cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Sicher bezahlen (Sandbox)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedPack(null)}
                    className="w-full bg-transparent hover:bg-slate-900 border border-transparent hover:border-slate-800 text-slate-500 hover:text-slate-300 py-2 rounded-lg text-[10px]"
                  >
                    Abbrechen
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
