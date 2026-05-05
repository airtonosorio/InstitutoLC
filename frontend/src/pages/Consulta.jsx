import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, X } from 'lucide-react';
import { format, differenceInYears, parseISO } from 'date-fns';
import api from '../api';
import './Consulta.css';

const atividadesMap = {
  0: 'Futebol de campo',
  1: 'Futsal',
  2: 'Futsal contraturno',
  3: 'Judô',
  4: 'Karatê',
  5: 'Jiu-jitsu',
  6: 'Ballet',
  7: 'Capoeira',
  8: 'Triathlon',
  9: 'Futebol Feminino',
  10: 'Orquestra de Música',
  11: 'Creche'
};

const turnosMap = {
  0: 'Matutino',
  1: 'Vespertino',
  2: 'Noturno',
  3: 'Integral'
};

const applyCpfMask = (val) => {
  let v = val.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return v;
};

const applyPhoneMask = (val) => {
  if (!val) return "";
  let v = val.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  v = v.replace(/^(\d{2})(\d)/g,"($1) $2");
  v = v.replace(/(\d)(\d{4})$/,"$1-$2");
  return v;
};

const atividadesConfig = [
  { id: 0, label: 'Futebol de campo', minMonths: 6 * 12, maxMonths: 17 * 12 + 11 },
  { id: 1, label: 'Futsal', minMonths: 6 * 12, maxMonths: 17 * 12 + 11 },
  { id: 2, label: 'Futsal contraturno', minMonths: 6 * 12, maxMonths: 17 * 12 + 11 },
  { id: 3, label: 'Judô', minMonths: 10 * 12, maxMonths: 17 * 12 + 11 },
  { id: 4, label: 'Karatê', minMonths: 5 * 12, maxMonths: 17 * 12 + 11 },
  { id: 5, label: 'Jiu-jitsu', minMonths: 5 * 12, maxMonths: 17 * 12 + 11 },
  { id: 6, label: 'Ballet', minMonths: 5 * 12, maxMonths: 17 * 12 + 11 },
  { id: 7, label: 'Capoeira', minMonths: 14 * 12, maxMonths: 17 * 12 + 11 },
  { id: 8, label: 'Triathlon', minMonths: 8 * 12, maxMonths: 17 * 12 + 11 },
  { id: 9, label: 'Futebol Feminino', minMonths: 6 * 12, maxMonths: 17 * 12 + 11 },
  { id: 10, label: 'Orquestra de Música', minMonths: 8 * 12, maxMonths: 17 * 12 + 11 },
  { id: 11, label: 'Creche', minMonths: 10, maxMonths: 3 * 12 + 11 },
];

export default function Consulta() {
  const [alunos, setAlunos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    atividade: '',
    idadeMin: '',
    idadeMax: '',
    dataInicio: '',
    dataFim: ''
  });

  const [selectedAluno, setSelectedAluno] = useState(null);
  const [alunoToDelete, setAlunoToDelete] = useState(null);
  const [alunoToEdit, setAlunoToEdit] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editError, setEditError] = useState('');
  const [editIdade, setEditIdade] = useState(null);

  const fetchAlunos = async () => {
    setLoading(true);
    try {
      const res = await api.get('/Alunos');
      setAlunos(res.data);
      setFiltered(res.data);
    } catch (err) {
      console.error("Erro ao buscar alunos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunos();
  }, []);

  useEffect(() => {
    let result = alunos;

    // Search by name or CPF
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(a => 
        a.nome.toLowerCase().includes(lower) || 
        a.cpf.includes(lower)
      );
    }

    // Filter by Atividade
    if (filters.atividade !== '') {
      const ativ = parseInt(filters.atividade);
      result = result.filter(a => a.atividade1 === ativ || a.atividade2 === ativ);
    }

    // Filter by Age
    if (filters.idadeMin || filters.idadeMax) {
      const today = new Date();
      result = result.filter(a => {
        const age = differenceInYears(today, parseISO(a.dataNascimento));
        const min = filters.idadeMin ? parseInt(filters.idadeMin) : 0;
        const max = filters.idadeMax ? parseInt(filters.idadeMax) : 999;
        return age >= min && age <= max;
      });
    }

    // Filter by Date (Cadastro)
    if (filters.dataInicio) {
      const start = new Date(filters.dataInicio);
      start.setHours(0,0,0,0);
      result = result.filter(a => new Date(a.dataCadastro) >= start);
    }
    if (filters.dataFim) {
      const end = new Date(filters.dataFim);
      end.setHours(23,59,59,999);
      result = result.filter(a => new Date(a.dataCadastro) <= end);
    }

    setFiltered(result);
  }, [searchTerm, filters, alunos]);

  const handleDelete = async () => {
    if (!alunoToDelete) return;
    try {
      await api.delete(`/Alunos/${alunoToDelete.id}`);
      setAlunos(alunos.filter(a => a.id !== alunoToDelete.id));
      setAlunoToDelete(null);
    } catch (err) {
      alert('Erro ao excluir aluno.');
    }
  };

  const calculateAge = (dob) => {
    if (!dob) return null;
    const today = new Date();
    const birthDate = new Date(dob);
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    
    return years * 12 + months;
  };

  const handleEditClick = (aluno) => {
    const dataNasc = aluno.dataNascimento ? aluno.dataNascimento.split('T')[0] : '';
    setEditForm({
      ...aluno,
      dataNascimento: dataNasc,
      atividade2: aluno.atividade2 === null ? '' : aluno.atividade2
    });
    setAlunoToEdit(aluno);
    setEditError('');
    setEditIdade(calculateAge(dataNasc));
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    let finalVal = value;
    if (name === 'cpf') finalVal = applyCpfMask(value);
    if (name === 'contato1' || name === 'contato2') finalVal = applyPhoneMask(value);
    setEditForm(prev => ({ ...prev, [name]: finalVal }));
    
    if (name === 'dataNascimento') {
      setEditIdade(calculateAge(value));
      setEditForm(prev => ({ ...prev, atividade1: '', atividade2: '' }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    if (editForm.atividade1 === '' || editForm.atividade1 === null) {
      setEditError('Atividade 1 é obrigatória.');
      return;
    }

    if (editForm.atividade1.toString() === editForm.atividade2?.toString() && editForm.atividade2 !== '') {
      setEditError('Atividade 1 e 2 não podem ser iguais.');
      return;
    }

    try {
      const payload = {
        ...editForm,
        tipoEscola: parseInt(editForm.tipoEscola),
        turno: parseInt(editForm.turno),
        numeroPessoasCasa: parseInt(editForm.numeroPessoasCasa),
        atividade1: parseInt(editForm.atividade1),
        atividade2: editForm.atividade2 === '' ? null : parseInt(editForm.atividade2)
      };

      await api.put(`/Alunos/${alunoToEdit.id}`, payload);
      fetchAlunos();
      setAlunoToEdit(null);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Erro ao editar aluno.');
    }
  };

  const getAge = (dob) => differenceInYears(new Date(), parseISO(dob));

  return (
    <div className="consulta-container">
      <h1 className="page-title">Consultar Alunos</h1>

      <div className="search-bar-container glass-panel">
        <div className="search-input-wrapper">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou CPF..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          className={`btn-filter ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={20} /> Filtros Avançados
        </button>
      </div>

      {showFilters && (
        <div className="advanced-filters glass-panel">
          <div className="filter-group">
            <label>Atividade</label>
            <select value={filters.atividade} onChange={e => setFilters({...filters, atividade: e.target.value})}>
              <option value="">Todas</option>
              <option value="0">Futebol de campo</option>
              <option value="1">Futsal</option>
              <option value="2">Futsal contraturno</option>
              <option value="3">Judô</option>
              <option value="4">Karatê</option>
              <option value="5">Jiu-jitsu</option>
              <option value="6">Ballet</option>
              <option value="7">Capoeira</option>
              <option value="8">Triathlon</option>
              <option value="9">Futebol Feminino</option>
              <option value="10">Orquestra de Música</option>
              <option value="11">Creche</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Idade Mín.</label>
            <input type="number" min="0" value={filters.idadeMin} onChange={e => setFilters({...filters, idadeMin: e.target.value})} />
          </div>
          <div className="filter-group">
            <label>Idade Máx.</label>
            <input type="number" min="0" value={filters.idadeMax} onChange={e => setFilters({...filters, idadeMax: e.target.value})} />
          </div>
          <div className="filter-group">
            <label>Data Cadastro (Início)</label>
            <input type="date" value={filters.dataInicio} onChange={e => setFilters({...filters, dataInicio: e.target.value})} />
          </div>
          <div className="filter-group">
            <label>Data Cadastro (Fim)</label>
            <input type="date" value={filters.dataFim} onChange={e => setFilters({...filters, dataFim: e.target.value})} />
          </div>
          <div className="filter-actions">
            <button className="btn btn-cancel" onClick={() => setFilters({atividade: '', idadeMin: '', idadeMax: '', dataInicio: '', dataFim: ''})}>
              Limpar
            </button>
          </div>
        </div>
      )}

      <div className="table-container glass-panel">
        {loading ? (
          <p className="loading-text">Carregando alunos...</p>
        ) : filtered.length === 0 ? (
          <p className="empty-text">Nenhum aluno encontrado.</p>
        ) : (
          <table className="alunos-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Idade</th>
                <th>Atividades</th>
                <th>Data Criação</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(aluno => (
                <tr key={aluno.id}>
                  <td className="font-medium">{aluno.nome}</td>
                  <td>{aluno.cpf}</td>
                  <td>{getAge(aluno.dataNascimento)} anos</td>
                  <td>
                    {atividadesMap[aluno.atividade1]} 
                    {aluno.atividade2 !== null ? ` / ${atividadesMap[aluno.atividade2]}` : ''}
                  </td>
                  <td>{format(parseISO(aluno.dataCadastro), 'dd/MM/yyyy')}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="action-buttons">
                      <button className="icon-btn btn-view" title="Ver Detalhes" onClick={() => setSelectedAluno(aluno)}>
                        <Eye size={18} />
                      </button>
                      <button className="icon-btn btn-edit" title="Editar" onClick={() => handleEditClick(aluno)}>
                        <Edit size={18} />
                      </button>
                      <button className="icon-btn btn-delete" title="Excluir" onClick={() => setAlunoToDelete(aluno)}>
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedAluno && (
        <div className="modal-overlay" onClick={() => setSelectedAluno(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes do Aluno</h2>
              <button className="close-btn" onClick={() => setSelectedAluno(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body details-grid">
              <div><strong>Nome:</strong> {selectedAluno.nome}</div>
              <div><strong>CPF:</strong> {selectedAluno.cpf}</div>
              <div><strong>Nascimento:</strong> {format(parseISO(selectedAluno.dataNascimento), 'dd/MM/yyyy')} ({getAge(selectedAluno.dataNascimento)} anos)</div>
              <div><strong>Cadastro:</strong> {format(parseISO(selectedAluno.dataCadastro), 'dd/MM/yyyy HH:mm')}</div>
              <div className="full-width"><strong>Endereço:</strong> {selectedAluno.endereco}, {selectedAluno.numeroEndereco} - {selectedAluno.bairro}, {selectedAluno.municipio} - {selectedAluno.estado}</div>
              <div><strong>Escola:</strong> {selectedAluno.escola} ({selectedAluno.tipoEscola === 0 ? 'Pública' : 'Privada'})</div>
              <div><strong>Série/Turno:</strong> {selectedAluno.serie} - {turnosMap[selectedAluno.turno]}</div>
              <div><strong>Pessoas na Casa:</strong> {selectedAluno.numeroPessoasCasa}</div>
              <div><strong>Contato 1:</strong> {selectedAluno.contato1}</div>
              {selectedAluno.contato2 && <div><strong>Contato 2:</strong> {selectedAluno.contato2}</div>}
              <div><strong>Atividade 1:</strong> {atividadesMap[selectedAluno.atividade1]}</div>
              {selectedAluno.atividade2 !== null && <div><strong>Atividade 2:</strong> {atividadesMap[selectedAluno.atividade2]}</div>}
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setSelectedAluno(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Exclusão */}
      {alunoToDelete && (
        <div className="modal-overlay" onClick={() => setAlunoToDelete(null)}>
          <div className="modal-content small" onClick={e => e.stopPropagation()}>
            <h2>Excluir Aluno</h2>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Deseja realmente excluir o aluno <strong>{alunoToDelete.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-cancel" onClick={() => setAlunoToDelete(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleDelete}>Excluir</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edição */}
      {alunoToEdit && (
        <div className="modal-overlay" onClick={() => setAlunoToEdit(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>Editar Aluno</h2>
              <button className="close-btn" onClick={() => setAlunoToEdit(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <form className="form-cadastro" onSubmit={handleEditSubmit} style={{ padding: 0, boxShadow: 'none', background: 'transparent' }}>
                <div className="form-section">
                  <h3>Dados Cadastrais</h3>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Nome Completo *</label>
                      <input type="text" name="nome" value={editForm.nome} onChange={handleEditChange} required maxLength="200" />
                    </div>
                    <div className="form-group">
                      <label>CPF *</label>
                      <input type="text" name="cpf" value={editForm.cpf} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                      <label>Data de Nascimento *</label>
                      <input type="date" name="dataNascimento" value={editForm.dataNascimento} onChange={handleEditChange} required />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Contato</h3>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Contato 1 (Celular) *</label>
                      <input type="text" name="contato1" value={editForm.contato1} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                      <label>Contato 2 (Opcional)</label>
                      <input type="text" name="contato2" value={editForm.contato2} onChange={handleEditChange} />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Endereço</h3>
                  <div className="grid-3">
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Rua/Avenida *</label>
                      <input type="text" name="endereco" value={editForm.endereco} onChange={handleEditChange} required maxLength="300" />
                    </div>
                    <div className="form-group">
                      <label>Número *</label>
                      <input type="text" name="numeroEndereco" value={editForm.numeroEndereco} onChange={handleEditChange} required maxLength="20" />
                    </div>
                    <div className="form-group">
                      <label>Bairro *</label>
                      <input type="text" name="bairro" value={editForm.bairro} onChange={handleEditChange} required maxLength="100" />
                    </div>
                    <div className="form-group">
                      <label>Município *</label>
                      <input type="text" name="municipio" value={editForm.municipio} onChange={handleEditChange} required maxLength="100" />
                    </div>
                    <div className="form-group">
                      <label>Estado (UF) *</label>
                      <input type="text" name="estado" value={editForm.estado} onChange={handleEditChange} required maxLength="2" />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Dados Escolares</h3>
                  <div className="grid-3">
                    <div className="form-group">
                      <label>Escola *</label>
                      <input type="text" name="escola" value={editForm.escola} onChange={handleEditChange} required maxLength="200" />
                    </div>
                    <div className="form-group">
                      <label>Tipo de Escola *</label>
                      <select name="tipoEscola" value={editForm.tipoEscola} onChange={handleEditChange} required>
                        <option value="0">Pública</option>
                        <option value="1">Privada</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Série *</label>
                      <input type="text" name="serie" value={editForm.serie} onChange={handleEditChange} required maxLength="50" />
                    </div>
                    <div className="form-group">
                      <label>Turno *</label>
                      <select name="turno" value={editForm.turno} onChange={handleEditChange} required>
                        <option value="0">Matutino</option>
                        <option value="1">Vespertino</option>
                        <option value="2">Noturno</option>
                        <option value="3">Integral</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Nº de Pessoas na Casa *</label>
                      <input type="number" name="numeroPessoasCasa" value={editForm.numeroPessoasCasa} onChange={handleEditChange} required min="1" max="50" />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Atividades da ONG</h3>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Atividade 1 (Obrigatória) *</label>
                      <select name="atividade1" value={editForm.atividade1} onChange={handleEditChange} required disabled={editIdade === null}>
                        <option value="">{editIdade !== null ? 'Selecione uma atividade' : 'Preencha a data de nascimento'}</option>
                        {editIdade !== null && atividadesConfig.filter(a => editIdade >= a.minMonths && editIdade <= a.maxMonths).map(a => (
                          <option key={a.id} value={a.id}>{a.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Atividade 2 (Opcional)</label>
                      <select name="atividade2" value={editForm.atividade2} onChange={handleEditChange} disabled={editIdade === null}>
                        <option value="">Nenhuma / Opcional</option>
                        {editIdade !== null && atividadesConfig.filter(a => editIdade >= a.minMonths && editIdade <= a.maxMonths).map(a => (
                          <option key={a.id} value={a.id}>{a.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {editError && (
                  <div className="form-message error" style={{ marginBottom: '1rem' }}>
                    {editError}
                  </div>
                )}

                <div className="modal-footer">
                  <button type="button" className="btn btn-cancel" onClick={() => setAlunoToEdit(null)}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" style={{ marginLeft: '1rem' }}>Salvar Alterações</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
