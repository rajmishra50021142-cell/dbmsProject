import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './pages/HomePage';
import { AnalyzerPage } from './pages/AnalyzerPage';
import { ClosurePage } from './pages/ClosurePage';
import { KeysPage } from './pages/KeysPage';
import { NormalizationPage } from './pages/NormalizationPage';
import { LearnPage } from './pages/LearnPage';
import { HelpPage } from './pages/HelpPage';
import { DevelopedByPage } from './pages/DevelopedByPage';
import { HistoryPage } from './pages/HistoryPage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="analyzer" element={<AnalyzerPage />} />
          <Route path="closure" element={<ClosurePage />} />
          <Route path="keys" element={<KeysPage />} />
          <Route path="normalize" element={<NormalizationPage />} />
          <Route path="learn" element={<LearnPage />} />
          <Route path="help" element={<HelpPage />} />
          <Route path="developed-by" element={<DevelopedByPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
