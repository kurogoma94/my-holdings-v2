import React, { useState, useEffect } from 'react';
import Scanner from './components/Scanner';
import RecipeModal from './components/RecipeModal';
import { getRecipeForIngredient } from './utils/recipeEngine';
import './index.css';

const ExpireGuard = () => {
  const [items, setItems] = useState(() => {
    const saved = localStorage.getItem('expire-guard-items');
    return saved ? JSON.parse(saved) : [];
  });

  const [newItem, setNewItem] = useState({ name: '', expiry: '' });
  const [showScanner, setShowScanner] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState(null);

  useEffect(() => {
    localStorage.setItem('expire-guard-items', JSON.stringify(items));
  }, [items]);

  const addItem = (e) => {
    if (e) e.preventDefault();
    if (!newItem.name || !newItem.expiry) return;
    
    const item = {
      id: Date.now(),
      name: newItem.name,
      expiry: newItem.expiry,
      addedAt: new Date().toISOString()
    };
    
    setItems(prev => [...prev, item].sort((a, b) => new Date(a.expiry) - new Date(b.expiry)));
    setNewItem({ name: '', expiry: '' });
  };

  const deleteItem = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const getStatus = (expiryDate) => {
    if (!expiryDate) return 'safe';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    // Force midnight local
    expiry.setHours(0, 0, 0, 0);

    const diff = Math.round((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return 'expired';
    if (diff <= 1) return 'danger';
    if (diff <= 3) return 'warning';
    return 'safe';
  };

  const getDaysLabel = (expiryDate) => {
    if (!expiryDate) return '';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expiry = new Date(expiryDate);
    expiry.setHours(0, 0, 0, 0);

    const diff = Math.round((expiry - today) / (1000 * 60 * 60 * 24));
    
    if (diff < 0) return `賞味期限切れ (${Math.abs(diff)}日経過)`;
    if (diff === 0) return "本日まで";
    return `あと ${diff} 日`;
  };

  const handleScanResult = (text) => {
    // 1. 日付の検出 (様々なフォーマットに対応: YYYY-MM-DD, YYYY/MM/DD, YY.MM.DD, YYYY年MM月DD日)
    const datePatterns = [
      /(20\d{2})[./\-](\d{1,2})[./\-](\d{1,2})/, // 2026-04-08
      /(\d{2})[./\-](\d{1,2})[./\-](\d{1,2})/,   // 26.04.08
      /(20\d{2})年(\d{1,2})月(\d{1,2})日/,       // 2026年4月8日
      /(\d{2})年(\d{1,2})月(\d{1,2})日/,         // 26年4月8日
      /(20\d{2})(\d{2})(\d{2})/,                 // 20260408
    ];

    let detectedExpiry = '';
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        let year = match[1];
        let month = match[2].padStart(2, '0');
        let day = match[3].padStart(2, '0');
        if (year.length === 2) year = `20${year}`;
        detectedExpiry = `${year}-${month}-${day}`;
        break;
      }
    }

    // 2. 食品名の抽出（日付以外の有力な文字列）
    const lines = text.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 1 && !line.match(/\d[./\-年]/));
    
    // 除外キーワード
    const ignoreKeywords = ['賞味', '期限', '保存', '方法', '製造', '年月日', '記号', '内容量', '原材料'];
    const nameCandidate = lines.find(line => 
      !ignoreKeywords.some(kw => line.includes(kw)) &&
      !line.match(/^[0-9\W]+$/) // 数字や記号だけの行を除外
    ) || '';

    if (detectedExpiry || nameCandidate) {
      setNewItem(prev => ({ 
        ...prev, 
        expiry: detectedExpiry || prev.expiry,
        name: nameCandidate || prev.name 
      }));
      setShowScanner(false);
      
      let message = "🤖 AIスキャンの結果:\n";
      if (nameCandidate) message += `・食品名: ${nameCandidate}\n`;
      if (detectedExpiry) message += `・賞味期限: ${detectedExpiry}\n`;
      message += "\n必要に応じて修正してください。";
      alert(message);
    } else {
      alert("情報が検出できませんでした。より明るい場所で、賞味期限の印字を正面から撮影してください。");
      setShowScanner(false);
    }
  };

  const handleSuggestRecipe = (item) => {
    const recipe = getRecipeForIngredient(item.name);
    setActiveRecipe({ recipe, ingredient: item.name });
  };

  return (
    <div className="dashboard">
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700' }}>Expire Guard</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Black Sesame HD | Smart Expiry Monitor</p>
      </header>

      <form onSubmit={addItem} className="card" style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '8px' }}>🚀 登録</h2>
        <input 
          type="text" 
          placeholder="食品名 (例: 牛乳)" 
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          required
        />
        <input 
          type="date" 
          value={newItem.expiry}
          onChange={(e) => setNewItem({ ...newItem, expiry: e.target.value })}
          required
        />
        <button type="submit" className="scan-button" style={{ position: 'static', transform: 'none', width: '100%', marginTop: '12px' }}>
          リストに追加
        </button>
      </form>

      <div className="item-list">
        {items.length === 0 ? (
          <p style={{ textAlign: 'center', opacity: 0.4, marginTop: '40px' }}>アイテムがありません</p>
        ) : (
          items.map((item, index) => {
            const status = getStatus(item.expiry);
            const statusClass = status === 'expired' || status === 'danger' ? 'card-danger' : 
                               status === 'warning' ? 'card-warning' : 'card-safe';
            
            // 最優先（一番期限が近い）アイテムか？
            const isMostUrgent = index === 0;

            return (
              <div key={item.id} className={`card ${statusClass}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{item.name}</h3>
                      {isMostUrgent && <span style={{ fontSize: '10px', background: 'var(--accent-danger)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>TOP PRIORITY</span>}
                    </div>
                    <span className="expiry-tag">{getDaysLabel(item.expiry)}</span>
                    
                    {isMostUrgent && (
                      <button 
                        onClick={() => handleSuggestRecipe(item)}
                        style={{ 
                          marginTop: '12px', background: 'rgba(0, 255, 178, 0.1)', 
                          border: '1px solid var(--accent-safe)', color: 'var(--accent-safe)',
                          padding: '6px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
                          display: 'block', fontWeight: 'bold'
                        }}
                      >
                        💡 戦略的レシピを提案
                      </button>
                    )}
                  </div>
                  <button 
                    onClick={() => deleteItem(item.id)}
                    style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '20px' }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <button className="scan-button" onClick={() => setShowScanner(true)}>
        <span style={{ fontSize: '20px' }}>🤖</span> AI SCAN
      </button>

      {showScanner && (
        <Scanner onScan={handleScanResult} onClose={() => setShowScanner(false)} />
      )}

      {activeRecipe && (
        <RecipeModal 
          recipe={activeRecipe.recipe} 
          activeIngredient={activeRecipe.ingredient}
          onClose={() => setActiveRecipe(null)} 
        />
      )}
    </div>
  );
};

export default ExpireGuard;
