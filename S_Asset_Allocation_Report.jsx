/**
 * @title: S자산배분 운용보고서
 * @description: 자산배분 포트폴리오 운용 성과 및 벤치마크 비교 분석
 * @category: 변액일임
 * @icon: 📊
 * @color: "#4E79A7"
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ComposedChart, Area, Radar, RadarChart,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
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
  pink: '#F28CB1',
  purple: '#B07AA1',
  gray: '#BAB0AC',
};

const CHART_COLORS = [
  '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
  '#EDC948', '#B07AA1', '#9C755F', '#BAB0AC', '#FF9DA7'
];

// ============================================================================
// 샘플 데이터 (API 연결 실패 시 폴백용)
// ============================================================================

// 샘플 데이터 - 포트폴리오 성과 (폴백)
const portfolioPerformanceFallback = [
  { 
    name: 'S자산배분 성장형',
    mtd: 2.45,
    qtd: 5.82,
    ytd: 12.34,
    oneYear: 15.67,
    threeYear: 8.92,
    aum: 12500,
    sharpeRatio: 1.25,
    maxDrawdown: -8.5,
    volatility: 9.8
  },
  { 
    name: 'S자산배분 안정형',
    mtd: 1.32,
    qtd: 3.45,
    ytd: 8.21,
    oneYear: 10.45,
    threeYear: 6.78,
    aum: 18300,
    sharpeRatio: 1.45,
    maxDrawdown: -5.2,
    volatility: 5.6
  },
  { 
    name: 'S자산배분 균형형',
    mtd: 1.89,
    qtd: 4.67,
    ytd: 10.56,
    oneYear: 13.21,
    threeYear: 7.89,
    aum: 15700,
    sharpeRatio: 1.35,
    maxDrawdown: -6.8,
    volatility: 7.5
  },
];

// 벤치마크 비교 데이터 (폴백)
const benchmarkComparisonFallback = [
  { period: 'MTD', portfolio: 2.45, benchmark: 2.12, outperformance: 0.33 },
  { period: 'QTD', portfolio: 5.82, benchmark: 5.23, outperformance: 0.59 },
  { period: 'YTD', portfolio: 12.34, benchmark: 11.45, outperformance: 0.89 },
  { period: '1년', portfolio: 15.67, benchmark: 14.52, outperformance: 1.15 },
  { period: '3년', portfolio: 8.92, benchmark: 8.12, outperformance: 0.80 },
];

// 자산 배분 데이터 (폴백)
const assetAllocationFallback = [
  { asset: '국내주식', current: 32.5, target: 35.0, benchmark: 30.0 },
  { asset: '해외주식', current: 28.3, target: 25.0, benchmark: 25.0 },
  { asset: '국내채권', current: 22.1, target: 20.0, benchmark: 25.0 },
  { asset: '해외채권', current: 10.5, target: 12.0, benchmark: 12.0 },
  { asset: '대체투자', current: 6.6, target: 8.0, benchmark: 8.0 },
];

// 자산별 기여도 (폴백)
const assetContributionFallback = [
  { asset: '국내주식', return: 3.8, weight: 32.5, contribution: 1.24 },
  { asset: '해외주식', return: 4.2, weight: 28.3, contribution: 1.19 },
  { asset: '국내채권', return: 1.5, weight: 22.1, contribution: 0.33 },
  { asset: '해외채권', return: 2.1, weight: 10.5, contribution: 0.22 },
  { asset: '대체투자', return: -0.8, weight: 6.6, contribution: -0.05 },
];

// 월별 수익률 추이 (폴백)
const monthlyReturnsFallback = [
  { month: '2025-07', portfolio: 2.1, benchmark: 1.8, difference: 0.3 },
  { month: '2025-08', portfolio: -1.2, benchmark: -1.5, difference: 0.3 },
  { month: '2025-09', portfolio: 3.5, benchmark: 3.1, difference: 0.4 },
  { month: '2025-10', portfolio: 1.8, benchmark: 1.6, difference: 0.2 },
  { month: '2025-11', portfolio: 2.9, benchmark: 2.5, difference: 0.4 },
  { month: '2025-12', portfolio: 1.5, benchmark: 1.8, difference: -0.3 },
  { month: '2026-01', portfolio: 2.4, benchmark: 2.1, difference: 0.3 },
];

// 리스크 지표 (폴백)
const riskMetricsFallback = [
  { metric: '수익률', portfolio: 8.92, benchmark: 8.12, subject: '3년 연평균' },
  { metric: '변동성', portfolio: 9.8, benchmark: 10.5, subject: '표준편차' },
  { metric: 'Sharpe', portfolio: 1.25, benchmark: 1.08, subject: '위험조정수익' },
  { metric: 'MDD', portfolio: -8.5, benchmark: -9.2, subject: '최대손실' },
  { metric: '승률', portfolio: 72, benchmark: 68, subject: '월간 양수비율' },
];

// 섹터 배분 (국내주식) (폴백)
const sectorAllocationFallback = [
  { sector: 'IT', weight: 28.5, color: COLORS.blue },
  { sector: '금융', weight: 18.2, color: COLORS.orange },
  { sector: '산업재', weight: 15.8, color: COLORS.green },
  { sector: '필수소비재', weight: 12.3, color: COLORS.teal },
  { sector: '헬스케어', weight: 10.5, color: COLORS.red },
  { sector: '기타', weight: 14.7, color: COLORS.gray },
];

export default function SAssetAllocationReport() {
  // State 관리
  const [selectedPortfolio, setSelectedPortfolio] = useState('성장형');
  const [timeFrame, setTimeFrame] = useState('ytd');
  
  // API 데이터 상태
  const [portfolioPerformance, setPortfolioPerformance] = useState(portfolioPerformanceFallback);
  const [benchmarkComparison, setBenchmarkComparison] = useState(benchmarkComparisonFallback);
  const [assetAllocation, setAssetAllocation] = useState(assetAllocationFallback);
  const [assetContribution, setAssetContribution] = useState(assetContributionFallback);
  const [monthlyReturns, setMonthlyReturns] = useState(monthlyReturnsFallback);
  const [riskMetrics, setRiskMetrics] = useState(riskMetricsFallback);
  const [sectorAllocation, setSectorAllocation] = useState(sectorAllocationFallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [perfRes, benchRes, allocRes, contribRes, monthlyRes, riskRes, sectorRes] = await Promise.all([
          fetch(`${API_BASE_URL}/s-asset-allocation/performance`).catch(() => null),
          fetch(`${API_BASE_URL}/s-asset-allocation/benchmark`).catch(() => null),
          fetch(`${API_BASE_URL}/s-asset-allocation/allocation`).catch(() => null),
          fetch(`${API_BASE_URL}/s-asset-allocation/contribution`).catch(() => null),
          fetch(`${API_BASE_URL}/s-asset-allocation/monthly-returns`).catch(() => null),
          fetch(`${API_BASE_URL}/s-asset-allocation/risk-metrics`).catch(() => null),
          fetch(`${API_BASE_URL}/s-asset-allocation/sector`).catch(() => null)
        ]);

        // 성공한 응답만 처리
        if (perfRes?.ok) {
          const data = await perfRes.json();
          if (data.portfolios) setPortfolioPerformance(data.portfolios);
        }
        if (benchRes?.ok) {
          const data = await benchRes.json();
          if (data.comparison) setBenchmarkComparison(data.comparison);
        }
        if (allocRes?.ok) {
          const data = await allocRes.json();
          if (data.assets) setAssetAllocation(data.assets);
        }
        if (contribRes?.ok) {
          const data = await contribRes.json();
          if (data.contributions) setAssetContribution(data.contributions);
        }
        if (monthlyRes?.ok) {
          const data = await monthlyRes.json();
          if (data.returns) setMonthlyReturns(data.returns);
        }
        if (riskRes?.ok) {
          const data = await riskRes.json();
          if (data.metrics) setRiskMetrics(data.metrics);
        }
        if (sectorRes?.ok) {
          const data = await sectorRes.json();
          if (data.sectors) setSectorAllocation(data.sectors);
        }

        console.log('✅ S자산배분 API 데이터 로드 완료');
      } catch (err) {
        console.warn('⚠️ S자산배분 API 연결 실패, 폴백 데이터 사용:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 선택된 포트폴리오 데이터
  const currentPortfolio = useMemo(() => {
    return portfolioPerformance.find(p => p.name.includes(selectedPortfolio)) || portfolioPerformance[0];
  }, [selectedPortfolio]);

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
          📊 S자산배분 운용보고서
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem', margin: 0 }}>
          자산배분 포트폴리오 운용 성과 및 벤치마크 비교 분석
        </p>
      </div>

      {/* 포트폴리오 선택 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '32px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {['성장형', '안정형', '균형형'].map((type) => (
          <button
            key={type}
            onClick={() => setSelectedPortfolio(type)}
            style={{
              padding: '12px 28px',
              borderRadius: '8px',
              border: selectedPortfolio === type ? `2px solid ${COLORS.blue}` : '1px solid rgba(255,255,255,0.2)',
              background: selectedPortfolio === type 
                ? `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.teal})` 
                : 'rgba(255,255,255,0.05)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '700',
              transition: 'all 0.3s'
            }}
          >
            {type}
          </button>
        ))}
      </div>

      {/* 성과 요약 카드 */}
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
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>MTD</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.blue }}>
            {currentPortfolio.mtd >= 0 ? '+' : ''}{currentPortfolio.mtd.toFixed(2)}%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.green}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>QTD</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.green }}>
            {currentPortfolio.qtd >= 0 ? '+' : ''}{currentPortfolio.qtd.toFixed(2)}%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.orange}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>YTD</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.orange }}>
            {currentPortfolio.ytd >= 0 ? '+' : ''}{currentPortfolio.ytd.toFixed(2)}%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.teal}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>1년</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.teal }}>
            {currentPortfolio.oneYear >= 0 ? '+' : ''}{currentPortfolio.oneYear.toFixed(2)}%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.purple}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>순자산</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.purple }}>
            {currentPortfolio.aum.toLocaleString()}억
          </div>
        </div>
      </div>

      {/* 벤치마크 비교 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
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
            📊 포트폴리오 vs 벤치마크
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={benchmarkComparison}>
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
              <Legend />
              <Bar dataKey="portfolio" name="포트폴리오" fill={COLORS.blue} />
              <Bar dataKey="benchmark" name="벤치마크" fill={COLORS.gray} opacity={0.6} />
            </BarChart>
          </ResponsiveContainer>
        </div>

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
            🎯 초과 수익률
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={benchmarkComparison}>
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
              <Bar dataKey="outperformance" name="초과수익률 (%p)">
                {benchmarkComparison.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.outperformance >= 0 ? COLORS.green : COLORS.red} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 자산 배분 현황 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
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
            🎯 자산 배분 현황
          </h2>
          <ResponsiveContainer width="100%" height={400}>
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
              <Legend />
              <Bar dataKey="current" name="현재" fill={COLORS.blue} />
              <Bar dataKey="target" name="목표" fill={COLORS.orange} opacity={0.6} />
              <Bar dataKey="benchmark" name="BM" fill={COLORS.gray} opacity={0.4} />
            </BarChart>
          </ResponsiveContainer>
        </div>

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
            💎 자산별 수익 기여도
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={assetContribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="asset" stroke="#aaa" angle={-15} textAnchor="end" height={80} />
              <YAxis stroke="#aaa" />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(26, 26, 46, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="contribution" name="기여도 (%)">
                {assetContribution.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.contribution >= 0 ? COLORS.green : COLORS.red} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 월별 수익률 추이 */}
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
          📈 월별 수익률 추이
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <ComposedChart data={monthlyReturns}>
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
            <Bar dataKey="portfolio" name="포트폴리오" fill={COLORS.blue} />
            <Bar dataKey="benchmark" name="벤치마크" fill={COLORS.gray} opacity={0.5} />
            <Line type="monotone" dataKey="difference" name="초과수익" stroke={COLORS.orange} strokeWidth={3} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 리스크 지표 & 섹터 배분 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* 리스크 지표 테이블 */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '16px',
            color: COLORS.red
          }}>
            ⚠️ 리스크 지표
          </h2>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.9rem'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>지표</th>
                <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>포트폴리오</th>
                <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>벤치마크</th>
                <th style={{ padding: '12px', textAlign: 'center', color: COLORS.teal }}>비고</th>
              </tr>
            </thead>
            <tbody>
              {riskMetrics.map((row, idx) => (
                <tr key={idx} style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
                }}>
                  <td style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>{row.metric}</td>
                  <td style={{ padding: '12px', textAlign: 'right', color: COLORS.blue, fontWeight: '600' }}>
                    {row.portfolio.toFixed(2)}{row.metric === 'Sharpe' ? '' : '%'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {row.benchmark.toFixed(2)}{row.metric === 'Sharpe' ? '' : '%'}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', color: '#aaa' }}>
                    {row.subject}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 섹터 배분 파이차트 */}
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            marginBottom: '16px',
            color: COLORS.yellow
          }}>
            🏢 섹터 배분 (국내주식)
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={sectorAllocation}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ sector, weight }) => `${sector} ${weight}%`}
                outerRadius={120}
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
      </div>

      {/* 포트폴리오 상세 정보 */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.1)'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '16px',
          color: COLORS.brown
        }}>
          📋 포트폴리오 상세 정보
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>Sharpe Ratio</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: COLORS.green }}>
              {currentPortfolio.sharpeRatio.toFixed(2)}
            </div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>최대손실폭 (MDD)</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: COLORS.red }}>
              {currentPortfolio.maxDrawdown.toFixed(2)}%
            </div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>변동성</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: COLORS.orange }}>
              {currentPortfolio.volatility.toFixed(1)}%
            </div>
          </div>
          <div style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
            <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>3년 수익률</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: COLORS.blue }}>
              {currentPortfolio.threeYear.toFixed(2)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
