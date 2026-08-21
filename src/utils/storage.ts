import { Client, Transaction, ShopSettings, ClientWithStats } from '../types';

const CLIENTS_STORAGE_KEY = 'carnet_commercant_clients_v1';
const TRANSACTIONS_STORAGE_KEY = 'carnet_commercant_transactions_v1';
const SETTINGS_STORAGE_KEY = 'carnet_commercant_settings_v1';

export const DEFAULT_SHOP_SETTINGS: ShopSettings = {
  shopName: 'Alimentation Générale la Confiance',
  ownerName: 'Diallo Ousmane',
  phone: '+221 77 123 45 67',
  city: 'Dakar',
  currency: 'FCFA',
  reminderTemplate: 'Bonjour {CLIENT_NAME}, un petit rappel amical de la {SHOP_NAME}. Votre solde actuel à crédit est de {BALANCE}. Merci de votre confiance !',
  receiptHeader: 'Merci pour votre fidélité !',
};

// Realistic initial sample data
export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'c1',
    name: 'Mamadou Sow',
    phone: '+221 77 456 78 90',
    address: 'Quartier Medina, rue 12',
    category: 'FIDEL',
    notes: 'Achète souvent du riz et du sucre en gros',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c2',
    name: 'Aïcha Traoré',
    phone: '+221 78 321 65 40',
    address: 'Près de la mosquée centrale',
    category: 'REGULIER',
    notes: 'Paie toujours en fin de mois',
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c3',
    name: 'Moussa Koné',
    phone: '+221 76 987 12 34',
    address: 'Marché couvert, stand 4',
    category: 'PASSAGER',
    notes: 'Avance sur matériel de quincaillerie',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'c4',
    name: 'Fatou Ndiaye',
    phone: '+221 70 555 44 33',
    address: 'Villa 145, Cité Keur Gorgui',
    category: 'FIDEL',
    notes: 'Compte entièrement réglé',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const now = new Date();
const daysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
const daysAhead = (days: number) => new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

export const INITIAL_TRANSACTIONS: Transaction[] = [
  // Client 1: Mamadou Sow
  {
    id: 't1',
    clientId: 'c1',
    type: 'CREDIT',
    amount: 18500,
    description: '1 Sac de riz 25kg + 5L Huile Dinor',
    date: daysAgo(12),
    dueDate: daysAgo(2), // Overdue
    paymentMethod: 'OTHER',
    notes: 'Promis de payer vendredi dernier',
  },
  {
    id: 't2',
    clientId: 'c1',
    type: 'CREDIT',
    amount: 4500,
    description: '2 Boîtes de lait Nido + Sucre 2kg',
    date: daysAgo(5),
    paymentMethod: 'OTHER',
  },
  {
    id: 't3',
    clientId: 'c1',
    type: 'REPAYMENT',
    amount: 10000,
    description: 'Acompte espèces reçu au comptoir',
    date: daysAgo(2),
    paymentMethod: 'CASH',
  },

  // Client 2: Aïcha Traoré
  {
    id: 't4',
    clientId: 'c2',
    type: 'CREDIT',
    amount: 32000,
    description: 'Achats épicerie familiale du mois',
    date: daysAgo(15),
    dueDate: daysAhead(5),
    paymentMethod: 'OTHER',
  },
  {
    id: 't5',
    clientId: 'c2',
    type: 'REPAYMENT',
    amount: 15000,
    description: 'Remboursement partiel par Wave',
    date: daysAgo(1),
    paymentMethod: 'WAVE',
  },

  // Client 3: Moussa Koné
  {
    id: 't6',
    clientId: 'c3',
    type: 'CREDIT',
    amount: 7500,
    description: 'Paquet de café + Cartouche de gaz',
    date: daysAgo(5),
    dueDate: daysAgo(1), // Overdue
    paymentMethod: 'OTHER',
  },

  // Client 4: Fatou Ndiaye (Réglé)
  {
    id: 't7',
    clientId: 'c4',
    type: 'CREDIT',
    amount: 12000,
    description: 'Produits d’entretien et condiments',
    date: daysAgo(20),
    paymentMethod: 'OTHER',
  },
  {
    id: 't8',
    clientId: 'c4',
    type: 'REPAYMENT',
    amount: 12000,
    description: 'Règlement total par Orange Money',
    date: daysAgo(3),
    paymentMethod: 'ORANGE_MONEY',
  },
];

export function getStoredClients(): Client[] {
  try {
    const raw = localStorage.getItem(CLIENTS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(INITIAL_CLIENTS));
      return INITIAL_CLIENTS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load clients', err);
    return INITIAL_CLIENTS;
  }
}

export function saveStoredClients(clients: Client[]): void {
  try {
    localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(clients));
  } catch (err) {
    console.error('Failed to save clients', err);
  }
}

export function getStoredTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(INITIAL_TRANSACTIONS));
      return INITIAL_TRANSACTIONS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load transactions', err);
    return INITIAL_TRANSACTIONS;
  }
}

export function saveStoredTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_STORAGE_KEY, JSON.stringify(transactions));
  } catch (err) {
    console.error('Failed to save transactions', err);
  }
}

export function getStoredSettings(): ShopSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(DEFAULT_SHOP_SETTINGS));
      return DEFAULT_SHOP_SETTINGS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load settings', err);
    return DEFAULT_SHOP_SETTINGS;
  }
}

export function saveStoredSettings(settings: ShopSettings): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save settings', err);
  }
}

// Compute client statistics
export function computeClientStats(clients: Client[], transactions: Transaction[]): ClientWithStats[] {
  const nowMs = new Date().getTime();

  return clients.map((client) => {
    const clientTx = transactions.filter((t) => t.clientId === client.id);

    let totalCredit = 0;
    let totalRepayment = 0;
    let latestDate: string | undefined = undefined;
    let isOverdue = false;

    clientTx.forEach((t) => {
      if (!latestDate || new Date(t.date).getTime() > new Date(latestDate).getTime()) {
        latestDate = t.date;
      }

      if (t.type === 'CREDIT') {
        totalCredit += t.amount;
        if (t.dueDate) {
          const dueMs = new Date(t.dueDate).getTime();
          if (dueMs < nowMs) {
            isOverdue = true;
          }
        }
      } else if (t.type === 'REPAYMENT') {
        totalRepayment += t.amount;
      }
    });

    const balance = totalCredit - totalRepayment;
    const finalOverdue = balance > 0 && isOverdue;

    return {
      ...client,
      totalCredit,
      totalRepayment,
      balance,
      lastTransactionDate: latestDate,
      isOverdue: finalOverdue,
      transactionCount: clientTx.length,
    };
  });
}

// Formatter for currency
export function formatCurrency(amount: number, currency: string = 'FCFA'): string {
  const formatted = new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));

  return `${formatted} ${currency}`;
}

// Formatter for dates in French
export function formatDateFR(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTimeFR(dateString?: string): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

// Clean phone number for WhatsApp link
export function sanitizePhoneForWhatsApp(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

// Generate WhatsApp reminder link
export function generateWhatsAppReminderLink(
  client: ClientWithStats,
  settings: ShopSettings
): string {
  const rawMsg = settings.reminderTemplate
    .replace('{CLIENT_NAME}', client.name)
    .replace('{SHOP_NAME}', settings.shopName)
    .replace('{BALANCE}', formatCurrency(client.balance, settings.currency));

  const cleanPhone = sanitizePhoneForWhatsApp(client.phone);
  const encodedText = encodeURIComponent(rawMsg);

  if (cleanPhone) {
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }
  return `https://wa.me/?text=${encodedText}`;
}
