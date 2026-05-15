import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, UserPlus, Users, FileDown, LogOut } from 'lucide-react';
import logoImg from '../assets/image.png';
import './Layout.css';

export default function Layout() {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="layout">
      {/* HEADER SUPERIOR (Semelhante ao Portal FB UNI da imagem) */}
      <header className="top-header">
        <h1>Portal Instituto LC</h1>
        <button className="global-logout-btn" onClick={() => setShowLogoutModal(true)}>
          <LogOut size={20} /> Sair
        </button>
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
          <div className="sidebar-header">
            <img src={logoImg} alt="Logo" className="sidebar-logo" />
            <h2>Instituto LC</h2>
          </div>
          <nav className="sidebar-nav">
            <NavLink to="/dashboard" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <LayoutDashboard size={20} /> Dashboard
            </NavLink>
            <NavLink to="/cadastro" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <UserPlus size={20} /> Cadastro
            </NavLink>
            <NavLink to="/consulta" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <Users size={20} /> Consulta
            </NavLink>
            <NavLink to="/import-export" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
              <FileDown size={20} /> Exportar / Excel
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
