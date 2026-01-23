/**
 * @title: Covenant AI Signal Trading
 * @description: LSTM, Bollinger Bands, SMA 기반 AI 트레이딩 신호 생성 시스템
 * @category: 개발
 * @icon: 🤖
 * @color: "#E15759"
 */

import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, ComposedChart, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Area, AreaChart, ReferenceLine
} from 'recharts';

// Tableau 컬러 팔레트
const COLORS = {
  blue: '#4E79A7',
  orange: '#F28E2B',
  red: '#E15759',
  teal: '#76B7B2',
  green: '#59A14F',
  yellow: '#EDC948',
  brown: '#9C755F',
  pink: '#FF9DA7',
  purple: '#B07AA1',
  gray: '#BAB0AC',
};

// 종목 리스트
const STOCK_LIST = [
  { code: '252670', name: 'KODEX 200선물인버스2X' },
  { code: '122630', name: 'KODEX 레버리지' },
  { code: '069500', name: 'KODEX 200' },
  { code: '114800', name: 'KODEX 인버스' },
  { code: '005930', name: '삼성전자' },
  { code: '000660', name: 'SK하이닉스' },
  { code: '005380', name: '현대차' },
  { code: 'SOXX', name: 'SOXX (반도체 ETF)' },
  { code: 'VUG', name: 'VUG (성장주 ETF)' },
  { code: 'SPY', name: 'SPY (S&P 500)' },
  { code: 'MAGS', name: 'MAGS (Magnificent 7)' },
];

// 샘플 데이터 - 누적 수익률
const generateSampleData = (days = 252) => {
  const data = [];
  const startDate = new Date('2025-01-01');
  
  let portfolioReturn = 0;
  let stockReturn = 0;
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    // 랜덤 수익률 생성 (포트폴리오는 더 안정적)
    const stockChange = (Math.random() - 0.48) * 0.03; // 약간의 상승 편향
    const portfolioChange = (Math.random() - 0.45) * 0.02; // 더 안정적
    
    stockReturn += stockChange;
    portfolioReturn += portfolioChange;
    
    // 신호 생성 (0 또는 1)
    const signal = Math.random() > 0.35 ? 1 : 0;
    
    // Bollinger Bands
    const price = 100 + stockReturn * 100;
    const ma20 = price + (Math.random() - 0.5) * 5;
    const upper = ma20 + 10;
    const lower = ma20 - 10;
    
    data.push({
      date: date.toISOString().split('T')[0],
      portfolioReturn: portfolioReturn * 100,
      stockReturn: stockReturn * 100,
      signal: signal,
      price: price,
      ma20: ma20,
      upper: upper,
      lower: lower,
      bbSignal: price > upper ? 1 : (price < lower ? -1 : 0),
      smaSignal: Math.random() > 0.5 ? 1 : -1,
      lstmSignal: Math.random() > 0.5 ? 1 : -1,
    });
  }
  
  return data;
};

// 성과 지표 계산
const calculateMetrics = (data) => {
  const portfolioReturns = data.map(d => d.portfolioReturn);
  const stockReturns = data.map(d => d.stockReturn);
  
  const portfolioFinal = portfolioReturns[portfolioReturns.length - 1];
  const stockFinal = stockReturns[stockReturns.length - 1];
  
  const portfolioVolatility = Math.sqrt(
    portfolioReturns.reduce((sum, r, i, arr) => {
      if (i === 0) return 0;
      const dailyReturn = r - arr[i - 1];
      return sum + dailyReturn * dailyReturn;
    }, 0) / portfolioReturns.length
  );
  
  const sharpeRatio = (portfolioFinal / 252) / portfolioVolatility;
  
  const maxDrawdown = portfolioReturns.reduce((max, r, i, arr) => {
    const peak = Math.max(...arr.slice(0, i + 1));
    const drawdown = (r - peak) / peak * 100;
    return Math.min(max, drawdown);
  }, 0);
  
  return {
    portfolioReturn: portfolioFinal,
    stockReturn: stockFinal,
    outperformance: portfolioFinal - stockFinal,
    sharpeRatio: sharpeRatio,
    volatility: portfolioVolatility * Math.sqrt(252),
    maxDrawdown: maxDrawdown,
  };
};

export default function CovenantAISignalTrading() {
  const [selectedStock, setSelectedStock] = useState('069500');
  const [smaWindow, setSmaWindow] = useState(20);
  const [viewMode, setViewMode] = useState('overview');
  
  // 샘플 데이터 생성
  const chartData = useMemo(() => generateSampleData(252), [selectedStock, smaWindow]);
  const metrics = useMemo(() => calculateMetrics(chartData), [chartData]);
  
  // 최적 가중치
  const optimalWeights = {
    bollinger: 0.35,
    lstm: 0.45,
    sma: 0.20,
  };
  
  // 현재 신호
  const currentSignal = chartData[chartData.length - 1]?.signal;
  const signalText = currentSignal === 1 ? '매수' : '매도';
  const signalColor = currentSignal === 1 ? COLORS.green : COLORS.red;

  return (
    <div style={{
      fontFamily: "'Pretendard', 'Noto Sans KR', -apple-system, sans-serif",
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
      minHeight: '100vh',
      padding: '32px',
      color: '#e8e8e8'
    }}>
      {/* 헤더 */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '40px',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '32px',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h1 style={{ 
          fontSize: '2.5rem', 
          fontWeight: '800',
          background: `linear-gradient(135deg, ${COLORS.red}, ${COLORS.orange})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          🤖 Covenant AI Signal Trading
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem', margin: 0 }}>
          LSTM + Bollinger Bands + SMA 기반 AI 트레이딩 신호 생성 시스템
        </p>
        <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '8px' }}>
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* 현재 신호 표시 */}
      <div style={{
        textAlign: 'center',
        marginBottom: '32px',
        padding: '24px',
        background: `linear-gradient(135deg, ${signalColor}22, ${signalColor}11)`,
        borderRadius: '16px',
        border: `3px solid ${signalColor}`,
      }}>
        <div style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '8px' }}>
          현재 신호
        </div>
        <div style={{ 
          fontSize: '3rem', 
          fontWeight: '800', 
          color: signalColor,
          textShadow: `0 0 20px ${signalColor}88`
        }}>
          {signalText}
        </div>
      </div>

      {/* 컨트롤 패널 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {/* 종목 선택 */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <label style={{ fontSize: '0.9rem', color: '#aaa', display: 'block', marginBottom: '8px' }}>
            종목 선택
          </label>
          <select
            value={selectedStock}
            onChange={(e) => setSelectedStock(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '1rem'
            }}
          >
            {STOCK_LIST.map(stock => (
              <option key={stock.code} value={stock.code}>
                {stock.name}
              </option>
            ))}
          </select>
        </div>

        {/* SMA 윈도우 */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <label style={{ fontSize: '0.9rem', color: '#aaa', display: 'block', marginBottom: '8px' }}>
            SMA 윈도우 (일)
          </label>
          <input
            type="number"
            value={smaWindow}
            onChange={(e) => setSmaWindow(Number(e.target.value))}
            min="5"
            max="200"
            step="5"
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

      {/* 주요 지표 카드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.green}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>포트폴리오 수익률</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.green }}>
            +{metrics.portfolioReturn.toFixed(2)}%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.blue}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>종목 수익률</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.blue }}>
            +{metrics.stockReturn.toFixed(2)}%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.orange}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>초과 수익률</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.orange }}>
            +{metrics.outperformance.toFixed(2)}%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.purple}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>Sharpe Ratio</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.purple }}>
            {metrics.sharpeRatio.toFixed(2)}
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.teal}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>변동성 (연)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.teal }}>
            {metrics.volatility.toFixed(2)}%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.red}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>MDD</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.red }}>
            {metrics.maxDrawdown.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* 뷰 모드 선택 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {[
          { id: 'overview', label: '📊 개요' },
          { id: 'signals', label: '🎯 신호 분석' },
          { id: 'bollinger', label: '📈 볼린저 밴드' }
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: viewMode === mode.id ? `2px solid ${COLORS.red}` : '1px solid rgba(255,255,255,0.2)',
              background: viewMode === mode.id 
                ? `linear-gradient(135deg, ${COLORS.red}, ${COLORS.orange})` 
                : 'rgba(255,255,255,0.05)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* 개요 뷰 */}
      {viewMode === 'overview' && (
        <>
          {/* 누적 수익률 */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '16px',
              color: COLORS.green
            }}>
              📈 누적 수익률 비교
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="date" 
                  stroke="#aaa" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis stroke="#aaa" tickFormatter={(value) => `${value.toFixed(0)}%`} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 12, 41, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                  formatter={(value) => `${value.toFixed(2)}%`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="portfolioReturn" 
                  stroke={COLORS.green} 
                  strokeWidth={3} 
                  name="Covenant Portfolio" 
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="stockReturn" 
                  stroke={COLORS.blue} 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  name="Stock" 
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 최적 가중치 */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '16px',
              color: COLORS.orange
            }}>
              ⚖️ 최적 신호 가중치
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              {[
                { name: 'Bollinger Bands', weight: optimalWeights.bollinger, color: COLORS.blue },
                { name: 'LSTM', weight: optimalWeights.lstm, color: COLORS.red },
                { name: 'SMA', weight: optimalWeights.sma, color: COLORS.orange },
              ].map((item, idx) => (
                <div key={idx} style={{
                  padding: '20px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  borderLeft: `4px solid ${item.color}`,
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '0.9rem', color: '#aaa', marginBottom: '8px' }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: '700', color: item.color }}>
                    {(item.weight * 100).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 신호 분석 뷰 */}
      {viewMode === 'signals' && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '16px',
            color: COLORS.purple
          }}>
            🎯 통합 매매 신호
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#aaa"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis stroke="#aaa" domain={[-0.2, 1.2]} ticks={[0, 1]} />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(15, 12, 41, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
                formatter={(value) => value === 1 ? '매수' : '매도'}
              />
              <Legend />
              <ReferenceLine y={0} stroke="#666" />
              <ReferenceLine y={1} stroke="#666" />
              <Line 
                type="stepAfter" 
                dataKey="signal" 
                stroke={COLORS.green} 
                strokeWidth={2} 
                name="통합 신호" 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* 볼린저 밴드 뷰 */}
      {viewMode === 'bollinger' && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '16px',
            color: COLORS.teal
          }}>
            📈 볼린저 밴드 분석
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#aaa"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis stroke="#aaa" />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(15, 12, 41, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="upper" 
                stroke={COLORS.red} 
                strokeWidth={1} 
                strokeDasharray="5 5"
                name="Upper Band" 
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="ma20" 
                stroke={COLORS.blue} 
                strokeWidth={2} 
                name="MA 20" 
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="lower" 
                stroke={COLORS.green} 
                strokeWidth={1} 
                strokeDasharray="5 5"
                name="Lower Band" 
                dot={false}
              />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke={COLORS.orange} 
                strokeWidth={3} 
                name="Price" 
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
