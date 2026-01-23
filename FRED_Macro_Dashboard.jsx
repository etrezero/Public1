/**
 * @title: FRED Macro 경제지표
 * @description: 미국 연방준비은행(FRED) 주요 거시경제 지표 대시보드
 * @category: 경제분석
 * @icon: 📈
 * @color: #76B7B2
 */

import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ComposedChart, ScatterChart, Scatter
} from 'recharts';

// API 설정
const API_BASE_URL = 'http://localhost:9013/api/v1';

// Tableau 컬러 팔레트
const COLORS = {
  blue: '#4E79A7',
  orange: '#F28E2B',
  red: '#E15759',
  teal: '#76B7B2',
  green: '#59A14F',
  yellow: '#EDC948',
  purple: '#B07AA1',
  brown: '#9C755F',
  pink: '#F28CB1',
  gray: '#BAB0AC',
};

// 샘플 데이터 (실제로는 FRED API에서 가져와야 함)
const sampleData = {
  gdp: [
    { date: '2020 Q1', value: 21538, yoy: -5.0 },
    { date: '2020 Q2', value: 19520, yoy: -31.2 },
    { date: '2020 Q3', value: 21170, yoy: 33.8 },
    { date: '2020 Q4', value: 21477, yoy: 4.5 },
    { date: '2021 Q1', value: 22038, yoy: 6.3 },
    { date: '2021 Q2', value: 22740, yoy: 6.7 },
    { date: '2021 Q3', value: 23202, yoy: 2.3 },
    { date: '2021 Q4', value: 23992, yoy: 6.9 },
    { date: '2022 Q1', value: 24342, yoy: -1.6 },
    { date: '2022 Q2', value: 24880, yoy: -0.6 },
    { date: '2022 Q3', value: 25273, yoy: 3.2 },
    { date: '2022 Q4', value: 25751, yoy: 2.6 },
    { date: '2023 Q1', value: 26139, yoy: 2.0 },
    { date: '2023 Q2', value: 26624, yoy: 2.1 },
    { date: '2023 Q3', value: 27610, yoy: 4.9 },
    { date: '2023 Q4', value: 28268, yoy: 3.4 },
  ],
  inflation: [
    { date: '2023-01', cpi: 6.4, core: 5.6, pce: 5.3 },
    { date: '2023-04', cpi: 4.9, core: 5.5, pce: 4.6 },
    { date: '2023-07', cpi: 3.2, core: 4.7, pce: 3.3 },
    { date: '2023-10', cpi: 3.2, core: 4.0, pce: 3.4 },
    { date: '2024-01', cpi: 3.1, core: 3.9, pce: 2.8 },
    { date: '2024-04', cpi: 3.4, core: 3.6, pce: 2.7 },
    { date: '2024-07', cpi: 2.9, core: 3.2, pce: 2.5 },
    { date: '2024-10', cpi: 2.6, core: 3.3, pce: 2.3 },
  ],
  employment: [
    { date: '2023-01', rate: 3.4, participation: 62.4, jobless: 5.7 },
    { date: '2023-04', rate: 3.4, participation: 62.6, jobless: 5.7 },
    { date: '2023-07', rate: 3.5, participation: 62.6, jobless: 5.8 },
    { date: '2023-10', rate: 3.8, participation: 62.7, jobless: 6.3 },
    { date: '2024-01', rate: 3.7, participation: 62.5, jobless: 6.1 },
    { date: '2024-04', rate: 3.9, participation: 62.7, jobless: 6.5 },
    { date: '2024-07', rate: 4.1, participation: 62.7, jobless: 6.7 },
    { date: '2024-10', rate: 4.1, participation: 62.6, jobless: 6.8 },
  ],
  rates: [
    { date: '2023-01', fed: 4.50, treasury2y: 4.25, treasury10y: 3.51, spread: -0.74 },
    { date: '2023-04', fed: 5.00, treasury2y: 4.03, treasury10y: 3.42, spread: -0.61 },
    { date: '2023-07', fed: 5.25, treasury2y: 4.87, treasury10y: 3.96, spread: -0.91 },
    { date: '2023-10', fed: 5.50, treasury2y: 5.12, treasury10y: 4.88, spread: -0.24 },
    { date: '2024-01', fed: 5.50, treasury2y: 4.37, treasury10y: 4.14, spread: -0.23 },
    { date: '2024-04', fed: 5.50, treasury2y: 4.99, treasury10y: 4.70, spread: -0.29 },
    { date: '2024-07', fed: 5.50, treasury2y: 4.36, treasury10y: 4.28, spread: -0.08 },
    { date: '2024-10', fed: 5.00, treasury2y: 3.98, treasury10y: 4.08, spread: 0.10 },
  ],
  housing: [
    { date: '2023-01', starts: 1.31, permits: 1.34, caseShiller: 305.2, mortgage30y: 6.09 },
    { date: '2023-04', starts: 1.43, permits: 1.42, caseShiller: 307.1, mortgage30y: 6.39 },
    { date: '2023-07', starts: 1.45, permits: 1.44, caseShiller: 308.8, mortgage30y: 6.96 },
    { date: '2023-10', starts: 1.37, permits: 1.49, caseShiller: 309.4, mortgage30y: 7.79 },
    { date: '2024-01', starts: 1.33, permits: 1.47, caseShiller: 311.2, mortgage30y: 6.62 },
    { date: '2024-04', starts: 1.36, permits: 1.44, caseShiller: 316.5, mortgage30y: 6.82 },
    { date: '2024-07', starts: 1.24, permits: 1.41, caseShiller: 320.1, mortgage30y: 6.73 },
    { date: '2024-10', starts: 1.31, permits: 1.43, caseShiller: 324.5, mortgage30y: 6.08 },
  ],
};

export default function FREDMacro() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedIndicator, setSelectedIndicator] = useState('gdp');
  
  // API 데이터 상태
  const [keyIndicators, setKeyIndicators] = useState([]);
  const [gdpData, setGdpData] = useState({ data: [], latest: null });
  const [inflationData, setInflationData] = useState({ data: [], latest: null });
  const [employmentData, setEmploymentData] = useState({ data: [], latest: null });
  const [ratesData, setRatesData] = useState({ data: [], latest: null });
  const [housingData, setHousingData] = useState({ data: [], latest: null });
  const [industrialData, setIndustrialData] = useState({ data: [], latest: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiAvailable, setApiAvailable] = useState(false);

  // API 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // API 헬스 체크
        const healthResponse = await fetch(`${API_BASE_URL}/health`);
        if (!healthResponse.ok) throw new Error('API 서버 연결 실패');
        const healthData = await healthResponse.json();
        setApiAvailable(healthData.fred_api_available);

        // 주요 지표 조회
        const keyResponse = await fetch(`${API_BASE_URL}/indicators/key`);
        if (keyResponse.ok) {
          const keyData = await keyResponse.json();
          const indicators = keyData.indicators;
          
          // 지표 카드 데이터 구성
          setKeyIndicators([
            { 
              name: 'GDP 성장률', 
              value: indicators.gdp_growth ? `${indicators.gdp_growth > 0 ? '+' : ''}${indicators.gdp_growth.toFixed(1)}%` : 'N/A',
              trend: indicators.gdp_growth > 0 ? 'up' : 'down',
              color: indicators.gdp_growth > 0 ? COLORS.green : COLORS.red,
              icon: '📊'
            },
            { 
              name: '실업률', 
              value: indicators.unemployment ? `${indicators.unemployment.toFixed(1)}%` : 'N/A',
              trend: 'neutral',
              color: COLORS.orange,
              icon: '💼'
            },
            { 
              name: 'CPI 인플레이션', 
              value: indicators.cpi_inflation ? `${indicators.cpi_inflation.toFixed(1)}%` : 'N/A',
              trend: indicators.cpi_inflation < 3 ? 'down' : 'up',
              color: COLORS.blue,
              icon: '📉'
            },
            { 
              name: '연준 기준금리', 
              value: indicators.fed_funds_rate ? `${indicators.fed_funds_rate.toFixed(2)}%` : 'N/A',
              trend: 'neutral',
              color: COLORS.teal,
              icon: '💰'
            },
            { 
              name: '10Y-2Y 스프레드', 
              value: indicators.yield_spread_10y_2y ? `${indicators.yield_spread_10y_2y > 0 ? '+' : ''}${indicators.yield_spread_10y_2y.toFixed(2)}%` : 'N/A',
              trend: indicators.yield_spread_10y_2y > 0 ? 'up' : 'down',
              color: indicators.yield_spread_10y_2y > 0 ? COLORS.green : COLORS.red,
              icon: '📈'
            },
            { 
              name: 'VIX 지수', 
              value: indicators.vix ? indicators.vix.toFixed(1) : 'N/A',
              trend: indicators.vix < 20 ? 'down' : 'up',
              color: COLORS.gray,
              icon: '🎢'
            }
          ]);
        }

        // GDP 데이터 조회
        const gdpResponse = await fetch(`${API_BASE_URL}/gdp?period=5y`);
        if (gdpResponse.ok) {
          const gdpResult = await gdpResponse.json();
          setGdpData(gdpResult.gdp);
        }

        // 인플레이션 데이터 조회
        const inflationResponse = await fetch(`${API_BASE_URL}/inflation?period=3y`);
        if (inflationResponse.ok) {
          const inflationResult = await inflationResponse.json();
          setInflationData(inflationResult.inflation);
        }

        // 고용 데이터 조회
        const employmentResponse = await fetch(`${API_BASE_URL}/employment?period=3y`);
        if (employmentResponse.ok) {
          const employmentResult = await employmentResponse.json();
          setEmploymentData(employmentResult.employment);
        }

        // 금리 데이터 조회
        const ratesResponse = await fetch(`${API_BASE_URL}/interest-rates?period=3y`);
        if (ratesResponse.ok) {
          const ratesResult = await ratesResponse.json();
          setRatesData(ratesResult.interest_rates);
        }

        // 주택 데이터 조회
        const housingResponse = await fetch(`${API_BASE_URL}/housing?period=3y`);
        if (housingResponse.ok) {
          const housingResult = await housingResponse.json();
          setHousingData(housingResult.housing);
        }

        // 산업·제조업 데이터 조회
        const industrialResponse = await fetch(`${API_BASE_URL}/industrial?period=3y`);
        if (industrialResponse.ok) {
          const industrialResult = await industrialResponse.json();
          setIndustrialData(industrialResult.industrial);
        }

        setLoading(false);
      } catch (err) {
        console.error('FRED API 조회 오류:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#e8e8e8'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
          <div style={{ fontSize: '20px' }}>FRED 데이터 로딩 중...</div>
          {!apiAvailable && (
            <div style={{ fontSize: '14px', color: '#888', marginTop: '8px' }}>
              (FRED API 키가 없으면 더미 데이터가 표시됩니다)
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
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
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>API 연결 실패</div>
          <div style={{ color: '#888', fontSize: '14px' }}>{error}</div>
          <div style={{ color: '#888', fontSize: '14px', marginTop: '16px' }}>
            FRED Macro API 서버(port 9013)가 실행 중인지 확인해주세요.
          </div>
          <div style={{ color: '#888', fontSize: '12px', marginTop: '8px' }}>
            환경변수 FRED_API_KEY가 설정되어 있는지도 확인하세요.
          </div>
        </div>
      </div>
    );
  }

  const categories = [
    'all', '금리·인플레이션', '고용·소비', 'GDP·경제성장', 
    '주택·부동산', '산업·제조업', '금융시장'
  ];

  // 카테고리별 표시 섹션 결정
  const shouldShowSection = (sectionName) => {
    if (selectedCategory === 'all') return true;
    
    const categoryMap = {
      'GDP·경제성장': ['gdp'],
      '금리·인플레이션': ['inflation', 'rates'],
      '고용·소비': ['employment'],
      '주택·부동산': ['housing'],
      '산업·제조업': ['industrial'],
      '금융시장': ['rates']
    };
    
    return categoryMap[selectedCategory]?.includes(sectionName) || false;
  };

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
          background: `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.blue})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          📈 FRED Macro Dashboard
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem', margin: 0 }}>
          미국 연방준비은행(FRED) 주요 거시경제 지표
        </p>
      </div>

      {/* 주요 지표 카드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginBottom: '32px'
      }}>
        {keyIndicators.map((item, idx) => (
          <div key={idx} style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            padding: '20px',
            border: `2px solid ${item.color}`,
            textAlign: 'center',
            transition: 'transform 0.3s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{item.icon}</div>
            <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>
              {item.name}
            </div>
            <div style={{ 
              fontSize: '1.8rem', 
              fontWeight: '700',
              color: item.color,
              marginBottom: '4px'
            }}>
              {item.value}
            </div>
            <div style={{ fontSize: '0.75rem', color: item.trend === 'up' ? COLORS.red : COLORS.green }}>
              {item.trend === 'up' ? '▲' : '▼'}
            </div>
          </div>
        ))}
      </div>

      {/* 카테고리 필터 */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: selectedCategory === cat ? `2px solid ${COLORS.teal}` : '1px solid rgba(255,255,255,0.2)',
              background: selectedCategory === cat 
                ? `linear-gradient(135deg, ${COLORS.teal}, ${COLORS.blue})` 
                : 'rgba(255,255,255,0.05)',
              color: 'white',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: '600',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              if (selectedCategory !== cat) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (selectedCategory !== cat) {
                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
              }
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GDP 성장률 */}
      {shouldShowSection('gdp') && (
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
          📊 Real GDP 성장률 (미국)
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={sampleData.gdp}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#aaa" />
            <YAxis yAxisId="left" stroke="#aaa" />
            <YAxis yAxisId="right" orientation="right" stroke="#aaa" />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(26, 26, 46, 0.95)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="value" fill={COLORS.green} name="GDP (억달러)" opacity={0.8} />
            <Line yAxisId="right" type="monotone" dataKey="yoy" stroke={COLORS.blue} strokeWidth={3} name="YoY (%)" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      )}

      {/* 인플레이션 */}
      {shouldShowSection('inflation') && (
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
          📈 인플레이션 지표 (YoY %)
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={sampleData.inflation}>
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
            <Line type="monotone" dataKey="cpi" stroke={COLORS.orange} strokeWidth={3} name="CPI" />
            <Line type="monotone" dataKey="core" stroke={COLORS.red} strokeWidth={3} name="Core CPI" />
            <Line type="monotone" dataKey="pce" stroke={COLORS.yellow} strokeWidth={3} name="PCE" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      )}

      {/* 고용 지표 & 금리 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* 고용 */}
        {shouldShowSection('employment') && (
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
            💼 고용 지표
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sampleData.employment}>
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
              <Line type="monotone" dataKey="rate" stroke={COLORS.blue} strokeWidth={3} name="실업률 (%)" />
              <Line type="monotone" dataKey="participation" stroke={COLORS.teal} strokeWidth={2} name="경제활동참가율 (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        )}

        {/* 금리 */}
        {shouldShowSection('rates') && (
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
            💰 금리 및 수익률 곡선
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sampleData.rates}>
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
              <Line type="monotone" dataKey="fed" stroke={COLORS.red} strokeWidth={3} name="연준금리 (%)" />
              <Line type="monotone" dataKey="treasury10y" stroke={COLORS.blue} strokeWidth={3} name="10Y Treasury (%)" />
              <Line type="monotone" dataKey="treasury2y" stroke={COLORS.orange} strokeWidth={2} name="2Y Treasury (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        )}
      </div>

      {/* 주택 시장 */}
      {shouldShowSection('housing') && (
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
          🏠 주택 시장 지표
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <ComposedChart data={sampleData.housing}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" stroke="#aaa" />
            <YAxis yAxisId="left" stroke="#aaa" />
            <YAxis yAxisId="right" orientation="right" stroke="#aaa" />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(26, 26, 46, 0.95)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar yAxisId="left" dataKey="starts" fill={COLORS.blue} name="주택착공 (백만호)" opacity={0.8} />
            <Line yAxisId="right" type="monotone" dataKey="mortgage30y" stroke={COLORS.red} strokeWidth={3} name="30Y 모기지 금리 (%)" />
            <Line yAxisId="right" type="monotone" dataKey="caseShiller" stroke={COLORS.yellow} strokeWidth={2} name="Case-Shiller 지수" />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      )}

      {/* 산업·제조업 */}
      {shouldShowSection('industrial') && industrialData.data.length > 0 && (
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
          🏭 산업·제조업 지표
        </h2>
        
        {/* 산업생산지수 & 설비가동률 */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: '#ddd' }}>
            산업생산지수 YoY & 설비가동률
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={industrialData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#aaa"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                }}
              />
              <YAxis yAxisId="left" stroke={COLORS.blue} label={{ value: 'YoY %', angle: -90, position: 'insideLeft', fill: COLORS.blue }} />
              <YAxis yAxisId="right" orientation="right" stroke={COLORS.teal} label={{ value: '설비가동률 %', angle: 90, position: 'insideRight', fill: COLORS.teal }} />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(26, 26, 46, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('ko-KR');
                }}
              />
              <Legend />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="production_yoy" 
                stroke={COLORS.blue} 
                strokeWidth={3} 
                name="산업생산 YoY (%)" 
                dot={false}
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="capacity_utilization" 
                stroke={COLORS.teal} 
                strokeWidth={3} 
                name="설비가동률 (%)" 
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 소매판매 */}
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', color: '#ddd' }}>
            소매판매 YoY
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={industrialData.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#aaa"
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                }}
              />
              <YAxis stroke={COLORS.orange} label={{ value: 'YoY %', angle: -90, position: 'insideLeft', fill: COLORS.orange }} />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(26, 26, 46, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString('ko-KR');
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="retail_yoy" 
                stroke={COLORS.orange} 
                strokeWidth={3} 
                name="소매판매 YoY 성장률 (%)" 
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 최신 값 */}
        {industrialData.latest && (
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {industrialData.latest.production_yoy && (
              <div style={{ padding: '12px', background: 'rgba(78, 121, 167, 0.15)', borderRadius: '8px', border: '1px solid rgba(78, 121, 167, 0.3)' }}>
                <div style={{ fontSize: '0.85rem', color: '#aaa' }}>산업생산 YoY</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: COLORS.blue }}>
                  {industrialData.latest.production_yoy > 0 ? '+' : ''}{industrialData.latest.production_yoy.toFixed(1)}%
                </div>
              </div>
            )}
            {industrialData.latest.capacity_utilization && (
              <div style={{ padding: '12px', background: 'rgba(118, 183, 178, 0.15)', borderRadius: '8px', border: '1px solid rgba(118, 183, 178, 0.3)' }}>
                <div style={{ fontSize: '0.85rem', color: '#aaa' }}>설비가동률</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: COLORS.teal }}>
                  {industrialData.latest.capacity_utilization.toFixed(1)}%
                </div>
              </div>
            )}
            {industrialData.latest.retail_yoy && (
              <div style={{ padding: '12px', background: 'rgba(242, 142, 43, 0.15)', borderRadius: '8px', border: '1px solid rgba(242, 142, 43, 0.3)' }}>
                <div style={{ fontSize: '0.85rem', color: '#aaa' }}>소매판매 YoY</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: COLORS.orange }}>
                  {industrialData.latest.retail_yoy > 0 ? '+' : ''}{industrialData.latest.retail_yoy.toFixed(1)}%
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* 데이터 출처 */}
      <div style={{
        marginTop: '32px',
        padding: '16px',
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '8px',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: '#888'
      }}>
        📊 Data Source: Federal Reserve Economic Data (FRED) | St. Louis Fed
      </div>
    </div>
  );
}
