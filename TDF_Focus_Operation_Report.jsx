/**
 * @title: TDF 포커스 운용보고서
 * @description: TDF 포트폴리오 운용 보고서 및 자산배분 상세 분석
 * @category: TDF
 * @icon: 📊
 * @color: "#59A14F"
 */

import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ComposedChart, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Treemap
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

const CHART_COLORS = [
  '#4E79A7', '#F28E2B', '#E15759', '#76B7B2', '#59A14F',
  '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC'
];

// 자산 분류별 색상
const ASSET_COLORS = {
  '주식': COLORS.blue,
  '미국성장': COLORS.blue,
  '미국가치': COLORS.orange,
  '선진국': COLORS.green,
  '이머징': COLORS.red,
  '채권': COLORS.teal,
  '국내채권': COLORS.teal,
  '해외채권': COLORS.brown,
  '대체': COLORS.yellow,
  '금': COLORS.yellow,
};

// TDF 빈티지별 데이터
const tdfVintages = [
  {
    vintage: 'TDF 2030',
    aum: 8500,
    return1Y: 8.5,
    return3Y: 6.8,
    sharpe: 1.12,
    volatility: 7.8,
    mdd: -8.5,
    equity: 45,
    bond: 50,
    alternative: 5
  },
  {
    vintage: 'TDF 2035',
    aum: 12300,
    return1Y: 10.2,
    return3Y: 8.5,
    sharpe: 1.25,
    volatility: 9.5,
    mdd: -10.2,
    equity: 55,
    bond: 40,
    alternative: 5
  },
  {
    vintage: 'TDF 2040',
    aum: 15800,
    return1Y: 12.8,
    return3Y: 10.2,
    sharpe: 1.35,
    volatility: 11.8,
    mdd: -12.8,
    equity: 65,
    bond: 30,
    alternative: 5
  },
  {
    vintage: 'TDF 2045',
    aum: 11200,
    return1Y: 14.5,
    return3Y: 11.5,
    sharpe: 1.38,
    volatility: 13.5,
    mdd: -14.5,
    equity: 75,
    bond: 20,
    alternative: 5
  },
  {
    vintage: 'TDF 2050',
    aum: 9800,
    return1Y: 16.2,
    return3Y: 12.8,
    sharpe: 1.42,
    volatility: 15.2,
    mdd: -16.8,
    equity: 85,
    bond: 10,
    alternative: 5
  },
];

// 자산배분 상세 (TDF 2040 기준)
const assetAllocationDetail = [
  { 
    asset: '미국성장', 
    category: '주식',
    weight: 22.5, 
    return: 18.2,
    contribution: 4.10,
    color: ASSET_COLORS['미국성장']
  },
  { 
    asset: '미국가치', 
    category: '주식',
    weight: 18.0, 
    return: 12.5,
    contribution: 2.25,
    color: ASSET_COLORS['미국가치']
  },
  { 
    asset: '선진국', 
    category: '주식',
    weight: 15.5, 
    return: 10.8,
    contribution: 1.67,
    color: ASSET_COLORS['선진국']
  },
  { 
    asset: '이머징', 
    category: '주식',
    weight: 9.0, 
    return: 8.5,
    contribution: 0.77,
    color: ASSET_COLORS['이머징']
  },
  { 
    asset: '국내채권', 
    category: '채권',
    weight: 20.0, 
    return: 3.8,
    contribution: 0.76,
    color: ASSET_COLORS['국내채권']
  },
  { 
    asset: '해외채권', 
    category: '채권',
    weight: 10.0, 
    return: 4.2,
    contribution: 0.42,
    color: ASSET_COLORS['해외채권']
  },
  { 
    asset: '금', 
    category: '대체',
    weight: 5.0, 
    return: 14.2,
    contribution: 0.71,
    color: ASSET_COLORS['금']
  },
];

// 글라이드패스 데이터
const glidepath = [
  { year: 2025, equity: 85, bond: 10, alternative: 5, vintage: '2050' },
  { year: 2030, equity: 75, bond: 20, alternative: 5, vintage: '2045' },
  { year: 2035, equity: 65, bond: 30, alternative: 5, vintage: '2040' },
  { year: 2040, equity: 55, bond: 40, alternative: 5, vintage: '2035' },
  { year: 2045, equity: 45, bond: 50, alternative: 5, vintage: '2030' },
  { year: 2050, equity: 35, bond: 60, alternative: 5, vintage: '2025' },
];

// 월별 수익률 (TDF 2040)
const monthlyPerformance = [
  { month: '2024-07', portfolio: 2.8, benchmark: 2.5, diff: 0.3 },
  { month: '2024-08', portfolio: -1.2, benchmark: -1.5, diff: 0.3 },
  { month: '2024-09', portfolio: 3.5, benchmark: 3.2, diff: 0.3 },
  { month: '2024-10', portfolio: 1.8, benchmark: 1.5, diff: 0.3 },
  { month: '2024-11', portfolio: 2.9, benchmark: 2.6, diff: 0.3 },
  { month: '2024-12', portfolio: 1.5, benchmark: 1.3, diff: 0.2 },
  { month: '2025-01', portfolio: 2.4, benchmark: 2.0, diff: 0.4 },
];

// 리스크 지표 (레이더 차트용)
const riskMetrics = [
  { metric: '수익률', tdf: 85, benchmark: 80, target: 90 },
  { metric: '안정성', tdf: 78, benchmark: 75, target: 85 },
  { metric: 'Sharpe', tdf: 82, benchmark: 78, target: 88 },
  { metric: '변동성관리', tdf: 88, benchmark: 82, target: 90 },
  { metric: '다각화', tdf: 90, benchmark: 85, target: 95 },
];

// 카테고리별 집계
const categoryAllocation = [
  { category: '주식', weight: 65.0, return: 13.2, color: ASSET_COLORS['주식'] },
  { category: '채권', weight: 30.0, return: 3.9, color: ASSET_COLORS['채권'] },
  { category: '대체', weight: 5.0, return: 14.2, color: ASSET_COLORS['대체'] },
];

export default function TDFFocusOperationReport() {
  const [selectedVintage, setSelectedVintage] = useState('TDF 2040');
  const [viewMode, setViewMode] = useState('allocation');

  // 선택된 빈티지 데이터
  const currentVintage = useMemo(() => {
    return tdfVintages.find(v => v.vintage === selectedVintage) || tdfVintages[2];
  }, [selectedVintage]);

  // 통계 요약
  const summary = useMemo(() => {
    const totalAUM = tdfVintages.reduce((sum, v) => sum + v.aum, 0);
    const avgReturn = tdfVintages.reduce((sum, v) => sum + v.return1Y, 0) / tdfVintages.length;
    const avgSharpe = tdfVintages.reduce((sum, v) => sum + v.sharpe, 0) / tdfVintages.length;
    
    return { totalAUM, avgReturn, avgSharpe };
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
          background: `linear-gradient(135deg, ${COLORS.green}, ${COLORS.blue})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          📊 TDF 포커스 운용보고서
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem', margin: 0 }}>
          TDF 포트폴리오 운용 보고서 및 자산배분 상세 분석
        </p>
      </div>

      {/* 빈티지 선택 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '32px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {tdfVintages.map((vintage) => (
          <button
            key={vintage.vintage}
            onClick={() => setSelectedVintage(vintage.vintage)}
            style={{
              padding: '12px 24px',
              borderRadius: '8px',
              border: selectedVintage === vintage.vintage ? `2px solid ${COLORS.green}` : '1px solid rgba(255,255,255,0.2)',
              background: selectedVintage === vintage.vintage 
                ? `linear-gradient(135deg, ${COLORS.green}, ${COLORS.teal})` 
                : 'rgba(255,255,255,0.05)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '700',
              transition: 'all 0.3s'
            }}
          >
            {vintage.vintage}
          </button>
        ))}
      </div>

      {/* 전체 통계 카드 */}
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
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>총 운용자산</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.blue }}>
            {summary.totalAUM.toLocaleString()}억
          </div>
        </div>

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
          border: `2px solid ${COLORS.orange}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>선택 빈티지 AUM</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.orange }}>
            {currentVintage.aum.toLocaleString()}억
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.teal}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>1년 수익률</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.teal }}>
            +{currentVintage.return1Y.toFixed(1)}%
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
            {currentVintage.sharpe.toFixed(2)}
          </div>
        </div>
      </div>

      {/* 글라이드패스 & 빈티지별 비교 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* 글라이드패스 */}
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
            📈 TDF 글라이드패스
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={glidepath}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="year" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(26, 26, 46, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="equity" stackId="1" stroke={COLORS.blue} fill={COLORS.blue} fillOpacity={0.7} name="주식" />
              <Area type="monotone" dataKey="bond" stackId="1" stroke={COLORS.teal} fill={COLORS.teal} fillOpacity={0.7} name="채권" />
              <Area type="monotone" dataKey="alternative" stackId="1" stroke={COLORS.yellow} fill={COLORS.yellow} fillOpacity={0.7} name="대체" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 빈티지별 수익률 비교 */}
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
            📊 빈티지별 수익률
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={tdfVintages}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="vintage" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(26, 26, 46, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="return1Y" name="1년" fill={COLORS.blue} />
              <Bar dataKey="return3Y" name="3년" fill={COLORS.green} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 자산배분 현황 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* 카테고리별 배분 */}
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
            🎯 자산 카테고리 배분
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={categoryAllocation}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, weight }) => `${category} ${weight}%`}
                outerRadius={130}
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
            <BarChart data={assetAllocationDetail} layout="vertical">
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
                {assetAllocationDetail.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 월별 성과 & 리스크 프로파일 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* 월별 성과 */}
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
            📊 월별 성과 (vs BM)
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={monthlyPerformance}>
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
              <Bar dataKey="portfolio" name="TDF" fill={COLORS.blue} />
              <Bar dataKey="benchmark" name="BM" fill={COLORS.gray} opacity={0.5} />
              <Line type="monotone" dataKey="diff" name="초과수익" stroke={COLORS.orange} strokeWidth={3} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 리스크 프로파일 */}
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
            ⚡ 리스크 프로파일
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={riskMetrics}>
              <PolarGrid stroke="rgba(255,255,255,0.2)" />
              <PolarAngleAxis dataKey="metric" stroke="#aaa" />
              <PolarRadiusAxis stroke="#aaa" />
              <Radar name="TDF" dataKey="tdf" stroke={COLORS.blue} fill={COLORS.blue} fillOpacity={0.5} />
              <Radar name="BM" dataKey="benchmark" stroke={COLORS.orange} fill={COLORS.orange} fillOpacity={0.3} />
              <Radar name="목표" dataKey="target" stroke={COLORS.green} fill={COLORS.green} fillOpacity={0.2} />
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
          📋 자산배분 상세 ({selectedVintage})
        </h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>자산</th>
              <th style={{ padding: '12px', textAlign: 'center', color: COLORS.teal }}>카테고리</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>비중 (%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>수익률 (%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>기여도 (%)</th>
            </tr>
          </thead>
          <tbody>
            {assetAllocationDetail.map((asset, idx) => (
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
                <td style={{ padding: '12px', textAlign: 'center', color: '#aaa' }}>
                  {asset.category}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>
                  {asset.weight.toFixed(1)}
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
                  {asset.contribution.toFixed(2)}
                </td>
              </tr>
            ))}
            <tr style={{ 
              borderTop: '2px solid rgba(255,255,255,0.3)',
              background: 'rgba(255,255,255,0.05)',
              fontWeight: '700'
            }}>
              <td style={{ padding: '12px', textAlign: 'left' }}>합계</td>
              <td style={{ padding: '12px', textAlign: 'center' }}>-</td>
              <td style={{ padding: '12px', textAlign: 'right', color: COLORS.green }}>
                {assetAllocationDetail.reduce((sum, a) => sum + a.weight, 0).toFixed(1)}
              </td>
              <td style={{ padding: '12px', textAlign: 'right' }}>-</td>
              <td style={{ padding: '12px', textAlign: 'right', color: COLORS.blue }}>
                {assetAllocationDetail.reduce((sum, a) => sum + a.contribution, 0).toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* 빈티지 비교 테이블 */}
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
          📊 TDF 빈티지별 비교
        </h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>빈티지</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>AUM (억)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>1년 (%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>3년 (%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>Sharpe</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>변동성 (%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>주식 (%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>채권 (%)</th>
            </tr>
          </thead>
          <tbody>
            {tdfVintages.map((vintage, idx) => (
              <tr key={idx} style={{ 
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: vintage.vintage === selectedVintage ? 'rgba(89, 161, 79, 0.1)' : 
                           (idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent')
              }}>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'left',
                  fontWeight: vintage.vintage === selectedVintage ? '700' : '600',
                  color: vintage.vintage === selectedVintage ? COLORS.green : 'inherit'
                }}>
                  {vintage.vintage}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {vintage.aum.toLocaleString()}
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'right',
                  color: COLORS.green,
                  fontWeight: '600'
                }}>
                  +{vintage.return1Y.toFixed(1)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>
                  +{vintage.return3Y.toFixed(1)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: COLORS.blue }}>
                  {vintage.sharpe.toFixed(2)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {vintage.volatility.toFixed(1)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: COLORS.blue }}>
                  {vintage.equity}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>
                  {vintage.bond}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
