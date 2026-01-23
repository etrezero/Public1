/**
 * @title: Regime 경제 국면 분석
 * @description: 글로벌 경제지표 기반 시장 국면 분석 대시보드
 * @category: 경제분석
 * @icon: 🌍
 * @color: #E15759
 */

import React, { useState, useEffect } from 'react';
import { 
  ScatterChart, Scatter, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';

// Tableau 컬러 팔레트
const COLORS = {
  expansion: '#59A14F',      // 확장 - 초록
  slowdown: '#F28E2B',       // 둔화 - 주황
  contraction: '#E15759',    // 수축 - 빨강
  recovery: '#4E79A7',       // 회복 - 파랑
  blue: '#4E79A7',
  orange: '#F28E2B',
  red: '#E15759',
  teal: '#76B7B2',
  green: '#59A14F',
  yellow: '#EDC948',
};

// 국면별 색상 매핑
const REGIME_COLORS = {
  'Expansion': COLORS.expansion,
  'Slowdown': COLORS.slowdown,
  'Contraction': COLORS.contraction,
  'Recovery': COLORS.recovery,
  '확장': COLORS.expansion,
  '둔화': COLORS.slowdown,
  '수축': COLORS.contraction,
  '회복': COLORS.recovery,
};

// 샘플 데이터 (실제로는 API에서 가져와야 함)
const sampleRegimeData = [
  { date: '2020-01', regime: 'Contraction', gdp: -5.0, unemployment: 13.0, inflation: 0.3, sp500: 2584 },
  { date: '2020-07', regime: 'Recovery', gdp: 33.4, unemployment: 10.2, inflation: 1.0, sp500: 3271 },
  { date: '2021-01', regime: 'Expansion', gdp: 6.3, unemployment: 6.7, inflation: 1.4, sp500: 3714 },
  { date: '2021-07', regime: 'Expansion', gdp: 6.7, unemployment: 5.9, inflation: 5.4, sp500: 4395 },
  { date: '2022-01', regime: 'Slowdown', gdp: -1.6, unemployment: 3.6, inflation: 7.9, sp500: 4515 },
  { date: '2022-07', regime: 'Slowdown', gdp: -0.6, unemployment: 3.5, inflation: 8.5, sp500: 3785 },
  { date: '2023-01', regime: 'Recovery', gdp: 2.6, unemployment: 3.4, inflation: 6.4, sp500: 4077 },
  { date: '2023-07', regime: 'Expansion', gdp: 4.9, unemployment: 3.5, inflation: 3.2, sp500: 4588 },
  { date: '2024-01', regime: 'Expansion', gdp: 3.4, unemployment: 3.7, inflation: 3.1, sp500: 4845 },
  { date: '2024-07', regime: 'Expansion', gdp: 3.0, unemployment: 4.1, inflation: 3.0, sp500: 5567 },
];

// 경제지표 레이더 차트 데이터
const currentIndicators = [
  { indicator: 'GDP 성장률', value: 3.0, fullMark: 10 },
  { indicator: '실업률', value: 4.1, fullMark: 15 },
  { indicator: '인플레이션', value: 3.0, fullMark: 10 },
  { indicator: '금리', value: 5.5, fullMark: 10 },
  { indicator: 'VIX', value: 14.5, fullMark: 50 },
  { indicator: '주택착공', value: 1.5, fullMark: 2.0 },
];

// 국면별 통계
const regimeStats = [
  { regime: 'Expansion', count: 24, avgReturn: 12.5, volatility: 12.3, sharpe: 1.02 },
  { regime: 'Slowdown', count: 8, avgReturn: -2.3, volatility: 18.5, sharpe: -0.12 },
  { regime: 'Contraction', count: 6, avgReturn: -15.2, volatility: 25.7, sharpe: -0.59 },
  { regime: 'Recovery', count: 10, avgReturn: 18.4, volatility: 16.2, sharpe: 1.14 },
];

// 자산배분 추천
const assetAllocation = {
  'Expansion': { stocks: 70, bonds: 20, commodities: 5, cash: 5 },
  'Slowdown': { stocks: 40, bonds: 40, commodities: 10, cash: 10 },
  'Contraction': { stocks: 20, bonds: 50, commodities: 5, cash: 25 },
  'Recovery': { stocks: 60, bonds: 25, commodities: 10, cash: 5 },
};

export default function RegimeAnalysis() {
  const [currentRegime, setCurrentRegime] = useState('Expansion');
  const [selectedMetric, setSelectedMetric] = useState('gdp');
  const [timeframe, setTimeframe] = useState('all');

  // 현재 국면의 자산배분
  const currentAllocation = Object.entries(assetAllocation[currentRegime]).map(([asset, value]) => ({
    asset,
    value,
    color: asset === 'stocks' ? COLORS.blue : 
           asset === 'bonds' ? COLORS.green : 
           asset === 'commodities' ? COLORS.orange : COLORS.teal
  }));

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
          background: `linear-gradient(135deg, ${COLORS.red}, ${COLORS.orange})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          🌍 Regime Analysis
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem', margin: 0 }}>
          글로벌 경제지표 기반 시장 국면 분석
        </p>
      </div>

      {/* 현재 국면 카드 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '24px',
          border: `3px solid ${REGIME_COLORS[currentRegime]}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎯</div>
          <h3 style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '8px' }}>현재 국면</h3>
          <div style={{ 
            fontSize: '2rem', 
            fontWeight: '700',
            color: REGIME_COLORS[currentRegime]
          }}>
            {currentRegime}
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📊</div>
          <h3 style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '8px' }}>GDP 성장률</h3>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: COLORS.green }}>
            +3.0%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💼</div>
          <h3 style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '8px' }}>실업률</h3>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: COLORS.blue }}>
            4.1%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📈</div>
          <h3 style={{ fontSize: '1.2rem', color: '#aaa', marginBottom: '8px' }}>인플레이션</h3>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: COLORS.orange }}>
            3.0%
          </div>
        </div>
      </div>

      {/* 국면 변화 타임라인 */}
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
          color: COLORS.blue
        }}>
          📅 경제 국면 변화 타임라인
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={sampleRegimeData}>
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
            <Line 
              type="monotone" 
              dataKey="sp500" 
              stroke={COLORS.blue} 
              strokeWidth={3}
              name="S&P 500"
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* 국면 타임라인 바 */}
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', height: '40px', borderRadius: '8px', overflow: 'hidden' }}>
            {sampleRegimeData.map((item, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  background: REGIME_COLORS[item.regime],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: '600',
                  color: 'white',
                  borderRight: '1px solid rgba(0,0,0,0.2)'
                }}
              >
                {item.regime.slice(0, 3)}
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', marginTop: '8px' }}>
            {sampleRegimeData.map((item, idx) => (
              <div key={idx} style={{ flex: 1, textAlign: 'center', fontSize: '0.7rem', color: '#888' }}>
                {item.date}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 경제지표 레이더 차트 & 국면별 통계 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '24px'
      }}>
        {/* 레이더 차트 */}
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
            🎯 현재 경제지표 스코어
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={currentIndicators}>
              <PolarGrid stroke="rgba(255,255,255,0.2)" />
              <PolarAngleAxis dataKey="indicator" stroke="#aaa" />
              <PolarRadiusAxis stroke="#aaa" />
              <Radar 
                name="현재 지표" 
                dataKey="value" 
                stroke={COLORS.teal} 
                fill={COLORS.teal} 
                fillOpacity={0.6} 
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 국면별 통계 */}
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
            📊 국면별 성과 통계
          </h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={regimeStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="regime" stroke="#aaa" />
              <YAxis stroke="#aaa" />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(26, 26, 46, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="avgReturn" name="평균 수익률 (%)" fill={COLORS.blue}>
                {regimeStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={REGIME_COLORS[entry.regime]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 추천 자산배분 */}
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
          💼 {currentRegime} 국면 추천 자산배분
        </h2>
        
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <ResponsiveContainer width="50%" height={300}>
            <BarChart data={currentAllocation} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis type="number" stroke="#aaa" />
              <YAxis dataKey="asset" type="category" stroke="#aaa" />
              <Tooltip 
                contentStyle={{ 
                  background: 'rgba(26, 26, 46, 0.95)', 
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="value" name="비중 (%)">
                {currentAllocation.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          <div style={{ flex: 1 }}>
            {currentAllocation.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                marginBottom: '8px',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '8px',
                borderLeft: `4px solid ${item.color}`
              }}>
                <span style={{ fontSize: '1.1rem', textTransform: 'capitalize' }}>
                  {item.asset === 'stocks' ? '주식' :
                   item.asset === 'bonds' ? '채권' :
                   item.asset === 'commodities' ? '원자재' : '현금'}
                </span>
                <span style={{ fontSize: '1.5rem', fontWeight: '700', color: item.color }}>
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(89, 161, 79, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(89, 161, 79, 0.3)'
        }}>
          <strong style={{ color: COLORS.green }}>💡 투자 전략:</strong>
          <p style={{ margin: '8px 0 0 0', lineHeight: 1.6 }}>
            {currentRegime === 'Expansion' && '확장기에는 주식 비중을 높이고 성장주에 집중하세요.'}
            {currentRegime === 'Slowdown' && '둔화기에는 방어적 자산과 채권 비중을 늘리세요.'}
            {currentRegime === 'Contraction' && '수축기에는 현금과 채권으로 안전 자산을 확보하세요.'}
            {currentRegime === 'Recovery' && '회복기에는 경기민감주와 원자재에 투자하세요.'}
          </p>
        </div>
      </div>
    </div>
  );
}
