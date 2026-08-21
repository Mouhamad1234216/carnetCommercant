import React, { useState } from 'react';
import {
  X,
  Bot,
  Sparkles,
  MessageSquare,
  Copy,
  Check,
  Send,
  TrendingUp,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { ClientWithStats, ShopSettings } from '../types';
import { formatCurrency, sanitizePhoneForWhatsApp } from '../utils/storage';

interface AiReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: ClientWithStats[];
  settings: ShopSettings;
}

export const AiReminderModal: React.FC<AiReminderModalProps> = ({
  isOpen,
  onClose,
  clients,
  settings,
}) => {
  const [activeTab, setActiveTab] = useState<'reminder' | 'analysis'>('reminder');
  const debtors = clients.filter((c) => c.balance > 0);

  const [selectedClientId, setSelectedClientId] = useState<string>(debtors[0]?.id || '');
  const [tone, setTone] = useState<'polite' | 'firm' | 'urgent'>('polite');
  const [generatedMessage, setGeneratedMessage] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Analysis state
  const [analysisText, setAnalysisText] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  if (!isOpen) return null;

  const selectedClient = clients.find((c) => c.id === selectedClientId) || debtors[0];

  const handleGenerateReminder = async () => {
    if (!selectedClient) return;
    setIsGenerating(true);
    setGeneratedMessage('');

    try {
      const res = await fetch('/api/generate-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: selectedClient.name,
          balance: formatCurrency(selectedClient.balance, settings.currency),
          currency: settings.currency,
          shopName: settings.shopName,
          tone,
        }),
      });

      const data = await res.json();
      setGeneratedMessage(data.message || 'Impossible de générer le message.');
    } catch (err) {
      console.error(err);
      setGeneratedMessage(
        `Bonjour ${selectedClient.name}, un rappel amical de la ${
          settings.shopName
        } : votre solde actuel à crédit est de ${formatCurrency(
          selectedClient.balance,
          settings.currency
        )}. Merci de penser à passer pour le règlement !`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisText('');

    const totalDebt = clients.reduce((sum, c) => (c.balance > 0 ? sum + c.balance : sum), 0);
    const topDebtors = debtors
      .sort((a, b) => b.balance - a.balance)
      .slice(0, 3)
      .map((c) => ({
        name: c.name,
        dette: formatCurrency(c.balance, settings.currency),
      }));

    try {
      const res = await fetch('/api/debt-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalDebt: formatCurrency(totalDebt, settings.currency),
          debtorCount: debtors.length,
          topDebtors,
          currency: settings.currency,
          shopName: settings.shopName,
        }),
      });

      const data = await res.json();
      setAnalysisText(data.analysis || 'Analyse non disponible.');
    } catch (err) {
      console.error(err);
      setAnalysisText('Erreur lors du calcul de l’analyse.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopy = () => {
    if (!generatedMessage) return;
    navigator.clipboard.writeText(generatedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cleanPhone = selectedClient ? sanitizePhoneForWhatsApp(selectedClient.phone || '') : '';
  const waUrl = selectedClient
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(generatedMessage)}`
    : '';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-1.5">
                <span>Assistant IA Commerçant</span>
                <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono text-[10px]">
                  Gemini
                </span>
              </h2>
              <p className="text-xs text-slate-400">Génération de relances & conseils de gestion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-800 bg-slate-950 px-5 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('reminder')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'reminder'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Rédiger un Message de Relance</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('analysis');
              if (!analysisText) handleGenerateAnalysis();
            }}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'analysis'
                ? 'border-indigo-500 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            <span>Analyse Bilan Crédits</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 text-slate-200 space-y-4">
          {/* TAB 1: AI REMINDER GENERATOR */}
          {activeTab === 'reminder' && (
            <div className="space-y-4">
              {debtors.length === 0 ? (
                <div className="p-4 rounded-xl bg-slate-950 text-center border border-slate-800 text-xs text-slate-400">
                  Félicitations ! Aucun client n’a de dette non réglée pour le moment.
                </div>
              ) : (
                <>
                  {/* Client Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Choisir le client à relancer
                    </label>
                    <select
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-100 font-semibold focus:outline-none focus:border-indigo-500"
                    >
                      {debtors.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} — Doit {formatCurrency(c.balance, settings.currency)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tone Select */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-300">
                      Ton du message
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'polite', label: '😊 Amical & Poli' },
                        { id: 'firm', label: '🤝 Courtois & Ferme' },
                        { id: 'urgent', label: '⏳ Relance Urgente' },
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setTone(item.id as any)}
                          className={`p-2 rounded-xl text-xs font-semibold border transition-all ${
                            tone === item.id
                              ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Generate Button */}
                  <button
                    onClick={handleGenerateReminder}
                    disabled={isGenerating}
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/40 transition-all"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Rédaction du message par l'IA...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-indigo-200" />
                        <span>Générer le Message WhatsApp avec l'IA</span>
                      </>
                    )}
                  </button>

                  {/* Generated Message Display */}
                  {generatedMessage && (
                    <div className="space-y-3 pt-2">
                      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 font-sans leading-relaxed whitespace-pre-wrap">
                        {generatedMessage}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopy}
                          className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          {copied ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                          <span>{copied ? 'Copié !' : 'Copier'}</span>
                        </button>

                        {selectedClient?.phone && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40"
                          >
                            <Send className="w-4 h-4" />
                            <span>Envoyer WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* TAB 2: DEBT ANALYSIS */}
          {activeTab === 'analysis' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/30 space-y-2">
                <h3 className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" />
                  Conseils de Recouvrement IA pour {settings.shopName}
                </h3>
                {isAnalyzing ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 py-4">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
                    <span>Analyse des dettes en cours par Gemini AI...</span>
                  </div>
                ) : (
                  <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {analysisText || 'Cliquez ci-dessous pour analyser la situation des crédits.'}
                  </p>
                )}
              </div>

              <button
                onClick={handleGenerateAnalysis}
                disabled={isAnalyzing}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all"
              >
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Actualiser l'Analyse IA</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
