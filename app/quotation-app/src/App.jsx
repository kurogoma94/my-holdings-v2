import React, { useState, useEffect } from 'react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Plus, Trash2, Download, Calculator, FileText, User } from 'lucide-react';

const INITIAL_ITEM = {
  manufacturer: '',
  spec: '',
  quantityPerCase: '',
  priceBara: '',
  priceCase: '',
  orderUnit: '',
  note: '',
  cost: '',
  sellingPrice: ''
};

function App() {
  const [header, setHeader] = useState({
    customer: '',
    date: new Date().toISOString().split('T')[0],
    no: ''
  });
  const [items, setItems] = useState([ { ...INITIAL_ITEM } ]);

  // オートセーブ
  useEffect(() => {
    const saved = localStorage.getItem('quotation_draft');
    if (saved) {
      const { header: h, items: i } = JSON.parse(saved);
      setHeader(h);
      setItems(i);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('quotation_draft', JSON.stringify({ header, items }));
  }, [header, items]);

  const addItem = () => setItems([...items, { ...INITIAL_ITEM }]);
  const removeItem = (index) => {
    if (items.length > 1) setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const exportExcel = async () => {
    try {
      const response = await fetch('/template.xlsx');
      const arrayBuffer = await response.arrayBuffer();
      
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const worksheet = workbook.getWorksheet(1);

      // ヘッダー書き込み
      worksheet.getCell('B5').value = `${header.customer}　御中`;
      worksheet.getCell('J2').value = header.no;
      worksheet.getCell('J3').value = header.date;

      // 明細書き込み (17行目から)
      items.forEach((item, index) => {
        const row = 17 + index;
        worksheet.getCell(`B${row}`).value = item.manufacturer;
        worksheet.getCell(`C${row}`).value = item.spec;
        worksheet.getCell(`D${row}`).value = item.quantityPerCase;
        worksheet.getCell(`E${row}`).value = Number(item.priceBara) || 0;
        worksheet.getCell(`F${row}`).value = Number(item.priceCase) || 0;
        worksheet.getCell(`G${row}`).value = item.orderUnit;
        worksheet.getCell(`H${row}`).value = item.note;
        worksheet.getCell(`I${row}`).value = Number(item.cost) || 0; // 原価 (印刷範囲外)
        worksheet.getCell(`J${row}`).value = Number(item.sellingPrice) || 0; // 納価 (印刷範囲外)
      });

      const buffer = await workbook.xlsx.writeBuffer();
      saveAs(new Blob([buffer]), `${header.date}_御見積書_${header.customer}.xlsx`);
    } catch (error) {
      console.error('Excel Export Error:', error);
      alert('Excelの出力に失敗しました。テンプレートファイルを確認してください。');
    }
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1 className="title">見積もり作成</h1>
          <button className="btn btn-primary" onClick={exportExcel}>
            <Download size={18} /> Excel出力
          </button>
        </div>

        <div className="section">
          <h2 className="section-title"><User size={20} /> 基本情報</h2>
          <div className="grid">
            <div className="form-group">
              <label className="label">宛先（御中）</label>
              <input 
                type="text" 
                placeholder="株式会社 XXX" 
                value={header.customer}
                onChange={(e) => setHeader({...header, customer: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="label">見積日</label>
              <input 
                type="date" 
                value={header.date}
                onChange={(e) => setHeader({...header, date: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label className="label">見積番号</label>
              <input 
                type="text" 
                placeholder="20240408-01" 
                value={header.no}
                onChange={(e) => setHeader({...header, no: e.target.value})}
              />
            </div>
          </div>
        </div>

        <div className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 className="section-title" style={{ margin: 0 }}><FileText size={20} /> 明細項目</h2>
            <button className="btn btn-secondary" onClick={addItem}>
              <Plus size={18} /> 行を追加
            </button>
          </div>
          
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>メーカー・商品名</th>
                  <th>規格</th>
                  <th>入数</th>
                  <th>納価(バラ)</th>
                  <th>納価(ケース)</th>
                  <th>発注単位</th>
                  <th>備考</th>
                  <th>原価(I)</th>
                  <th>納価(J)</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td><input type="text" value={item.manufacturer} onChange={(e) => updateItem(index, 'manufacturer', e.target.value)} style={{ width: '100%' }} /></td>
                    <td><input type="text" value={item.spec} onChange={(e) => updateItem(index, 'spec', e.target.value)} style={{ width: '100%' }} /></td>
                    <td><input type="text" value={item.quantityPerCase} onChange={(e) => updateItem(index, 'quantityPerCase', e.target.value)} style={{ width: '100%' }} /></td>
                    <td><input type="number" value={item.priceBara} onChange={(e) => updateItem(index, 'priceBara', e.target.value)} style={{ width: '100%' }} /></td>
                    <td><input type="number" value={item.priceCase} onChange={(e) => updateItem(index, 'priceCase', e.target.value)} style={{ width: '100%' }} /></td>
                    <td><input type="text" value={item.orderUnit} onChange={(e) => updateItem(index, 'orderUnit', e.target.value)} style={{ width: '100%' }} /></td>
                    <td><input type="text" value={item.note} onChange={(e) => updateItem(index, 'note', e.target.value)} style={{ width: '100%' }} /></td>
                    <td><input type="number" value={item.cost} onChange={(e) => updateItem(index, 'cost', e.target.value)} style={{ width: '100%', background: '#f8fafc' }} /></td>
                    <td><input type="number" value={item.sellingPrice} onChange={(e) => updateItem(index, 'sellingPrice', e.target.value)} style={{ width: '100%', background: '#f8fafc' }} /></td>
                    <td>
                      <button className="btn btn-danger" onClick={() => removeItem(index)} style={{ padding: '0.25rem' }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
