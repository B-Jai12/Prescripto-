"use client";
import { useRef, useState } from "react";
import { Upload, ImageIcon, X, FileText } from "lucide-react";

export default function UploadCard({ onFileSelect, selectedFile, onClear, isAnalyzing, scanner }) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  const handleFile = (file) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];
    if (!allowed.includes(file.type)) {
      alert("Please upload a JPG, PNG, WEBP, or HEIC image.");
      return;
    }
    onFileSelect(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleClear = () => {
    setPreview(null);
    onClear();
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); if (!preview) setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={!preview ? handleDrop : undefined}
        onClick={() => { if (!preview) inputRef.current?.click(); }}
        style={{
          height: "360px",
          border: isDragging ? '2px solid #FF9FFC' : '1px solid rgba(255,255,255,0.12)',
          backgroundColor: isDragging ? 'rgba(255,159,252,0.08)' : 'rgba(255,255,255,0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          textAlign: 'center',
          cursor: preview ? 'default' : 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: isDragging ? '0 0 40px rgba(168, 85, 247, 0.2)' : '0 20px 40px rgba(0,0,0,0.3)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={e => {
          if (!isDragging && !preview) {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }
        }}
        onMouseLeave={e => {
          if (!isDragging && !preview) {
            e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {!preview ? (
          <>
            <div
              style={{
                width: '80px', height: '80px', borderRadius: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: isDragging ? 'rgba(255,159,252,0.15)' : 'rgba(255,255,255,0.05)'
              }}
            >
              <Upload
                size={36}
                style={{ color: isDragging ? '#FF9FFC' : 'rgba(255,255,255,0.2)' }}
              />
            </div>
            <div>
              <p style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', marginBottom: '4px' }}>
                Drop your prescription here
              </p>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
                or <span style={{ color: '#FF9FFC', textDecoration: 'underline' }}>browse files</span> · JPG, PNG, WEBP, HEIC supported
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
              {["Handwritten", "Printed", "Hospital Letterhead"].map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '11px', fontWeight: 700, padding: '4px 12px', borderRadius: '999px',
                    backgroundColor: 'rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.3)',
                    border: '1px solid rgba(255,255,255,0.08)'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </>
        ) : (
          <>
            <img
              src={preview}
              alt="Uploaded prescription"
              style={{ 
                width: '100%', height: '100%', 
                objectFit: 'contain', 
                opacity: isAnalyzing ? 0.8 : 1, 
                transition: 'opacity 0.3s',
                padding: '16px' 
              }}
            />
            <div style={{ position: 'absolute', inset: 0, background: isAnalyzing ? 'rgba(0,0,0,0.1)' : 'transparent', pointerEvents: 'none' }} />
            {isAnalyzing && scanner}
            {!isAnalyzing && (
              <button
                onClick={handleClear}
                style={{
                  position: 'absolute', top: '16px', right: '16px', width: '36px', height: '36px',
                  borderRadius: '50%', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', color: '#fff', cursor: 'pointer', zIndex: 20
                }}
              >
                <X size={16} />
              </button>
            )}
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          className="hidden"
          onChange={(e) => handleFile(e.target.files[0])}
        />
      </div>
    </div>
  );
}
