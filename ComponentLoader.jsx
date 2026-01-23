import React, { useState, useEffect } from 'react';

// 동적 컴포넌트 로더
const ComponentLoader = () => {
  const [Component, setComponent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadComponent = async () => {
      try {
        // URL에서 컴포넌트 파일명 가져오기
        const params = new URLSearchParams(window.location.search);
        const componentFile = params.get('component');
        
        if (!componentFile) {
          throw new Error('컴포넌트 파일명이 지정되지 않았습니다.');
        }

        console.log('컴포넌트 로딩:', componentFile);

        // 동적 import
        const module = await import(`./${componentFile}`);
        const LoadedComponent = module.default;

        if (!LoadedComponent) {
          throw new Error(`${componentFile}에서 default export를 찾을 수 없습니다.`);
        }

        setComponent(() => LoadedComponent);
        setLoading(false);
        console.log('✅ 컴포넌트 로드 완료:', componentFile);
      } catch (err) {
        console.error('❌ 컴포넌트 로드 실패:', err);
        setError(err);
        setLoading(false);
      }
    };

    loadComponent();
  }, []);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem',
        color: '#666'
      }}>
        ⏳ 컴포넌트 로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h2 style={{ color: '#e53e3e', marginBottom: '1rem' }}>
          컴포넌트 로드 실패
        </h2>
        <p style={{ color: '#666', marginBottom: '1rem' }}>
          {error.message}
        </p>
        <pre style={{
          background: '#f5f5f5',
          padding: '1rem',
          textAlign: 'left',
          overflow: 'auto',
          borderRadius: '8px'
        }}>
          {error.stack}
        </pre>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1.5rem',
            background: '#4F46E5',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!Component) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.5rem',
        color: '#e53e3e'
      }}>
        컴포넌트를 찾을 수 없습니다.
      </div>
    );
  }

  return <Component />;
};

export default ComponentLoader;
