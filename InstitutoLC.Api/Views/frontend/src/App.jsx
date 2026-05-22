import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './pages/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cadastro from './pages/Cadastro';
import Consulta from './pages/Consulta';
import Turmas from './pages/Turmas';
import ImportExport from './pages/ImportExport';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="cadastro" element={<Cadastro />} />
          <Route path="consulta" element={<Consulta />} />
          <Route path="turmas" element={<Turmas />} />
          <Route path="import-export" element={<ImportExport />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
