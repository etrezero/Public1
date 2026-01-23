/**
 * @title: FX Model 환율 예측
 * @description: USD/KRW 환율 예측 모델 및 이상 패턴 감지 대시보드
 * @category: 경제분석
 * @icon: 💱
 * @color: "#E15759"
 */

import React, { useState, useMemo } from 'react';
import { 
  LineChart, Line, BarChart, Bar, ScatterChart, Scatter, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, ComposedChart, RadarChart, Radar,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, ReferenceLine
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

// 환율 히스토리 데이터 (2024년 7월 ~ 2025년 1월)
const historicalData = [
  { date: '2024-07', actual: 1380, rw: 1375, momentum: 1378, arima: 1382, ensemble: 1379 },
  { date: '2024-08', actual: 1335, rw: 1378, momentum: 1340, arima: 1338, ensemble: 1342 },
  { date: '2024-09', actual: 1320, rw: 1332, momentum: 1325, arima: 1322, ensemble: 1326 },
  { date: '2024-10', actual: 1380, rw: 1318, momentum: 1375, arima: 1378, ensemble: 1372 },
  { date: '2024-11', actual: 1410, rw: 1378, momentum: 1405, arima: 1408, ensemble: 1403 },
  { date: '2024-12', actual: 1470, rw: 1408, momentum: 1465, arima: 1468, ensemble: 1462 },
  { date: '2025-01', actual: 1468, rw: 1468, momentum: 1470, arima: 1466, ensemble: 1468 },
];

// 미래 예측 데이터
const forecastData = [
  { period: '현재', rw: 1468, momentum: 1468, arima: 1468, ensemble: 1468 },
  { period: '1개월', rw: 1475, momentum: 1485, arima: 1472, ensemble: 1478 },
  { period: '3개월', rw: 1488, momentum: 1512, arima: 1495, ensemble: 1502 },
  { period: '6개월', rw: 1502, momentum: 1545, arima: 1520, ensemble: 1528 },
  { period: '12개월', rw: 1525, momentum: 1588, arima: 1555, ensemble: 1565 },
];

// 모델 성능 지표
const modelPerformance = [
  { model: 'Random Walk', rmse: 28.5, mae: 22.3, mape: 1.8, correlation: 0.92 },
  { model: 'Momentum', rmse: 18.2, mae: 14.5, mape: 1.2, correlation: 0.96 },
  { model: 'ARIMA', rmse: 15.8, mae: 12.1, mape: 0.95, correlation: 0.98 },
  { model: 'Ensemble', rmse: 14.2, mae: 11.0, mape: 0.85, correlation: 0.98 },
];

// 이상 패턴 탐지 (Isolation Forest + DTW)
const anomalyDetections = [
  { date: '2024-08-05', type: '급락', severity: 'CRITICAL', rate: 1355, metric: 'Isolation Forest', value: -2.85 },
  { date: '2024-10-15', type: '급등', severity: 'HIGH', rate: 1395, metric: 'DTW', value: 45.2 },
  { date: '2024-11-20', type: '변동성 급증', severity: 'HIGH', rate: 1425, metric: 'Volatility', value: 3.2 },
  { date: '2024-12-10', type: '급등', severity: 'CRITICAL', rate: 1480, metric: 'Isolation Forest', value: -3.15 },
];

// 리스크 지표
const riskMetrics = [
  { metric: '변동성', current: 75, historical: 60, threshold: 85 },
  { metric: '트렌드강도', current: 82, historical: 70, threshold: 90 },
  { metric: '이상탐지', current: 68, historical: 50, threshold: 80 },
  { metric: 'DTW거리', current: 55, historical: 45, threshold: 75 },
  { metric: '버블위험', current: 45, historical: 35, threshold: 70 },
];

// 거시경제 지표 상관관계
const macroCorrelations = [
  { indicator: 'DXY (달러인덱스)', correlation: 0.85, current: 108.5, change: 2.3 },
  { indicator: 'US 10Y (미국채)', correlation: -0.72, current: 4.52, change: 0.15 },
  { indicator: 'VIX (변동성)', correlation: 0.68, current: 18.2, change: -1.5 },
  { indicator: 'KOSPI', correlation: -0.65, current: 2485, change: 1.2 },
  { indicator: 'WTI Oil', correlation: 0.42, current: 78.5, change: -2.1 },
  { indicator: 'Gold', correlation: 0.38, current: 2085, change: 0.8 },
];

// 변동성 추이
const volatilityTrend = [
  { date: '2024-07', volatility: 1.2, threshold: 2.0 },
  { date: '2024-08', volatility: 2.8, threshold: 2.0 },
  { date: '2024-09', volatility: 1.5, threshold: 2.0 },
  { date: '2024-10', volatility: 2.3, threshold: 2.0 },
  { date: '2024-11', volatility: 1.8, threshold: 2.0 },
  { date: '2024-12', volatility: 2.5, threshold: 2.0 },
  { date: '2025-01', volatility: 1.6, threshold: 2.0 },
];

// DTW 거리 추이
const dtwDistances = [
  { date: '2024-07', distance: 25.3, threshold: 40 },
  { date: '2024-08', distance: 38.5, threshold: 40 },
  { date: '2024-09', distance: 22.8, threshold: 40 },
  { date: '2024-10', distance: 45.2, threshold: 40 },
  { date: '2024-11', distance: 35.6, threshold: 40 },
  { date: '2024-12', distance: 42.1, threshold: 40 },
  { date: '2025-01', distance: 28.9, threshold: 40 },
];

export default function FXModelDashboard() {
  const [selectedModel, setSelectedModel] = useState('Ensemble');
  const [viewMode, setViewMode] = useState('forecast');
  const [showAnomalies, setShowAnomalies] = useState(true);

  // 현재 환율 정보
  const currentRate = historicalData[historicalData.length - 1];
  const previousRate = historicalData[historicalData.length - 2];
  const rateChange = currentRate.actual - previousRate.actual;
  const rateChangePercent = ((rateChange / previousRate.actual) * 100).toFixed(2);

  // 선택된 모델의 예측 정확도
  const selectedPerformance = useMemo(() => {
    const modelName = selectedModel === 'Ensemble' ? 'Ensemble' : 
                     selectedModel === 'RW' ? 'Random Walk' :
                     selectedModel === 'Momentum' ? 'Momentum' : 'ARIMA';
    return modelPerformance.find(m => m.model === modelName) || modelPerformance[0];
  }, [selectedModel]);

  // 리스크 레벨 계산
  const riskLevel = useMemo(() => {
    const avgMetric = riskMetrics.reduce((sum, m) => sum + m.current, 0) / riskMetrics.length;
    if (avgMetric >= 70) return { level: 'CRITICAL', color: COLORS.red, text: '매우 높음' };
    if (avgMetric >= 55) return { level: 'HIGH', color: COLORS.orange, text: '높음' };
    if (avgMetric >= 40) return { level: 'MEDIUM', color: COLORS.yellow, text: '보통' };
    return { level: 'NORMAL', color: COLORS.green, text: '정상' };
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
          background: `linear-gradient(135deg, ${COLORS.red}, ${COLORS.orange})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          💱 FX Model 환율 예측
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem', margin: 0 }}>
          USD/KRW 환율 예측 모델 및 이상 패턴 감지 대시보드
        </p>
      </div>

      {/* 현재 환율 & 리스크 레벨 */}
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
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>현재 환율</div>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: COLORS.blue }}>
            ₩{currentRate.actual.toLocaleString()}
          </div>
          <div style={{ 
            fontSize: '0.9rem', 
            color: rateChange >= 0 ? COLORS.red : COLORS.green,
            marginTop: '8px'
          }}>
            {rateChange >= 0 ? '▲' : '▼'} {Math.abs(rateChange)} ({rateChangePercent}%)
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${riskLevel.color}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>리스크 레벨</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: riskLevel.color }}>
            {riskLevel.text}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '4px' }}>
            {riskLevel.level}
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.green}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>모델 정확도</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.green }}>
            {(selectedPerformance.correlation * 100).toFixed(1)}%
          </div>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '4px' }}>
            MAPE: {selectedPerformance.mape.toFixed(2)}%
          </div>
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '20px',
          border: `2px solid ${COLORS.orange}`,
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '8px' }}>이상 탐지</div>
          <div style={{ fontSize: '1.8rem', fontWeight: '700', color: COLORS.orange }}>
            {anomalyDetections.length}건
          </div>
          <div style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '4px' }}>
            최근 6개월
          </div>
        </div>
      </div>

      {/* 모델 선택 & 뷰 모드 */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        justifyContent: 'center',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['Ensemble', 'ARIMA', 'Momentum', 'RW'].map((model) => (
            <button
              key={model}
              onClick={() => setSelectedModel(model)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: selectedModel === model ? `2px solid ${COLORS.blue}` : '1px solid rgba(255,255,255,0.2)',
                background: selectedModel === model 
                  ? `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.teal})` 
                  : 'rgba(255,255,255,0.05)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
            >
              {model}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { id: 'forecast', label: '📈 예측' },
            { id: 'anomaly', label: '⚠️ 이상탐지' },
            { id: 'risk', label: '📊 리스크' }
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
      </div>

      {/* 히스토리 & 예측 차트 */}
      {viewMode === 'forecast' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(550px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}>
          {/* 환율 히스토리 */}
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
              📈 환율 히스토리 & 모델 비교
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="date" stroke="#aaa" />
                <YAxis domain={[1280, 1500]} stroke="#aaa" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(26, 26, 46, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="actual" stroke={COLORS.blue} strokeWidth={3} name="실제" />
                <Line type="monotone" dataKey="ensemble" stroke={COLORS.green} strokeWidth={2} strokeDasharray="5 5" name="Ensemble" />
                {selectedModel === 'ARIMA' && (
                  <Line type="monotone" dataKey="arima" stroke={COLORS.purple} strokeWidth={2} name="ARIMA" />
                )}
                {selectedModel === 'Momentum' && (
                  <Line type="monotone" dataKey="momentum" stroke={COLORS.orange} strokeWidth={2} name="Momentum" />
                )}
                {selectedModel === 'RW' && (
                  <Line type="monotone" dataKey="rw" stroke={COLORS.gray} strokeWidth={2} name="Random Walk" />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* 미래 예측 */}
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
              🔮 미래 환율 예측
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={forecastData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="period" stroke="#aaa" />
                <YAxis domain={[1450, 1600]} stroke="#aaa" />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(26, 26, 46, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="ensemble" fill={COLORS.green} name="Ensemble" />
                {selectedModel === 'ARIMA' && <Bar dataKey="arima" fill={COLORS.purple} name="ARIMA" />}
                {selectedModel === 'Momentum' && <Bar dataKey="momentum" fill={COLORS.orange} name="Momentum" />}
                {selectedModel === 'RW' && <Bar dataKey="rw" fill={COLORS.gray} name="Random Walk" />}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 이상 탐지 뷰 */}
      {viewMode === 'anomaly' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}>
          {/* 변동성 추이 */}
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
              📊 변동성 추이
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={volatilityTrend}>
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
                <Area type="monotone" dataKey="volatility" fill={COLORS.orange} stroke={COLORS.orange} fillOpacity={0.6} name="변동성" />
                <ReferenceLine y={2.0} stroke={COLORS.red} strokeDasharray="3 3" label="임계값" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* DTW 거리 */}
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
              🔍 DTW 패턴 거리
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={dtwDistances}>
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
                <Line type="monotone" dataKey="distance" stroke={COLORS.purple} strokeWidth={3} name="DTW 거리" />
                <ReferenceLine y={40} stroke={COLORS.red} strokeDasharray="3 3" label="임계값" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 리스크 분석 뷰 */}
      {viewMode === 'risk' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px',
          marginBottom: '24px'
        }}>
          {/* 리스크 레이더 */}
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
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={riskMetrics}>
                <PolarGrid stroke="rgba(255,255,255,0.2)" />
                <PolarAngleAxis dataKey="metric" stroke="#aaa" />
                <PolarRadiusAxis stroke="#aaa" />
                <Radar name="현재" dataKey="current" stroke={COLORS.red} fill={COLORS.red} fillOpacity={0.6} />
                <Radar name="과거" dataKey="historical" stroke={COLORS.blue} fill={COLORS.blue} fillOpacity={0.3} />
                <Radar name="임계값" dataKey="threshold" stroke={COLORS.orange} fill={COLORS.orange} fillOpacity={0.2} />
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

          {/* 거시경제 상관관계 */}
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
              🌐 거시경제 상관관계
            </h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={macroCorrelations} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" domain={[-1, 1]} stroke="#aaa" />
                <YAxis dataKey="indicator" type="category" stroke="#aaa" width={140} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(26, 26, 46, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="correlation" name="상관계수">
                  {macroCorrelations.map((entry, index) => (
                    <rect 
                      key={`cell-${index}`} 
                      fill={entry.correlation >= 0 ? COLORS.blue : COLORS.red} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* 모델 성능 비교 테이블 */}
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
          color: COLORS.green
        }}>
          📊 모델 성능 비교
        </h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>모델</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>RMSE</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>MAE</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>MAPE (%)</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>상관계수</th>
              <th style={{ padding: '12px', textAlign: 'center', color: COLORS.teal }}>등급</th>
            </tr>
          </thead>
          <tbody>
            {modelPerformance.map((model, idx) => {
              const grade = model.correlation >= 0.97 ? 'A+' : 
                           model.correlation >= 0.95 ? 'A' :
                           model.correlation >= 0.92 ? 'B+' : 'B';
              const gradeColor = grade.startsWith('A') ? COLORS.green : COLORS.yellow;
              
              return (
                <tr key={idx} style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  background: model.model === selectedPerformance.model ? 'rgba(89, 161, 79, 0.1)' : 
                             (idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent')
                }}>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'left',
                    fontWeight: '700'
                  }}>
                    {model.model}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {model.rmse.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {model.mae.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: COLORS.green }}>
                    {model.mape.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', color: COLORS.blue }}>
                    {model.correlation.toFixed(3)}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'center',
                    color: gradeColor,
                    fontWeight: '700',
                    fontSize: '1.1rem'
                  }}>
                    {grade}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 이상 탐지 알림 테이블 */}
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
          color: COLORS.red
        }}>
          ⚠️ 이상 패턴 탐지 알림
        </h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>날짜</th>
              <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>패턴</th>
              <th style={{ padding: '12px', textAlign: 'center', color: COLORS.teal }}>심각도</th>
              <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>탐지 방법</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>환율</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {anomalyDetections.map((alert, idx) => {
              const severityColor = alert.severity === 'CRITICAL' ? COLORS.red : COLORS.orange;
              
              return (
                <tr key={idx} style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
                }}>
                  <td style={{ padding: '12px', textAlign: 'left' }}>
                    {alert.date}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'left',
                    fontWeight: '600',
                    color: alert.type.includes('급등') ? COLORS.red : COLORS.blue
                  }}>
                    {alert.type}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'center'
                  }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      background: severityColor,
                      color: 'white',
                      fontSize: '0.8rem',
                      fontWeight: '700'
                    }}>
                      {alert.severity}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'left', color: '#aaa' }}>
                    {alert.metric}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>
                    ₩{alert.rate.toLocaleString()}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'right',
                    color: COLORS.orange,
                    fontWeight: '600'
                  }}>
                    {alert.value.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 거시경제 지표 현황 */}
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
          🌐 주요 거시경제 지표
        </h2>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '0.9rem'
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid rgba(255,255,255,0.2)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: COLORS.teal }}>지표</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>현재 값</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>변동</th>
              <th style={{ padding: '12px', textAlign: 'right', color: COLORS.teal }}>USD/KRW 상관계수</th>
              <th style={{ padding: '12px', textAlign: 'center', color: COLORS.teal }}>영향도</th>
            </tr>
          </thead>
          <tbody>
            {macroCorrelations.map((indicator, idx) => {
              const absCorr = Math.abs(indicator.correlation);
              const impact = absCorr >= 0.7 ? '높음' : absCorr >= 0.5 ? '중간' : '낮음';
              const impactColor = absCorr >= 0.7 ? COLORS.red : absCorr >= 0.5 ? COLORS.yellow : COLORS.green;
              
              return (
                <tr key={idx} style={{ 
                  borderBottom: '1px solid rgba(255,255,255,0.1)',
                  background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'
                }}>
                  <td style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>
                    {indicator.indicator}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {indicator.current.toLocaleString()}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'right',
                    color: indicator.change >= 0 ? COLORS.red : COLORS.green,
                    fontWeight: '600'
                  }}>
                    {indicator.change >= 0 ? '+' : ''}{indicator.change.toFixed(2)}%
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'right',
                    color: indicator.correlation >= 0 ? COLORS.blue : COLORS.orange,
                    fontWeight: '600'
                  }}>
                    {indicator.correlation.toFixed(3)}
                  </td>
                  <td style={{ 
                    padding: '12px', 
                    textAlign: 'center',
                    color: impactColor,
                    fontWeight: '700'
                  }}>
                    {impact}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
