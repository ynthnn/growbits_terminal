import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import './SummaryWidget.css';

const getRSIScore = (val) => {
  if (val < 30) return { score: 2, label: 'Oversold' };
  if (val <= 40) return { score: 1, label: 'Menuju Oversold' };
  if (val < 60) return { score: 0, label: 'Neutral' };
  if (val <= 70) return { score: -1, label: 'Menuju Overbought' };
  return { score: -2, label: 'Overbought' };
};

const getMVRVScore = (val) => {
  if (val < 0) return { score: 2, label: 'Sangat Undervalued' };
  if (val <= 1) return { score: 1, label: 'Undervalued' };
  if (val < 3) return { score: 0, label: 'Fair Value' };
  if (val <= 6) return { score: -1, label: 'Overvalued' };
  return { score: -2, label: 'Sangat Overvalued' };
};

const getSOPRScore = (val) => {
  if (val < 0.9) return { score: 2, label: 'Panic Sell' };
  if (val <= 1.0) return { score: 1, label: 'Undervalued' };
  if (val <= 1.05) return { score: 0, label: 'Neutral' };
  if (val <= 1.2) return { score: -1, label: 'Profit Taking' };
  return { score: -2, label: 'Extreme Profit' };
};

const getFnGScore = (val) => {
  if (val <= 25) return { score: 2, label: 'Extreme Fear' };
  if (val <= 45) return { score: 1, label: 'Fear' };
  if (val < 55) return { score: 0, label: 'Neutral' };
  if (val <= 75) return { score: -1, label: 'Greed' };
  return { score: -2, label: 'Extreme Greed' };
};

const SummaryWidget = () => {
  const [rsi, setRsi] = useState(50);
  const [mvrv, setMvrv] = useState(0.5);
  const [sopr, setSopr] = useState(0.95);
  const [fng, setFng] = useState(50);
  const [dateStr, setDateStr] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempMvrv, setTempMvrv] = useState(0.5);
  const [tempSopr, setTempSopr] = useState(0.95);

  useEffect(() => {
    // Format date like "01 May 2026"
    const d = new Date();
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    setDateStr(d.toLocaleDateString('en-GB', options));

    const loadMvrvSopr = () => {
      const savedMvrv = localStorage.getItem('gb_mvrv');
      const savedSopr = localStorage.getItem('gb_sopr');
      if (savedMvrv) { setMvrv(parseFloat(savedMvrv)); setTempMvrv(parseFloat(savedMvrv)); }
      if (savedSopr) { setSopr(parseFloat(savedSopr)); setTempSopr(parseFloat(savedSopr)); }
    };
    loadMvrvSopr();

    const fetchAPI = async () => {
      try {
        // Fetch RSI via Binance 14D standard calculation using daily klinedata
        const bRes = await fetch('https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=1d&limit=15');
        const bData = await bRes.json();
        let gains = 0; let losses = 0;
        for (let i = 1; i < bData.length; i++) {
          const close = parseFloat(bData[i][4]);
          const prevClose = parseFloat(bData[i-1][4]);
          const change = close - prevClose;
          if (change > 0) gains += change;
          else losses -= change;
        }
        const avgGain = gains / 14;
        const avgLoss = losses / 14;
        const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
        const calculatedRsi = 100 - (100 / (1 + rs));
        setRsi(Math.round(calculatedRsi));

        // Fetch FnG
        const fRes = await fetch('https://api.alternative.me/fng/');
        const fData = await fRes.json();
        setFng(parseInt(fData.data[0].value));
      } catch (err) {
        console.error('Failed to fetch metrics', err);
      }
    };
    fetchAPI();
  }, []);

  const handleSaveManual = () => {
    setMvrv(parseFloat(tempMvrv));
    setSopr(parseFloat(tempSopr));
    localStorage.setItem('gb_mvrv', tempMvrv);
    localStorage.setItem('gb_sopr', tempSopr);
    setIsEditing(false);
  };

  const rsiData = getRSIScore(rsi);
  const mvrvData = getMVRVScore(mvrv);
  const soprData = getSOPRScore(sopr);
  const fngData = getFnGScore(fng);

  const totalScore = rsiData.score + mvrvData.score + soprData.score + fngData.score;
  
  let stars = 1;
  let decision = "Take Profit / Avoid";
  if (totalScore >= 7) { stars = 5; decision = "Strong Accumulation"; }
  else if (totalScore >= 5) { stars = 4; decision = "Accumulation"; }
  else if (totalScore >= 3) { stars = 3; decision = "Wait & See"; }
  else if (totalScore >= 1) { stars = 2; decision = "Caution / Wait"; }

  return (
    <div className="summary-wrapper">
      <div className="summary-header-row">
        <h3>Summary : {dateStr}</h3>
        <button className="edit-btn" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Batal' : 'Edit MVRV/SOPR'}
        </button>
      </div>

      <div className="summary-card">
        {isEditing && (
          <div className="edit-panel">
            <label>MVRV-Z: <input type="number" step="0.1" value={tempMvrv} onChange={(e) => setTempMvrv(e.target.value)} /></label>
            <label>SOPR: <input type="number" step="0.01" value={tempSopr} onChange={(e) => setTempSopr(e.target.value)} /></label>
            <button onClick={handleSaveManual}>Simpan</button>
          </div>
        )}

        <div className="summary-table">
          <div className="summary-row header">
            <span>Indikator</span>
            <span>Value</span>
            <span>Interpretation</span>
          </div>
          
          <div className="summary-row">
            <span>RSI</span>
            <span>{rsi}</span>
            <span>{rsiData.label}</span>
          </div>
          <div className="summary-row">
            <span>MVRV-Z</span>
            <span>{mvrv}</span>
            <span>{mvrvData.label}</span>
          </div>
          <div className="summary-row">
            <span>SOPR</span>
            <span>{sopr}</span>
            <span>{soprData.label}</span>
          </div>
          <div className="summary-row">
            <span>FnG</span>
            <span>{fng}</span>
            <span>{fngData.label}</span>
          </div>
          
          <div className="summary-row footer">
            <span style={{fontWeight: 'bold'}}>Overall</span>
            <span className="stars">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={18} fill={i <= stars ? "#ffb800" : "transparent"} color={i <= stars ? "#ffb800" : "#555"} style={{marginRight: '4px'}} />
              ))}
            </span>
            <span>{decision}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryWidget;
