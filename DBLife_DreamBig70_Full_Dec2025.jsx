import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area, LineChart, Line } from 'recharts';

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

// ==========================================
// 기본 정보 (월간 분석 자료 시트)
// ==========================================
const FUND_INFO = {
  fundName: 'Dream Big 70',
  fundType: '글로벌자산배분형',
  manager: '한국투자신탁운용',
  reportDate: '2025.12.31',
  monthlyReturn: -0.34,
  author: 'Covenant Seo',
};

// ==========================================
// 월간 분석 자료 시트 - 성과 사유
// ==========================================
const PERFORMANCE_COMMENT = `12월 한 달간 DB70과 DB30 펀드는 각각 -0.34%, -0.82%의 수익률을 기록했습니다. 12월 글로벌 증시는 성장주와 가치주간의 순환매 지속되고, 대형주와 중소형주의 주가 강세 차이가 나타나는 국면이 나타났습니다. 오라클 실적 부진과 CDS 프리미엄 확대로 점화된 AI버블론은 마이크론 실적 발표를 계기로 하여 소강상태에 돌입, 연말 위험선호 재차 확대되는 모습이었습니다. 미국 채권 시장은 중단기물과 장기물 영역이 상반된 방향성을 나타냈습니다. 단기물은 Fed의 추가 금리인하에 따라 하락했지만, 장기물은 기대 이상의 성장률을 나타낸 미국 3분기 GDP 결과와 연준 내부의 이견을 시사한 FOMC 의사록 등의 재료로 상승했습니다.`;

// ==========================================
// 월간 분석 자료 시트 - NAV 내 자산비중 시계열 (실제 DB 수치)
// ==========================================
const navAssetData = [
  { asset: '주식', region: '북미', y1: 48.60, m6: 46.73, prevM: 45.64, currM: 40.62, comment: '강세장은 26년에도 연장될 것으로 예상. 금리 인하 기조와 관세 불확실성 완화는 경기 하방 위험을 낮추고 골디락스 환경을 지속시킬 것. 기업들의 실적 환경도 긍정적. 반면, 26년에도 AI 버블 논쟁은 반복될 가능성이 높음. 분산 투자의 필요성이 높아지는 국면.' },
  { asset: '', region: '유럽', y1: 8.26, m6: 9.27, prevM: 9.46, currM: 10.01, comment: '' },
  { asset: '', region: '일본', y1: 3.04, m6: 3.08, prevM: 3.18, currM: 3.18, comment: '' },
  { asset: '', region: '이머징', y1: 6.30, m6: 7.16, prevM: 7.03, currM: 7.15, comment: '' },
  { asset: '채권', region: '선진국 국채', y1: 22.80, m6: 14.70, prevM: 24.80, currM: 14.80, comment: '연내 추가 2회 인하가 전망되는 가운데 최근 발표된 미국 11월 CPI은 셧다운 영향으로 왜곡이 발생했다는 논란이 있지만, 둔화세가 이어지고 있음. 금리 인하는 미국과 글로벌 경제의 하방 경직성을 강화하고, 금융시장의 risk-on 모드를 지속시키는 핵심 요인으로 작용할 것' },
  { asset: '', region: '이머징 국채', y1: 0.00, m6: 0.00, prevM: 0.00, currM: 0.00, comment: '' },
  { asset: '', region: 'IG/HY', y1: 2.80, m6: 9.90, prevM: 0.00, currM: 10.10, comment: '' },
  { asset: '대체자산(원자재 등)', region: '', y1: 0.78, m6: 0.00, prevM: 0.00, currM: 4.32, comment: '사상 최고치 랠리를 이어오던 금 가격은 투기 수요 약화에 따른 박스권 등락이 예상. WTI 가격 러시아-우크라 종전 협상 지연 속 국제유가 박스권 등락 지속. 공급 과잉 경계감이 시장에 팽배. OPEC+ 증산 유보에도 브라질 등 비 OPEC 국가들의 생산 확대가 공급 우위 환경을 조성. 공급 환경 관련 불확실성 높은 만큼 수요 전망에 맞춰 가격 등락 예상.' },
  { asset: '기타 유동성', region: '', y1: 7.41, m6: 9.20, prevM: 9.90, currM: 9.80, comment: '-' },
];

// 시계열 차트용 데이터
const timeSeriesData = [
  { period: '24.12', usEquity: 48.60, euEquity: 8.26, jpEquity: 3.04, emEquity: 6.30, bond: 25.60, alt: 0.78, cash: 7.41 },
  { period: '25.06', usEquity: 46.73, euEquity: 9.27, jpEquity: 3.08, emEquity: 7.16, bond: 24.60, alt: 0.00, cash: 9.20 },
  { period: '25.11', usEquity: 45.64, euEquity: 9.46, jpEquity: 3.18, emEquity: 7.03, bond: 24.80, alt: 0.00, cash: 9.90 },
  { period: '25.12', usEquity: 40.62, euEquity: 10.01, jpEquity: 3.18, emEquity: 7.15, bond: 24.90, alt: 4.32, cash: 9.80 },
];

// ==========================================
// 투자 비중 및 전망 시트 (실제 DB 수치)
// ==========================================
const investmentData = [
  { category: '위험자산', asset: '주식', region: '미국주식', bm: 41.70, actual: 40.6162, excess: -1.0838, targetExcess: -1.00, targetWeight: 40.70, comment: '연말 소비 기대감이 지나가고 가치주에서 성장주로의 자금 흐름이 본격화될 것으로 전망. 가치주와 성장주의 12MF EPS 차이는 올해 내내 벌어지고 있는 상황으로, 가치주의 가격 상승이 지속되지 못하고 성장주로의 리밸런싱이 이루어질 가능성 존재. 금주 CES 2026이 시작되는만큼, 엔비디아와 AMD 등 주요 기업들의 가이던스 및 로드맵을 통해 26년도의 AI/IT 산업 분위기가 긍정적으로 바뀔 것으로 예상' },
  { category: '', asset: '', region: '유럽주식', bm: 8.748, actual: 10.0138, excess: 1.2658, targetExcess: 1.00, targetWeight: 9.748, comment: '유럽증시 이익 전망이 25년 대비 +12%를 기록하며 증시 상승을 견인할 것으로 예상. 독일 주도 재정 확대가 25년 4분기부터 본격화된 영향으로, 유로존 경제 및 이익 지표는 26년 상반기 중 시장 예상을 상회할 가능성이 높음. 영국과 프랑스의 재정건전성 우려도 내년 상반기 중 부각될 가능성은 제한. 다만 영국은 26년 5월 지방선거 전후, 프랑스는 27년 상반기 대선을 앞두고 노이즈가 커질 여지 있어 관련 뉴스 플로우에는 주목할 필요.' },
  { category: '', asset: '', region: '일본주식', bm: 2.97, actual: 3.1783, excess: 0.2083, targetExcess: 0.20, targetWeight: 3.17, comment: '일본 증시는 일본 정부 역대 최대 예산안 확정과 함께 방위, AI, 반도체 지출 증가는 26년에도 지속될 것으로 전망. 일본의 금리 인상 기대감은 12월 기자회견으로 다소 완화됐지만 일본의 신규 채권 발행 증가로 26년에도 국채금리는 지속 상승할 것으로 예상. 1분기에도 일본 증시의 주요 테마는 반도체를 비롯한 AI 투자, 방위비 확대, 사나에노믹스, 금리 상승 그리고 글로벌 컨텐츠 소비가 핵심이 될 것으로 판단' },
  { category: '', asset: '', region: '이머징주식', bm: 6.582, actual: 7.1465, excess: 0.5645, targetExcess: 0.50, targetWeight: 7.082, comment: '중국 증시는 정책 모멘텀 소멸, 부동산 디벨로퍼 완커의 채무불이행, AI 버블 논쟁 영향으로 조정 국면에 있으나 12월 경제공작회의 이후 15.5 정책 모멘텀이 강화되며 지지선 구축과 반등 시도 과정이 진행될 것으로 예상. 다만 실물지표 둔화에도 불구 25년 5% 성장률 목표 달성이 유력하여 경기부양 강도는 온건한 수준에 그칠 가능성이 높아 선별적인 대응이 필요. 주요 EM 대비 밸류에이션 디스카운트 영역에 있는 홍콩 증시의 아웃퍼폼이 예상되며, EPS 증가세가 뚜렷한 테크주 중심으로 상승 추세 복귀를 전망.' },
  { category: '', asset: 'A.I.', region: '대체투자', bm: 5.00, actual: 4.324, excess: -0.676, targetExcess: 0.00, targetWeight: 5.00, comment: '당분간 금리 인하 기조에도 물가 재상승 리스크 부각 전까지 금 가격 상승세 숨 고르기 이어질 가능성 우세. 원/달러 1,400원 중반대 하방 우위 흐름 예상. 1월부터 외환 당국 안정화 조치 효과 가시화 예상. 내국인 해외 유출 자금 복귀 강도 모니터링 필요. 다만 경기 측면 미국 대비 펀더멘탈 강세 요인 미미해 중장기 방향성은 추후 달러순공급 강도 모니터링 뒤 재탐색 이뤄질 전망' },
  { category: '비위험자산', asset: '채권', region: 'Sovereign', bm: 15.34, actual: 14.8364, excess: -0.5036, targetExcess: 0.00, targetWeight: 15.34, comment: '당분간 박스권 탈피 유인 낮을 전망. RMP(지급준비금 관리 매입) 정책은 단기자금시장 안정을 위한 기술적 유동성 관리로 국한해 해석해야 함' },
  { category: '', asset: '', region: 'IG', bm: 4.50, actual: 10.0613, excess: 5.5613, targetExcess: 5.00, targetWeight: 9.50, comment: '' },
  { category: '', asset: '', region: 'HY', bm: 0.00, actual: 0.00, excess: 0.00, targetExcess: 0.00, targetWeight: 0.00, comment: '' },
  { category: '', asset: '', region: 'Extra_B', bm: 5.155, actual: 0.00, excess: -5.155, targetExcess: -5.00, targetWeight: 0.155, comment: '-' },
  { category: '유동성', asset: '유동성', region: '유동성', bm: 10.00, actual: 12.755, excess: 2.755, targetExcess: -0.70, targetWeight: 9.30, comment: '-' },
];

// ==========================================
// 종합 시트 - 보유종목 (실제 DB 수치, 최근 기간 20240429)
// ==========================================
const holdingsData = [
  { rank: 1, name: 'ISHARES EDGE MSCI USA QUALIT', weight: 8.00, category: '북미' },
  { rank: 2, name: 'ISHARES RUSSELL 1000 GROWTH', weight: 8.00, category: '북미' },
  { rank: 3, name: 'VANGUARD GROWTH ETF', weight: 8.00, category: '북미' },
  { rank: 4, name: 'VANGUARD MEGA CAP VALUE ETF', weight: 8.00, category: '북미' },
  { rank: 5, name: 'iShares Core International Agg', weight: 8.00, category: '선진국국채' },
  { rank: 6, name: 'USD DEPOSIT', weight: 7.00, category: '기타' },
  { rank: 7, name: 'iShares Core U.S. Aggregate Bo', weight: 6.00, category: '선진국국채' },
  { rank: 8, name: 'ISHARES MSCI EMERGING MKT IN', weight: 6.00, category: '이머징' },
  { rank: 9, name: 'ACE 단기통안채', weight: 5.00, category: '이머징국채' },
  { rank: 10, name: 'Global X U.S. Infrastructure', weight: 4.00, category: '북미' },
  { rank: 11, name: 'SPDR EURO STOXX 50 ETF', weight: 4.00, category: '유럽' },
  { rank: 12, name: 'Vanguard FTSE Europe ETF', weight: 4.00, category: '유럽' },
  { rank: 13, name: 'ISHARES MSCI ACWI ETF', weight: 3.00, category: '북미' },
  { rank: 14, name: 'ISHARES MSCI JAPAN ETF', weight: 3.00, category: '일본' },
  { rank: 15, name: 'ISHARES MBS ETF', weight: 2.00, category: '기타' },
];

// ==========================================
// 피벗 시트 - 자산군별 비중 요약 (실제 DB 수치)
// ==========================================
const pivotData = [
  { category: '북미', p1: 52.00, p2: 45.00, p3: 47.00, p4: 45.00, curr: 44.88, target: 45.00 },
  { category: '유럽', p1: 8.00, p2: 5.00, p3: 9.00, p4: 8.00, curr: 10.05, target: 8.00 },
  { category: '일본', p1: 2.00, p2: 5.00, p3: 3.00, p4: 3.00, curr: 3.59, target: 3.00 },
  { category: '이머징', p1: 5.00, p2: 6.00, p3: 6.00, p4: 6.00, curr: 6.48, target: 6.00 },
  { category: '선진국국채', p1: 18.00, p2: 13.00, p3: 18.00, p4: 17.00, curr: null, target: null },
  { category: '이머징국채', p1: 6.00, p2: 8.00, p3: 7.00, p4: 6.00, curr: 16.90, target: 17.00 },
  { category: '회사채', p1: 4.00, p2: 6.00, p3: 4.00, p4: 4.00, curr: 4.60, target: 4.00 },
  { category: '원자재', p1: 0.00, p2: 0.00, p3: 0.00, p4: null, curr: null, target: null },
  { category: '기타', p1: 5.00, p2: 12.00, p3: 6.00, p4: 11.00, curr: 3.50, target: 4.00 },
];

// 파이차트용 현재 배분 데이터
const pieData = [
  { name: '미국주식', value: 40.62, color: '#4E79A7' },
  { name: '유럽주식', value: 10.01, color: '#59A14F' },
  { name: '일본주식', value: 3.18, color: '#EDC948' },
  { name: '이머징주식', value: 7.15, color: '#F28E2B' },
  { name: '대체투자', value: 4.32, color: '#E15759' },
  { name: '선진국국채', value: 14.84, color: '#76B7B2' },
  { name: 'IG크레딧', value: 10.06, color: '#BAB0AC' },
  { name: '유동성', value: 9.80, color: '#FF9DA7' },
];

const formatPercent = (num, digits = 2) => {
  if (num === null || num === undefined) return '-';
  return (num >= 0 ? '+' : '') + num.toFixed(digits) + '%';
};

const formatWeight = (num, digits = 2) => {
  if (num === null || num === undefined) return '-';
  return num.toFixed(digits) + '%';
};

export default function DBLifeDreamBig70FullDashboard() {
  const [activeTab, setActiveTab] = useState('monthly');

  const renderContent = () => {
    switch (activeTab) {
      case 'monthly': return <MonthlyAnalysisSection />;
      case 'investment': return <InvestmentWeightSection />;
      case 'holdings': return <HoldingsSection />;
      case 'pivot': return <PivotSection />;
      default: return <MonthlyAnalysisSection />;
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
            {FUND_INFO.fundName}
          </h1>
        </div>
        <p style={{ color: '#76B7B2', fontSize: '18px', margin: '8px 0', fontWeight: '600' }}>
          {FUND_INFO.fundType} | {FUND_INFO.manager}
        </p>
        <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>
          기준일: {FUND_INFO.reportDate}
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
          marginTop: '28px'
        }}>
          <StatCard label="12월 수익률" value={formatPercent(FUND_INFO.monthlyReturn)} isReturn />
          <StatCard label="주식비중" value="60.96%" subLabel="(BM 60.00%)" />
          <StatCard label="채권비중" value="24.90%" subLabel="(BM 24.99%)" />
          <StatCard label="대체/유동성" value="14.12%" subLabel="(BM 15.00%)" />
        </div>
      </div>

      {/* 탭 네비게이션 - 엑셀 시트 기반 */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '24px',
        justifyContent: 'center'
      }}>
        {[
          { key: 'monthly', label: '📊 월간 분석 자료' },
          { key: 'investment', label: '📈 투자 비중 및 전망' },
          { key: 'holdings', label: '📦 종합 (보유종목)' },
          { key: 'pivot', label: '📋 피벗 (요약)' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding: '14px 28px',
              borderRadius: '14px',
              border: activeTab === key ? '2px solid #4E79A7' : '1px solid rgba(255,255,255,0.2)',
              background: activeTab === key
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

      {renderContent()}

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

// ==========================================
// 탭 1: 월간 분석 자료 섹션
// ==========================================
function MonthlyAnalysisSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. 성과 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h3 style={{ color: '#4E79A7', marginBottom: '16px', fontSize: '17px' }}>1. 성과</h3>
        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(78,121,167,0.2)', borderRadius: '10px', padding: '12px 20px' }}>
            <span style={{ color: '#888', fontSize: '12px' }}>기간</span>
            <p style={{ color: '#fff', fontSize: '16px', fontWeight: '600', margin: '4px 0 0 0' }}>2025.12.31</p>
          </div>
          <div style={{ background: 'rgba(225,87,89,0.2)', borderRadius: '10px', padding: '12px 20px' }}>
            <span style={{ color: '#888', fontSize: '12px' }}>월간수익률(%)</span>
            <p style={{ color: '#E15759', fontSize: '16px', fontWeight: '700', margin: '4px 0 0 0' }}>-0.34%</p>
          </div>
        </div>
        <div style={{
          background: 'rgba(78,121,167,0.1)',
          borderRadius: '12px',
          padding: '20px',
          borderLeft: '4px solid #4E79A7'
        }}>
          <h4 style={{ color: '#76B7B2', fontSize: '13px', margin: '0 0 10px 0' }}>📝 성과 사유</h4>
          <p style={{ color: '#ccc', lineHeight: '1.85', fontSize: '13px', margin: 0 }}>
            {PERFORMANCE_COMMENT}
          </p>
        </div>
      </div>

      {/* 2. 비중 - NAV 내 자산비중 테이블 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        overflowX: 'auto'
      }}>
        <h3 style={{ color: '#59A14F', marginBottom: '16px', fontSize: '17px' }}>2. 비중 - NAV 내 자산비중(%)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '900px' }}>
          <thead>
            <tr style={{ background: 'rgba(89,161,79,0.2)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#fff', width: '100px' }}>자산</th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#fff', width: '80px' }}>지역</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#fff', width: '80px' }}>1년<br/><span style={{ fontSize: '10px', color: '#888' }}>24.12.31</span></th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#fff', width: '80px' }}>6개월<br/><span style={{ fontSize: '10px', color: '#888' }}>25.06.30</span></th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#fff', width: '80px' }}>전월말<br/><span style={{ fontSize: '10px', color: '#888' }}>25.11.30</span></th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#fff', width: '80px' }}>월말<br/><span style={{ fontSize: '10px', color: '#888' }}>25.12.31</span></th>
              <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>자산배분 사유(전월분) 및 향후 전망</th>
            </tr>
          </thead>
          <tbody>
            {navAssetData.map((item, idx) => (
              <tr key={idx} style={{
                background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <td style={{ padding: '10px', color: item.asset ? '#EDC948' : '#666', fontWeight: item.asset ? '600' : '400' }}>{item.asset}</td>
                <td style={{ padding: '10px', color: '#fff' }}>{item.region}</td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#888' }}>{formatWeight(item.y1)}</td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#888' }}>{formatWeight(item.m6)}</td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#aaa' }}>{formatWeight(item.prevM)}</td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#76B7B2', fontWeight: '600' }}>{formatWeight(item.currM)}</td>
                <td style={{ padding: '10px', color: '#999', fontSize: '11px', maxWidth: '400px' }}>{item.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 자산배분 추이 차트 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h3 style={{ color: '#F28E2B', marginBottom: '20px', fontSize: '17px' }}>📈 자산배분 추이 (최근 1년)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={timeSeriesData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis dataKey="period" tick={{ fill: '#aaa', fontSize: 11 }} />
            <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: '#aaa', fontSize: 11 }} />
            <Tooltip
              contentStyle={{ background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }}
              formatter={(value) => [`${value.toFixed(2)}%`]}
            />
            <Legend />
            <Area type="monotone" dataKey="usEquity" name="미국" stackId="1" stroke="#4E79A7" fill="#4E79A7" fillOpacity={0.8} />
            <Area type="monotone" dataKey="euEquity" name="유럽" stackId="1" stroke="#59A14F" fill="#59A14F" fillOpacity={0.8} />
            <Area type="monotone" dataKey="jpEquity" name="일본" stackId="1" stroke="#EDC948" fill="#EDC948" fillOpacity={0.8} />
            <Area type="monotone" dataKey="emEquity" name="이머징" stackId="1" stroke="#F28E2B" fill="#F28E2B" fillOpacity={0.8} />
            <Area type="monotone" dataKey="bond" name="채권" stackId="1" stroke="#76B7B2" fill="#76B7B2" fillOpacity={0.8} />
            <Area type="monotone" dataKey="alt" name="대체" stackId="1" stroke="#E15759" fill="#E15759" fillOpacity={0.8} />
            <Area type="monotone" dataKey="cash" name="유동성" stackId="1" stroke="#BAB0AC" fill="#BAB0AC" fillOpacity={0.8} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ==========================================
// 탭 2: 투자 비중 및 전망 섹션
// ==========================================
function InvestmentWeightSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* BM vs 실제 vs 목표 테이블 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        overflowX: 'auto'
      }}>
        <h3 style={{ color: '#4E79A7', marginBottom: '16px', fontSize: '17px' }}>📊 Dream Big 70 - 투자 비중 및 전망 (기준일: 2025.12.31)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', minWidth: '1000px' }}>
          <thead>
            <tr style={{ background: 'rgba(78,121,167,0.2)' }}>
              <th style={{ padding: '10px', textAlign: 'center', color: '#fff', width: '70px' }}>구분</th>
              <th style={{ padding: '10px', textAlign: 'center', color: '#fff', width: '50px' }}>자산</th>
              <th style={{ padding: '10px', textAlign: 'center', color: '#fff', width: '70px' }}>지역</th>
              <th style={{ padding: '10px', textAlign: 'right', color: '#fff', width: '70px' }}>BM<br/>투자비중</th>
              <th style={{ padding: '10px', textAlign: 'right', color: '#fff', width: '70px' }}>실제<br/>투자비중</th>
              <th style={{ padding: '10px', textAlign: 'right', color: '#fff', width: '70px' }}>초과비중<br/>(+/-)</th>
              <th style={{ padding: '10px', textAlign: 'right', color: '#fff', width: '70px' }}>목표<br/>초과비중</th>
              <th style={{ padding: '10px', textAlign: 'right', color: '#fff', width: '70px' }}>목표비중</th>
              <th style={{ padding: '10px', textAlign: 'left', color: '#fff' }}>Comment</th>
            </tr>
          </thead>
          <tbody>
            {investmentData.map((item, idx) => (
              <tr key={idx} style={{
                background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <td style={{ padding: '8px', textAlign: 'center', color: item.category ? '#EDC948' : '#666', fontWeight: item.category ? '600' : '400' }}>{item.category}</td>
                <td style={{ padding: '8px', textAlign: 'center', color: item.asset ? '#76B7B2' : '#666' }}>{item.asset}</td>
                <td style={{ padding: '8px', textAlign: 'center', color: '#fff', fontWeight: '500' }}>{item.region}</td>
                <td style={{ padding: '8px', textAlign: 'right', color: '#4E79A7' }}>{formatWeight(item.bm)}</td>
                <td style={{ padding: '8px', textAlign: 'right', color: '#59A14F', fontWeight: '600' }}>{formatWeight(item.actual, 4)}</td>
                <td style={{ padding: '8px', textAlign: 'right', color: item.excess >= 0 ? '#59A14F' : '#E15759', fontWeight: '600' }}>
                  {item.excess >= 0 ? '+' : ''}{item.excess.toFixed(4)}%
                </td>
                <td style={{ padding: '8px', textAlign: 'right', color: '#EDC948' }}>
                  {item.targetExcess >= 0 ? '+' : ''}{item.targetExcess.toFixed(2)}%
                </td>
                <td style={{ padding: '8px', textAlign: 'right', color: '#F28E2B' }}>{formatWeight(item.targetWeight)}</td>
                <td style={{ padding: '8px', color: '#999', fontSize: '10px', maxWidth: '300px', lineHeight: '1.4' }}>{item.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 자산별 상세 전망 카드 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '16px' }}>
        {investmentData.filter(d => d.comment && d.comment !== '-').map((item, idx) => (
          <div key={idx} style={{
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '14px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.08)',
            borderLeft: `4px solid ${PIE_COLORS[idx % PIE_COLORS.length]}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ color: PIE_COLORS[idx % PIE_COLORS.length], margin: 0, fontSize: '15px' }}>
                {item.region}
              </h4>
              <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                <span style={{ color: '#888' }}>BM: <strong style={{ color: '#4E79A7' }}>{formatWeight(item.bm)}</strong></span>
                <span style={{ color: '#888' }}>실제: <strong style={{ color: '#59A14F' }}>{formatWeight(item.actual, 2)}</strong></span>
                <span style={{ color: '#888' }}>초과: <strong style={{ color: item.excess >= 0 ? '#59A14F' : '#E15759' }}>{formatPercent(item.excess, 2)}</strong></span>
              </div>
            </div>
            <p style={{ color: '#bbb', lineHeight: '1.75', fontSize: '12px', margin: 0 }}>{item.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 탭 3: 종합 (보유종목) 섹션
// ==========================================
function HoldingsSection() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
      {/* 보유종목 테이블 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h3 style={{ color: '#EDC948', marginBottom: '16px', fontSize: '17px' }}>📦 보유종목 TOP 15</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: 'rgba(237,201,72,0.2)' }}>
              <th style={{ padding: '10px', textAlign: 'center', color: '#fff', width: '50px' }}>순위</th>
              <th style={{ padding: '10px', textAlign: 'left', color: '#fff' }}>종목명</th>
              <th style={{ padding: '10px', textAlign: 'right', color: '#fff', width: '80px' }}>비중(%)</th>
              <th style={{ padding: '10px', textAlign: 'center', color: '#fff', width: '80px' }}>구분</th>
            </tr>
          </thead>
          <tbody>
            {holdingsData.map((item, idx) => (
              <tr key={item.rank} style={{
                background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <td style={{ padding: '8px', textAlign: 'center', color: '#EDC948', fontWeight: '700' }}>{item.rank}</td>
                <td style={{ padding: '8px', color: '#fff' }}>{item.name}</td>
                <td style={{ padding: '8px', textAlign: 'right', color: '#76B7B2', fontWeight: '600' }}>{item.weight.toFixed(2)}%</td>
                <td style={{ padding: '8px', textAlign: 'center' }}>
                  <span style={{
                    padding: '3px 8px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: '600',
                    background: item.category === '북미' ? 'rgba(78,121,167,0.3)' :
                              item.category === '유럽' ? 'rgba(89,161,79,0.3)' :
                              item.category === '일본' ? 'rgba(237,201,72,0.3)' :
                              item.category === '이머징' ? 'rgba(242,142,43,0.3)' :
                              'rgba(118,183,178,0.3)',
                    color: item.category === '북미' ? '#4E79A7' :
                           item.category === '유럽' ? '#59A14F' :
                           item.category === '일본' ? '#EDC948' :
                           item.category === '이머징' ? '#F28E2B' :
                           '#76B7B2'
                  }}>{item.category}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 파이 차트 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h3 style={{ color: '#76B7B2', marginBottom: '20px', fontSize: '17px' }}>🥧 자산배분 현황 (2025.12.31)</h3>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={120}
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
    </div>
  );
}

// ==========================================
// 탭 4: 피벗 (요약) 섹션
// ==========================================
function PivotSection() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 피벗 테이블 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        overflowX: 'auto'
      }}>
        <h3 style={{ color: '#F28E2B', marginBottom: '16px', fontSize: '17px' }}>📋 자산군별 비중 추이 (피벗)</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: 'rgba(242,142,43,0.2)' }}>
              <th style={{ padding: '12px', textAlign: 'left', color: '#fff' }}>구분</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>23.04.29</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>23.10.29</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>24.03.29</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>24.04.29</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>현재비중</th>
              <th style={{ padding: '12px', textAlign: 'right', color: '#fff' }}>목표비중</th>
            </tr>
          </thead>
          <tbody>
            {pivotData.map((item, idx) => (
              <tr key={item.category} style={{
                background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.05)'
              }}>
                <td style={{ padding: '10px', color: '#EDC948', fontWeight: '600' }}>{item.category}</td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#888' }}>{item.p1 !== null ? item.p1 + '%' : '-'}</td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#888' }}>{item.p2 !== null ? item.p2 + '%' : '-'}</td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#888' }}>{item.p3 !== null ? item.p3 + '%' : '-'}</td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#aaa' }}>{item.p4 !== null ? item.p4 + '%' : '-'}</td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#76B7B2', fontWeight: '600' }}>{item.curr !== null ? item.curr.toFixed(2) + '%' : '-'}</td>
                <td style={{ padding: '10px', textAlign: 'right', color: '#59A14F', fontWeight: '600' }}>{item.target !== null ? item.target + '%' : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 비중 추이 차트 */}
      <div style={{
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h3 style={{ color: '#76B7B2', marginBottom: '20px', fontSize: '17px' }}>📊 주요 자산군 비중 변화</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={pivotData.filter(d => d.curr !== null)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" tickFormatter={(v) => `${v}%`} tick={{ fill: '#aaa', fontSize: 11 }} domain={[0, 50]} />
            <YAxis type="category" dataKey="category" tick={{ fill: '#aaa', fontSize: 11 }} width={80} />
            <Tooltip
              contentStyle={{ background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }}
              formatter={(value) => [`${value?.toFixed(2)}%`]}
            />
            <Legend />
            <Bar dataKey="curr" name="현재비중" fill="#76B7B2" radius={[0, 4, 4, 0]} />
            <Bar dataKey="target" name="목표비중" fill="#59A14F" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
