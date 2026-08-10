import React, { useState, useEffect } from 'react';
import {
  getStoredClients,
  saveStoredClients,
  getStoredTransactions,
  saveStoredTransactions,
  getStoredSettings,
  saveStoredSettings,
  computeClientStats,
  INITIAL_CLIENTS,
  INITIAL_TRANSACTIONS,
  DEFAULT_SHOP_SETTINGS,
} from './utils/storage';
import {
  Client,
  Transaction,
  ShopSettings,
  ClientWithStats,
  StatusFilter,
  TransactionType,
  PaymentMethod,
} from './types';

import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { ClientList } from './components/ClientList';
import { QuickTransactionModal } from './components/QuickTransactionModal';
import { ClientModal } from './components/ClientModal';
import { ClientDetailModal } from './components/ClientDetailModal';
import { ReceiptModal } from './components/ReceiptModal';
import { ShopSettingsModal } from './components/ShopSettingsModal';
import { BackupModal } from './components/BackupModal';
import { AiReminderModal } from './components/AiReminderModal';

export default function App() {
  const [clients, setClients] = useState<Client[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<ShopSettings>(DEFAULT_SHOP_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Active status filter
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('ALL');

  // Modals state
  const [isQuickTxOpen, setIsQuickTxOpen] = useState(false);
  const [txInitialClientId, setTxInitialClientId] = useState<string>('');
  const [txInitialType, setTxInitialType] = useState<TransactionType>('CREDIT');

  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientToEdit, setClientToEdit] = useState<Client | null>(null);

  const [selectedClientDetail, setSelectedClientDetail] = useState<ClientWithStats | null>(null);

  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptClient, setReceiptClient] = useState<ClientWithStats | null>(null);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Load state on mount
  useEffect(() => {
    const loadedClients = getStoredClients();
    const loadedTx = getStoredTransactions();
    const loadedSettings = getStoredSettings();

    setClients(loadedClients);
    setTransactions(loadedTx);
    setSettings(loadedSettings);
    setIsLoaded(true);
  }, []);

  // Save changes to local storage
  useEffect(() => {
    if (isLoaded) {
      saveStoredClients(clients);
    }
  }, [clients, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      saveStoredTransactions(transactions);
    }
  }, [transactions, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      saveStoredSettings(settings);
    }
  }, [settings, isLoaded]);

  // Compute clients with calculated debt balances & statistics
  const clientsWithStats = computeClientStats(clients, transactions);

  // Re-sync selected detail client if clients/transactions update
  const currentSelectedDetailClient = selectedClientDetail
    ? clientsWithStats.find((c) => c.id === selectedClientDetail.id) || null
    : null;

  // Handlers for Transactions
  const handleAddTransaction = (data: {
    clientId: string;
    type: TransactionType;
    amount: number;
    description: string;
    dueDate?: string;
    paymentMethod?: PaymentMethod;
    notes?: string;
  }) => {
    const newTx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      clientId: data.clientId,
      type: data.type,
      amount: data.amount,
      description: data.description,
      date: new Date().toISOString(),
      dueDate: data.dueDate,
      paymentMethod: data.paymentMethod || 'CASH',
      notes: data.notes,
    };

    setTransactions((prev) => [newTx, ...prev]);

    // Update client updatedAt
    setClients((prev) =>
      prev.map((c) =>
        c.id === data.clientId ? { ...c, updatedAt: new Date().toISOString() } : c
      )
    );
  };

  const handleDeleteTransaction = (txId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
  };

  // Handlers for Clients
  const handleSaveClient = (
    data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }
  ) => {
    const nowIso = new Date().toISOString();

    if (data.id) {
      // Edit
      setClients((prev) =>
        prev.map((c) => (c.id === data.id ? { ...c, ...data, updatedAt: nowIso } : c))
      );
    } else {
      // Create new
      const newClient: Client = {
        id: `c_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: data.name,
        phone: data.phone || '',
        address: data.address,
        category: data.category,
        notes: data.notes,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      setClients((prev) => [newClient, ...prev]);
    }
  };

  const handleDeleteClient = (clientId: string) => {
    setClients((prev) => prev.filter((c) => c.id !== clientId));
    setTransactions((prev) => prev.filter((t) => t.clientId !== clientId));
    if (selectedClientDetail?.id === clientId) {
      setSelectedClientDetail(null);
    }
  };

  // Handlers for Demo & Backup
  const handleResetDemoData = () => {
    setClients(INITIAL_CLIENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setSettings(DEFAULT_SHOP_SETTINGS);
  };

  const handleRestoreBackup = (data: {
    clients: Client[];
    transactions: Transaction[];
    settings?: ShopSettings;
  }) => {
    setClients(data.clients);
    setTransactions(data.transactions);
    if (data.settings) {
      setSettings(data.settings);
    }
  };

  // Helper trigger to open Quick Transaction Modal
  const openNewTransaction = (clientId?: string, type: TransactionType = 'CREDIT') => {
    setTxInitialClientId(clientId || (clients[0]?.id ?? ''));
    setTxInitialType(type);
    setIsQuickTxOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar
        settings={settings}
        onOpenNewTransaction={(type) => openNewTransaction('', type || 'CREDIT')}
        onOpenNewClient={() => {
          setClientToEdit(null);
          setIsClientModalOpen(true);
        }}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenAiAssistant={() => setIsAiModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 space-y-6">
        {/* KPI Dashboard Cards */}
        <DashboardStats
          clients={clientsWithStats}
          currency={settings.currency}
          onFilterClick={(filter) => setActiveFilter(filter)}
          activeFilter={activeFilter}
        />

        {/* Client Ledger & Search Table Section */}
        <ClientList
          clients={clientsWithStats}
          settings={settings}
          activeFilter={activeFilter}
          onFilterChange={(filter) => setActiveFilter(filter)}
          onSelectClient={(client) => setSelectedClientDetail(client)}
          onOpenNewTransaction={(clientId, type) => openNewTransaction(clientId, type)}
          onOpenNewClient={() => {
            setClientToEdit(null);
            setIsClientModalOpen(true);
          }}
        />
      </main>

      {/* App Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {settings.shopName} — Carnet de Crédit Commerçant
          </span>
          <span className="text-slate-400">
            Stockage sécurisé sur votre appareil • Compatible WhatsApp & Impresion
          </span>
        </div>
      </footer>

      {/* Modals */}
      <ClientDetailModal
        isOpen={Boolean(selectedClientDetail)}
        onClose={() => setSelectedClientDetail(null)}
        client={currentSelectedDetailClient}
        transactions={transactions}
        settings={settings}
        onOpenAddTransaction={(clientId, type) => openNewTransaction(clientId, type)}
        onEditClient={(client) => {
          setClientToEdit(client);
          setIsClientModalOpen(true);
        }}
        onDeleteClient={handleDeleteClient}
        onDeleteTransaction={handleDeleteTransaction}
        onOpenReceipt={(client) => {
          setReceiptClient(client);
          setIsReceiptOpen(true);
        }}
      />

      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        client={receiptClient}
        transactions={transactions}
        settings={settings}
      />

      <QuickTransactionModal
        isOpen={isQuickTxOpen}
        onClose={() => setIsQuickTxOpen(false)}
        clients={clients}
        initialClientId={txInitialClientId}
        initialType={txInitialType}
        currency={settings.currency}
        onAddTransaction={handleAddTransaction}
        onOpenNewClient={() => {
          setIsQuickTxOpen(false);
          setClientToEdit(null);
          setIsClientModalOpen(true);
        }}
      />

      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        clientToEdit={clientToEdit}
        onSaveClient={handleSaveClient}
      />

      <ShopSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSaveSettings={setSettings}
        onResetDemoData={handleResetDemoData}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        clients={clients}
        transactions={transactions}
        settings={settings}
        onRestoreBackup={handleRestoreBackup}
      />

      <AiReminderModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        clients={clientsWithStats}
        settings={settings}
      />
    </div>
  );
}
