import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// 테스트 데이터
const testData = [
  { month: '1월', value: 100 },
  { month: '2월', value: 120 },
  { month: '3월', value: 150 },
  { month: '4월', value: 130 },
  { month: '5월', value: 180 },
  { month: '6월', value: 200 },
];

export default function TestChart() {
  const [showMessage, setShowMessage] = useState(false);

  return (
    <div style={{
      fontFamily: "'Pretendard', 'Noto Sans KR', sans-serif",
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      padding: '32px',
      color: '#fff'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '40px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '20px',
        padding: '32px',
        backdropFilter: 'blur(10px)'
      }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '12px' }}>
          ✅ 동적 로딩 테스트 차트
        </h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9 }}>
          이 차트가 보인다면 동적 JSX 로딩이 성공한 것입니다! 🎉
        </p>
        <p style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '12px' }}>
          URL: http://localhost:8040?component=TestChart
        </p>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '20px',
        padding: '32px',
        marginBottom: '24px'
      }}>
        <h3 style={{ textAlign: 'center', marginBottom: '24px', fontSize: '1.3rem' }}>
          📈 월별 테스트 데이터
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={testData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
            <XAxis 
              dataKey="month" 
              tick={{ fill: '#fff', fontSize: 13 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
            />
            <YAxis 
              tick={{ fill: '#fff', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
            />
            <Tooltip 
              contentStyle={{ 
                background: 'rgba(0,0,0,0.8)', 
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '8px',
                color: '#fff'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#ffd93d" 
              strokeWidth={3}
              dot={{ fill: '#ffd93d', r: 6 }}
              name="테스트 값"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '20px',
        padding: '32px',
        textAlign: 'center'
      }}>
        <h3 style={{ marginBottom: '24px' }}>🧪 인터랙션 테스트</h3>
        <button
          onClick={() => setShowMessage(!showMessage)}
          style={{
            padding: '16px 32px',
            fontSize: '1.1rem',
            background: 'linear-gradient(135deg, #ffd93d 0%, #ff6b6b 100%)',
            color: '#333',
            border: 'none',
            borderRadius: '12px',
            cursor: 'pointer',
            fontWeight: '700',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          {showMessage ? '숨기기' : '클릭하세요!'}
        </button>

        {showMessage && (
          <div style={{
            marginTop: '24px',
            padding: '20px',
            background: 'rgba(255,217,61,0.2)',
            border: '2px solid #ffd93d',
            borderRadius: '12px',
            animation: 'fadeIn 0.3s ease-in'
          }}>
            <p style={{ fontSize: '1.2rem', margin: 0 }}>
              🎯 React State가 정상 작동합니다!
            </p>
            <p style={{ fontSize: '0.9rem', opacity: 0.8, marginTop: '8px' }}>
              HMR (Hot Module Replacement)도 잘 작동하고 있습니다.
            </p>
          </div>
        )}
      </div>

      <div style={{
        marginTop: '32px',
        padding: '24px',
        background: 'rgba(0,0,0,0.2)',
        borderRadius: '12px',
        fontSize: '0.9rem',
        opacity: 0.7
      }}>
        <h4 style={{ marginBottom: '12px' }}>💡 테스트 체크리스트:</h4>
        <ul style={{ textAlign: 'left', listStyle: 'none', padding: 0 }}>
          <li>✅ 이 페이지가 보이면 → URL 파라미터 로딩 성공</li>
          <li>✅ 차트가 표시되면 → JSX 컴포넌트 렌더링 성공</li>
          <li>✅ 버튼이 작동하면 → React State 관리 성공</li>
          <li>✅ 이 파일을 수정하고 저장하면 → HMR 자동 반영</li>
        </ul>
        <p style={{ marginTop: '16px', fontSize: '0.85rem' }}>
          📝 파일 위치: src/TestChart.jsx<br />
          🔗 접속 URL: http://localhost:8040?component=TestChart
        </p>
      </div>
    </div>
  );
}
