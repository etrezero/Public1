import React, { useState, useEffect } from 'react';
import {
  PieChart, Pie, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

// API Base URL
const API_BASE_URL = 'http://localhost:9012/api/v1';

// 샘플 포트폴리오 가중치 (20 ETFs)
const SAMPLE_PORTFOLIO = {
  'SPY': 0.15, 'QQQ': 0.10, 'IWM': 0.05,
  'VGK': 0.10, 'EWG': 0.05, 'EWU': 0.05,
  'EWJ': 0.10, 'EWY': 0.05, 'EWT': 0.05,
  'EEM': 0.05, 'FXI': 0.03, 'INDA': 0.02,
  'AGG': 0.10, 'TLT': 0.05, 'LQD': 0.05,
  'GLD': 0.03, 'USO': 0.02
};

const COLORS = [
  '#1f77b4', '#ff7f0e', '#2ca02c', '#d62728',
  '#9467bd', '#8c564b', '#e377c2', '#7f7f7f',
  '#bcbd22', '#17becf', '#aec7e8', '#ffbb78'
];

const DBLifeGlobalAssetDashboard = () => {
  const [productInfo, setProductInfo] = useState(null);
  const [regionData, setRegionData] = useState(null);
  const [countryData, setCountryData] = useState(null);
  const [assetClassData, setAssetClassData] = useState(null);
  const [fxRates, setFxRates] = useState(null);
  const [fxExposure, setFxExposure] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [riskData, setRiskData] = useState(null);
  const [rebalancingData, setRebalancingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('allocation');

  // API 호출 함수들
  const fetchProductInfo = async () => {
    const response = await fetch(`${API_BASE_URL}/global-info/product`);
    return response.json();
  };

  const fetchRegionAllocation = async (portfolio) => {
    const response = await fetch(`${API_BASE_URL}/allocation/region`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolio_weights: portfolio })
    });
    return response.json();
  };

  const fetchCountryAllocation = async (portfolio) => {
    const response = await fetch(`${API_BASE_URL}/allocation/country`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolio_weights: portfolio })
    });
    return response.json();
  };

  const fetchAssetClassAllocation = async (portfolio) => {
    const response = await fetch(`${API_BASE_URL}/allocation/asset-class`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolio_weights: portfolio })
    });
    return response.json();
  };

  const fetchFXRates = async () => {
    const response = await fetch(`${API_BASE_URL}/fx-exposure/fx-rates`);
    return response.json();
  };

  const fetchFXExposure = async (portfolio) => {
    const response = await fetch(`${API_BASE_URL}/fx-exposure/currency`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolio_weights: portfolio })
    });
    return response.json();
  };

  const fetchPerformance = async (portfolio) => {
    const response = await fetch(`${API_BASE_URL}/performance/portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolio_weights: portfolio })
    });
    return response.json();
  };

  const fetchRiskAnalysis = async (portfolio) => {
    const response = await fetch(`${API_BASE_URL}/risk/comprehensive`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolio_weights: portfolio })
    });
    return response.json();
  };

  const fetchRebalancing = async (portfolio) => {
    const response = await fetch(`${API_BASE_URL}/rebalancing/recommendation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolio_weights: portfolio })
    });
    return response.json();
  };

  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      try {
        const [product, region, country, assetClass, fx, fxExp, perf, risk, rebal] = 
          await Promise.all([
            fetchProductInfo(),
            fetchRegionAllocation(SAMPLE_PORTFOLIO),
            fetchCountryAllocation(SAMPLE_PORTFOLIO),
            fetchAssetClassAllocation(SAMPLE_PORTFOLIO),
            fetchFXRates(),
            fetchFXExposure(SAMPLE_PORTFOLIO),
            fetchPerformance(SAMPLE_PORTFOLIO),
            fetchRiskAnalysis(SAMPLE_PORTFOLIO),
            fetchRebalancing(SAMPLE_PORTFOLIO)
          ]);
        
        setProductInfo(product);
        setRegionData(region);
        setCountryData(country);
        setAssetClassData(assetClass);
        setFxRates(fx);
        setFxExposure(fxExp);
        setPerformanceData(perf);
        setRiskData(risk);
        setRebalancingData(rebal);
      } catch (err) {
        setError('데이터 로드 실패');
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, []);

  if (loading) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',backgroundColor:'#0a0e27',color:'#fff'}}>로딩 중...</div>;
  if (error) return <div style={{display:'flex',justifyContent:'center',alignItems:'center',height:'100vh',backgroundColor:'#0a0e27',color:'#f44'}}>오류: {error}</div>;

  const getRegionChartData = () => {
    if (!regionData?.allocation) return [];
    return Object.entries(regionData.allocation).map(([name, value]) => ({
      name: name === 'north_america' ? '북미' : name === 'europe' ? '유럽' : name === 'asia_pacific' ? '아시아태평양' : '신흥시장',
      value: parseFloat((value * 100).toFixed(2))
    }));
  };

  const getCountryChartData = () => {
    if (!countryData?.allocation) return [];
    return Object.entries(countryData.allocation)
      .map(([name, value]) => ({ name, value: parseFloat((value * 100).toFixed(2)) }))
      .sort((a, b) => b.value - a.value);
  };

  const getAssetClassChartData = () => {
    if (!assetClassData?.allocation) return [];
    return Object.entries(assetClassData.allocation).map(([name, value]) => ({
      name: name === 'equity' ? '주식' : name === 'bond' ? '채권' : name === 'alternative' ? '대체투자' : '현금',
      value: parseFloat((value * 100).toFixed(2))
    }));
  };

  const getFXExposureChartData = () => {
    if (!fxExposure?.exposure) return [];
    return Object.entries(fxExposure.exposure).map(([name, value]) => ({
      name, value: parseFloat((value * 100).toFixed(2))
    }));
  };

  const getPerformanceChartData = () => {
    if (!performanceData?.returns) return [];
    return Object.entries(performanceData.returns)
      .filter(([key]) => key !== 'inception')
      .map(([period, value]) => ({
        period: period === '1m' ? '1개월' : period === '3m' ? '3개월' : period === '6m' ? '6개월' : period === 'ytd' ? 'YTD' : period === '1y' ? '1년' : '3년',
        return: parseFloat((value * 100).toFixed(2))
      }));
  };

  const getRiskRadarData = () => {
    if (!riskData) return [];
    return [
      { metric: '변동성', value: riskData.volatility ? parseFloat((riskData.volatility * 100).toFixed(1)) : 0, fullMark: 30 },
      { metric: 'VaR95%', value: riskData.var_95 ? Math.abs(parseFloat((riskData.var_95 * 100).toFixed(1))) : 0, fullMark: 30 },
      { metric: 'VaR99%', value: riskData.var_99 ? Math.abs(parseFloat((riskData.var_99 * 100).toFixed(1))) : 0, fullMark: 30 },
      { metric: '샤프비율', value: riskData.sharpe_ratio ? Math.max(0, parseFloat((riskData.sharpe_ratio * 10).toFixed(1))) : 0, fullMark: 30 }
    ];
  };

  return (
    <div style={{backgroundColor:'#0a0e27',minHeight:'100vh',padding:'20px',color:'#fff'}}>
      <h1 style={{fontSize:'32px',marginBottom:'10px'}}>DB생명 글로벌 자산배분</h1>
      {productInfo && <div style={{fontSize:'14px',color:'#8b95a5',marginBottom:'20px'}}>{productInfo.fund_name}</div>}
      
      <div style={{display:'flex',gap:'10px',marginBottom:'30px',borderBottom:'2px solid #1e2642'}}>
        {['allocation','performance','risk','fx'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{padding:'12px 24px',backgroundColor:activeTab===tab?'#667eea':'transparent',
            color:activeTab===tab?'#fff':'#8b95a5',border:'none',cursor:'pointer'}}>
            {tab==='allocation'?'자산배분':tab==='performance'?'성과분석':tab==='risk'?'위험분석':'환율정보'}
          </button>
        ))}
      </div>

      {activeTab === 'allocation' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'30px'}}>
          <div style={{backgroundColor:'#151b33',padding:'20px',borderRadius:'12px'}}>
            <h3>지역별 배분</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={getRegionChartData()} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                  label={({name,value})=>`${name}:${value}%`}>
                  {getRegionChartData().map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip/><Legend/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{backgroundColor:'#151b33',padding:'20px',borderRadius:'12px'}}>
            <h3>국가별 배분</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getCountryChartData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2642"/>
                <XAxis dataKey="name" stroke="#8b95a5"/>
                <YAxis stroke="#8b95a5"/>
                <Tooltip contentStyle={{backgroundColor:'#0a0e27',border:'1px solid #667eea'}}/>
                <Bar dataKey="value" fill="#667eea"/>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{backgroundColor:'#151b33',padding:'20px',borderRadius:'12px'}}>
            <h3>자산군별 배분</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={getAssetClassChartData()} cx="50%" cy="50%" outerRadius={100} dataKey="value"
                  label={({name,value})=>`${name}:${value}%`}>
                  {getAssetClassChartData().map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip/><Legend/>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{backgroundColor:'#151b33',padding:'20px',borderRadius:'12px'}}>
            <h3>리밸런싱 현황</h3>
            {rebalancingData && (
              <div>
                <p>리밸런싱 필요: {rebalancingData.needs_rebalancing?'예':'아니오'}</p>
                {rebalancingData.max_deviation && 
                  <p>최대 편차: {(rebalancingData.max_deviation*100).toFixed(2)}%</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'performance' && (
        <div style={{backgroundColor:'#151b33',padding:'20px',borderRadius:'12px'}}>
          <h3>기간별 수익률</h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={getPerformanceChartData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2642"/>
              <XAxis dataKey="period" stroke="#8b95a5"/>
              <YAxis stroke="#8b95a5"/>
              <Tooltip contentStyle={{backgroundColor:'#0a0e27',border:'1px solid #667eea'}}/>
              <Bar dataKey="return" fill="#667eea"/>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'risk' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'30px'}}>
          <div style={{backgroundColor:'#151b33',padding:'20px',borderRadius:'12px'}}>
            <h3>위험 지표</h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={getRiskRadarData()}>
                <PolarGrid stroke="#1e2642"/>
                <PolarAngleAxis dataKey="metric" stroke="#8b95a5"/>
                <PolarRadiusAxis stroke="#8b95a5"/>
                <Radar dataKey="value" stroke="#667eea" fill="#667eea" fillOpacity={0.6}/>
                <Tooltip/><Legend/>
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div style={{backgroundColor:'#151b33',padding:'20px',borderRadius:'12px'}}>
            <h3>위험 세부정보</h3>
            {riskData && (
              <div style={{display:'flex',flexDirection:'column',gap:'15px'}}>
                <div style={{padding:'15px',backgroundColor:'#0a0e27',borderRadius:'8px'}}>
                  <div style={{fontSize:'12px',color:'#8b95a5'}}>변동성</div>
                  <div style={{fontSize:'24px',fontWeight:'bold',color:'#667eea'}}>
                    {riskData.volatility?(riskData.volatility*100).toFixed(2):0}%
                  </div>
                </div>
                <div style={{padding:'15px',backgroundColor:'#0a0e27',borderRadius:'8px'}}>
                  <div style={{fontSize:'12px',color:'#8b95a5'}}>샤프비율</div>
                  <div style={{fontSize:'24px',fontWeight:'bold',color:'#4caf50'}}>
                    {riskData.sharpe_ratio?riskData.sharpe_ratio.toFixed(2):0}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'fx' && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:'30px'}}>
          <div style={{backgroundColor:'#151b33',padding:'20px',borderRadius:'12px'}}>
            <h3>통화 노출</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={getFXExposureChartData()} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value"
                  label={({name,value})=>`${name}:${value}%`}>
                  {getFXExposureChartData().map((e,i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                </Pie>
                <Tooltip/><Legend/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{backgroundColor:'#151b33',padding:'20px',borderRadius:'12px'}}>
            <h3>환율 정보</h3>
            {fxRates?.rates && Object.entries(fxRates.rates).map(([currency,data])=>(
              <div key={currency} style={{padding:'12px',backgroundColor:'#0a0e27',borderRadius:'8px',marginBottom:'10px',
                display:'flex',justifyContent:'space-between'}}>
                <div>{currency}/KRW</div>
                <div style={{fontSize:'18px',fontWeight:'bold',color:'#667eea'}}>
                  {data.rate?.toFixed(2)||'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DBLifeGlobalAssetDashboard;
