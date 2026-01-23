/**
 * @title: Global Stock AI Report
 * @description: Claude AI 기반 글로벌 종목 분석 리포트 생성 시스템
 * @category: 개발
 * @icon: 📊
 * @color: "#3b82f6"
 */

import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Area, AreaChart, ComposedChart, ScatterChart, Scatter
} from 'recharts';

// 컬러 팔레트
const COLORS = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  primaryLight: '#60a5fa',
  secondary: '#06b6d4',
  accent: '#f59e0b',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#06b6d4',
  purple: '#667eea',
  pink: '#f687b3',
  teal: '#38b2ac',
  gray: '#64748b',
};

// 주요 시장 종목 리스트
const MARKET_STOCKS = {
  'US': [
    { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology', marketCap: 3200000000000 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', marketCap: 2900000000000 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', marketCap: 1800000000000 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical', marketCap: 1700000000000 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', sector: 'Technology', marketCap: 1600000000000 },
    { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', marketCap: 1200000000000 },
    { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', marketCap: 800000000000 },
    { symbol: 'JPM', name: 'JPMorgan Chase', sector: 'Financial', marketCap: 500000000000 },
  ],
  'Korea': [
    { symbol: '005930', name: '삼성전자', sector: 'Technology', marketCap: 400000000000 },
    { symbol: '000660', name: 'SK하이닉스', sector: 'Technology', marketCap: 85000000000 },
    { symbol: '035420', name: 'NAVER', sector: 'Technology', marketCap: 45000000000 },
    { symbol: '005380', name: '현대차', sector: 'Automotive', marketCap: 40000000000 },
  ]
};

// 샘플 종목 데이터
const generateStockData = (symbol) => {
  return {
    symbol: symbol,
    name: MARKET_STOCKS.US.find(s => s.symbol === symbol)?.name || symbol,
    currentPrice: 180.50 + Math.random() * 20,
    priceChange: (Math.random() - 0.5) * 10,
    marketCap: 2500000000000,
    pe: 25.5 + Math.random() * 10,
    eps: 6.5,
    revenue: 380000000000,
    netIncome: 95000000000,
    sector: 'Technology',
    industry: 'Consumer Electronics',
    country: 'United States',
  };
};

// 가격 차트 데이터
const generatePriceData = (days = 180) => {
  const data = [];
  let price = 150;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    
    price = price * (1 + (Math.random() - 0.48) * 0.02);
    const ma20 = price + (Math.random() - 0.5) * 5;
    const ma50 = price + (Math.random() - 0.5) * 8;
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: price,
      ma20: ma20,
      ma50: ma50,
      volume: Math.floor(50000000 + Math.random() * 30000000),
    });
  }
  
  return data;
};

// SWOT 분석 데이터
const swotData = {
  strengths: [
    '강력한 브랜드 파워와 고객 충성도',
    '업계 최고 수준의 수익성',
    '혁신적인 제품 개발 능력',
    '글로벌 공급망 네트워크',
  ],
  weaknesses: [
    '프리미엄 가격으로 인한 시장 제한',
    '특정 제품군에 대한 높은 의존도',
    '중국 시장 의존도 증가',
  ],
  opportunities: [
    'AI 및 머신러닝 기술 확대',
    '서비스 부문 성장 가능성',
    '신흥 시장 확대',
    '헬스케어 시장 진출',
  ],
  threats: [
    '치열한 경쟁 환경',
    '규제 리스크 증가',
    '공급망 불확실성',
    '거시경제 둔화',
  ],
};

// 재무 지표 데이터
const financialMetrics = [
  { metric: '수익성', score: 90, target: 85 },
  { metric: '성장성', score: 75, target: 70 },
  { metric: '안정성', score: 85, target: 80 },
  { metric: '유동성', score: 80, target: 75 },
  { metric: '효율성', score: 88, target: 85 },
];

// 뉴스 분석 데이터
const newsAnalysis = [
  {
    date: '2025-01-20',
    title: 'AI 칩 수요 급증으로 분기 실적 기대치 상향',
    sentiment: '긍정',
    impact: '높음',
    summary: 'AI 칩 수요 증가로 인해 분기 실적이 기대치를 상회할 것으로 예상됨',
  },
  {
    date: '2025-01-18',
    title: '신제품 출시 연기 발표',
    sentiment: '부정',
    impact: '중간',
    summary: '공급망 문제로 인해 신제품 출시가 다음 분기로 연기됨',
  },
  {
    date: '2025-01-15',
    title: '유럽 시장 점유율 확대 성공',
    sentiment: '긍정',
    impact: '중간',
    summary: '유럽 시장에서의 적극적인 마케팅으로 점유율 5% 증가',
  },
];

// 리스크 평가 데이터
const riskAssessment = [
  { category: '시장 리스크', level: 65, description: '경쟁 심화 및 시장 포화' },
  { category: '재무 리스크', level: 30, description: '건전한 재무구조 유지' },
  { category: '운영 리스크', level: 45, description: '공급망 불확실성' },
  { category: '규제 리스크', level: 55, description: '글로벌 규제 강화' },
  { category: '기술 리스크', level: 40, description: '기술 변화 대응 필요' },
];

export default function GlobalStockAIReport() {
  const [selectedMarket, setSelectedMarket] = useState('US');
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [viewMode, setViewMode] = useState('overview');
  const [showReport, setShowReport] = useState(false);

  const stockData = useMemo(() => generateStockData(selectedStock), [selectedStock]);
  const priceData = useMemo(() => generatePriceData(180), [selectedStock]);

  const currentStocks = MARKET_STOCKS[selectedMarket];

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
      minHeight: '100vh',
      padding: '32px',
      color: '#f8fafc'
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
          background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          📊 Global Stock AI Report Generator
        </h1>
        <p style={{ color: '#cbd5e1', fontSize: '1.1rem', margin: 0 }}>
          Claude AI 기반 심층 종목 분석 리포트 시스템
        </p>
      </div>

      {!showReport ? (
        <>
          {/* 시장 선택 */}
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            justifyContent: 'center'
          }}>
            {['US', 'Korea'].map((market) => (
              <button
                key={market}
                onClick={() => {
                  setSelectedMarket(market);
                  setSelectedStock(MARKET_STOCKS[market][0].symbol);
                }}
                style={{
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: selectedMarket === market ? `2px solid ${COLORS.primary}` : '1px solid rgba(255,255,255,0.2)',
                  background: selectedMarket === market 
                    ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` 
                    : 'rgba(255,255,255,0.05)',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s'
                }}
              >
                {market === 'US' ? '🇺🇸 미국 시장' : '🇰🇷 한국 시장'}
              </button>
            ))}
          </div>

          {/* 종목 테이블 */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '24px',
            border: '1px solid rgba(255,255,255,0.1)',
            overflowX: 'auto'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: COLORS.primary }}>
              종목 리스트
            </h2>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '0.9rem'
            }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: COLORS.secondary }}>티커</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: COLORS.secondary }}>회사명</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: COLORS.secondary }}>섹터</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: COLORS.secondary }}>시가총액</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: COLORS.secondary }}>선택</th>
                </tr>
              </thead>
              <tbody>
                {currentStocks.map((stock, idx) => (
                  <tr key={idx} style={{ 
                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                    background: selectedStock === stock.symbol ? 'rgba(59,130,246,0.1)' : 'transparent'
                  }}>
                    <td style={{ padding: '12px', fontWeight: '700', color: COLORS.primary }}>
                      {stock.symbol}
                    </td>
                    <td style={{ padding: '12px' }}>{stock.name}</td>
                    <td style={{ padding: '12px', color: COLORS.accent }}>{stock.sector}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      ${(stock.marketCap / 1000000000).toFixed(0)}B
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedStock(stock.symbol)}
                        style={{
                          padding: '6px 16px',
                          borderRadius: '6px',
                          border: selectedStock === stock.symbol ? `2px solid ${COLORS.primary}` : '1px solid rgba(255,255,255,0.2)',
                          background: selectedStock === stock.symbol ? COLORS.primary : 'rgba(255,255,255,0.05)',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '600'
                        }}
                      >
                        {selectedStock === stock.symbol ? '선택됨' : '선택'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 리포트 생성 버튼 */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <button
              onClick={() => setShowReport(true)}
              disabled={!selectedStock}
              style={{
                padding: '16px 48px',
                borderRadius: '12px',
                border: 'none',
                background: selectedStock 
                  ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` 
                  : '#475569',
                color: 'white',
                cursor: selectedStock ? 'pointer' : 'not-allowed',
                fontSize: '1.1rem',
                fontWeight: '700',
                transition: 'all 0.3s',
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
              }}
            >
              🤖 AI 리포트 생성
            </button>
          </div>
        </>
      ) : (
        <>
          {/* 뒤로 가기 버튼 */}
          <div style={{ marginBottom: '24px' }}>
            <button
              onClick={() => setShowReport(false)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.2)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600'
              }}
            >
              ← 종목 선택으로 돌아가기
            </button>
          </div>

          {/* 종목 정보 카드 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '20px',
              border: `2px solid ${COLORS.primary}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px' }}>현재가</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.primary }}>
                ${stockData.currentPrice.toFixed(2)}
              </div>
              <div style={{ 
                fontSize: '0.9rem', 
                color: stockData.priceChange >= 0 ? COLORS.success : COLORS.danger,
                marginTop: '4px'
              }}>
                {stockData.priceChange >= 0 ? '+' : ''}{stockData.priceChange.toFixed(2)}%
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '20px',
              border: `2px solid ${COLORS.secondary}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px' }}>시가총액</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.secondary }}>
                ${(stockData.marketCap / 1000000000000).toFixed(2)}T
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '20px',
              border: `2px solid ${COLORS.accent}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px' }}>P/E Ratio</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.accent }}>
                {stockData.pe.toFixed(1)}
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '20px',
              border: `2px solid ${COLORS.success}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '8px' }}>EPS</div>
              <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.success }}>
                ${stockData.eps.toFixed(2)}
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
              { id: 'swot', label: '🎯 SWOT' },
              { id: 'financial', label: '💰 재무' },
              { id: 'news', label: '📰 뉴스' },
              { id: 'risk', label: '⚠️ 리스크' }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: viewMode === mode.id ? `2px solid ${COLORS.primary}` : '1px solid rgba(255,255,255,0.2)',
                  background: viewMode === mode.id 
                    ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.primaryDark})` 
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
              {/* 가격 차트 */}
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: COLORS.primary }}>
                  📈 주가 추이 (6개월)
                </h2>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={priceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#cbd5e1"
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis stroke="#cbd5e1" />
                    <Tooltip 
                      contentStyle={{ 
                        background: 'rgba(15, 23, 42, 0.95)', 
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="price" stroke={COLORS.primary} strokeWidth={3} name="Price" dot={false} />
                    <Line type="monotone" dataKey="ma20" stroke={COLORS.accent} strokeWidth={2} strokeDasharray="5 5" name="MA 20" dot={false} />
                    <Line type="monotone" dataKey="ma50" stroke={COLORS.success} strokeWidth={2} strokeDasharray="5 5" name="MA 50" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* 투자 스토리 */}
              <div style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '24px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: COLORS.accent }}>
                  💡 투자 스토리
                </h2>
                <p style={{ lineHeight: '1.8', color: '#cbd5e1' }}>
                  <strong>{stockData.name}</strong>은(는) {stockData.sector} 섹터의 대표 기업으로, 
                  지속적인 혁신과 강력한 재무 구조를 바탕으로 시장을 선도하고 있습니다. 
                  최근 AI 및 클라우드 컴퓨팅 분야에서의 투자 확대로 장기적인 성장 동력을 확보하고 있으며, 
                  글로벌 시장에서의 입지를 더욱 공고히 하고 있습니다.
                </p>
              </div>
            </>
          )}

          {/* SWOT 분석 뷰 */}
          {viewMode === 'swot' && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
              marginBottom: '24px'
            }}>
              {[
                { title: '강점 (Strengths)', data: swotData.strengths, color: COLORS.success },
                { title: '약점 (Weaknesses)', data: swotData.weaknesses, color: COLORS.danger },
                { title: '기회 (Opportunities)', data: swotData.opportunities, color: COLORS.primary },
                { title: '위협 (Threats)', data: swotData.threats, color: COLORS.warning },
              ].map((section, idx) => (
                <div key={idx} style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '16px',
                  padding: '24px',
                  border: `2px solid ${section.color}`,
                }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: section.color }}>
                    {section.title}
                  </h3>
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {section.data.map((item, i) => (
                      <li key={i} style={{ 
                        padding: '8px 0', 
                        borderBottom: i < section.data.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                        color: '#cbd5e1'
                      }}>
                        • {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}

          {/* 재무 분석 뷰 */}
          {viewMode === 'financial' && (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: COLORS.success }}>
                💰 재무 지표 분석
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={financialMetrics}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis dataKey="metric" stroke="#cbd5e1" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#cbd5e1" />
                  <Radar name="현재" dataKey="score" stroke={COLORS.primary} fill={COLORS.primary} fillOpacity={0.6} />
                  <Radar name="목표" dataKey="target" stroke={COLORS.accent} fill={COLORS.accent} fillOpacity={0.3} />
                  <Legend />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* 뉴스 분석 뷰 */}
          {viewMode === 'news' && (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: COLORS.info }}>
                📰 최근 뉴스 분석
              </h2>
              {newsAnalysis.map((news, idx) => (
                <div key={idx} style={{
                  padding: '16px',
                  marginBottom: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${news.sentiment === '긍정' ? COLORS.success : COLORS.danger}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{news.date}</span>
                    <span style={{ 
                      fontSize: '0.85rem', 
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: news.sentiment === '긍정' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                      color: news.sentiment === '긍정' ? COLORS.success : COLORS.danger
                    }}>
                      {news.sentiment} / {news.impact}
                    </span>
                  </div>
                  <div style={{ fontWeight: '600', marginBottom: '8px', color: '#f8fafc' }}>
                    {news.title}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>
                    {news.summary}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 리스크 평가 뷰 */}
          {viewMode === 'risk' && (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              padding: '24px',
              marginBottom: '24px',
              border: '1px solid rgba(255,255,255,0.1)'
            }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', color: COLORS.warning }}>
                ⚠️ 리스크 평가
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={riskAssessment} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" domain={[0, 100]} stroke="#cbd5e1" />
                  <YAxis dataKey="category" type="category" stroke="#cbd5e1" width={120} />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(15, 23, 42, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="level" name="리스크 수준">
                    {riskAssessment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={
                        entry.level > 60 ? COLORS.danger : 
                        entry.level > 40 ? COLORS.warning : COLORS.success
                      } />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ marginTop: '20px' }}>
                {riskAssessment.map((risk, idx) => (
                  <div key={idx} style={{
                    padding: '12px',
                    marginBottom: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    color: '#cbd5e1'
                  }}>
                    <strong style={{ color: COLORS.warning }}>{risk.category}:</strong> {risk.description}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
