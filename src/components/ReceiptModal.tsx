import React, { useState } from 'react';
import { X, Printer, Copy, Check, MessageSquare, Store, User, FileText } from 'lucide-react';
import { ClientWithStats, Transaction, ShopSettings } from '../types';
import {
  formatCurrency,
  formatDateFR,
  formatDateTimeFR,
  sanitizePhoneForWhatsApp,
} from '../utils/storage';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientWithStats | null;
  transactions: Transaction[];
  settings: ShopSettings;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  client,
  transactions,
  settings,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !client) return null;

  const clientTx = transactions
    .filter((t) => t.clientId === client.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Format digital receipt as text for WhatsApp or SMS
  const formattedTextReceipt = `🧾 *RELEVÉ DE COMPTE CLIENT*
--------------------------------
🏪 *Boutique :* ${settings.shopName}
📞 *Tel Boutique :* ${settings.phone}
👤 *Client :* ${client.name} ${client.phone ? `(${client.phone})` : ''}
📅 *Date :* ${formatDateFR(new Date().toISOString())}

*DÉTAIL DES MOUVEMENTS :*
${clientTx
  .map(
    (t) =>
      `• ${formatDateFR(t.date)} : ${t.type === 'CREDIT' ? '🔴 Prêt' : '🟢 Remb.'} ${
        t.description
      } -> ${formatCurrency(t.amount, settings.currency)}`
  )
  .join('\n')}

--------------------------------
💰 *Total Crédits :* ${formatCurrency(client.totalCredit, settings.currency)}
💵 *Total Remboursé :* ${formatCurrency(client.totalRepayment, settings.currency)}
👉 *SOLDE RESTANT À PAYER : ${formatCurrency(client.balance, settings.currency)}*
--------------------------------
${settings.receiptHeader || 'Merci de votre confiance !'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedTextReceipt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const cleanPhone = sanitizePhoneForWhatsApp(client.phone || '');
  const waShareUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    formattedTextReceipt
  )}`;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in print:p-0 print:bg-white print:static">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] print:border-0 print:shadow-none print:max-h-none print:bg-white print:text-black">
        {/* Modal Header Bar (Hidden in Print) */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Relevé de Compte Client</h2>
              <p className="text-xs text-slate-400">Reçu officiel prêt à imprimer ou envoyer</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Content Area */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-100 bg-slate-950 print:bg-white print:text-black print:p-8 font-sans">
          {/* Printable Ticket Container */}
          <div className="border border-slate-800 print:border-black rounded-2xl p-6 bg-slate-900 print:bg-white space-y-6">
            {/* Header Shop Details */}
            <div className="text-center space-y-1 pb-4 border-b border-slate-800 print:border-black">
              <h1 className="text-xl font-extrabold uppercase tracking-wide text-emerald-400 print:text-black">
                {settings.shopName}
              </h1>
              {settings.ownerName && (
                <p className="text-xs text-slate-300 print:text-black font-semibold">
                  Gérant : {settings.ownerName}
                </p>
              )}
              <p className="text-xs text-slate-400 print:text-black">
                {settings.city && `${settings.city} • `} Tél: {settings.phone}
              </p>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 rounded-full bg-slate-800 print:bg-slate-200 text-slate-200 print:text-black text-xs font-bold uppercase tracking-wider">
                  Relevé de Compte Client
                </span>
              </div>
            </div>

            {/* Client Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-950 print:bg-slate-50 p-3.5 rounded-xl border border-slate-800 print:border-slate-300">
              <div>
                <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase font-bold">
                  Client
                </span>
                <span className="font-bold text-sm text-slate-100 print:text-black">
                  {client.name}
                </span>
                {client.phone && (
                  <p className="text-slate-400 print:text-slate-600 font-mono mt-0.5">
                    {client.phone}
                  </p>
                )}
              </div>

              <div className="text-right">
                <span className="text-slate-400 print:text-slate-600 block text-[10px] uppercase font-bold">
                  Date d’Édition
                </span>
                <span className="font-semibold font-mono text-slate-200 print:text-black">
                  {formatDateFR(new Date().toISOString())}
                </span>
              </div>
            </div>

            {/* Ledger Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-300 print:text-black uppercase tracking-wider">
                Historique des transactions
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-800 print:border-black text-slate-400 print:text-black font-bold">
                      <th className="py-2 pr-2">Date</th>
                      <th className="py-2 px-2">Type</th>
                      <th className="py-2 px-2">Description</th>
                      <th className="py-2 pl-2 text-right">Montant</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 print:divide-slate-300">
                    {clientTx.map((tx) => (
                      <tr key={tx.id}>
                        <td className="py-2 pr-2 font-mono text-slate-300 print:text-black whitespace-nowrap">
                          {formatDateFR(tx.date)}
                        </td>
                        <td className="py-2 px-2 whitespace-nowrap font-bold">
                          {tx.type === 'CREDIT' ? (
                            <span className="text-rose-400 print:text-red-700">Prêt</span>
                          ) : (
                            <span className="text-emerald-400 print:text-green-700">Remb.</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-slate-200 print:text-black">
                          {tx.description}
                        </td>
                        <td className="py-2 pl-2 text-right font-mono font-bold text-slate-100 print:text-black whitespace-nowrap">
                          {tx.type === 'CREDIT' ? '+' : '-'}
                          {formatCurrency(tx.amount, settings.currency)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total Balance Summary Box */}
            <div className="p-4 rounded-xl bg-slate-950 print:bg-slate-100 border border-slate-800 print:border-black space-y-2">
              <div className="flex justify-between text-xs text-slate-300 print:text-black">
                <span>Total Crédits accordés :</span>
                <span className="font-mono font-bold text-rose-300 print:text-red-700">
                  {formatCurrency(client.totalCredit, settings.currency)}
                </span>
              </div>

              <div className="flex justify-between text-xs text-slate-300 print:text-black">
                <span>Total Remboursements reçus :</span>
                <span className="font-mono font-bold text-emerald-300 print:text-green-700">
                  {formatCurrency(client.totalRepayment, settings.currency)}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800 print:border-black flex justify-between items-center">
                <span className="text-xs font-bold uppercase text-slate-100 print:text-black">
                  Solde Restant Dû :
                </span>
                <span className="text-xl font-extrabold font-mono text-emerald-400 print:text-black">
                  {formatCurrency(client.balance, settings.currency)}
                </span>
              </div>
            </div>

            <p className="text-center text-[11px] text-slate-400 print:text-slate-600 italic">
              {settings.receiptHeader || 'Merci pour votre confiance !'}
            </p>
          </div>
        </div>

        {/* Footer Actions (Hidden in Print) */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-2 flex-wrap print:hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Imprimer / PDF</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copié !' : 'Copier Texte'}</span>
            </button>
          </div>

          {client.phone && (
            <a
              href={waShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Envoyer par WhatsApp</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
