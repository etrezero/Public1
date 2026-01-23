/**
 * @title: TDF 포커스 성과분석
 * @description: TDF 포트폴리오 성과 분석 및 자산군별 수익률 비교
 * @category: TDF
 * @icon: 📈
 * @color: "#F28E2B"
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ComposedChart, ScatterChart, Scatter
} from 'recharts';

// API 설정
const API_BASE_URL = 'http://localhost:9011/api/v1';

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

const CHART_COLORS = [
  '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
  '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC'
];

// 자산군 색상 매핑
const ASSET_COLORS = {
  'US_Growth': COLORS.blue,
  'US_Value': COLORS.orange,
  'DM_exUS': COLORS.green,
  'EM': COLORS.red,
  '금': COLORS.yellow,
  '국내채권': COLORS.teal,
  'ACWI': COLORS.purple,
  'BND': COLORS.brown,
};

// 샘플 데이터 - 누적 수익률
const cumulativeReturns = [
  { date: '2023-01', growth: 100, value: 100, dm: 100, em: 100, gold: 100, bond: 100 },
  { date: '2023-04', growth: 108, value: 105, dm: 104, em: 102, gold: 103, bond: 101 },
  { date: '2023-07', growth: 115, value: 109, dm: 107, em: 105, gold: 106, bond: 102 },
  { date: '2023-10', growth: 122, value: 113, dm: 110, em: 108, gold: 109, bond: 103 },
  { date: '2024-01', growth: 130, value: 117, dm: 113, em: 110, gold: 112, bond: 104 },
  { date: '2024-04', growth: 138, value: 121, dm: 116, em: 113, gold: 115, bond: 105 },
  { date: '2024-07', growth: 145, value: 125, dm: 119, em: 116, gold: 118, bond: 106 },
  { date: '2024-10', growth: 152, value: 129, dm: 122, em: 119, gold: 121, bond: 107 },
  { date: '2025-01', growth: 160, value: 133, dm: 125, em: 122, gold: 124, bond: 108 },
];

// 월별 수익률
const monthlyReturns = [
  { month: '2024-07', growth: 2.8, value: 1.8, dm: 1.5, em: 1.2, gold: 1.5, bond: 0.5 },
  { month: '2024-08', growth: 3.2, value: 2.1, dm: 1.8, em: 1.5, gold: 1.2, bond: 0.6 },
  { month: '2024-09', growth: -1.5, value: -0.8, dm: -0.5, em: -1.2, gold: 0.8, bond: 0.4 },
  { month: '2024-10', growth: 2.5, value: 1.6, dm: 1.3, em: 1.0, gold: 1.1, bond: 0.5 },
  { month: '2024-11', growth: 3.8, value: 2.3, dm: 1.9, em: 1.6, gold: 1.3, bond: 0.6 },
  { month: '2024-12', growth: 1.8, value: 1.2, dm: 1.0, em: 0.8, gold: 1.0, bond: 0.5 },
  { month: '2025-01', growth: 2.9, value: 1.8, dm: 1.5, em: 1.3, gold: 1.2, bond: 0.6 },
];

// 자산군별 성과 요약
const assetPerformance = [
  { 
    asset: 'US Growth', 
    code: 'US_Growth',
    ytd: 8.5, 
    oneYear: 18.2, 
    threeYear: 12.8,
    volatility: 15.8,
    sharpe: 1.15,
    maxDrawdown: -18.5,
    color: ASSET_COLORS['US_Growth']
  },
  { 
    asset: 'US Value', 
    code: 'US_Value',
    ytd: 5.8, 
    oneYear: 12.5, 
    threeYear: 9.2,
    volatility: 12.3,
    sharpe: 1.02,
    maxDrawdown: -14.2,
    color: ASSET_COLORS['US_Value']
  },
  { 
    asset: 'DM ex-US', 
    code: 'DM_exUS',
    ytd: 4.5, 
    oneYear: 10.8, 
    threeYear: 7.5,
    volatility: 13.5,
    sharpe: 0.80,
    maxDrawdown: -16.3,
    color: ASSET_COLORS['DM_exUS']
  },
  { 
    asset: 'Emerging Markets', 
    code: 'EM',
    ytd: 3.2, 
    oneYear: 8.5, 
    threeYear: 6.2,
    volatility: 18.5,
    sharpe: 0.46,
    maxDrawdown: -22.8,
    color: ASSET_COLORS['EM']
  },
  { 
    asset: '금', 
    code: '금',
    ytd: 6.8, 
    oneYear: 14.2, 
    threeYear: 8.5,
    volatility: 11.2,
    sharpe: 1.27,
    maxDrawdown: -9.5,
    color: ASSET_COLORS['금']
  },
  { 
    asset: '국내채권', 
    code: '국내채권',
    ytd: 2.1, 
    oneYear: 4.5, 
    threeYear: 3.2,
    volatility: 3.8,
    sharpe: 1.18,
    maxDrawdown: -3.2,
    color: ASSET_COLORS['국내채권']
  },
];

// 상관관계 히트맵 데이터
const correlationData = [
  { asset1: 'Growth', asset2: 'Growth', value: 1.00 },
  { asset1: 'Growth', asset2: 'Value', value: 0.85 },
  { asset1: 'Growth', asset2: 'DM', value: 0.72 },
  { asset1: 'Growth', asset2: 'EM', value: 0.65 },
  { asset1: 'Growth', asset2: 'Gold', value: -0.12 },
  { asset1: 'Growth', asset2: 'Bond', value: -0.35 },
  
  { asset1: 'Value', asset2: 'Growth', value: 0.85 },
  { asset1: 'Value', asset2: 'Value', value: 1.00 },
  { asset1: 'Value', asset2: 'DM', value: 0.78 },
  { asset1: 'Value', asset2: 'EM', value: 0.68 },
  { asset1: 'Value', asset2: 'Gold', value: -0.08 },
  { asset1: 'Value', asset2: 'Bond', value: -0.28 },
];

// 리스크-수익률 산점도 데이터
const riskReturnData = assetPerformance.map(asset => ({
  asset: asset.asset,
  risk: asset.volatility,
  return: asset.oneYear,
  sharpe: asset.sharpe,
  color: asset.color
}));

export default function FocusPerformanceAnalysis() {
  const [selectedPeriod, setSelectedPeriod] = useState('1Y');
  const [sortBy, setSortBy] = useState('oneYear');
  const [showAssets, setShowAssets] = useState({
    growth: true,
    value: true,
    dm: true,
    em: true,
    gold: true,
    bond: true
  });
  
  // API 데이터 상태
  const [correlationMatrix, setCorrelationMatrix] = useState(null);
  const [assetReturns, setAssetReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 상관관계 데이터 로드
  useEffect(() => {
    const fetchCorrelationData = async () => {
      try {
        setLoading(true);
        
        // 상관관계 매트릭스 조회
        const response = await fetch(`${API_BASE_URL}/market/correlation?lookback_days=252`);
        if (!response.ok) throw new Error('상관관계 데이터 조회 실패');
        
        const data = await response.json();
        setCorrelationMatrix(data.correlation);
        
        // 자산 클래스 수익률 조회
        const returnsResponse = await fetch(`${API_BASE_URL}/market/asset-returns`);
        if (returnsResponse.ok) {
          const returnsData = await returnsResponse.json();
          setAssetReturns(returnsData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('상관관계 데이터 조회 오류:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCorrelationData();
  }, []);

  // 샘플 데이터 (백업용 - API 실패 시)
  const fallbackCumulativeReturns = [
    { date: '2023-01', growth: 100, value: 100, dm: 100, em: 100, gold: 100, bond: 100 },
    { date: '2023-04', growth: 108, value: 105, dm: 104, em: 102, gold: 103, bond: 101 },
    { date: '2023-07', growth: 115, value: 109, dm: 107, em: 105, gold: 106, bond: 102 },
    { date: '2023-10', growth: 122, value: 113, dm: 110, em: 108, gold: 109, bond: 103 },
    { date: '2024-01', growth: 130, value: 117, dm: 113, em: 110, gold: 112, bond: 104 },
    { date: '2024-04', growth: 138, value: 121, dm: 116, em: 113, gold: 115, bond: 105 },
    { date: '2024-07', growth: 145, value: 125, dm: 119, em: 116, gold: 118, bond: 106 },
    { date: '2024-10', growth: 152, value: 129, dm: 122, em: 119, gold: 121, bond: 107 },
    { date: '2025-01', growth: 160, value: 133, dm: 125, em: 122, gold: 124, bond: 108 },
  ];

  const fallbackAssetPerformance = [
    { 
      asset: 'US Growth', 
      code: 'US_Growth',
      ytd: 8.5, 
      oneYear: 18.2, 
      threeYear: 12.8,
      volatility: 15.8,
      sharpe: 1.15,
      maxDrawdown: -18.5,
      color: ASSET_COLORS['US_Growth']
    },
    { 
      asset: 'US Value', 
      code: 'US_Value',
      ytd: 5.8, 
      oneYear: 12.5, 
      threeYear: 9.2,
      volatility: 12.3,
      sharpe: 1.02,
      maxDrawdown: -14.2,
      color: ASSET_COLORS['US_Value']
    },
    { 
      asset: 'DM ex-US', 
      code: 'DM_exUS',
      ytd: 4.5, 
      oneYear: 10.8, 
      threeYear: 7.5,
      volatility: 13.5,
      sharpe: 0.80,
      maxDrawdown: -16.3,
      color: ASSET_COLORS['DM_exUS']
    },
    { 
      asset: 'Emerging Markets', 
      code: 'EM',
      ytd: 3.2, 
      oneYear: 8.5, 
      threeYear: 6.2,
      volatility: 18.5,
      sharpe: 0.46,
      maxDrawdown: -22.8,
      color: ASSET_COLORS['EM']
    },
    { 
      asset: '금', 
      code: '금',
      ytd: 6.8, 
      oneYear: 14.2, 
      threeYear: 8.5,
      volatility: 11.2,
      sharpe: 1.27,
      maxDrawdown: -9.5,
      color: ASSET_COLORS['금']
    },
    { 
      asset: '국내채권', 
      code: '국내채권',
      ytd: 2.1, 
      oneYear: 4.5, 
      threeYear: 3.2,
      volatility: 3.8,
      sharpe: 1.18,
      maxDrawdown: -3.2,
      color: ASSET_COLORS['국내채권']
    },
  ];

  // API 데이터 우선 사용, 없으면 fallback
  const assetPerformance = assetReturns.length > 0 ? assetReturns : fallbackAssetPerformance;
  const cumulativeReturns = fallbackCumulativeReturns; // 누적 수익률은 fallback 사용

  // 리스크-수익률 산점도 데이터
  const riskReturnData = assetPerformance.map(asset => ({
    asset: asset.asset,
    risk: asset.volatility,
    return: asset.oneYear,
    sharpe: asset.sharpe,
    color: asset.color
  }));

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#e8e8e8'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📊</div>
          <div style={{ fontSize: '20px' }}>상관관계 데이터 로딩 중...</div>
        </div>
      </div>
    );
  }

  // 정렬된 자산 데이터
  const sortedAssets = useMemo(() => {
    return [...assetPerformance].sort((a, b) => {
      if (sortBy === 'ytd') return b.ytd - a.ytd;
      if (sortBy === 'oneYear') return b.oneYear - a.oneYear;
      if (sortBy === 'threeYear') return b.threeYear - a.threeYear;
      if (sortBy === 'sharpe') return b.sharpe - a.sharpe;
      return 0;
    });
  }, [sortBy]);

  // 통계 요약
  const summary = useMemo(() => {
    const avgReturn = assetPerformance.reduce((sum, a) => sum + a.oneYear, 0) / assetPerformance.length;
    const maxReturn = Math.max(...assetPerformance.map(a => a.oneYear));
    const minReturn = Math.min(...assetPerformance.map(a => a.oneYear));
    const avgSharpe = assetPerformance.reduce((sum, a) => sum + a.sharpe, 0) / assetPerformance.length;
    
    return { avgReturn, maxReturn, minReturn, avgSharpe };
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
          background: `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.red})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          📈 TDF 포커스 성과분석
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem', margin: 0 }}>
          TDF 포트폴리오 성과 분석 및 자산군별 수익률 비교
        </p>
      </div>

      {/* 기간 선택 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '32px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'YTD', label: 'YTD' },
          { key: '1Y', label: '1년' },
          { key: '3Y', label: '3년' },
          { key: 'ALL', label: '전체' }
        ].map((period) => (
          <button
            key={period.key}
            onClick={() => setSelectedPeriod(period.key)}
            style={{
              padding: '12px 28px',
              borderRadius: '8px',
              border: selectedPeriod === period.key ? `2px solid ${COLORS.orange}` : '1px solid rgba(255,255,255,0.2)',
              background: selectedPeriod === period.key 
                ? `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.red})` 
                : 'rgba(255,255,255,0.05)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '700',
              transition: 'all 0.3s'
            }}
          >
            {period.label}
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
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>평균 수익률</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.green }}>
            +{summary.avgReturn.toFixed(1)}%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.blue}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>최고 수익률</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.blue }}>
            +{summary.maxReturn.toFixed(1)}%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.red}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>최저 수익률</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.red }}>
            +{summary.minReturn.toFixed(1)}%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.teal}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>평균 Sharpe</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.teal }}>
            {summary.avgSharpe.toFixed(2)}
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
          color: COLORS.orange
        }}>
          📊 자산군별 누적 수익률
        </h2>
        <ResponsiveContainer width="100%" height={450}>
          <AreaChart data={cumulativeReturns}>
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
            <Area type="monotone" dataKey="growth" name="US Growth" stackId="1" stroke={COLORS.blue} fill={COLORS.blue} fillOpacity={0.6} />
            <Area type="monotone" dataKey="value" name="US Value" stackId="2" stroke={COLORS.orange} fill={COLORS.orange} fillOpacity={0.6} />
            <Area type="monotone" dataKey="dm" name="DM ex-US" stackId="3" stroke={COLORS.green} fill={COLORS.green} fillOpacity={0.6} />
            <Area type="monotone" dataKey="em" name="EM" stackId="4" stroke={COLORS.red} fill={COLORS.red} fillOpacity={0.6} />
            <Area type="monotone" dataKey="gold" name="금" stackId="5" stroke={COLORS.yellow} fill={COLORS.yellow} fillOpacity={0.6} />
            <Area type="monotone" dataKey="bond" name="국내채권" stackId="6" stroke={COLORS.teal} fill={COLORS.teal} fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 월별 수익률 & 리스크-수익률 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
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
            color: COLORS.blue
          }}>
            📈 월별 수익률 추이
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyReturns}>
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
              <Line type="monotone" dataKey="growth" name="Growth" stroke={COLORS.blue} strokeWidth={2} />
              <Line type="monotone" dataKey="value" name="Value" stroke={COLORS.orange} strokeWidth={2} />
              <Line type="monotone" dataKey="dm" name="DM" stroke={COLORS.green} strokeWidth={2} />
              <Line type="monotone" dataKey="em" name="EM" stroke={COLORS.red} strokeWidth={2} />
              <Line type="monotone" dataKey="gold" name="Gold" stroke={COLORS.yellow} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 리스크-수익률 산점도 */}
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
            ⚡ 리스크-수익률 분석
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                type="number" 
                dataKey="risk" 
                name="변동성" 
                stroke="#aaa"
                label={{ value: '변동성 (%)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                type="number" 
                dataKey="return" 
                name="수익률" 
                stroke="#aaa"
                label={{ value: '수익률 (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(26, 26, 46, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
                formatter={(value, name) => {
                  if (name === '변동성') return `${value.toFixed(1)}%`;
                  if (name === '수익률') return `${value.toFixed(1)}%`;
                  return value;
                }}
              />
              <Scatter name="자산군" data={riskReturnData}>
                {riskReturnData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 정렬 버튼 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <span style={{ fontSize: '1rem', fontWeight: '600', color: COLORS.teal, marginRight: '12px' }}>
          정렬:
        </span>
        {[
          { key: 'ytd', label: 'YTD' },
          { key: 'oneYear', label: '1년' },
          { key: 'threeYear', label: '3년' },
          { key: 'sharpe', label: 'Sharpe' }
        ].map((sort) => (
          <button
            key={sort.key}
            onClick={() => setSortBy(sort.key)}
            style={{
              padding: '8px 20px',
              borderRadius: '6px',
              border: sortBy === sort.key ? `2px solid ${COLORS.green}` : '1px solid rgba(255,255,255,0.2)',
              background: sortBy === sort.key 
                ? COLORS.green
                : 'rgba(255,255,255,0.05)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
          >
            {sort.label}
          </button>
        ))}
      </div>

      {/* 자산군별 성과 바차트 */}
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
          💎 자산군별 1년 수익률
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sortedAssets} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" stroke="#aaa" />
            <YAxis dataKey="asset" type="category" stroke="#aaa" width={150} />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(26, 26, 46, 0.95)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
            />
            <Bar dataKey="oneYear" name="1년 수익률 (%)">
              {sortedAssets.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 자산군별 상세 테이블 */}
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
          color: COLORS.yellow
        }}>
          📋 자산군별 성과 상세
        </h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>자산군</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>YTD (%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>1년 (%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>3년 (%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>변동성 (%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>Sharpe</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>MDD (%)</th>
            </tr>
          </thead>
          <tbody>
            {sortedAssets.map((asset, idx) => (
              <tr key={idx} style={{ 
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
              }}>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'left', 
                  fontWeight: '700',
                  color: asset.color
                }}>
                  {asset.asset}
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'right',
                  color: asset.ytd >= 0 ? COLORS.green : COLORS.red,
                  fontWeight: '600'
                }}>
                  {asset.ytd >= 0 ? '+' : ''}{asset.ytd.toFixed(1)}
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'right',
                  color: asset.oneYear >= 0 ? COLORS.green : COLORS.red,
                  fontWeight: '600'
                }}>
                  {asset.oneYear >= 0 ? '+' : ''}{asset.oneYear.toFixed(1)}
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'right',
                  fontWeight: '600'
                }}>
                  {asset.threeYear >= 0 ? '+' : ''}{asset.threeYear.toFixed(1)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {asset.volatility.toFixed(1)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600', color: COLORS.blue }}>
                  {asset.sharpe.toFixed(2)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: COLORS.red }}>
                  {asset.maxDrawdown.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
