// api/contact.js
// Vercel serverless function to proxy contact form submissions to the Pipedream webhook
// Keeps requests same-origin to avoid browser CORS preflight issues.

export default async function handler(req, res) {
  // Allow CORS for preflight and requests (adjust origin if needed)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Forward the incoming JSON body to the Pipedream webhook
    const pdResp = await fetch('https://eoz7fhlceik29oz.m.pipedream.net', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });

    const text = await pdResp.text();
    // Mirror upstream status and body back to the browser
    res.status(pdResp.status).send(text);

  } catch (err) {
    console.error('Proxy error forwarding to Pipedream:', err);
    res.status(502).json({ error: 'Upstream request failed' });
  }
}
