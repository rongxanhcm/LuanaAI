// api/generate.js — Vercel Serverless Function
// File này chạy trên server, user không thể thấy API key

// 🔔 Notify Discord with structured event data
async function notifyDiscord(event) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const {
      eventType = 'generate',
      provider = 'unknown',
      model = 'unknown',
      topic = '(Không rõ)',
      chapterTitle,
      chapterIndex,
      totalChapters,
      filename,
      fileSize,
      time = new Date().toLocaleString('vi-VN')
    } = event || {};

    const title = eventType === 'download'
      ? '📥 Document Downloaded'
      : '📄 Document Generated';

    const fields = [];
    if (eventType === 'download') {
      fields.push({ name: 'File', value: filename || '(Không rõ)', inline: false });
      fields.push({ name: 'Size', value: Number.isFinite(fileSize) ? `${Math.round(fileSize / 1024)} KB` : '(Không rõ)', inline: true });
      fields.push({ name: 'Topic', value: topic, inline: true });
    } else {
      fields.push({ name: 'Provider', value: provider, inline: true });
      fields.push({ name: 'Model', value: model, inline: true });
      fields.push({ name: 'Topic', value: topic, inline: false });
      if (chapterTitle) {
        fields.push({ name: 'Chapter', value: chapterTitle, inline: false });
      }
      if (Number.isFinite(chapterIndex) && Number.isFinite(totalChapters)) {
        fields.push({ name: 'Progress', value: `${chapterIndex}/${totalChapters}`, inline: true });
      }
    }
    fields.push({ name: 'Time', value: time, inline: false });

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title,
          color: 3447003,
          fields,
          footer: { text: 'docgen-vn' }
        }]
      })
    });
  } catch (err) {
    console.error('Discord notification failed:', err);
  }
}

module.exports = async function handler(req, res) {
  // Chỉ cho phép POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS — cho phép frontend của bạn gọi vào
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const {
    prompt,
    provider: rawProvider,
    model: rawModel,
    notifyEvent,
    tracking
  } = req.body || {};

  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  // Rate limit đơn giản — giới hạn độ dài prompt để tránh abuse
  if (prompt.length > 8000) {
    return res.status(400).json({ error: 'Prompt quá dài' });
  }

  const MODEL_MAP = {
    gemini: {
      'gemini-2.5-flash-lite': 'gemini-2.5-flash-lite',
      'gemini-3.1-pro-preview': 'gemini-3.1-pro-preview'
    },
    claude: {
      'claude-haiku': process.env.CLAUDE_HAIKU_MODEL || 'claude-haiku-4-5-20251001',
      'claude-opus': process.env.CLAUDE_OPUS_MODEL || 'claude-opus-4-6'
    }
  };

  const inferredProvider = rawProvider
    || (typeof rawModel === 'string' && rawModel.startsWith('claude') ? 'claude' : 'gemini');

  const provider = MODEL_MAP[inferredProvider] ? inferredProvider : 'gemini';
  const providerModels = MODEL_MAP[provider];
  const defaultModelKey = provider === 'claude' ? 'claude-haiku' : 'gemini-2.5-flash-lite';
  const modelKey = providerModels[rawModel] ? rawModel : defaultModelKey;
  const model = providerModels[modelKey];

  try {
    let response;

    if (provider === 'gemini') {
      if (!process.env.GOOGLE_API_KEY) {
        return res.status(500).json({ error: 'Thiếu GOOGLE_API_KEY trong environment variables' });
      }

      // Google Gemini API
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 10000,
          }
        }),
      });
    } else {
      if (!process.env.ANTHROPIC_API_KEY) {
        return res.status(500).json({ error: 'Thiếu ANTHROPIC_API_KEY trong environment variables' });
      }

      // Claude/Anthropic API
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': process.env.ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens: 10000,
          messages: [{ role: 'user', content: prompt }],
        }),
      });
    }

    if (!response.ok) {
      const err = await response.text();
      console.error(`${model} API error:`, err);
      return res.status(response.status).json({ error: 'AI API error' });
    }

    const data = await response.json();

    if (notifyEvent) {
      const eventPayload = {
        eventType: 'generate',
        provider,
        model,
        topic: tracking?.topic,
        chapterTitle: tracking?.chapterTitle,
        chapterIndex: tracking?.chapterIndex,
        totalChapters: tracking?.totalChapters
      };
      notifyDiscord(eventPayload);
    }
    
    return res.status(200).json(data);

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
