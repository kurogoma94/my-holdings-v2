import React from 'react';

const RecipeModal = ({ recipe, activeIngredient, onClose }) => {
  if (!recipe) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
      zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card" style={{
        maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
        background: 'var(--bg-accent)', border: '1px solid var(--accent-safe)',
        position: 'relative', padding: '30px', animation: 'modal-slide-up 0.5s ease'
      }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '15px', right: '15px', background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}
        >
          ✕
        </button>

        <header style={{ marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
          <span style={{ color: 'var(--accent-warning)', fontWeight: 'bold', fontSize: '12px' }}>🚨 最優先消費推奨コンポーネント</span>
          <h2 style={{ fontSize: '24px', marginTop: '5px' }}>{recipe.title}</h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>{recipe.description}</p>
        </header>

        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>📦 必要マテリアル</h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {recipe.ingredients.map((ing, i) => (
              <li key={i} style={{ 
                padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', 
                marginBottom: '6px', fontSize: '14px', display: 'flex', justifyContent: 'space-between' 
              }}>
                <span>{ing}</span>
                {ing.includes(activeIngredient) && <span style={{ color: 'var(--accent-danger)', fontWeight: '700' }}>[在庫有]</span>}
              </li>
            ))}
          </ul>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>⚡ 調理プロセス (10分CEOモデル)</h3>
          <ol style={{ paddingLeft: '20px' }}>
            {recipe.steps.map((step, i) => (
              <li key={i} style={{ marginBottom: '12px', fontSize: '14px', lineHeight: '1.6' }}>{step}</li>
            ))}
          </ol>
        </div>

        <div style={{ 
          background: 'rgba(0,255,178,0.05)', border: '1px solid var(--accent-safe)', 
          borderRadius: '12px', padding: '15px'
        }}>
          <h4 style={{ fontSize: '14px', color: 'var(--accent-safe)', marginBottom: '5px' }}>👑 CEO戦略アドバイス</h4>
          <p style={{ fontSize: '13px', opacity: 0.8, lineHeight: '1.5' }}>{recipe.strategyFocus}</p>
        </div>

        <button 
          onClick={onClose}
          className="scan-button" 
          style={{ position: 'static', transform: 'none', width: '100%', marginTop: '30px' }}
        >
          ミッション開始（閉じる）
        </button>
      </div>

      <style>{`
        @keyframes modal-slide-up {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default RecipeModal;
