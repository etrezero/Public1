import React, { useState } from 'react';

const AssetQuilt = () => {
  // 월별 수익률 데이터 (2024.01 ~ 2025.12)
  const monthlyReturns = [
    { month: '2024.01', 'USA Growth': 2.54, 'USA Value': 0.38, 'EAFE': 0.53, 'EM': -4.77, 'World': 1.14 },
    { month: '2024.02', 'USA Growth': 7.12, 'USA Value': 3.21, 'EAFE': 1.68, 'EM': 4.62, 'World': 4.11 },
    { month: '2024.03', 'USA Growth': 1.60, 'USA Value': 4.62, 'EAFE': 2.78, 'EM': 2.18, 'World': 3.01 },
    { month: '2024.04', 'USA Growth': -4.06, 'USA Value': -4.35, 'EAFE': -2.93, 'EM': 0.26, 'World': -3.85 },
    { month: '2024.05', 'USA Growth': 6.51, 'USA Value': 2.66, 'EAFE': 3.30, 'EM': 0.29, 'World': 4.23 },
    { month: '2024.06', 'USA Growth': 6.90, 'USA Value': -0.21, 'EAFE': -1.74, 'EM': 3.55, 'World': 1.93 },
    { month: '2024.07', 'USA Growth': -1.88, 'USA Value': 4.64, 'EAFE': 2.89, 'EM': -0.24, 'World': 1.70 },
    { month: '2024.08', 'USA Growth': 1.91, 'USA Value': 2.66, 'EAFE': 3.02, 'EM': 1.39, 'World': 2.51 },
    { month: '2024.09', 'USA Growth': 2.51, 'USA Value': 1.54, 'EAFE': 0.62, 'EM': 6.45, 'World': 1.69 },
    { month: '2024.10', 'USA Growth': -0.33, 'USA Value': -1.32, 'EAFE': -5.50, 'EM': -4.38, 'World': -2.04 },
    { month: '2024.11', 'USA Growth': 6.98, 'USA Value': 5.26, 'EAFE': -0.87, 'EM': -3.66, 'World': 4.47 },
    { month: '2024.12', 'USA Growth': 1.62, 'USA Value': -7.15, 'EAFE': -2.33, 'EM': -0.29, 'World': -2.68 },
    { month: '2025.01', 'USA Growth': 1.80, 'USA Value': 4.30, 'EAFE': 5.21, 'EM': 1.66, 'World': 3.47 },
    { month: '2025.02', 'USA Growth': -3.89, 'USA Value': 0.77, 'EAFE': 1.80, 'EM': 0.36, 'World': -0.81 },
    { month: '2025.03', 'USA Growth': -9.07, 'USA Value': -2.64, 'EAFE': -0.90, 'EM': 0.38, 'World': -4.64 },
    { month: '2025.04', 'USA Growth': 2.48, 'USA Value': -3.69, 'EAFE': 4.17, 'EM': 1.04, 'World': 0.74 },
    { month: '2025.05', 'USA Growth': 9.95, 'USA Value': 2.43, 'EAFE': 3.97, 'EM': 3.99, 'World': 5.69 },
    { month: '2025.06', 'USA Growth': 5.73, 'USA Value': 4.24, 'EAFE': 2.09, 'EM': 5.65, 'World': 4.22 },
    { month: '2025.07', 'USA Growth': 3.88, 'USA Value': 0.35, 'EAFE': -1.45, 'EM': 1.67, 'World': 1.23 },
    { month: '2025.08', 'USA Growth': 1.21, 'USA Value': 2.59, 'EAFE': 4.06, 'EM': 1.22, 'World': 2.50 },
    { month: '2025.09', 'USA Growth': 5.26, 'USA Value': 1.62, 'EAFE': 1.66, 'EM': 6.97, 'World': 3.09 },
    { month: '2025.10', 'USA Growth': 5.14, 'USA Value': -1.07, 'EAFE': 1.10, 'EM': 4.12, 'World': 1.94 },
    { month: '2025.11', 'USA Growth': -1.45, 'USA Value': 1.57, 'EAFE': 0.46, 'EM': -2.47, 'World': 0.18 },
    { month: '2025.12', 'USA Growth': -0.50, 'USA Value': 1.36, 'EAFE': 3.08, 'EM': 2.64, 'World': 1.19 },
  ];

  const assets = ['USA Growth', 'USA Value', 'EAFE', 'EM', 'World'];
  
  // Tableau 색상 (보라색 제외)
  const assetColors = {
    'USA Growth': '#4E79A7',
    'USA Value': '#F28E2B',
    'EAFE': '#59A14F',
    'EM': '#E15759',
    'World': '#76B7B2'
  };

  // 수익률에 따른 배경색
  const getReturnColor = (value) => {
    if (value >= 5) return '#059669';
    if (value >= 2) return '#10B981';
    if (value >= 0) return '#6EE7B7';
    if (value >= -2) return '#FCA5A5';
    if (value >= -5) return '#F87171';
    return '#DC2626';
  };

  // 각 월별로 수익률 순위 정렬
  const getSortedAssets = (monthData) => {
    return assets
      .map(asset => ({ name: asset, value: monthData[asset] }))
      .sort((a, b) => b.value - a.value);
  };

  // 연간 수익률 계산
  const calculateYearlyReturn = (year) => {
    const yearData = monthlyReturns.filter(d => d.month.startsWith(year));
    const result = {};
    assets.forEach(asset => {
      let cumReturn = 1;
      yearData.forEach(m => {
        cumReturn *= (1 + m[asset] / 100);
      });
      result[asset] = ((cumReturn - 1) * 100).toFixed(1);
    });
    return result;
  };

  const year2024 = calculateYearlyReturn('2024');
  const year2025 = calculateYearlyReturn('2025');

  return (
    <div style={{ 
      fontFamily: "'Noto Sans KR', 'IBM Plex Sans', sans-serif",
      backgroundColor: '#FAFBFC',
      padding: '24px',
      minHeight: '100vh'
    }}>
      {/* 헤더 */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        borderTop: '4px solid #4E79A7'
      }}>
        <h1 style={{ margin: '0 0 8px', fontSize: '24px', color: '#1F2937' }}>
          Asset Quilt - 월간 수익률
        </h1>
        <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
          2024.01 ~ 2025.12 | MSCI 지수 기준 (USD)
        </p>
      </div>

      {/* 범례 */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        backgroundColor: 'white',
        padding: '16px',
        borderRadius: '8px'
      }}>
        {assets.map(asset => (
          <div key={asset} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              backgroundColor: assetColors[asset]
            }} />
            <span style={{ fontSize: '13px', color: '#374151' }}>{asset}</span>
          </div>
        ))}
      </div>

      {/* Asset Quilt 그리드 */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflowX: 'auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${monthlyReturns.length}, 80px)`,
          gap: '4px'
        }}>
          {/* 월 헤더 */}
          {monthlyReturns.map((m, idx) => (
            <div key={idx} style={{
              textAlign: 'center',
              fontSize: '11px',
              fontWeight: '600',
              color: '#6B7280',
              padding: '8px 4px',
              borderBottom: '2px solid #E5E7EB',
              backgroundColor: m.month.startsWith('2025') ? '#F0F9FF' : '#FFF7ED'
            }}>
              {m.month}
            </div>
          ))}
          
          {/* 각 순위별 행 */}
          {[0, 1, 2, 3, 4].map(rank => (
            <React.Fragment key={rank}>
              {monthlyReturns.map((m, idx) => {
                const sorted = getSortedAssets(m);
                const asset = sorted[rank];
                return (
                  <div key={`${rank}-${idx}`} style={{
                    backgroundColor: assetColors[asset.name],
                    color: 'white',
                    padding: '8px 4px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: '500',
                    minHeight: '50px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    gap: '2px'
                  }}>
                    <div style={{ fontSize: '10px', opacity: 0.9 }}>
                      {asset.name.replace(' ', '\n')}
                    </div>
                    <div style={{ 
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: '700',
                      fontSize: '12px'
                    }}>
                      {asset.value > 0 ? '+' : ''}{asset.value.toFixed(1)}%
                    </div>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* 연간 수익률 요약 */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginTop: '24px'
      }}>
        {/* 2024년 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1F2937' }}>
            2024년 연간 수익률
          </h3>
          {assets.map(asset => (
            <div key={asset} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '3px',
                  backgroundColor: assetColors[asset]
                }} />
                <span style={{ fontSize: '13px' }}>{asset}</span>
              </div>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: '600',
                fontSize: '14px',
                color: parseFloat(year2024[asset]) >= 0 ? '#059669' : '#DC2626'
              }}>
                {parseFloat(year2024[asset]) > 0 ? '+' : ''}{year2024[asset]}%
              </span>
            </div>
          ))}
        </div>

        {/* 2025년 */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1F2937' }}>
            2025년 연간 수익률
          </h3>
          {assets.map(asset => (
            <div key={asset} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 0',
              borderBottom: '1px solid #E5E7EB'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '3px',
                  backgroundColor: assetColors[asset]
                }} />
                <span style={{ fontSize: '13px' }}>{asset}</span>
              </div>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: '600',
                fontSize: '14px',
                color: parseFloat(year2025[asset]) >= 0 ? '#059669' : '#DC2626'
              }}>
                {parseFloat(year2025[asset]) > 0 ? '+' : ''}{year2025[asset]}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 히트맵 스타일 테이블 */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 16px', fontSize: '16px', color: '#1F2937' }}>
          월별 수익률 히트맵
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
            <thead>
              <tr>
                <th style={{ padding: '8px', textAlign: 'left', borderBottom: '2px solid #E5E7EB' }}>자산</th>
                {monthlyReturns.map((m, i) => (
                  <th key={i} style={{ 
                    padding: '6px 4px', 
                    textAlign: 'center', 
                    borderBottom: '2px solid #E5E7EB',
                    fontSize: '10px',
                    whiteSpace: 'nowrap'
                  }}>
                    {m.month.slice(2)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {assets.map(asset => (
                <tr key={asset}>
                  <td style={{ 
                    padding: '8px', 
                    fontWeight: '500',
                    borderBottom: '1px solid #E5E7EB',
                    whiteSpace: 'nowrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '2px',
                        backgroundColor: assetColors[asset]
                      }} />
                      {asset}
                    </div>
                  </td>
                  {monthlyReturns.map((m, i) => (
                    <td key={i} style={{
                      padding: '6px 4px',
                      textAlign: 'center',
                      backgroundColor: getReturnColor(m[asset]),
                      color: Math.abs(m[asset]) > 2 ? 'white' : '#1F2937',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: '500',
                      fontSize: '10px',
                      borderBottom: '1px solid #E5E7EB'
                    }}>
                      {m[asset] > 0 ? '+' : ''}{m[asset].toFixed(1)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* 색상 범례 */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          marginTop: '16px', 
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
            <div style={{ width: '20px', height: '12px', backgroundColor: '#059669', borderRadius: '2px' }} />
            <span>≥5%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
            <div style={{ width: '20px', height: '12px', backgroundColor: '#10B981', borderRadius: '2px' }} />
            <span>2~5%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
            <div style={{ width: '20px', height: '12px', backgroundColor: '#6EE7B7', borderRadius: '2px' }} />
            <span>0~2%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
            <div style={{ width: '20px', height: '12px', backgroundColor: '#FCA5A5', borderRadius: '2px' }} />
            <span>-2~0%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
            <div style={{ width: '20px', height: '12px', backgroundColor: '#F87171', borderRadius: '2px' }} />
            <span>-5~-2%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px' }}>
            <div style={{ width: '20px', height: '12px', backgroundColor: '#DC2626', borderRadius: '2px' }} />
            <span>≤-5%</span>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <div style={{
        textAlign: 'center',
        marginTop: '24px',
        padding: '16px',
        color: '#9CA3AF',
        fontSize: '12px'
      }}>
        작성자: Covenant Seo | 데이터: MSCI Index (USD 기준)
      </div>
    </div>
  );
};

export default AssetQuilt;
