/**
 * @title: 06K04 펀드 모니터링
 * @description: 06K04 펀드 자산배분 및 성과 모니터링 대시보드
 * @category: 펀드
 * @icon: 📊
 * @color: "#B07AA1"
 */

import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ComposedChart, ScatterChart, Scatter
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

// 자산 카테고리 색상
const ASSET_COLORS = {
  '미국주식': COLORS.blue,
  '한국주식': COLORS.orange,
  '채권': COLORS.teal,
  '대체': COLORS.yellow,
  '현금': COLORS.gray,
};

// 펀드 기본 정보
const fundInfo = {
  code: '06K04',
  name: 'KB자산배분펀드',
  nav: 11856.42,
  aum: 12350,
  inception: '2018-03-15',
};

// 누적 수익률 데이터
const cumulativeReturns = [
  { date: '2024-07', fund: 100, bm: 100, us: 100, kr: 100 },
  { date: '2024-08', fund: 103.5, bm: 102.8, us: 104.2, kr: 101.5 },
  { date: '2024-09', fund: 106.2, bm: 104.5, us: 107.8, kr: 103.2 },
  { date: '2024-10', fund: 109.8, bm: 107.2, us: 112.5, kr: 104.8 },
  { date: '2024-11', fund: 112.5, bm: 109.5, us: 116.2, kr: 106.5 },
  { date: '2024-12', fund: 115.8, bm: 112.0, us: 120.5, kr: 108.2 },
  { date: '2025-01', fund: 118.6, bm: 114.2, us: 124.8, kr: 109.5 },
];

// 자산배분 현황
const assetAllocation = [
  { asset: '미국주식', weight: 35.5, allocation: 'ACWI, SOXX, EWJ, XLI 등', count: 15 },
  { asset: '한국주식', weight: 15.2, allocation: 'KODEX 200, 개별종목', count: 8 },
  { asset: '채권', weight: 42.3, allocation: 'BND, 국채, 회사채', count: 12 },
  { asset: '대체', weight: 5.0, allocation: '금, 원자재', count: 3 },
  { asset: '현금', weight: 2.0, allocation: '현금성 자산', count: 1 },
];

// 주요 보유 종목 (Top 10)
const topHoldings = [
  { ticker: 'ACWI', name: 'iShares MSCI ACWI', weight: 8.5, return: 15.2, contribution: 1.29 },
  { ticker: 'BND', name: 'Vanguard Total Bond', weight: 12.0, return: 3.8, contribution: 0.46 },
  { ticker: 'SOXX', name: 'iShares Semiconductor', weight: 6.8, return: 22.5, contribution: 1.53 },
  { ticker: 'EWJ', name: 'iShares MSCI Japan', weight: 5.2, return: 12.8, contribution: 0.67 },
  { ticker: 'XLI', name: 'Industrial Select', weight: 4.5, return: 14.2, contribution: 0.64 },
  { ticker: '069500', name: 'KODEX 200', weight: 8.5, return: 8.5, contribution: 0.72 },
  { ticker: 'LQD', name: 'iShares Investment Grade', weight: 7.5, return: 4.2, contribution: 0.32 },
  { ticker: 'SPYG', name: 'SPDR S&P 500 Growth', weight: 4.2, return: 18.5, contribution: 0.78 },
  { ticker: 'EEM', name: 'iShares MSCI EM', weight: 3.8, return: 10.5, contribution: 0.40 },
  { ticker: 'MAGS', name: 'Roundhill Magnificent 7', weight: 3.5, return: 28.2, contribution: 0.99 },
];

// 월별 수익률
const monthlyReturns = [
  { month: '2024-07', fund: 3.5, bm: 2.8, excess: 0.7 },
  { month: '2024-08', fund: 2.6, bm: 1.7, excess: 0.9 },
  { month: '2024-09', fund: 2.5, bm: 2.0, excess: 0.5 },
  { month: '2024-10', fund: 3.4, bm: 2.6, excess: 0.8 },
  { month: '2024-11', fund: 2.5, bm: 2.1, excess: 0.4 },
  { month: '2024-12', fund: 2.9, bm: 2.3, excess: 0.6 },
  { month: '2025-01', fund: 2.4, bm: 1.9, excess: 0.5 },
];

// 리스크 지표
const riskMetrics = [
  { metric: '수익률', fund: 88, benchmark: 82, target: 85 },
  { metric: '변동성', fund: 72, benchmark: 75, target: 70 },
  { metric: 'Sharpe', fund: 85, benchmark: 78, target: 80 },
  { metric: '안정성', fund: 82, benchmark: 80, target: 85 },
  { metric: '분산투자', fund: 92, benchmark: 85, target: 90 },
];

// 지역별 배분 (미국 주식)
const regionAllocation = [
  { region: '미국', weight: 52.5, color: COLORS.blue },
  { region: '일본', weight: 18.2, color: COLORS.orange },
  { region: '유럽', weight: 15.8, color: COLORS.green },
  { region: '이머징', weight: 10.5, color: COLORS.red },
  { region: '기타', weight: 3.0, color: COLORS.gray },
];

// 섹터별 배분
const sectorAllocation = [
  { sector: '기술', weight: 25.8, color: COLORS.blue },
  { sector: '금융', weight: 18.5, color: COLORS.orange },
  { sector: '산업재', weight: 15.2, color: COLORS.green },
  { sector: '헬스케어', weight: 12.8, color: COLORS.red },
  { sector: '소비재', weight: 10.5, color: COLORS.teal },
  { sector: '통신', weight: 8.2, color: COLORS.purple },
  { sector: '기타', weight: 9.0, color: COLORS.gray },
];

// 성과 요약
const performanceSummary = {
  ytd: 18.6,
  month1: 2.4,
  month3: 7.8,
  year1: 18.6,
  year3: 8.5,
  sharpe: 1.32,
  volatility: 8.5,
  mdd: -9.8,
  bmReturn: 14.2,
  excessReturn: 4.4,
};

export default function Fund06K04Dashboard() {
  const [viewMode, setViewMode] = useState('overview');
  const [selectedAsset, setSelectedAsset] = useState('all');

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
          background: `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.pink})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          📊 06K04 펀드 모니터링
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem', margin: 0 }}>
          {fundInfo.name} 자산배분 및 성과 모니터링 대시보드
        </p>
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
          border: `2px solid ${COLORS.purple}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>기준가 (NAV)</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.purple }}>
            {fundInfo.nav.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '4px' }}>원</div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.blue}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>순자산총액</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.blue }}>
            {fundInfo.aum.toLocaleString()}억
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.green}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>YTD 수익률</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.green }}>
            +{performanceSummary.ytd.toFixed(1)}%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.orange}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>Sharpe Ratio</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.orange }}>
            {performanceSummary.sharpe.toFixed(2)}
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
            {performanceSummary.mdd.toFixed(1)}%
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
            +{performanceSummary.excessReturn.toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '4px' }}>vs BM</div>
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
          { id: 'holdings', label: '📋 보유종목' }
        ].map((mode) => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: viewMode === mode.id ? `2px solid ${COLORS.purple}` : '1px solid rgba(255,255,255,0.2)',
              background: viewMode === mode.id 
                ? `linear-gradient(135deg, ${COLORS.purple}, ${COLORS.pink})` 
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
                  <YAxis domain={[98, 130]} stroke="#aaa" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(26, 26, 46, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="fund" stroke={COLORS.purple} strokeWidth={3} name="펀드" />
                  <Line type="monotone" dataKey="bm" stroke={COLORS.gray} strokeWidth={2} strokeDasharray="5 5" name="벤치마크" />
                  <Line type="monotone" dataKey="us" stroke={COLORS.blue} strokeWidth={2} name="미국주식" />
                  <Line type="monotone" dataKey="kr" stroke={COLORS.orange} strokeWidth={2} name="한국주식" />
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
                📊 월별 수익률 & 초과수익
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
                  <Bar dataKey="fund" fill={COLORS.purple} name="펀드" />
                  <Bar dataKey="bm" fill={COLORS.gray} name="BM" opacity={0.5} />
                  <Line type="monotone" dataKey="excess" stroke={COLORS.orange} strokeWidth={3} name="초과수익" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 자산 카테고리 배분 */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
            gap: '24px',
            marginBottom: '24px'
          }}>
            {/* 자산 배분 파이 차트 */}
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

            {/* 지역별 배분 */}
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
                🌏 지역별 배분
              </h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={regionAllocation}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="region" stroke="#aaa" />
                  <YAxis stroke="#aaa" />
                  <Tooltip 
                    contentStyle={{ 
                      background: 'rgba(26, 26, 46, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="weight" name="비중 (%)">
                    {regionAllocation.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
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
              🏢 섹터별 배분
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

          {/* 자산 카테고리 상세 */}
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
              📊 자산 카테고리 상세
            </h2>
            <div style={{ overflowY: 'auto', maxHeight: '400px' }}>
              {assetAllocation.map((asset, idx) => (
                <div key={idx} style={{
                  padding: '16px',
                  marginBottom: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${ASSET_COLORS[asset.asset] || COLORS.gray}`
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '1.1rem', color: ASSET_COLORS[asset.asset] }}>
                      {asset.asset}
                    </span>
                    <span style={{ fontWeight: '700', fontSize: '1.1rem', color: COLORS.green }}>
                      {asset.weight}%
                    </span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '4px' }}>
                    종목 수: {asset.count}개
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#bbb' }}>
                    {asset.allocation}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 보유종목 뷰 */}
      {viewMode === 'holdings' && (
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
            color: COLORS.blue
          }}>
            📋 주요 보유 종목 (Top 10)
          </h2>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.9rem'
          }}>
            <thead>
              <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
                <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>티커</th>
                <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>종목명</th>
                <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>비중 (%)</th>
                <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>수익률 (%)</th>
                <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>기여도 (%)</th>
              </tr>
            </thead>
            <tbody>
              {topHoldings.map((holding, idx) => (
                <tr key={idx} style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
                }}>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'left',
                    fontWeight: '700',
                    color: COLORS.blue
                  }}>
                    {holding.ticker}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'left' }}>
                    {holding.name}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>
                    {holding.weight.toFixed(1)}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'right',
                    color: holding.return >= 0 ? COLORS.green : COLORS.red,
                    fontWeight: '600'
                  }}>
                    {holding.return >= 0 ? '+' : ''}{holding.return.toFixed(1)}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'right',
                    color: COLORS.orange,
                    fontWeight: '600'
                  }}>
                    {holding.contribution.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 성과 요약 테이블 */}
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
          📊 성과 요약
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}>
          {[
            { label: '1개월', value: performanceSummary.month1, color: COLORS.blue },
            { label: '3개월', value: performanceSummary.month3, color: COLORS.green },
            { label: 'YTD', value: performanceSummary.ytd, color: COLORS.orange },
            { label: '1년', value: performanceSummary.year1, color: COLORS.purple },
            { label: '3년(연)', value: performanceSummary.year3, color: COLORS.teal },
            { label: '변동성', value: performanceSummary.volatility, color: COLORS.red, unit: '%' },
            { label: 'Sharpe', value: performanceSummary.sharpe, color: COLORS.pink, unit: '' },
            { label: 'MDD', value: performanceSummary.mdd, color: COLORS.brown, unit: '%' },
          ].map((item, idx) => (
            <div key={idx} style={{
              padding: '16px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '8px',
              borderLeft: `4px solid ${item.color}`,
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>
                {item.label}
              </div>
              <div style={{ 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: item.color 
              }}>
                {item.value >= 0 && !item.label.includes('MDD') && !item.label.includes('변동성') ? '+' : ''}
                {typeof item.value === 'number' ? item.value.toFixed(item.label.includes('Sharpe') ? 2 : 1) : item.value}
                {item.unit !== undefined ? item.unit : '%'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
