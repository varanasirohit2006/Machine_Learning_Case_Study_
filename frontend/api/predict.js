export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return res.status(500).json({ error: 'BACKEND_URL service binding is not configured' });
  }

  try {
    const targetUrl = new URL('predict', backendUrl.endsWith('/') ? backendUrl : backendUrl + '/');
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
