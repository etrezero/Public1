import React, { useState, useEffect } from 'react';
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE_URL = 'http://localhost:9011/api/v1';

const COLORS = {
  equity: '#4E79A7',
  bond: '#76B7B2',
  alternative: '#F28E2B',
  cash: '#EDC948',
};

export default function TDFGlidepathAnalysis() {
  const [glidepathData, setGlidepathData] = useState([]);
  const [currentAge, setCurrentAge] = useState(30);
  const [targetAllocation, setTargetAllocation] = useState(null);
  const [rebalancingInfo, setRebalancingInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [glideFunctionType, setGlideFunctionType] = useState('linear');

  // 글라이드패스 계산
  const fetchGlidepath = async (glideFunction) => {
    try {
      const response = await fetch(`${API_BASE_URL}/glidepath/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          start_age: 20,
          retirement_age: 65,
          end_age: 100,
          glide_function: glideFunction
        })
      });
      const data = await response.json();
      return data.glidepath || [];
    } catch (err) {
      console.error('Glidepath fetch error:', err);
      return [];
    }
  };

  // 목표 자산배분 조회
  const fetchTargetAllocation = async (age, glideFunction) => {
    try {
      const response = await fetch(`${API_BASE_URL}/glidepath/target-allocation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_age: age,
          glide_function: glideFunction
        })
      });
      const data = await response.json();
      return data.target_allocation || null;
    } catch (err) {
      console.error('Target allocation fetch error:', err);
      return null;
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const [glidepath, target] = await Promise.all([
          fetchGlidepath(glideFunctionType),
          fetchTargetAllocation(currentAge, glideFunctionType)
        ]);
        
        setGlidepathData(glidepath);
        setTargetAllocation(target);
      } catch (err) {
        setError('데이터 로드 실패');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [glideFunctionType]);

  // 나이 변경 시 목표 자산배분 업데이트
  useEffect(() => {
    const updateTarget = async () => {
      const target = await fetchTargetAllocation(currentAge, glideFunctionType);
      setTargetAllocation(target);
    };
    updateTarget();
  }, [currentAge]);

  // 리밸런싱 체크
  const checkRebalancing = async () => {
    if (!targetAllocation) return;
    
    // 샘플 현재 포트폴리오 (실제로는 입력 받아야 함)
    const currentAllocation = {
      equity: 0.55,
      bond: 0.40,
      alternative: 0.03,
      cash: 0.02
    };
    
    const targetAlloc = {
      equity: targetAllocation.equity,
      bond: targetAllocation.bond,
      alternative: targetAllocation.alternative,
      cash: targetAllocation.cash
    };
    
    try {
      const response = await fetch(`${API_BASE_URL}/glidepath/rebalancing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_allocation: currentAllocation,
          target_allocation: targetAlloc,
          threshold: 0.05
        })
      });
      const data = await response.json();
      setRebalancingInfo(data);
    } catch (err) {
      console.error('Rebalancing check error:', err);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0a0e27', color: '#fff' }}>
        로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#0a0e27', color: '#f44' }}>
        {error}
      </div>
    );
  }

  const equityBondData = glidepathData.map(d => ({
    age: d.age,
    주식: (d.equity_weight * 100).toFixed(1),
    채권: (d.bond_weight * 100).toFixed(1),
    대체투자: (d.alternative_weight * 100).toFixed(1),
    현금: (d.cash_weight * 100).toFixed(1)
  }));

  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      minHeight: '100vh',
      padding: '32px',
      color: '#e8e8e8'
    }}>
      {/* 헤더 */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '10px', color: '#fff' }}>
          TDF 글라이드패스 분석
        </h1>
        <p style={{ fontSize: '16px', color: '#8b95a5' }}>
          나이에 따른 자산배분 경로 및 최적화 분석
        </p>
      </div>

      {/* 컨트롤 패널 */}
      <div style={{
        backgroundColor: '#151b33',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '30px',
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b95a5' }}>
            현재 나이
          </label>
          <input
            type="number"
            value={currentAge}
            onChange={(e) => setCurrentAge(Number(e.target.value))}
            min="20"
            max="100"
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#0a0e27',
              border: '1px solid #667eea',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '16px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#8b95a5' }}>
            글라이드 함수
          </label>
          <select
            value={glideFunctionType}
            onChange={(e) => setGlideFunctionType(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#0a0e27',
              border: '1px solid #667eea',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '16px'
            }}
          >
            <option value="linear">선형 (Linear)</option>
            <option value="exponential">지수 (Exponential)</option>
            <option value="s_curve">S-커브 (S-Curve)</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={checkRebalancing}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#667eea',
              border: 'none',
              borderRadius: '6px',
              color: '#fff',
              fontSize: '16px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            리밸런싱 체크
          </button>
        </div>
      </div>

      {/* 목표 자산배분 */}
      {targetAllocation && (
        <div style={{
          backgroundColor: '#151b33',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#667eea' }}>
            현재 나이 ({currentAge}세) 목표 자산배분
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#0a0e27', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#8b95a5', marginBottom: '5px' }}>주식</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4E79A7' }}>
                {(targetAllocation.equity * 100).toFixed(1)}%
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#0a0e27', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#8b95a5', marginBottom: '5px' }}>채권</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#76B7B2' }}>
                {(targetAllocation.bond * 100).toFixed(1)}%
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#0a0e27', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#8b95a5', marginBottom: '5px' }}>대체투자</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#F28E2B' }}>
                {(targetAllocation.alternative * 100).toFixed(1)}%
              </div>
            </div>
            <div style={{ textAlign: 'center', padding: '15px', backgroundColor: '#0a0e27', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#8b95a5', marginBottom: '5px' }}>현금</div>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#EDC948' }}>
                {(targetAllocation.cash * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 리밸런싱 정보 */}
      {rebalancingInfo && (
        <div style={{
          backgroundColor: '#151b33',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '30px'
        }}>
          <h3 style={{ marginBottom: '20px', color: '#667eea' }}>리밸런싱 분석</h3>
          <div style={{ marginBottom: '15px' }}>
            <p style={{ fontSize: '16px' }}>
              리밸런싱 필요: {rebalancingInfo.needs_rebalancing ? 
                <span style={{ color: '#4caf50', fontWeight: 'bold' }}>✅ 예</span> : 
                <span style={{ color: '#f44336', fontWeight: 'bold' }}>❌ 아니오</span>
              }
            </p>
            <p style={{ fontSize: '14px', color: '#8b95a5' }}>
              최대 편차: {(rebalancingInfo.max_deviation * 100).toFixed(2)}% (임계값: {(rebalancingInfo.threshold * 100).toFixed(0)}%)
            </p>
          </div>
          
          {rebalancingInfo.recommended_trades && Object.keys(rebalancingInfo.recommended_trades).length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ marginBottom: '10px', color: '#8b95a5' }}>권장 거래</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                {Object.entries(rebalancingInfo.recommended_trades).map(([asset, trade]) => (
                  <div key={asset} style={{ padding: '10px', backgroundColor: '#0a0e27', borderRadius: '6px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '5px' }}>{asset}</div>
                    <div style={{ fontSize: '12px', color: trade.action === 'BUY' ? '#4caf50' : '#f44336' }}>
                      {trade.action}: {trade.amount.toLocaleString()}원
                    </div>
                    <div style={{ fontSize: '11px', color: '#8b95a5' }}>
                      {(trade.from_weight * 100).toFixed(1)}% → {(trade.to_weight * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 글라이드패스 차트 */}
      <div style={{
        backgroundColor: '#151b33',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#667eea' }}>자산배분 글라이드패스</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={equityBondData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2642" />
            <XAxis dataKey="age" stroke="#8b95a5" label={{ value: '나이', position: 'insideBottom', offset: -5 }} />
            <YAxis stroke="#8b95a5" label={{ value: '비중 (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip contentStyle={{ backgroundColor: '#0a0e27', border: '1px solid #667eea' }} />
            <Legend />
            <Area type="monotone" dataKey="주식" stackId="1" stroke="#4E79A7" fill="#4E79A7" />
            <Area type="monotone" dataKey="채권" stackId="1" stroke="#76B7B2" fill="#76B7B2" />
            <Area type="monotone" dataKey="대체투자" stackId="1" stroke="#F28E2B" fill="#F28E2B" />
            <Area type="monotone" dataKey="현금" stackId="1" stroke="#EDC948" fill="#EDC948" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 주식 비중 추이 */}
      <div style={{
        backgroundColor: '#151b33',
        padding: '20px',
        borderRadius: '12px'
      }}>
        <h3 style={{ marginBottom: '20px', color: '#667eea' }}>주식 비중 추이</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={equityBondData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e2642" />
            <XAxis dataKey="age" stroke="#8b95a5" />
            <YAxis stroke="#8b95a5" label={{ value: '주식 비중 (%)', angle: -90, position: 'insideLeft' }} />
            <Tooltip contentStyle={{ backgroundColor: '#0a0e27', border: '1px solid #667eea' }} />
            <Legend />
            <Line type="monotone" dataKey="주식" stroke="#4E79A7" strokeWidth={3} dot={{ fill: '#4E79A7', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
