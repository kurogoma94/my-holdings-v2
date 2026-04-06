'use client';

import React, { useState } from 'react';

type AgentResult = {
  name: string;
  role: string;
  content: string;
  color: string;
  avatar: string;
};

export default function Home() {
  const [formData, setFormData] = useState({
    birthday: '',
    mbti: 'INTJ',
    gender: 'male',
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<AgentResult[] | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const mbtiTypes = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ];

  const analysisSteps = [
    "天体の運行を確認中...",
    "算命学の宿命を算出中...",
    "MBTIの深層心理をスキャン中...",
    "運命のバイオリズムを統合中...",
    "ODF戦略部隊へ指示を送信中...",
  ];

  const handleAnalyze = async () => {
    if (!formData.birthday) {
      alert("生年月日を入力してください");
      return;
    }

    setIsAnalyzing(true);
    setResults(null);
    setCurrentStep(0);

    const interval = setInterval(() => {
      setCurrentStep(prev => (prev < analysisSteps.length - 1 ? prev + 1 : prev));
    }, 1500);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      await new Promise(r => setTimeout(r, 1000));
      clearInterval(interval);
      setResults(data.results);
    } catch (error) {
      console.error(error);
      alert("通信エラーが発生しました。");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main className="container">
      <header className="hero">
        <div className="badge">ODF AI ORGANIZATION</div>
        <h1 className="gradient-text title">ODF Fortune Portal</h1>
        <p className="subtitle">神秘を論理へ、言葉を資産へ。</p>
      </header>

      {!results && !isAnalyzing && (
        <section className="form-card glass">
          <div className="input-group">
            <label>生年月日</label>
            <input 
              type="date" 
              value={formData.birthday} 
              onChange={(e) => setFormData({...formData, birthday: e.target.value})}
            />
          </div>

          <div className="input-group">
            <label>MBTI タイプ</label>
            <select 
              value={formData.mbti} 
              onChange={(e) => setFormData({...formData, mbti: e.target.value})}
            >
              {mbtiTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>性別</label>
            <div className="radio-group">
              <button 
                className={formData.gender === 'male' ? 'active' : ''}
                onClick={() => setFormData({...formData, gender: 'male'})}
              >男性</button>
              <button 
                className={formData.gender === 'female' ? 'active' : ''}
                onClick={() => setFormData({...formData, gender: 'female'})}
              >女性</button>
            </div>
          </div>

          <button className="analyze-btn" onClick={handleAnalyze}>
            運命を解読する
          </button>
        </section>
      )}

      {isAnalyzing && (
        <section className="analysis-loading">
          <div className="loader glass">
            <div className="pulse-eye">👁️</div>
            <p className="loading-text">{analysisSteps[currentStep]}</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${(currentStep + 1) / analysisSteps.length * 100}%` }}></div>
            </div>
          </div>
        </section>
      )}

      {results && (
        <section className="results-container">
          <div className="results-header">
            <h2 className="results-title">鑑定結果報告書</h2>
            <div className="user-profile-badge glass">
              {formData.birthday} / {formData.mbti} / {formData.gender === 'male' ? '男性' : '女性'}
            </div>
          </div>
          
          <div className="results-grid">
            {results.map((res, i) => (
              <div key={res.name} className="result-card glass" style={{ borderColor: res.color }}>
                <div className="card-header">
                  <span className="avatar" style={{ boxShadow: `0 0 15px ${res.color}44` }}>{res.avatar}</span>
                  <div className="name-box">
                    <span className="agent-name" style={{ color: res.color }}>{res.name}</span>
                    <span className="agent-role">{res.role}</span>
                  </div>
                </div>
                <p className="card-content">{res.content}</p>
              </div>
            ))}
          </div>
          
          <div className="actions">
            <button className="reset-btn" onClick={() => setResults(null)}>
              新しい可能性を探る
            </button>
          </div>
        </section>
      )}

      <footer className="footer">
        <p>© 2026 Black Sesame HD / KGM Corp. All Rights Reserved.</p>
        <p className="logic-ver">ODF Logic Engine v2.0.4 - Powered by Gemini</p>
      </footer>

      <style jsx>{`
        .container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }
        .hero {
          text-align: center;
          margin-bottom: 4rem;
        }
        .badge {
          display: inline-block;
          padding: 0.4rem 1rem;
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.3);
          border-radius: 20px;
          color: var(--accent-cyan);
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.2rem;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
        }
        .title {
          font-size: 4.5rem;
          margin-bottom: 0.5rem;
          letter-spacing: -0.02em;
          font-weight: 900;
        }
        .subtitle {
          color: var(--text-secondary);
          font-size: 1.3rem;
          letter-spacing: 0.3em;
          font-weight: 300;
        }
        .form-card {
          width: 100%;
          max-width: 600px;
          padding: 4rem;
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          box-shadow: 0 20px 80px rgba(0, 0, 0, 0.5);
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }
        label {
          font-size: 0.75rem;
          color: var(--accent-cyan);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-weight: 700;
          opacity: 0.8;
        }
        input, select {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          padding: 1.4rem;
          color: white;
          border-radius: 12px;
          font-size: 1.2rem;
          outline: none;
          transition: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        input:focus, select:focus {
          border-color: var(--accent-cyan);
          box-shadow: 0 0 20px rgba(0, 212, 255, 0.2);
          background: rgba(255, 255, 255, 0.06);
          transform: translateY(-2px);
        }
        select option {
          background: #0a0a0f;
        }
        .radio-group {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .radio-group button {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--glass-border);
          padding: 1.2rem;
          color: var(--text-secondary);
          border-radius: 12px;
          cursor: pointer;
          transition: 0.4s;
          font-weight: 700;
          letter-spacing: 0.1em;
        }
        .radio-group button.active {
          background: rgba(0, 212, 255, 0.15);
          border-color: var(--accent-cyan);
          color: white;
          box-shadow: 0 0 25px rgba(0, 212, 255, 0.3);
          transform: scale(1.02);
        }
        .analyze-btn {
          margin-top: 1.5rem;
          padding: 1.6rem;
          background: linear-gradient(135deg, var(--accent-cyan), var(--accent-magenta));
          border: none;
          border-radius: 12px;
          color: white;
          font-weight: 900;
          font-size: 1.4rem;
          cursor: pointer;
          transition: 0.5s cubic-bezier(0.19, 1, 0.22, 1);
          box-shadow: 0 10px 40px rgba(0, 212, 255, 0.3);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          position: relative;
          overflow: hidden;
        }
        .analyze-btn::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transform: rotate(45deg) translate(-100%, -100%);
          transition: 0.5s;
        }
        .analyze-btn:hover::after {
          transform: rotate(45deg) translate(100%, 100%);
        }
        .analyze-btn:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 50px rgba(0, 212, 255, 0.5);
          filter: brightness(1.1);
        }

        /* Loading View */
        .analysis-loading {
          width: 100%;
          max-width: 500px;
        }
        .loader {
          padding: 5rem 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2.5rem;
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.6);
        }
        .pulse-eye {
          font-size: 5rem;
          animation: pulse 2s infinite ease-in-out;
          filter: drop-shadow(0 0 20px var(--accent-cyan));
        }
        @keyframes pulse {
          0% { transform: scale(1) rotate(0deg); opacity: 0.5; }
          50% { transform: scale(1.1) rotate(10deg); opacity: 1; filter: drop-shadow(0 0 30px var(--accent-cyan)); }
          100% { transform: scale(1) rotate(0deg); opacity: 0.5; }
        }
        .loading-text {
          font-size: 1.2rem;
          color: white;
          min-height: 1.8rem;
          font-weight: 600;
          letter-spacing: 0.05em;
        }
        .progress-bar {
          width: 100%;
          height: 8px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          overflow: hidden;
        }
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-cyan), var(--accent-magenta), var(--accent-gold));
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
          transition: 0.5s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 20px var(--accent-cyan);
        }
        @keyframes shimmer {
          0% { background-position: 100% 0; }
          100% { background-position: -100% 0; }
        }

        /* Results View */
        .results-container {
          width: 100%;
          animation: slideUp 1.2s cubic-bezier(0.19, 1, 0.22, 1);
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(100px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .results-header {
          text-align: center;
          margin-bottom: 5rem;
        }
        .results-title {
          font-size: 3.5rem;
          letter-spacing: 0.4em;
          color: var(--accent-gold);
          font-weight: 900;
          text-shadow: 0 0 30px rgba(212, 175, 55, 0.4);
          margin-bottom: 1.5rem;
          text-transform: uppercase;
        }
        .user-profile-badge {
          display: inline-block;
          padding: 0.8rem 2rem;
          border-radius: 40px;
          font-size: 0.9rem;
          color: var(--text-secondary);
          letter-spacing: 0.1em;
          font-weight: 600;
          border: 1px solid var(--glass-border);
        }
        .results-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
          gap: 3rem;
          margin-bottom: 6rem;
        }
        .result-card {
          padding: 3rem;
          border-width: 1px;
          transition: 0.5s cubic-bezier(0.19, 1, 0.22, 1);
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .result-card:hover {
          transform: translateY(-15px) scale(1.03);
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.6);
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .avatar {
          width: 70px;
          height: 70px;
          background: #000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          border: 1px solid rgba(255, 255, 255, 0.15);
        }
        .name-box {
          display: flex;
          flex-direction: column;
        }
        .agent-name {
          font-weight: 950;
          font-size: 1.6rem;
          letter-spacing: 0.2em;
        }
        .agent-role {
          font-size: 0.85rem;
          color: var(--accent-cyan);
          text-transform: uppercase;
          letter-spacing: 0.2em;
          opacity: 0.7;
          font-weight: 800;
        }
        .card-content {
          line-height: 2;
          color: var(--text-primary);
          font-size: 1.15rem;
          text-align: justify;
          opacity: 0.9;
        }
        .actions {
          display: flex;
          gap: 2rem;
          justify-content: center;
        }
        .reset-btn {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--glass-border);
          color: white;
          padding: 1.4rem 4rem;
          border-radius: 50px;
          cursor: pointer;
          transition: 0.4s;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          font-size: 1rem;
        }
        .reset-btn:hover {
          background: white;
          color: black;
          box-shadow: 0 0 30px rgba(255, 255, 255, 0.5);
          transform: translateY(-3px);
        }

        /* Footer */
        .footer {
          margin-top: 8rem;
          text-align: center;
          padding: 4rem 0;
          border-top: 1px solid var(--glass-border);
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .footer p {
          font-size: 0.8rem;
          color: var(--text-muted);
          letter-spacing: 0.1em;
        }
        .logic-ver {
          color: var(--accent-cyan) !important;
          opacity: 0.5;
        }

        @media (max-width: 800px) {
          .title { font-size: 3rem; }
          .hero { margin-bottom: 2rem; }
          .form-card { padding: 2rem; }
          .results-title { font-size: 2rem; letter-spacing: 0.2em; }
          .results-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </main>
  );
}
