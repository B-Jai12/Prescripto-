"use client";
import { useState, useEffect } from "react";
import { Clock, ChevronRight, FileText, ArrowLeft } from "lucide-react";
import PatientSummaryCard from "@/components/PatientSummaryCard";

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const email = localStorage.getItem("userEmail");
      if (!email) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:8000/history/${email}`);
        const data = await response.json();
        setHistory(data.reverse()); // Show newest first
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setLoading(false);
      }
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
          <a href="/app" style={{ color: 'white', textDecoration: 'none', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
            LipiRx <span style={{ color: 'rgba(255,255,255,0.4)' }}>History</span>
          </a>
          <a href="/app" style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Analyze New</a>
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
            <a href="/app" style={{ 
              display: 'inline-block', marginTop: 24, padding: '10px 20px', 
              background: 'white', color: 'black', borderRadius: 12, 
              textDecoration: 'none', fontWeight: 600, fontSize: 14 
            }}>
              Go to Dashboard
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {history.map((item) => (
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
                    {item.data.result.patient_details?.name || "Untitled Analysis"}
                  </p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                    {new Date(item.id).toLocaleDateString(undefined, { dateStyle: 'medium' })} · {item.data.result.medicines?.length || 0} medicines
                  </p>
                </div>
                <ChevronRight size={18} style={{ color: 'rgba(255,255,255,0.2)' }} />
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
