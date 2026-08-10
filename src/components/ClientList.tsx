import React, { useState } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Phone,
  MessageSquare,
  ChevronRight,
  UserPlus,
  ArrowUpRight,
  ArrowDownLeft,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Receipt,
  Tag,
} from 'lucide-react';
import { ClientWithStats, ShopSettings, StatusFilter, SortOption } from '../types';
import {
  formatCurrency,
  formatDateFR,
  generateWhatsAppReminderLink,
} from '../utils/storage';

interface ClientListProps {
  clients: ClientWithStats[];
  settings: ShopSettings;
  activeFilter: StatusFilter;
  onFilterChange: (filter: StatusFilter) => void;
  onSelectClient: (client: ClientWithStats) => void;
  onOpenNewTransaction: (clientId: string, type: 'CREDIT' | 'REPAYMENT') => void;
  onOpenNewClient: () => void;
}

export const ClientList: React.FC<ClientListProps> = ({
  clients,
  settings,
  activeFilter,
  onFilterChange,
  onSelectClient,
  onOpenNewTransaction,
  onOpenNewClient,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('DEBT_DESC');

  // Filter clients
  const filteredClients = clients.filter((client) => {
    // Search match
    const q = searchQuery.toLowerCase().trim();
    const nameMatch = client.name.toLowerCase().includes(q);
    const phoneMatch = client.phone?.toLowerCase().includes(q);
    const addressMatch = client.address?.toLowerCase().includes(q);
    const matchesSearch = nameMatch || phoneMatch || addressMatch;

    if (!matchesSearch) return false;

    // Status filter match
    if (activeFilter === 'HAS_DEBT') return client.balance > 0;
    if (activeFilter === 'OVERDUE') return client.balance > 0 && client.isOverdue;
    if (activeFilter === 'SETTLED') return client.balance <= 0;

    return true;
  });

  // Sort clients
  const sortedClients = [...filteredClients].sort((a, b) => {
    if (sortOption === 'DEBT_DESC') {
      return b.balance - a.balance;
    }
    if (sortOption === 'NAME_ASC') {
      return a.name.localeCompare(b.name, 'fr');
    }
    if (sortOption === 'RECENT_ACTIVITY') {
      const dateA = a.lastTransactionDate ? new Date(a.lastTransactionDate).getTime() : 0;
      const dateB = b.lastTransactionDate ? new Date(b.lastTransactionDate).getTime() : 0;
      return dateB - dateA;
    }
    return 0;
  });

  return (
    <div className="space-y-4">
      {/* Search Bar & Filters Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un client, nom ou téléphone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                Effacer
              </button>
            )}
          </div>

          {/* Sort Option Dropdown */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-xs text-slate-400 flex items-center gap-1 shrink-0">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
              Trier par:
            </span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-emerald-500"
            >
              <option value="DEBT_DESC">Plus grande dette en premier</option>
              <option value="RECENT_ACTIVITY">Dernière activité récente</option>
              <option value="NAME_ASC">Nom (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {[
            { id: 'ALL', label: 'Tous les Clients', count: clients.length },
            {
              id: 'HAS_DEBT',
              label: 'Débiteurs (En dette)',
              count: clients.filter((c) => c.balance > 0).length,
              color: 'rose',
            },
            {
              id: 'OVERDUE',
              label: 'Échéances en retard',
              count: clients.filter((c) => c.balance > 0 && c.isOverdue).length,
              color: 'amber',
            },
            {
              id: 'SETTLED',
              label: 'Réglés / À jour',
              count: clients.filter((c) => c.balance <= 0).length,
              color: 'emerald',
            },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => onFilterChange(item.id as StatusFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeFilter === item.id
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span>{item.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeFilter === item.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Clients List / Cards */}
      {sortedClients.length === 0 ? (
        <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">Aucun client trouvé</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `Aucun résultat pour "${searchQuery}". Vérifiez l’orthographe ou réinitialisez la recherche.`
              : 'Aucun client ne correspond au filtre sélectionné.'}
          </p>
          <div className="pt-2">
            <button
              onClick={onOpenNewClient}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold inline-flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Créer une fiche client</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {sortedClients.map((client) => {
            const waLink = generateWhatsAppReminderLink(client, settings);

            return (
              <div
                key={client.id}
                className={`p-4 rounded-2xl border bg-slate-900 transition-all hover:border-slate-700 flex flex-col justify-between space-y-3 shadow-md group ${
                  client.balance > 0
                    ? client.isOverdue
                      ? 'border-amber-500/50 hover:border-amber-500'
                      : 'border-slate-800 hover:border-rose-500/50'
                    : 'border-slate-800/80 hover:border-emerald-500/50'
                }`}
              >
                {/* Client Card Header */}
                <div
                  onClick={() => onSelectClient(client)}
                  className="cursor-pointer space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 text-slate-200 font-bold flex items-center justify-center border border-slate-700 text-sm group-hover:bg-emerald-600 group-hover:text-white transition-all">
                        {client.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                          {client.name}
                        </h3>
                        {client.phone ? (
                          <p className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                            <Phone className="w-3 h-3 text-slate-500" />
                            {client.phone}
                          </p>
                        ) : (
                          <p className="text-xs text-slate-500 italic">Pas de téléphone</p>
                        )}
                      </div>
                    </div>

                    <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                  </div>

                  {/* Balance Display */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Solde Actuel
                      </span>
                      <div
                        className={`text-base font-extrabold font-mono tracking-tight ${
                          client.balance > 0
                            ? client.isOverdue
                              ? 'text-amber-400'
                              : 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        {formatCurrency(Math.abs(client.balance), settings.currency)}
                      </div>
                    </div>

                    <div className="text-right">
                      {client.balance > 0 ? (
                        client.isOverdue ? (
                          <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> En retard
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                            Doit de l'argent
                          </span>
                        )
                      ) : (
                        <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Compte Réglé
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Last Activity Date */}
                  {client.lastTransactionDate && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      Dernier mouvement : {formatDateFR(client.lastTransactionDate)}
                    </div>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenNewTransaction(client.id, 'CREDIT')}
                      className="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold flex items-center gap-1 transition-all"
                      title="Nouveau prêt"
                    >
                      <ArrowUpRight className="w-3.5 h-3.5" />
                      <span>+ Prêt</span>
                    </button>

                    <button
                      onClick={() => onOpenNewTransaction(client.id, 'REPAYMENT')}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 text-xs font-bold flex items-center gap-1 transition-all"
                      title="Remboursement"
                    >
                      <ArrowDownLeft className="w-3.5 h-3.5" />
                      <span>+ Remb.</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    {client.phone && client.balance > 0 && (
                      <a
                        href={waLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all"
                        title="Envoyer relance WhatsApp"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </a>
                    )}

                    <button
                      onClick={() => onSelectClient(client)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                    >
                      Fiche
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
