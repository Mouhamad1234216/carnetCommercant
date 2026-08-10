import React, { useState, useEffect } from 'react';
import { X, Store, User, Phone, MapPin, Coins, MessageSquare, Check, RefreshCw, AlertTriangle } from 'lucide-react';
import { ShopSettings } from '../types';

interface ShopSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ShopSettings;
  onSaveSettings: (newSettings: ShopSettings) => void;
  onResetDemoData: () => void;
}

export const ShopSettingsModal: React.FC<ShopSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onResetDemoData,
}) => {
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [currency, setCurrency] = useState('FCFA');
  const [reminderTemplate, setReminderTemplate] = useState('');
  const [receiptHeader, setReceiptHeader] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShopName(settings.shopName);
      setOwnerName(settings.ownerName);
      setPhone(settings.phone);
      setCity(settings.city);
      setCurrency(settings.currency);
      setReminderTemplate(settings.reminderTemplate);
      setReceiptHeader(settings.receiptHeader);
      setShowResetConfirm(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings({
      shopName: shopName.trim() || 'Ma Boutique',
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      city: city.trim(),
      currency: currency.trim() || 'FCFA',
      reminderTemplate: reminderTemplate.trim(),
      receiptHeader: receiptHeader.trim(),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <Store className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Paramètres de la Boutique</h2>
              <p className="text-xs text-slate-400">Nom, devise et relances WhatsApp</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-slate-200">
          {/* Shop Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              Nom de la Boutique / Commerce *
            </label>
            <input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              required
            />
          </div>

          {/* Owner Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                Nom du Commerçant
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                Téléphone de contact
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* City & Currency */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                Ville / Marché
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Devise / Monnaie *
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="FCFA">FCFA (Franc CFA)</option>
                <option value="MAD">MAD (Dirham Marocain)</option>
                <option value="DZD">DZD (Dinar Algérien)</option>
                <option value="TND">TND (Dinar Tunisien)</option>
                <option value="GNF">GNF (Franc Guinéen)</option>
                <option value="EUR">EUR (€ Euro)</option>
                <option value="USD">USD ($ Dollar)</option>
                <option value="MGA">MGA (Ariary)</option>
                <option value="CDF">CDF (Franc Congolais)</option>
              </select>
            </div>
          </div>

          {/* Reminder Template */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              Modèle de message de relance WhatsApp
            </label>
            <textarea
              rows={3}
              value={reminderTemplate}
              onChange={(e) => setReminderTemplate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none font-sans"
            />
            <p className="text-[11px] text-slate-400">
              Variables disponibles : <code className="text-emerald-400">{'{CLIENT_NAME}'}</code>,{' '}
              <code className="text-emerald-400">{'{SHOP_NAME}'}</code>,{' '}
              <code className="text-emerald-400">{'{BALANCE}'}</code>
            </p>
          </div>

          {/* Receipt Footer Message */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">
              Message de remerciement sur les reçus
            </label>
            <input
              type="text"
              value={receiptHeader}
              onChange={(e) => setReceiptHeader(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Demo Data Reset Zone */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
              Données de démonstration
            </span>

            {showResetConfirm ? (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/50 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <AlertTriangle className="w-4 h-4" />
                  Réinitialiser les données de démo ?
                </div>
                <p className="text-slate-300 text-[11px]">
                  Ceci remettra les clients et transactions exemples du début.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      onResetDemoData();
                      setShowResetConfirm(false);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-600 text-white font-bold"
                  >
                    Oui, Réinitialiser
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition-all w-full justify-center"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                <span>Recharger les données d'exemple initiales</span>
              </button>
            )}
          </div>

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all transform active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer les Paramètres</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
