export const BASE = 'https://awqatsalah.diyanet.gov.tr';
export const DELAY = 1200;

export async function getToken(email, pass) {
  const res = await fetch(`${BASE}/Auth/Login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ Email: email, Password: pass }),
  });
  const d = await res.json();
  const t = d?.data?.accessToken || d?.Data?.AccessToken;
  if (!t) throw new Error('Login failed: ' + JSON.stringify(d).slice(0, 200));
  return t;
}

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}
