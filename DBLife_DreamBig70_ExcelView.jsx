import React, { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

// Tableau 컬러 팔레트
const PIE_COLORS = ['#4E79A7', '#59A14F', '#F28E2B', '#E15759', '#EDC948', '#76B7B2', '#FF9DA7', '#BAB0AC'];

// ==========================================
// 기본 정보
// ==========================================
const FUND_INFO = {
  fundName: 'Dream Big 70',
  fundType: '글로벌자산배분형',
  manager: '한국투자신탁운용',
  reportDate: '2025.12.31',
  author: 'Covenant Seo',
};

// ==========================================
// 시트1: 월간 분석 자료 - 1. 성과
// ==========================================
const PERFORMANCE = {
  period: '2025-12-31',
  monthlyReturn: -0.0034,
  comment: `12월 한 달간 DB70과 DB30 펀드는 각각 -0.34%, -0.82%의 수익률을 기록했습니다. 12월 글로벌 증시는 성장주와 가치주간의 순환매 지속되고, 대형주와 중소형주의 주가 강세 차이가 나타나는 국면이 나타났습니다. 오라클 실적 부진과 CDS 프리미엄 확대로 점화된 AI버블론은 마이크론 실적 발표를 계기로 하여 소강상태에 돌입, 연말 위험선호 재차 확대되는 모습이었습니다. 미국 채권 시장은 중단기물과 장기물 영역이 상반된 방향성을 나타냈습니다. 단기물은 Fed의 추가 금리인하에 따라 하락했지만, 장기물은 기대 이상의 성장률을 나타낸 미국 3분기 GDP 결과와 연준 내부의 이견을 시사한 FOMC 의사록 등의 재료로 상승했습니다.`
};

// ==========================================
// 시트1: 월간 분석 자료 - 2. 비중 (NAV 내 자산비중)
// ==========================================
const NAV_DATA = [
  { asset: '주식', region: '북미', y1_2412: 0.486, m6_2506: 0.4673, prev_2511: 0.4564, curr_2512: 0.4062, comment: '강세장은 26년에도 연장될 것으로 예상. 금리 인하 기조와 관세 불확실성 완화는 경기 하방 위험을 낮추고 골디락스 환경을 지속시킬 것. 기업들의 실적 환경도 긍정적. 반면, 26년에도 AI 버블 논쟁은 반복될 가능성이 높음. 분산 투자의 필요성이 높아지는 국면.' },
  { asset: '', region: '유럽', y1_2412: 0.0826, m6_2506: 0.0927, prev_2511: 0.0946, curr_2512: 0.1001, comment: '' },
  { asset: '', region: '일본', y1_2412: 0.0304, m6_2506: 0.0308, prev_2511: 0.0318, curr_2512: 0.0318, comment: '' },
  { asset: '', region: '이머징', y1_2412: 0.063, m6_2506: 0.0716, prev_2511: 0.0703, curr_2512: 0.0715, comment: '' },
  { asset: '채권', region: '선진국 국채', y1_2412: 0.228, m6_2506: 0.147, prev_2511: 0.248, curr_2512: 0.148, comment: '연내 추가 2회 인하가 전망되는 가운데 최근 발표된 미국 11월 CPI은 셧다운 영향으로 왜곡이 발생했다는 논란이 있지만, 둔화세가 이어지고 있음. 금리 인하는 미국과 글로벌 경제의 하방 경직성을 강화하고, 금융시장의 risk-on 모드를 지속시키는 핵심 요인으로 작용할 것' },
  { asset: '', region: '이머징 국채', y1_2412: 0, m6_2506: 0, prev_2511: 0, curr_2512: 0, comment: '' },
  { asset: '', region: 'IG/HY', y1_2412: 0.028, m6_2506: 0.099, prev_2511: 0, curr_2512: 0.101, comment: '' },
  { asset: '대체자산(원자재 등)', region: '', y1_2412: 0.0078, m6_2506: 0, prev_2511: 0, curr_2512: 0.0432, comment: '사상 최고치 랠리를 이어오던 금 가격은 투기 수요 약화에 따른 박스권 등락이 예상. WTI 가격 러시아-우크라 종전 협상 지연 속 국제유가 박스권 등락 지속. 공급 과잉 경계감이 시장에 팽배. OPEC+ 증산 유보에도 브라질 등 비 OPEC 국가들의 생산 확대가 공급 우위 환경을 조성. 공급 환경 관련 불확실성 높은 만큼 수요 전망에 맞춰 가격 등락 예상.' },
  { asset: '기타 유동성', region: '', y1_2412: 0.0741, m6_2506: 0.092, prev_2511: 0.099, curr_2512: 0.098, comment: '-' },
  { asset: '계', region: '', y1_2412: 0.9999, m6_2506: 1.0004, prev_2511: 1.0001, curr_2512: 0.9998, comment: '-' },
];

// ==========================================
// 시트2: 투자 비중 및 전망 (Dream Big 70)
// ==========================================
const INVESTMENT_DATA = [
  { category: '위험자산', asset: '주식', region: '미국주식', bm: 0.417, actual: 0.406162, excess: -0.010838, targetExcess: -0.01, targetWeight: 0.407, comment: '연말 소비 기대감이 지나가고 가치주에서 성장주로의 자금 흐름이 본격화될 것으로 전망. 가치주와 성장주의 12MF EPS 차이는 올해 내내 벌어지고 있는 상황으로, 가치주의 가격 상승이 지속되지 못하고 성장주로의 리밸런싱이 이루어질 가능성 존재\n금주 CES 2026이 시작되는만큼, 엔비디아와 AMD 등 주요 기업들의 가이던스 및 로드맵을 통해 26년도의 AI/IT 산업 분위기가 긍정적으로 바뀔 것으로 예상' },
  { category: '', asset: '', region: '유럽주식', bm: 0.08748, actual: 0.100138, excess: 0.012658, targetExcess: 0.01, targetWeight: 0.09748, comment: '유럽증시 이익 전망이 25년 대비 +12%를 기록하며 증시 상승을 견인할 것으로 예상. 독일 주도 재정 확대가 25년 4분기부터 본격화된 영향으로, 유로존 경제 및 이익 지표는 26년 상반기 중 시장 예상을 상회할 가능성이 높음. 영국과 프랑스의 재정건전성 우려도 내년 상반기 중 부각될 가능성은 제한. 다만 영국은 26년 5월 지방선거 전후, 프랑스는 27년 상반기 대선을 앞두고 노이즈가 커질 여지 있어 관련 뉴스 플로우에는 주목할 필요.' },
  { category: '', asset: '', region: '일본주식', bm: 0.0297, actual: 0.031783, excess: 0.002083, targetExcess: 0.002, targetWeight: 0.0317, comment: '일본 증시는 일본 정부 역대 최대 예산안 확정과 함께 방위, AI, 반도체 지출 증가는 26년에도 지속될 것으로 전망. 일본의 금리 인상 기대감은 12월 기자회견으로 다소 완화됐지만 일본의 신규 채권 발행 증가로 26년에도 국채금리는 지속 상승할 것으로 예상. 1분기에도 일본 증시의 주요 테마는 반도체를 비롯한 AI 투자, 방위비 확대, 사나에노믹스, 금리 상승 그리고 글로벌 컨텐츠 소비가 핵심이 될 것으로 판단' },
  { category: '', asset: '', region: '이머징주식', bm: 0.06582, actual: 0.071465, excess: 0.005645, targetExcess: 0.005, targetWeight: 0.07082, comment: '중국 증시는 정책 모멘텀 소멸, 부동산 디벨로퍼 완커의 채무불이행, AI 버블 논쟁 영향으로 조정 국면에 있으나 12월 경제공작회의 이후 15.5 정책 모멘텀이 강화되며 지지선 구축과 반등 시도 과정이 진행될 것으로 예상. 다만 실물지표 둔화에도 불구 25년 5% 성장률 목표 달성이 유력하여 경기부양 강도는 온건한 수준에 그칠 가능성이 높아 선별적인 대응이 필요. 주요 EM 대비 밸류에이션 디스카운트 영역에 있는 홍콩 증시의 아웃퍼폼이 예상되며, EPS 증가세가 뚜렷한 테크주 중심으로 상승 추세 복귀를 전망.' },
  { category: '', asset: 'A. I.', region: '대체투자', bm: 0.05, actual: 0.04324, excess: -0.00676, targetExcess: 0, targetWeight: 0.05, comment: '당분간 금리 인하 기조에도 물가 재상승 리스크 부각 전까지 금 가격 상승세 숨 고르기 이어질 가능성 우세. 원/달러 1,400원 중반대 하방 우위 흐름 예상. 1월부터 외환 당국 안정화 조치 효과 가시화 예상. 내국인 해외 유출 자금 복귀 강도 모니터링 필요. 다만 경기 측면 미국 대비 펀더멘탈 강세 요인 미미해 중장기 방향성은 추후 달러순공급 강도 모니터링 뒤 재탐색 이뤄질 전망' },
  { category: '비위험자산', asset: '채권', region: 'Sovereign', bm: 0.1534, actual: 0.148364, excess: -0.005036, targetExcess: 0, targetWeight: 0.1534, comment: '당분간 박스권 탈피 유인 낮을 전망. RMP(지급준비금 관리 매입) 정책은 단기자금시장 안정을 위한 기술적 유동성 관리로 국한해 해석해야 함' },
  { category: '', asset: '', region: 'IG', bm: 0.045, actual: 0.100613, excess: 0.055613, targetExcess: 0.05, targetWeight: 0.095, comment: '' },
  { category: '', asset: '', region: 'HY', bm: 0, actual: 0, excess: 0, targetExcess: 0, targetWeight: 0, comment: '' },
  { category: '', asset: '', region: 'Extra_B', bm: 0.05155, actual: 0, excess: -0.05155, targetExcess: -0.05, targetWeight: 0.00155, comment: '-' },
  { category: '유동성', asset: '유동성', region: '유동성', bm: 0.1, actual: 0.12755, excess: 0.02755, targetExcess: -0.007, targetWeight: 0.093, comment: '-' },
];

// ==========================================
// 시트3: 종합 (보유종목) - 최신 기간 20240429
// ==========================================
const HOLDINGS_DATA = [
  { rank: 1, name: 'ISHARES EDGE MSCI USA QUALIT', weight: 0.08, category: '북미' },
  { rank: 2, name: 'ISHARES RUSSELL 1000 GROWTH', weight: 0.08, category: '북미' },
  { rank: 3, name: 'VANGUARD GROWTH ETF', weight: 0.08, category: '북미' },
  { rank: 4, name: 'VANGUARD MEGA CAP VALUE ETF', weight: 0.08, category: '북미' },
  { rank: 5, name: 'iShares Core International Agg', weight: 0.08, category: '선진국국채' },
  { rank: 6, name: 'USD DEPOSIT', weight: 0.07, category: '기타' },
  { rank: 7, name: 'iShares Core U.S. Aggregate Bo', weight: 0.06, category: '선진국국채' },
  { rank: 8, name: 'ISHARES MSCI EMERGING MKT IN', weight: 0.06, category: '이머징' },
  { rank: 9, name: 'ACE 단기통안채', weight: 0.05, category: '이머징국채' },
  { rank: 10, name: 'Global X U.S. Infrastructure', weight: 0.04, category: '북미' },
  { rank: 11, name: 'SPDR EURO STOXX 50 ETF', weight: 0.04, category: '유럽' },
  { rank: 12, name: 'Vanguard FTSE Europe ETF', weight: 0.04, category: '유럽' },
  { rank: 13, name: 'ISHARES MSCI ACWI ETF', weight: 0.03, category: '북미' },
  { rank: 14, name: 'ISHARES MSCI JAPAN ETF', weight: 0.03, category: '일본' },
  { rank: 15, name: 'ISHARES MBS ETF', weight: 0.02, category: '기타' },
  { rank: 16, name: 'COMM SERV SELECT SECTOR SPDR', weight: 0.02, category: '북미' },
  { rank: 17, name: 'ISHARES PHLX SOX SEMICONDUCT', weight: 0.02, category: '북미' },
  { rank: 18, name: 'MATERIALS SELECT SECTOR SPDR', weight: 0.02, category: '북미' },
  { rank: 19, name: 'Vanguard Total International Bond ETF', weight: 0.02, category: '선진국국채' },
  { rank: 20, name: 'ISHARES IBOXX INV GR CORP BD', weight: 0.02, category: '회사채' },
];

// ==========================================
// 시트4: 피벗 (자산군별 비중 요약)
// ==========================================
const PIVOT_DATA = [
  { category: '북미', p1_230429: 0.52, p2_231029: 0.45, p3_240329: 0.47, p4_240429: 0.45, curr: 0.4488, target: 0.45 },
  { category: '유럽', p1_230429: 0.08, p2_231029: 0.05, p3_240329: 0.09, p4_240429: 0.08, curr: 0.1005, target: 0.08 },
  { category: '일본', p1_230429: 0.02, p2_231029: 0.05, p3_240329: 0.03, p4_240429: 0.03, curr: 0.0359, target: 0.03 },
  { category: '이머징', p1_230429: 0.05, p2_231029: 0.06, p3_240329: 0.06, p4_240429: 0.06, curr: 0.0648, target: 0.06 },
  { category: '선진국국채', p1_230429: 0.18, p2_231029: 0.13, p3_240329: 0.18, p4_240429: 0.17, curr: null, target: null },
  { category: '이머징국채', p1_230429: 0.06, p2_231029: 0.08, p3_240329: 0.07, p4_240429: 0.06, curr: 0.169, target: 0.17 },
  { category: '회사채', p1_230429: 0.04, p2_231029: 0.06, p3_240329: 0.04, p4_240429: 0.04, curr: 0.046, target: 0.04 },
  { category: '원자재', p1_230429: 0.00, p2_231029: 0.00, p3_240329: 0.00, p4_240429: null, curr: null, target: null },
  { category: '기타', p1_230429: 0.05, p2_231029: 0.12, p3_240329: 0.06, p4_240429: 0.11, curr: 0.035, target: 0.04 },
];

// 유틸리티 함수
const formatPct = (v, digits = 2) => v !== null && v !== undefined ? (v * 100).toFixed(digits) + '%' : '-';
const formatPctSigned = (v, digits = 2) => {
  if (v === null || v === undefined) return '-';
  const pct = (v * 100).toFixed(digits);
  return v >= 0 ? '+' + pct + '%' : pct + '%';
};

export default function DBLifeDreamBig70ExcelView() {
  const [activeTab, setActiveTab] = useState('sheet1');

  const tabs = [
    { key: 'sheet1', label: '📊 월간 분석 자료' },
    { key: 'sheet2', label: '📈 투자 비중 및 전망' },
    { key: 'sheet3', label: '📦 종합' },
    { key: 'sheet4', label: '📋 피벗' },
  ];

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
      minHeight: '100vh',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      color: '#e8e8e8'
    }}>
      {/* 헤더 */}
      <Header />
      
      {/* 탭 네비게이션 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '24px', justifyContent: 'center' }}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            style={{
              padding: '14px 28px',
              borderRadius: '14px',
              border: activeTab === key ? '2px solid #4E79A7' : '1px solid rgba(255,255,255,0.2)',
              background: activeTab === key ? 'linear-gradient(135deg, #4E79A7, #59A14F)' : 'rgba(255,255,255,0.05)',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 콘텐츠 */}
      {activeTab === 'sheet1' && <Sheet1_MonthlyAnalysis />}
      {activeTab === 'sheet2' && <Sheet2_InvestmentWeight />}
      {activeTab === 'sheet3' && <Sheet3_Holdings />}
      {activeTab === 'sheet4' && <Sheet4_Pivot />}

      {/* 푸터 */}
      <div style={{ textAlign: 'center', marginTop: '32px', paddingTop: '16px', color: '#555', fontSize: '11px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p>작성자: {FUND_INFO.author} | 기준일: {FUND_INFO.reportDate}</p>
      </div>
    </div>
  );
}

function Header() {
  return (
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
      <p style={{ color: '#888', fontSize: '14px', margin: 0 }}>기준일: {FUND_INFO.reportDate}</p>
    </div>
  );
}

// ==========================================
// 시트1: 월간 분석 자료
// ==========================================
function Sheet1_MonthlyAnalysis() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. 성과 */}
      <Card title="1. 성과" color="#4E79A7">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ background: 'rgba(78,121,167,0.3)' }}>
              <th style={thStyle}>기간</th>
              <th style={thStyle}>월간수익률(%)</th>
              <th style={{ ...thStyle, textAlign: 'left' }}>성과 사유</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td style={tdStyle}>{PERFORMANCE.period}</td>
              <td style={{ ...tdStyle, color: '#E15759', fontWeight: '700' }}>{formatPct(PERFORMANCE.monthlyReturn)}</td>
              <td style={{ ...tdStyle, textAlign: 'left', lineHeight: '1.7', fontSize: '12px', color: '#ccc' }}>{PERFORMANCE.comment}</td>
            </tr>
          </tbody>
        </table>
      </Card>

      {/* 2. 비중 */}
      <Card title="2. 비중 - NAV 내 자산비중(%)" color="#59A14F">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', minWidth: '1000px' }}>
            <thead>
              <tr style={{ background: 'rgba(89,161,79,0.3)' }}>
                <th style={thStyle}>자산</th>
                <th style={thStyle}>지역</th>
                <th style={thStyle}>1년<br/><span style={{ fontSize: '10px', color: '#888' }}>2024-12-31</span></th>
                <th style={thStyle}>6개월<br/><span style={{ fontSize: '10px', color: '#888' }}>2025-06-30</span></th>
                <th style={thStyle}>전월말<br/><span style={{ fontSize: '10px', color: '#888' }}>2025-11-30</span></th>
                <th style={thStyle}>월말<br/><span style={{ fontSize: '10px', color: '#888' }}>2025-12-31</span></th>
                <th style={{ ...thStyle, textAlign: 'left', width: '40%' }}>자산배분 사유(전월분) 및 향후 전망</th>
              </tr>
            </thead>
            <tbody>
              {NAV_DATA.map((row, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ ...tdStyle, color: row.asset ? '#EDC948' : '#666', fontWeight: row.asset ? '600' : '400' }}>{row.asset}</td>
                  <td style={tdStyle}>{row.region}</td>
                  <td style={{ ...tdStyle, color: '#888' }}>{formatPct(row.y1_2412)}</td>
                  <td style={{ ...tdStyle, color: '#888' }}>{formatPct(row.m6_2506)}</td>
                  <td style={{ ...tdStyle, color: '#aaa' }}>{formatPct(row.prev_2511)}</td>
                  <td style={{ ...tdStyle, color: '#76B7B2', fontWeight: '600' }}>{formatPct(row.curr_2512)}</td>
                  <td style={{ ...tdStyle, textAlign: 'left', color: '#999', fontSize: '11px', lineHeight: '1.5' }}>{row.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ==========================================
// 시트2: 투자 비중 및 전망
// ==========================================
function Sheet2_InvestmentWeight() {
  return (
    <Card title="Dream Big 70 - 투자 비중 및 전망" color="#F28E2B" subtitle="기준일: 2025.12.31">
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', minWidth: '1100px' }}>
          <thead>
            <tr style={{ background: 'rgba(242,142,43,0.3)' }}>
              <th style={thStyle} rowSpan={2}>구분</th>
              <th style={thStyle} rowSpan={2}>자산</th>
              <th style={thStyle} rowSpan={2}>지역</th>
              <th style={thStyle}>BM</th>
              <th style={thStyle}>실제</th>
              <th style={thStyle}>초과비중</th>
              <th style={thStyle}>목표</th>
              <th style={thStyle} rowSpan={2}>목표비중</th>
              <th style={{ ...thStyle, textAlign: 'left' }} rowSpan={2}>Comment</th>
            </tr>
            <tr style={{ background: 'rgba(242,142,43,0.2)' }}>
              <th style={{ ...thStyle, fontSize: '10px' }}>투자비중</th>
              <th style={{ ...thStyle, fontSize: '10px' }}>투자비중</th>
              <th style={{ ...thStyle, fontSize: '10px' }}>(+/-)</th>
              <th style={{ ...thStyle, fontSize: '10px' }}>초과비중</th>
            </tr>
          </thead>
          <tbody>
            {INVESTMENT_DATA.map((row, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ ...tdStyle, color: row.category ? '#EDC948' : '#666', fontWeight: row.category ? '600' : '400' }}>{row.category}</td>
                <td style={{ ...tdStyle, color: row.asset ? '#76B7B2' : '#666' }}>{row.asset}</td>
                <td style={{ ...tdStyle, fontWeight: '500' }}>{row.region}</td>
                <td style={{ ...tdStyle, color: '#4E79A7' }}>{formatPct(row.bm, 3)}</td>
                <td style={{ ...tdStyle, color: '#59A14F', fontWeight: '600' }}>{formatPct(row.actual, 4)}</td>
                <td style={{ ...tdStyle, color: row.excess >= 0 ? '#59A14F' : '#E15759', fontWeight: '600' }}>{formatPctSigned(row.excess, 4)}</td>
                <td style={{ ...tdStyle, color: '#EDC948' }}>{formatPctSigned(row.targetExcess, 2)}</td>
                <td style={{ ...tdStyle, color: '#F28E2B' }}>{formatPct(row.targetWeight, 3)}</td>
                <td style={{ ...tdStyle, textAlign: 'left', color: '#999', fontSize: '10px', lineHeight: '1.4', maxWidth: '300px', whiteSpace: 'pre-wrap' }}>{row.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ==========================================
// 시트3: 종합 (보유종목)
// ==========================================
function Sheet3_Holdings() {
  // 카테고리별 집계
  const categorySum = HOLDINGS_DATA.reduce((acc, h) => {
    acc[h.category] = (acc[h.category] || 0) + h.weight;
    return acc;
  }, {});
  const pieData = Object.entries(categorySum).map(([name, value], i) => ({
    name,
    value: value * 100,
    color: PIE_COLORS[i % PIE_COLORS.length]
  }));

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
      <Card title="보유종목 (2024.04.29 기준)" color="#EDC948">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: 'rgba(237,201,72,0.3)' }}>
              <th style={{ ...thStyle, width: '50px' }}>순위</th>
              <th style={{ ...thStyle, textAlign: 'left' }}>종목명 (ITEM_NM)</th>
              <th style={thStyle}>비중</th>
              <th style={thStyle}>구분</th>
            </tr>
          </thead>
          <tbody>
            {HOLDINGS_DATA.map((row, idx) => (
              <tr key={idx} style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ ...tdStyle, color: '#EDC948', fontWeight: '700' }}>{row.rank}</td>
                <td style={{ ...tdStyle, textAlign: 'left' }}>{row.name}</td>
                <td style={{ ...tdStyle, color: '#76B7B2', fontWeight: '600' }}>{formatPct(row.weight)}</td>
                <td style={tdStyle}>
                  <CategoryBadge category={row.category} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="자산배분 현황" color="#76B7B2">
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
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
      </Card>
    </div>
  );
}

// ==========================================
// 시트4: 피벗
// ==========================================
function Sheet4_Pivot() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <Card title="자산군별 비중 추이 (피벗)" color="#E15759">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'rgba(225,87,89,0.3)' }}>
                <th style={thStyle}>구분</th>
                <th style={thStyle}>2023.04.29</th>
                <th style={thStyle}>2023.10.29</th>
                <th style={thStyle}>2024.03.29</th>
                <th style={thStyle}>2024.04.29</th>
                <th style={thStyle}>현재비중</th>
                <th style={thStyle}>목표비중</th>
              </tr>
            </thead>
            <tbody>
              {PIVOT_DATA.map((row, idx) => (
                <tr key={idx} style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ ...tdStyle, color: '#EDC948', fontWeight: '600' }}>{row.category}</td>
                  <td style={{ ...tdStyle, color: '#888' }}>{formatPct(row.p1_230429)}</td>
                  <td style={{ ...tdStyle, color: '#888' }}>{formatPct(row.p2_231029)}</td>
                  <td style={{ ...tdStyle, color: '#888' }}>{formatPct(row.p3_240329)}</td>
                  <td style={{ ...tdStyle, color: '#aaa' }}>{formatPct(row.p4_240429)}</td>
                  <td style={{ ...tdStyle, color: '#76B7B2', fontWeight: '600' }}>{row.curr !== null ? formatPct(row.curr) : '-'}</td>
                  <td style={{ ...tdStyle, color: '#59A14F', fontWeight: '600' }}>{row.target !== null ? formatPct(row.target) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="자산군별 비중 비교" color="#76B7B2">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={PIVOT_DATA.filter(d => d.curr !== null)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fill: '#aaa', fontSize: 11 }} domain={[0, 0.5]} />
            <YAxis type="category" dataKey="category" tick={{ fill: '#aaa', fontSize: 11 }} width={80} />
            <Tooltip
              contentStyle={{ background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }}
              formatter={(value) => [`${(value * 100).toFixed(2)}%`]}
            />
            <Legend />
            <Bar dataKey="curr" name="현재비중" fill="#76B7B2" radius={[0, 4, 4, 0]} />
            <Bar dataKey="target" name="목표비중" fill="#59A14F" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

// ==========================================
// 공통 컴포넌트
// ==========================================
function Card({ title, subtitle, color, children }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid rgba(255,255,255,0.08)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ color: color, margin: 0, fontSize: '17px' }}>{title}</h3>
        {subtitle && <span style={{ color: '#888', fontSize: '12px' }}>{subtitle}</span>}
      </div>
      {children}
    </div>
  );
}

function CategoryBadge({ category }) {
  const colors = {
    '북미': { bg: 'rgba(78,121,167,0.3)', text: '#4E79A7' },
    '유럽': { bg: 'rgba(89,161,79,0.3)', text: '#59A14F' },
    '일본': { bg: 'rgba(237,201,72,0.3)', text: '#EDC948' },
    '이머징': { bg: 'rgba(242,142,43,0.3)', text: '#F28E2B' },
    '선진국국채': { bg: 'rgba(118,183,178,0.3)', text: '#76B7B2' },
    '이머징국채': { bg: 'rgba(255,157,167,0.3)', text: '#FF9DA7' },
    '회사채': { bg: 'rgba(186,176,172,0.3)', text: '#BAB0AC' },
    '기타': { bg: 'rgba(150,150,150,0.3)', text: '#999' },
  };
  const c = colors[category] || colors['기타'];
  return (
    <span style={{
      padding: '3px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: '600',
      background: c.bg,
      color: c.text
    }}>{category}</span>
  );
}

// 스타일
const thStyle = { padding: '10px', textAlign: 'center', color: '#fff', fontWeight: '600' };
const tdStyle = { padding: '8px', textAlign: 'center', color: '#fff' };
