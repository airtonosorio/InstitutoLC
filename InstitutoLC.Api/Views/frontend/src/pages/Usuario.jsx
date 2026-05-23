import { useState, useEffect } from 'react';
import { User, Lock, Activity, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../api';
import './Usuario.css';

export default function Usuario() {
  const [currentUsername, setCurrentUsername] = useState('');
  
  // State para alteração de nome de usuário
  const [newUsername, setNewUsername] = useState('');
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState('');
  const [userSuccess, setUserSuccess] = useState('');

  // State para alteração de senha
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // State para gerenciamento de atividades
  const [atividades, setAtividades] = useState([]);
  const [nomeAtividade, setNomeAtividade] = useState('');
  const [minIdade, setMinIdade] = useState('');
  const [maxIdade, setMaxIdade] = useState('');
  const [ativLoading, setAtivLoading] = useState(false);
  const [ativError, setAtivError] = useState('');
  const [ativSuccess, setAtivSuccess] = useState('');

  useEffect(() => {
    const savedUser = localStorage.getItem('username') || 'admin';
    setCurrentUsername(savedUser);
    fetchAtividades();
  }, []);

  const fetchAtividades = async () => {
    try {
      const res = await api.get('/Atividades');
      setAtividades(res.data);
    } catch (err) {
      console.error('Erro ao carregar atividades:', err);
    }
  };

  const handleChangeUsername = async (e) => {
    e.preventDefault();
    setUserError('');
    setUserSuccess('');

    if (newUsername.trim() === currentUsername) {
      setUserError('O novo nome de usuário deve ser diferente do atual.');
      return;
    }

    setUserLoading(true);

    try {
      const res = await api.post('/Auth/change-username', { newUsername });
      const updatedUsername = res.data.username;
      localStorage.setItem('username', updatedUsername);
      setCurrentUsername(updatedUsername);
      setNewUsername('');
      setUserSuccess('Nome de usuário alterado com sucesso!');
    } catch (err) {
      setUserError(err.response?.data?.message || 'Erro ao alterar nome de usuário.');
    } finally {
      setUserLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword !== confirmPassword) {
      setPassError('A nova senha e a confirmação não coincidem.');
      return;
    }

    setPassLoading(true);

    try {
      await api.post('/Auth/change-password', { oldPassword, newPassword });
      setPassSuccess('Senha alterada com sucesso!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPassError(err.response?.data?.message || 'Erro ao alterar a senha.');
    } finally {
      setPassLoading(false);
    }
  };

  const handleAddAtividade = async (e) => {
    e.preventDefault();
    setAtivError('');
    setAtivSuccess('');

    if (parseInt(minIdade) > parseInt(maxIdade)) {
      setAtivError('A idade mínima não pode ser maior que a idade máxima.');
      return;
    }

    setAtivLoading(true);

    try {
      const newAtiv = {
        nome: nomeAtividade,
        minIdade: parseInt(minIdade),
        maxIdade: parseInt(maxIdade)
      };
      await api.post('/Atividades', newAtiv);
      setAtivSuccess('Atividade adicionada com sucesso!');
      setNomeAtividade('');
      setMinIdade('');
      setMaxIdade('');
      fetchAtividades();
    } catch (err) {
      setAtivError(err.response?.data?.message || 'Erro ao adicionar atividade.');
    } finally {
      setAtivLoading(false);
    }
  };

  const handleRemoveAtividade = async (id) => {
    if (!window.confirm('Tem certeza que deseja remover esta atividade? Alunos associados a ela podem ficar sem atividade.')) {
      return;
    }

    try {
      await api.delete(`/Atividades/${id}`);
      setAtividades(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      alert('Erro ao remover atividade.');
    }
  };

  return (
    <div className="usuario-container">
      <h1 className="page-title">Configurações do Usuário</h1>
      
      <div className="usuario-grids">
        {/* Card de Nome de Usuário */}
        <div className="usuario-card glass-panel">
          <div className="card-header">
            <User size={24} className="usuario-card-icon" />
            <h2>Alterar Nome de Usuário</h2>
          </div>
          <p className="card-desc">Modifique o nome de usuário utilizado para acessar o painel administrativo.</p>
          
          <form onSubmit={handleChangeUsername} className="usuario-form">
            <div className="form-group-info">
              <span className="info-label">Nome de Usuário Atual:</span>
              <span className="info-value">{currentUsername}</span>
            </div>
            
            <div className="form-group">
              <label>Novo Nome de Usuário</label>
              <input 
                type="text" 
                placeholder="Digite o novo usuário" 
                value={newUsername} 
                onChange={e => setNewUsername(e.target.value)} 
                required 
              />
            </div>

            {userError && <div className="error-msg"><AlertCircle size={16} /> {userError}</div>}
            {userSuccess && <div className="success-msg"><CheckCircle2 size={16} /> {userSuccess}</div>}

            <button type="submit" className="btn btn-primary" disabled={userLoading}>
              {userLoading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </form>
        </div>

        {/* Card de Senha */}
        <div className="usuario-card glass-panel">
          <div className="card-header">
            <Lock size={24} className="usuario-card-icon" />
            <h2>Alterar Senha de Acesso</h2>
          </div>
          <p className="card-desc">Mantenha a segurança do sistema atualizando a senha regularmente.</p>
          
          <form onSubmit={handleChangePassword} className="usuario-form">
            <div className="form-group">
              <label>Senha Atual</label>
              <input 
                type="password" 
                placeholder="Digite sua senha atual" 
                value={oldPassword} 
                onChange={e => setOldPassword(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Nova Senha</label>
              <input 
                type="password" 
                placeholder="Mínimo 6 caracteres" 
                value={newPassword} 
                onChange={e => setNewPassword(e.target.value)} 
                required 
              />
            </div>
            
            <div className="form-group">
              <label>Confirmar Nova Senha</label>
              <input 
                type="password" 
                placeholder="Repita a nova senha" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                required 
              />
            </div>

            {passError && <div className="error-msg"><AlertCircle size={16} /> {passError}</div>}
            {passSuccess && <div className="success-msg"><CheckCircle2 size={16} /> {passSuccess}</div>}

            <button type="submit" className="btn btn-primary" disabled={passLoading}>
              {passLoading ? 'Alterando...' : 'Alterar Senha'}
            </button>
          </form>
        </div>

        {/* Card de Atividades */}
        <div className="usuario-card glass-panel" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <Activity size={24} className="usuario-card-icon" />
            <h2>Gerenciamento de Atividades</h2>
          </div>
          <p className="card-desc">Cadastre novas atividades e gerencie a lista de opções disponíveis no sistema.</p>
          
          <div className="atividades-management-layout">
            {/* Lista de Atividades */}
            <div className="atividades-list-section">
              <h3>Atividades Atuais</h3>
              <div className="atividades-scroll-container">
                {atividades.length === 0 ? (
                  <p className="empty-atividades-msg">Nenhuma atividade cadastrada.</p>
                ) : (
                  <ul className="ativ-list-items">
                    {atividades.map(ativ => (
                      <li key={ativ.id} className="ativ-list-item">
                        <div className="ativ-item-info">
                          <span className="ativ-name">{ativ.nome}</span>
                          <span className="ativ-ages">Idades: {ativ.minIdade} a {ativ.maxIdade} anos</span>
                        </div>
                        <button 
                          className="btn-remove-ativ" 
                          onClick={() => handleRemoveAtividade(ativ.id)}
                          title="Remover Atividade"
                        >
                          <Trash2 size={18} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Formulário de Adicionar Atividade */}
            <div className="atividades-form-section">
              <h3>Adicionar Atividade</h3>
              <form onSubmit={handleAddAtividade} className="usuario-form">
                <div className="form-group">
                  <label>Nome da Atividade</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Natação, Xadrez, Teatro" 
                    value={nomeAtividade} 
                    onChange={e => setNomeAtividade(e.target.value)} 
                    required 
                  />
                </div>
                
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Idade Mínima</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      placeholder="Min" 
                      value={minIdade} 
                      onChange={e => setMinIdade(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Idade Máxima</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      placeholder="Máx" 
                      value={maxIdade} 
                      onChange={e => setMaxIdade(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                {ativError && <div className="error-msg"><AlertCircle size={16} /> {ativError}</div>}
                {ativSuccess && <div className="success-msg"><CheckCircle2 size={16} /> {ativSuccess}</div>}

                <button type="submit" className="btn btn-primary" disabled={ativLoading} style={{ marginTop: '0.5rem' }}>
                  {ativLoading ? 'Adicionando...' : 'Adicionar Atividade'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
