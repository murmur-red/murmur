// App.jsx — Main app with full routing and comparison view

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomeScrollLayout from './HomeScrollLayout';
import GPT4Page from './GPT4Page';
import Claude3Page from './Claude3Page';
import GeminiPage from './GeminiPage';
import CompareTable from './CompareTable';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeScrollLayout />} />
        <Route path="/gpt4" element={<GPT4Page />} />
        <Route path="/claude3" element={<Claude3Page />} />
        <Route path="/gemini" element={<GeminiPage />} />
        <Route path="/compare" element={<CompareTable />} />
      </Routes>
    </Router>
  );
}