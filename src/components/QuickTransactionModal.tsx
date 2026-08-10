import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowUpRight,
  ArrowDownLeft,
  Plus,
  Calendar,
  CreditCard,
  FileText,
  User,
  Check,
  AlertCircle,
} from 'lucide-react';
import { Client, PaymentMethod, TransactionType } from '../types';

interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  initialClientId?: string;
  initialType?: TransactionType;
  currency: string;
  onAddTransaction: (data: {
    clientId: string;
    type: TransactionType;
    amount: number;
    description: string;
    dueDate?: string;
    paymentMethod?: PaymentMethod;
    notes?: string;
  }) => void;
  onOpenNewClient: () => void;
}

export const QuickTransactionModal: React.FC<QuickTransactionModalProps> = ({
  isOpen,
  onClose,
  clients,
  initialClientId = '',
  initialType = 'CREDIT',
  currency,
  onAddTransaction,
  onOpenNewClient,
}) => {
  const [clientId, setClientId] = useState(initialClientId);
  const [type, setType] = useState<TransactionType>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setClientId(initialClientId || (clients[0]?.id ?? ''));
      setType(initialType);
      setAmount('');
      setDescription('');
      setDueDate('');
      setPaymentMethod('CASH');
      setNotes('');
      setError('');
    }
  }, [isOpen, initialClientId, initialType, clients]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!clientId) {
      setError('Veuillez sélectionner un client.');
      return;
    }

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Veuillez entrer un montant valide supérieur à 0.');
      return;
    }

    if (!description.trim()) {
      setError(
        type === 'CREDIT'
          ? 'Veuillez indiquer le libellé ou les articles prêtés (ex: Sac de riz).'
          : 'Veuillez indiquer une note pour le remboursement (ex: Acompte espèces).'
      );
      return;
    }

    onAddTransaction({
      clientId,
      type,
      amount: numericAmount,
      description: description.trim(),
      dueDate: dueDate || undefined,
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  const addPresetAmount = (val: number) => {
    const current = parseFloat(amount) || 0;
    setAmount(String(current + val));
  };

  const applyPresetTag = (tagText: string) => {
    if (!description) {
      setDescription(tagText);
    } else {
      setDescription(`${description}, ${tagText}`);
    }
  };

  const creditPresetTags = [
    'Sac de Riz 25kg',
    'Bidon Huile 5L',
    'Lait en Poudre',
    'Boîte de Sucre',
    'Cartouche de Gaz',
    'Épicerie générale',
  ];

  const repaymentPresetTags = [
    'Acompte Espèces',
    'Règlement Wave',
    'Règlement Orange Money',
    'Solder le compte',
    'Solde partiel',
  ];

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div
              className={`p-2 rounded-xl ${
                type === 'CREDIT'
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {type === 'CREDIT' ? (
                <ArrowUpRight className="w-5 h-5" />
              ) : (
                <ArrowDownLeft className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {type === 'CREDIT' ? 'Nouveau Prêt / Achat à Crédit' : 'Enregistrer un Remboursement'}
              </h2>
              <p className="text-xs text-slate-400">
                {type === 'CREDIT'
                  ? 'Ajouter une dette au carnet du client'
                  : 'Saisir un acompte ou règlement reçu'}
              </p>
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
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Toggle Type: Credit vs Repayment */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('CREDIT')}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                type === 'CREDIT'
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Nouveau Prêt (Dette)</span>
            </button>

            <button
              type="button"
              onClick={() => setType('REPAYMENT')}
              className={`py-2.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                type === 'REPAYMENT'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>Remboursement</span>
            </button>
          </div>

          {/* Client Selection */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-slate-300 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                Sélectionner le Client *
              </label>
              <button
                type="button"
                onClick={onOpenNewClient}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Nouveau Client
              </button>
            </div>

            {clients.length === 0 ? (
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400">
                Aucun client enregistré.{' '}
                <button
                  type="button"
                  onClick={onOpenNewClient}
                  className="text-emerald-400 underline font-semibold"
                >
                  Ajoutez votre premier client
                </button>
              </div>
            ) : (
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 font-medium focus:outline-none focus:border-emerald-500"
              >
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.phone ? `(${c.phone})` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Amount Field + Presets */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Montant ({currency}) *</span>
              {amount && (
                <span className="font-mono text-emerald-400 font-bold">
                  {new Intl.NumberFormat('fr-FR').format(parseFloat(amount) || 0)} {currency}
                </span>
              )}
            </label>
            <div className="relative">
              <input
                type="number"
                min="1"
                step="any"
                placeholder="Ex: 5000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3.5 pr-16 py-2.5 text-base font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                autoFocus
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                {currency}
              </span>
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400 font-medium mr-1">Ajout rapide:</span>
              {[1000, 2000, 5000, 10000, 25000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => addPresetAmount(val)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-semibold transition-all"
                >
                  +{val >= 1000 ? `${val / 1000}k` : val}
                </button>
              ))}
            </div>
          </div>

          {/* Description & Preset Tags */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              {type === 'CREDIT' ? 'Articles ou Libellé *' : 'Raison / Référence Règlement *'}
            </label>
            <input
              type="text"
              placeholder={
                type === 'CREDIT'
                  ? 'Ex: Sac de riz 25kg + 2L Huile'
                  : 'Ex: Acompte espèces au comptoir'
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />

            {/* Preset Tags */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-400 font-medium">Suggestions :</span>
              {(type === 'CREDIT' ? creditPresetTags : repaymentPresetTags).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => applyPresetTag(tag)}
                  className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Due Date (Optional for Credit) & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {type === 'CREDIT' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  Date limite promise (optionnelle)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            <div className="space-y-1.5 sm:col-span-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                Mode de Paiement
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="CASH">Espèces / Comptant</option>
                <option value="WAVE">Wave</option>
                <option value="ORANGE_MONEY">Orange Money</option>
                <option value="MTN">MTN Mobile Money</option>
                <option value="MOOV">Moov Money</option>
                <option value="MOBILE_MONEY">Autre Mobile Money</option>
                <option value="OTHER">Autre / Marchandise</option>
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              className={`w-full py-3 px-4 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all transform active:scale-95 ${
                type === 'CREDIT'
                  ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/40'
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-950/40'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>
                {type === 'CREDIT' ? 'Enregistrer le Prêt' : 'Enregistrer le Remboursement'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
