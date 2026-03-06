// api/track.js — lightweight event tracking endpoint for Discord

async function notifyDiscord(event) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    const {
      eventType = 'event',
      topic = '(Không rõ)',
      filename,
      fileSize,
      provider,
      model,
      time = new Date().toLocaleString('vi-VN')
    } = event || {};

    const titleMap = {
      download: '📥 Document Downloaded',
      generate: '📄 Document Generated'
    };

    const fields = [];
    if (topic) fields.push({ name: 'Topic', value: topic, inline: false });
    if (filename) fields.push({ name: 'File', value: filename, inline: false });
    if (Number.isFinite(fileSize)) fields.push({ name: 'Size', value: `${Math.round(fileSize / 1024)} KB`, inline: true });
    if (provider) fields.push({ name: 'Provider', value: provider, inline: true });
    if (model) fields.push({ name: 'Model', value: model, inline: true });
    fields.push({ name: 'Time', value: time, inline: false });

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        embeds: [{
          title: titleMap[eventType] || `📌 Event: ${eventType}`,
          color: eventType === 'download' ? 3066993 : 3447003,
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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { eventType, topic, filename, fileSize, provider, model } = req.body || {};
  if (!eventType) {
    return res.status(400).json({ error: 'Missing eventType' });
  }

  notifyDiscord({ eventType, topic, filename, fileSize, provider, model });
  return res.status(200).json({ ok: true });
};
