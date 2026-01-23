import React, { useState } from 'react';
import { PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, BarChart, Bar } from 'recharts';

// Tableau 컬러 팔레트 (보라색 제외)
const COLORS = {
  primary: '#4E79A7',
  secondary: '#59A14F',
  accent: '#F28E2B',
  warning: '#E15759',
  highlight: '#EDC948',
  info: '#76B7B2',
  dark: '#1a1a2e',
};

const PIE_COLORS = ['#4E79A7', '#59A14F', '#F28E2B', '#E15759', '#EDC948', '#76B7B2', '#B07AA1', '#FF9DA7'];

// 펀드 기본 정보
const FUND_INFO = {
  fundCode: '06F77',
  fundName: '한국투자ELS지수연계솔루션(주식혼합-파생형)(모)',
  fundNameShort: 'ELS지수연계솔루션',
  reportPeriod: '2025년 4분기 (2025.10.01 ~ 2025.12.31)',
  baseDate: '2025.12.31',
  fundManager: 'Covenant Seo',
  nav: 5977269737,
  totalAsset: 6423311744,
  basePrice: 1073.78,
  basePriceStart: 1068.92,
};

// 기준가 추이 데이터 (월말)
const navTrendData = [
  { date: '10/01', price: 1068.92, nav: 6602 },
  { date: '10/15', price: 1070.22, nav: 6600 },
  { date: '10/31', price: 1072.40, nav: 6142 },
  { date: '11/15', price: 1078.10, nav: 6094 },
  { date: '11/30', price: 1073.19, nav: 6003 },
  { date: '12/15', price: 1074.26, nav: 5991 },
  { date: '12/31', price: 1073.78, nav: 5977 },
];

// 자산 구성 데이터
const assetAllocationData = [
  { name: '국내채권', value: 33.95, amount: 2029, color: '#4E79A7' },
  { name: '현금성자산', value: 25.65, amount: 1533, color: '#59A14F' },
  { name: 'HSCEI연계', value: 20.04, amount: 1198, color: '#F28E2B' },
  { name: '유로스탁스연계', value: 9.99, amount: 597, color: '#E15759' },
  { name: 'KOSPI200연계', value: 1.46, amount: 87, color: '#EDC948' },
  { name: '단기금융', value: 8.91, amount: 532, color: '#76B7B2' },
];

// 보유종목 TOP 10
const holdingsData = [
  { rank: 1, name: '국고03875-2612(23-10)', type: '국고채', weight: 33.95, amount: 2029 },
  { rank: 2, name: '보통예금', type: '예금', weight: 25.65, amount: 1533 },
  { rank: 3, name: 'TIGER 차이나HSCEI', type: 'ETF', weight: 20.04, amount: 1198 },
  { rank: 4, name: 'TIGER 유로스탁스50(합성H)', type: 'ETF', weight: 9.99, amount: 597 },
  { rank: 5, name: '하나증권(콜론)', type: '콜론', weight: 2.13, amount: 127 },
  { rank: 6, name: 'ACE 단기통안채', type: 'ETF', weight: 2.00, amount: 119 },
  { rank: 7, name: 'ACE 종합채권(AA-이상)액티브', type: 'ETF', weight: 2.00, amount: 119 },
  { rank: 8, name: 'ACE 200', type: 'ETF', weight: 1.46, amount: 87 },
  { rank: 9, name: '키움증권(콜론)', type: '콜론', weight: 1.25, amount: 75 },
  { rank: 10, name: '한국투자신종MMF', type: 'MMF', weight: 0.57, amount: 34 },
];

// 수익률 데이터
const returnData = [
  { period: '1개월', fund: 0.05, bm: -0.12 },
  { period: '3개월', fund: 0.45, bm: 0.21 },
  { period: '6개월', fund: 1.23, bm: 0.89 },
  { period: '연초이후', fund: 3.45, bm: 2.87 },
  { period: '1년', fund: 4.12, bm: 3.56 },
];

// 운용 코멘트
const COMMENTARY = {
  market: `2025년 4분기 글로벌 금융시장은 미국 연준의 금리 인하 기조 지속과 중국의 경기부양책 기대감으로 변동성이 확대되었습니다. 국내 채권시장은 한국은행의 기준금리 동결 기조 속에서 안정적인 흐름을 보였습니다. 분기 중 주요 기초자산 지수의 성과를 살펴보면, KOSPI200은 글로벌 반도체 업황 회복과 외국인 순매수 유입에 힘입어 +26.59%의 강한 상승세를 기록하였고, 유로스탁스50은 ECB의 완화적 통화정책 기조에 따라 +4.28% 상승하였습니다. 반면 HSCEI는 중국 부동산 시장 불안과 경기 둔화 우려로 -3.14% 하락하며 부진한 흐름을 나타냈습니다.`,
  strategy: `당 펀드는 ELS 지수연계 구조를 통해 HSCEI, 유로스탁스50, KOSPI200 등 글로벌 주요 지수에 연계된 수익구조를 추구하고 있습니다. 안정적인 국고채 포지션을 기반으로 하며, 해외 지수 ETF를 활용하여 지수 익스포저를 확보하고 있습니다. 분기 중 시장 변동성에 대응하여 현금성 자산 비중을 탄력적으로 조정하였습니다.`,
  outlook: `2026년 1분기에는 미국 연준의 추가 금리 인하 가능성과 중국 정부의 적극적인 경기부양책 시행 여부가 글로벌 증시의 핵심 변수로 작용할 전망입니다. 특히 기초자산인 HSCEI는 중국 부동산 시장 안정화 정책과 소비 회복세에 따라 반등 모멘텀을 확보할 수 있으며, 유로스탁스50은 유럽중앙은행(ECB)의 통화정책 완화 기조가 지속될 경우 점진적인 상승 흐름이 예상됩니다. 당 펀드는 기초자산 지수들의 변동성 확대 가능성에 대비하여 헤지 비율을 탄력적으로 조정하고, 국고채 중심의 안정적 이자수익 확보를 통해 하방 리스크를 관리할 계획입니다. 중장기적으로는 글로벌 경기 회복 사이클에 발맞춰 지수 익스포저를 점진적으로 확대하며, 목표 수익률 달성을 위한 적극적인 포트폴리오 리밸런싱을 수행해 나갈 예정입니다.`,
};

// 숫자 포맷팅
const formatNumber = (num) => {
  if (num >= 100000000) return (num / 100000000).toFixed(0) + '억';
  if (num >= 10000) return (num / 10000).toFixed(0) + '만';
  return num.toLocaleString();
};

const formatPercent = (num) => (num >= 0 ? '+' : '') + num.toFixed(2) + '%';

export default function Fund06F77Report() {
  const [activeSection, setActiveSection] = useState('overview');

  const quarterReturn = ((FUND_INFO.basePrice - FUND_INFO.basePriceStart) / FUND_INFO.basePriceStart * 100).toFixed(2);

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection quarterReturn={quarterReturn} />;
      case 'allocation':
        return <AllocationSection />;
      case 'holdings':
        return <HoldingsSection />;
      case 'performance':
        return <PerformanceSection />;
      case 'commentary':
        return <CommentarySection />;
      default:
        return <OverviewSection quarterReturn={quarterReturn} />;
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      minHeight: '100vh',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e8e8e8'
    }}>
      {/* 헤더 */}
      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.1)',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '8px' }}>
          <span style={{ fontSize: '32px' }}>📊</span>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '800',
            background: 'linear-gradient(135deg, #4E79A7, #76B7B2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0
          }}>
            운용보고서
          </h1>
        </div>
        <h2 style={{ fontSize: '20px', color: '#fff', margin: '8px 0', fontWeight: '600' }}>
          {FUND_INFO.fundNameShort}
        </h2>
        <p style={{ color: '#aaa', fontSize: '14px', margin: 0 }}>
          펀드코드: {FUND_INFO.fundCode} | {FUND_INFO.reportPeriod}
        </p>
        
        {/* 핵심 지표 카드 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '16px',
          marginTop: '24px'
        }}>
          <StatCard label="기준가" value={FUND_INFO.basePrice.toFixed(2)} unit="원" />
          <StatCard label="4분기 수익률" value={formatPercent(parseFloat(quarterReturn))} isReturn />
          <StatCard label="순자산" value={formatNumber(FUND_INFO.nav)} unit="원" />
          <StatCard label="총자산" value={formatNumber(FUND_INFO.totalAsset)} unit="원" />
        </div>
      </div>

      {/* 네비게이션 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        marginBottom: '24px',
        justifyContent: 'center'
      }}>
        {[
          { key: 'overview', label: '📋 개요', icon: '📋' },
          { key: 'allocation', label: '🥧 자산배분', icon: '🥧' },
          { key: 'holdings', label: '📦 보유종목', icon: '📦' },
          { key: 'performance', label: '📈 수익률', icon: '📈' },
          { key: 'commentary', label: '💬 운용코멘트', icon: '💬' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveSection(key)}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: activeSection === key ? '2px solid #4E79A7' : '1px solid rgba(255,255,255,0.2)',
              background: activeSection === key
                ? 'linear-gradient(135deg, #4E79A7, #59A14F)'
                : 'rgba(255,255,255,0.05)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 콘텐츠 영역 */}
      {renderSection()}

      {/* 푸터 */}
      <div style={{
        textAlign: 'center',
        marginTop: '32px',
        paddingTop: '16px',
        color: '#666',
        fontSize: '11px',
        borderTop: '1px solid rgba(255,255,255,0.05)'
      }}>
        <p>작성자: {FUND_INFO.fundManager} | 기준일: {FUND_INFO.baseDate}</p>
        <p style={{ marginTop: '4px', color: '#555' }}>
          본 운용보고서는 참고용이며, 투자 결정의 책임은 투자자 본인에게 있습니다.
        </p>
      </div>
    </div>
  );
}

// 통계 카드 컴포넌트
function StatCard({ label, value, unit, isReturn }) {
  const isPositive = isReturn && value.startsWith('+');
  const isNegative = isReturn && value.startsWith('-');
  
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      borderRadius: '12px',
      padding: '16px',
      textAlign: 'center',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      <p style={{ color: '#888', fontSize: '12px', margin: '0 0 4px 0' }}>{label}</p>
      <p style={{
        fontSize: '20px',
        fontWeight: '700',
        margin: 0,
        color: isReturn ? (isPositive ? '#59A14F' : isNegative ? '#E15759' : '#fff') : '#fff'
      }}>
        {value}
        {unit && <span style={{ fontSize: '12px', color: '#888', marginLeft: '2px' }}>{unit}</span>}
      </p>
    </div>
  );
}

// 개요 섹션
function OverviewSection({ quarterReturn }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
      {/* 기준가 추이 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h3 style={{ color: '#76B7B2', marginBottom: '20px', fontSize: '16px' }}>📈 기준가 추이</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={navTrendData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4E79A7" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#4E79A7" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="date" tick={{ fill: '#aaa', fontSize: 11 }} />
            <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fill: '#aaa', fontSize: 11 }} />
            <Tooltip 
              contentStyle={{ background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }}
              formatter={(value) => [value.toFixed(2) + '원', '기준가']}
            />
            <Area type="monotone" dataKey="price" stroke="#4E79A7" fill="url(#colorPrice)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 펀드 요약 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h3 style={{ color: '#F28E2B', marginBottom: '20px', fontSize: '16px' }}>📋 펀드 요약</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <InfoRow label="펀드명" value={FUND_INFO.fundNameShort} />
          <InfoRow label="펀드코드" value={FUND_INFO.fundCode} />
          <InfoRow label="보고기간" value={FUND_INFO.reportPeriod} />
          <InfoRow label="기준일" value={FUND_INFO.baseDate} />
          <InfoRow label="기준가" value={`${FUND_INFO.basePrice.toFixed(2)}원`} />
          <InfoRow label="4분기 수익률" value={formatPercent(parseFloat(quarterReturn))} highlight />
          <InfoRow label="순자산총액" value={`${formatNumber(FUND_INFO.nav)}원`} />
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value, highlight }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      padding: '8px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)'
    }}>
      <span style={{ color: '#888', fontSize: '13px' }}>{label}</span>
      <span style={{
        color: highlight ? (value.startsWith('+') ? '#59A14F' : '#E15759') : '#fff',
        fontSize: '13px',
        fontWeight: highlight ? '700' : '500'
      }}>{value}</span>
    </div>
  );
}

// 자산배분 섹션
function AllocationSection() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
      {/* 파이 차트 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h3 style={{ color: '#EDC948', marginBottom: '20px', fontSize: '16px' }}>🥧 자산배분 현황</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={assetAllocationData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              label={({ name, value }) => `${name} ${value.toFixed(1)}%`}
              labelLine={{ stroke: '#666' }}
            >
              {assetAllocationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }}
              formatter={(value, name, props) => [`${value.toFixed(2)}% (${props.payload.amount}백만원)`, props.payload.name]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* 바 차트 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h3 style={{ color: '#59A14F', marginBottom: '20px', fontSize: '16px' }}>📊 자산군별 비중</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={assetAllocationData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fill: '#aaa', fontSize: 11 }} />
            <YAxis type="category" dataKey="name" tick={{ fill: '#aaa', fontSize: 11 }} width={100} />
            <Tooltip 
              contentStyle={{ background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }}
              formatter={(value) => [`${value.toFixed(2)}%`, '비중']}
            />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {assetAllocationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// 보유종목 섹션
function HoldingsSection() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.08)',
      overflowX: 'auto'
    }}>
      <h3 style={{ color: '#4E79A7', marginBottom: '20px', fontSize: '16px' }}>📦 보유종목 TOP 10</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr style={{ background: 'rgba(78,121,167,0.3)' }}>
            <th style={{ padding: '12px', textAlign: 'center', color: '#fff', fontWeight: '700' }}>순위</th>
            <th style={{ padding: '12px', textAlign: 'left', color: '#fff', fontWeight: '700' }}>종목명</th>
            <th style={{ padding: '12px', textAlign: 'center', color: '#fff', fontWeight: '700' }}>유형</th>
            <th style={{ padding: '12px', textAlign: 'right', color: '#fff', fontWeight: '700' }}>비중(%)</th>
            <th style={{ padding: '12px', textAlign: 'right', color: '#fff', fontWeight: '700' }}>평가금액(백만)</th>
          </tr>
        </thead>
        <tbody>
          {holdingsData.map((item, idx) => (
            <tr key={item.rank} style={{ 
              background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
              borderBottom: '1px solid rgba(255,255,255,0.05)'
            }}>
              <td style={{ padding: '10px', textAlign: 'center', color: '#EDC948', fontWeight: '700' }}>{item.rank}</td>
              <td style={{ padding: '10px', textAlign: 'left', color: '#fff' }}>{item.name}</td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: '600',
                  background: item.type === 'ETF' ? 'rgba(89,161,79,0.3)' : 
                             item.type === '국고채' ? 'rgba(78,121,167,0.3)' : 
                             'rgba(242,142,43,0.3)',
                  color: item.type === 'ETF' ? '#59A14F' : 
                         item.type === '국고채' ? '#4E79A7' : 
                         '#F28E2B'
                }}>{item.type}</span>
              </td>
              <td style={{ padding: '10px', textAlign: 'right', color: '#76B7B2', fontWeight: '600' }}>{item.weight.toFixed(2)}%</td>
              <td style={{ padding: '10px', textAlign: 'right', color: '#ccc' }}>{item.amount.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// 수익률 섹션
function PerformanceSection() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
      {/* 기간별 수익률 차트 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h3 style={{ color: '#E15759', marginBottom: '20px', fontSize: '16px' }}>📈 기간별 수익률 비교</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={returnData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="period" tick={{ fill: '#aaa', fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: '#aaa', fontSize: 11 }} />
            <Tooltip 
              contentStyle={{ background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }}
              formatter={(value) => [`${value.toFixed(2)}%`]}
            />
            <Legend />
            <Bar dataKey="fund" name="펀드" fill="#4E79A7" radius={[4, 4, 0, 0]} />
            <Bar dataKey="bm" name="BM" fill="#76B7B2" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 수익률 테이블 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h3 style={{ color: '#59A14F', marginBottom: '20px', fontSize: '16px' }}>📊 수익률 상세</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(89,161,79,0.3)' }}>
              <th style={{ padding: '12px', textAlign: 'center', color: '#fff' }}>기간</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>펀드</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>BM</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>초과수익</th>
            </tr>
          </thead>
          <tbody>
            {returnData.map((item, idx) => {
              const excess = item.fund - item.bm;
              return (
                <tr key={item.period} style={{ 
                  background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <td style={{ padding: '10px', textAlign: 'center', color: '#fff', fontWeight: '600' }}>{item.period}</td>
                  <td style={{ padding: '10px', textAlign: 'right', color: item.fund >= 0 ? '#59A14F' : '#E15759', fontWeight: '600' }}>
                    {formatPercent(item.fund)}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'right', color: '#888' }}>{formatPercent(item.bm)}</td>
                  <td style={{ padding: '10px', textAlign: 'right', color: excess >= 0 ? '#EDC948' : '#E15759', fontWeight: '600' }}>
                    {formatPercent(excess)}
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

// 운용코멘트 섹션
function CommentarySection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <CommentCard title="🌍 시장 동향" content={COMMENTARY.market} color="#4E79A7" />
      <CommentCard title="🎯 운용 전략" content={COMMENTARY.strategy} color="#59A14F" />
      <CommentCard title="🔮 향후 전망" content={COMMENTARY.outlook} color="#F28E2B" />
    </div>
  );
}

function CommentCard({ title, content, color }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.08)',
      borderLeft: `4px solid ${color}`
    }}>
      <h3 style={{ color: color, marginBottom: '16px', fontSize: '16px' }}>{title}</h3>
      <p style={{ color: '#ccc', lineHeight: '1.8', fontSize: '14px', margin: 0 }}>{content}</p>
    </div>
  );
}
