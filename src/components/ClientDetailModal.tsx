import React, { useState } from 'react';
import {
  X,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  FileText,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Trash2,
  Edit,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Receipt,
  Tag,
} from 'lucide-react';
import { ClientWithStats, Transaction, ShopSettings } from '../types';
import {
  formatCurrency,
  formatDateFR,
  formatDateTimeFR,
  generateWhatsAppReminderLink,
} from '../utils/storage';

interface ClientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ClientWithStats | null;
  transactions: Transaction[];
  settings: ShopSettings;
  onOpenAddTransaction: (clientId: string, type: 'CREDIT' | 'REPAYMENT') => void;
  onEditClient: (client: ClientWithStats) => void;
  onDeleteClient: (clientId: string) => void;
  onDeleteTransaction: (transactionId: string) => void;
  onOpenReceipt: (client: ClientWithStats) => void;
}

export const ClientDetailModal: React.FC<ClientDetailModalProps> = ({
  isOpen,
  onClose,
  client,
  transactions,
  settings,
  onOpenAddTransaction,
  onEditClient,
  onDeleteClient,
  onDeleteTransaction,
  onOpenReceipt,
}) => {
  const [confirmDeleteClient, setConfirmDeleteClient] = useState(false);
  const [deleteTxId, setDeleteTxId] = useState<string | null>(null);

  if (!isOpen || !client) return null;

  const clientTx = transactions
    .filter((t) => t.clientId === client.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const waLink = generateWhatsAppReminderLink(client, settings);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header Bar */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 font-bold flex items-center justify-center text-lg">
              {client.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-100">{client.name}</h2>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-semibold">
                  {client.category === 'FIDEL'
                    ? '⭐ Client Fidèle'
                    : client.category === 'PASSAGER'
                    ? 'Passager'
                    : 'Régulier'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                {client.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    {client.phone}
                  </span>
                )}
                {client.address && (
                  <span className="flex items-center gap-1 hidden sm:inline-flex">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {client.address}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6 text-slate-200">
          {/* Main Balance Banner */}
          <div
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              client.balance > 0
                ? client.isOverdue
                  ? 'bg-amber-950/40 border-amber-500/80 shadow-lg shadow-amber-950/30'
                  : 'bg-rose-950/40 border-rose-500/80 shadow-lg shadow-rose-950/30'
                : client.balance < 0
                ? 'bg-blue-950/40 border-blue-500/80'
                : 'bg-emerald-950/40 border-emerald-500/80'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
                {client.balance > 0 ? (
                  client.isOverdue ? (
                    <span className="text-amber-400 flex items-center gap-1 font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      Solde Dû (Échéance Dépassée !)
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-1 font-bold">
                      <ArrowUpRight className="w-4 h-4" />
                      Solde Restant à Payer par le Client
                    </span>
                  )
                ) : client.balance < 0 ? (
                  <span className="text-blue-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Avance Client (Crédit en faveur du client)
                  </span>
                ) : (
                  <span className="text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    Compte Réglé & À Jour !
                  </span>
                )}
              </div>

              <div className="mt-1 text-3xl sm:text-4xl font-extrabold font-mono tracking-tight text-white">
                {formatCurrency(Math.abs(client.balance), settings.currency)}
              </div>

              <p className="text-xs text-slate-300 mt-1">
                Cumul crédits :{' '}
                <span className="font-semibold font-mono text-rose-300">
                  {formatCurrency(client.totalCredit, settings.currency)}
                </span>{' '}
                • Total remboursé :{' '}
                <span className="font-semibold font-mono text-emerald-300">
                  {formatCurrency(client.totalRepayment, settings.currency)}
                </span>
              </p>
            </div>

            {/* Quick Action Bar for Client */}
            <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-start sm:justify-end">
              {client.phone && client.balance > 0 && (
                <a
                  href={waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-950/40 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Rappel WhatsApp</span>
                </a>
              )}

              {client.phone && (
                <a
                  href={`tel:${client.phone}`}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Appeler</span>
                </a>
              )}

              <button
                onClick={() => onOpenReceipt(client)}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                title="Générer un relevé / reçu pour le client"
              >
                <Receipt className="w-3.5 h-3.5 text-indigo-400" />
                <span>Reçu / Relevé</span>
              </button>

              <button
                onClick={() => onEditClient(client)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                title="Modifier fiche client"
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Buttons: Add Credit or Repayment */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Carnet des Mouvements ({clientTx.length})</span>
            </h3>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenAddTransaction(client.id, 'REPAYMENT')}
                className="px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5"
              >
                <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                <span>+ Remboursement</span>
              </button>

              <button
                onClick={() => onOpenAddTransaction(client.id, 'CREDIT')}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-rose-950/40"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>+ Nouveau Prêt</span>
              </button>
            </div>
          </div>

          {/* Transaction History Ledger */}
          {clientTx.length === 0 ? (
            <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 space-y-3">
              <FileText className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">
                Aucune transaction enregistrée pour {client.name}
              </p>
              <p className="text-xs text-slate-500">
                Utilisez les boutons ci-dessus pour ajouter un premier achat à crédit ou un remboursement.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {clientTx.map((tx) => (
                <div
                  key={tx.id}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                        tx.type === 'CREDIT'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {tx.type === 'CREDIT' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`font-bold text-sm ${
                            tx.type === 'CREDIT' ? 'text-slate-100' : 'text-emerald-300'
                          }`}
                        >
                          {tx.description}
                        </span>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            tx.type === 'CREDIT'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {tx.type === 'CREDIT' ? 'Prêt / Crédit' : 'Remboursement'}
                        </span>

                        {tx.paymentMethod && (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-medium">
                            {tx.paymentMethod}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {formatDateTimeFR(tx.date)}
                        </span>

                        {tx.dueDate && (
                          <span
                            className={`flex items-center gap-1 font-mono font-semibold ${
                              new Date(tx.dueDate).getTime() < Date.now()
                                ? 'text-amber-400'
                                : 'text-slate-400'
                            }`}
                          >
                            Échéance : {formatDateFR(tx.dueDate)}
                            {new Date(tx.dueDate).getTime() < Date.now() && ' (En retard)'}
                          </span>
                        )}

                        {tx.notes && <span className="text-slate-500 italic">• {tx.notes}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Amount & Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 self-end sm:self-center w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-0 border-slate-800">
                    <div
                      className={`font-mono text-base font-extrabold ${
                        tx.type === 'CREDIT' ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {tx.type === 'CREDIT' ? '+' : '-'}
                      {formatCurrency(tx.amount, settings.currency)}
                    </div>

                    {deleteTxId === tx.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onDeleteTransaction(tx.id);
                            setDeleteTxId(null);
                          }}
                          className="px-2 py-1 rounded-lg bg-rose-600 text-white text-[11px] font-bold"
                        >
                          Confirmer
                        </button>
                        <button
                          onClick={() => setDeleteTxId(null)}
                          className="px-2 py-1 rounded-lg bg-slate-800 text-slate-300 text-[11px]"
                        >
                          Annuler
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteTxId(tx.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-all"
                        title="Supprimer cette ligne"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Client Notes & Footer Delete Option */}
          {client.notes && (
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                Notes sur le client
              </span>
              <p>{client.notes}</p>
            </div>
          )}

          {/* Delete Client Confirmation Option */}
          <div className="pt-4 border-t border-slate-800 flex justify-end">
            {confirmDeleteClient ? (
              <div className="flex items-center gap-2 bg-rose-950/40 border border-rose-500/50 p-3 rounded-xl text-xs">
                <span className="text-rose-200 font-semibold">
                  Supprimer définitivement {client.name} et tout son historique ?
                </span>
                <button
                  onClick={() => {
                    onDeleteClient(client.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-600 text-white font-bold"
                >
                  Oui, Supprimer
                </button>
                <button
                  onClick={() => setConfirmDeleteClient(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300"
                >
                  Annuler
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDeleteClient(true)}
                className="text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Supprimer cette fiche client</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
