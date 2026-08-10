import React from 'react';
import {
  BookOpen,
  PlusCircle,
  UserPlus,
  Settings,
  Database,
  Bot,
  Store,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { ShopSettings } from '../types';

interface NavbarProps {
  settings: ShopSettings;
  onOpenNewTransaction: (type?: 'CREDIT' | 'REPAYMENT') => void;
  onOpenNewClient: () => void;
  onOpenSettings: () => void;
  onOpenBackup: () => void;
  onOpenAiAssistant: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  settings,
  onOpenNewTransaction,
  onOpenNewClient,
  onOpenSettings,
  onOpenBackup,
  onOpenAiAssistant,
}) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Brand & Shop Info */}
        <div className="flex items-center justify-between sm:justify-start gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-lg shadow-emerald-900/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight leading-tight">
                  Carnet de Crédit
                </h1>
                <span className="hidden md:inline-block px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-semibold uppercase">
                  Commerçant
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-medium text-slate-200">{settings.shopName}</span>
                {settings.city && <span className="text-slate-500">• {settings.city}</span>}
              </p>
            </div>
          </div>

          {/* Quick Config Icon for mobile */}
          <div className="flex sm:hidden items-center gap-1">
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Paramètres"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenBackup}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              title="Sauvegarde"
            >
              <Database className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
          {/* AI Helper Button */}
          <button
            onClick={onOpenAiAssistant}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition-all"
            title="Assistant IA Relances & Bilan"
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Assistant Relances IA</span>
            <span className="sm:hidden">IA</span>
          </button>

          {/* New Client Button */}
          <button
            onClick={onOpenNewClient}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all"
          >
            <UserPlus className="w-4 h-4 text-slate-400" />
            <span>Nouveau Client</span>
          </button>

          {/* Add Repayment Button */}
          <button
            onClick={() => onOpenNewTransaction('REPAYMENT')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all"
            title="Enregistrer un remboursement / acompte"
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
            <span>+ Remboursement</span>
          </button>

          {/* Add Credit / Debt Button */}
          <button
            onClick={() => onOpenNewTransaction('CREDIT')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-900/30 transition-all transform active:scale-95"
            title="Enregistrer un nouvel achat à crédit / prêt"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ Nouveau Prêt</span>
          </button>

          {/* Settings & Backup Desktop icons */}
          <div className="hidden sm:flex items-center gap-1 ml-1 border-l border-slate-800 pl-2">
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              title="Paramètres de la boutique"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenBackup}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
              title="Sauvegarde & Restauration"
            >
              <Database className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
