'use client';

import { useState } from 'react';

type Product = {
  product_name?: string;
  brands?: string;
  categories?: string;
  image_front_url?: string;
};

export default function HomePage() {
  const [barcode, setBarcode] = useState('');
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setAiError(null);
    setProduct(null);
    setAiSummary(null);

    if (!barcode.trim()) {
      setError('Skriv in en streckkod först.');
      return;
    }

    setLoading(true);
    try {
      // 1) Hämta produktdata från OpenFoodFacts
      const res = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
      );
      const data = await res.json();

      if (data.status === 0) {
        setError('Hittade ingen produkt för den här koden.');
        return;
      }

      const p: Product = data.product;
      setProduct(p);

      // 2) Anropa vårt AI-API med produktinfo
      setAiLoading(true);
      const aiRes = await fetch('/api/eco-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productName: p.product_name ?? 'Okänd produkt',
          brand: p.brands ?? 'Okänt varumärke',
          categories: p.categories ?? 'Okända kategorier',
        }),
      });

      if (!aiRes.ok) {
        setAiError('Kunde inte hämta AI-sammanfattning.');
      } else {
        const aiData = await aiRes.json();
        setAiSummary(aiData.summary ?? null);
      }
    } catch (err) {
      console.error(err);
      setError('Något gick fel när vi hämtade data.');
    } finally {
      setLoading(false);
      setAiLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="card">
        <h1>Ekoscanner – Steg 1 (konsument)</h1>
        <p className="subtitle">
          Testa genom att skriva in en EAN-kod från en matprodukt.
          Vi frågar OpenFoodFacts om info om produkten och AI om en
          enkel hållbarhetsbeskrivning.
        </p>

        <form onSubmit={handleSubmit} className="form">
          <input
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            placeholder="Ex: 7311870010970"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Söker…' : 'Hämta info'}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {product && (
          <div className="product">
            <h2>{product.product_name || 'Okänt produktnamn'}</h2>
            {product.brands && <p>Varumärke: {product.brands}</p>}
            {product.categories && (
              <p className="categories">Kategorier: {product.categories}</p>
            )}
            {product.image_front_url && (
              <img
                src={product.image_front_url}
                alt={product.product_name}
              />
            )}

            <div className="ai-block">
              <h3>AI – hållbarhetsprofil</h3>
              {aiLoading && <p>Analyserar produktens profil…</p>}
              {aiError && <p className="error">{aiError}</p>}
              {aiSummary && <p className="ai-text">{aiSummary}</p>}
              {!aiLoading && !aiSummary && !aiError && (
                <p className="ai-placeholder">
                  När du hämtar en produkt försöker AI ge en kort
                  hållbarhetsbeskrivning här.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #020617;
          color: #e5e7eb;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
            sans-serif;
          padding: 24px;
        }

        .card {
          width: 100%;
          max-width: 520px;
          background: #020617;
          border-radius: 16px;
          padding: 24px 20px;
          border: 1px solid #1f2937;
          box-shadow: 0 18px 35px rgba(0, 0, 0, 0.55);
        }

        h1 {
          font-size: 1.4rem;
          margin-bottom: 6px;
        }

        .subtitle {
          font-size: 0.85rem;
          color: #9ca3af;
          margin-bottom: 18px;
        }

        .form {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }

        input {
          flex: 1;
          padding: 8px 10px;
          border-radius: 8px;
          border: 1px solid #374151;
          background: #020617;
          color: #e5e7eb;
          font-size: 0.9rem;
        }

        input::placeholder {
          color: #6b7280;
        }

        button {
          padding: 8px 14px;
          border-radius: 8px;
          border: none;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          background: #22c55e;
          color: #022c22;
        }

        button:disabled {
          opacity: 0.7;
          cursor: default;
        }

        .error {
          color: #fca5a5;
          font-size: 0.85rem;
          margin-top: 4px;
          margin-bottom: 4px;
        }

        .product {
          margin-top: 8px;
          padding-top: 10px;
          border-top: 1px solid #1f2937;
          font-size: 0.9rem;
        }

        .product h2 {
          font-size: 1rem;
          margin-bottom: 4px;
        }

        .categories {
          font-size: 0.8rem;
          color: #9ca3af;
          margin-top: 4px;
        }

        img {
          margin-top: 10px;
          max-width: 140px;
          border-radius: 8px;
          border: 1px solid #1f2937;
        }

        .ai-block {
          margin-top: 16px;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #1f2937;
          background: #020617;
        }

        .ai-block h3 {
          font-size: 0.95rem;
          margin-bottom: 6px;
        }

        .ai-text {
          font-size: 0.85rem;
          color: #e5e7eb;
        }

        .ai-placeholder {
          font-size: 0.8rem;
          color: #6b7280;
        }
      `}</style>
    </main>
  );
}
