import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line, AreaChart, Area } from 'recharts';

// API 설정
const API_BASE_URL = 'http://localhost:9010/api/v1';
const PRODUCT_CODE = 'dreambig70';

// Tableau 컬러 팔레트
const COLORS = {
  primary: '#4E79A7',
  secondary: '#59A14F',
  accent: '#F28E2B',
  warning: '#E15759',
  highlight: '#EDC948',
  info: '#76B7B2',
};

const PIE_COLORS = ['#4E79A7', '#59A14F', '#F28E2B', '#E15759', '#EDC948', '#76B7B2', '#FF9DA7', '#BAB0AC'];

// 운용 코멘트 (정적 데이터 유지)
const COMMENTARY = {
  performance: `12월 한 달간 DB70과 DB30 펀드는 각각 -0.34%, -0.82%의 수익률을 기록했습니다. 12월 글로벌 증시는 성장주와 가치주간의 순환매가 지속되고, 대형주와 중소형주의 주가 강세 차이가 나타나는 국면이었습니다. 오라클 실적 부진과 CDS 프리미엄 확대로 점화된 AI버블론은 마이크론 실적 발표를 계기로 소강상태에 돌입, 연말 위험선호가 재차 확대되는 모습이었습니다. 미국 채권 시장은 중단기물과 장기물 영역이 상반된 방향성을 나타냈습니다.`,
  usEquity: `연말 소비 기대감이 지나가고 가치주에서 성장주로의 자금 흐름이 본격화될 것으로 전망. 가치주와 성장주의 12MF EPS 차이는 올해 내내 벌어지고 있어, 성장주로의 리밸런싱 가능성 존재. CES 2026 시작과 함께 엔비디아, AMD 등 주요 기업들의 가이던스를 통해 26년도 AI/IT 산업 분위기가 긍정적으로 바뀔 것으로 예상.`,
  europeEquity: `유럽증시 이익 전망이 25년 대비 +12%를 기록하며 증시 상승을 견인할 것으로 예상. 독일 주도 재정 확대가 25년 4분기부터 본격화된 영향으로, 유로존 경제 및 이익 지표는 26년 상반기 중 시장 예상을 상회할 가능성이 높음.`,
  japanEquity: `일본 증시는 정부 역대 최대 예산안 확정과 함께 방위, AI, 반도체 지출 증가는 26년에도 지속될 것으로 전망. 1분기에도 반도체를 비롯한 AI 투자, 방위비 확대, 사나에노믹스, 금리 상승 그리고 글로벌 컨텐츠 소비가 핵심 테마가 될 것으로 판단.`,
  emEquity: `중국 증시는 정책 모멘텀 소멸, 부동산 디벨로퍼 완커 채무불이행 영향으로 조정 국면이나 12월 경제공작회의 이후 정책 모멘텀 강화되며 반등 시도 과정 진행 예상. 홍콩 증시의 아웃퍼폼이 예상되며, EPS 증가세가 뚜렷한 테크주 중심 상승 추세 복귀 전망.`,
  bond: `당분간 박스권 탈피 유인 낮을 전망. 연내 추가 2회 인하가 전망되며 금리 인하는 미국과 글로벌 경제의 하방 경직성을 강화하고, 금융시장의 risk-on 모드를 지속시키는 핵심 요인으로 작용할 것.`,
  alternative: `당분간 금리 인하 기조에도 물가 재상승 리스크 부각 전까지 금 가격 상승세 숨 고르기 이어질 가능성 우세. 원/달러 1,400원 중반대 하방 우위 흐름 예상. 1월부터 외환 당국 안정화 조치 효과 가시화 예상.`,
};


const formatPercent = (num) => (num >= 0 ? '+' : '') + num.toFixed(2) + '%';

export default function DBLifeDreamBig70Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [fundInfo, setFundInfo] = useState(null);
  const [allocationData, setAllocationData] = useState([]);
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API 데이터 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // 상품 정보 조회
        const infoResponse = await fetch(`${API_BASE_URL}/products/${PRODUCT_CODE}/info`);
        if (!infoResponse.ok) throw new Error('상품 정보 조회 실패');
        const infoData = await infoResponse.json();
        setFundInfo(infoData);

        // 자산 배분 조회
        const allocationResponse = await fetch(`${API_BASE_URL}/products/${PRODUCT_CODE}/allocation/current`);
        if (!allocationResponse.ok) throw new Error('자산 배분 조회 실패');
        const allocationResult = await allocationResponse.json();
        setAllocationData(allocationResult.allocations || []);

        // 성과 조회
        const perfResponse = await fetch(`${API_BASE_URL}/products/${PRODUCT_CODE}/performance/current`);
        if (!perfResponse.ok) throw new Error('성과 조회 실패');
        const perfData = await perfResponse.json();
        setPerformanceData(perfData);

        setLoading(false);
      } catch (err) {
        console.error('API 조회 오류:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#e8e8e8',
        fontSize: '24px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <div>데이터 로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: '#e8e8e8',
        fontSize: '18px'
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

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewSection fundInfo={fundInfo} performanceData={performanceData} allocationData={allocationData} />;
      case 'allocation': return <AllocationSection allocationData={allocationData} />;
      case 'trend': return <TrendSection />;
      case 'outlook': return <OutlookSection />;
      default: return <OverviewSection fundInfo={fundInfo} performanceData={performanceData} allocationData={allocationData} />;
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      minHeight: '100vh',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e8e8e8'
    }}>
      {/* 헤더 */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(78,121,167,0.15), rgba(89,161,79,0.15))',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '40px' }}>🌍</span>
          <h1 style={{
            fontSize: '36px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #4E79A7, #59A14F)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            {fundInfo?.product_name || 'Dream Big 70'}
          </h1>
        </div>
        <p style={{ color: '#76B7B2', fontSize: '18px', margin: '8px 0', fontWeight: '600' }}>
          {fundInfo?.fund_type || '글로벌자산배분형'} | {fundInfo?.manager || '한국투자신탁운용'}
        </p>
        <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
          기준일: {fundInfo?.bas_dt || performanceData?.bas_dt || '2025.12.31'}
        </p>

        {/* 핵심 지표 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
          marginTop: '28px'
        }}>
          <StatCard label="1개월 수익률" value={performanceData ? formatPercent(performanceData.returns?.['1m'] || 0) : '-'} isReturn />
          <StatCard label="주식비중" value={allocationData.length > 0 ? `${allocationData.filter(a => a.asset_type?.includes('주식')).reduce((sum, a) => sum + a.weight, 0).toFixed(2)}%` : '-'} subLabel="(BM 60.00%)" />
          <StatCard label="채권비중" value={allocationData.length > 0 ? `${allocationData.filter(a => a.asset_type?.includes('채권')).reduce((sum, a) => sum + a.weight, 0).toFixed(2)}%` : '-'} subLabel="(BM 24.99%)" />
          <StatCard label="대체/유동성" value={allocationData.length > 0 ? `${allocationData.filter(a => a.asset_type?.includes('대체') || a.asset_type?.includes('현금')).reduce((sum, a) => sum + a.weight, 0).toFixed(2)}%` : '-'} subLabel="(BM 15.00%)" />
        </div>
      </div>

      {/* 네비게이션 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '24px',
        justifyContent: 'center'
      }}>
        {[
          { key: 'overview', label: '📊 개요' },
          { key: 'allocation', label: '🥧 자산배분' },
          { key: 'trend', label: '📈 추이' },
          { key: 'outlook', label: '🔮 전망' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding: '14px 32px',
              borderRadius: '14px',
              border: activeTab === key ? '2px solid #4E79A7' : '1px solid rgba(255,255,255,0.2)',
              background: activeTab === key
                ? 'linear-gradient(135deg, #4E79A7, #59A14F)'
                : 'rgba(255,255,255,0.05)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '15px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {renderContent()}

      {/* 푸터 */}
      <div style={{
        textAlign: 'center',
        marginTop: '32px',
        paddingTop: '16px',
        color: '#555',
        fontSize: '11px',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <p>작성자: {FUND_INFO.author} | 기준일: {FUND_INFO.reportDate}</p>
      </div>
    </div>
  );
}

function StatCard({ label, value, subLabel, isReturn }) {
  const isPositive = isReturn && value.startsWith('+');
  const isNegative = isReturn && value.startsWith('-');
  
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '14px',
      padding: '18px',
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      <p style={{ color: '#888', fontSize: '12px', margin: '0 0 6px 0' }}>{label}</p>
      <p style={{
        fontSize: '24px',
        fontWeight: '700',
        margin: 0,
        color: isReturn ? (isPositive ? '#59A14F' : isNegative ? '#E15759' : '#fff') : '#fff'
      }}>
        {value}
      </p>
      {subLabel && <p style={{ color: '#666', fontSize: '11px', margin: '4px 0 0 0' }}>{subLabel}</p>}
    </div>
  );
}

// 개요 섹션
function OverviewSection() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px' }}>
      {/* 파이 차트 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h3 style={{ color: '#EDC948', marginBottom: '20px', fontSize: '17px' }}>🥧 자산배분 현황</h3>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={115}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
              labelLine={{ stroke: '#666' }}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }}
              formatter={(value) => [`${value.toFixed(2)}%`, '비중']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 월간 성과 코멘트 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h3 style={{ color: '#4E79A7', marginBottom: '20px', fontSize: '17px' }}>📝 12월 성과 요약</h3>
        <div style={{
          background: 'rgba(78,121,167,0.1)',
          borderRadius: '12px',
          padding: '20px',
          borderLeft: '4px solid #4E79A7',
          marginBottom: '20px'
        }}>
          <p style={{ color: '#ccc', lineHeight: '1.85', fontSize: '14px', margin: 0 }}>
            {COMMENTARY.performance}
          </p>
        </div>
        
        <h4 style={{ color: '#76B7B2', fontSize: '14px', marginBottom: '12px' }}>📊 자산군별 비중</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <InfoCard label="위험자산(주식)" value="60.96%" color="#E15759" />
          <InfoCard label="비위험자산(채권)" value="24.90%" color="#4E79A7" />
          <InfoCard label="대체투자" value="4.32%" color="#F28E2B" />
          <InfoCard label="유동성" value="9.80%" color="#76B7B2" />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '10px',
      padding: '14px',
      borderLeft: `4px solid ${color}`
    }}>
      <p style={{ color: '#888', fontSize: '11px', margin: '0 0 4px 0' }}>{label}</p>
      <p style={{ color: '#fff', fontSize: '18px', fontWeight: '700', margin: 0 }}>{value}</p>
    </div>
  );
}

// 자산배분 섹션
function AllocationSection() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', gap: '24px' }}>
      {/* BM vs 실제 비교 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h3 style={{ color: '#59A14F', marginBottom: '20px', fontSize: '17px' }}>📊 BM 대비 실제 비중</h3>
        <ResponsiveContainer width="100%" height={380}>
          <BarChart data={allocationData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fill: '#aaa', fontSize: 11 }} domain={[0, 45]} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#aaa', fontSize: 11 }} width={80} />
            <Tooltip
              contentStyle={{ background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }}
              formatter={(value) => [`${value.toFixed(2)}%`]}
            />
            <Legend />
            <Bar dataKey="bm" name="BM" fill="#4E79A7" radius={[0, 4, 4, 0]} />
            <Bar dataKey="actual" name="실제비중" fill="#59A14F" radius={[0, 4, 4, 0]} />
            <Bar dataKey="target" name="목표비중" fill="#F28E2B" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 자산배분 테이블 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        overflowX: 'auto'
      }}>
        <h3 style={{ color: '#F28E2B', marginBottom: '20px', fontSize: '17px' }}>📋 자산배분 상세</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: 'rgba(242,142,43,0.2)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>자산군</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>BM</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>실제</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>목표</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>초과비중</th>
              <th style={{ padding: '12px', textAlign: 'center', color: '#fff' }}>구분</th>
            </tr>
          </thead>
          <tbody>
            {allocationData.map((item, idx) => (
              <tr key={item.name} style={{
                background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <td style={{ padding: '10px', color: '#fff', fontWeight: '500' }}>{item.name}</td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#888' }}>{item.bm.toFixed(2)}%</td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#76B7B2', fontWeight: '600' }}>{item.actual.toFixed(2)}%</td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#59A14F' }}>{item.target.toFixed(2)}%</td>
                <td style={{ padding: '10px', textAlign: 'right', color: item.excess >= 0 ? '#59A14F' : '#E15759', fontWeight: '600' }}>
                  {item.excess >= 0 ? '+' : ''}{item.excess.toFixed(2)}%
                </td>
                <td style={{ padding: '10px', textAlign: 'center' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: '600',
                    background: item.category === '위험자산' ? 'rgba(225,87,89,0.3)' : item.category === '비위험자산' ? 'rgba(78,121,167,0.3)' : 'rgba(118,183,178,0.3)',
                    color: item.category === '위험자산' ? '#E15759' : item.category === '비위험자산' ? '#4E79A7' : '#76B7B2'
                  }}>{item.category}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// 추이 섹션
function TrendSection() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      <h3 style={{ color: '#76B7B2', marginBottom: '20px', fontSize: '17px' }}>📈 자산배분 추이 (최근 1년)</h3>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={assetTimeSeriesData}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="period" tick={{ fill: '#aaa', fontSize: 11 }} />
          <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: '#aaa', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }}
            formatter={(value) => [`${value.toFixed(2)}%`]}
          />
          <Legend />
          <Area type="monotone" dataKey="usEquity" name="미국주식" stackId="1" stroke="#4E79A7" fill="#4E79A7" fillOpacity={0.8} />
          <Area type="monotone" dataKey="euEquity" name="유럽주식" stackId="1" stroke="#59A14F" fill="#59A14F" fillOpacity={0.8} />
          <Area type="monotone" dataKey="jpEquity" name="일본주식" stackId="1" stroke="#EDC948" fill="#EDC948" fillOpacity={0.8} />
          <Area type="monotone" dataKey="emEquity" name="이머징주식" stackId="1" stroke="#F28E2B" fill="#F28E2B" fillOpacity={0.8} />
          <Area type="monotone" dataKey="bond" name="채권" stackId="1" stroke="#76B7B2" fill="#76B7B2" fillOpacity={0.8} />
          <Area type="monotone" dataKey="alt" name="대체투자" stackId="1" stroke="#E15759" fill="#E15759" fillOpacity={0.8} />
          <Area type="monotone" dataKey="cash" name="유동성" stackId="1" stroke="#BAB0AC" fill="#BAB0AC" fillOpacity={0.8} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// 전망 섹션
function OutlookSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <OutlookCard title="🇺🇸 미국주식" weight="-1.08%p" targetWeight="-1.00%p" content={COMMENTARY.usEquity} color="#4E79A7" />
      <OutlookCard title="🇪🇺 유럽주식" weight="+1.27%p" targetWeight="+1.00%p" content={COMMENTARY.europeEquity} color="#59A14F" />
      <OutlookCard title="🇯🇵 일본주식" weight="+0.21%p" targetWeight="+0.20%p" content={COMMENTARY.japanEquity} color="#EDC948" />
      <OutlookCard title="🌏 이머징주식" weight="+0.56%p" targetWeight="+0.50%p" content={COMMENTARY.emEquity} color="#F28E2B" />
      <OutlookCard title="📈 채권" weight="+5.06%p" targetWeight="+5.00%p" content={COMMENTARY.bond} color="#76B7B2" />
      <OutlookCard title="🏆 대체투자" weight="-0.68%p" targetWeight="0.00%p" content={COMMENTARY.alternative} color="#E15759" />
    </div>
  );
}

function OutlookCard({ title, weight, targetWeight, content, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.08)',
      borderLeft: `5px solid ${color}`
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <h3 style={{ color: color, margin: 0, fontSize: '17px' }}>{title}</h3>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: '#888' }}>현재: <strong style={{ color: weight.startsWith('+') ? '#59A14F' : '#E15759' }}>{weight}</strong></span>
          <span style={{ fontSize: '13px', color: '#888' }}>목표: <strong style={{ color: '#EDC948' }}>{targetWeight}</strong></span>
        </div>
      </div>
      <p style={{ color: '#ccc', lineHeight: '1.85', fontSize: '14px', margin: 0 }}>{content}</p>
    </div>
  );
}
