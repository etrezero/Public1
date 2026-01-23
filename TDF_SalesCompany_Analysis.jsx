/**
 * @title: TDF 판매회사 시장분석
 * @description: TDF 펀드 판매회사별 시장 점유율 및 추이 분석
 * @category: TDF
 * @icon: 🏢
 * @color: "#4E79A7"
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, AreaChart, Area, Treemap
} from 'recharts';

// API Base URL
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

// 샘플 데이터 - 판매회사별 잔고 (폴백)
const salesCompanyDataFallback = [
  { company: 'KB증권', balance: 2850, share: 18.5, ytdGrowth: 15.3, funds: 12 },
  { company: '미래에셋증권', balance: 2650, share: 17.2, ytdGrowth: 12.8, funds: 15 },
  { company: '삼성증권', balance: 2100, share: 13.6, ytdGrowth: 8.5, funds: 10 },
  { company: 'NH투자증권', balance: 1850, share: 12.0, ytdGrowth: 10.2, funds: 11 },
  { company: '한국투자증권', balance: 1650, share: 10.7, ytdGrowth: 18.5, funds: 9 },
  { company: '키움증권', balance: 1200, share: 7.8, ytdGrowth: 22.1, funds: 8 },
  { company: '신한투자증권', balance: 950, share: 6.2, ytdGrowth: 5.3, funds: 7 },
  { company: 'IBK투자증권', balance: 720, share: 4.7, ytdGrowth: 3.2, funds: 6 },
  { company: '하나증권', balance: 680, share: 4.4, ytdGrowth: 7.8, funds: 5 },
  { company: '기타', balance: 750, share: 4.9, ytdGrowth: -2.1, funds: 25 },
];

// 시계열 데이터 (월별 추이) (폴백)
const timeSeriesDataFallback = [
  { month: '2024-01', KB: 2350, 미래에셋: 2280, 삼성: 1920, NH: 1680, 한투: 1420 },
  { month: '2024-04', KB: 2520, 미래에셋: 2380, 삼성: 1980, NH: 1740, 한투: 1510 },
  { month: '2024-07', KB: 2680, 미래에셋: 2520, 삼성: 2040, NH: 1800, 한투: 1580 },
  { month: '2024-10', KB: 2850, 미래에셋: 2650, 삼성: 2100, NH: 1850, 한투: 1650 },
];

// Top 5 판매회사 상세 데이터 (폴백)
const topCompaniesDetailFallback = [
  { 
    company: 'KB증권', 
    totalBalance: 2850,
    tdf2030: 520, tdf2035: 480, tdf2040: 680, tdf2045: 420, tdf2050: 750,
    avgFee: 0.45, customerCount: 45200
  },
  { 
    company: '미래에셋증권', 
    totalBalance: 2650,
    tdf2030: 480, tdf2035: 520, tdf2040: 650, tdf2045: 450, tdf2050: 550,
    avgFee: 0.42, customerCount: 52100
  },
  { 
    company: '삼성증권', 
    totalBalance: 2100,
    tdf2030: 380, tdf2035: 420, tdf2040: 520, tdf2045: 380, tdf2050: 400,
    avgFee: 0.40, customerCount: 38500
  },
  { 
    company: 'NH투자증권', 
    totalBalance: 1850,
    tdf2030: 320, tdf2035: 380, tdf2040: 450, tdf2045: 350, tdf2050: 350,
    avgFee: 0.43, customerCount: 35800
  },
  { 
    company: '한국투자증권', 
    totalBalance: 1650,
    tdf2030: 280, tdf2035: 320, tdf2040: 380, tdf2045: 320, tdf2050: 350,
    avgFee: 0.38, customerCount: 28900
  },
];

export default function TDFSalesCompany() {
  // State 관리
  const [selectedCompany, setSelectedCompany] = useState('all');
  const [sortBy, setSortBy] = useState('balance');
  
  // API 데이터 상태
  const [salesCompanyData, setSalesCompanyData] = useState(salesCompanyDataFallback);
  const [timeSeriesData, setTimeSeriesData] = useState(timeSeriesDataFallback);
  const [topCompaniesDetail, setTopCompaniesDetail] = useState(topCompaniesDetailFallback);
  const [vintageData, setVintageData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [overviewRes, timeseriesRes, detailRes] = await Promise.all([
          fetch(`${API_BASE_URL}/sales-company/overview`).catch(() => null),
          fetch(`${API_BASE_URL}/sales-company/timeseries?period=1y`).catch(() => null),
          fetch(`${API_BASE_URL}/sales-company/detail`).catch(() => null)
        ]);

        // 성공한 응답만 처리
        if (overviewRes?.ok) {
          const data = await overviewRes.json();
          if (data.companies) setSalesCompanyData(data.companies);
        }
        if (timeseriesRes?.ok) {
          const data = await timeseriesRes.json();
          if (data.timeseries) setTimeSeriesData(data.timeseries);
        }
        if (detailRes?.ok) {
          const data = await detailRes.json();
          if (data.companies) setTopCompaniesDetail(data.companies);
        }

        console.log('✅ TDF 판매회사 API 데이터 로드 완료');
      } catch (err) {
        console.warn('⚠️ TDF 판매회사 API 연결 실패, 폴백 데이터 사용:', err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 선택된 회사의 빈티지 데이터 로드
  useEffect(() => {
    if (selectedCompany !== 'all') {
      fetch(`${API_BASE_URL}/sales-company/vintage-distribution?company=${encodeURIComponent(selectedCompany)}`)
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.distribution) {
            setVintageData(data.distribution);
          }
        })
        .catch(err => console.warn('빈티지 데이터 로드 실패:', err.message));
    } else {
      setVintageData([]);
    }
  }, [selectedCompany]);

  // 선택된 회사의 빈티지별 분포
  const selectedCompanyVintage = useMemo(() => {
    if (selectedCompany === 'all') return [];
    const company = topCompaniesDetail.find(c => c.company === selectedCompany);
    if (!company) return [];
    
    return [
      { vintage: '2030', value: company.tdf2030 },
      { vintage: '2035', value: company.tdf2035 },
      { vintage: '2040', value: company.tdf2040 },
      { vintage: '2045', value: company.tdf2045 },
      { vintage: '2050', value: company.tdf2050 },
    ];
  }, [selectedCompany]);

  // 정렬된 데이터
  const sortedData = useMemo(() => {
    return [...salesCompanyData].sort((a, b) => {
      if (sortBy === 'balance') return b.balance - a.balance;
      if (sortBy === 'growth') return b.ytdGrowth - a.ytdGrowth;
      if (sortBy === 'share') return b.share - a.share;
      return 0;
    });
  }, [sortBy]);

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
          🏢 TDF 판매회사 시장분석
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem', margin: 0 }}>
          TDF 펀드 판매회사별 시장 점유율 및 성장 추이
        </p>
      </div>

      {/* 시장 개요 카드 */}
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
          border: `2px solid ${COLORS.blue}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💰</div>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>총 잔고</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.blue }}>
            15.4조원
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.green}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📈</div>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>YTD 성장률</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.green }}>
            +11.2%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.orange}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏢</div>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>판매회사</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.orange }}>
            32개사
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.teal}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📊</div>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>Top3 집중도</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.teal }}>
            49.3%
          </div>
        </div>
      </div>

      {/* 정렬 버튼 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        justifyContent: 'center'
      }}>
        {[
          { key: 'balance', label: '잔고순' },
          { key: 'growth', label: '성장률순' },
          { key: 'share', label: '점유율순' }
        ].map((sort) => (
          <button
            key={sort.key}
            onClick={() => setSortBy(sort.key)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: sortBy === sort.key ? `2px solid ${COLORS.blue}` : '1px solid rgba(255,255,255,0.2)',
              background: sortBy === sort.key 
                ? `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.teal})` 
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

      {/* 판매회사별 잔고 및 점유율 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* 바차트 */}
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
            📊 판매회사별 잔고 (억원)
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={sortedData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="#aaa" />
              <YAxis dataKey="company" type="category" stroke="#aaa" width={120} />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(26, 26, 46, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="balance" name="잔고 (억원)">
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 파이차트 */}
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
            🥧 시장 점유율 (%)
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={sortedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ company, share }) => `${company} ${share}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="share"
              >
                {sortedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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

      {/* 월별 추이 */}
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
          📈 Top 5 판매회사 잔고 추이 (억원)
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={timeSeriesData}>
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
            <Area type="monotone" dataKey="KB" stackId="1" stroke={CHART_COLORS[0]} fill={CHART_COLORS[0]} fillOpacity={0.6} />
            <Area type="monotone" dataKey="미래에셋" stackId="1" stroke={CHART_COLORS[1]} fill={CHART_COLORS[1]} fillOpacity={0.6} />
            <Area type="monotone" dataKey="삼성" stackId="1" stroke={CHART_COLORS[2]} fill={CHART_COLORS[2]} fillOpacity={0.6} />
            <Area type="monotone" dataKey="NH" stackId="1" stroke={CHART_COLORS[3]} fill={CHART_COLORS[3]} fillOpacity={0.6} />
            <Area type="monotone" dataKey="한투" stackId="1" stroke={CHART_COLORS[4]} fill={CHART_COLORS[4]} fillOpacity={0.6} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 상세 테이블 */}
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
          color: COLORS.orange
        }}>
          📋 판매회사별 상세 현황
        </h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>순위</th>
              <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>판매회사</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>잔고(억원)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>점유율(%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>YTD 성장률(%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>펀드수</th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <tr key={idx} style={{ 
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
              }}>
                <td style={{ padding: '12px', textAlign: 'left' }}>{idx + 1}</td>
                <td style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>{row.company}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{row.balance.toLocaleString()}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{row.share.toFixed(1)}</td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'right',
                  color: row.ytdGrowth >= 0 ? COLORS.green : COLORS.red,
                  fontWeight: '600'
                }}>
                  {row.ytdGrowth >= 0 ? '+' : ''}{row.ytdGrowth.toFixed(1)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{row.funds}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
