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

    // Serve index.html dynamically so we can patch crossorigin and inject nomodule at runtime
    app.get('*', (req, res) => {
      try {
        const indexFile = path.join(distPath, 'index.html');
        let html = fs.readFileSync(indexFile, 'utf8');

        // Remove crossorigin attributes from scripts/links
        html = html.replace(/\s+crossorigin(?=[\s>])/g, '');

        // Inject nomodule legacy script if a legacy bundle exists and nomodule is not already present
        const legacyPath = path.join(distPath, 'assets', 'legacy.js');
        if (fs.existsSync(legacyPath) && !/nomodule/.test(html)) {
          const marker = /<script[^>]*type="module"[^>]*><\/script>|<script[^>]*type="module"[^>]*>.*?<\/script>/s;
          // Fallback: insert before closing </head>
          html = html.replace('</head>', `    <script nomodule src="/assets/legacy.js"></script>\n  </head>`);
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
