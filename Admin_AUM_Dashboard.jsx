/**
 * @title: 행정업무 수탁고 조회
 * @description: 펀드 수탁고 데이터베이스 조회 및 분석 대시보드
 * @category: 행정업무
 * @icon: 📁
 * @color: "#9C755F"
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ComposedChart, Area
} from 'recharts';

// API 설정
const API_BASE_URL = 'http://localhost:9010/api/v1';

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

// 샘플 데이터 - 펀드별 수탁고 데이터
const fundAUMData = [
  { 
    fundCode: 'T08186', 
    fundName: '리스테이트',
    manager: '김재승',
    openingAUM: 15820,
    currentAUM: 16450,
    change: 630,
    changeRate: 3.98,
    nav: 10850
  },
  { 
    fundCode: 'T10054', 
    fundName: '민성국',
    manager: '박민성',
    openingAUM: 8540,
    currentAUM: 8920,
    change: 380,
    changeRate: 4.45,
    nav: 11230
  },
  { 
    fundCode: 'T10559', 
    fundName: '박지영',
    manager: '최지영',
    openingAUM: 12300,
    currentAUM: 11850,
    change: -450,
    changeRate: -3.66,
    nav: 9780
  },
  { 
    fundCode: 'T08687', 
    fundName: '박지은',
    manager: '이수진',
    openingAUM: 6780,
    currentAUM: 7120,
    change: 340,
    changeRate: 5.01,
    nav: 10520
  },
  { 
    fundCode: 'T19739', 
    fundName: '윤제영',
    manager: '윤제영',
    openingAUM: 19500,
    currentAUM: 20850,
    change: 1350,
    changeRate: 6.92,
    nav: 12450
  },
  { 
    fundCode: 'T15234', 
    fundName: '강민수',
    manager: '강민수',
    openingAUM: 5420,
    currentAUM: 5680,
    change: 260,
    changeRate: 4.80,
    nav: 10120
  },
  { 
    fundCode: 'T17892', 
    fundName: '정하늘',
    manager: '정하늘',
    openingAUM: 9850,
    currentAUM: 10250,
    change: 400,
    changeRate: 4.06,
    nav: 11580
  },
  { 
    fundCode: 'T20156', 
    fundName: '최서연',
    manager: '최서연',
    openingAUM: 7200,
    currentAUM: 6980,
    change: -220,
    changeRate: -3.06,
    nav: 9650
  },
];

// 시계열 데이터 (월별 총 수탁고 추이)
const timeSeriesData = [
  { date: '2025-07', totalAUM: 78520, fundCount: 152 },
  { date: '2025-08', totalAUM: 81340, fundCount: 155 },
  { date: '2025-09', totalAUM: 79850, fundCount: 153 },
  { date: '2025-10', totalAUM: 83420, fundCount: 158 },
  { date: '2025-11', totalAUM: 85670, fundCount: 160 },
  { date: '2025-12', totalAUM: 87950, fundCount: 162 },
  { date: '2026-01', totalAUM: 90100, fundCount: 165 },
];

// 운용사별 집계
const managerStats = [
  { manager: '김재승', funds: 3, totalAUM: 18500, avgReturn: 5.2 },
  { manager: '박민성', funds: 2, totalAUM: 12800, avgReturn: 4.8 },
  { manager: '최지영', funds: 4, totalAUM: 15300, avgReturn: -2.1 },
  { manager: '이수진', funds: 2, totalAUM: 9500, avgReturn: 6.3 },
  { manager: '윤제영', funds: 5, totalAUM: 28900, avgReturn: 7.1 },
  { manager: '기타', funds: 12, totalAUM: 5100, avgReturn: 3.5 },
];

export default function AdminAUMDashboard() {
  const [sortBy, setSortBy] = useState('aum');
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // API 데이터 상태
  const [fundsList, setFundsList] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [managerStats, setManagerStats] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 펀드 목록 조회
        const fundsResponse = await fetch(`${API_BASE_URL}/admin/funds/list?sort_by=${sortBy}&order=desc&limit=200`);
        if (!fundsResponse.ok) throw new Error('펀드 목록 조회 실패');
        const fundsData = await fundsResponse.json();
        
        // 펀드 데이터 변환 (openingAUM, change, changeRate 계산 필요)
        const fundsWithChanges = await Promise.all(
          fundsData.funds.slice(0, 50).map(async (fund) => {
            try {
              // 각 펀드의 수탁고 이력 조회 (30일)
              const historyResponse = await fetch(`${API_BASE_URL}/admin/funds/${fund.fund_code}/aum-history?period=1m`);
              if (historyResponse.ok) {
                const historyData = await historyResponse.json();
                const summary = historyData.summary || {};
                return {
                  fundCode: fund.fund_code,
                  fundName: fund.fund_name,
                  manager: fund.manager || '미지정',
                  openingAUM: summary.opening_aum || fund.aum,
                  currentAUM: fund.aum,
                  change: summary.change || 0,
                  changeRate: summary.change_rate || 0,
                  nav: fund.nav
                };
              }
            } catch (err) {
              console.error(`이력 조회 실패: ${fund.fund_code}`);
            }
            // 이력 조회 실패 시 기본값
            return {
              fundCode: fund.fund_code,
              fundName: fund.fund_name,
              manager: fund.manager || '미지정',
              openingAUM: fund.aum,
              currentAUM: fund.aum,
              change: 0,
              changeRate: 0,
              nav: fund.nav
            };
          })
        );
        
        setFundsList(fundsWithChanges);

        // 시계열 데이터 조회
        const timeseriesResponse = await fetch(`${API_BASE_URL}/admin/funds/aum-timeseries?period=6m`);
        if (timeseriesResponse.ok) {
          const timeseriesData = await timeseriesResponse.json();
          const formattedTimeseries = timeseriesData.timeseries.map(item => ({
            date: item.date.substring(0, 7), // YYYY-MM-DD -> YYYY-MM
            totalAUM: Math.round(item.total_aum / 100), // 억원 단위
            fundCount: item.fund_count
          }));
          setTimeSeriesData(formattedTimeseries);
        }

        // 운용사별 통계 조회
        const managersResponse = await fetch(`${API_BASE_URL}/admin/managers/stats`);
        if (managersResponse.ok) {
          const managersData = await managersResponse.json();
          const formattedManagers = managersData.managers.slice(0, 10).map(m => ({
            manager: m.manager,
            funds: m.fund_count,
            totalAUM: Math.round(m.total_aum / 100), // 억원 단위
            avgReturn: m.avg_return ? m.avg_return.toFixed(1) : 0
          }));
          setManagerStats(formattedManagers);
        }

        // 요약 정보 조회
        const summaryResponse = await fetch(`${API_BASE_URL}/admin/funds/aum-summary`);
        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          setSummary(summaryData);
        }

        setLoading(false);
      } catch (err) {
        console.error('API 조회 오류:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [sortBy]);

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
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
          <div style={{ fontSize: '20px' }}>펀드 데이터 로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#e8e8e8'
      }}>
        <div style={{
          background: 'rgba(225,87,89,0.1)',
          border: '1px solid #E15759',
          borderRadius: '12px',
          padding: '32px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>데이터 조회 실패</div>
          <div style={{ color: '#888', fontSize: '14px' }}>{error}</div>
          <div style={{ color: '#888', fontSize: '14px', marginTop: '8px' }}>
            API 서버(port 9010)가 실행 중인지 확인해주세요.
          </div>
        </div>
      </div>
    );
  }

  // 필터링 및 정렬
  const filteredData = useMemo(() => {
    let data = [...fundsList];
    
    // 타입 필터
    if (filterType === 'positive') {
      data = data.filter(f => f.changeRate > 0);
    } else if (filterType === 'negative') {
      data = data.filter(f => f.changeRate < 0);
    }
    
    // 검색어 필터
    if (searchTerm) {
      data = data.filter(f => 
        f.fundName.includes(searchTerm) || 
        f.fundCode.includes(searchTerm) ||
        f.manager.includes(searchTerm)
      );
    }
    
    // 정렬
    data.sort((a, b) => {
      if (sortBy === 'aum' || sortBy === 'currentAUM') return b.currentAUM - a.currentAUM;
      if (sortBy === 'changeRate') return b.changeRate - a.changeRate;
      if (sortBy === 'change') return b.change - a.change;
      return 0;
    });
    
    return data;
  }, [fundsList, sortBy, filterType, searchTerm]);

  // 통계 계산
  const stats = useMemo(() => {
    const totalAUM = filteredData.reduce((sum, f) => sum + f.currentAUM, 0);
    const totalChange = filteredData.reduce((sum, f) => sum + f.change, 0);
    const avgChangeRate = filteredData.reduce((sum, f) => sum + f.changeRate, 0) / filteredData.length;
    const positiveFunds = filteredData.filter(f => f.changeRate > 0).length;
    
    return { totalAUM, totalChange, avgChangeRate, positiveFunds };
  }, [filteredData]);

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
          background: `linear-gradient(135deg, ${COLORS.brown}, ${COLORS.orange})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          📁 행정업무 수탁고 조회
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem', margin: 0 }}>
          펀드 수탁고 데이터베이스 조회 및 분석 시스템
        </p>
      </div>

      {/* 통계 카드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
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
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>총 수탁고</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.blue }}>
            {stats.totalAUM.toLocaleString()}억
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${stats.totalChange >= 0 ? COLORS.green : COLORS.red}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📊</div>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>증감액</div>
          <div style={{ 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            color: stats.totalChange >= 0 ? COLORS.green : COLORS.red 
          }}>
            {stats.totalChange >= 0 ? '+' : ''}{stats.totalChange.toLocaleString()}억
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.teal}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📈</div>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>평균 증감률</div>
          <div style={{ 
            fontSize: '1.8rem', 
            fontWeight: '700', 
            color: stats.avgChangeRate >= 0 ? COLORS.green : COLORS.red 
          }}>
            {stats.avgChangeRate >= 0 ? '+' : ''}{stats.avgChangeRate.toFixed(2)}%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.orange}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</div>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>증가 펀드</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.orange }}>
            {stats.positiveFunds} / {filteredData.length}
          </div>
        </div>
      </div>

      {/* 필터 및 검색 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'all', label: '전체' },
            { key: 'positive', label: '증가' },
            { key: 'negative', label: '감소' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFilterType(filter.key)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: filterType === filter.key ? `2px solid ${COLORS.blue}` : '1px solid rgba(255,255,255,0.2)',
                background: filterType === filter.key 
                  ? `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.teal})` 
                  : 'rgba(255,255,255,0.05)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { key: 'currentAUM', label: '수탁고순' },
            { key: 'changeRate', label: '증감률순' },
            { key: 'change', label: '증감액순' }
          ].map((sort) => (
            <button
              key={sort.key}
              onClick={() => setSortBy(sort.key)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: sortBy === sort.key ? `2px solid ${COLORS.orange}` : '1px solid rgba(255,255,255,0.2)',
                background: sortBy === sort.key 
                  ? `linear-gradient(135deg, ${COLORS.orange}, ${COLORS.yellow})` 
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

        <input
          type="text"
          placeholder="펀드코드/이름/운용사 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '250px',
            padding: '10px 16px',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255,255,255,0.05)',
            color: 'white',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />
      </div>

      {/* 펀드별 수탁고 차트 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(600px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* 수탁고 바차트 */}
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
            📊 펀드별 수탁고 (억원)
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="fundName" stroke="#aaa" angle={-15} textAnchor="end" height={80} />
              <YAxis stroke="#aaa" />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(26, 26, 46, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="currentAUM" name="현재 수탁고" fill={COLORS.blue} />
              <Bar dataKey="openingAUM" name="기초 수탁고" fill={COLORS.gray} opacity={0.5} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 증감률 바차트 */}
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
            📈 펀드별 증감률 (%)
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="fundName" stroke="#aaa" angle={-15} textAnchor="end" height={80} />
              <YAxis stroke="#aaa" />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(26, 26, 46, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="changeRate" name="증감률 (%)">
                {filteredData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.changeRate >= 0 ? COLORS.green : COLORS.red} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 시계열 추이 */}
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
          color: COLORS.teal
        }}>
          📊 총 수탁고 추이
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#aaa" />
            <YAxis yAxisId="left" stroke="#aaa" label={{ value: '수탁고 (억원)', angle: -90, position: 'insideLeft' }} />
            <YAxis yAxisId="right" orientation="right" stroke="#aaa" label={{ value: '펀드 수', angle: 90, position: 'insideRight' }} />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(26, 26, 46, 0.95)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="totalAUM" 
              name="총 수탁고" 
              fill={COLORS.blue} 
              stroke={COLORS.blue}
              fillOpacity={0.6}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="fundCount" 
              name="펀드 수" 
              stroke={COLORS.orange} 
              strokeWidth={3}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* 운용사별 통계 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* 운용사별 수탁고 */}
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
            👤 운용사별 수탁고
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={managerStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="#aaa" />
              <YAxis dataKey="manager" type="category" stroke="#aaa" width={80} />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(26, 26, 46, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="totalAUM" name="수탁고 (억원)">
                {managerStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 운용사별 수익률 */}
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
            📊 운용사별 평균 수익률
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={managerStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="manager" stroke="#aaa" angle={-15} textAnchor="end" height={80} />
              <YAxis stroke="#aaa" />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(26, 26, 46, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="avgReturn" name="평균 수익률 (%)">
                {managerStats.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.avgReturn >= 0 ? COLORS.green : COLORS.red} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
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
          color: COLORS.brown
        }}>
          📋 펀드별 상세 현황
        </h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>펀드코드</th>
              <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>펀드명</th>
              <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>운용사</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>기초(억)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>현재(억)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>증감(억)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>증감률(%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>기준가</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, idx) => (
              <tr key={idx} style={{ 
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
              }}>
                <td style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>{row.fundCode}</td>
                <td style={{ padding: '12px', textAlign: 'left' }}>{row.fundName}</td>
                <td style={{ padding: '12px', textAlign: 'left' }}>{row.manager}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{row.openingAUM.toLocaleString()}</td>
                <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>{row.currentAUM.toLocaleString()}</td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'right',
                  color: row.change >= 0 ? COLORS.green : COLORS.red,
                  fontWeight: '600'
                }}>
                  {row.change >= 0 ? '+' : ''}{row.change.toLocaleString()}
                </td>
                <td style={{ 
                  padding: '12px', 
                  textAlign: 'right',
                  color: row.changeRate >= 0 ? COLORS.green : COLORS.red,
                  fontWeight: '600'
                }}>
                  {row.changeRate >= 0 ? '+' : ''}{row.changeRate.toFixed(2)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>{row.nav.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
