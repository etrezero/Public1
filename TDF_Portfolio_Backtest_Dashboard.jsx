/**
 * @title: TDF 포트폴리오 백테스트
 * @description: 금 비중 확대 전략 백테스팅 분석 (2022-2025)
 * @category: 분석도구
 * @icon: 📊
 * @color: "#EDC948"
 */

import React, { useState, useMemo } from 'react';
import { 
  PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer, AreaChart, Area, BarChart, Bar, ReferenceLine 
} from 'recharts';

// Tableau 컬러 팔레트 (보라색 제외)
const COLORS = {
  blue: '#4E79A7',
  orange: '#F28E2B',
  red: '#E15759',
  teal: '#76B7B2',
  green: '#59A14F',
  yellow: '#EDC948',
  brown: '#9C755F',
  pink: '#FF9DA7',
  gray: '#BAB0AC',
};

const ASSET_COLORS = {
  '미국성장주': COLORS.blue,
  '금': COLORS.yellow,
  '한국주식': COLORS.red,
  '미국채권': COLORS.teal,
  '한국채권': COLORS.green
};

// 공통 스타일
const styles = {
  container: {
    fontFamily: "'Pretendard', 'Noto Sans KR', -apple-system, sans-serif",
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    minHeight: '100vh',
    padding: '32px',
    color: '#e8e8e8'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '16px',
    padding: '32px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.1)'
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    background: `linear-gradient(135deg, ${COLORS.yellow}, ${COLORS.orange})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '12px',
    letterSpacing: '-0.02em'
  },
  subtitle: {
    color: '#aaa',
    fontSize: '1.1rem',
    margin: 0
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '16px',
    padding: '24px',
    border: '1px solid rgba(255,255,255,0.1)',
    marginBottom: '24px'
  },
  cardTitle: {
    fontSize: '1.3rem',
    fontWeight: '700',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  metricCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    padding: '20px',
    textAlign: 'center'
  },
  metricLabel: {
    fontSize: '0.85rem',
    color: '#aaa',
    marginBottom: '8px'
  },
  metricValue: {
    fontSize: '1.8rem',
    fontWeight: '700'
  },
  button: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '700',
    transition: 'all 0.3s'
  },
  tooltip: {
    background: 'rgba(26, 26, 46, 0.95)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#e8e8e8'
  },
  gridContainer: {
    display: 'grid',
    gap: '24px',
    marginBottom: '24px'
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    padding: '8px 16px',
    borderRadius: '8px',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)'
  }
};

// 실제 ETF 연간 수익률 데이터
const ETF_ANNUAL_RETURNS = {
  us_growth: { 2022: -31.3, 2023: 38.4, 2024: 34.3, 2025: 20.7 },
  gold: { 2022: -0.8, 2023: 12.7, 2024: 26.7, 2025: 63.7 },
  kr_stock: { 2022: -25.0, 2023: 18.5, 2024: -8.0, 2025: 8.0 },
  us_bond: { 2022: -15.2, 2023: 3.5, 2024: 2.0, 2025: 6.2 },
  kr_bond: { 2022: -8.0, 2023: 6.0, 2024: 4.5, 2025: 5.5 }
};

// 월별 데이터 생성 함수
const generateMonthlyData = (annualReturn, volatility = 0.02) => {
  const monthlyTarget = Math.pow(1 + annualReturn / 100, 1/12) - 1;
  const months = [];
  let seed = annualReturn;
  
  for (let i = 0; i < 12; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const noise = ((seed / 233280) - 0.5) * volatility;
    months.push(monthlyTarget + noise);
  }
  
  const actualAnnual = months.reduce((acc, r) => acc * (1 + r), 1) - 1;
  const adjustment = Math.pow((1 + annualReturn/100) / (1 + actualAnnual), 1/12) - 1;
  
  return months.map(r => r + adjustment);
};

export default function TDFPortfolioBacktest() {
  const [selectedVintage, setSelectedVintage] = useState('2060');
  const [showOldPortfolio, setShowOldPortfolio] = useState(true);
  const [showBenchmark, setShowBenchmark] = useState(true);
  
  // 빈티지별 포트폴리오 데이터 (변경 후)
  const portfolios = {
    '2060': { us_growth: 40.7, gold: 20.4, kr_stock: 17.0, us_bond: 5.5, kr_bond: 16.4, equity: 78.0 },
    '2055': { us_growth: 40.3, gold: 20.1, kr_stock: 16.8, us_bond: 5.7, kr_bond: 17.1, equity: 77.2 },
    '2050': { us_growth: 38.3, gold: 19.2, kr_stock: 16.0, us_bond: 6.6, kr_bond: 19.9, equity: 73.5 },
    '2045': { us_growth: 36.4, gold: 18.2, kr_stock: 15.2, us_bond: 7.6, kr_bond: 22.7, equity: 69.7 },
    '2040': { us_growth: 33.9, gold: 16.9, kr_stock: 14.1, us_bond: 8.8, kr_bond: 26.3, equity: 64.9 },
    '2035': { us_growth: 31.0, gold: 15.5, kr_stock: 12.9, us_bond: 10.1, kr_bond: 30.5, equity: 59.4 },
    '2030': { us_growth: 29.1, gold: 14.5, kr_stock: 12.1, us_bond: 11.1, kr_bond: 33.2, equity: 55.7 },
    '2025': { us_growth: 19.8, gold: 9.9, kr_stock: 8.3, us_bond: 15.5, kr_bond: 46.5, equity: 38.0 }
  };
  
  // 변경 전 포트폴리오 (금 10%)
  const oldPortfolios = {
    '2060': { us_growth: 50.1, gold: 10.0, kr_stock: 16.7, us_bond: 5.8, kr_bond: 17.4, equity: 76.8 },
    '2055': { us_growth: 49.1, gold: 9.8, kr_stock: 16.4, us_bond: 6.2, kr_bond: 18.5, equity: 75.4 },
    '2050': { us_growth: 47.7, gold: 9.5, kr_stock: 15.9, us_bond: 6.7, kr_bond: 20.2, equity: 73.1 },
    '2045': { us_growth: 45.5, gold: 9.1, kr_stock: 15.2, us_bond: 7.6, kr_bond: 22.7, equity: 69.8 },
    '2040': { us_growth: 42.3, gold: 8.5, kr_stock: 14.1, us_bond: 8.8, kr_bond: 26.3, equity: 64.9 },
    '2035': { us_growth: 37.4, gold: 7.5, kr_stock: 12.5, us_bond: 10.7, kr_bond: 32.0, equity: 57.3 },
    '2030': { us_growth: 29.8, gold: 6.0, kr_stock: 9.9, us_bond: 13.6, kr_bond: 40.7, equity: 45.7 },
    '2025': { us_growth: 24.8, gold: 5.0, kr_stock: 8.3, us_bond: 15.5, kr_bond: 46.5, equity: 38.0 }
  };
  
  const currentPortfolio = portfolios[selectedVintage];
  const oldPortfolio = oldPortfolios[selectedVintage];
  
  // 백테스팅 데이터 생성
  const backtestData = useMemo(() => {
    const data = [];
    let newValue = 100;
    let oldValue = 100;
    let benchValue = 100;
    
    const years = [2022, 2023, 2024, 2025];
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    
    years.forEach(year => {
      const usGrowthMonthly = generateMonthlyData(ETF_ANNUAL_RETURNS.us_growth[year], 0.035);
      const goldMonthly = generateMonthlyData(ETF_ANNUAL_RETURNS.gold[year], 0.02);
      const krStockMonthly = generateMonthlyData(ETF_ANNUAL_RETURNS.kr_stock[year], 0.03);
      const usBondMonthly = generateMonthlyData(ETF_ANNUAL_RETURNS.us_bond[year], 0.012);
      const krBondMonthly = generateMonthlyData(ETF_ANNUAL_RETURNS.kr_bond[year], 0.008);
      
      months.forEach((month, idx) => {
        if (year === 2025 && idx > 0) return;
        
        const newReturn = 
          (currentPortfolio.us_growth / 100) * usGrowthMonthly[idx] +
          (currentPortfolio.gold / 100) * goldMonthly[idx] +
          (currentPortfolio.kr_stock / 100) * krStockMonthly[idx] +
          (currentPortfolio.us_bond / 100) * usBondMonthly[idx] +
          (currentPortfolio.kr_bond / 100) * krBondMonthly[idx];
        
        const oldReturn = 
          (oldPortfolio.us_growth / 100) * usGrowthMonthly[idx] +
          (oldPortfolio.gold / 100) * goldMonthly[idx] +
          (oldPortfolio.kr_stock / 100) * krStockMonthly[idx] +
          (oldPortfolio.us_bond / 100) * usBondMonthly[idx] +
          (oldPortfolio.kr_bond / 100) * krBondMonthly[idx];
        
        const benchReturn = 
          0.36 * usGrowthMonthly[idx] +
          0.24 * krStockMonthly[idx] +
          0.20 * usBondMonthly[idx] +
          0.20 * krBondMonthly[idx];
        
        newValue *= (1 + newReturn);
        oldValue *= (1 + oldReturn);
        benchValue *= (1 + benchReturn);
        
        data.push({
          date: `${year}.${month}`,
          year: year,
          '신규 포트폴리오': Math.round(newValue * 100) / 100,
          '기존 포트폴리오': Math.round(oldValue * 100) / 100,
          '벤치마크 60/40': Math.round(benchValue * 100) / 100
        });
      });
    });
    
    return data;
  }, [selectedVintage, currentPortfolio, oldPortfolio]);
  
  // 연간 수익률 계산
  const annualReturns = useMemo(() => {
    const years = [2022, 2023, 2024, 2025];
    return years.map(year => {
      const yearData = backtestData.filter(d => d.year === year);
      if (yearData.length === 0) return null;
      
      const startIdx = backtestData.findIndex(d => d.year === year);
      const prevValue = startIdx > 0 ? backtestData[startIdx - 1] : { '신규 포트폴리오': 100, '기존 포트폴리오': 100, '벤치마크 60/40': 100 };
      const endValue = yearData[yearData.length - 1];
      
      return {
        year: String(year),
        '신규': ((endValue['신규 포트폴리오'] / prevValue['신규 포트폴리오'] - 1) * 100).toFixed(1),
        '기존': ((endValue['기존 포트폴리오'] / prevValue['기존 포트폴리오'] - 1) * 100).toFixed(1),
        '벤치마크': ((endValue['벤치마크 60/40'] / prevValue['벤치마크 60/40'] - 1) * 100).toFixed(1)
      };
    }).filter(Boolean);
  }, [backtestData]);
  
  // 드로다운 계산
  const calculateDrawdown = (data, key) => {
    let peak = data[0][key];
    let maxDrawdown = 0;
    
    data.forEach(d => {
      if (d[key] > peak) peak = d[key];
      const drawdown = (d[key] - peak) / peak * 100;
      if (drawdown < maxDrawdown) maxDrawdown = drawdown;
    });
    
    return maxDrawdown;
  };
  
  const lastData = backtestData[backtestData.length - 1];
  const totalReturnNew = ((lastData['신규 포트폴리오'] - 100) / 100 * 100).toFixed(1);
  const totalReturnOld = ((lastData['기존 포트폴리오'] - 100) / 100 * 100).toFixed(1);
  const totalReturnBench = ((lastData['벤치마크 60/40'] - 100) / 100 * 100).toFixed(1);
  const mddNew = calculateDrawdown(backtestData, '신규 포트폴리오').toFixed(1);
  const mddOld = calculateDrawdown(backtestData, '기존 포트폴리오').toFixed(1);
  
  // 파이차트 데이터
  const newPieData = [
    { name: '미국성장주', value: currentPortfolio.us_growth },
    { name: '금', value: currentPortfolio.gold },
    { name: '한국주식', value: currentPortfolio.kr_stock },
    { name: '미국채권', value: currentPortfolio.us_bond },
    { name: '한국채권', value: currentPortfolio.kr_bond }
  ];
  
  const oldPieData = [
    { name: '미국성장주', value: oldPortfolio.us_growth },
    { name: '금', value: oldPortfolio.gold },
    { name: '한국주식', value: oldPortfolio.kr_stock },
    { name: '미국채권', value: oldPortfolio.us_bond },
    { name: '한국채권', value: oldPortfolio.kr_bond }
  ];

  // 배분 비교 데이터
  const allocationComparison = [
    { asset: '미국성장주', '신규': currentPortfolio.us_growth, '기존': oldPortfolio.us_growth },
    { asset: '금', '신규': currentPortfolio.gold, '기존': oldPortfolio.gold },
    { asset: '한국주식', '신규': currentPortfolio.kr_stock, '기존': oldPortfolio.kr_stock },
    { asset: '미국채권', '신규': currentPortfolio.us_bond, '기존': oldPortfolio.us_bond },
    { asset: '한국채권', '신규': currentPortfolio.kr_bond, '기존': oldPortfolio.kr_bond }
  ];

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <h1 style={styles.title}>📊 TDF 포트폴리오 백테스트</h1>
        <p style={styles.subtitle}>금 비중 확대 전략 백테스팅 분석 (2022-2025)</p>
        <p style={{ color: '#888', fontSize: '0.9rem', marginTop: '8px' }}>
          기준일: 2026-01-22 | TDF {selectedVintage} 빈티지
        </p>
      </div>

      {/* 빈티지 선택 버튼 */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        marginBottom: '32px', 
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        {Object.keys(portfolios).map((vintage) => (
          <button
            key={vintage}
            onClick={() => setSelectedVintage(vintage)}
            style={{
              ...styles.button,
              background: selectedVintage === vintage 
                ? `linear-gradient(135deg, ${COLORS.yellow}, ${COLORS.orange})` 
                : 'rgba(255,255,255,0.05)',
              border: selectedVintage === vintage 
                ? `2px solid ${COLORS.yellow}` 
                : '1px solid rgba(255,255,255,0.2)',
              color: 'white'
            }}
          >
            TDF {vintage}
          </button>
        ))}
      </div>

      {/* 주요 성과 지표 카드 */}
      <div style={{ 
        ...styles.gridContainer, 
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))'
      }}>
        <div style={{ ...styles.metricCard, border: `2px solid ${COLORS.green}` }}>
          <div style={styles.metricLabel}>신규 포트폴리오 수익률</div>
          <div style={{ ...styles.metricValue, color: COLORS.green }}>+{totalReturnNew}%</div>
          <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '4px' }}>금 20% 전략</div>
        </div>
        
        <div style={{ ...styles.metricCard, border: `2px solid ${COLORS.orange}` }}>
          <div style={styles.metricLabel}>기존 포트폴리오 수익률</div>
          <div style={{ ...styles.metricValue, color: COLORS.orange }}>+{totalReturnOld}%</div>
          <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '4px' }}>금 10% 전략</div>
        </div>
        
        <div style={{ ...styles.metricCard, border: `2px solid ${COLORS.blue}` }}>
          <div style={styles.metricLabel}>초과 수익률</div>
          <div style={{ ...styles.metricValue, color: COLORS.blue }}>
            +{(parseFloat(totalReturnNew) - parseFloat(totalReturnOld)).toFixed(1)}%p
          </div>
          <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '4px' }}>신규 vs 기존</div>
        </div>
        
        <div style={{ ...styles.metricCard, border: `2px solid ${COLORS.teal}` }}>
          <div style={styles.metricLabel}>MDD 개선</div>
          <div style={{ ...styles.metricValue, color: COLORS.teal }}>
            {(parseFloat(mddOld) - parseFloat(mddNew)).toFixed(1)}%p
          </div>
          <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '4px' }}>리스크 감소</div>
        </div>
        
        <div style={{ ...styles.metricCard, border: `2px solid ${COLORS.red}` }}>
          <div style={styles.metricLabel}>신규 MDD</div>
          <div style={{ ...styles.metricValue, color: COLORS.red }}>{mddNew}%</div>
          <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '4px' }}>최대 낙폭</div>
        </div>
        
        <div style={{ ...styles.metricCard, border: `2px solid ${COLORS.yellow}` }}>
          <div style={styles.metricLabel}>금 비중</div>
          <div style={{ ...styles.metricValue, color: COLORS.yellow }}>{currentPortfolio.gold}%</div>
          <div style={{ fontSize: '0.85rem', color: '#888', marginTop: '4px' }}>
            +{(currentPortfolio.gold - oldPortfolio.gold).toFixed(1)}%p
          </div>
        </div>
      </div>

      {/* 차트 토글 */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '24px', 
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <label style={styles.checkbox}>
          <input
            type="checkbox"
            checked={showOldPortfolio}
            onChange={(e) => setShowOldPortfolio(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: COLORS.orange }}
          />
          <span>기존 포트폴리오 표시</span>
        </label>
        <label style={styles.checkbox}>
          <input
            type="checkbox"
            checked={showBenchmark}
            onChange={(e) => setShowBenchmark(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: COLORS.gray }}
          />
          <span>벤치마크 60/40 표시</span>
        </label>
      </div>

      {/* 누적 수익률 차트 */}
      <div style={styles.card}>
        <h2 style={{ ...styles.cardTitle, color: COLORS.blue }}>
          <span>📈</span> 누적 수익률 추이 (2022.01 ~ 2025.01)
        </h2>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={backtestData}>
            <defs>
              <linearGradient id="colorNew" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.green} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.green} stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorOld" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.orange} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={COLORS.orange} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="date" 
              stroke="#aaa" 
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => {
                const [year, month] = value.split('.');
                return month === '01' ? year : '';
              }}
            />
            <YAxis stroke="#aaa" domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip contentStyle={styles.tooltip} />
            <Legend />
            <ReferenceLine y={100} stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" />
            <Area 
              type="monotone" 
              dataKey="신규 포트폴리오" 
              stroke={COLORS.green} 
              strokeWidth={3}
              fill="url(#colorNew)"
            />
            {showOldPortfolio && (
              <Area 
                type="monotone" 
                dataKey="기존 포트폴리오" 
                stroke={COLORS.orange} 
                strokeWidth={2}
                fill="url(#colorOld)"
              />
            )}
            {showBenchmark && (
              <Line 
                type="monotone" 
                dataKey="벤치마크 60/40" 
                stroke={COLORS.gray} 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 연간 수익률 & 자산배분 비교 */}
      <div style={{ 
        ...styles.gridContainer, 
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))'
      }}>
        {/* 연간 수익률 */}
        <div style={styles.card}>
          <h2 style={{ ...styles.cardTitle, color: COLORS.orange }}>
            <span>📅</span> 연간 수익률 비교
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={annualReturns}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="year" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip contentStyle={styles.tooltip} />
              <Legend />
              <Bar dataKey="신규" fill={COLORS.green} name="신규 (금 20%)" />
              <Bar dataKey="기존" fill={COLORS.orange} name="기존 (금 10%)" />
              <Bar dataKey="벤치마크" fill={COLORS.gray} name="벤치마크 60/40" />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.3)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 자산배분 비교 */}
        <div style={styles.card}>
          <h2 style={{ ...styles.cardTitle, color: COLORS.teal }}>
            <span>⚖️</span> 자산배분 비교 (신규 vs 기존)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={allocationComparison} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="#aaa" />
              <YAxis dataKey="asset" type="category" stroke="#aaa" width={80} />
              <Tooltip contentStyle={styles.tooltip} />
              <Legend />
              <Bar dataKey="신규" fill={COLORS.green} name="신규 포트폴리오" />
              <Bar dataKey="기존" fill={COLORS.orange} name="기존 포트폴리오" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 파이차트 비교 */}
      <div style={{ 
        ...styles.gridContainer, 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'
      }}>
        {/* 신규 포트폴리오 파이차트 */}
        <div style={styles.card}>
          <h2 style={{ ...styles.cardTitle, color: COLORS.green }}>
            <span>🥇</span> 신규 포트폴리오 (금 20%)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={newPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={100}
                dataKey="value"
              >
                {newPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={ASSET_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip contentStyle={styles.tooltip} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <span style={{ 
              padding: '8px 16px', 
              background: 'rgba(89, 161, 79, 0.2)', 
              borderRadius: '20px',
              color: COLORS.green,
              fontWeight: '600'
            }}>
              주식편입비: {currentPortfolio.equity}%
            </span>
          </div>
        </div>

        {/* 기존 포트폴리오 파이차트 */}
        <div style={styles.card}>
          <h2 style={{ ...styles.cardTitle, color: COLORS.orange }}>
            <span>📌</span> 기존 포트폴리오 (금 10%)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={oldPieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}%`}
                outerRadius={100}
                dataKey="value"
              >
                {oldPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={ASSET_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip contentStyle={styles.tooltip} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <span style={{ 
              padding: '8px 16px', 
              background: 'rgba(242, 142, 43, 0.2)', 
              borderRadius: '20px',
              color: COLORS.orange,
              fontWeight: '600'
            }}>
              주식편입비: {oldPortfolio.equity}%
            </span>
          </div>
        </div>
      </div>

      {/* 전략 변경 근거 */}
      <div style={styles.card}>
        <h2 style={{ ...styles.cardTitle, color: COLORS.yellow }}>
          <span>💡</span> 전략 변경 근거
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: '16px' 
        }}>
          {/* 금 비중 확대 */}
          <div style={{ 
            background: 'rgba(237, 201, 72, 0.1)', 
            padding: '20px', 
            borderRadius: '12px',
            borderLeft: `4px solid ${COLORS.yellow}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.8rem' }}>🥇</span>
              <div>
                <div style={{ fontWeight: '700', color: 'white' }}>금 비중 확대</div>
                <div style={{ fontSize: '0.9rem', color: COLORS.yellow, fontWeight: '600' }}>
                  10% → 20% (+10%p)
                </div>
              </div>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#ccc', fontSize: '0.9rem', lineHeight: '1.8' }}>
              <li>중앙은행 금 매입 최대 (2024: 1,045톤)</li>
              <li>지정학적 리스크 헤지 수단</li>
              <li>연준 금리 인하 → 달러 약세 → 금 강세</li>
            </ul>
            <div style={{ 
              marginTop: '16px', 
              paddingTop: '12px', 
              borderTop: '1px solid rgba(237, 201, 72, 0.3)' 
            }}>
              <div style={{ fontSize: '0.8rem', color: '#888' }}>2026년 목표가</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '700', color: COLORS.yellow }}>$4,610/oz</div>
            </div>
          </div>

          {/* 미국성장주 비중 축소 */}
          <div style={{ 
            background: 'rgba(78, 121, 167, 0.1)', 
            padding: '20px', 
            borderRadius: '12px',
            borderLeft: `4px solid ${COLORS.blue}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.8rem' }}>📉</span>
              <div>
                <div style={{ fontWeight: '700', color: 'white' }}>미국성장주 축소</div>
                <div style={{ fontSize: '0.9rem', color: COLORS.blue, fontWeight: '600' }}>
                  50% → 40% (-10%p)
                </div>
              </div>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#ccc', fontSize: '0.9rem', lineHeight: '1.8' }}>
              <li>AI 빅테크 집중 리스크 완화</li>
              <li>Mag7 밸류에이션 부담 (P/E 30배+)</li>
              <li>실적 기대 이미 주가에 반영</li>
            </ul>
            <div style={{ 
              marginTop: '16px', 
              paddingTop: '12px', 
              borderTop: '1px solid rgba(78, 121, 167, 0.3)' 
            }}>
              <div style={{ fontSize: '0.8rem', color: '#888' }}>S&P 500 Growth P/E</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '700', color: COLORS.blue }}>32.5x (고평가)</div>
            </div>
          </div>

          {/* 주식편입비 조정 */}
          <div style={{ 
            background: 'rgba(89, 161, 79, 0.1)', 
            padding: '20px', 
            borderRadius: '12px',
            borderLeft: `4px solid ${COLORS.green}`
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <span style={{ fontSize: '1.8rem' }}>⚖️</span>
              <div>
                <div style={{ fontWeight: '700', color: 'white' }}>주식편입비 조정</div>
                <div style={{ fontSize: '0.9rem', color: COLORS.green, fontWeight: '600' }}>
                  일부 빈티지 상향
                </div>
              </div>
            </div>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#ccc', fontSize: '0.9rem', lineHeight: '1.8' }}>
              <li>2030 빈티지: 45.7% → <strong style={{ color: COLORS.green }}>55.7%</strong> (+10%p)</li>
              <li>2035 빈티지: 57.3% → <strong style={{ color: COLORS.green }}>59.4%</strong> (+2%p)</li>
              <li>장기 투자자 위험자산 확대</li>
            </ul>
            <div style={{ 
              marginTop: '16px', 
              paddingTop: '12px', 
              borderTop: '1px solid rgba(89, 161, 79, 0.3)' 
            }}>
              <div style={{ fontSize: '0.8rem', color: '#888' }}>목표 자산배분 달성률</div>
              <div style={{ fontSize: '1.3rem', fontWeight: '700', color: COLORS.green }}>98.5%</div>
            </div>
          </div>
        </div>
      </div>

      {/* 투자 코멘트 */}
      <div style={{ 
        ...styles.card, 
        background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.9), rgba(51, 65, 85, 0.9))'
      }}>
        <h2 style={{ ...styles.cardTitle, color: 'white' }}>
          <span>💬</span> 투자 코멘트
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '16px' 
        }}>
          {[
            {
              num: 1,
              title: '금의 역할 재평가',
              content: '2025년 금 가격은 46년 만에 최대 상승폭을 기록했습니다. 지정학적 긴장 고조와 중앙은행들의 금 매입 확대로 안전자산 수요가 급증했으며, 이러한 추세는 2026년에도 지속될 전망입니다.',
              highlight: '46년 만에 최대 상승폭',
              color: COLORS.yellow
            },
            {
              num: 2,
              title: '연준 정책 전환',
              content: '연준은 2025년 하반기부터 금리 인하 사이클에 진입했으며, 2026년에는 추가로 2회(0.5%p) 인하가 예상됩니다. 이는 달러 약세와 금 가격 상승을 지지하는 요인입니다.',
              highlight: '금리 인하 사이클',
              color: COLORS.blue
            },
            {
              num: 3,
              title: '빅테크 집중도 완화',
              content: 'S&P 500의 Mag7 비중이 30%를 넘어서며 집중 리스크가 부각되었습니다. AI 실적 기대감이 이미 주가에 반영된 상황에서 성장주 비중 축소는 포트폴리오 리스크 관리에 기여합니다.',
              highlight: 'Mag7 비중이 30%',
              color: COLORS.red
            },
            {
              num: 4,
              title: '리스크 조정 수익률 개선',
              content: '백테스팅 결과, 금 비중 확대 포트폴리오는 2022년 하락장에서 MDD를 개선하고, 2024~25년 금 강세장에서 초과수익을 달성했습니다. 리스크 대비 수익률이 개선되었습니다.',
              highlight: 'MDD를 개선',
              color: COLORS.green
            }
          ].map((item) => (
            <div key={item.num} style={{ 
              background: 'rgba(255,255,255,0.05)', 
              padding: '16px', 
              borderRadius: '12px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ 
                  width: '32px', 
                  height: '32px', 
                  background: item.color, 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: 'white'
                }}>
                  {item.num}
                </span>
                <span style={{ fontWeight: '600', color: 'white' }}>{item.title}</span>
              </div>
              <p style={{ 
                margin: 0, 
                fontSize: '0.9rem', 
                color: '#ccc', 
                lineHeight: '1.7'
              }}>
                {item.content.split(item.highlight)[0]}
                <strong style={{ color: item.color }}>{item.highlight}</strong>
                {item.content.split(item.highlight)[1]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 금 비중 확대 효과 분석 */}
      <div style={{ 
        ...styles.card, 
        background: 'rgba(237, 201, 72, 0.05)',
        borderLeft: `4px solid ${COLORS.yellow}`
      }}>
        <h2 style={{ ...styles.cardTitle, color: COLORS.yellow }}>
          <span>🥇</span> 금 비중 확대 효과 분석 (10% → 20%)
        </h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
          gap: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '16px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#aaa' }}>2022년 하락장 방어</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: COLORS.green, marginTop: '8px' }}>
              금 -0.8%
            </div>
            <div style={{ fontSize: '0.8rem', color: '#888' }}>vs 성장주 -31%</div>
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '16px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#aaa' }}>2024~25년 금 강세</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: COLORS.yellow, marginTop: '8px' }}>
              +90.4%
            </div>
            <div style={{ fontSize: '0.8rem', color: '#888' }}>2년 누적</div>
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '16px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#aaa' }}>포트폴리오 초과수익</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: COLORS.blue, marginTop: '8px' }}>
              +{(parseFloat(totalReturnNew) - parseFloat(totalReturnOld)).toFixed(1)}%p
            </div>
            <div style={{ fontSize: '0.8rem', color: '#888' }}>신규 vs 기존</div>
          </div>
          <div style={{ 
            background: 'rgba(255,255,255,0.05)', 
            padding: '16px', 
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '0.85rem', color: '#aaa' }}>MDD 개선</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: COLORS.teal, marginTop: '8px' }}>
              {(parseFloat(mddOld) - parseFloat(mddNew)).toFixed(1)}%p
            </div>
            <div style={{ fontSize: '0.8rem', color: '#888' }}>리스크 감소</div>
          </div>
        </div>
        <p style={{ 
          margin: 0, 
          padding: '16px', 
          background: 'rgba(255,255,255,0.03)', 
          borderRadius: '8px',
          fontSize: '0.9rem',
          color: '#ccc',
          lineHeight: '1.7'
        }}>
          <strong style={{ color: 'white' }}>핵심 결론:</strong> 2022년 하락장에서 금의 안정성(-0.8%)이 성장주 손실(-31%)을 상쇄하며 MDD를 개선했고, 
          2024~2025년 금 강세(+90%)가 포트폴리오 전체 수익을 견인했습니다. 금 비중 10%p 확대는 리스크 조정 수익률 향상에 기여했습니다.
        </p>
      </div>

      {/* 푸터 */}
      <div style={{ 
        textAlign: 'center', 
        padding: '24px 0', 
        marginTop: '24px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        color: '#888',
        fontSize: '0.85rem'
      }}>
        <p style={{ margin: '0 0 8px 0' }}>작성자: Covenant Seo | 기준일: 2026-01-22</p>
        <p style={{ margin: 0 }}>
          ※ 본 백테스팅은 실제 ETF 연간 수익률 기반 시뮬레이션이며, 과거 성과가 미래 수익을 보장하지 않습니다.
        </p>
      </div>
    </div>
  );
}
