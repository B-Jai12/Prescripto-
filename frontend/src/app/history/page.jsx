"use client";
import { useState, useEffect } from "react";
import { Clock, ChevronRight, FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import PatientSummaryCard from "@/components/PatientSummaryCard";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      // 1. Check local storage first (instant, private, and works completely offline)
      try {
        const localRaw = localStorage.getItem("lipirx_prescription_history");
        if (localRaw) {
          const localItems = JSON.parse(localRaw);
          if (Array.isArray(localItems) && localItems.length > 0) {
            setHistory(localItems);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn("Could not read local prescription history:", e);
      }

      // 2. Fallback to backend history endpoint if available
      const email = localStorage.getItem("userEmail");
      if (email) {
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
          const response = await fetch(`${apiBaseUrl}/history/${encodeURIComponent(email)}`);
          if (response.ok) {
            const data = await response.json();
            if (Array.isArray(data) && data.length > 0) {
              setHistory(data.reverse());
            }
          }
        } catch (error) {
          console.warn("Backend history not reachable or not configured:", error);
        }
      }
      setLoading(false);
    };

    fetchHistory();
  }, []);

  if (selectedItem) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d0d12', color: 'white', padding: '24px' }}>
        <button 
          onClick={() => setSelectedItem(null)}
          style={{ 
            display: 'flex', alignItems: 'center', gap: 8, 
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
            cursor: 'pointer', marginBottom: 24, fontSize: 14
          }}
        >
          <ArrowLeft size={16} /> Back to History
        </button>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <PatientSummaryCard data={selectedItem.data} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d12', color: 'white', fontFamily: "'Inter', sans-serif" }}>
      <nav style={{ padding: '24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/app" style={{ color: 'white', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            LipiRx <span style={{ color: 'rgba(255,255,255,0.4)' }}>History</span>
          </Link>
          <Link href="/app" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Analyze New</Link>
        </div>
      </nav>

      <main style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px' }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Your Analysis History</h1>
        <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: 40 }}>All your previously analyzed prescriptions in one place.</p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.3)' }}>Loading history...</div>
        ) : history.length === 0 ? (
          <div style={{ 
            textAlign: 'center', padding: '80px 40px', 
            borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.02)'
          }}>
            <Clock size={48} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: 16 }} />
            <p style={{ color: 'rgba(255,255,255,0.4)' }}>No history found. Try analyzing a prescription first!</p>
            <Link href="/app" style={{ 
              display: 'inline-block', marginTop: 24, padding: '10px 20px', 
              background: 'white', color: 'black', borderRadius: 12, 
              textDecoration: 'none', fontWeight: 600, fontSize: 14 
            }}>
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map((item) => {
              const displayDate = item.timestamp
                ? new Date(item.timestamp).toLocaleDateString(undefined, { dateStyle: 'medium' })
                : "Recent";
              const patientTitle = item.data?.result?.patient_details?.name || item.patientName || "Prescription Analysis";
              const medCount = item.data?.result?.medicines?.length || item.medicinesCount || 0;

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '20px', borderRadius: 16,
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    textAlign: 'left', cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                >
                  <div style={{ 
                    width: 48, height: 48, borderRadius: 12, 
                    background: 'rgba(255,255,255,0.05)', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                  }}>
                    <FileText size={20} style={{ color: 'rgba(255,255,255,0.6)' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 4 }}>
                      {patientTitle}
                    </p>
                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                      {displayDate} · {medCount} medicine{medCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <ChevronRight size={18} style={{ color: 'rgba(255,255,255,0.2)' }} />
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
