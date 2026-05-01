import React, { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import { Responsive, WidthProvider } from 'react-grid-layout/legacy';
import { User } from 'lucide-react';
import { AdvancedRealTimeChart, EconomicCalendar } from 'react-ts-tradingview-widgets';
import SummaryWidget from './components/SummaryWidget';
import './index.css';

const ResponsiveGridLayout = WidthProvider(Responsive);

const DEFAULT_LAYOUT = [
  { i: 'chart', x: 0, y: 0, w: 6, h: 14 },
  { i: 'fg', x: 6, y: 0, w: 2, h: 10 },
  { i: 'calendar', x: 8, y: 0, w: 4, h: 10 },
  { i: 'summary', x: 0, y: 14, w: 4, h: 10 },
  { i: 'etf', x: 6, y: 10, w: 3, h: 4 },
  { i: 'rsi', x: 9, y: 10, w: 3, h: 4 },
  { i: 'mvrv', x: 4, y: 14, w: 4, h: 10 },
  { i: 'sopr', x: 8, y: 14, w: 4, h: 10 },
];

const Widget = ({ title, children }) => (
  <div className="widget-container">
    <div className="widget-header">
      <span>{title}</span>
    </div>
    <div className="widget-content">
      {children}
    </div>
  </div>
);

function App() {
  const [layout, setLayout] = useState(DEFAULT_LAYOUT);

  useEffect(() => {
    const savedLayout = localStorage.getItem('growbits_terminal_layout');
    if (savedLayout) {
      try {
        setLayout(JSON.parse(savedLayout));
      } catch (e) {
        console.error('Failed to parse layout', e);
      }
    }
  }, []);

  const onLayoutChange = (newLayout) => {
    setLayout(newLayout);
    localStorage.setItem('growbits_terminal_layout', JSON.stringify(newLayout));
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-left">
          <span>Growbits Dex</span>
        </div>
        <div className="nav-center">
          <span>Equity</span>
          <span>Forex</span>
          <span className="active">Cryptocurrency</span>
        </div>
        <div className="nav-right">
          <User size={28} color="#fff" />
        </div>
      </nav>

      <div style={{ padding: '10px' }}>
        <ResponsiveGridLayout
          className="layout"
          layouts={{ lg: layout }}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
          rowHeight={30}
          onLayoutChange={onLayoutChange}
          draggableHandle=".widget-header"
        >
          <div key="chart">
            <Widget title="Chart">
              <AdvancedRealTimeChart
                theme="dark"
                symbol="BINANCE:BTCUSD"
                interval="D"
                style="1"
                locale="en"
                enable_publishing={false}
                backgroundColor="#000000"
                hide_top_toolbar={false}
                hide_legend={false}
                save_image={false}
                container_id="tradingview_chart"
                autosize={true}
              />
            </Widget>
          </div>

          <div key="summary">
            <Widget title="Daily Summary">
              <SummaryWidget />
            </Widget>
          </div>
          
          <div key="fg">
            <Widget title="Fear and Greed">
              {/* CMC doesn't embed well natively, using alternative.me API image which is standard for crypto terminals */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: '#000' }}>
                 <img src="https://alternative.me/crypto/fear-and-greed-index.png" alt="Latest Crypto Fear & Greed Index" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
            </Widget>
          </div>

          <div key="calendar">
            <Widget title="Economic Calendar">
               <EconomicCalendar
                 colorTheme="dark"
                 isTransparent={true}
                 width="100%"
                 height="100%"
                 locale="en"
                 importanceFilter="-1,0,1"
               />
            </Widget>
          </div>

          <div key="etf">
            <Widget title="Bitcoin ETF Flows">
              <iframe src="https://www.coinglass.com/etf/bitcoin" title="Bitcoin ETF" width="100%" height="100%" style={{ border: 'none' }} />
            </Widget>
          </div>

          <div key="rsi">
            <Widget title="Relative Strength Index (RSI)">
              <iframe src="https://www.cryptowaves.app/relative-strength-index/BTC" title="RSI" width="100%" height="100%" style={{ border: 'none' }} />
            </Widget>
          </div>

          <div key="mvrv">
            <Widget title="MVRV-Z">
              <iframe src="https://www.coinglass.com/pro/i/bitcoin-mvrv-zscore" title="MVRV-Z" width="100%" height="100%" style={{ border: 'none' }} />
            </Widget>
          </div>

          <div key="sopr">
            <Widget title="SOPR">
              <iframe src="https://www.coinglass.com/pro/i/long-term-holder-sopr" title="SOPR" width="100%" height="100%" style={{ border: 'none' }} />
            </Widget>
          </div>

        </ResponsiveGridLayout>
      </div>
    </div>
  );
}

export default App;
