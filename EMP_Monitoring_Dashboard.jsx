/**
 * EMP 모니터링 대시보드
 * 
 * Employee Portfolio Monitoring - 실시간 금융 자산 분석 및 포트폴리오 모니터링
 * 
 * @title: EMP 모니터링 대시보드
 * @description: 개인 투자자를 위한 종합적인 금융 자산 분석 도구
 * @category: 포트폴리오
 * @icon: 💼
 * @color: #4E79A7
 */

import React, { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, ScatterChart, Scatter, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

// Tableau 컬러 팔레트
const COLORS = {
  blue: '#4E79A7',
  orange: '#F28E2B',
  red: '#E15759',
  teal: '#76B7B2',
  green: '#59A14F',
  yellow: '#EDC948',
  brown: '#9C755F',
  mint: '#3EB489',
  gray: '#BAB0AC',
};

// 샘플 데이터 (실제로는 API에서 가져옴)
const sampleStocks = [
  { ticker: 'VUG', name: 'Vanguard Growth ETF', returns: 15.2, volatility: 18.5, category: '미국성장' },
  { ticker: 'IWF', name: 'iShares Russell 1000 Growth', returns: 14.8, volatility: 17.2, category: '미국성장' },
  { ticker: 'VTV', name: 'Vanguard Value ETF', returns: 12.5, volatility: 15.3, category: '미국가치' },
  { ticker: 'IWD', name: 'iShares Russell 1000 Value', returns: 11.8, volatility: 14.7, category: '미국가치' },
  { ticker: 'VEA', name: 'Vanguard FTSE Developed Markets', returns: 10.2, volatility: 16.8, category: '선진국' },
  { ticker: 'VWO', name: 'Vanguard FTSE Emerging Markets', returns: 8.5, volatility: 22.3, category: '이머징' },
  { ticker: 'GLD', name: 'SPDR Gold Shares', returns: 5.3, volatility: 12.1, category: '금' },
];

const samplePriceData = [
  { date: '2024-01', VUG: 100, IWF: 100, VTV: 100, IWD: 100 },
  { date: '2024-02', VUG: 102, IWF: 101.5, VTV: 101, IWD: 100.8 },
  { date: '2024-03', VUG: 105, IWF: 104, VTV: 102.5, IWD: 102 },
  { date: '2024-04', VUG: 108, IWF: 106, VTV: 104, IWD: 103.5 },
  { date: '2024-05', VUG: 112, IWF: 109, VTV: 106, IWD: 105 },
  { date: '2024-06', VUG: 115, IWF: 111, VTV: 108, IWD: 106.5 },
];

export default function EMPMonitoringDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('ytd');
  const [selectedStocks, setSelectedStocks] = useState(['VUG', 'IWF', 'VTV']);
  const [activeTab, setActiveTab] = useState('performance');

  const periods = [
    { value: '1m', label: '1개월' },
    { value: '3m', label: '3개월' },
    { value: '6m', label: '6개월' },
    { value: '1y', label: '1년' },
    { value: 'ytd', label: 'YTD' },
    { value: 'all', label: '전체' },
  ];

  const tabs = [
    { id: 'performance', label: '📊 개별 종목 분석', icon: '📊' },
    { id: 'group', label: '📈 그룹 리스크-수익률', icon: '📈' },
    { id: 'comparison', label: '🔍 종목 비교', icon: '🔍' },
  ];

  return (
    <div style={{
      fontFamily: "'Pretendard', 'Noto Sans KR', -apple-system, sans-serif",
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
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
          background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.teal})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          💼 EMP Monitoring Dashboard
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem', margin: 0 }}>
          Employee Portfolio Monitoring - 실시간 금융 자산 분석 및 포트폴리오 모니터링
        </p>
      </div>

      {/* 탭 네비게이션 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '32px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: activeTab === tab.id ? `2px solid ${COLORS.blue}` : '1px solid rgba(255,255,255,0.2)',
              background: activeTab === tab.id 
                ? `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.green})` 
                : 'rgba(255,255,255,0.05)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              transition: 'all 0.3s',
              backdropFilter: 'blur(10px)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 기간 선택 */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '24px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {periods.map(period => (
          <button
            key={period.value}
            onClick={() => setSelectedPeriod(period.value)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: selectedPeriod === period.value ? `2px solid ${COLORS.blue}` : '1px solid rgba(255,255,255,0.2)',
              background: selectedPeriod === period.value 
                ? COLORS.blue
                : 'rgba(255,255,255,0.05)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.85rem',
              transition: 'all 0.3s'
            }}
          >
            {period.label}
          </button>
        ))}
      </div>

      {/* 컨텐츠 영역 */}
      {activeTab === 'performance' && (
        <PerformanceAnalytics 
          selectedPeriod={selectedPeriod}
          selectedStocks={selectedStocks}
        />
      )}

      {activeTab === 'group' && (
        <GroupRiskReturnAnalysis 
          selectedPeriod={selectedPeriod}
          stocks={sampleStocks}
        />
      )}

      {activeTab === 'comparison' && (
        <StockComparison 
          selectedPeriod={selectedPeriod}
          selectedStocks={selectedStocks}
          setSelectedStocks={setSelectedStocks}
          priceData={samplePriceData}
        />
      )}
    </div>
  );
}

// 1. 개별 종목 분석 컴포넌트
function PerformanceAnalytics({ selectedPeriod, selectedStocks }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
      {/* 누적 수익률 */}
      <ChartCard title="📈 Cumulative Returns (누적 수익률)">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={samplePriceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(26, 26, 46, 0.95)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="VUG" stroke={COLORS.blue} strokeWidth={2} name="VUG" />
            <Line type="monotone" dataKey="IWF" stroke={COLORS.green} strokeWidth={2} name="IWF" />
            <Line type="monotone" dataKey="VTV" stroke={COLORS.orange} strokeWidth={2} name="VTV" />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* 가격 추세 */}
      <ChartCard title="📊 Price Trends (정규화된 가격 추세)">
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={samplePriceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(26, 26, 46, 0.95)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Area type="monotone" dataKey="VUG" stackId="1" stroke={COLORS.blue} fill={COLORS.blue} fillOpacity={0.6} name="VUG" />
            <Area type="monotone" dataKey="IWF" stackId="2" stroke={COLORS.green} fill={COLORS.green} fillOpacity={0.6} name="IWF" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// 2. 그룹 리스크-수익률 분석
function GroupRiskReturnAnalysis({ selectedPeriod, stocks }) {
  return (
    <div>
      <ChartCard title="📈 Risk-Return Analysis (리스크-수익률 분석)">
        <ResponsiveContainer width="100%" height={500}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              type="number" 
              dataKey="volatility" 
              name="변동성 (%)" 
              stroke="#aaa"
              label={{ value: '변동성 (%)', position: 'bottom', fill: '#aaa' }}
            />
            <YAxis 
              type="number" 
              dataKey="returns" 
              name="수익률 (%)" 
              stroke="#aaa"
              label={{ value: '수익률 (%)', angle: -90, position: 'left', fill: '#aaa' }}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ 
                background: 'rgba(26, 26, 46, 0.95)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
              formatter={(value, name) => [`${value.toFixed(2)}%`, name]}
            />
            <Legend />
            <Scatter name="종목" data={stocks} fill={COLORS.blue}>
              {stocks.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[Object.keys(COLORS)[index % Object.keys(COLORS).length]]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>

        {/* 종목 리스트 */}
        <div style={{ marginTop: '24px' }}>
          <h3 style={{ color: COLORS.teal, marginBottom: '16px', fontSize: '1.2rem' }}>종목 상세 정보</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
            {stocks.map((stock, index) => (
              <div key={stock.ticker} style={{
                background: 'rgba(255,255,255,0.05)',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: '600', color: '#fff' }}>{stock.ticker}</span>
                  <span style={{ 
                    fontSize: '0.75rem', 
                    padding: '2px 8px', 
                    borderRadius: '4px',
                    background: COLORS[Object.keys(COLORS)[index % Object.keys(COLORS).length]],
                    color: '#fff'
                  }}>
                    {stock.category}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '4px' }}>{stock.name}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.9rem' }}>
                  <span>수익률: <strong style={{ color: COLORS.green }}>{stock.returns.toFixed(2)}%</strong></span>
                  <span>변동성: <strong style={{ color: COLORS.orange }}>{stock.volatility.toFixed(2)}%</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ChartCard>
    </div>
  );
}

// 3. 종목 비교 컴포넌트
function StockComparison({ selectedPeriod, selectedStocks, setSelectedStocks, priceData }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
      <ChartCard title="📊 Price Comparison (가격 비교)">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={priceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(26, 26, 46, 0.95)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            {selectedStocks.map((stock, index) => (
              <Line 
                key={stock}
                type="monotone" 
                dataKey={stock} 
                stroke={COLORS[Object.keys(COLORS)[index % Object.keys(COLORS).length]]} 
                strokeWidth={3}
                name={stock}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="📈 Total Returns (총 수익률)">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sampleStocks.filter(s => selectedStocks.includes(s.ticker))}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="ticker" stroke="#aaa" />
            <YAxis stroke="#aaa" />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(26, 26, 46, 0.95)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="returns" name="수익률 (%)">
              {sampleStocks.filter(s => selectedStocks.includes(s.ticker)).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[Object.keys(COLORS)[index % Object.keys(COLORS).length]]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}

// 차트 카드 공통 컴포넌트
function ChartCard({ title, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)'
    }}>
      <h2 style={{ 
        fontSize: '1.3rem', 
        marginBottom: '20px',
        color: COLORS.blue,
        fontWeight: '600'
      }}>
        {title}
      </h2>
      {children}
    </div>
  );
}
