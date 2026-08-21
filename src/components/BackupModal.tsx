import React, { useState } from 'react';
import { X, Download, Upload, Database, Check, AlertCircle, FileText } from 'lucide-react';
import { Client, Transaction, ShopSettings } from '../types';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  transactions: Transaction[];
  settings: ShopSettings;
  onRestoreBackup: (data: { clients: Client[]; transactions: Transaction[]; settings?: ShopSettings }) => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  clients,
  transactions,
  settings,
  onRestoreBackup,
}) => {
  const [importStatus, setImportStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleExportJSON = () => {
    const data = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      shopName: settings.shopName,
      clients,
      transactions,
      settings,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `carnet_de_credit_${settings.shopName.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.json`;

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setImportStatus('');

    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);

        if (!parsed.clients || !Array.isArray(parsed.clients)) {
          throw new Error('Le fichier sélectionné ne contient pas de liste de clients valide.');
        }

        if (!parsed.transactions || !Array.isArray(parsed.transactions)) {
          throw new Error('Le fichier sélectionné ne contient pas de liste de transactions valide.');
        }

        onRestoreBackup({
          clients: parsed.clients,
          transactions: parsed.transactions,
          settings: parsed.settings,
        });

        setImportStatus(
          `Sauvegarde restaurée avec succès ! ${parsed.clients.length} clients et ${parsed.transactions.length} transactions importés.`
        );
      } catch (err: any) {
        setError(err.message || 'Erreur lors de la lecture du fichier de sauvegarde.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Sauvegarde & Secours</h2>
              <p className="text-xs text-slate-400">Exporter ou restaurer votre carnet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-slate-200">
          {importStatus && (
            <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{importStatus}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Local Data Status */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              État actuel du carnet local
            </span>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Clients enregistrés :</span>
              <span className="font-mono text-emerald-400 font-bold">{clients.length} clients</span>
            </div>
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-300">Mouvements (crédits/remboursements) :</span>
              <span className="font-mono text-emerald-400 font-bold">
                {transactions.length} lignes
              </span>
            </div>
          </div>

          {/* Export Section */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-4 h-4 text-emerald-400" />
              1. Télécharger une Sauvegarde (Fichier JSON)
            </h3>
            <p className="text-xs text-slate-400">
              Enregistrez un fichier de secours sur votre téléphone ou ordinateur pour ne jamais perdre vos comptes clients.
            </p>
            <button
              onClick={handleExportJSON}
              className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-slate-100 flex items-center justify-center gap-2 border border-slate-700 transition-all"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Télécharger le Carnet (.json)</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Upload className="w-4 h-4 text-indigo-400" />
              2. Restaurer à partir d’un fichier
            </h3>
            <p className="text-xs text-slate-400">
              Si vous changez de téléphone ou réinitialisez le navigateur, chargez votre fichier de sauvegarde.
            </p>

            <label className="w-full py-3 px-4 rounded-xl font-bold text-xs bg-slate-950 hover:bg-slate-800 text-indigo-300 border border-indigo-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all">
              <Upload className="w-4 h-4" />
              <span>Choisir un Fichier de Sauvegarde</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
