import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import TdfFocusGlidepath from './TdfFocusGlidepath.jsx'
import TDFMonitoringDashboard from './TDF_포커스_모니터링.jsx'
import GlobalAssetDashboard from './DBLife_GlobalAsset_Dashboard.jsx'
import TDFGlidepathAnalysis from './TDF_Glidepath_Analysis.jsx'
import TdfFocusGlidepathOptimization from './TdfFocusGlidepath_Optimization.jsx'
import ComponentLoader from './ComponentLoader.jsx'

// URL 파라미터 확인
const urlParams = new URLSearchParams(window.location.search);
const componentFile = urlParams.get('component');

// 동적 컴포넌트 로드 모드인 경우
if (componentFile) {
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <ComponentLoader />
    </React.StrictMode>
  );
} else {
  // 기존 라우터 모드
  // 홈 페이지 - 대시보드 선택
  function HomePage() {
    return (
      <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: '#4E79A7', marginBottom: '30px' }}>TDF 대시보드</h1>
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <Link to="/glidepath" style={{ textDecoration: 'none' }}>
          <div style={{ 
            padding: '30px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px', 
            border: '2px solid #4E79A7',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
          >
            <h2 style={{ color: '#4E79A7', marginBottom: '10px' }}> TDF 글라이드패스</h2>
            <p style={{ color: '#666', margin: 0 }}>TDF 펀드의 글라이드패스 시각화 및 자산배분 분석</p>
          </div>
        </Link>
        
        <Link to="/focus" style={{ textDecoration: 'none' }}>
          <div style={{ 
            padding: '30px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px', 
            border: '2px solid #F28E2B',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
          >
            <h2 style={{ color: '#F28E2B', marginBottom: '10px' }}> TDF 포커스 모니터링</h2>
            <p style={{ color: '#666', margin: 0 }}>TDF 포커스 펀드 성과 모니터링 및 비교 분석</p>
          </div>
        </Link>

        <Link to="/global-asset" style={{ textDecoration: 'none' }}>
          <div style={{ 
            padding: '30px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px', 
            border: '2px solid #2ca02c',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
          >
            <h2 style={{ color: '#2ca02c', marginBottom: '10px' }}>🌍 글로벌 자산배분</h2>
            <p style={{ color: '#666', margin: 0 }}>글로벌 ETF 포트폴리오 자산배분 및 위험 분석</p>
          </div>
        </Link>

        <Link to="/tdf-analysis" style={{ textDecoration: 'none' }}>
          <div style={{ 
            padding: '30px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px', 
            border: '2px solid #9467bd',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
          >
            <h2 style={{ color: '#9467bd', marginBottom: '10px' }}>📊 TDF 글라이드패스</h2>
            <p style={{ color: '#666', margin: 0 }}>나이별 자산배분 경로 및 리밸런싱 분석</p>
          </div>
        </Link>

        <Link to="/tdf-optimization" style={{ textDecoration: 'none' }}>
          <div style={{ 
            padding: '30px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '8px', 
            border: '2px solid #e377c2',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e9ecef'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
          >
            <h2 style={{ color: '#e377c2', marginBottom: '10px' }}>🎯 TDF 포커스 최적화</h2>
            <p style={{ color: '#666', margin: 0 }}>TDF 포커스 글라이드패스 및 자산배분 최적화</p>
          </div>
        </Link>
      </div>
    </div>
  )
  }

  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/glidepath" element={<TdfFocusGlidepath />} />
          <Route path="/focus" element={<TDFMonitoringDashboard />} />
          <Route path="/global-asset" element={<GlobalAssetDashboard />} />
          <Route path="/tdf-analysis" element={<TDFGlidepathAnalysis />} />
          <Route path="/tdf-optimization" element={<TdfFocusGlidepathOptimization />} />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>,
  )
}
