import React, { useRef, useEffect, useState } from 'react';
import Tesseract from 'tesseract.js';

const Scanner = ({ onScan, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access error:", err);
        alert("カメラの起動に失敗しました。パーミッションを確認してください。");
      }
    };
    startCamera();

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || isScanning) return;

    setIsScanning(true);
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const image = canvas.toDataURL('image/png');

    try {
      const { data: { text } } = await Tesseract.recognize(image, 'jpn+eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setProgress(Math.floor(m.progress * 100));
          }
        }
      });

      console.log("OCR Result:", text);
      onScan(text);
      setIsScanning(false);
    } catch (err) {
      console.error("OCR Error:", err);
      setIsScanning(false);
      alert("読み取りに失敗しました。");
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'black', zIndex: 1000, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: '500px', position: 'relative', overflow: 'hidden', borderRadius: '24px' }}>
        <video 
          ref={videoRef} 
          autoPlay 
          playsInline 
          style={{ width: '100%', display: 'block', transform: 'scaleX(1)' }} 
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {/* Scanning Line Animation */}
        {!isScanning && (
          <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '2px',
            background: 'var(--accent-safe)', boxShadow: '0 0 15px var(--accent-safe)',
            animation: 'scan-line 3s infinite linear'
          }} />
        )}
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center', width: '100%', padding: '0 20px' }}>
        {isScanning ? (
          <div className="card" style={{ padding: '20px', background: 'rgba(255,255,255,0.1)' }}>
            <p style={{ marginBottom: '10px', fontSize: '18px', fontWeight: 'bold' }}>AI 解析中... {progress}%</p>
            <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'var(--accent-safe)', transition: 'width 0.3s ease' }} />
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
            <button onClick={onClose} className="card" style={{ padding: '16px 32px', cursor: 'pointer', background: 'rgba(255,255,255,0.1)' }}>
              キャンセル
            </button>
            <button onClick={handleCapture} className="scan-button" style={{ position: 'static', transform: 'none' }}>
              📸 スキャン実行
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Scanner;
