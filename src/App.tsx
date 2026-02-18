
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Ontology from './pages/Ontology';
import Knowledge from './pages/Knowledge';
import Prompt from './pages/Prompt';
import Model from './pages/Model';
import { initializeAppData } from './services/dataInitializer';

const App: React.FC = () => {
  
  // 应用启动时初始化数据
  useEffect(() => {
    initializeAppData();
  }, []);

  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/ontology" element={<Ontology />} />
          <Route path="/knowledge" element={<Knowledge />} />
          <Route path="/prompt" element={<Prompt />} />
          <Route path="/model" element={<Model />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
