import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import '@livekit/components-styles';
import './styles.css';
import Home from './pages/Home.jsx';
import WebinarDetail from './pages/WebinarDetail.jsx';
import HostRoom from './pages/HostRoom.jsx';
import Join from './pages/Join.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/webinars/:id" element={<WebinarDetail />} />
        <Route path="/webinars/:id/room" element={<HostRoom />} />
        <Route path="/join/:token" element={<Join />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
