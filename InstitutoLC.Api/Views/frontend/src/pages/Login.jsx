import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import logoImg from '../assets/image.png';
import './Login.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await api.post('/Auth/login', { username, password });
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('username', res.data.username);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Usuário ou senha incorretos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container glass-panel">
        <div className="header">
          <img src={logoImg} alt="Instituto LC Logo" className="logo" />
          <h1>Instituto LC</h1>
          <p className="subtitle">Faça login para acessar o sistema</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Usuário</label>
            <input type="text" placeholder="Digite seu usuário" value={username} onChange={e => setUsername(e.target.value)} required autoFocus />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input type="password" placeholder="Digite sua senha" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? 'Autenticando...' : 'Entrar'}
          </button>
          {errorMsg && <div className="error-message">{errorMsg}</div>}
        </form>
      </div>
    </div>
  );
}
