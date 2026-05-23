import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Users, FileDown, LogOut, User } from 'lucide-react';
import api from '../api';
import './Layout.css';

export default function Layout() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/Auth/logout');
    } catch (err) {
      console.error('Erro ao efetuar logout no servidor:', err);
    }
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('token'); // Limpar token legado
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* HEADER SUPERIOR */}
      <header className="top-header">
        <h1>Instituto Lucimário Caitano</h1>
        <div className="header-actions">
          <button className="global-logout-btn" onClick={() => setShowLogoutModal(true)}>
            <LogOut size={20} /> Sair
          </button>
        </div>
      </header>

      <div className="content-wrapper">
        {/* Modal de Logout */}
        {showLogoutModal && (
          <div className="modal-overlay" onClick={() => setShowLogoutModal(false)}>
            <div className="modal-content small" onClick={e => e.stopPropagation()}>
              <h2>Sair do Sistema</h2>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Tem certeza que deseja sair do Instituto LC?</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn btn-cancel" onClick={() => setShowLogoutModal(false)}>Cancelar</button>
                <button className="btn btn-danger" onClick={handleLogout}>Sair</button>
              </div>
            </div>
          </div>
        )}

        <aside className="sidebar">
          <nav className="sidebar-nav">
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/cadastro" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <UserPlus size={20} /> Cadastro
            </NavLink>
            <NavLink to="/consulta" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Users size={20} /> Consulta
            </NavLink>
            <NavLink to="/turmas" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <Users size={20} /> Turmas
            </NavLink>
            <NavLink to="/usuario" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <User size={20} /> Usuário
            </NavLink>
            <NavLink to="/import-export" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}>
              <FileDown size={20} /> Exportação/ Importação
            </NavLink>
          </nav>
        </aside>

        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
