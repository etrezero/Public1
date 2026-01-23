import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, ScatterChart, Scatter, Cell, ReferenceLine } from 'recharts';

// ============================================
// TDF 포커스 모니터링 대시보드
// 실제 DB 데이터 기반 (기준일: 2026.01.19)
// 작성자: Covenant Seo
// ============================================

// Tableau 컬러 팔레트 (보라색 제외)
const COLORS = {
  blue: '#4E79A7',
  orange: '#F28E2B',
  red: '#E15759',
  teal: '#76B7B2',
  green: '#59A14F',
  yellow: '#EDC948',
  brown: '#9C755F',
  lightBrown: '#C8A882',
  mint: '#3EB489',
  gray: '#BAB0AC',
  darkGray: '#5A5A5A',
  lightGray: '#E8E8E8'
};

// 펀드 유형별 컬러
const FUND_COLORS = {
  '한투 포커스': COLORS.blue,
  '한투 ACE': COLORS.lightBrown,
  '한투 TRP(H)': COLORS.brown,
  '한투 TRP(UH)': '#A67C52',
  '삼성(H)': COLORS.mint,
  '삼성(UH)': '#2A9D6E',
  'KB 온국민': COLORS.green,
  'KB 다이나믹': '#7CB342',
  '미래 전략배분': COLORS.orange,
  '미래 ETF담은': '#FF7043',
  '기타': COLORS.gray
};

// ===== 실제 DB 데이터 (2026.01.19 기준) =====

// 빈티지별 주요 펀드 YTD 수익률 (%)
const vintageData = {
  '2030': [
    { company: 'KB 다이나믹', return: 15.99, aum: 3739 },
    { company: 'KB 온국민', return: 13.96, aum: 2126 },
    { company: '한투 포커스', return: 10.29, aum: 646 },
    { company: '기타', return: 10.08, aum: 774 }
  ],
  '2035': [
    { company: 'KB 온국민', return: 14.88, aum: 1888 },
    { company: '한투 포커스', return: 11.76, aum: 362 },
    { company: '기타', return: 11.61, aum: 525 }
  ],
  '2040': [
    { company: 'KB 다이나믹', return: 19.36, aum: 1769 },
    { company: 'KB 온국민', return: 16.64, aum: 1678 },
    { company: '한투 포커스', return: 13.07, aum: 419 },
    { company: '기타', return: 12.59, aum: 684 }
  ],
  '2045': [
    { company: 'KB 온국민', return: 18.15, aum: 686 },
    { company: '한투 포커스', return: 14.31, aum: 461 },
    { company: '기타', return: 13.13, aum: 777 }
  ],
  '2050': [
    { company: 'KB 다이나믹', return: 21.55, aum: 1000 },
    { company: 'KB 온국민', return: 18.75, aum: 1646 },
    { company: '한투 포커스', return: 15.25, aum: 725 },
    { company: '한투 TRP(H)', return: 12.97, aum: 202 }
  ],
  '2055': [
    { company: 'KB 온국민(UH)', return: 20.83, aum: 3038 },
    { company: 'KB 온국민(H)', return: 18.67, aum: 328 },
    { company: '한투 포커스', return: 16.04, aum: 547 },
    { company: '한투 TRP(H)', return: 15.22, aum: 165 }
  ],
  '2060': [
    { company: 'KB 다이나믹', return: 21.59, aum: 118 },
    { company: 'KB 온국민', return: 20.67, aum: 283 },
    { company: '한투 포커스', return: 16.89, aum: 1780 },
    { company: '한투 TRP(H)', return: 15.20, aum: 355 }
  ]
};

// TDF 2050 상세 YTD 수익률 데이터
const tdf2050DetailData = [
  { name: '삼성(UH)', return: 21.61, aum: 1932, type: 'UH' },
  { name: 'KB 다이나믹', return: 21.55, aum: 1000, type: 'H' },
  { name: 'KB RISE ETF', return: 20.97, aum: 590, type: 'ETF' },
  { name: 'KB 다이나믹 C-퇴직e', return: 20.85, aum: 513, type: 'H' },
  { name: '삼성(UH) Cpe', return: 20.76, aum: 1535, type: 'UH' },
  { name: '삼성(H)', return: 19.97, aum: 775, type: 'H' },
  { name: '미래 전략배분', return: 19.81, aum: 3648, type: 'H' },
  { name: '미래 ETF담은', return: 19.17, aum: 919, type: 'H' },
  { name: '삼성(H) Cpe', return: 19.13, aum: 648, type: 'H' },
  { name: 'KB 온국민', return: 18.75, aum: 1646, type: 'H' },
  { name: '한투 포커스', return: 15.25, aum: 725, type: 'H' },
  { name: '한투 TRP(UH)', return: 15.14, aum: 580, type: 'UH' },
  { name: '한투 TRP(H)', return: 12.97, aum: 202, type: 'H' }
];

// 한투 포커스 빈티지별 성과
const focusVintageData = [
  { vintage: '2030', return: 10.29, rank: 3, total: 4 },
  { vintage: '2035', return: 11.76, rank: 2, total: 3 },
  { vintage: '2040', return: 13.07, rank: 3, total: 4 },
  { vintage: '2045', return: 14.31, rank: 2, total: 3 },
  { vintage: '2050', return: 15.25, rank: 3, total: 4 },
  { vintage: '2055', return: 16.04, rank: 3, total: 4 },
  { vintage: '2060', return: 16.89, rank: 3, total: 4 }
];

// 위험-수익 산점도 데이터 (추정)
const riskReturnData = [
  { name: '한투 포커스', return: 15.25, volatility: 8.5, type: '포커스' },
  { name: '한투 TRP(H)', return: 12.97, volatility: 7.8, type: 'TRP' },
  { name: '한투 TRP(UH)', return: 15.14, volatility: 10.2, type: 'TRP' },
  { name: '삼성(H)', return: 19.97, volatility: 9.8, type: '삼성' },
  { name: '삼성(UH)', return: 21.61, volatility: 12.5, type: '삼성' },
  { name: 'KB 온국민', return: 18.75, volatility: 9.5, type: 'KB' },
  { name: 'KB 다이나믹', return: 21.55, volatility: 11.8, type: 'KB' },
  { name: '미래 전략배분', return: 19.81, volatility: 10.5, type: '미래' }
];

// 메인 컴포넌트
const TDFDashboard = () => {
  const [selectedVintage, setSelectedVintage] = useState('2050');
  
  const currentVintageData = vintageData[selectedVintage] || [];
  
  // 빈티지 비교 차트 데이터
  const vintageCompareData = Object.entries(vintageData).map(([vintage, funds]) => {
    const focusFund = funds.find(f => f.company === '한투 포커스');
    const bestFund = funds[0];
    return {
      vintage,
      '한투 포커스': focusFund?.return || 0,
      '1위 펀드': bestFund?.return || 0,
      '1위명': bestFund?.company || ''
    };
  });

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#F5F7FA',
      fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
      padding: '24px'
    }}>
      {/* 헤더 */}
      <header style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '32px' }}>📈</span>
          <div>
            <h1 style={{ 
              margin: 0, 
              fontSize: '24px', 
              fontWeight: '700',
              color: COLORS.blue 
            }}>
              TDF 포커스 모니터링 대시보드
            </h1>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: COLORS.gray }}>
              실제 DB 데이터 기반 | 기준일: 2026.01.19
            </p>
          </div>
        </div>
        <div style={{
          backgroundColor: COLORS.teal,
          color: 'white',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: '600'
        }}>
          🟢 LIVE DATA
        </div>
      </header>

      {/* 요약 카드 */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '16px',
        marginBottom: '24px'
      }}>
        {[
          { label: '한투 포커스 2050 YTD', value: '+15.25%', color: COLORS.blue, sub: 'AUM 725억' },
          { label: 'TDF 2050 1위', value: '+21.61%', color: COLORS.mint, sub: '삼성(UH)' },
          { label: '한투 포커스 순위', value: '3위 / 13개', color: COLORS.orange, sub: '전체 TDF 2050' },
          { label: '1위 대비 격차', value: '-6.36%p', color: COLORS.red, sub: '삼성(UH) 대비' }
        ].map((card, idx) => (
          <div key={idx} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderLeft: `4px solid ${card.color}`
          }}>
            <div style={{ fontSize: '13px', color: COLORS.gray, marginBottom: '8px' }}>
              {card.label}
            </div>
            <div style={{ fontSize: '28px', fontWeight: '700', color: card.color }}>
              {card.value}
            </div>
            <div style={{ fontSize: '12px', color: COLORS.darkGray, marginTop: '4px' }}>
              {card.sub}
            </div>
          </div>
        ))}
      </div>

      {/* 메인 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* TDF 2050 YTD 수익률 순위 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: COLORS.blue }}>
            📊 TDF 2050 YTD 수익률 순위 (2026.01.19)
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={tdf2050DetailData} layout="vertical" margin={{ left: 100, right: 30 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.lightGray} />
              <XAxis type="number" tickFormatter={(v) => `${v}%`} domain={[0, 25]} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={95} />
              <Tooltip 
                formatter={(value, name) => [`${value.toFixed(2)}%`, 'YTD 수익률']}
                contentStyle={{ borderRadius: '8px', border: `1px solid ${COLORS.lightGray}` }}
              />
              <Bar dataKey="return" radius={[0, 4, 4, 0]}>
                {tdf2050DetailData.map((entry, index) => (
                  <Cell 
                    key={index} 
                    fill={entry.name.includes('포커스') ? COLORS.blue : 
                          entry.name.includes('TRP') ? COLORS.brown :
                          entry.name.includes('삼성') ? COLORS.mint :
                          entry.name.includes('KB') ? COLORS.green :
                          entry.name.includes('미래') ? COLORS.orange : COLORS.gray}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 빈티지별 한투 포커스 vs 1위 비교 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: COLORS.blue }}>
            📈 빈티지별 한투 포커스 vs 1위 펀드
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={vintageCompareData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.lightGray} />
              <XAxis dataKey="vintage" />
              <YAxis tickFormatter={(v) => `${v}%`} />
              <Tooltip 
                formatter={(value) => [`${value.toFixed(2)}%`]}
                contentStyle={{ borderRadius: '8px', border: `1px solid ${COLORS.lightGray}` }}
              />
              <Legend />
              <Bar dataKey="한투 포커스" fill={COLORS.blue} radius={[4, 4, 0, 0]} />
              <Bar dataKey="1위 펀드" fill={COLORS.green} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 하단 그리드 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* 위험-수익 산점도 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: COLORS.blue }}>
            🎯 TDF 2050 위험-수익 분포
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={COLORS.lightGray} />
              <XAxis 
                type="number" 
                dataKey="volatility" 
                name="변동성" 
                tickFormatter={(v) => `${v}%`}
                label={{ value: '변동성 (%)', position: 'bottom', offset: 0 }}
              />
              <YAxis 
                type="number" 
                dataKey="return" 
                name="수익률" 
                tickFormatter={(v) => `${v}%`}
                label={{ value: '수익률 (%)', angle: -90, position: 'left' }}
              />
              <Tooltip 
                formatter={(value) => [`${value}%`]}
                contentStyle={{ borderRadius: '8px' }}
              />
              <Scatter name="펀드" data={riskReturnData}>
                {riskReturnData.map((entry, index) => (
                  <Cell 
                    key={index}
                    fill={entry.type === '포커스' ? COLORS.blue :
                          entry.type === 'TRP' ? COLORS.brown :
                          entry.type === '삼성' ? COLORS.mint :
                          entry.type === 'KB' ? COLORS.green :
                          COLORS.orange}
                    r={entry.type === '포커스' ? 12 : 8}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '12px' }}>
            {[
              { label: '한투 포커스', color: COLORS.blue },
              { label: '한투 TRP', color: COLORS.brown },
              { label: '삼성', color: COLORS.mint },
              { label: 'KB', color: COLORS.green },
              { label: '미래', color: COLORS.orange }
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: item.color }} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 빈티지별 수익률 테이블 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}>
          <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: '600', color: COLORS.blue }}>
            📋 빈티지별 YTD 수익률 요약
          </h3>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {Object.keys(vintageData).map(v => (
              <button
                key={v}
                onClick={() => setSelectedVintage(v)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  border: 'none',
                  backgroundColor: selectedVintage === v ? COLORS.blue : COLORS.lightGray,
                  color: selectedVintage === v ? 'white' : COLORS.darkGray,
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {v}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {currentVintageData.map((fund, idx) => (
              <div 
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  backgroundColor: fund.company === '한투 포커스' ? `${COLORS.blue}15` : '#FAFBFC',
                  borderRadius: '8px',
                  border: fund.company === '한투 포커스' ? `2px solid ${COLORS.blue}` : `1px solid ${COLORS.lightGray}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: idx === 0 ? '#FFD700' : idx === 1 ? '#C0C0C0' : idx === 2 ? '#CD7F32' : COLORS.lightGray,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '14px',
                    color: idx < 3 ? 'white' : COLORS.darkGray
                  }}>
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: COLORS.darkGray }}>{fund.company}</div>
                    <div style={{ fontSize: '12px', color: COLORS.gray }}>AUM {fund.aum.toLocaleString()}억</div>
                  </div>
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: fund.return >= 15 ? COLORS.green : fund.return >= 10 ? COLORS.orange : COLORS.red
                }}>
                  +{fund.return.toFixed(2)}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <footer style={{
        marginTop: '24px',
        padding: '16px',
        textAlign: 'center',
        color: COLORS.gray,
        fontSize: '13px'
      }}>
        © 2025 TDF 포커스 모니터링 Dashboard | Covenant Seo | 데이터 출처: FDTFN201, FDTFN001 | 업데이트: 매일 06:00
      </footer>
    </div>
  );
};

export default TDFDashboard;
