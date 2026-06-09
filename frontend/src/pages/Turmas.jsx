import { useState, useEffect } from 'react';
import api from '../api';
import './Cadastro.css'; // reaproveitando os estilos de formulários e grid
import './Turmas.css';


const getAge = (dobString) => {
  if (!dobString) return 0;
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const defaultFormData = {
  nome: '',
  limiteAlunos: 20,
  atividade: 1,
  dataInicio: '',
  dataFim: '',
  statusAtiva: true,
  idadeMinima: 6,
  idadeMaxima: 17,
  horaInicio: '',
  horaFim: ''
};

export default function Turmas() {
  const [turmas, setTurmas] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedTurma, setSelectedTurma] = useState(null); // Para o modal de visualização
  
  const [allAlunos, setAllAlunos] = useState([]);
  const [matriculados, setMatriculados] = useState([]);
  const [savingAlunos, setSavingAlunos] = useState(false);
  const [atividadesList, setAtividadesList] = useState([]);

  const atividadesMap = {};
  atividadesList.forEach(a => {
    atividadesMap[a.id] = a.nome;
  });

  const [formData, setFormData] = useState(defaultFormData);
  const [editingTurmaId, setEditingTurmaId] = useState(null);

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    try {
      setLoading(true);
      const [resTurmas, resAtiv] = await Promise.all([
        api.get('/turmas'),
        api.get('/Atividades')
      ]);
      setTurmas(resTurmas.data);
      setAtividadesList(resAtiv.data);
      
      // Defina a primeira atividade como padrão caso seja a primeira carga ou padrão
      if (resAtiv.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          atividade: prev.atividade === 1 ? resAtiv.data[0].id : prev.atividade
        }));
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao buscar turmas.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleForm = () => {
    if (showForm) {
      setFormData(defaultFormData);
      setEditingTurmaId(null);
      setShowForm(false);
    } else {
      setFormData(defaultFormData);
      setEditingTurmaId(null);
      setShowForm(true);
    }
  };

  const startEdit = (turma) => {
    const dateInicio = turma.dataInicio ? turma.dataInicio.split('T')[0] : '';
    const dateFim = turma.dataFim ? turma.dataFim.split('T')[0] : '';
    
    setFormData({
      nome: turma.nome,
      limiteAlunos: turma.limiteAlunos,
      atividade: turma.atividade,
      dataInicio: dateInicio,
      dataFim: dateFim,
      statusAtiva: turma.statusAtiva,
      idadeMinima: turma.idadeMinima,
      idadeMaxima: turma.idadeMaxima,
      horaInicio: turma.horario?.horaInicio || '',
      horaFim: turma.horario?.horaFim || '',
      horarioId: turma.horarioId
    });
    setEditingTurmaId(turma.id);
    setShowForm(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/turmas/${editingTurmaId}`, formData);
      alert('Turma atualizada com sucesso!');
      setFormData({
        ...defaultFormData,
        atividade: atividadesList[0]?.id || 1
      });
      setEditingTurmaId(null);
      setShowForm(false);
      fetchDados();
    } catch (err) {
      console.error(err);
      alert('Erro ao atualizar turma.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/turmas', formData);
      alert('Turma criada com sucesso!');
      setFormData({
        ...defaultFormData,
        atividade: atividadesList[0]?.id || 1
      });
      setEditingTurmaId(null);
      setShowForm(false);
      fetchDados();
    } catch (err) {
      console.error(err);
      alert('Erro ao criar turma.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta turma?')) return;
    try {
      await api.delete(`/turmas/${id}`);
      fetchDados();
    } catch (err) {
      console.error(err);
      alert('Erro ao excluir turma.');
    }
  };

  const openTurmaDetails = async (id) => {
    try {
      const [resTurma, resAlunos] = await Promise.all([
        api.get(`/turmas/${id}`),
        api.get('/Alunos')
      ]);
      setSelectedTurma(resTurma.data);
      setMatriculados(resTurma.data.alunos || []);
      setAllAlunos(resAlunos.data || []);
    } catch (err) {
      console.error(err);
      alert('Erro ao carregar detalhes da turma/alunos.');
    }
  };

  const handleMatricular = (aluno) => {
    if (matriculados.length >= selectedTurma.turma.limiteAlunos) {
      alert(`Limite de vagas atingido! Esta turma aceita no máximo ${selectedTurma.turma.limiteAlunos} alunos.`);
      return;
    }
    setMatriculados([...matriculados, aluno]);
  };

  const handleDesmatricular = (aluno) => {
    setMatriculados(matriculados.filter(m => m.id !== aluno.id));
  };

  const handleSaveMatriculas = async () => {
    try {
      setSavingAlunos(true);
      const studentIds = matriculados.map(m => m.id);
      await api.put(`/turmas/${selectedTurma.turma.id}/alunos`, studentIds);
      alert('Matrículas atualizadas com sucesso!');
      
      // Update selectedTurma totalAlunos
      setSelectedTurma(prev => ({
        ...prev,
        turma: {
          ...prev.turma,
          totalAlunos: studentIds.length
        }
      }));
      
      // Refresh the main page list
      fetchDados();
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.message || 'Erro ao salvar matrículas.';
      alert(errMsg);
    } finally {
      setSavingAlunos(false);
    }
  };

  // Candidatos filtrados por atividade, idade e não matriculados
  const candidatos = selectedTurma ? allAlunos.filter(aluno => {
    // Não pode estar matriculado
    if (matriculados.some(m => m.id === aluno.id)) return false;
    
    // Deve bater com a atividade
    const matchAtividade = 
      aluno.atividade1 === selectedTurma.turma.atividade || 
      aluno.atividade2 === selectedTurma.turma.atividade;
    if (!matchAtividade) return false;
    
    // Deve bater com a faixa etária
    const age = getAge(aluno.dataNascimento);
    return age >= selectedTurma.turma.idadeMinima && age <= selectedTurma.turma.idadeMaxima;
  }) : [];

  if (loading) return <div className="loading">Carregando turmas...</div>;

  return (
    <div className="turmas-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Gerenciamento de Turmas</h1>
        <button className="btn btn-primary" onClick={handleToggleForm}>
          {showForm ? 'Voltar' : 'Criar Turma'}
        </button>
      </div>

      {showForm ? (
        <form className="glass-panel form-cadastro" onSubmit={editingTurmaId ? handleUpdate : handleCreate}>
          <div className="form-section" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
            <h3>{editingTurmaId ? 'Editar Turma' : 'Dados da Turma'}</h3>
            <div className="grid-3">
              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label>Nome da Turma *</label>
                <input 
                  type="text" 
                  value={formData.nome} 
                  onChange={e => setFormData({...formData, nome: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Limite de Alunos *</label>
                <input 
                  type="number" 
                  value={formData.limiteAlunos} 
                  onChange={e => setFormData({...formData, limiteAlunos: parseInt(e.target.value)})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Atividade *</label>
                <select value={formData.atividade} onChange={e => setFormData({...formData, atividade: parseInt(e.target.value)})}>
                  {atividadesList.map(ativ => (
                    <option key={ativ.id} value={ativ.id}>{ativ.nome}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Data Início *</label>
                <input 
                  type="date" 
                  value={formData.dataInicio} 
                  onChange={e => setFormData({...formData, dataInicio: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Data Fim *</label>
                <input 
                  type="date" 
                  value={formData.dataFim} 
                  onChange={e => setFormData({...formData, dataFim: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Idade Mínima *</label>
                <input 
                  type="number" 
                  value={formData.idadeMinima} 
                  onChange={e => setFormData({...formData, idadeMinima: parseInt(e.target.value)})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Idade Máxima *</label>
                <input 
                  type="number" 
                  value={formData.idadeMaxima} 
                  onChange={e => setFormData({...formData, idadeMaxima: parseInt(e.target.value)})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Hora de Início *</label>
                <input 
                  type="time" 
                  value={formData.horaInicio} 
                  onChange={e => setFormData({...formData, horaInicio: e.target.value})} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Hora de Fim *</label>
                <input 
                  type="time" 
                  value={formData.horaFim} 
                  onChange={e => setFormData({...formData, horaFim: e.target.value})} 
                  required 
                />
              </div>
            </div>
            
            <div className="form-group toggle-switch-group">
              <label className="toggle-switch-label">Status da Turma</label>
              <div className="toggle-switch-wrapper">
                <span className={`toggle-text ${!formData.statusAtiva ? 'active-status' : ''}`}>Turma Inativa</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={formData.statusAtiva} 
                    onChange={e => setFormData({...formData, statusAtiva: e.target.checked})} 
                  />
                  <span className="slider round"></span>
                </label>
                <span className={`toggle-text ${formData.statusAtiva ? 'active-status' : ''}`}>Turma Ativa</span>
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ justifyContent: 'center', marginTop: '2rem' }}>
            <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 2rem', fontSize: '1rem', width: 'auto', display: 'inline-block' }}>
              {editingTurmaId ? 'Salvar Alterações' : 'Salvar Turma'}
            </button>
          </div>
        </form>
      ) : (
        <div className="turmas-grid">
          {turmas.map(t => (
            <div key={t.id} className={`turma-card ${!t.statusAtiva ? 'inativa' : ''}`} onClick={() => openTurmaDetails(t.id)}>
              <div className="turma-header">
                <h3>{t.nome}</h3>
                <span className={`status-badge ${t.statusAtiva ? 'ativo' : 'inativo'}`}>
                  {t.statusAtiva ? 'Ativa' : 'Inativa'}
                </span>
              </div>
              <div className="turma-body">
                <p><strong>Atividade:</strong> {atividadesMap[t.atividade] || 'Nenhuma'}</p>
                <p><strong>Horário:</strong> {t.horario?.horaInicio} às {t.horario?.horaFim}</p>
                <p><strong>Faixa Etária:</strong> {t.idadeMinima} a {t.idadeMaxima} anos</p>
                <p><strong>Vagas:</strong> {t.totalAlunos} / {t.limiteAlunos}</p>
              </div>
              <div className="turma-actions">
                <button className="btn-icon btn-edit" onClick={(e) => { e.stopPropagation(); startEdit(t); }}>
                  Editar
                </button>
                <button className="btn-icon btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}>
                  Excluir
                </button>
              </div>
            </div>
          ))}
          {turmas.length === 0 && <p>Nenhuma turma cadastrada. Crie uma nova turma.</p>}
        </div>
      )}

      {selectedTurma && (
        <div className="modal-overlay" onClick={() => setSelectedTurma(null)}>
          <div className="modal-content large" onClick={e => e.stopPropagation()} style={{ maxWidth: '1000px', width: '95%' }}>
            <div className="modal-header">
              <h2>Detalhes da Turma: {selectedTurma.turma.nome}</h2>
              <button className="close-btn" onClick={() => setSelectedTurma(null)}>&times;</button>
            </div>
            
            <div className="modal-body">
              <div className="turma-info-panel">
                <p><strong>Atividade:</strong> {atividadesMap[selectedTurma.turma.atividade] || 'Nenhuma'}</p>
                <p><strong>Status:</strong> <span className={`status-badge ${selectedTurma.turma.statusAtiva ? 'ativo' : 'inativo'}`}>{selectedTurma.turma.statusAtiva ? 'Ativa' : 'Inativa'}</span></p>
                <p><strong>Faixa Etária:</strong> {selectedTurma.turma.idadeMinima} a {selectedTurma.turma.idadeMaxima} anos</p>
                <p><strong>Período:</strong> {new Date(selectedTurma.turma.dataInicio).toLocaleDateString()} a {new Date(selectedTurma.turma.dataFim).toLocaleDateString()}</p>
                <p><strong>Horário:</strong> {selectedTurma.turma.horario?.horaInicio} às {selectedTurma.turma.horario?.horaFim}</p>
                <p><strong>Vagas Preenchidas:</strong> {matriculados.length} de {selectedTurma.turma.limiteAlunos}</p>
              </div>

              <div className="enturmacao-container">
                <div className="enturmacao-column candidates-column">
                  <h3>Alunos Candidatos ({candidatos.length})</h3>
                  <div className="alunos-list-scroll">
                    {candidatos.length === 0 ? (
                      <p className="empty-list-text">Nenhum candidato elegível encontrado.</p>
                    ) : (
                      candidatos.map(aluno => (
                        <div 
                          key={aluno.id} 
                          className="aluno-list-item candidate-item"
                          onClick={() => handleMatricular(aluno)}
                        >
                          <div className="aluno-info-row">
                            <span className="aluno-name">{aluno.nome}</span>
                            <span className="aluno-meta">{getAge(aluno.dataNascimento)} anos</span>
                          </div>
                          <div className="aluno-sub-row">
                            <span>Deseja: {atividadesMap[aluno.atividade1]}{aluno.atividade2 ? `, ${atividadesMap[aluno.atividade2]}` : ''}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="enturmacao-column matriculados-column">
                  <h3>Alunos Matriculados ({matriculados.length} / {selectedTurma.turma.limiteAlunos})</h3>
                  <div className="alunos-list-scroll">
                    {matriculados.length === 0 ? (
                      <p className="empty-list-text">Nenhum aluno matriculado nesta turma.</p>
                    ) : (
                      matriculados.map(aluno => (
                        <div 
                          key={aluno.id} 
                          className="aluno-list-item matriculado-item"
                          onClick={() => handleDesmatricular(aluno)}
                        >
                          <div className="aluno-info-row">
                            <span className="aluno-name">{aluno.nome}</span>
                            <span className="aluno-meta">{getAge(aluno.dataNascimento)} anos</span>
                          </div>
                          <div className="aluno-sub-row">
                            <span>CPF: {aluno.cpf}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer" style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
              <button className="btn btn-cancel" onClick={() => setSelectedTurma(null)} disabled={savingAlunos}>
                Fechar
              </button>
              <button className="btn btn-primary" onClick={handleSaveMatriculas} disabled={savingAlunos}>
                {savingAlunos ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
