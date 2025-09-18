import { useEffect, useMemo, useState } from 'react';

type SaleStatus = 'upcoming' | 'active' | 'ended' | 'sold_out';

export const App: React.FC = () => {
  const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:4000';
  const [status, setStatus] = useState<SaleStatus>('upcoming');
  const [remaining, setRemaining] = useState<number>(0);
  const [startsAt, setStartsAt] = useState<string>('');
  const [endsAt, setEndsAt] = useState<string>('');
  const [userId, setUserId] = useState('user-' + Math.floor(Math.random() * 1e6));
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    try {
      const res = await fetch(`${API}/sale/status`);
      const data = await res.json();
      setStatus(data.status);
      setRemaining(data.remaining);
      setStartsAt(data.startsAt);
      setEndsAt(data.endsAt);
    } catch (e) {
      setMessage('Failed to load status');
    }
  };

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 2000);
    return () => clearInterval(t);
  }, []);

  const buyNow = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API}/sale/purchase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage('Success! You secured the item.');
      } else {
        if (data.reason === 'already_purchased') setMessage('You already purchased.');
        else if (data.reason === 'outside_window') setMessage('Sale not active.');
        else if (data.reason === 'sold_out') setMessage('Sold out.');
        else setMessage('Failed.');
      }
    } catch (e) {
      setMessage('Request failed');
    } finally {
      setLoading(false);
      refresh();
    }
  };

  return (
    <div style={{ maxWidth: 640, margin: '2rem auto', fontFamily: 'sans-serif' }}>
      <h1>Flash Sale</h1>
      <p>Status: <b>{status}</b> | Remaining: <b>{remaining}</b></p>
      <p>Starts: {startsAt} <br /> Ends: {endsAt}</p>
      <div style={{ marginTop: 16 }}>
        <label>User ID: </label>
        <input value={userId} onChange={(e) => setUserId(e.target.value)} style={{ padding: 8 }} />
      </div>
      <button disabled={loading || status !== 'active'} onClick={buyNow} style={{ marginTop: 16, padding: '8px 12px' }}>
        {loading ? 'Processing...' : 'Buy Now'}
      </button>
      {message && <p style={{ marginTop: 16 }}>{message}</p>}
    </div>
  );
};
