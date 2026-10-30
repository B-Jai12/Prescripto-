"use client";
import { useState } from "react";
import {
  User, Hospital, FileText, ShoppingCart, MapPin, ShieldAlert, Salad,
  ChevronDown, ChevronUp, ExternalLink, AlertTriangle, CheckCircle2, Clock,
  Sparkles
} from "lucide-react";

const TABS = [
  { id: "patient", label: "Analysis", icon: Sparkles },
  { id: "demographics", label: "Patient Details", icon: User },
  { id: "safety", label: "Safety Checks", icon: ShieldAlert },
  { id: "diet", label: "Diet & Lifestyle", icon: Salad },
  { id: "buy", label: "Buy Medicines", icon: ShoppingCart },
  { id: "map", label: "Clinic Map", icon: MapPin },
  { id: "rawocr", label: "Raw OCR", icon: FileText },
];

const LANG_OPTIONS = ["English", "Telugu", "Hindi"];
const LANG_KEY = { English: "instructions_en", Telugu: "instructions_te", Hindi: "instructions_hi" };
const LANG_FLAG = { English: "🇬🇧", Telugu: "🇮🇳", Hindi: "🇮🇳" };

function MedicineCard({ med }) {
  const [lang, setLang] = useState("English");
  const [expanded, setExpanded] = useState(true);

  return (
    <div style={{
      borderRadius: 20,
      border: '1px solid rgba(255,255,255,0.08)',
      background: 'rgba(255,255,255,0.03)',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      marginBottom: 16
    }}>
      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
          textAlign: 'left'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'rgba(255,159,252,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18
          }}>💊</div>
          <div>
            <p style={{ fontWeight: 700, color: '#ffffff', margin: 0, fontSize: 15 }}>{med.name}</p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{med.dosage} · {med.duration}</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={18} color="rgba(255,255,255,0.3)" /> : <ChevronDown size={18} color="rgba(255,255,255,0.3)" />}
      </button>

      {expanded && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>
          {/* Details grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            {[
              { label: "Frequency", value: med.frequency },
              { label: "Timing", value: med.timing },
              { label: "Duration", value: med.duration },
              { label: "Dosage", value: med.dosage },
            ].map((d) => (
              <div key={d.label} style={{ borderRadius: 14, background: 'rgba(255,255,255,0.04)', padding: '12px' }}>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d.label}</p>
                <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 600, margin: 0 }}>{d.value || "N/A"}</p>
              </div>
            ))}
          </div>

          {/* Language toggle */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Instructions Language</p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {LANG_OPTIONS.map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  style={{
                    padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s', border: '1px solid',
                    background: lang === l ? 'rgba(255,159,252,0.15)' : 'rgba(255,255,255,0.05)',
                    color: lang === l ? '#FF9FFC' : 'rgba(255,255,255,0.4)',
                    borderColor: lang === l ? 'rgba(255,159,252,0.3)' : 'rgba(255,255,255,0.1)',
                  }}
                >
                  {LANG_FLAG[l]} {l}
                </button>
              ))}
            </div>
            <div style={{
              borderRadius: 16, background: 'rgba(255,159,252,0.05)',
              border: '1px solid rgba(255,159,252,0.1)', padding: '16px'
            }}>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: 0 }}>
                {med[LANG_KEY[lang]] || "No instructions available."}
              </p>
            </div>
          </div>

          {/* Side effects */}
          {med.side_effects?.length > 0 && (
            <div>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚠️ Potential Side Effects</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {med.side_effects.map((effect, i) => (
                  <div key={i} style={{
                    fontSize: 12, color: '#fca5a5', padding: '4px 10px',
                    borderRadius: 8, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)'
                  }}>
                    {effect}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DemographicsTab({ result }) {
  const p = result.patient_details || {};
  const h = result.hospital_details || {};
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#FF9FFC', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <User size={16} /> Patient Information
        </h3>
        {[["Full Name", p.name], ["Age", p.age], ["Gender", p.gender]].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>{k}</span>
            <span style={{ fontSize: 14, color: '#ffffff', fontWeight: 600 }}>{v || "N/A"}</span>
          </div>
        ))}
      </div>
      <div style={{ borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', padding: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#c084fc', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Hospital size={16} /> Hospital Details
        </h3>
        {[["Hospital", h.name], ["Doctor", h.doctor_name], ["Address", h.address]].map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', flexShrink: 0 }}>{k}</span>
            <span style={{ fontSize: 14, color: '#ffffff', fontWeight: 600, textAlign: 'right', marginLeft: 20 }}>{v || "N/A"}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BuyTab({ medicines }) {
  const partners = [
    { name: "Tata 1mg", color: "rgba(239,68,68,0.1)", border: "rgba(239,68,68,0.2)", text: "#f87171", url: (q) => `https://www.1mg.com/search/all?name=${q}` },
    { name: "Apollo", color: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.2)", text: "#60a5fa", url: (q) => `https://www.apollopharmacy.in/search-medicines/${q}` },
    { name: "PharmEasy", color: "rgba(16,185,129,0.1)", border: "rgba(16,185,129,0.2)", text: "#34d399", url: (q) => `https://pharmeasy.in/search/all?searchtext=${encodeURIComponent(q)}&utm_source=google&utm_medium=organic` },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Select a medicine to purchase from our trusted pharmacy partners.</p>
      {medicines.filter(m => m.name && m.name !== "Unknown").map((med, i) => (
        <div key={i} style={{ borderRadius: 24, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>💊</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', margin: 0 }}>{med.name}</p>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: 0 }}>{med.dosage}</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            {partners.map((p) => {
              const searchQ = encodeURIComponent(med.name);
              return (
                <a
                  key={p.name}
                  href={p.url(searchQ)}
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    padding: '12px 8px', borderRadius: 12, background: p.color, border: `1px solid ${p.border}`,
                    textDecoration: 'none', transition: 'transform 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <ExternalLink size={14} color={p.text} />
                  <span style={{ fontSize: 10, fontWeight: 700, color: p.text }}>{p.name}</span>
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function MapTab({ hospital_details }) {
  const h = hospital_details || {};
  const query = encodeURIComponent(`${h.name || ""} ${h.address || ""}`.trim());
  if (!h.name && !h.address) {
    return <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)' }}>No hospital details found for the map.</div>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '12px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginBottom: 4, textTransform: 'uppercase' }}>Searching for</p>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: 600, margin: 0 }}>{h.name} · {h.address}</p>
      </div>
      <div style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', height: 420 }}>
        <iframe
          src={`https://www.google.com/maps?q=${query}&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  );
}

function SafetyTab({ result }) {
  const interactions = result.drug_interactions;
  const medicines = result.medicines || [];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {interactions ? (
        <div style={{ borderRadius: 24, border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', padding: 24, display: 'flex', gap: 16 }}>
          <AlertTriangle size={24} color="#f87171" style={{ flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#f87171', marginBottom: 6 }}>Drug Interaction Warning</p>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 }}>{interactions}</p>
          </div>
        </div>
      ) : (
        <div style={{ borderRadius: 24, border: '1px solid rgba(52,211,153,0.2)', background: 'rgba(52,211,153,0.05)', padding: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
          <CheckCircle2 size={20} color="#34d399" />
          <p style={{ fontSize: 14, color: '#34d399', fontWeight: 600, margin: 0 }}>No critical drug-to-drug interactions found.</p>
        </div>
      )}
      <div>
        <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 16 }}>Medicine Safety Profile</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {medicines.map((med, i) => (
            <div key={i} style={{ borderRadius: 20, border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', padding: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 10 }}>💊 {med.name}</p>
              {med.side_effects?.length > 0 ? (
                med.side_effects.map((effect, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                    <span style={{ width: 4, height: 4, borderRadius: '50%', background: '#f87171' }} />
                    {effect}
                  </div>
                ))
              ) : (
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', margin: 0 }}>No major side effects extracted.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DietTab({ tips, notes, followUp }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {followUp && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '16px 20px', borderRadius: 20, background: 'rgba(192,132,252,0.1)', border: '1px solid rgba(192,132,252,0.2)' }}>
          <Clock size={18} color="#c084fc" />
          <p style={{ fontSize: 14, color: '#e9d5ff', margin: 0 }}>Next Checkup: <span style={{ fontWeight: 700 }}>{followUp}</span></p>
        </div>
      )}
      {notes && (
        <div style={{ padding: '20px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 8 }}>Doctor&apos;s Observations</p>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, margin: 0 }}>{notes}</p>
        </div>
      )}
      <div>
        <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', marginBottom: 16 }}>Health & Lifestyle Guide</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tips.length > 0 ? tips.map((tip, i) => (
            <div key={i} style={{ padding: '16px 20px', borderRadius: 20, background: 'rgba(255,159,252,0.05)', border: '1px solid rgba(255,159,252,0.1)' }}>
              <p style={{ fontSize: 14, color: '#ffffff', lineHeight: 1.6, margin: 0 }}>{tip}</p>
            </div>
          )) : (
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '40px 0' }}>No specific dietary guidelines found.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PatientSummaryCard({ data }) {
  const [activeTab, setActiveTab] = useState("patient");
  const { result = {}, raw_text = "" } = data || {};
  const medicines = result?.medicines || [];

  const renderTab = () => {
    switch (activeTab) {
      case "patient": return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {medicines.length === 0 ? (
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '40px 0' }}>No medicines detected.</p>
          ) : (
            medicines.map((med, i) => <MedicineCard key={i} med={med} />)
          )}
        </div>
      );
      case "demographics": return <DemographicsTab result={result} />;
      case "buy": return <BuyTab medicines={medicines} />;
      case "map": return <MapTab hospital_details={result.hospital_details} />;
      case "safety": return <SafetyTab result={result} />;
      case "diet": return <DietTab tips={result.diet_and_lifestyle || []} notes={result.doctor_notes} followUp={result.follow_up} />;
      case "rawocr": return (
        <div style={{ padding: 24, borderRadius: 24, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <pre style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', whiteSpace: 'pre-wrap', fontFamily: 'monospace', margin: 0, lineHeight: 1.6 }}>{raw_text || "No data."}</pre>
        </div>
      );
      default: return null;
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.6s ease-out' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', margin: 0, letterSpacing: '-0.02em' }}>Prescription Insights</h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            {medicines.length} medicine{medicines.length !== 1 ? "s" : ""} identified
          </p>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px',
          borderRadius: 999, background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)'
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e' }} />
          <span style={{ fontSize: 12, color: '#4ade80', fontWeight: 700 }}>AI Complete</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32,
        padding: 4, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)'
      }}>
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
              borderRadius: 12, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.2s', border: 'none',
              background: activeTab === id ? 'rgba(255,255,255,0.1)' : 'transparent',
              color: activeTab === id ? '#ffffff' : 'rgba(255,255,255,0.4)',
            }}
          >
            <Icon size={16} color={activeTab === id ? '#FF9FFC' : 'currentColor'} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div key={activeTab} style={{ animation: 'fadeIn 0.4s ease-out' }}>
        {renderTab()}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
