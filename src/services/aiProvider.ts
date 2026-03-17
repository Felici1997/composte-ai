/**
 * aiProvider.ts
 * Service IA unifié — OpenAI · Gemini · Anthropic
 * Composte AI — Congo Brazzaville
 *
 * Variables d'environnement supportées :
 *   VITE_OPENAI_API_KEY     → OpenAI (gpt-3.5-turbo / gpt-4o)
 *   VITE_GEMINI_API_KEY     → Google Gemini (gemini-1.5-flash)
 *   VITE_ANTHROPIC_API_KEY  → Anthropic Claude (claude-3-haiku)
 *   VITE_AI_PROVIDER        → 'openai' | 'gemini' | 'anthropic' (défaut: auto)
 */

export type AIProvider = 'openai' | 'gemini' | 'anthropic' | 'fallback';

interface ProviderConfig {
  provider: AIProvider;
  label:    string;
  model:    string;
  keyVar:   string;
  available: boolean;
}

/* ─── Détection des providers disponibles ─── */
export function getAvailableProviders(): ProviderConfig[] {
  return [
    {
      provider: 'openai',
      label:    'OpenAI (GPT)',
      model:    'gpt-3.5-turbo',
      keyVar:   'VITE_OPENAI_API_KEY',
      available: !!import.meta.env.VITE_OPENAI_API_KEY,
    },
    {
      provider: 'gemini',
      label:    'Google Gemini',
      model:    'gemini-1.5-flash',
      keyVar:   'VITE_GEMINI_API_KEY',
      available: !!import.meta.env.VITE_GEMINI_API_KEY,
    },
    {
      provider: 'anthropic',
      label:    'Anthropic Claude',
      model:    'claude-haiku-4-5-20251001',
      keyVar:   'VITE_ANTHROPIC_API_KEY',
      available: !!import.meta.env.VITE_ANTHROPIC_API_KEY,
    },
  ];
}

/* ─── Provider actif (localStorage > env > auto) ─── */
export function getActiveProvider(): AIProvider {
  const stored = localStorage.getItem('ai_provider') as AIProvider | null;
  if (stored && stored !== 'fallback') {
    const configs = getAvailableProviders();
    const found = configs.find(c => c.provider === stored && c.available);
    if (found) return found.provider;
  }

  const envProvider = import.meta.env.VITE_AI_PROVIDER as AIProvider | undefined;
  if (envProvider) return envProvider;

  // Auto : premier provider disponible
  const configs = getAvailableProviders();
  const first = configs.find(c => c.available);
  return first?.provider ?? 'fallback';
}

export function setActiveProvider(provider: AIProvider) {
  localStorage.setItem('ai_provider', provider);
}

/* ═══════════════════════════════════════
   APPEL IA UNIFIÉ
═══════════════════════════════════════ */
export async function callAI(prompt: string, maxTokens = 1500): Promise<string | null> {
  const provider = getActiveProvider();

  try {
    switch (provider) {
      case 'openai':    return await callOpenAI(prompt, maxTokens);
      case 'gemini':    return await callGemini(prompt, maxTokens);
      case 'anthropic': return await callAnthropic(prompt, maxTokens);
      default:          return null;
    }
  } catch (e) {
    console.error(`[AI ${provider}] erreur:`, e);
    return null;
  }
}

/* ─── OpenAI ─── */
async function callOpenAI(prompt: string, maxTokens: number): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  if (!apiKey) throw new Error('Clé VITE_OPENAI_API_KEY manquante');

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${res.statusText}`);
  const data = await res.json();
  return data.choices[0]?.message?.content ?? '';
}

/* ─── Gemini ─── */
async function callGemini(prompt: string, maxTokens: number): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) throw new Error('Clé VITE_GEMINI_API_KEY manquante');

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
      }),
    }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${res.statusText}`);
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

/* ─── Anthropic ─── */
async function callAnthropic(prompt: string, maxTokens: number): Promise<string> {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('Clé VITE_ANTHROPIC_API_KEY manquante');

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${res.statusText}`);
  const data = await res.json();
  return data.content?.[0]?.text ?? '';
}
