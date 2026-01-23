/**
 * @title: TAA ETF 포커스
 * @description: 전술적 자산배분(TAA) ETF 포트폴리오 최적화 및 백테스트
 * @category: 포트폴리오
 * @icon: 🎯
 * @color: "#59A14F"
 */

import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ComposedChart, Area, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

// Tableau 확장 컬러 팔레트 (20색)
const COLORS = {
  // 기본 Tableau 10
  blue: '#4E79A7',
  orange: '#F28E2B',
  red: '#E15759',
  teal: '#76B7B2',
  green: '#59A14F',
  yellow: '#EDC948',
  purple: '#AF7AA1',
  pink: '#FF9DA7',
  brown: '#9C755F',
  gray: '#BAB0AC',
  // 확장 10색
  lightblue: '#79AED3',
  lightorange: '#F6B083',
  lightred: '#F19C9C',
  lightteal: '#A0CBE2',
  lightgreen: '#8CC084',
  lightyellow: '#F4D88B',
  lightpurple: '#CCA9C9',
  lightpink: '#FFBCBE',
  lightbrown: '#C5AA92',
  lightgray: '#D4CFCC'
};

const CHART_COLORS = [
  '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
  '#EDC948', '#AF7AA1', '#FF9DA7', '#9C755F', '#BAB0AC'
];

// 카테고리별 색상 매핑
const CATEGORY_COLORS = {
  '미국성장': COLORS.blue,
  '미국가치': COLORS.orange,
  '미국채외선진국': COLORS.green,
  '이머징': COLORS.purple,
  '금': COLORS.yellow,
};

// 샘플 데이터 - 포트폴리오 성과
const portfolioPerformance = {
  cumulative: [
    { date: '2024-01', long: 100, short: 100, ew: 100, bm: 100 },
    { date: '2024-04', long: 108, short: 102, ew: 105, bm: 106 },
    { date: '2024-07', long: 115, short: 104, ew: 110, bm: 111 },
    { date: '2024-10', long: 122, short: 106, ew: 114, bm: 115 },
    { date: '2025-01', long: 128, short: 108, ew: 118, bm: 119 },
  ],
  monthly: [
    { month: '2024-10', long: 2.8, short: 0.8, ew: 1.5, bm: 1.6 },
    { month: '2024-11', long: 3.2, short: 1.1, ew: 2.0, bm: 2.1 },
    { month: '2024-12', long: 1.5, short: 0.5, ew: 1.2, bm: 1.3 },
    { month: '2025-01', long: 2.4, short: 0.9, ew: 1.8, bm: 1.7 },
  ]
};

// 자산 배분 (카테고리별)
const categoryAllocation = [
  { category: '미국성장', weight: 28.5, stocks: 3, avgReturn: 15.2, color: CATEGORY_COLORS['미국성장'] },
  { category: '미국가치', weight: 22.3, stocks: 2, avgReturn: 12.8, color: CATEGORY_COLORS['미국가치'] },
  { category: '미국채외선진국', weight: 18.7, stocks: 2, avgReturn: 10.5, color: CATEGORY_COLORS['미국채외선진국'] },
  { category: '이머징', weight: 15.2, stocks: 2, avgReturn: 8.3, color: CATEGORY_COLORS['이머징'] },
  { category: '금', weight: 15.3, stocks: 1, avgReturn: 5.8, color: CATEGORY_COLORS['금'] },
];

// ETF 구성 종목
const etfHoldings = [
  { ticker: 'SPY', name: 'S&P 500 ETF', category: '미국성장', weight: 12.5, return: 18.2, sharpe: 1.42 },
  { ticker: 'QQQ', name: 'Nasdaq 100 ETF', category: '미국성장', weight: 10.0, return: 22.5, sharpe: 1.35 },
  { ticker: 'IWM', name: 'Russell 2000 ETF', category: '미국성장', weight: 6.0, return: 8.5, sharpe: 0.95 },
  { ticker: 'VTV', name: 'Vanguard Value ETF', category: '미국가치', weight: 12.3, return: 14.2, sharpe: 1.28 },
  { ticker: 'IVE', name: 'iShares S&P 500 Value', category: '미국가치', weight: 10.0, return: 11.5, sharpe: 1.15 },
  { ticker: 'VEA', name: 'Vanguard FTSE Developed', category: '미국채외선진국', weight: 10.2, return: 12.3, sharpe: 1.08 },
  { ticker: 'EFA', name: 'iShares MSCI EAFE', category: '미국채외선진국', weight: 8.5, return: 8.8, sharpe: 0.92 },
  { ticker: 'VWO', name: 'Vanguard FTSE Emerging', category: '이머징', weight: 8.2, return: 9.5, sharpe: 0.88 },
  { ticker: 'EEM', name: 'iShares MSCI Emerging', category: '이머징', weight: 7.0, return: 7.2, sharpe: 0.75 },
  { ticker: 'GLD', name: 'SPDR Gold Shares', category: '금', weight: 15.3, return: 5.8, sharpe: 0.65 },
];

// Long/Short 전략 통계
const strategyStats = [
  { metric: '연평균 수익률', long: 12.8, short: 3.2, ew: 8.5, bm: 8.8, unit: '%' },
  { metric: '변동성', long: 14.5, short: 8.2, ew: 12.3, bm: 12.8, unit: '%' },
  { metric: 'Sharpe Ratio', long: 0.88, short: 0.39, ew: 0.69, bm: 0.69, unit: '' },
  { metric: 'MDD', long: -18.5, short: -8.2, ew: -14.3, bm: -15.2, unit: '%' },
  { metric: 'Calmar Ratio', long: 0.69, short: 0.39, ew: 0.59, bm: 0.58, unit: '' },
];

// 리스크 지표 (레이더 차트용)
const riskMetrics = [
  { metric: '수익률', long: 85, short: 45, ew: 70, bm: 72 },
  { metric: '안정성', long: 65, short: 85, ew: 75, bm: 73 },
  { metric: 'Sharpe', long: 80, short: 50, ew: 70, bm: 70 },
  { metric: '회복력', long: 70, short: 80, ew: 75, bm: 72 },
  { metric: '일관성', long: 75, short: 70, ew: 72, bm: 74 },
];

// 월별 초과수익률
const monthlyOutperformance = [
  { month: '2024-07', value: 0.8 },
  { month: '2024-08', value: -0.3 },
  { month: '2024-09', value: 1.2 },
  { month: '2024-10', value: 0.5 },
  { month: '2024-11', value: 0.9 },
  { month: '2024-12', value: 0.2 },
  { month: '2025-01', value: 0.7 },
];

export default function TAAETFFocus() {
  const [selectedStrategy, setSelectedStrategy] = useState('long');
  const [sortBy, setSortBy] = useState('weight');
  const [filterCategory, setFilterCategory] = useState('all');

  // ETF 필터링 및 정렬
  const filteredETFs = useMemo(() => {
    let data = [...etfHoldings];
    
    if (filterCategory !== 'all') {
      data = data.filter(etf => etf.category === filterCategory);
    }
    
    data.sort((a, b) => {
      if (sortBy === 'weight') return b.weight - a.weight;
      if (sortBy === 'return') return b.return - a.return;
      if (sortBy === 'sharpe') return b.sharpe - a.sharpe;
      return 0;
    });
    
    return data;
  }, [sortBy, filterCategory]);

  // 통계 요약
  const summary = useMemo(() => {
    const totalReturn = 28.0;
    const annualizedReturn = 12.8;
    const volatility = 14.5;
    const sharpeRatio = 0.88;
    
    return { totalReturn, annualizedReturn, volatility, sharpeRatio };
  }, []);

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
          background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.teal})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          🎯 TAA ETF 포커스
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem', margin: 0 }}>
          전술적 자산배분(TAA) ETF 포트폴리오 최적화 및 백테스트
        </p>
      </div>

      {/* 전략 선택 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '32px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'long', label: 'Long 전략', color: COLORS.blue },
          { key: 'short', label: 'Short 전략', color: COLORS.red },
          { key: 'ew', label: '동일가중', color: COLORS.gray },
          { key: 'bm', label: '벤치마크', color: COLORS.orange }
        ].map((strategy) => (
          <button
            key={strategy.key}
            onClick={() => setSelectedStrategy(strategy.key)}
            style={{
              padding: '12px 28px',
              borderRadius: '8px',
              border: selectedStrategy === strategy.key ? `2px solid ${strategy.color}` : '1px solid rgba(255,255,255,0.2)',
              background: selectedStrategy === strategy.key 
                ? strategy.color
                : 'rgba(255,255,255,0.05)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '700',
              transition: 'all 0.3s'
            }}
          >
            {strategy.label}
          </button>
        ))}
      </div>

      {/* 성과 요약 카드 */}
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
          border: `2px solid ${COLORS.green}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>누적 수익률</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.green }}>
            +{summary.totalReturn.toFixed(1)}%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.blue}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>연평균 수익률</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.blue }}>
            +{summary.annualizedReturn.toFixed(1)}%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.orange}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>변동성</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.orange }}>
            {summary.volatility.toFixed(1)}%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.teal}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>Sharpe Ratio</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.teal }}>
            {summary.sharpeRatio.toFixed(2)}
          </div>
        </div>
      </div>

      {/* 누적 수익률 차트 */}
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
          📈 누적 수익률 추이
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={portfolioPerformance.cumulative}>
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
            <Line type="monotone" dataKey="long" name="Long 전략" stroke={COLORS.blue} strokeWidth={3} />
            <Line type="monotone" dataKey="short" name="Short 전략" stroke={COLORS.red} strokeWidth={2} strokeDasharray="5 5" />
            <Line type="monotone" dataKey="ew" name="동일가중" stroke={COLORS.gray} strokeWidth={2} />
            <Line type="monotone" dataKey="bm" name="벤치마크" stroke={COLORS.orange} strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 카테고리별 자산배분 & 월별 수익률 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* 카테고리 배분 */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '16px',
            color: COLORS.blue
          }}>
            🎯 카테고리별 자산배분
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={categoryAllocation}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, weight }) => `${category} ${weight}%`}
                outerRadius={120}
                dataKey="weight"
              >
                {categoryAllocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(26, 26, 46, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 월별 수익률 */}
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
            📊 월별 수익률 비교
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={portfolioPerformance.monthly}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(26, 26, 46, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="long" name="Long" fill={COLORS.blue} />
              <Bar dataKey="short" name="Short" fill={COLORS.red} />
              <Bar dataKey="ew" name="동일가중" fill={COLORS.gray} opacity={0.6} />
              <Bar dataKey="bm" name="BM" fill={COLORS.orange} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 초과수익률 & 리스크 지표 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* 초과수익률 */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '16px',
            color: COLORS.green
          }}>
            💎 월별 초과수익률 (vs BM)
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlyOutperformance}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(26, 26, 46, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" name="초과수익률 (%p)">
                {monthlyOutperformance.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.value >= 0 ? COLORS.green : COLORS.red} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 리스크 레이더 차트 */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '16px',
            color: COLORS.purple
          }}>
            ⚡ 전략별 리스크 프로파일
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={riskMetrics}>
              <PolarGrid stroke="rgba(255,255,255,0.2)" />
              <PolarAngleAxis dataKey="metric" stroke="#aaa" />
              <PolarRadiusAxis stroke="#aaa" />
              <Radar name="Long" dataKey="long" stroke={COLORS.blue} fill={COLORS.blue} fillOpacity={0.3} />
              <Radar name="Short" dataKey="short" stroke={COLORS.red} fill={COLORS.red} fillOpacity={0.3} />
              <Radar name="BM" dataKey="bm" stroke={COLORS.orange} fill={COLORS.orange} fillOpacity={0.2} />
              <Legend />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(26, 26, 46, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 필터 및 정렬 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: '1rem', fontWeight: '600', color: COLORS.teal }}>
          ETF 구성 종목:
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'all', label: '전체' },
            { key: '미국성장', label: '미국성장' },
            { key: '미국가치', label: '미국가치' },
            { key: '미국채외선진국', label: '선진국' },
            { key: '이머징', label: '이머징' },
            { key: '금', label: '금' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterCategory(filter.key)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: filterCategory === filter.key ? `2px solid ${COLORS.blue}` : '1px solid rgba(255,255,255,0.2)',
                background: filterCategory === filter.key 
                  ? COLORS.blue
                  : 'rgba(255,255,255,0.05)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto' }}>
          {[
            { key: 'weight', label: '비중순' },
            { key: 'return', label: '수익률순' },
            { key: 'sharpe', label: 'Sharpe순' }
          ].map((sort) => (
            <button
              key={sort.key}
              onClick={() => setSortBy(sort.key)}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: sortBy === sort.key ? `2px solid ${COLORS.orange}` : '1px solid rgba(255,255,255,0.2)',
                background: sortBy === sort.key 
                  ? COLORS.orange
                  : 'rgba(255,255,255,0.05)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
            >
              {sort.label}
            </button>
          ))}
        </div>
      </div>

      {/* ETF 구성 테이블 */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        overflowX: 'auto'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '16px',
          color: COLORS.yellow
        }}>
          📋 ETF 구성 상세
        </h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>티커</th>
              <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>ETF명</th>
              <th style={{ padding: '12px', textAlign: 'center', color: COLORS.teal }}>카테고리</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>비중(%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>수익률(%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>Sharpe</th>
            </tr>
          </thead>
          <tbody>
            {filteredETFs.map((etf, idx) => (
              <tr key={idx} style={{ 
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
              }}>
                <td style={{ padding: '12px', textAlign: 'left', fontWeight: '700', color: COLORS.blue }}>
                  {etf.ticker}
                </td>
                <td style={{ padding: '12px', textAlign: 'left' }}>{etf.name}</td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'center',
                  color: CATEGORY_COLORS[etf.category] || COLORS.gray,
                  fontWeight: '600'
                }}>
                  {etf.category}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>
                  {etf.weight.toFixed(1)}
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'right',
                  color: etf.return >= 0 ? COLORS.green : COLORS.red,
                  fontWeight: '600'
                }}>
                  {etf.return >= 0 ? '+' : ''}{etf.return.toFixed(1)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {etf.sharpe.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 전략 통계 비교 */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        overflowX: 'auto'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '16px',
          color: COLORS.brown
        }}>
          📊 전략별 통계 비교
        </h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>지표</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.blue }}>Long</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.red }}>Short</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.gray }}>동일가중</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.orange }}>벤치마크</th>
            </tr>
          </thead>
          <tbody>
            {strategyStats.map((stat, idx) => (
              <tr key={idx} style={{ 
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
              }}>
                <td style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>{stat.metric}</td>
                <td style={{ padding: '12px', textAlign: 'right', color: COLORS.blue, fontWeight: '600' }}>
                  {stat.long.toFixed(2)}{stat.unit}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: COLORS.red }}>
                  {stat.short.toFixed(2)}{stat.unit}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {stat.ew.toFixed(2)}{stat.unit}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: COLORS.orange }}>
                  {stat.bm.toFixed(2)}{stat.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
