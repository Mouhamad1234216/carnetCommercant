import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = process.cwd();

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '10mb' }));

// Helper to initialize Gemini SDK safely
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// API Route: Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// API Route: Generate polite & professional WhatsApp reminder message for a client
app.post('/api/generate-reminder', async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { clientName, balance, currency, shopName, tone = 'polite' } = req.body;

    if (!ai) {
      // Fallback if no Gemini API key
      const fallbackMsg = `Bonjour ${clientName || 'Cher client'}, nous vous rappelons que votre solde à crédit chez ${shopName || 'notre boutique'} est de ${balance} ${currency || 'FCFA'}. Merci de nous contacter pour le règlement. Bonne journée !`;
      return res.json({ message: fallbackMsg });
    }

    const systemInstruction = `Tu es un assistant virtuel pour commerçants et épiciers de quartier.
Ton rôle est de rédiger un message de relance très poli, respectueux, naturel et efficace à envoyer sur WhatsApp ou SMS à un client qui a des achats à crédit non réglés.
Le message doit être chaleureux pour préserver la bonne relation client-commerçant tout en incitant gentiment au remboursement.`;

    const prompt = `Rédige un message WhatsApp court pour :
- Client : ${clientName}
- Nom de la boutique : ${shopName}
- Montant dû : ${balance} ${currency}
- Ton souhaité : ${tone === 'firm' ? 'Ferme mais courtois' : tone === 'urgent' ? 'Relance urgente et respectueuse' : 'Très amical et poli'}

Donne uniquement le texte du message sans explications.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    const message = response.text?.trim() || `Bonjour ${clientName}, petit rappel de ${shopName} : votre solde est de ${balance} ${currency}. Merci beaucoup !`;
    res.json({ message });
  } catch (error: any) {
    console.error('Error generating reminder:', error);
    res.status(500).json({ error: error.message || 'Erreur lors de la génération du message' });
  }
});

// API Route: AI Shopkeeper Advice / Debt Recovery Analysis
app.post('/api/debt-analysis', async (req, res) => {
  try {
    const ai = getGeminiClient();
    const { totalDebt, debtorCount, topDebtors, currency, shopName } = req.body;

    if (!ai) {
      return res.json({
        analysis: `Vous avez ${debtorCount} clients débiteurs pour un total de ${totalDebt} ${currency}. Priorisez les relances des plus gros montants ou des crédits les plus anciens.`,
      });
    }

    const prompt = `Voici le bilan des crédits clients de la boutique "${shopName}" :
- Total des crédits à recouvrer : ${totalDebt} ${currency}
- Nombre de clients avec dette : ${debtorCount}
- Principaux débiteurs : ${JSON.stringify(topDebtors)}

Fais une analyse synthétique en 3 conseils pratiques pour le commerçant pour améliorer son recouvrement et mieux gérer son carnet de dettes tout en gardant ses clients. Rédige en français clair et accessible.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    res.json({ analysis: response.text || 'Analyse indisponible pour le moment.' });
  } catch (error: any) {
    console.error('Error analyzing debt:', error);
    res.status(500).json({ error: 'Erreur lors de l’analyse' });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    // Serve a small legacy fallback script for old browsers that don't support modules
    app.get('/assets/legacy-fallback.js', (req, res) => {
      const script = `// legacy-fallback.js - minimal UI for old browsers\n(function(){\n  try{\n    var root = document.getElementById('root');\n    if(!root) return;\n    root.innerHTML = '\\n      <header style="background:#0f172a;color:#f8fafc;padding:12px 16px;position:sticky;top:0;z-index:30">\\n        <div style="display:flex;align-items:center;gap:12px">\\n          <div style="width:40px;height:40px;border-radius:8px;background:#10b981;display:flex;align-items:center;justify-content:center;color:white;font-weight:700">CC</div>\\n          <div>\\n            <div style="font-weight:700;font-size:16px">Carnet de Crédit</div>\\n            <div style="font-size:12px;color:#94a3b8">Commerçant</div>\\n          </div>\\n        </div>\\n      </header>\\n      <main style="padding:16px">\\n        <h2 style="color:#e6eef8">Bienvenue</h2>\\n        <p style="color:#cbd5e1">Cette version est une version de secours pour les navigateurs anciens. Pour la meilleure expérience, utilisez un navigateur moderne (Chrome/Firefox).</p>\\n        <div style=\"margin-top:12px;display:flex;gap:8px;flex-wrap:wrap\">\\n          <button style=\"padding:8px 12px;border-radius:10px;background:#0ea5a0;color:#031024;border:0\">Nouveau Client</button>\\n          <button style=\"padding:8px 12px;border-radius:10px;background:#fb7185;color:white;border:0\">+ Nouveau Prêt</button>\\n        </div>\\n      </main>';\n  }catch(e){console.error('legacy fallback error',e)}\n})();`;
      res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
      res.send(script);
    });

    // Serve index.html dynamically so we can patch crossorigin and inject nomodule at runtime
    app.get('*', (req, res) => {
      try {
        const indexFile = path.join(distPath, 'index.html');
        let html = fs.readFileSync(indexFile, 'utf8');

        // Remove crossorigin attributes from scripts/links
        html = html.replace(/\s+crossorigin(?=[\s>])/g, '');

        // Inject nomodule legacy fallback (served by server) so old browsers render a minimal UI
        if (!/nomodule/.test(html)) {
          html = html.replace('</head>', `    <script nomodule src="/assets/legacy-fallback.js"></script>\n  </head>`);
        }

        // Inject critical inline CSS if not already present (ensures header/forms render without Tailwind)
        if (!html.includes('/* CRITICAL_INLINE_CSS_MARKER */')) {
          const criticalCss = `\n    <style>/* CRITICAL_INLINE_CSS_MARKER */\n      header{background:#0f172a;border-bottom:1px solid rgba(15,23,42,0.9);color:#f8fafc;position:sticky;top:0;z-index:30}\n      header .container{display:flex;align-items:center;justify-content:space-between;padding:12px 16px}\n      header .brand{display:flex;align-items:center;gap:12px}\n      header h1{font-size:1rem;margin:0;font-weight:700}\n      .btn{display:inline-flex;align-items:center;gap:.5rem;padding:.5rem .75rem;border-radius:.75rem;background:#0b1220;color:#e6eef8;border:1px solid rgba(255,255,255,0.03);font-size:.85rem}\n      .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.75);display:flex;align-items:center;justify-content:center;padding:1rem}\n      .modal{background:#0b1220;border:1px solid #111827;border-radius:16px;max-width:640px;width:100%;color:#e6eef8;overflow:hidden}\n      input,select,textarea,button{font-family:system-ui,Segoe UI,Roboto,\"Helvetica Neue\",Arial}\n      input,select,textarea{background:#071021;border:1px solid #111827;color:#e6eef8;padding:.65rem .9rem;border-radius:12px}\n      .rounded-xl{border-radius:12px}\n      .text-slate-100{color:#f1f5f9}\n      .bg-slate-900{background:#0f172a}\n    </style>\n  `;
          html = html.replace('</head>', criticalCss + '  </head>');
        }

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(html);
      } catch (err) {
        console.error('Failed to read or patch index.html:', err);
        res.status(500).send('Internal Server Error');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening at http://0.0.0.0:${PORT}`);
  });
}

startServer();
