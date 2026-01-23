import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, AreaChart, Area, ReferenceLine } from 'recharts';

// ============================================
// TDF 포커스 모니터링 대시보드 (API 연동 버전)
// Tableau 컬러 팔레트 적용 (보라색 계열 제외)
// 1일 주기 자동 업데이트
// ============================================

// API 설정
const API_BASE_URL = 'http://localhost:8052/api';

// Tableau 컬러 팔레트
const TABLEAU_COLORS = {
  blue: '#4E79A7',
  orange: '#F28E2B',
  red: '#E15759',
  teal: '#76B7B2',
  green: '#59A14F',
  yellow: '#EDC948',
  pink: '#FF9DA7',
  brown: '#9C755F',
  lightBrown: '#C8A882',
  mint: '#3EB489',
  gray: '#BAB0AC',
  darkGray: '#5A5A5A',
  lightGray: '#E8E8E8'
};

// 펀드 유형별 컬러 매핑
const FUND_COLORS = {
  '포커스': TABLEAU_COLORS.blue,
  'ACE': TABLEAU_COLORS.lightBrown,
  'TRP': TABLEAU_COLORS.brown,
  'KB': TABLEAU_COLORS.green,
  '삼성': TABLEAU_COLORS.mint,
  '미래': TABLEAU_COLORS.orange,
  '한투': TABLEAU_COLORS.brown,
  'default': TABLEAU_COLORS.gray
};

// 펀드명에서 컬러 추출
const getFundColor = (fundName) => {
  for (const [key, color] of Object.entries(FUND_COLORS)) {
    if (fundName.includes(key)) return color;
  }
  return FUND_COLORS.default;
};

// 빈티지 리스트
const VINTAGE_LIST = ['TIF', '2030', '2035', '2040', '2045', '2050', '2055', '2060'];

// 기간 리스트
const PERIOD_LIST = ['1M', '3M', '6M', '1Y', 'YTD', 'ITD', '3Y'];

// ============================================
// API 호출 함수들
// ============================================

const fetchAPI = async (endpoint, params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`API 호출 실패: ${endpoint}`, error);
    return null;
  }
};

// ============================================
// 커스텀 훅: 자동 업데이트
// ============================================

const useAutoRefresh = (callback, interval = 86400000) => {
  // 기본값: 24시간 (86400000ms)
  const savedCallback = useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    const tick = () => {
      savedCallback.current();
    };
    
    // 다음 자정까지 남은 시간 계산
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(6, 0, 0, 0); // 다음날 오전 6시
    
    const msUntilRefresh = tomorrow.getTime() - now.getTime();
    
    // 첫 번째 타이머: 다음 새벽 6시에 실행
    const initialTimeout = setTimeout(() => {
      tick();
      // 이후 24시간마다 반복
      const intervalId = setInterval(tick, interval);
      return () => clearInterval(intervalId);
    }, msUntilRefresh);
    
    return () => clearTimeout(initialTimeout);
  }, [interval]);
};

// ============================================
// 커스텀 컴포넌트들
// ============================================

// 로딩 스피너
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
    color: TABLEAU_COLORS.blue
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: `4px solid ${TABLEAU_COLORS.lightGray}`,
      borderTop: `4px solid ${TABLEAU_COLORS.blue}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// 에러 메시지
const ErrorMessage = ({ message, onRetry }) => (
  <div style={{
    padding: '20px',
    backgroundColor: `${TABLEAU_COLORS.red}15`,
    border: `1px solid ${TABLEAU_COLORS.red}`,
    borderRadius: '8px',
    textAlign: 'center'
  }}>
    <div style={{ color: TABLEAU_COLORS.red, marginBottom: '12px' }}>
      ⚠️ {message}
    </div>
    {onRetry && (
      <button
        onClick={onRetry}
        style={{
          padding: '8px 16px',
          backgroundColor: TABLEAU_COLORS.red,
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        다시 시도
      </button>
    )}
  </div>
);

// 셀렉트 컴포넌트
const Select = ({ label, value, onChange, options, disabled = false }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ 
      display: 'block', 
      fontSize: '13px', 
      fontWeight: '600', 
      color: TABLEAU_COLORS.darkGray,
      marginBottom: '6px',
      letterSpacing: '0.3px'
    }}>
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '10px 12px',
        fontSize: '14px',
        border: `1px solid ${TABLEAU_COLORS.gray}`,
        borderRadius: '6px',
        backgroundColor: disabled ? TABLEAU_COLORS.lightGray : 'white',
        cursor: disabled ? 'not-allowed' : 'pointer',
        outline: 'none',
        transition: 'border-color 0.2s ease',
        color: TABLEAU_COLORS.darkGray
      }}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

// 입력 컴포넌트
const Input = ({ label, value, onChange, placeholder, disabled = false }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ 
      display: 'block', 
      fontSize: '13px', 
      fontWeight: '600', 
      color: TABLEAU_COLORS.darkGray,
      marginBottom: '6px',
      letterSpacing: '0.3px'
    }}>
      {label}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      style={{
        width: '100%',
        padding: '10px 12px',
        fontSize: '14px',
        border: `1px solid ${TABLEAU_COLORS.gray}`,
        borderRadius: '6px',
        backgroundColor: disabled ? TABLEAU_COLORS.lightGray : 'white',
        outline: 'none',
        transition: 'border-color 0.2s ease',
        color: TABLEAU_COLORS.darkGray,
        boxSizing: 'border-box'
      }}
    />
  </div>
);

// 버튼 컴포넌트
const Button = ({ children, onClick, variant = 'primary', disabled = false, loading = false }) => {
  const baseStyle = {
    width: '100%',
    padding: '12px 16px',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    letterSpacing: '0.3px',
    opacity: disabled ? 0.6 : 1
  };
  
  const variants = {
    primary: {
      backgroundColor: TABLEAU_COLORS.blue,
      color: 'white',
    },
    danger: {
      backgroundColor: TABLEAU_COLORS.red,
      color: 'white',
    }
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      style={{ ...baseStyle, ...variants[variant] }}
    >
      {loading ? '로딩 중...' : children}
    </button>
  );
};

// 카드 컴포넌트
const Card = ({ children, title, style = {} }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '8px',
    border: `1px solid ${TABLEAU_COLORS.lightGray}`,
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    overflow: 'hidden',
    ...style
  }}>
    {title && (
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${TABLEAU_COLORS.lightGray}`,
        backgroundColor: '#FAFBFC'
      }}>
        <h3 style={{ 
          margin: 0, 
          fontSize: '16px', 
          fontWeight: '600',
          color: TABLEAU_COLORS.blue,
          letterSpacing: '0.3px'
        }}>
          {title}
        </h3>
      </div>
    )}
    <div style={{ padding: title ? '20px' : '0' }}>
      {children}
    </div>
  </div>
);

// 차트 래퍼 컴포넌트
const ChartWrapper = ({ title, children, loading = false, error = null }) => (
  <Card style={{ height: '100%' }}>
    <div style={{ padding: '16px 20px', borderBottom: `1px solid ${TABLEAU_COLORS.lightGray}` }}>
      <h4 style={{ 
        margin: 0, 
        fontSize: '14px', 
        fontWeight: '600',
        color: TABLEAU_COLORS.blue 
      }}>
        {title}
      </h4>
    </div>
    <div style={{ padding: '16px', height: '320px' }}>
      {loading ? <LoadingSpinner /> : error ? <ErrorMessage message={error} /> : children}
    </div>
  </Card>
);

// 수익률 테이블 셀 컴포넌트
const TableCell = ({ data, isHeader = false }) => {
  if (isHeader) {
    return (
      <div style={{
        backgroundColor: TABLEAU_COLORS.blue,
        color: 'white',
        padding: '12px 8px',
        textAlign: 'center',
        fontWeight: '600',
        fontSize: '13px',
        borderRadius: '6px',
        minHeight: '50px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        TDF {data}
      </div>
    );
  }

  const bgColor = data.color || getFundColor(data.company);
  
  return (
    <div style={{
      backgroundColor: bgColor,
      color: 'white',
      padding: '10px 8px',
      textAlign: 'center',
      borderRadius: '6px',
      minHeight: '60px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      lineHeight: '1.4',
      gap: '2px'
    }}>
      <div style={{ fontWeight: '600' }}>{data.company}</div>
      <div style={{ opacity: 0.9 }}>({data.hedgeType})</div>
      <div style={{ fontWeight: '700' }}>{(data.return * 100).toFixed(1)}%</div>
    </div>
  );
};

// 커스텀 툴팁 컴포넌트
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  
  return (
    <div style={{
      backgroundColor: 'white',
      border: `1px solid ${TABLEAU_COLORS.lightGray}`,
      borderRadius: '6px',
      padding: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
      maxWidth: '280px'
    }}>
      <div style={{ 
        fontSize: '12px', 
        fontWeight: '600', 
        color: TABLEAU_COLORS.darkGray,
        marginBottom: '8px',
        borderBottom: `1px solid ${TABLEAU_COLORS.lightGray}`,
        paddingBottom: '6px'
      }}>
        {label}
      </div>
      {payload.slice(0, 6).map((entry, idx) => (
        <div key={idx} style={{ 
          fontSize: '11px', 
          color: entry.color,
          marginBottom: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <span style={{ 
            overflow: 'hidden', 
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '180px'
          }}>
            {entry.name}
          </span>
          <span style={{ fontWeight: '600' }}>
            {(entry.value * 100).toFixed(2)}%
          </span>
        </div>
      ))}
      {payload.length > 6 && (
        <div style={{ fontSize: '11px', color: TABLEAU_COLORS.gray, marginTop: '4px' }}>
          +{payload.length - 6} more...
        </div>
      )}
    </div>
  );
};

// 산점도 툴팁
const ScatterTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  
  const data = payload[0].payload;
  
  return (
    <div style={{
      backgroundColor: 'white',
      border: `1px solid ${TABLEAU_COLORS.lightGray}`,
      borderRadius: '6px',
      padding: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <div style={{ 
        fontSize: '13px', 
        fontWeight: '600', 
        color: data.color || getFundColor(data.name),
        marginBottom: '8px'
      }}>
        {data.name}
      </div>
      <div style={{ fontSize: '12px', color: TABLEAU_COLORS.darkGray }}>
        <div>변동성: {(data.volatility * 100).toFixed(2)}%</div>
        <div>수익률: {(data.return * 100).toFixed(2)}%</div>
      </div>
    </div>
  );
};

// ============================================
// 메인 대시보드 컴포넌트
// ============================================
const TDFMonitoringDashboard = () => {
  // 상태 관리
  const [selectedVintage, setSelectedVintage] = useState('2050');
  const [selectedPeriod, setSelectedPeriod] = useState('YTD');
  const [summaryNames, setSummaryNames] = useState('한투,ACE,미래,삼성,KB');
  const [topN, setTopN] = useState('10');
  
  // API 데이터 상태
  const [returnsData, setReturnsData] = useState(null);
  const [volatilityData, setVolatilityData] = useState(null);
  const [riskReturnData, setRiskReturnData] = useState(null);
  const [vintageTableData, setVintageTableData] = useState(null);
  const [sharpeData, setSharpeData] = useState(null);
  const [drawdownData, setDrawdownData] = useState(null);
  
  // 로딩 및 에러 상태
  const [loading, setLoading] = useState({
    returns: false,
    volatility: false,
    riskReturn: false,
    vintageTable: false,
    sharpe: false,
    drawdown: false
  });
  const [errors, setErrors] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [apiStatus, setApiStatus] = useState('checking');

  // API 헬스체크
  const checkAPIHealth = useCallback(async () => {
    try {
      const response = await fetchAPI('/health');
      if (response && response.status === 'healthy') {
        setApiStatus('connected');
        return true;
      }
      setApiStatus('disconnected');
      return false;
    } catch {
      setApiStatus('disconnected');
      return false;
    }
  }, []);

  // 데이터 로드 함수들
  const loadReturnsData = useCallback(async () => {
    setLoading(prev => ({ ...prev, returns: true }));
    setErrors(prev => ({ ...prev, returns: null }));
    
    const data = await fetchAPI(`/returns/${selectedPeriod}`, {
      vintage: selectedVintage,
      companies: summaryNames
    });
    
    if (data) {
      setReturnsData(data);
    } else {
      setErrors(prev => ({ ...prev, returns: '수익률 데이터를 불러올 수 없습니다' }));
    }
    
    setLoading(prev => ({ ...prev, returns: false }));
  }, [selectedPeriod, selectedVintage, summaryNames]);

  const loadVolatilityData = useCallback(async () => {
    setLoading(prev => ({ ...prev, volatility: true }));
    setErrors(prev => ({ ...prev, volatility: null }));
    
    const data = await fetchAPI('/volatility', {
      vintage: selectedVintage,
      companies: summaryNames
    });
    
    if (data) {
      setVolatilityData(data);
    } else {
      setErrors(prev => ({ ...prev, volatility: '변동성 데이터를 불러올 수 없습니다' }));
    }
    
    setLoading(prev => ({ ...prev, volatility: false }));
  }, [selectedVintage, summaryNames]);

  const loadRiskReturnData = useCallback(async () => {
    setLoading(prev => ({ ...prev, riskReturn: true }));
    setErrors(prev => ({ ...prev, riskReturn: null }));
    
    const data = await fetchAPI('/risk-return', {
      vintage: selectedVintage,
      companies: summaryNames
    });
    
    if (data) {
      setRiskReturnData(data);
    } else {
      setErrors(prev => ({ ...prev, riskReturn: '위험-수익 데이터를 불러올 수 없습니다' }));
    }
    
    setLoading(prev => ({ ...prev, riskReturn: false }));
  }, [selectedVintage, summaryNames]);

  const loadVintageTableData = useCallback(async () => {
    setLoading(prev => ({ ...prev, vintageTable: true }));
    setErrors(prev => ({ ...prev, vintageTable: null }));
    
    const data = await fetchAPI('/vintage-table', {
      period: selectedPeriod,
      companies: summaryNames,
      top_n: parseInt(topN)
    });
    
    if (data) {
      setVintageTableData(data);
    } else {
      setErrors(prev => ({ ...prev, vintageTable: '테이블 데이터를 불러올 수 없습니다' }));
    }
    
    setLoading(prev => ({ ...prev, vintageTable: false }));
  }, [selectedPeriod, summaryNames, topN]);

  const loadSharpeData = useCallback(async () => {
    setLoading(prev => ({ ...prev, sharpe: true }));
    setErrors(prev => ({ ...prev, sharpe: null }));
    
    const data = await fetchAPI('/sharpe', {
      vintage: selectedVintage,
      companies: summaryNames
    });
    
    if (data) {
      setSharpeData(data);
    } else {
      setErrors(prev => ({ ...prev, sharpe: 'Sharpe 데이터를 불러올 수 없습니다' }));
    }
    
    setLoading(prev => ({ ...prev, sharpe: false }));
  }, [selectedVintage, summaryNames]);

  const loadDrawdownData = useCallback(async () => {
    setLoading(prev => ({ ...prev, drawdown: true }));
    setErrors(prev => ({ ...prev, drawdown: null }));
    
    const data = await fetchAPI('/drawdown', {
      vintage: selectedVintage,
      companies: summaryNames
    });
    
    if (data) {
      setDrawdownData(data);
    } else {
      setErrors(prev => ({ ...prev, drawdown: 'Drawdown 데이터를 불러올 수 없습니다' }));
    }
    
    setLoading(prev => ({ ...prev, drawdown: false }));
  }, [selectedVintage, summaryNames]);

  // 전체 데이터 로드
  const loadAllData = useCallback(async () => {
    const isHealthy = await checkAPIHealth();
    
    if (!isHealthy) {
      setErrors({ global: 'API 서버에 연결할 수 없습니다' });
      return;
    }
    
    await Promise.all([
      loadReturnsData(),
      loadVolatilityData(),
      loadRiskReturnData(),
      loadVintageTableData(),
      loadSharpeData(),
      loadDrawdownData()
    ]);
    
    setLastUpdated(new Date());
  }, [checkAPIHealth, loadReturnsData, loadVolatilityData, loadRiskReturnData, loadVintageTableData, loadSharpeData, loadDrawdownData]);

  // 캐시 삭제
  const clearCache = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/cache`, { method: 'DELETE' });
      if (response.ok) {
        alert('캐시가 삭제되었습니다. 데이터를 새로 불러옵니다.');
        loadAllData();
      }
    } catch (error) {
      alert('캐시 삭제에 실패했습니다.');
    }
  }, [loadAllData]);

  // 초기 로드
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // 필터 변경 시 데이터 리로드
  useEffect(() => {
    const timer = setTimeout(() => {
      loadAllData();
    }, 300); // 디바운스
    
    return () => clearTimeout(timer);
  }, [selectedVintage, selectedPeriod, summaryNames, topN]);

  // 1일 주기 자동 업데이트 (매일 오전 6시)
  useAutoRefresh(loadAllData, 86400000);

  // 펀드 목록 및 색상
  const funds = returnsData?.funds || [];
  const colors = returnsData?.colors || {};

  // 펀드 타입 확인 함수
  const getFundType = (fundName) => {
    if (fundName.includes('포커스')) return '포커스';
    if (fundName.includes('ACE')) return 'ACE';
    if (fundName.includes('TRP')) return 'TRP';
    return 'other';
  };

  // 선 두께 결정
  const getStrokeWidth = (fundName) => {
    const type = getFundType(fundName);
    if (type === '포커스') return 3;
    if (type === 'ACE') return 2.5;
    if (type === 'TRP') return 2;
    return 1.5;
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#F5F7FA',
      fontFamily: "'Pretendard', 'Noto Sans KR', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      {/* 헤더 */}
      <header style={{
        backgroundColor: 'white',
        borderBottom: `1px solid ${TABLEAU_COLORS.lightGray}`,
        padding: '20px 0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ 
          maxWidth: '1600px', 
          margin: '0 auto', 
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '28px' }}>📈</span>
            <h1 style={{ 
              margin: 0, 
              fontSize: '24px', 
              fontWeight: '700',
              color: TABLEAU_COLORS.blue,
              letterSpacing: '-0.5px'
            }}>
              TDF 포커스 모니터링
            </h1>
            <span style={{
              backgroundColor: apiStatus === 'connected' ? TABLEAU_COLORS.teal : TABLEAU_COLORS.red,
              color: 'white',
              padding: '4px 10px',
              borderRadius: '12px',
              fontSize: '11px',
              fontWeight: '600'
            }}>
              {apiStatus === 'connected' ? '🟢 LIVE' : apiStatus === 'checking' ? '🟡 연결 중...' : '🔴 오프라인'}
            </span>
          </div>
          
          {lastUpdated && (
            <div style={{ 
              fontSize: '12px', 
              color: TABLEAU_COLORS.gray,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>마지막 업데이트:</span>
              <span style={{ fontWeight: '600' }}>
                {lastUpdated.toLocaleString('ko-KR')}
              </span>
              <span style={{ 
                fontSize: '10px', 
                backgroundColor: TABLEAU_COLORS.lightGray,
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                매일 06:00 자동 갱신
              </span>
            </div>
          )}
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main style={{ 
        maxWidth: '1600px', 
        margin: '0 auto', 
        padding: '24px',
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        gap: '24px'
      }}>
        {/* 좌측 컨트롤 패널 */}
        <aside>
          <Card style={{ position: 'sticky', top: '100px' }}>
            <div style={{ padding: '20px' }}>
              <Select
                label="빈티지 선택"
                value={selectedVintage}
                onChange={setSelectedVintage}
                options={VINTAGE_LIST.map(v => ({ value: v, label: v }))}
                disabled={Object.values(loading).some(Boolean)}
              />
              
              <Select
                label="모니터링 기간"
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                options={PERIOD_LIST.map(p => ({ value: p, label: p }))}
                disabled={Object.values(loading).some(Boolean)}
              />
              
              <Input
                label="운용사 필터"
                value={summaryNames}
                onChange={setSummaryNames}
                placeholder="운용사 명칭 (쉼표 구분)"
                disabled={Object.values(loading).some(Boolean)}
              />
              
              <Select
                label="Top N 선택"
                value={topN}
                onChange={setTopN}
                options={[
                  { value: '5', label: '5' },
                  { value: '10', label: '10' },
                  { value: '20', label: '20' },
                  { value: '30', label: '30' }
                ]}
                disabled={Object.values(loading).some(Boolean)}
              />
              
              <Button 
                onClick={loadAllData}
                loading={Object.values(loading).some(Boolean)}
              >
                📊 새로고침
              </Button>
              
              <hr style={{ 
                border: 'none', 
                borderTop: `1px solid ${TABLEAU_COLORS.lightGray}`,
                margin: '20px 0'
              }} />
              
              <Button 
                variant="danger" 
                onClick={clearCache}
                disabled={Object.values(loading).some(Boolean)}
              >
                🗑️ 캐시 삭제
              </Button>
              
              <div style={{ 
                marginTop: '20px', 
                padding: '12px',
                backgroundColor: TABLEAU_COLORS.lightGray,
                borderRadius: '6px',
                fontSize: '11px',
                color: TABLEAU_COLORS.darkGray
              }}>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>📌 업데이트 주기</div>
                <div>• 실시간 데이터: 1일 1회 (06:00)</div>
                <div>• 캐시 유효기간: 24시간</div>
                <div>• 수동 새로고침 가능</div>
              </div>
            </div>
          </Card>
        </aside>

        {/* 우측 콘텐츠 영역 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* API 연결 오류 표시 */}
          {errors.global && (
            <ErrorMessage 
              message={errors.global} 
              onRetry={loadAllData}
            />
          )}

          {/* 코멘트 영역 */}
          <Card style={{ 
            borderLeft: `4px solid ${TABLEAU_COLORS.teal}`,
            backgroundColor: '#F8FAFB'
          }}>
            <div style={{ padding: '20px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                marginBottom: '12px'
              }}>
                <span style={{ fontSize: '20px' }}>💡</span>
                <span style={{ 
                  fontWeight: '600', 
                  color: TABLEAU_COLORS.teal,
                  fontSize: '15px'
                }}>
                  데이터 현황
                </span>
              </div>
              <p style={{ 
                margin: 0, 
                color: TABLEAU_COLORS.darkGray,
                fontSize: '14px',
                lineHeight: '1.7'
              }}>
                TDF {selectedVintage} 빈티지 기준, {selectedPeriod} 수익률 데이터입니다.
                {returnsData && (
                  <span> 분석 기간: {returnsData.start_date} ~ {returnsData.end_date}</span>
                )}
                {funds.length > 0 && (
                  <span> | 총 {funds.length}개 펀드 비교 중</span>
                )}
              </p>
            </div>
          </Card>

          {/* 빈티지별 수익률 테이블 */}
          <Card title="📋 빈티지별 수익률 요약">
            {loading.vintageTable ? (
              <LoadingSpinner />
            ) : errors.vintageTable ? (
              <ErrorMessage message={errors.vintageTable} onRetry={loadVintageTableData} />
            ) : vintageTableData ? (
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: `repeat(${vintageTableData.vintages.length}, 1fr)`,
                gap: '8px',
                padding: '4px'
              }}>
                {/* 헤더 */}
                {vintageTableData.vintages.map(vintage => (
                  <TableCell key={vintage} data={vintage} isHeader />
                ))}
                
                {/* 데이터 행 */}
                {Array.from({ length: parseInt(topN) }).map((_, rowIdx) => (
                  <React.Fragment key={rowIdx}>
                    {vintageTableData.vintages.map(vintage => {
                      const items = vintageTableData.data[vintage] || [];
                      const item = items[rowIdx];
                      return (
                        <TableCell 
                          key={`${vintage}-${rowIdx}`} 
                          data={item || { company: '-', hedgeType: '-', return: 0 }} 
                        />
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: TABLEAU_COLORS.gray }}>
                데이터 없음
              </div>
            )}
          </Card>

          {/* 그래프 그룹 1 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* 수익률 라인 차트 */}
            <ChartWrapper 
              title={`${selectedPeriod} 수익률 (TDF ${selectedVintage})`}
              loading={loading.returns}
              error={errors.returns}
            >
              {returnsData && returnsData.timeseries && (
                <ResponsiveContainer>
                  <LineChart data={returnsData.timeseries}>
                    <CartesianGrid strokeDasharray="3 3" stroke={TABLEAU_COLORS.lightGray} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: TABLEAU_COLORS.gray }}
                      tickFormatter={(d) => d.slice(5)}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: TABLEAU_COLORS.gray }}
                      tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ fontSize: '10px' }}
                      formatter={(value) => value.length > 18 ? value.slice(0, 18) + '...' : value}
                    />
                    {funds.map((fund) => (
                      <Line
                        key={fund}
                        type="monotone"
                        dataKey={fund}
                        stroke={colors[fund] || getFundColor(fund)}
                        strokeWidth={getStrokeWidth(fund)}
                        dot={false}
                        strokeDasharray={fund.includes('UH') ? '5 5' : undefined}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartWrapper>

            {/* 위험대비 수익률 산점도 */}
            <ChartWrapper 
              title={`1Y 위험대비 수익률 (TDF ${selectedVintage})`}
              loading={loading.riskReturn}
              error={errors.riskReturn}
            >
              {riskReturnData && riskReturnData.data && (
                <ResponsiveContainer>
                  <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={TABLEAU_COLORS.lightGray} />
                    <XAxis 
                      type="number" 
                      dataKey="volatility" 
                      name="변동성"
                      tick={{ fontSize: 11, fill: TABLEAU_COLORS.gray }}
                      tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                      label={{ value: '변동성', position: 'bottom', fontSize: 12, fill: TABLEAU_COLORS.gray }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="return" 
                      name="수익률"
                      tick={{ fontSize: 11, fill: TABLEAU_COLORS.gray }}
                      tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                      label={{ value: '수익률', angle: -90, position: 'left', fontSize: 12, fill: TABLEAU_COLORS.gray }}
                    />
                    <Tooltip content={<ScatterTooltip />} />
                    <Scatter
                      name="펀드"
                      data={riskReturnData.data}
                      fill={TABLEAU_COLORS.blue}
                    >
                      {riskReturnData.data.map((entry, idx) => (
                        <circle
                          key={idx}
                          cx={0}
                          cy={0}
                          r={entry.type === '포커스' ? 12 : entry.type === 'TRP' ? 10 : 7}
                          fill={entry.color}
                          fillOpacity={entry.type === 'other' ? 0.5 : 1}
                        />
                      ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              )}
            </ChartWrapper>
          </div>

          {/* 그래프 그룹 2 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* 변동성 차트 */}
            <ChartWrapper 
              title={`1Y Volatility (TDF ${selectedVintage})`}
              loading={loading.volatility}
              error={errors.volatility}
            >
              {volatilityData && volatilityData.timeseries && (
                <ResponsiveContainer>
                  <AreaChart data={volatilityData.timeseries.slice(-180)}>
                    <CartesianGrid strokeDasharray="3 3" stroke={TABLEAU_COLORS.lightGray} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: TABLEAU_COLORS.gray }}
                      tickFormatter={(d) => d.slice(5)}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: TABLEAU_COLORS.gray }}
                      tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {(volatilityData.funds || []).slice(0, 5).map((fund) => (
                      <Area
                        key={fund}
                        type="monotone"
                        dataKey={fund}
                        stroke={volatilityData.colors?.[fund] || getFundColor(fund)}
                        fill={volatilityData.colors?.[fund] || getFundColor(fund)}
                        fillOpacity={0.1}
                        strokeWidth={getStrokeWidth(fund)}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartWrapper>

            {/* Sharpe Ratio 차트 */}
            <ChartWrapper 
              title={`1Y Sharpe Ratio (TDF ${selectedVintage})`}
              loading={loading.sharpe}
              error={errors.sharpe}
            >
              {sharpeData && sharpeData.sharpe_timeseries && (
                <ResponsiveContainer>
                  <LineChart data={sharpeData.sharpe_timeseries.slice(-180)}>
                    <CartesianGrid strokeDasharray="3 3" stroke={TABLEAU_COLORS.lightGray} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: TABLEAU_COLORS.gray }}
                      tickFormatter={(d) => d.slice(5)}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: TABLEAU_COLORS.gray }}
                      domain={[-1, 3]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke={TABLEAU_COLORS.gray} strokeDasharray="3 3" />
                    {(sharpeData.funds || []).slice(0, 5).map((fund) => (
                      <Line
                        key={fund}
                        type="monotone"
                        dataKey={fund}
                        stroke={sharpeData.colors?.[fund] || getFundColor(fund)}
                        strokeWidth={getStrokeWidth(fund)}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartWrapper>
          </div>

          {/* 그래프 그룹 3 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Sharpe Rank */}
            <ChartWrapper 
              title={`1Y Sharpe Ratio %Ranking (TDF ${selectedVintage})`}
              loading={loading.sharpe}
              error={errors.sharpe}
            >
              {sharpeData && sharpeData.rank_timeseries && (
                <ResponsiveContainer>
                  <LineChart data={sharpeData.rank_timeseries.slice(-180)}>
                    <CartesianGrid strokeDasharray="3 3" stroke={TABLEAU_COLORS.lightGray} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: TABLEAU_COLORS.gray }}
                      tickFormatter={(d) => d.slice(5)}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: TABLEAU_COLORS.gray }}
                      domain={[0, 100]}
                      reversed
                      tickFormatter={(v) => `${v}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {(sharpeData.funds || []).slice(0, 5).map((fund) => (
                      <Line
                        key={fund}
                        type="monotone"
                        dataKey={fund}
                        stroke={sharpeData.colors?.[fund] || getFundColor(fund)}
                        strokeWidth={getStrokeWidth(fund)}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartWrapper>

            {/* Drawdown */}
            <ChartWrapper 
              title={`1Y Rolling Drawdown (TDF ${selectedVintage})`}
              loading={loading.drawdown}
              error={errors.drawdown}
            >
              {drawdownData && drawdownData.timeseries && (
                <ResponsiveContainer>
                  <AreaChart data={drawdownData.timeseries}>
                    <CartesianGrid strokeDasharray="3 3" stroke={TABLEAU_COLORS.lightGray} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11, fill: TABLEAU_COLORS.gray }}
                      tickFormatter={(d) => d.slice(5)}
                    />
                    <YAxis 
                      tick={{ fontSize: 11, fill: TABLEAU_COLORS.gray }}
                      tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <ReferenceLine y={0} stroke={TABLEAU_COLORS.gray} />
                    {(drawdownData.funds || []).slice(0, 5).map((fund) => (
                      <Area
                        key={fund}
                        type="monotone"
                        dataKey={fund}
                        stroke={drawdownData.colors?.[fund] || getFundColor(fund)}
                        fill={drawdownData.colors?.[fund] || getFundColor(fund)}
                        fillOpacity={0.15}
                        strokeWidth={getStrokeWidth(fund)}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </ChartWrapper>
          </div>

          {/* 현재 수익률 요약 */}
          {returnsData && returnsData.returns && (
            <Card title={`📊 ${selectedPeriod} 수익률 현황`}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '12px',
                padding: '8px'
              }}>
                {Object.entries(returnsData.returns)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 8)
                  .map(([fund, returnVal]) => (
                    <div 
                      key={fund}
                      style={{
                        backgroundColor: returnVal >= 0 
                          ? `${colors[fund] || getFundColor(fund)}15` 
                          : `${TABLEAU_COLORS.red}15`,
                        border: `1px solid ${returnVal >= 0 
                          ? colors[fund] || getFundColor(fund) 
                          : TABLEAU_COLORS.red}`,
                        borderRadius: '8px',
                        padding: '16px 12px',
                        textAlign: 'center'
                      }}
                    >
                      <div style={{ 
                        fontSize: '11px', 
                        color: TABLEAU_COLORS.darkGray,
                        marginBottom: '8px',
                        fontWeight: '500',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {fund.length > 20 ? fund.slice(0, 20) + '...' : fund}
                      </div>
                      <div style={{ 
                        fontSize: '20px', 
                        fontWeight: '700',
                        color: returnVal >= 0 
                          ? colors[fund] || getFundColor(fund) 
                          : TABLEAU_COLORS.red
                      }}>
                        {returnVal >= 0 ? '+' : ''}{(returnVal * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
              </div>
            </Card>
          )}
        </div>
      </main>

      {/* 푸터 */}
      <footer style={{
        backgroundColor: 'white',
        borderTop: `1px solid ${TABLEAU_COLORS.lightGray}`,
        padding: '20px 0',
        marginTop: '40px'
      }}>
        <div style={{ 
          maxWidth: '1600px', 
          margin: '0 auto', 
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span style={{ 
            fontSize: '13px', 
            color: TABLEAU_COLORS.gray 
          }}>
            © 2025 TDF 포커스 모니터링 Dashboard | Covenant Seo
          </span>
          <div style={{ 
            fontSize: '12px', 
            color: TABLEAU_COLORS.gray,
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span>API: {API_BASE_URL}</span>
            <span>|</span>
            <span>업데이트: 매일 06:00</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TDFMonitoringDashboard;