import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';

// TDF Focus 글라이드패스 데이터 - 빈티지별 자산배분 비중 (%)
const glidepathData = [
  { vintage: '2060', yearsToRetire: 35, 미국성장: 33.5, 미국가치: 33.5, 선진국: 9.5, 이머징: 6.5, 금: 5.0, 한국채권: 12.0, equity: 83.0, targetVol: 8.0 },
  { vintage: '2055', yearsToRetire: 30, 미국성장: 31.0, 미국가치: 31.0, 선진국: 9.0, 이머징: 6.0, 금: 5.0, 한국채권: 18.0, equity: 77.0, targetVol: 7.5 },
  { vintage: '2050', yearsToRetire: 25, 미국성장: 28.0, 미국가치: 28.0, 선진국: 8.0, 이머징: 5.5, 금: 4.5, 한국채권: 26.0, equity: 69.5, targetVol: 7.0 },
  { vintage: '2045', yearsToRetire: 20, 미국성장: 25.0, 미국가치: 25.0, 선진국: 7.5, 이머징: 5.0, 금: 4.5, 한국채권: 33.0, equity: 62.5, targetVol: 6.5 },
  { vintage: '2040', yearsToRetire: 15, 미국성장: 22.0, 미국가치: 22.0, 선진국: 6.5, 이머징: 4.5, 금: 4.0, 한국채권: 41.0, equity: 55.0, targetVol: 6.0 },
  { vintage: '2035', yearsToRetire: 10, 미국성장: 18.5, 미국가치: 18.5, 선진국: 5.5, 이머징: 4.0, 금: 3.5, 한국채권: 50.0, equity: 46.5, targetVol: 5.5 },
  { vintage: '2030', yearsToRetire: 5, 미국성장: 15.0, 미국가치: 15.0, 선진국: 4.5, 이머징: 3.0, 금: 3.0, 한국채권: 59.5, equity: 37.5, targetVol: 5.0 },
  { vintage: 'TIF', yearsToRetire: 0, 미국성장: 10.0, 미국가치: 10.0, 선진국: 3.0, 이머징: 2.0, 금: 2.5, 한국채권: 72.5, equity: 25.0, targetVol: 4.0 },
];

// 역순 정렬 (TIF → 2060)
const sortedData = [...glidepathData].reverse();

// Tableau 컬러 팔레트
const COLORS = {
  미국성장: '#4E79A7',
  미국가치: '#59A14F', 
  선진국: '#F28E2B',
  이머징: '#E15759',
  금: '#EDC948',
  한국채권: '#76B7B2',
  equity: '#4E79A7',
  bond: '#76B7B2',
};

export default function TDFGlidepath() {
  const [viewMode, setViewMode] = useState('stacked');
  const [showTable, setShowTable] = useState(false);

  const equityBondData = sortedData.map(d => ({
    vintage: d.vintage,
    yearsToRetire: d.yearsToRetire,
    '주식(위험자산)': d.equity,
    '채권(안전자산)': 100 - d.equity,
    targetVol: d.targetVol,
  }));

  return (
    <div style={{
      fontFamily: "'Pretendard', 'Noto Sans KR', -apple-system, sans-serif",
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      minHeight: '100vh',
      padding: '32px',
      color: '#e8e8e8'
    }}>
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
          background: 'linear-gradient(135deg, #4E79A7, #76B7B2)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '12px',
          letterSpacing: '-0.02em'
        }}>
          📊 TDF Focus Glide Path
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem', margin: 0 }}>
          한국투자 TDF 알아서 ETF 포커스 빈티지별 자산배분 비중
        </p>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '12px', 
        marginBottom: '32px',
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'equity', label: '📈 주식/채권 비중' },
          { key: 'stacked', label: '📊 자산군별 비중' },
          { key: 'line', label: '📉 추이 비교' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setViewMode(key)}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: viewMode === key ? '2px solid #4E79A7' : '1px solid rgba(255,255,255,0.2)',
              background: viewMode === key 
                ? 'linear-gradient(135deg, #4E79A7, #59A14F)' 
                : 'rgba(255,255,255,0.05)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)'
            }}
          >
            {label}
          </button>
        ))}
        <button
          onClick={() => setShowTable(!showTable)}
          style={{
            padding: '12px 24px',
            borderRadius: '12px',
            border: showTable ? '2px solid #EDC948' : '1px solid rgba(255,255,255,0.2)',
            background: showTable 
              ? 'linear-gradient(135deg, #EDC948, #F28E2B)' 
              : 'rgba(255,255,255,0.05)',
            color: showTable ? '#1a1a2e' : '#fff',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: '600',
            transition: 'all 0.3s ease'
          }}
        >
          📋 {showTable ? '테이블 숨기기' : '테이블 보기'}
        </button>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
      }}>
        {viewMode === 'equity' && (
          <>
            <h3 style={{ textAlign: 'center', color: '#76B7B2', marginBottom: '24px', fontSize: '1.3rem' }}>
              빈티지별 주식(위험자산) vs 채권(안전자산) 비중
            </h3>
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart data={equityBondData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4E79A7" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#4E79A7" stopOpacity={0.3}/>
                  </linearGradient>
                  <linearGradient id="colorBond" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#76B7B2" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#76B7B2" stopOpacity={0.3}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="vintage" 
                  tick={{ fill: '#aaa', fontSize: 13, fontWeight: 600 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                />
                <YAxis 
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: '#aaa', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(26,26,46,0.95)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                  formatter={(value) => [`${value.toFixed(1)}%`]}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Area 
                  type="monotone" 
                  dataKey="주식(위험자산)" 
                  stackId="1"
                  stroke="#4E79A7" 
                  fill="url(#colorEquity)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="채권(안전자산)" 
                  stackId="1"
                  stroke="#76B7B2" 
                  fill="url(#colorBond)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}

        {viewMode === 'stacked' && (
          <>
            <h3 style={{ textAlign: 'center', color: '#76B7B2', marginBottom: '24px', fontSize: '1.3rem' }}>
              빈티지별 세부 자산군 배분 비중
            </h3>
            <ResponsiveContainer width="100%" height={450}>
              <AreaChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="vintage" 
                  tick={{ fill: '#aaa', fontSize: 13, fontWeight: 600 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                />
                <YAxis 
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: '#aaa', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(26,26,46,0.95)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                  formatter={(value) => [`${value.toFixed(1)}%`]}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Area type="monotone" dataKey="미국성장" stackId="1" stroke={COLORS.미국성장} fill={COLORS.미국성장} fillOpacity={0.85} />
                <Area type="monotone" dataKey="미국가치" stackId="1" stroke={COLORS.미국가치} fill={COLORS.미국가치} fillOpacity={0.85} />
                <Area type="monotone" dataKey="선진국" stackId="1" stroke={COLORS.선진국} fill={COLORS.선진국} fillOpacity={0.85} />
                <Area type="monotone" dataKey="이머징" stackId="1" stroke={COLORS.이머징} fill={COLORS.이머징} fillOpacity={0.85} />
                <Area type="monotone" dataKey="금" stackId="1" stroke={COLORS.금} fill={COLORS.금} fillOpacity={0.85} />
                <Area type="monotone" dataKey="한국채권" stackId="1" stroke={COLORS.한국채권} fill={COLORS.한국채권} fillOpacity={0.85} />
              </AreaChart>
            </ResponsiveContainer>
          </>
        )}

        {viewMode === 'line' && (
          <>
            <h3 style={{ textAlign: 'center', color: '#76B7B2', marginBottom: '24px', fontSize: '1.3rem' }}>
              자산군별 비중 추이 비교
            </h3>
            <ResponsiveContainer width="100%" height={450}>
              <LineChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="vintage" 
                  tick={{ fill: '#aaa', fontSize: 13, fontWeight: 600 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                />
                <YAxis 
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fill: '#aaa', fontSize: 12 }}
                  axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(26,26,46,0.95)', 
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: '12px',
                    color: '#fff'
                  }}
                  formatter={(value) => [`${value.toFixed(1)}%`]}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                <Line type="monotone" dataKey="미국성장" stroke={COLORS.미국성장} strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="미국가치" stroke={COLORS.미국가치} strokeWidth={3} dot={{ r: 5 }} />
                <Line type="monotone" dataKey="선진국" stroke={COLORS.선진국} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="이머징" stroke={COLORS.이머징} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="금" stroke={COLORS.금} strokeWidth={2} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="한국채권" stroke={COLORS.한국채권} strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '32px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h3 style={{ textAlign: 'center', color: '#F28E2B', marginBottom: '24px', fontSize: '1.3rem' }}>
          빈티지별 목표 변동성 (Target Volatility)
        </h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="vintage" 
              tick={{ fill: '#aaa', fontSize: 13, fontWeight: 600 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            />
            <YAxis 
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: '#aaa', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
              domain={[0, 10]}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(26,26,46,0.95)', 
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '12px',
                color: '#fff'
              }}
              formatter={(value) => [`${value}%`, '목표 변동성']}
            />
            <Bar 
              dataKey="targetVol" 
              fill="#F28E2B" 
              radius={[8, 8, 0, 0]}
              name="목표 변동성"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {showTable && (
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          border: '1px solid rgba(255,255,255,0.08)',
          overflowX: 'auto'
        }}>
          <h3 style={{ textAlign: 'center', color: '#EDC948', marginBottom: '24px', fontSize: '1.3rem' }}>
            📋 빈티지별 자산배분 상세 (%)
          </h3>
          <table style={{ 
            width: '100%', 
            borderCollapse: 'collapse',
            fontSize: '0.9rem'
          }}>
            <thead>
              <tr style={{ background: 'rgba(78,121,167,0.3)' }}>
                <th style={{ padding: '14px', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: '700' }}>빈티지</th>
                <th style={{ padding: '14px', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.2)', color: COLORS.미국성장 }}>미국성장</th>
                <th style={{ padding: '14px', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.2)', color: COLORS.미국가치 }}>미국가치</th>
                <th style={{ padding: '14px', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.2)', color: COLORS.선진국 }}>선진국</th>
                <th style={{ padding: '14px', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.2)', color: COLORS.이머징 }}>이머징</th>
                <th style={{ padding: '14px', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.2)', color: COLORS.금 }}>금</th>
                <th style={{ padding: '14px', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.2)', color: COLORS.한국채권 }}>한국채권</th>
                <th style={{ padding: '14px', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.2)', color: '#fff', fontWeight: '700' }}>주식비중</th>
                <th style={{ padding: '14px', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.2)', color: '#F28E2B' }}>목표Vol</th>
              </tr>
            </thead>
            <tbody>
              {glidepathData.map((row, idx) => (
                <tr key={row.vintage} style={{ 
                  background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  transition: 'background 0.2s'
                }}>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.vintage}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#ccc', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.미국성장.toFixed(1)}%</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#ccc', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.미국가치.toFixed(1)}%</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#ccc', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.선진국.toFixed(1)}%</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#ccc', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.이머징.toFixed(1)}%</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#ccc', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.금.toFixed(1)}%</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#ccc', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.한국채권.toFixed(1)}%</td>
                  <td style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#4E79A7', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.equity.toFixed(1)}%</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: '#F28E2B', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{row.targetVol.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px',
        marginTop: '24px'
      }}>
        {[
          { label: '미국성장', color: COLORS.미국성장, desc: 'VUG 등' },
          { label: '미국가치', color: COLORS.미국가치, desc: 'VTV 등' },
          { label: '선진국', color: COLORS.선진국, desc: 'VEA 등' },
          { label: '이머징', color: COLORS.이머징, desc: 'VWO 등' },
          { label: '금', color: COLORS.금, desc: 'GLD 등' },
          { label: '한국채권', color: COLORS.한국채권, desc: 'KODEX 273130' },
        ].map(({ label, color, desc }) => (
          <div key={label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(255,255,255,0.03)',
            padding: '12px 16px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{
              width: '16px',
              height: '16px',
              borderRadius: '4px',
              background: color,
              flexShrink: 0
            }} />
            <div>
              <div style={{ fontWeight: '600', color: '#fff', fontSize: '0.9rem' }}>{label}</div>
              <div style={{ fontSize: '0.75rem', color: '#888' }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '40px', 
        padding: '20px',
        color: '#666',
        fontSize: '0.85rem',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <p>한국투자 TDF 알아서 ETF 포커스 글라이드패스 | Created by Covenant Seo</p>
        <p style={{ marginTop: '8px', color: '#555' }}>
          * 글라이드패스는 목표 변동성 기반 최적화 결과이며, 실제 운용 비중과 다를 수 있습니다.
        </p>
      </div>
    </div>
  );
}
