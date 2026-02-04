import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Clients from './pages/Clients';
import Content from './pages/Content';
import Templates from './pages/Templates';
import Render from './pages/Render';
import Screens from './pages/Screens';
import Playlists from './pages/Playlists';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="clients" element={<Clients />} />
        <Route path="content" element={<Content />} />
        <Route path="templates" element={<Templates />} />
        <Route path="render" element={<Render />} />
        <Route path="screens" element={<Screens />} />
        <Route path="playlists" element={<Playlists />} />
      </Route>
    </Routes>
  );
}
