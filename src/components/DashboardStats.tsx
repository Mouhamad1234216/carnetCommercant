import React from 'react';
import {
  TrendingUp,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';
import { ClientWithStats } from '../types';
import { formatCurrency } from '../utils/storage';

interface DashboardStatsProps {
  clients: ClientWithStats[];
  currency: string;
  onFilterClick: (filter: 'ALL' | 'HAS_DEBT' | 'SETTLED' | 'OVERDUE') => void;
  activeFilter: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  clients,
  currency,
  onFilterClick,
  activeFilter,
}) => {
  const totalReceivables = clients.reduce(
    (sum, c) => (c.balance > 0 ? sum + c.balance : sum),
    0
  );

  const totalCollected = clients.reduce((sum, c) => sum + c.totalRepayment, 0);
  const totalCreditsGranted = clients.reduce((sum, c) => sum + c.totalCredit, 0);

  const debtorClients = clients.filter((c) => c.balance > 0);
  const overdueClients = clients.filter((c) => c.isOverdue && c.balance > 0);
  const settledClients = clients.filter((c) => c.balance <= 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Debt Card (Main KPI) */}
      <div
        onClick={() => onFilterClick('HAS_DEBT')}
        className={`cursor-pointer p-4 rounded-2xl border transition-all ${
          activeFilter === 'HAS_DEBT'
            ? 'bg-rose-950/40 border-rose-500 shadow-lg shadow-rose-950/20'
            : 'bg-slate-900 border-slate-800 hover:border-rose-500/50'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
            <ArrowUpRight className="w-4 h-4" />
            Total Crédits à Recouvrer
          </span>
          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 font-bold text-[10px]">
            {debtorClients.length} client{debtorClients.length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-mono">
          {formatCurrency(totalReceivables, currency)}
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Sur un total cumulé de {formatCurrency(totalCreditsGranted, currency)} accordé
        </p>
      </div>

      {/* 2. Overdue Debts Card */}
      <div
        onClick={() => onFilterClick('OVERDUE')}
        className={`cursor-pointer p-4 rounded-2xl border transition-all ${
          activeFilter === 'OVERDUE'
            ? 'bg-amber-950/40 border-amber-500 shadow-lg shadow-amber-950/20'
            : 'bg-slate-900 border-slate-800 hover:border-amber-500/50'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
            <AlertTriangle className="w-4 h-4" />
            Échéances Dépassées
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">
            {overdueClients.length} en retard
          </span>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-amber-300 tracking-tight font-mono">
          {overdueClients.length}
        </div>
        <p className="mt-1 text-xs text-slate-400">
          {overdueClients.length > 0
            ? 'Relancez en priorité ces clients sur WhatsApp'
            : 'Aucun retard d’échéance enregistré'}
        </p>
      </div>

      {/* 3. Total Repayments Collected Card */}
      <div
        onClick={() => onFilterClick('ALL')}
        className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <ArrowDownLeft className="w-4 h-4" />
            Remboursements Encaissés
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
            Règlements
          </span>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight font-mono">
          {formatCurrency(totalCollected, currency)}
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Total d'argent récupéré auprès des clients
        </p>
      </div>

      {/* 4. Settled Clients Card */}
      <div
        onClick={() => onFilterClick('SETTLED')}
        className={`cursor-pointer p-4 rounded-2xl border transition-all ${
          activeFilter === 'SETTLED'
            ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-950/20'
            : 'bg-slate-900 border-slate-800 hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Clients à Jour
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold text-[10px]">
            {settledClients.length} réglé{settledClients.length > 1 ? 's' : ''}
          </span>
        </div>
        <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight font-mono">
          {settledClients.length} / {clients.length}
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Clients n'ayant aucune dette en cours
        </p>
      </div>
    </div>
  );
};
