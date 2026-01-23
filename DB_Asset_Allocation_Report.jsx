/**
 * @title: DB자산배분 운용보고서
 * @description: DB생명 자산배분 펀드 운용 보고서 및 성과 분석
 * @category: 변액일임
 * @icon: 📑
 * @color: "#4E79A7"
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ComposedChart, Treemap, ScatterChart, Scatter
} from 'recharts';

// API Base URL (FastAPI 서버 Port 8000)
const API_BASE_URL = 'http://localhost:8000/api/v1';

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

// 자산군별 색상
const ASSET_COLORS = {
  '미국성장': COLORS.orange,
  '미국가치': COLORS.red,
  '선진국': COLORS.teal,
  '이머징': COLORS.green,
  '금': COLORS.yellow,
  '국내채권': COLORS.brown,
  '해외채권': COLORS.pink,
  '현금': COLORS.gray,
};

// ============================================================================
// 샘플 데이터 (API 연결 실패 시 폴백용)
// ============================================================================

// 펀드 데이터 (폴백)
const fundsFallback = [
  { code: '2JM57', name: 'DB70', type: '성장형' },
  { code: '3JM97', name: 'DB30', type: '안정형' },
  { code: '4JM41', name: 'DB이머징', type: '공격형' },
];

// 펀드별 성과 데이터 (폴백)
const fundPerformanceFallback = {
  'DB70': {
    nav: 12458.50,
    aum: 8950,
    ytd: 11.8,
    month1: 2.3,
    month3: 5.6,
    year1: 11.8,
    year3: 8.2,
    sharpe: 1.28,
    volatility: 9.5,
    mdd: -11.2,
    benchmark: '70/30 혼합',
    bmReturn: 10.5
  },
  'DB30': {
    nav: 11235.80,
    aum: 6420,
    ytd: 5.8,
    month1: 1.2,
    month3: 2.8,
    year1: 5.8,
    year3: 4.5,
    sharpe: 0.95,
    volatility: 5.2,
    mdd: -6.5,
    benchmark: '30/70 혼합',
    bmReturn: 5.2
  },
  'DBイマージング': {
    nav: 13825.20,
    aum: 4850,
    ytd: 15.2,
    month1: 3.5,
    month3: 7.8,
    year1: 15.2,
    year3: 10.8,
    sharpe: 1.45,
    volatility: 12.8,
    mdd: -15.8,
    benchmark: '이머징 지수',
    bmReturn: 14.0
  }
};

// 자산배분 현황 (DB70) (폴백)
const assetAllocationFallback = [
  { asset: '미국성장', weight: 22.5, return: 18.2, benchmark: 20.0 },
  { asset: '미국가치', weight: 18.0, return: 12.5, benchmark: 18.0 },
  { asset: '선진국', weight: 15.5, return: 10.8, benchmark: 15.0 },
  { asset: '이머징', weight: 14.0, return: 8.5, benchmark: 12.0 },
  { asset: '국내채권', weight: 20.0, return: 3.8, benchmark: 22.0 },
  { asset: '해외채권', weight: 8.0, return: 4.2, benchmark: 10.0 },
  { asset: '금', weight: 2.0, return: 14.2, benchmark: 3.0 },
];

// 월별 수익률 추이 (폴백)
const monthlyReturnsFallback = [
  { month: '2024-07', db70: 2.8, db30: 1.5, emerging: 3.2, bm70: 2.5, bm30: 1.3 },
  { month: '2024-08', db70: -1.2, db30: -0.5, emerging: -1.8, bm70: -1.5, bm30: -0.6 },
  { month: '2024-09', db70: 3.5, db30: 2.1, emerging: 4.2, bm70: 3.2, bm30: 2.0 },
  { month: '2024-10', db70: 1.8, db30: 1.0, emerging: 2.5, bm70: 1.5, bm30: 0.9 },
  { month: '2024-11', db70: 2.5, db30: 1.5, emerging: 3.0, bm70: 2.3, bm30: 1.4 },
  { month: '2024-12', db70: 1.2, db30: 0.8, emerging: 1.8, bm70: 1.0, bm30: 0.7 },
  { month: '2025-01', db70: 2.3, db30: 1.2, emerging: 3.5, bm70: 2.0, bm30: 1.1 },
];

// 누적 수익률 (폴백)
const cumulativeReturnsFallback = [
  { date: '2024-07', db70: 100, db30: 100, emerging: 100, bm70: 100, bm30: 100 },
  { date: '2024-08', db70: 102.8, db30: 101.5, emerging: 103.2, bm70: 102.5, bm30: 101.3 },
  { date: '2024-09', db70: 101.5, db30: 101.0, emerging: 101.3, bm70: 100.9, bm30: 100.7 },
  { date: '2024-10', db70: 105.1, db30: 103.1, emerging: 105.6, bm70: 104.2, bm30: 102.7 },
  { date: '2024-11', db70: 107.0, db30: 104.1, emerging: 108.2, bm70: 105.8, bm30: 103.6 },
  { date: '2024-12', db70: 109.7, db30: 105.7, emerging: 111.4, bm70: 108.2, bm30: 105.1 },
  { date: '2025-01', db70: 111.0, db30: 106.5, emerging: 113.4, bm70: 109.3, bm30: 105.8 },
  { date: '2025-02', db70: 113.6, db30: 107.8, emerging: 117.3, bm70: 111.5, bm30: 107.0 },
];

// 섹터별 배분 (미국 주식) (폴백)
const sectorAllocationFallback = [
  { sector: '기술', weight: 28.5, color: COLORS.blue },
  { sector: '금융', weight: 18.2, color: COLORS.orange },
  { sector: '헬스케어', weight: 15.8, color: COLORS.red },
  { sector: '소비재', weight: 12.5, color: COLORS.green },
  { sector: '산업재', weight: 10.2, color: COLORS.teal },
  { sector: '에너지', weight: 8.5, color: COLORS.yellow },
  { sector: '기타', weight: 6.3, color: COLORS.gray },
];

// 리스크 지표 (폴백)
const riskMetricsFallback = [
  { metric: '수익률', db70: 85, db30: 68, emerging: 92, target: 80 },
  { metric: '변동성', db70: 72, db30: 58, emerging: 88, target: 70 },
  { metric: 'Sharpe', db70: 88, db30: 75, emerging: 90, target: 85 },
  { metric: 'MDD관리', db70: 78, db30: 85, emerging: 70, target: 80 },
  { metric: '다각화', db70: 90, db30: 88, emerging: 75, target: 85 },
];

// 자산군별 기여도 (폴백)
const assetContributionFallback = [
  { asset: '미국성장', contribution: 4.10, weight: 22.5 },
  { asset: '미국가치', contribution: 2.25, weight: 18.0 },
  { asset: '선진국', contribution: 1.67, weight: 15.5 },
  { asset: '이머징', contribution: 1.19, weight: 14.0 },
  { asset: '금', contribution: 0.28, weight: 2.0 },
  { asset: '국내채권', contribution: 0.76, weight: 20.0 },
  { asset: '해외채권', contribution: 0.34, weight: 8.0 },
];

export default function DBAssetAllocationReport() {
  // State 관리
  const [selectedFund, setSelectedFund] = useState('DB70');
  const [viewMode, setViewMode] = useState('overview');
  
  // API 데이터 상태
  const [funds, setFunds] = useState(fundsFallback);
  const [fundPerformance, setFundPerformance] = useState(fundPerformanceFallback);
  const [assetAllocation, setAssetAllocation] = useState(assetAllocationFallback);
  const [monthlyReturns, setMonthlyReturns] = useState(monthlyReturnsFallback);
  const [cumulativeReturns, setCumulativeReturns] = useState(cumulativeReturnsFallback);
  const [sectorAllocation, setSectorAllocation] = useState(sectorAllocationFallback);
  const [riskMetrics, setRiskMetrics] = useState(riskMetricsFallback);
  const [assetContribution, setAssetContribution] = useState(assetContributionFallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [fundsRes, perfRes, allocRes, monthlyRes, cumulativeRes, sectorRes, riskRes, contribRes] = await Promise.all([
          fetch(`${API_BASE_URL}/db-asset-allocation/funds`).catch(() => null),
          fetch(`${API_BASE_URL}/db-asset-allocation/performance`).catch(() => null),
          fetch(`${API_BASE_URL}/db-asset-allocation/allocation?fund_code=${selectedFund}`).catch(() => null),
          fetch(`${API_BASE_URL}/db-asset-allocation/monthly-returns`).catch(() => null),
          fetch(`${API_BASE_URL}/db-asset-allocation/cumulative-returns`).catch(() => null),
          fetch(`${API_BASE_URL}/db-asset-allocation/sector`).catch(() => null),
          fetch(`${API_BASE_URL}/db-asset-allocation/risk-metrics`).catch(() => null),
          fetch(`${API_BASE_URL}/db-asset-allocation/contribution?fund_code=${selectedFund}`).catch(() => null)
        ]);

        // 성공한 응답만 처리
        if (fundsRes?.ok) {
          const data = await fundsRes.json();
          if (data.funds) setFunds(data.funds);
        }
        if (perfRes?.ok) {
          const data = await perfRes.json();
          setFundPerformance(data);
        }
        if (allocRes?.ok) {
          const data = await allocRes.json();
          if (data.assets) setAssetAllocation(data.assets);
        }
        if (monthlyRes?.ok) {
          const data = await monthlyRes.json();
          if (data.returns) setMonthlyReturns(data.returns);
        }
        if (cumulativeRes?.ok) {
          const data = await cumulativeRes.json();
          if (data.cumulative) setCumulativeReturns(data.cumulative);
        }
        if (sectorRes?.ok) {
          const data = await sectorRes.json();
          if (data.sectors) setSectorAllocation(data.sectors);
        }
        if (riskRes?.ok) {
          const data = await riskRes.json();
          if (data.metrics) setRiskMetrics(data.metrics);
        }
        if (contribRes?.ok) {
          const data = await contribRes.json();
          if (data.contributions) setAssetContribution(data.contributions);
        }

        console.log('✅ DB자산배분 API 데이터 로드 완료');
      } catch (err) {
        console.warn('⚠️ DB자산배분 API 연결 실패, 폴백 데이터 사용:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedFund]);

  // 선택된 펀드 정보
  const currentFund = fundPerformance[selectedFund];

  // 초과수익률
  const excessReturn = currentFund.year1 - currentFund.bmReturn;

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
          📑 DB자산배분 운용보고서
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem', margin: 0 }}>
          DB생명 자산배분 펀드 운용 보고서 및 성과 분석
        </p>
      </div>

      {/* 펀드 선택 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '32px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {Object.keys(fundPerformance).map((fund) => (
          <button
            key={fund}
            onClick={() => setSelectedFund(fund)}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: selectedFund === fund ? `2px solid ${COLORS.blue}` : '1px solid rgba(255,255,255,0.2)',
              background: selectedFund === fund 
                ? `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.teal})` 
                : 'rgba(255,255,255,0.05)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '700',
              transition: 'all 0.3s'
            }}
          >
            {fund}
          </button>
        ))}
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
          border: `2px solid ${COLORS.blue}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>순자산가치(NAV)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.blue }}>
            {currentFund.nav.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '4px' }}>원</div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.orange}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>순자산총액</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.orange }}>
            {currentFund.aum.toLocaleString()}억
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.green}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>1년 수익률</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.green }}>
            +{currentFund.year1.toFixed(1)}%
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
            {currentFund.sharpe.toFixed(2)}
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
            {currentFund.mdd.toFixed(1)}%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.teal}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>초과수익률</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.teal }}>
            +{excessReturn.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '4px' }}>vs {currentFund.benchmark}</div>
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
          { id: 'allocation', label: '🎯 자산배분' },
          { id: 'performance', label: '📈 성과' }
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: viewMode === mode.id ? `2px solid ${COLORS.orange}` : '1px solid rgba(255,255,255,0.2)',
              background: viewMode === mode.id 
                ? `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.red})` 
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
          {/* 누적 수익률 & 월별 수익률 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* 누적 수익률 */}
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
                📈 누적 수익률 추이
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={cumulativeReturns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="date" stroke="#aaa" />
                  <YAxis domain={[98, 120]} stroke="#aaa" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(26, 26, 46, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="db70" stroke={COLORS.blue} strokeWidth={3} name="DB70" />
                  <Line type="monotone" dataKey="db30" stroke={COLORS.orange} strokeWidth={2} name="DB30" />
                  <Line type="monotone" dataKey="emerging" stroke={COLORS.green} strokeWidth={2} name="DB이머징" />
                  <Line type="monotone" dataKey="bm70" stroke={COLORS.gray} strokeWidth={2} strokeDasharray="5 5" name="BM 70/30" />
                </LineChart>
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
                color: COLORS.green
              }}>
                📊 월별 수익률
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyReturns}>
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
                  <Bar dataKey="db70" fill={COLORS.blue} name="DB70" />
                  <Bar dataKey="bm70" fill={COLORS.gray} name="BM 70/30" opacity={0.5} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 리스크 프로파일 */}
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
              color: COLORS.red
            }}>
              ⚡ 리스크 프로파일
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px'
            }}>
              {/* 주요 리스크 지표 */}
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: COLORS.teal }}>주요 지표</h3>
                {[
                  { label: '변동성', value: currentFund.volatility, unit: '%', color: COLORS.orange },
                  { label: 'Sharpe Ratio', value: currentFund.sharpe, unit: '', color: COLORS.purple },
                  { label: 'MDD', value: currentFund.mdd, unit: '%', color: COLORS.red },
                ].map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px',
                    marginBottom: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${item.color}`
                  }}>
                    <span style={{ color: '#aaa' }}>{item.label}</span>
                    <span style={{ fontWeight: '700', color: item.color }}>
                      {typeof item.value === 'number' ? item.value.toFixed(2) : item.value}{item.unit}
                    </span>
                  </div>
                ))}
              </div>

              {/* 벤치마크 대비 */}
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', color: COLORS.teal }}>벤치마크 대비</h3>
                {[
                  { label: '벤치마크', value: currentFund.benchmark },
                  { label: 'BM 수익률', value: `${currentFund.bmReturn.toFixed(1)}%` },
                  { label: '초과수익', value: `${excessReturn.toFixed(1)}%`, highlight: true },
                ].map((item, idx) => (
                  <div key={idx} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px',
                    marginBottom: '8px',
                    background: item.highlight ? 'rgba(89, 161, 79, 0.1)' : 'rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    borderLeft: item.highlight ? `4px solid ${COLORS.green}` : '4px solid transparent'
                  }}>
                    <span style={{ color: '#aaa' }}>{item.label}</span>
                    <span style={{ 
                      fontWeight: item.highlight ? '700' : '600', 
                      color: item.highlight ? COLORS.green : 'white' 
                    }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 자산배분 뷰 */}
      {viewMode === 'allocation' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}>
          {/* 자산군별 배분 */}
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
              🎯 자산군별 배분
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ asset, weight }) => `${asset} ${weight}%`}
                  outerRadius={130}
                  dataKey="weight"
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ASSET_COLORS[entry.asset] || COLORS.gray} />
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

          {/* 자산별 기여도 */}
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '16px',
              color: COLORS.teal
            }}>
              💎 자산별 수익 기여도
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={assetContribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="#aaa" />
                <YAxis dataKey="asset" type="category" stroke="#aaa" width={80} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(26, 26, 46, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="contribution" name="기여도 (%)">
                  {assetContribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ASSET_COLORS[entry.asset] || COLORS.gray} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 섹터별 배분 */}
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
              🏢 섹터별 배분 (미국 주식)
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={sectorAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ sector, weight }) => `${sector} ${weight}%`}
                  outerRadius={130}
                  dataKey="weight"
                >
                  {sectorAllocation.map((entry, index) => (
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

          {/* 실제 vs 목표 배분 */}
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
              📊 실제 vs 목표 배분
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={assetAllocation}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="asset" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(26, 26, 46, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="weight" fill={COLORS.blue} name="실제 배분" />
                <Bar dataKey="benchmark" fill={COLORS.gray} name="목표 배분" opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 성과 뷰 */}
      {viewMode === 'performance' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}>
          {/* 기간별 수익률 */}
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
              📅 기간별 수익률
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={[
                { period: '1개월', value: currentFund.month1 },
                { period: '3개월', value: currentFund.month3 },
                { period: 'YTD', value: currentFund.ytd },
                { period: '1년', value: currentFund.year1 },
                { period: '3년(연)', value: currentFund.year3 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="period" stroke="#aaa" />
                <YAxis stroke="#aaa" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(26, 26, 46, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" fill={COLORS.blue} name="수익률 (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* 자산별 수익률 */}
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
              💰 자산별 수익률
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={assetAllocation} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="#aaa" />
                <YAxis dataKey="asset" type="category" stroke="#aaa" width={80} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(26, 26, 46, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="return" name="수익률 (%)">
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={ASSET_COLORS[entry.asset] || COLORS.gray} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 자산배분 상세 테이블 */}
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
          📋 자산배분 상세 ({selectedFund})
        </h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>자산군</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>실제 비중 (%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>목표 비중 (%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>수익률 (%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>기여도 (%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>비중 차이</th>
            </tr>
          </thead>
          <tbody>
            {assetAllocation.map((asset, idx) => {
              const diff = asset.weight - asset.benchmark;
              const contribution = assetContribution.find(a => a.asset === asset.asset)?.contribution || 0;
              
              return (
                <tr key={idx} style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
                }}>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'left', 
                    fontWeight: '700',
                    color: ASSET_COLORS[asset.asset] || COLORS.gray
                  }}>
                    {asset.asset}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>
                    {asset.weight.toFixed(1)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: '#aaa' }}>
                    {asset.benchmark.toFixed(1)}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'right',
                    color: asset.return >= 0 ? COLORS.green : COLORS.red,
                    fontWeight: '600'
                  }}>
                    {asset.return >= 0 ? '+' : ''}{asset.return.toFixed(1)}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'right',
                    color: COLORS.blue,
                    fontWeight: '600'
                  }}>
                    {contribution.toFixed(2)}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'right',
                    color: diff >= 0 ? COLORS.green : COLORS.red,
                    fontWeight: '600'
                  }}>
                    {diff >= 0 ? '+' : ''}{diff.toFixed(1)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 펀드 비교 테이블 */}
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
          📊 펀드별 성과 비교
        </h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>펀드</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>NAV</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>AUM (억)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>1개월 (%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>YTD (%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>1년 (%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>Sharpe</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>MDD (%)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(fundPerformance).map(([fund, data], idx) => (
              <tr key={idx} style={{ 
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: fund === selectedFund ? 'rgba(78, 121, 167, 0.1)' : 
                           (idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent')
              }}>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'left',
                  fontWeight: fund === selectedFund ? '700' : '600',
                  color: fund === selectedFund ? COLORS.blue : 'inherit'
                }}>
                  {fund}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {data.nav.toLocaleString()}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {data.aum.toLocaleString()}
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'right',
                  color: data.month1 >= 0 ? COLORS.green : COLORS.red,
                  fontWeight: '600'
                }}>
                  {data.month1 >= 0 ? '+' : ''}{data.month1.toFixed(1)}
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'right',
                  color: data.ytd >= 0 ? COLORS.green : COLORS.red,
                  fontWeight: '600'
                }}>
                  {data.ytd >= 0 ? '+' : ''}{data.ytd.toFixed(1)}
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'right',
                  color: COLORS.green,
                  fontWeight: '700'
                }}>
                  +{data.year1.toFixed(1)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: COLORS.purple }}>
                  {data.sharpe.toFixed(2)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: COLORS.red }}>
                  {data.mdd.toFixed(1)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
