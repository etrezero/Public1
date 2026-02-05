/**
 * @title S자산배분 운용보고회의 (Final Integrated + Global FMS + FX + IB Outlook)
 * @description Python 분석 모델, Global FMS(2026.01), KB증권 FX 전략, IB Market Outlook을 통합한 종합 운용보고 자료
 */

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, Legend, ReferenceLine, ComposedChart, Area } from 'recharts';
import { FileText, TrendingUp, AlertTriangle, Shield, CheckCircle, Activity, Grid, Globe, BarChart2, DollarSign } from 'lucide-react';

// API 기본 URL 설정
const API_BASE_URL = `${window.location.protocol}//${window.location.hostname}:8000/api/v1`;

// --- 1. 폴백 데이터 정의 (API 실패 시 사용) ---

// Tableau 팔레트
const COLORS = {
  primary: '#4E79A7',
  secondary: '#F28E2B',
  success: '#59A14F',
  danger: '#E15759',
  warning: '#EDC948',
  info: '#76B7B2',
  gray: '#BAB0AC',
  dark: '#499894',
  text: '#E8E8E8',
};

// 폴백: 자산 데이터 및 분류
const FALLBACK_PORTFOLIO_DATA = [
  { ticker: 'SPY', name: 'SPDR S&P 500', type: 'US Eq', bm: 2.7, mp1: 19.8, ap: 22.5, color: COLORS.primary },
  { ticker: 'ACWI', name: 'iShares ACWI', type: 'Global Eq', bm: 0.0, mp1: 12.2, ap: 12.2, color: COLORS.info },
  { ticker: '069500.KS', name: 'KODEX 200', type: 'Domestic Eq', bm: 2.9, mp1: 0.0, ap: 2.9, color: COLORS.secondary },
  { ticker: 'XLI', name: 'Indus. Select', type: 'US Sector', bm: 2.2, mp1: 0.0, ap: 2.2, color: COLORS.warning },
  { ticker: 'MCHI', name: 'iShares China', type: 'EM Eq', bm: 2.0, mp1: 0.0, ap: 2.0, color: COLORS.danger },
  { ticker: 'ASHR', name: 'CSI 300', type: 'China Eq', bm: 2.0, mp1: 0.0, ap: 2.0, color: '#B07AA1' },
  { ticker: 'IAUM', name: 'Gold Mini', type: 'Commodity', bm: 1.7, mp1: 0.0, ap: 1.7, color: '#FF9DA7' },
  { ticker: 'IEMG', name: 'iShares EM', type: 'EM Eq', bm: 1.5, mp1: 0.0, ap: 1.5, color: '#9C755F' },
  { ticker: 'IGV', name: 'Tech-Software', type: 'US Sector', bm: 1.0, mp1: 0.0, ap: 1.0, color: '#76B7B2' },
  { ticker: 'VUG', name: 'Vanguard Growth', type: 'US Growth', bm: 14.7, mp1: -14.7, ap: 0.0, color: COLORS.gray },
  { ticker: 'URTH', name: 'iShares World', type: 'Global Eq', bm: 13.2, mp1: -13.2, ap: 0.0, color: COLORS.gray },
  { ticker: 'QQQ', name: 'Invesco QQQ', type: 'US Tech', bm: 5.1, mp1: -5.1, ap: 0.0, color: COLORS.gray },
];

const FALLBACK_PIE_DATA = [
  { name: 'US Core (SPY)', value: 22.5, color: COLORS.primary },
  { name: 'Global (ACWI)', value: 12.2, color: COLORS.info },
  { name: 'Domestic', value: 2.9, color: COLORS.secondary },
  { name: 'China/EM', value: 5.5, color: COLORS.danger },
  { name: 'Sector/Comm.', value: 4.9, color: COLORS.warning },
  { name: 'Bond/Cash', value: 52.0, color: COLORS.success },
];

const FALLBACK_CORRELATION_MATRIX = [
  { name: '069500', '069500': 1.0, SPY: 0.12, ACWI: 0.15, MCHI: 0.45, IAUM: 0.05 },
  { name: 'SPY',    '069500': 0.12, SPY: 1.0,  ACWI: 0.95, MCHI: 0.35, IAUM: -0.1 },
  { name: 'ACWI',   '069500': 0.15, SPY: 0.95, ACWI: 1.0,  MCHI: 0.60, IAUM: -0.05 },
  { name: 'MCHI',   '069500': 0.45, SPY: 0.35, ACWI: 0.60, MCHI: 1.0,  IAUM: 0.15 },
  { name: 'IAUM',   '069500': 0.05, SPY: -0.1, ACWI: -0.05, MCHI: 0.15, IAUM: 1.0 },
];

const FALLBACK_MONTHLY_RETURNS = [
  { month: '25.01', fund: 2.1, bm: 1.8 }, { month: '25.02', fund: 3.5, bm: 2.9 },
  { month: '25.03', fund: 1.2, bm: 1.0 }, { month: '25.04', fund: -0.8, bm: -1.2 },
  { month: '25.05', fund: 2.3, bm: 1.9 }, { month: '25.06', fund: 1.8, bm: 1.5 },
  { month: '25.07', fund: 0.9, bm: 0.7 }, { month: '25.08', fund: -1.5, bm: -2.1 },
  { month: '25.09', fund: 2.8, bm: 2.2 }, { month: '25.10', fund: 1.6, bm: 1.3 },
  { month: '25.11', fund: 0.5, bm: 0.3 }, { month: '25.12', fund: 0.76, bm: 0.5 },
];

const FALLBACK_EDGE_POINTS = [
  { id: 1, title: 'AI 인프라 슈퍼사이클 (US Tech)', summary: 'SPY & Tech 섹터 비중 확대 (+19.8% Active)', detail: 'AI 서버 수요 견조, 빅테크 실적 모멘텀 지속에 따른 전략적 비중 확대', icon: '🤖' },
  { id: 2, title: '글로벌 자산배분 다변화', summary: 'ACWI 편입 (+12.2%) 통한 리스크 분산', detail: '특정 국가(미국) 쏠림 현상 완화 및 글로벌 성장 기회 포착', icon: '🌏' },
  { id: 3, title: '스타일 로테이션 (Growth → Core)', summary: 'VUG/QQQ 전량 매도 → SPY/ACWI 교체', detail: '고밸류에이션 성장주 차익 실현 후, 이익 가시성이 높은 코어 자산으로 이동', icon: '🔄' },
  { id: 4, title: '지정학 리스크 헤지', summary: '금(Gold) 및 방산/에너지 등 실물 자산 편입', detail: 'IAUM(금) 및 관련 섹터 ETF 보유로 포트폴리오 하방 경직성 확보', icon: '🛡️' },
];

// 폴백: Global FMS Data
const FALLBACK_FMS_ECONOMIC_SCENARIO = [
  { name: 'No Landing', value: 49, color: COLORS.success },
  { name: 'Soft Landing', value: 44, color: COLORS.info },
  { name: 'Hard Landing', value: 5, color: COLORS.danger },
];

const FALLBACK_FMS_CROWDED_TRADES = [
  { name: 'Long Gold', value: 51, color: COLORS.warning },
  { name: 'Long Mag 7', value: 27, color: COLORS.primary },
  { name: 'Short US Dollar', value: 7, color: COLORS.gray },
];

const FALLBACK_FMS_TAIL_RISKS = [
  { name: '지정학적 갈등', value: 28 },
  { name: 'AI 버블', value: 27 },
  { name: '채권금리 급등', value: 19 },
  { name: '인플레이션', value: 12 },
  { name: '사모크레딧', value: 7 },
];

const FALLBACK_FMS_SECTOR_POSITION = [
  { sector: 'Banks', value: 34, type: 'OW', color: COLORS.primary },
  { sector: 'Pharma', value: 32, type: 'OW', color: COLORS.primary },
  { sector: 'Tech', value: 19, type: 'OW', color: COLORS.primary },
  { sector: 'Industrials', value: 17, type: 'OW', color: COLORS.primary },
  { sector: 'Utilities', value: -10, type: 'UW', color: COLORS.danger },
  { sector: 'Energy', value: -29, type: 'UW', color: COLORS.danger },
  { sector: 'Staples', value: -30, type: 'UW', color: COLORS.danger },
];

// 폴백: FX Strategy Data
const FALLBACK_FX_INTERVENTION_DATA = [
  { date: '22.09', amount: 2.8, label: '2.8조엔' },
  { date: '22.10', amount: 6.3, label: '6.3조엔' },
  { date: '24.04', amount: 5.9, label: '5.9조엔' },
  { date: '24.05', amount: 3.9, label: '3.9조엔' },
  { date: '24.07', amount: 5.5, label: '5.5조엔' },
];

const FALLBACK_FX_MARKET_SUMMARY = [
  { title: '달러화 (DXY)', value: '97.1pt (-1.8%)', desc: '연초 미국 지정학/관세 리스크로 9월래 최저', status: 'down' },
  { title: '엔화 (JPY)', value: '154엔대 (강세)', desc: '일본 정부 개입(Rate Check) 및 BoJ 금리 인상 기대', status: 'up' },
  { title: '원화 (KRW)', value: '1,440원 (강세)', desc: '달러 약세 및 엔화 강세에 연동', status: 'up' },
];

const FALLBACK_FX_KEY_ISSUES = [
  { title: '일본 외환시장 개입 경계감', content: '155엔 부근에서 미 재무부/BoJ 공조 및 Rate Check 징후 포착. 과거 2022/2024년 대규모 개입 사례(5~6조엔) 감안 시 추가 강세 가능성.' },
  { title: '일본 정치/재정 리스크', content: '다카이치 총리 식료품 소비세 인하 공약(8%→0%)으로 세수 5조엔 감소 우려. 재정적자 확대(-7.1%→-8%) 및 국채 금리 상승 압력.' },
  { title: '미국발 달러 약세 압력', content: '트럼프의 관세 위협(캐나다/중국) 및 지정학적 리스크로 "셀 아메리카" 심리 확산. 달러 인덱스 하락세 지속.' },
];

export default function SAssetAllocationReport() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // API 데이터 상태 관리
  const [portfolioData, setPortfolioData] = useState(null);
  const [marketOutlook, setMarketOutlook] = useState(null);
  const [fmsData, setFmsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dataSource, setDataSource] = useState('loading');

  // 체크리스트 상태 (사용자 인터랙션)
  const [checklist, setChecklist] = useState({
    macro: [
      { id: 'm1', item: '미국 관세 정책 재점화 가능성', checked: false },
      { id: 'm2', item: '연준 금리 인하 속도 조절', checked: true },
    ],
    geopolitical: [
      { id: 'g1', item: '미중 AI/반도체 기술 패권 경쟁', checked: true },
      { id: 'g2', item: '중동 분쟁 확산 (에너지 가격)', checked: false },
    ],
    market: [
      { id: 'k1', item: 'AI 버블 우려 (M7 시총 집중도)', checked: true },
      { id: 'k2', item: '원/달러 환율 변동성 확대', checked: true },
    ]
  });

  // API 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // 3개의 API 엔드포인트 병렬 호출
        const [portfolioRes, outlookRes, fmsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/fund-s-asset/portfolio`),
          fetch(`${API_BASE_URL}/fund-s-asset/market-outlook`),
          fetch(`${API_BASE_URL}/fund-s-asset/fms-data`)
        ]);

        if (portfolioRes.ok && outlookRes.ok && fmsRes.ok) {
          const [portfolio, outlook, fms] = await Promise.all([
            portfolioRes.json(),
            outlookRes.json(),
            fmsRes.json()
          ]);

          setPortfolioData(portfolio);
          setMarketOutlook(outlook);
          setFmsData(fms);
          setDataSource('api');
          console.log('✅ API 데이터 로드 성공');
        } else {
          throw new Error('API 응답 오류');
        }
      } catch (error) {
        console.warn('⚠️ API 연결 실패, 폴백 데이터 사용:', error);
        setDataSource('fallback');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // 데이터 준비: API 우선, 없으면 폴백
  // API 응답 데이터를 폴백 데이터 구조로 정규화 (weight→ap, active→mp1)
  const normalizedHoldings = portfolioData?.holdings ? 
    portfolioData.holdings.map(h => ({
      ticker: h.ticker,
      name: h.name,
      type: h.type,
      bm: h.bm,
      mp1: h.active,    // API의 active를 mp1로 매핑
      ap: h.weight,     // API의 weight를 ap로 매핑
      color: h.color || COLORS.primary
    })) : 
    FALLBACK_PORTFOLIO_DATA;
  
  const PORTFOLIO_DATA = normalizedHoldings;
  const pieData = portfolioData?.allocation || FALLBACK_PIE_DATA;
  const monthlyReturns = portfolioData?.monthlyReturns || FALLBACK_MONTHLY_RETURNS;
  const riskContribData = portfolioData?.riskContribution || PORTFOLIO_DATA.filter(d => d.ap > 0).map(d => ({
    name: d.ticker,
    weight: d.ap,
    mctr: (Math.random() * 0.5 + 0.1).toFixed(2), 
    total_risk: (d.ap * (Math.random() * 0.5 + 0.1)).toFixed(2)
  })).sort((a, b) => b.total_risk - a.total_risk);
  const correlationMatrix = FALLBACK_CORRELATION_MATRIX;
  
  const edgePoints = marketOutlook?.edgePoints || FALLBACK_EDGE_POINTS;
  const assetViews = marketOutlook?.assetViews || [];
  
  const fmsEconomicScenario = fmsData?.economicScenario || FALLBACK_FMS_ECONOMIC_SCENARIO;
  const fmsCrowdedTrades = fmsData?.crowdedTrades || FALLBACK_FMS_CROWDED_TRADES;
  const fmsTailRisks = fmsData?.tailRisks || FALLBACK_FMS_TAIL_RISKS;
  const fmsSectorPosition = fmsData?.sectorPositions || FALLBACK_FMS_SECTOR_POSITION;
  const fxInterventionData = fmsData?.fxIntervention || FALLBACK_FX_INTERVENTION_DATA;
  const fxMarketSummary = fmsData?.fxMarketSummary || FALLBACK_FX_MARKET_SUMMARY;
  const fxKeyIssues = fmsData?.fxKeyIssues || FALLBACK_FX_KEY_ISSUES;
  const fmsMetrics = fmsData?.metrics || { cashLevel: 3.2, sentiment: 8.1 };
  
  // IB Market Outlook 데이터
  const IB_SP500_TARGETS = [
    { ib: 'Oppenheimer', target: 8100, eps: 305, upside: 18.6, stance: 'Bullish', color: '#2E5090', footnote: 1 },
    { ib: 'Evercore ISI', target: 7800, eps: 320, upside: 14.2, stance: 'Bullish', color: '#4E79A7', footnote: 2 },
    { ib: 'Yardeni Res.', target: 7800, eps: 310, upside: 14.2, stance: 'Bullish', color: '#59A14F', footnote: 3 },
    { ib: 'Goldman Sachs', target: 7600, eps: 315, upside: 11.3, stance: 'Positive', color: '#F28E2B', footnote: 4 },
    { ib: 'Morgan Stanley', target: 7400, eps: 305, upside: 8.3, stance: 'Neutral', color: '#E15759', footnote: 5 },
    { ib: 'JPMorgan', target: 7400, eps: 310, upside: 8.3, stance: 'Neutral', color: '#76B7B2', footnote: 6 },
    { ib: 'UBS', target: 7200, eps: 300, upside: 5.4, stance: 'Cautious', color: '#EDC948', footnote: 7 },
    { ib: 'Wells Fargo', target: 7100, eps: 295, upside: 4.0, stance: 'Cautious', color: '#AF7AA1', footnote: 8 },
    { ib: 'Deutsche Bank', target: 7000, eps: 290, upside: 2.5, stance: 'Neutral', color: '#9C755F', footnote: 9 },
    { ib: 'Citi', target: 6900, eps: 285, upside: 1.0, stance: 'Bearish', color: '#BAB0AC', footnote: 10 },
  ];

  const IB_GDP_FORECASTS = [
    { region: 'US', gs: 2.5, ms: 2.3, jpm: 2.4, ubs: 2.2, citi: 2.1, db: 2.3 },
    { region: 'Euro', gs: 1.2, ms: 1.0, jpm: 1.1, ubs: 1.0, citi: 0.9, db: 1.2 },
    { region: 'China', gs: 4.5, ms: 4.3, jpm: 4.4, ubs: 4.2, citi: 4.1, db: 4.3 },
    { region: 'Japan', gs: 1.0, ms: 0.8, jpm: 0.9, ubs: 0.7, citi: 0.6, db: 0.8 },
    { region: 'Global', gs: 3.2, ms: 3.0, jpm: 3.1, ubs: 2.9, citi: 2.8, db: 3.0 },
  ];

  const IB_KEY_THEMES = [
    {
      theme: 'AI Capex 슈퍼사이클',
      icon: '🤖',
      summary: '하이퍼스케일러 AI 투자 확대, $3조 데이터센터 투자 중 20% 미만 집행',
      details: [
        'Goldman: AI 관련 투자가 성장 견인',
        'MS: 2026년 AI 인프라 투자 $500B',
        'JPM: 빅테크 Capex YoY +25% 전망',
        'DB: AI 수요로 반도체 슈퍼사이클 재개'
      ],
      bullish: ['GS', 'MS', 'JPM', 'DB'],
    },
    {
      theme: 'Fed 금리 인하 완료',
      icon: '📉',
      summary: '연준 금리 인하 사이클 종료, 2026년 중립금리 3.5% 유지 전망',
      details: [
        'GS: 2026년 금리 동결 가능성 60%',
        'MS: PCE 인플레이션 2.5% 고착화',
        'Citi: 고금리 장기화로 경기 둔화',
        'UBS: 정책금리 3.25~3.5% 밴드 유지'
      ],
      bullish: ['GS', 'MS', 'UBS'],
    },
    {
      theme: '금 강세 지속',
      icon: '🪙',
      summary: '2026년 금 가격 $2,800~3,000 목표, 중앙은행 매수 + 달러 약세 시나리오',
      details: [
        'GS: 금 목표가 $3,000 (YE26)',
        'JPM: 중앙은행 순매수 800톤 전망',
        'UBS: 지정학 리스크 헤지 수요 증가',
        'DB: 실물 자산 선호 트렌드 강화'
      ],
      bullish: ['GS', 'JPM', 'UBS', 'DB'],
    },
    {
      theme: '미국 예외주의',
      icon: '🇺🇸',
      summary: 'US vs EU/China 성장 격차 확대, 달러 자산 프리미엄 지속',
      details: [
        'MS: 미국 GDP 성장률 2.3% (EU 1.0%)',
        'JPM: 미국 기업 이익 +12% vs EU +5%',
        'GS: 빅테크 실적 모멘텀 독주',
        'Evercore: S&P 500 EPS $320 상향'
      ],
      bullish: ['MS', 'JPM', 'GS', 'Evercore'],
    },
    {
      theme: '밸류에이션 부담',
      icon: '⚠️',
      summary: 'S&P 500 PER 23배, 역사적 평균 대비 +15% 프리미엄',
      details: [
        'Citi: 과도한 밸류에이션으로 상승 제한',
        'UBS: Mag 7 시총 집중도 우려 (35%)',
        'Wells Fargo: 실적 증가율 둔화 시 조정',
        'DB: 채권 수익률 매력도 상승'
      ],
      bullish: [],
    },
    {
      theme: '지정학적 리스크',
      icon: '🌍',
      summary: '미중 갈등, 중동 분쟁, 관세 전쟁 재점화 가능성',
      details: [
        'JPM: 트럼프 관세 정책 불확실성',
        'MS: 중국 반도체 제재 강화',
        'GS: 중동 원유 공급 차질 우려',
        'Citi: 글로벌 무역 둔화 리스크'
      ],
      bullish: [],
    },
  ];

  const IB_ASSET_ALLOCATION = [
    { ib: 'Goldman Sachs', equity: 'OW', bonds: 'UW', gold: 'OW', cash: 'N' },
    { ib: 'Morgan Stanley', equity: 'N', bonds: 'UW', gold: 'OW', cash: 'N' },
    { ib: 'JPMorgan', equity: 'OW', bonds: 'N', gold: 'N', cash: 'UW' },
    { ib: 'UBS', equity: 'N', bonds: 'N', gold: 'OW', cash: 'N' },
    { ib: 'Citi', equity: 'UW', bonds: 'OW', gold: 'N', cash: 'OW' },
    { ib: 'Deutsche Bank', equity: 'OW', bonds: 'UW', gold: 'N', cash: 'N' },
  ];

  const IB_KEY_RISKS = [
    { risk: '지정학적 분쟁 확대', probability: '30%', impact: 'High', ibs: ['JPM', 'MS', 'GS'] },
    { risk: 'AI 버블 붕괴', probability: '25%', impact: 'High', ibs: ['Citi', 'UBS', 'WF'] },
    { risk: '인플레이션 재점화', probability: '20%', impact: 'Medium', ibs: ['MS', 'GS'] },
    { risk: '채권금리 급등', probability: '15%', impact: 'Medium', ibs: ['Citi', 'DB'] },
    { risk: '중국 경제 경착륙', probability: '15%', impact: 'High', ibs: ['MS', 'JPM'] },
    { risk: '미국 재정 적자 악화', probability: '10%', impact: 'Low', ibs: ['UBS'] },
  ];

  const FOOTNOTES = [
    { id: 1, source: 'Oppenheimer', title: '2026 Market Outlook', url: 'oppenheimer.com/news-media', date: 'Dec 8, 2025' },
    { id: 2, source: 'Evercore ISI', title: '2026 Year Ahead Outlook', url: 'evercore.com/insights', date: 'Dec 2025' },
    { id: 3, source: 'Yardeni Research', title: '2026 Market Forecast', url: 'CNN Business 인용', date: 'Dec 2025' },
    { id: 4, source: 'Goldman Sachs', title: 'Macro Outlook 2026', url: 'goldmansachs.com/insights', date: 'Dec 22, 2025' },
    { id: 5, source: 'Morgan Stanley', title: 'Investment Outlook 2026', url: 'morganstanley.com/insights', date: 'Dec 2025' },
    { id: 6, source: 'JPMorgan', title: '2026 Market Outlook', url: 'jpmorgan.com/insights/outlook', date: 'Dec 2025' },
    { id: 7, source: 'UBS', title: '2026 Market Outlook', url: 'TheStreet 인용', date: 'Dec 2025' },
    { id: 8, source: 'Wells Fargo', title: '2026 Outlook', url: 'wellsfargo.com/insights', date: 'Dec 2025' },
    { id: 9, source: 'Deutsche Bank', title: 'World Outlook 2026', url: 'flow.db.com, dbresearch.com', date: 'Nov 2025' },
    { id: 10, source: 'Citi', title: '2026 Market Outlook', url: 'TheStreet 인용', date: 'Dec 2025' },
  ];
  
  // 펀드 기본 정보
  const fundCode = portfolioData?.fundCode || '3JM13';
  const totalAssets = portfolioData?.totalAssets || 211.6;
  const inceptionDate = portfolioData?.inceptionDate || '2019.12.20';
  const baseDate = portfolioData?.baseDate || '2025.12.31';

  const toggleCheck = (category, id) => {
    setChecklist(prev => ({
      ...prev,
      [category]: prev[category].map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%)',
      padding: '24px',
      fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif",
      color: '#E8E8E8',
    },
    header: {
      textAlign: 'center', marginBottom: '24px', padding: '24px',
      background: 'rgba(78, 121, 167, 0.15)', borderRadius: '16px',
      border: '1px solid rgba(78, 121, 167, 0.3)', backdropFilter: 'blur(10px)',
    },
    title: { fontSize: '28px', fontWeight: '700', color: '#FFFFFF', margin: '0 0 8px 0' },
    subtitle: { fontSize: '16px', color: '#A0A0A0', margin: 0 },
    fundInfo: { display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '16px', flexWrap: 'wrap' },
    fundInfoItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
    fundInfoLabel: { fontSize: '12px', color: '#888' },
    fundInfoValue: { fontSize: '18px', fontWeight: '600', color: COLORS.primary },
    tabs: { display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap', justifyContent: 'center' },
    tab: {
      padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
      fontSize: '14px', fontWeight: '500', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '6px'
    },
    tabActive: { background: COLORS.primary, color: '#FFF' },
    tabInactive: { background: 'rgba(255,255,255,0.1)', color: '#A0A0A0' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginBottom: '24px' },
    card: {
      background: 'rgba(255, 255, 255, 0.05)', borderRadius: '16px', padding: '20px',
      border: '1px solid rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)',
    },
    cardTitle: { fontSize: '16px', fontWeight: '600', color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
    th: { padding: '10px 8px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.2)', color: '#A0A0A0', fontWeight: '500' },
    td: { padding: '10px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#E0E0E0' },
    edgeCard: {
      background: 'rgba(78, 121, 167, 0.1)', borderRadius: '12px', padding: '16px',
      border: '1px solid rgba(78, 121, 167, 0.2)', marginBottom: '12px',
    },
    edgeIcon: { fontSize: '24px', marginRight: '12px' },
    edgeTitle: { fontSize: '15px', fontWeight: '600', color: '#FFF', marginBottom: '4px' },
    edgeSummary: { fontSize: '13px', color: COLORS.secondary, marginBottom: '4px' },
    edgeDetail: { fontSize: '12px', color: '#A0A0A0' },
    checklistItem: {
      display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0',
      borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
    },
    checkbox: {
      width: '18px', height: '18px', borderRadius: '4px', border: '2px solid',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', flexShrink: 0,
    },
    signalDot: { width: '10px', height: '10px', borderRadius: '50%', display: 'inline-block', marginRight: '6px' },
    fmsMetric: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '16px',
      border: '1px solid rgba(255,255,255,0.05)', height: '100%'
    },
    fxMetric: {
      background: 'rgba(0, 0, 0, 0.2)', borderRadius: '12px', padding: '16px', marginBottom: '12px',
      borderLeft: `4px solid ${COLORS.primary}`
    }
  };

  // --- 탭별 렌더링 함수 ---

  const renderOverview = () => (
    <>
      <div style={styles.grid}>
        {/* 포트폴리오 현황 - 도넛 차트 */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>🥧 포트폴리오 현황 (Asset Allocation)</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} contentStyle={{ backgroundColor: '#1a1a2e', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              {pieData.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color }}></div>
                    <span style={{ fontSize: '13px' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Holdings */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>💼 주요 보유 종목 (Top Holdings)</div>
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Ticker</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Type</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Weight (AP)</th>
                </tr>
              </thead>
              <tbody>
                {PORTFOLIO_DATA.filter(d => d.ap > 0).sort((a,b) => b.ap - a.ap).map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ ...styles.td, color: COLORS.info, fontWeight: '500' }}>{item.ticker}</td>
                    <td style={styles.td}>{item.name}</td>
                    <td style={{ ...styles.td, fontSize: '11px', color: '#888' }}>{item.type}</td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600', color: COLORS.primary }}>
                      {item.ap.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 수익률 & Active Weight */}
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>📈 수익률 추이 (Fund vs BM)</div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyReturns} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fill: '#888', fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${v}%`} tick={{ fill: '#888', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
              <Legend />
              <Line type="monotone" dataKey="fund" name="Fund" stroke={COLORS.primary} strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="bm" name="BM" stroke={COLORS.gray} strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>📊 전략적 포지셔닝 (Active Weight)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart 
              data={PORTFOLIO_DATA.filter(d => Math.abs(d.mp1) > 0.1)} 
              layout="vertical" 
              margin={{ left: 50, right: 20 }}
            >
              <XAxis type="number" domain={['dataMin', 'dataMax']} tick={{ fill: '#888', fontSize: 10 }} />
              <YAxis type="category" dataKey="ticker" tick={{ fill: '#E0E0E0', fontSize: 11, fontWeight: 500 }} width={70} />
              <Tooltip formatter={(val) => `${val > 0 ? '+' : ''}${val}%`} contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
              <ReferenceLine x={0} stroke="rgba(255,255,255,0.3)" />
              <Bar dataKey="mp1">
                {PORTFOLIO_DATA.filter(d => Math.abs(d.mp1) > 0.1).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.mp1 > 0 ? COLORS.success : COLORS.danger} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );

  const renderOutlook = () => (
    <>
      <div style={{ ...styles.card, marginBottom: '20px' }}>
        <div style={styles.cardTitle}>🔥 1Q26 Edge Point: 핵심 투자 아이디어</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '12px' }}>
          {edgePoints.map((point) => (
            <div key={point.id} style={styles.edgeCard}>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <span style={styles.edgeIcon}>{point.icon}</span>
                <div>
                  <div style={styles.edgeTitle}>{point.title}</div>
                  <div style={styles.edgeSummary}>{point.summary}</div>
                  <div style={styles.edgeDetail}>{point.detail}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>🎯 자산군별 전망 (House View)</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Asset Class</th>
                <th style={styles.th}>View</th>
                <th style={styles.th}>Strategy</th>
                <th style={styles.th}>Rationale</th>
              </tr>
            </thead>
            <tbody>
              {assetViews.length > 0 ? (
                assetViews.map((item, idx) => {
                  const viewColor = item.view === 'Positive' ? COLORS.success : 
                                   item.view === 'Neutral' ? COLORS.warning : COLORS.danger;
                  const dotColor = item.strategy.includes('Over') ? COLORS.success :
                                  item.strategy.includes('Under') ? COLORS.danger : COLORS.info;
                  return (
                    <tr key={idx}>
                      <td style={styles.td}>{item.assetClass}</td>
                      <td style={{...styles.td, color: viewColor}}>{item.view}</td>
                      <td style={styles.td}>
                        <span style={{...styles.signalDot, background: dotColor}}></span>
                        {item.strategy}
                      </td>
                      <td style={{...styles.td, color: '#AAA'}}>{item.rationale}</td>
                    </tr>
                  );
                })
              ) : (
                // 폴백 데이터
                <>
                  <tr>
                    <td style={styles.td}>🇺🇸 US Equity</td>
                    <td style={{...styles.td, color: COLORS.success}}>Positive</td>
                    <td style={styles.td}><span style={{...styles.signalDot, background: COLORS.success}}></span>Overweight</td>
                    <td style={{...styles.td, color: '#AAA'}}>AI 인프라 투자 지속, 빅테크 실적 견조</td>
                  </tr>
                  <tr>
                    <td style={styles.td}>🌏 Global Eq</td>
                    <td style={{...styles.td, color: COLORS.warning}}>Neutral</td>
                    <td style={styles.td}><span style={{...styles.signalDot, background: COLORS.info}}></span>Market Weight</td>
                    <td style={{...styles.td, color: '#AAA'}}>국가별 차별화 심화, ACWI 통한 분산</td>
                  </tr>
                  <tr>
                    <td style={styles.td}>🇨🇳 China/EM</td>
                    <td style={{...styles.td, color: COLORS.danger}}>Negative</td>
                    <td style={styles.td}><span style={{...styles.signalDot, background: COLORS.danger}}></span>Underweight</td>
                    <td style={{...styles.td, color: '#AAA'}}>구조적 성장 둔화, 부양책 효과 미비</td>
                  </tr>
                  <tr>
                    <td style={styles.td}>🧈 Commodity</td>
                    <td style={{...styles.td, color: COLORS.success}}>Positive</td>
                    <td style={styles.td}><span style={{...styles.signalDot, background: COLORS.success}}></span>Overweight</td>
                    <td style={{...styles.td, color: '#AAA'}}>지정학적 리스크 헤지, 금리 인하 수혜</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderRisk = () => (
    <div style={styles.grid}>
      <div style={styles.card}>
        <div style={styles.cardTitle}>🔢 정량적 리스크 분석 (Quantitative Risk)</div>
        
        <div style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: COLORS.info, marginBottom: '12px' }}>
            <Grid size={14} style={{ display: 'inline', marginRight: '6px' }}/> 
            상관관계 매트릭스 (Correlation Matrix)
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ ...styles.table, textAlign: 'center' }}>
              <thead>
                <tr>
                  <th style={styles.th}></th>
                  {correlationMatrix.map(c => <th key={c.name} style={styles.th}>{c.name}</th>)}
                </tr>
              </thead>
              <tbody>
                {correlationMatrix.map((row, i) => (
                  <tr key={i}>
                    <td style={{ ...styles.td, fontWeight: 'bold' }}>{row.name}</td>
                    {correlationMatrix.map((col, j) => {
                      const val = row[col.name];
                      const bg = val === 1 ? 'rgba(78, 121, 167, 0.2)' : val > 0.5 ? 'rgba(225, 87, 89, 0.1)' : 'transparent';
                      return (
                        <td key={j} style={{ ...styles.td, background: bg }}>{val}</td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: COLORS.danger, marginBottom: '12px' }}>
            <Shield size={14} style={{ display: 'inline', marginRight: '6px' }}/> 
            리스크 기여도 상위 (High Risk Contribution)
          </div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Ticker</th>
                <th style={{...styles.th, textAlign:'right'}}>Weight</th>
                <th style={{...styles.th, textAlign:'right'}}>MCTR</th>
                <th style={{...styles.th, textAlign:'right'}}>Risk Contrib.</th>
              </tr>
            </thead>
            <tbody>
              {riskContribData.slice(0, 5).map((item, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{item.name}</td>
                  <td style={{...styles.td, textAlign:'right'}}>{item.weight.toFixed(1)}%</td>
                  <td style={{...styles.td, textAlign:'right'}}>{item.mctr}</td>
                  <td style={{...styles.td, textAlign:'right', color: COLORS.danger, fontWeight: 'bold'}}>{item.total_risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>📋 정성적 리스크 점검 (Qualitative Checklist)</div>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: COLORS.warning, marginBottom: '10px' }}>매크로 리스크</div>
          {checklist.macro.map((item) => (
            <div key={item.id} style={styles.checklistItem} onClick={() => toggleCheck('macro', item.id)}>
              <div style={{
                ...styles.checkbox,
                borderColor: item.checked ? COLORS.warning : '#555',
                background: item.checked ? COLORS.warning : 'transparent',
                color: item.checked ? '#000' : 'transparent',
              }}>
                {item.checked && '✓'}
              </div>
              <span style={{ fontSize: '13px', color: item.checked ? '#E0E0E0' : '#888' }}>{item.item}</span>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '13px', fontWeight: '600', color: COLORS.danger, marginBottom: '10px' }}>지정학적 리스크</div>
          {checklist.geopolitical.map((item) => (
            <div key={item.id} style={styles.checklistItem} onClick={() => toggleCheck('geopolitical', item.id)}>
              <div style={{
                ...styles.checkbox,
                borderColor: item.checked ? COLORS.danger : '#555',
                background: item.checked ? COLORS.danger : 'transparent',
                color: item.checked ? '#FFF' : 'transparent',
              }}>
                {item.checked && '✓'}
              </div>
              <span style={{ fontSize: '13px', color: item.checked ? '#E0E0E0' : '#888' }}>{item.item}</span>
            </div>
          ))}
        </div>

        <div>
          <div style={{ fontSize: '13px', fontWeight: '600', color: COLORS.primary, marginBottom: '10px' }}>시장 리스크</div>
          {checklist.market.map((item) => (
            <div key={item.id} style={styles.checklistItem} onClick={() => toggleCheck('market', item.id)}>
              <div style={{
                ...styles.checkbox,
                borderColor: item.checked ? COLORS.primary : '#555',
                background: item.checked ? COLORS.primary : 'transparent',
                color: item.checked ? '#FFF' : 'transparent',
              }}>
                {item.checked && '✓'}
              </div>
              <span style={{ fontSize: '13px', color: item.checked ? '#E0E0E0' : '#888' }}>{item.item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderGlobalFMS = () => (
    <>
      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>🌍 경제 전망 (Economic Scenario)</div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <ResponsiveContainer width="50%" height={220}>
              <PieChart>
                <Pie
                  data={fmsEconomicScenario}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {fmsEconomicScenario.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} contentStyle={{ backgroundColor: '#1a1a2e', border: 'none' }} />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: '12px', fontSize: '13px', color: COLORS.success, fontWeight: 'bold' }}>
                "No Landing"이 기본 시나리오 (49%)
              </div>
              {fmsEconomicScenario.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: item.color }}></div>
                    <span style={{ fontSize: '13px' }}>{item.name}</span>
                  </div>
                  <span style={{ fontSize: '13px', fontWeight: '600' }}>{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>📊 핵심 지표 & Tail Risks</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div style={styles.fmsMetric}>
              <div style={{ fontSize: '12px', color: '#888' }}>현금 비중 (Cash Level)</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: COLORS.danger }}>{fmsMetrics.cashLevel}%</div>
              <div style={{ fontSize: '11px', color: '#AAA' }}>사상 최저 (매도 신호)</div>
            </div>
            <div style={styles.fmsMetric}>
              <div style={{ fontSize: '12px', color: '#888' }}>투자 심리 (Sentiment)</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: COLORS.warning }}>{fmsMetrics.sentiment}</div>
              <div style={{ fontSize: '11px', color: '#AAA' }}>'21년 7월 이후 최고 (과열)</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#FFF', marginBottom: '8px' }}>🚨 Biggest Tail Risks</div>
            {fmsTailRisks.slice(0, 3).map((item, idx) => (
              <div key={idx} style={{ marginBottom: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                  <span>{item.name}</span>
                  <span>{item.value}%</span>
                </div>
                <div style={{ width: '100%', background: 'rgba(255,255,255,0.1)', height: '6px', borderRadius: '3px' }}>
                  <div style={{ width: `${item.value}%`, background: COLORS.danger, height: '100%', borderRadius: '3px' }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>🔥 Most Crowded Trades (쏠림 현상)</div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart 
              data={fmsCrowdedTrades} 
              layout="vertical" 
              margin={{ left: 40, right: 20 }}
            >
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" tick={{ fill: '#E0E0E0', fontSize: 11, fontWeight: 500 }} width={80} />
              <Tooltip formatter={(val) => `${val}%`} contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} />
              <Bar dataKey="value" barSize={20}>
                {fmsCrowdedTrades.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#AAA', marginTop: '10px' }}>
            "Long Gold" 포지션이 51%로 압도적 1위 기록 (4개월만 탈환)
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>💼 글로벌 섹터 포지셔닝 (Sector OW/UW)</div>
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Sector</th>
                  <th style={{ ...styles.th, textAlign: 'center' }}>Pos.</th>
                  <th style={{ ...styles.th, textAlign: 'right' }}>Net %</th>
                </tr>
              </thead>
              <tbody>
                {fmsSectorPosition.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ ...styles.td, fontWeight: '500' }}>{item.sector}</td>
                    <td style={{ ...styles.td, textAlign: 'center' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '600',
                        background: item.type === 'OW' ? 'rgba(78, 121, 167, 0.2)' : 'rgba(225, 87, 89, 0.2)',
                        color: item.color
                      }}>{item.type}</span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right', fontWeight: '600', color: item.color }}>
                      {item.value > 0 ? '+' : ''}{item.value}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );

  const renderFX = () => (
    <>
      <div style={styles.grid}>
        {/* FX Market Review (텍스트 요약) */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>💴 FX 시장 동향 (KB증권 '26.01.27)</div>
          <div style={{ marginBottom: '16px' }}>
            {fxMarketSummary.map((item, idx) => (
              <div key={idx} style={styles.fxMetric}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#FFF' }}>{item.title}</span>
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: item.status === 'up' ? COLORS.danger : COLORS.primary }}>
                    {item.value}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#AAA' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 일본 외환시장 개입 규모 (차트) */}
        <div style={styles.card}>
          <div style={styles.cardTitle}>🏦 일본 외환시장 개입 규모 추이</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={fxInterventionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 11 }} />
              <YAxis tickFormatter={(v) => `${v}조`} tick={{ fill: '#888', fontSize: 11 }} />
              <Tooltip 
                formatter={(val) => [`${val}조엔`, '개입 규모']}
                contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid #333' }} 
              />
              <Bar dataKey="amount" fill={COLORS.primary} barSize={30}>
                {fxInterventionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === fxInterventionData.length - 1 ? COLORS.danger : COLORS.primary} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#AAA', marginTop: '8px' }}>
            최근 엔화 약세 방어를 위한 대규모 개입 지속 (최근 5.5조엔)
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        {/* 주요 이슈 분석 */}
        <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
          <div style={styles.cardTitle}>📢 핵심 이슈 분석: 일본 엔화 강세 전환 시도?</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {fxKeyIssues.map((issue, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: COLORS.warning, marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
                  <Activity size={16} style={{ marginRight: '6px' }} />
                  {issue.title}
                </div>
                <div style={{ fontSize: '13px', color: '#CCC', lineHeight: '1.6' }}>
                  {issue.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderIBOutlook = () => (
    <>
      <div style={{ ...styles.card, marginBottom: '20px' }}>
        <div style={styles.cardTitle}>📈 글로벌 IB S&P 500 목표가 (2026년말)</div>
        <div style={{ marginBottom: '16px' }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={IB_SP500_TARGETS} layout="vertical" margin={{ left: 100, right: 40 }}>
              <XAxis type="number" domain={[6500, 8500]} tick={{ fill: '#888', fontSize: 11 }} />
              <YAxis type="category" dataKey="ib" tick={{ fill: '#E0E0E0', fontSize: 12, fontWeight: 500 }} width={95} />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div style={{ background: '#1a1a2e', padding: '12px', border: '1px solid #333', borderRadius: '8px' }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                          {data.ib}
                          <sup style={{ color: COLORS.warning, fontSize: '9px', marginLeft: '4px' }}>[{data.footnote}]</sup>
                        </div>
                        <div>목표가: {data.target.toLocaleString()}</div>
                        <div>EPS: {data.eps ? `$${data.eps}` : 'N/A'}</div>
                        <div>상승여력: +{data.upside}%</div>
                        <div>스탠스: {data.stance}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine x={6830} stroke={COLORS.warning} strokeDasharray="3 3" label={{ value: '현재', fill: COLORS.warning, fontSize: 10 }} />
              <Bar dataKey="target" name="S&P 500 목표가">
                {IB_SP500_TARGETS.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '12px' }}>
          <div style={styles.metricCard}>
            <div style={{ fontSize: '11px', color: '#888' }}>
              최고 목표
              <sup style={{ color: COLORS.warning, fontSize: '9px', marginLeft: '2px' }}>[1]</sup>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: COLORS.success }}>8,100</div>
            <div style={{ fontSize: '10px', color: '#666' }}>Oppenheimer</div>
          </div>
          <div style={styles.metricCard}>
            <div style={{ fontSize: '11px', color: '#888' }}>평균 목표</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: COLORS.primary }}>7,495</div>
            <div style={{ fontSize: '10px', color: '#666' }}>+9.7% 상승</div>
          </div>
          <div style={styles.metricCard}>
            <div style={{ fontSize: '11px', color: '#888' }}>
              최저 목표
              <sup style={{ color: COLORS.warning, fontSize: '9px', marginLeft: '2px' }}>[10]</sup>
            </div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: COLORS.warning }}>6,900</div>
            <div style={{ fontSize: '10px', color: '#666' }}>Citi</div>
          </div>
          <div style={styles.metricCard}>
            <div style={{ fontSize: '11px', color: '#888' }}>평균 EPS 전망</div>
            <div style={{ fontSize: '20px', fontWeight: 'bold', color: COLORS.info }}>$311</div>
            <div style={{ fontSize: '10px', color: '#666' }}>+12-14% YoY</div>
          </div>
        </div>
      </div>

      <div style={{ ...styles.card, marginBottom: '20px' }}>
        <div style={styles.cardTitle}>🔥 2026 핵심 투자 테마 (글로벌 IB 컨센서스)</div>
        {IB_KEY_THEMES.map((theme, idx) => (
          <div key={idx} style={styles.themeCard}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
              <span style={{ fontSize: '32px' }}>{theme.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#FFF' }}>{theme.theme}</div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {theme.bullish.map((ib, i) => (
                      <span key={i} style={{ ...styles.badge, ...styles.badgeOW }}>{ib}</span>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: COLORS.secondary, marginBottom: '12px' }}>{theme.summary}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '8px' }}>
                  {theme.details.map((detail, i) => (
                    <div key={i} style={{ fontSize: '12px', color: '#BBB', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '6px' }}>
                      • {detail}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.grid}>
        <div style={styles.card}>
          <div style={styles.cardTitle}>🌐 글로벌 GDP 성장률 전망 (%)</div>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>지역</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>GS</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>MS</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>JPM</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>UBS</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>Citi</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>DB</th>
              </tr>
            </thead>
            <tbody>
              {IB_GDP_FORECASTS.map((item, idx) => (
                <tr key={idx} style={{ background: item.region === 'Global' ? 'rgba(78, 121, 167, 0.1)' : 'transparent' }}>
                  <td style={{ ...styles.td, fontWeight: item.region === 'Global' ? '600' : '400' }}>{item.region}</td>
                  <td style={{ ...styles.td, textAlign: 'center', color: COLORS.primary }}>{item.gs}</td>
                  <td style={{ ...styles.td, textAlign: 'center', color: COLORS.info }}>{item.ms}</td>
                  <td style={{ ...styles.td, textAlign: 'center', color: COLORS.secondary }}>{item.jpm}</td>
                  <td style={{ ...styles.td, textAlign: 'center', color: COLORS.danger }}>{item.ubs}</td>
                  <td style={{ ...styles.td, textAlign: 'center', color: COLORS.dark }}>{item.citi}</td>
                  <td style={{ ...styles.td, textAlign: 'center', color: COLORS.warning }}>{item.db}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={styles.card}>
          <div style={styles.cardTitle}>💼 IB별 자산배분 스탠스</div>
          <table style={{ ...styles.table, fontSize: '12px' }}>
            <thead>
              <tr>
                <th style={styles.th}>IB</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>주식</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>채권</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>금</th>
                <th style={{ ...styles.th, textAlign: 'center' }}>현금</th>
              </tr>
            </thead>
            <tbody>
              {IB_ASSET_ALLOCATION.map((item, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{item.ib}</td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span style={{ ...styles.badge, ...getStanceBadgeStyle(item.equity) }}>{item.equity}</span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span style={{ ...styles.badge, ...getStanceBadgeStyle(item.bonds) }}>{item.bonds}</span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span style={{ ...styles.badge, ...getStanceBadgeStyle(item.gold) }}>{item.gold}</span>
                  </td>
                  <td style={{ ...styles.td, textAlign: 'center' }}>
                    <span style={{ ...styles.badge, ...getStanceBadgeStyle(item.cash) }}>{item.cash}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={styles.card}>
        <div style={styles.cardTitle}>⚠️ 주요 리스크 요인 (IB 평가)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          {IB_KEY_RISKS.map((risk, idx) => (
            <div key={idx} style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: COLORS.danger, marginBottom: '8px' }}>
                {risk.risk}
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '8px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: '#888' }}>발생확률: </span>
                  <span style={{ color: COLORS.warning, fontWeight: 'bold' }}>{risk.probability}</span>
                </div>
                <div>
                  <span style={{ color: '#888' }}>영향도: </span>
                  <span style={{ color: COLORS.danger, fontWeight: 'bold' }}>{risk.impact}</span>
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#AAA' }}>
                주요 IB 경고: {risk.ibs.join(', ')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footnotes 섹션 */}
      <div style={{ ...styles.card, marginTop: '20px' }}>
        <div style={{ ...styles.cardTitle, marginBottom: '16px' }}>📚 출처 및 참고자료</div>
        <div style={{ fontSize: '11px', color: '#999', marginBottom: '12px' }}>
          * 모든 데이터는 각 투자은행(IB)의 공식 리서치 리포트 및 주요 금융 매체 인용을 기반으로 작성되었습니다.
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '12px' }}>
          {FOOTNOTES.map((fn) => (
            <div key={fn.id} style={{ 
              background: 'rgba(255,255,255,0.03)', 
              padding: '12px', 
              borderRadius: '8px',
              borderLeft: '3px solid ' + COLORS.primary
            }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
                <span style={{ 
                  fontWeight: 'bold', 
                  color: COLORS.warning, 
                  fontSize: '11px',
                  minWidth: '24px'
                }}>
                  [{fn.id}]
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#E8E8E8', marginBottom: '4px' }}>
                    {fn.source}
                  </div>
                  <div style={{ fontSize: '11px', color: '#AAA', marginBottom: '4px' }}>
                    {fn.title}
                  </div>
                  <div style={{ fontSize: '10px', color: '#777' }}>
                    <span style={{ marginRight: '8px' }}>📅 {fn.date}</span>
                    <span>🔗 {fn.url}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: 'rgba(237, 201, 72, 0.1)', 
          borderRadius: '8px',
          border: '1px solid rgba(237, 201, 72, 0.3)'
        }}>
          <div style={{ fontSize: '11px', color: COLORS.warning, fontWeight: '600', marginBottom: '4px' }}>
            ⚠️ 면책조항
          </div>
          <div style={{ fontSize: '10px', color: '#BBB', lineHeight: '1.5' }}>
            본 자료는 정보 제공 목적으로만 작성되었으며, 투자 권유나 매매 조언을 의미하지 않습니다. 
            각 IB의 전망은 작성 시점 기준이며, 실제 시장 상황은 예측과 다를 수 있습니다. 
            투자 결정 시 전문가와 상담하시기 바랍니다.
          </div>
        </div>
      </div>
    </>
  );

  const getStanceBadgeStyle = (stance) => {
    switch(stance) {
      case 'OW': return styles.badgeOW;
      case 'UW': return styles.badgeUW;
      case 'EW': return styles.badgeEW;
      default: return styles.badgeN;
    }
  };

  // --- 메인 렌더링 ---

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <h1 style={styles.title}>📊 S자산배분 운용보고회의</h1>
        <p style={styles.subtitle}>
          1Q26 | 기준일: {baseDate} | {dataSource === 'api' ? '🟢 실시간 데이터' : '⚪ 폴백 데이터'}
        </p>
        <div style={styles.fundInfo}>
          <div style={styles.fundInfoItem}>
            <span style={styles.fundInfoLabel}>펀드코드</span>
            <span style={styles.fundInfoValue}>{fundCode}</span>
          </div>
          <div style={styles.fundInfoItem}>
            <span style={styles.fundInfoLabel}>총자산</span>
            <span style={styles.fundInfoValue}>{totalAssets.toFixed(1)}억</span>
          </div>
          <div style={styles.fundInfoItem}>
            <span style={styles.fundInfoLabel}>설정일</span>
            <span style={styles.fundInfoValue}>{inceptionDate}</span>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === 'overview' ? styles.tabActive : styles.tabInactive) }}
          onClick={() => setActiveTab('overview')}
        >
          <FileText size={16} /> 포트폴리오 현황
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'outlook' ? styles.tabActive : styles.tabInactive) }}
          onClick={() => setActiveTab('outlook')}
        >
          <TrendingUp size={16} /> 시장 전망 & 전략
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'fx' ? styles.tabActive : styles.tabInactive) }}
          onClick={() => setActiveTab('fx')}
        >
          <DollarSign size={16} /> FX 전략 (New)
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'risk' ? styles.tabActive : styles.tabInactive) }}
          onClick={() => setActiveTab('risk')}
        >
          <AlertTriangle size={16} /> 리스크 상세 분석
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'fms' ? styles.tabActive : styles.tabInactive) }}
          onClick={() => setActiveTab('fms')}
        >
          <Globe size={16} /> Global FMS (Jan '26)
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === 'ib' ? styles.tabActive : styles.tabInactive) }}
          onClick={() => setActiveTab('ib')}
        >
          📊 IB 전망
        </button>
      </div>

      {/* 탭 콘텐츠 */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'outlook' && renderOutlook()}
      {activeTab === 'fx' && renderFX()}
      {activeTab === 'risk' && renderRisk()}
      {activeTab === 'fms' && renderGlobalFMS()}
      {activeTab === 'ib' && renderIBOutlook()}

      {/* 푸터 */}
      <div style={{
        textAlign: 'left',
        padding: '20px 24px',
        marginTop: '20px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        color: '#888',
        fontSize: '11px',
        lineHeight: '1.8',
      }}>
        <p style={{ marginBottom: '4px', color: '#666' }}>본 자료는 투자 참고용이며, 투자 판단의 최종 책임은 투자자 본인에게 있습니다.</p>
        <p style={{ textAlign: 'center', color: '#555', marginTop: '12px' }}>© 2026 Covenant Asset Management. All rights reserved.</p>
      </div>
    </div>
  );
}