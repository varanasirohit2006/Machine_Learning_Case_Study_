export default async function handler(req, res) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    return res.status(500).json({ error: 'BACKEND_URL service binding is not configured' });
  }

  try {
    const targetUrl = new URL('metadata', backendUrl.endsWith('/') ? backendUrl : backendUrl + '/');
    const response = await fetch(targetUrl);
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
