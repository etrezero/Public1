import { useState } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const PIE_COLORS = ['#4E79A7', '#59A14F', '#F28E2B', '#E15759', '#EDC948', '#76B7B2', '#FF9DA7', '#BAB0AC'];

const FUND_INFO = { fundName: 'Dream Big 70', fundType: '글로벌자산배분형', manager: '한국투자신탁운용', reportDate: '2025.12.31', author: 'Covenant Seo' };

const SHEET1_PERFORMANCE = { period: '2025-12-31', monthlyReturn: -0.0034, comment: '12월 글로벌 증시는 성장주와 가치주간의 순환매 지속. AI버블론은 마이크론 실적 발표를 계기로 소강상태, 연말 위험선호 재차 확대. 미국 채권 시장은 중단기물과 장기물이 상반된 방향성을 나타냈습니다.' };

const SHEET1_NAV_DATA = [
  { asset: '주식', region: '북미', y1: 0.486, m6: 0.4673, prev: 0.4564, curr: 0.4062, comment: '강세장은 26년에도 연장 예상. 골디락스 환경 지속.' },
  { asset: '', region: '유럽', y1: 0.0826, m6: 0.0927, prev: 0.0946, curr: 0.1001, comment: '' },
  { asset: '', region: '일본', y1: 0.0304, m6: 0.0308, prev: 0.0318, curr: 0.0318, comment: '' },
  { asset: '', region: '이머징', y1: 0.063, m6: 0.0716, prev: 0.0703, curr: 0.0715, comment: '' },
  { asset: '채권', region: '선진국 국채', y1: 0.228, m6: 0.147, prev: 0.248, curr: 0.148, comment: '금리 인하는 risk-on 모드를 지속시키는 핵심 요인' },
  { asset: '', region: 'IG/HY', y1: 0.028, m6: 0.099, prev: 0, curr: 0.101, comment: '' },
  { asset: '대체자산', region: '', y1: 0.0078, m6: 0, prev: 0, curr: 0.0432, comment: '금 가격 박스권 등락 예상' },
  { asset: '유동성', region: '', y1: 0.0741, m6: 0.092, prev: 0.099, curr: 0.098, comment: '-' },
];

const SHEET2_DATA = [
  { category: '위험자산', asset: '주식', region: '미국주식', bm: 0.417, actual: 0.4062, excess: -0.0108, target: 0.407, comment: 'CES 2026으로 AI/IT 긍정적 전망' },
  { category: '', asset: '', region: '유럽주식', bm: 0.087, actual: 0.1001, excess: 0.0127, target: 0.097, comment: '유럽증시 +12% 이익 전망' },
  { category: '', asset: '', region: '일본주식', bm: 0.030, actual: 0.0318, excess: 0.0021, target: 0.032, comment: '방위, AI, 반도체 지출 증가' },
  { category: '', asset: '', region: '이머징주식', bm: 0.066, actual: 0.0715, excess: 0.0056, target: 0.071, comment: '중국 정책 모멘텀 강화' },
  { category: '', asset: 'A.I.', region: '대체투자', bm: 0.050, actual: 0.0432, excess: -0.0068, target: 0.050, comment: '금 가격 숨고르기' },
  { category: '비위험', asset: '채권', region: 'Sovereign', bm: 0.153, actual: 0.1484, excess: -0.0050, target: 0.153, comment: '박스권 탈피 유인 낮음' },
  { category: '', asset: '', region: 'IG', bm: 0.045, actual: 0.1006, excess: 0.0556, target: 0.095, comment: '' },
  { category: '유동성', asset: '유동성', region: '유동성', bm: 0.100, actual: 0.1276, excess: 0.0276, target: 0.093, comment: '-' },
];

// 2025년 분기별 자산배분 데이터 (NAV 기준)
const HOLDINGS_2025 = {
  '2025Q4': {
    label: '2025년 4분기',
    date: '2025.12.31',
    data: [
      { name: '북미 주식', weight: 0.4062, cat: '북미' },
      { name: '유럽 주식', weight: 0.1001, cat: '유럽' },
      { name: '일본 주식', weight: 0.0318, cat: '일본' },
      { name: '이머징 주식', weight: 0.0715, cat: '이머징' },
      { name: '선진국 국채', weight: 0.148, cat: '선진국국채' },
      { name: 'IG/HY 크레딧', weight: 0.101, cat: '회사채' },
      { name: '대체자산(원자재)', weight: 0.0432, cat: '대체자산' },
      { name: '유동성', weight: 0.098, cat: '기타' },
    ]
  },
  '2025Q3': {
    label: '2025년 3분기',
    date: '2025.11.30',
    data: [
      { name: '북미 주식', weight: 0.4564, cat: '북미' },
      { name: '유럽 주식', weight: 0.0946, cat: '유럽' },
      { name: '일본 주식', weight: 0.0318, cat: '일본' },
      { name: '이머징 주식', weight: 0.0703, cat: '이머징' },
      { name: '선진국 국채', weight: 0.248, cat: '선진국국채' },
      { name: 'IG/HY 크레딧', weight: 0.00, cat: '회사채' },
      { name: '대체자산(원자재)', weight: 0.00, cat: '대체자산' },
      { name: '유동성', weight: 0.099, cat: '기타' },
    ]
  },
  '2025Q2': {
    label: '2025년 2분기',
    date: '2025.06.30',
    data: [
      { name: '북미 주식', weight: 0.4673, cat: '북미' },
      { name: '유럽 주식', weight: 0.0927, cat: '유럽' },
      { name: '일본 주식', weight: 0.0308, cat: '일본' },
      { name: '이머징 주식', weight: 0.0716, cat: '이머징' },
      { name: '선진국 국채', weight: 0.147, cat: '선진국국채' },
      { name: 'IG/HY 크레딧', weight: 0.099, cat: '회사채' },
      { name: '대체자산(원자재)', weight: 0.00, cat: '대체자산' },
      { name: '유동성', weight: 0.092, cat: '기타' },
    ]
  },
  '2025Q1': {
    label: '2025년 1분기',
    date: '2025.03.31',
    data: [
      { name: '북미 주식', weight: 0.4770, cat: '북미' },
      { name: '유럽 주식', weight: 0.0877, cat: '유럽' },
      { name: '일본 주식', weight: 0.0306, cat: '일본' },
      { name: '이머징 주식', weight: 0.0673, cat: '이머징' },
      { name: '선진국 국채', weight: 0.188, cat: '선진국국채' },
      { name: 'IG/HY 크레딧', weight: 0.064, cat: '회사채' },
      { name: '대체자산(원자재)', weight: 0.004, cat: '대체자산' },
      { name: '유동성', weight: 0.083, cat: '기타' },
    ]
  },
};

// 라인 그래프용 시계열 데이터
const ALLOCATION_TREND = [
  { period: '25.Q1', 북미: 47.70, 유럽: 8.77, 일본: 3.06, 이머징: 6.73, 선진국국채: 18.80, 회사채: 6.40, 대체자산: 0.40, 유동성: 8.30 },
  { period: '25.Q2', 북미: 46.73, 유럽: 9.27, 일본: 3.08, 이머징: 7.16, 선진국국채: 14.70, 회사채: 9.90, 대체자산: 0.00, 유동성: 9.20 },
  { period: '25.Q3', 북미: 45.64, 유럽: 9.46, 일본: 3.18, 이머징: 7.03, 선진국국채: 24.80, 회사채: 0.00, 대체자산: 0.00, 유동성: 9.90 },
  { period: '25.Q4', 북미: 40.62, 유럽: 10.01, 일본: 3.18, 이머징: 7.15, 선진국국채: 14.80, 회사채: 10.10, 대체자산: 4.32, 유동성: 9.80 },
];

const SHEET4_PIVOT = [
  { category: '북미', p1: 0.52, p2: 0.45, p3: 0.47, p4: 0.45, curr: 0.4488, target: 0.45 },
  { category: '유럽', p1: 0.08, p2: 0.05, p3: 0.09, p4: 0.08, curr: 0.1005, target: 0.08 },
  { category: '일본', p1: 0.02, p2: 0.05, p3: 0.03, p4: 0.03, curr: 0.0359, target: 0.03 },
  { category: '이머징', p1: 0.05, p2: 0.06, p3: 0.06, p4: 0.06, curr: 0.0648, target: 0.06 },
  { category: '이머징국채', p1: 0.06, p2: 0.08, p3: 0.07, p4: 0.06, curr: 0.169, target: 0.17 },
  { category: '회사채', p1: 0.04, p2: 0.06, p3: 0.04, p4: 0.04, curr: 0.046, target: 0.04 },
  { category: '기타', p1: 0.05, p2: 0.12, p3: 0.06, p4: 0.11, curr: 0.035, target: 0.04 },
];

const fmtPct = (v, d = 2) => v != null ? (v * 100).toFixed(d) + '%' : '-';
const fmtPctSigned = (v, d = 2) => { if (v == null) return '-'; const p = (v * 100).toFixed(d); return v >= 0 ? '+' + p + '%' : p + '%'; };
const catColors = { '북미': '#4E79A7', '유럽': '#59A14F', '일본': '#EDC948', '이머징': '#F28E2B', '선진국국채': '#76B7B2', '이머징국채': '#FF9DA7', '회사채': '#BAB0AC', '대체자산': '#E15759', '기타': '#999' };

export default function App() {
  const [tab, setTab] = useState('sheet1');
  const tabs = [
    { key: 'sheet1', label: '📊 월간 분석', color: '#4E79A7' },
    { key: 'sheet2', label: '📈 투자 비중', color: '#59A14F' },
    { key: 'sheet3', label: '📦 종합', color: '#F28E2B' },
    { key: 'sheet4', label: '📋 피벗', color: '#E15759' },
  ];

  return (
    <div className="min-h-screen p-3 text-gray-100" style={{ background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)' }}>
      <div className="text-center mb-4 p-4 rounded-xl" style={{ background: 'rgba(78,121,167,0.15)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="text-2xl">🌍</span>
          <h1 className="text-xl font-bold" style={{ color: '#4E79A7' }}>{FUND_INFO.fundName}</h1>
        </div>
        <p style={{ color: '#76B7B2' }} className="text-sm">{FUND_INFO.fundType} | {FUND_INFO.manager}</p>
        <p className="text-xs text-gray-500">기준일: {FUND_INFO.reportDate}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4 justify-center">
        {tabs.map(({ key, label, color }) => (
          <button key={key} onClick={() => setTab(key)} className="px-3 py-2 rounded-lg text-xs font-semibold"
            style={{ border: tab === key ? `2px solid ${color}` : '1px solid rgba(255,255,255,0.2)', background: tab === key ? color : 'rgba(255,255,255,0.05)' }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'sheet1' && <Sheet1 />}
      {tab === 'sheet2' && <Sheet2 />}
      {tab === 'sheet3' && <Sheet3 />}
      {tab === 'sheet4' && <Sheet4 />}

      <p className="text-center text-xs text-gray-600 mt-4">작성자: {FUND_INFO.author}</p>
    </div>
  );
}

function Card({ title, color, children }) {
  return (
    <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <h3 className="text-sm font-semibold mb-2" style={{ color }}>{title}</h3>
      {children}
    </div>
  );
}

function Badge({ cat }) {
  return <span className="px-1.5 py-0.5 rounded text-xs font-semibold" style={{ background: `${catColors[cat] || '#999'}33`, color: catColors[cat] || '#999' }}>{cat}</span>;
}

function Sheet1() {
  return (
    <div>
      <Card title="1. 성과" color="#4E79A7">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr style={{ background: 'rgba(78,121,167,0.3)' }}><th className="p-2">기간</th><th className="p-2">수익률</th><th className="p-2 text-left">성과 사유</th></tr></thead>
            <tbody><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <td className="p-2 text-center">{SHEET1_PERFORMANCE.period}</td>
              <td className="p-2 text-center font-bold" style={{ color: '#E15759' }}>{fmtPct(SHEET1_PERFORMANCE.monthlyReturn)}</td>
              <td className="p-2 text-left text-gray-400" style={{ lineHeight: '1.5' }}>{SHEET1_PERFORMANCE.comment}</td>
            </tr></tbody>
          </table>
        </div>
      </Card>
      <Card title="2. NAV 내 자산비중" color="#59A14F">
        <div className="overflow-x-auto">
          <table className="w-full text-xs" style={{ minWidth: '600px' }}>
            <thead><tr style={{ background: 'rgba(89,161,79,0.3)' }}><th className="p-2">자산</th><th className="p-2">지역</th><th className="p-2">1년전</th><th className="p-2">6개월</th><th className="p-2">전월말</th><th className="p-2">월말</th><th className="p-2 text-left">전망</th></tr></thead>
            <tbody>
              {SHEET1_NAV_DATA.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="p-2 text-center" style={{ color: row.asset ? '#EDC948' : '#555', fontWeight: row.asset ? '600' : '400' }}>{row.asset}</td>
                  <td className="p-2 text-center">{row.region}</td>
                  <td className="p-2 text-center text-gray-500">{fmtPct(row.y1)}</td>
                  <td className="p-2 text-center text-gray-500">{fmtPct(row.m6)}</td>
                  <td className="p-2 text-center text-gray-400">{fmtPct(row.prev)}</td>
                  <td className="p-2 text-center font-semibold" style={{ color: '#76B7B2' }}>{fmtPct(row.curr)}</td>
                  <td className="p-2 text-left text-gray-500" style={{ fontSize: '10px' }}>{row.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Sheet2() {
  return (
    <Card title="Dream Big 70 - 투자 비중 및 전망" color="#59A14F">
      <div className="overflow-x-auto">
        <table className="w-full text-xs" style={{ minWidth: '700px' }}>
          <thead><tr style={{ background: 'rgba(89,161,79,0.3)' }}><th className="p-2">구분</th><th className="p-2">자산</th><th className="p-2">지역</th><th className="p-2">BM</th><th className="p-2">실제</th><th className="p-2">초과</th><th className="p-2">목표</th><th className="p-2 text-left">Comment</th></tr></thead>
          <tbody>
            {SHEET2_DATA.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td className="p-2 text-center" style={{ color: row.category ? '#EDC948' : '#555', fontWeight: row.category ? '600' : '400' }}>{row.category}</td>
                <td className="p-2 text-center" style={{ color: row.asset ? '#76B7B2' : '#555' }}>{row.asset}</td>
                <td className="p-2 text-center">{row.region}</td>
                <td className="p-2 text-center" style={{ color: '#4E79A7' }}>{fmtPct(row.bm)}</td>
                <td className="p-2 text-center font-semibold" style={{ color: '#59A14F' }}>{fmtPct(row.actual)}</td>
                <td className="p-2 text-center font-semibold" style={{ color: row.excess >= 0 ? '#59A14F' : '#E15759' }}>{fmtPctSigned(row.excess)}</td>
                <td className="p-2 text-center" style={{ color: '#F28E2B' }}>{fmtPct(row.target)}</td>
                <td className="p-2 text-left text-gray-500" style={{ fontSize: '10px', maxWidth: '150px' }}>{row.comment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function Sheet3() {
  const [period, setPeriod] = useState('2025Q4');
  const periods = Object.keys(HOLDINGS_2025);
  const selected = HOLDINGS_2025[period];
  const holdings = selected.data;

  const lineColors = { 북미: '#4E79A7', 유럽: '#59A14F', 일본: '#EDC948', 이머징: '#F28E2B', 선진국국채: '#76B7B2', 회사채: '#BAB0AC', 대체자산: '#E15759', 유동성: '#999' };

  return (
    <div>
      <Card title="종합 - 2025년 분기별 자산배분" color="#F28E2B">
        <p className="text-xs text-gray-500 mb-3">※ 2025년 분기별 NAV 내 자산비중 현황 (최신순)</p>
        <div className="flex flex-wrap gap-2">
          {periods.map(p => (
            <button key={p} onClick={() => setPeriod(p)} className="px-3 py-1.5 rounded text-xs font-medium"
              style={{ border: period === p ? '2px solid #F28E2B' : '1px solid rgba(255,255,255,0.2)', background: period === p ? 'rgba(242,142,43,0.3)' : 'rgba(255,255,255,0.05)' }}>
              {HOLDINGS_2025[p].label}
            </button>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <Card title={`자산배분 (${selected.label} | ${selected.date})`} color="#EDC948">
          <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
            <table className="w-full text-xs">
              <thead style={{ position: 'sticky', top: 0 }}><tr style={{ background: 'rgba(237,201,72,0.3)' }}><th className="p-2">#</th><th className="p-2 text-left">자산군</th><th className="p-2">비중</th><th className="p-2">구분</th></tr></thead>
              <tbody>
                {holdings.map((h, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td className="p-2 text-center" style={{ color: '#EDC948' }}>{i + 1}</td>
                    <td className="p-2 text-left" style={{ fontSize: '11px' }}>{h.name}</td>
                    <td className="p-2 text-center font-semibold" style={{ color: '#76B7B2' }}>{fmtPct(h.weight)}</td>
                    <td className="p-2 text-center"><Badge cat={h.cat} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="자산배분 추이 (2025년)" color="#76B7B2">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={ALLOCATION_TREND} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="period" tick={{ fill: '#aaa', fontSize: 10 }} />
              <YAxis tick={{ fill: '#aaa', fontSize: 9 }} tickFormatter={(v) => `${v}%`} domain={[0, 50]} />
              <Tooltip contentStyle={{ background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff', fontSize: '11px' }} formatter={(value) => [`${value.toFixed(2)}%`]} />
              <Legend wrapperStyle={{ fontSize: '10px' }} />
              <Line type="monotone" dataKey="북미" stroke={lineColors.북미} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="유럽" stroke={lineColors.유럽} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="일본" stroke={lineColors.일본} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="이머징" stroke={lineColors.이머징} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="선진국국채" stroke={lineColors.선진국국채} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="회사채" stroke={lineColors.회사채} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function Sheet4() {
  return (
    <div>
      <Card title="피벗 - 자산군별 비중 추이" color="#E15759">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr style={{ background: 'rgba(225,87,89,0.3)' }}><th className="p-2">구분</th><th className="p-2">23.Q2</th><th className="p-2">23.Q4</th><th className="p-2">24.Q1</th><th className="p-2">24.Q2</th><th className="p-2">현재</th><th className="p-2">목표</th></tr></thead>
            <tbody>
              {SHEET4_PIVOT.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td className="p-2 text-center font-semibold" style={{ color: '#EDC948' }}>{row.category}</td>
                  <td className="p-2 text-center text-gray-500">{fmtPct(row.p1)}</td>
                  <td className="p-2 text-center text-gray-500">{fmtPct(row.p2)}</td>
                  <td className="p-2 text-center text-gray-500">{fmtPct(row.p3)}</td>
                  <td className="p-2 text-center text-gray-400">{fmtPct(row.p4)}</td>
                  <td className="p-2 text-center font-semibold" style={{ color: '#76B7B2' }}>{row.curr != null ? fmtPct(row.curr) : '-'}</td>
                  <td className="p-2 text-center font-semibold" style={{ color: '#59A14F' }}>{row.target != null ? fmtPct(row.target) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card title="현재 vs 목표 비중 비교" color="#76B7B2">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={SHEET4_PIVOT.filter(d => d.curr != null)} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" tickFormatter={(v) => fmtPct(v, 0)} tick={{ fill: '#aaa', fontSize: 9 }} domain={[0, 0.5]} />
            <YAxis type="category" dataKey="category" tick={{ fill: '#aaa', fontSize: 9 }} width={50} />
            <Tooltip contentStyle={{ background: 'rgba(26,26,46,0.95)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', color: '#fff' }} formatter={(value) => [fmtPct(value)]} />
            <Legend />
            <Bar dataKey="curr" name="현재" fill="#76B7B2" radius={[0, 4, 4, 0]} />
            <Bar dataKey="target" name="목표" fill="#59A14F" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}