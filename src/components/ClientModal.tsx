import React, { useState, useEffect } from 'react';
import { X, User, Phone, MapPin, Tag, FileText, Check, AlertCircle } from 'lucide-react';
import { Client } from '../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientToEdit?: Client | null;
  onSaveClient: (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }) => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  clientToEdit,
  onSaveClient,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState<'FIDEL' | 'REGULIER' | 'NOUVEAU' | 'PASSAGER'>('REGULIER');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (clientToEdit) {
        setName(clientToEdit.name);
        setPhone(clientToEdit.phone || '');
        setAddress(clientToEdit.address || '');
        setCategory(clientToEdit.category || 'REGULIER');
        setNotes(clientToEdit.notes || '');
      } else {
        setName('');
        setPhone('');
        setAddress('');
        setCategory('REGULIER');
        setNotes('');
      }
      setError('');
    }
  }, [isOpen, clientToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Veuillez saisir le nom du client.');
      return;
    }

    onSaveClient({
      id: clientToEdit?.id,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim() || undefined,
      category,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                {clientToEdit ? 'Modifier la Fiche Client' : 'Ajouter un Nouveau Client'}
              </h2>
              <p className="text-xs text-slate-400">
                Informations de contact pour le carnet de dettes
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

          {/* Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              Nom & Prénom du Client *
            </label>
            <input
              type="text"
              placeholder="Ex: Mamadou Sow"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              autoFocus
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Numéro de Téléphone (WhatsApp)
            </label>
            <input
              type="tel"
              placeholder="Ex: +221 77 123 45 67"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-400">
              Permet d'envoyer des reçus et rappels de dette directement par WhatsApp.
            </p>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              Adresse / Quartier / Repère
            </label>
            <input
              type="text"
              placeholder="Ex: Medina Rue 12, près de la grande mosquée"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              Type / Catégorie de Client
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="FIDEL">Client Fidèle (Habitué de confiance)</option>
              <option value="REGULIER">Client Régulier</option>
              <option value="NOUVEAU">Nouveau Client</option>
              <option value="PASSAGER">Client Passager</option>
            </select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              Notes particulières
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Paie la fin du mois après salaire, habite au 1er étage."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-3">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all transform active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>{clientToEdit ? 'Mettre à jour le Client' : 'Créer la Fiche Client'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
