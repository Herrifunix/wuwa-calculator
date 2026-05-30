export default async function handler(req, res) {
  try {
    // Call ipify from Vercel to get the outgoing IP that external services see
    const ipRes = await fetch('https://api.ipify.org?format=json');
    const data = await ipRes.json();
    res.json({ ip: data.ip, note: 'C\'est l\'IP que FatSecret voit. Whitelist celle-ci.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
