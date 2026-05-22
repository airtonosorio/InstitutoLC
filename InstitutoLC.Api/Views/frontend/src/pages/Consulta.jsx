import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Edit, Trash2, X } from 'lucide-react';
import { format, differenceInYears, parseISO } from 'date-fns';
import api from '../api';
import './Consulta.css';

const atividadesMap = {
  1: 'Futebol de campo',
  2: 'Futsal',
  3: 'Futsal contraturno',
  4: 'Judô',
  5: 'Karatê',
  6: 'Jiu-jitsu',
  7: 'Ballet',
  8: 'Capoeira',
  9: 'Triathlon',
  10: 'Futebol Feminino',
  11: 'Orquestra de Música',
  12: 'Creche'
};

const generosMap = {
  1: 'Masculino',
  2: 'Feminino',
  3: 'Outro',
  4: 'Prefiro não dizer'
};

const corRacaMap = {
  1: 'Branco',
  2: 'Preto',
  3: 'Pardo',
  4: 'Amarelo',
  5: 'Indígena',
  6: 'Não Informado'
};

const zonaMoradiaMap = {
  1: 'Urbana',
  2: 'Rural'
};

const tipoMoradiaMap = {
  1: 'Própria',
  2: 'Alugada',
  3: 'Cedida',
  4: 'Outro'
};

const responsavelTransporteMap = {
  1: 'Mãe',
  2: 'Pai',
  3: 'Sozinho',
  4: 'Outro (Membro da Família)',
  5: 'Outro (Não Membro)'
};

const meioTransporteMap = {
  1: 'Andando',
  2: 'Ônibus',
  3: 'Veículo Particular',
  4: 'Bicicleta'
};

const tipoEscolaMap = {
  0: 'Pública',
  1: 'Privada'
};

const turnosMap = {
  0: 'Matutino',
  1: 'Vespertino',
  2: 'Noturno',
  3: 'Integral'
};

const ATIVIDADES = [
  { id: 1, nome: "Futebol de campo (06 a 17 anos)", minIdade: 6, maxIdade: 17 },
  { id: 2, nome: "Futsal (06 a 17 anos)", minIdade: 6, maxIdade: 17 },
  { id: 3, nome: "Futsal contraturno (06 a 17 anos)", minIdade: 6, maxIdade: 17 },
  { id: 4, nome: "Judô (10 a 17 anos)", minIdade: 10, maxIdade: 17 },
  { id: 5, nome: "Karatê (05 a 17 anos)", minIdade: 5, maxIdade: 17 },
  { id: 6, nome: "Jiu-jitsu (05 a 17 anos)", minIdade: 5, maxIdade: 17 },
  { id: 7, nome: "Ballet (05 a 17 anos)", minIdade: 5, maxIdade: 17 },
  { id: 8, nome: "Capoeira (14 a 17 anos)", minIdade: 14, maxIdade: 17 },
  { id: 9, nome: "Triathlon (08 a 17 anos)", minIdade: 8, maxIdade: 17 },
  { id: 10, nome: "Futebol Feminino (06 a 17 anos)", minIdade: 6, maxIdade: 17 },
  { id: 11, nome: "Orquestra de Música (08 a 17 anos)", minIdade: 8, maxIdade: 17 },
  { id: 12, nome: "Creche (10 meses a 3 anos)", minIdade: 0.83, maxIdade: 3 }
];

const filterAtividadesPorIdade = (idade) => {
  if (!idade) return [];
  const { years, totalMonths } = idade;
  return ATIVIDADES.filter(ativ => {
    if (ativ.id === 12) { // Creche (10 meses a 3 anos)
      return totalMonths >= 10 && years <= 3;
    } else {
      return years >= ativ.minIdade && years <= ativ.maxIdade;
    }
  });
};

const applyCpfMask = (val) => {
  let v = val.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return v;
};

const applyRgMask = (val) => {
  let clean = val.replace(/[^\dxX]/g, '');
  if (clean.length > 9) {
    clean = clean.slice(0, 9);
  }
  
  if (clean.length > 0) {
    const body = clean.slice(0, -1).replace(/[^\d]/g, '');
    const lastChar = clean.slice(-1);
    if (lastChar.match(/[xX]/)) {
      clean = body + lastChar.toUpperCase();
    } else if (lastChar.match(/\d/)) {
      clean = body + lastChar;
    } else {
      clean = body;
    }
  }

  let formatted = clean;
  if (clean.length > 2) {
    formatted = clean.slice(0, 2) + '.' + clean.slice(2);
  }
  if (clean.length > 5) {
    formatted = formatted.slice(0, 6) + '.' + formatted.slice(6);
  }
  if (clean.length > 8) {
    formatted = formatted.slice(0, 10) + '-' + formatted.slice(10);
  }
  return formatted;
};

const applyPhoneMask = (val) => {
  if (!val) return "";
  let v = val.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  v = v.replace(/^(\d{2})(\d)/g,"($1) $2");
  v = v.replace(/(\d)(\d{4})$/,"$1-$2");
  return v;
};

export default function Consulta() {
  const [alunos, setAlunos] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
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
  const [editAnamnese, setEditAnamnese] = useState({
    bronquiteAsma: false,
    doencaCardiovascular: false,
    epilepsia: false,
    convulsoes: false,
    diabetes: false,
    problemasAuditivos: false,
    alergia: false,
    problemasOculares: false,
    problemasOrtopedicos: false,
    medicamentoTexto: '',
    cirurgiaTexto: '',
    outroCheckbox: false,
    outroTexto: ''
  });

  const handleEditAnamneseChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalVal = type === 'checkbox' ? checked : value;
    setEditAnamnese(prev => ({ ...prev, [name]: finalVal }));
  };

  const [todasTurmas, setTodasTurmas] = useState([]);

  const fetchAlunosETurmas = async () => {
    setLoading(true);
    try {
      const [resAlunos, resTurmas] = await Promise.all([
        api.get('/Alunos'),
        api.get('/turmas')
      ]);
      setAlunos(resAlunos.data);
      setFiltered(resAlunos.data);
      setTodasTurmas(resTurmas.data);
    } catch (err) {
      console.error("Erro ao buscar dados", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlunosETurmas();
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

  const calculateEditAge = (dob) => {
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

    let display;
    if (years === 0) {
      display = `${months} meses`;
    } else {
      display = `${years} ano${years > 1 ? 's' : ''}${months > 0 ? ` e ${months} me${months > 1 ? 'ses' : 's'}` : ''}`;
    }
    const totalMonths = years * 12 + months;
    return { years, months, totalMonths, display };
  };

  const handleEditClick = (aluno) => {
    const dataNasc = aluno.dataNascimento ? aluno.dataNascimento.split('T')[0] : '';
    setEditForm({
      ...aluno,
      dataNascimento: dataNasc,
      genero: String(aluno.genero),
      corRaca: String(aluno.corRaca),
      zonaMoradia: String(aluno.zonaMoradia),
      tipoMoradia: String(aluno.tipoMoradia),
      responsavelTransporte: String(aluno.responsavelTransporte),
      meioTransporte: String(aluno.meioTransporte),
      tipoEscola: String(aluno.tipoEscola),
      turno: String(aluno.turno),
      atividade1: aluno.atividade1 ? String(aluno.atividade1) : '',
      atividade2: aluno.atividade2 ? String(aluno.atividade2) : '',
      recebeBeneficio: !!aluno.recebeBeneficio
    });
    setAlunoToEdit(aluno);
    setEditError('');
    setEditIdade(calculateEditAge(dataNasc));

    const initialAnamnese = {
      bronquiteAsma: false,
      doencaCardiovascular: false,
      epilepsia: false,
      convulsoes: false,
      diabetes: false,
      problemasAuditivos: false,
      alergia: false,
      problemasOculares: false,
      problemasOrtopedicos: false,
      medicamentoTexto: '',
      cirurgiaTexto: '',
      outroCheckbox: false,
      outroTexto: ''
    };

    if (aluno.anamnese && aluno.anamnese.enfermidades) {
      aluno.anamnese.enfermidades.forEach(e => {
        if (e.tipoEnfermidade === 1) initialAnamnese.bronquiteAsma = true;
        if (e.tipoEnfermidade === 2) initialAnamnese.doencaCardiovascular = true;
        if (e.tipoEnfermidade === 3) {
          if (e.descricao === 'Epilepsia') initialAnamnese.epilepsia = true;
          if (e.descricao === 'Convulsões') initialAnamnese.convulsoes = true;
          if (!e.descricao || e.descricao.toLowerCase().includes('epilepsia')) initialAnamnese.epilepsia = true;
          if (e.descricao && e.descricao.toLowerCase().includes('convuls')) initialAnamnese.convulsoes = true;
        }
        if (e.tipoEnfermidade === 4) initialAnamnese.diabetes = true;
        if (e.tipoEnfermidade === 5) initialAnamnese.problemasAuditivos = true;
        if (e.tipoEnfermidade === 6) initialAnamnese.problemasOculares = true;
        if (e.tipoEnfermidade === 7) initialAnamnese.problemasOrtopedicos = true;
        if (e.tipoEnfermidade === 8) initialAnamnese.alergia = true;
        if (e.tipoEnfermidade === 9) {
          if (e.descricao.startsWith('Medicamento: ')) {
            initialAnamnese.medicamentoTexto = e.descricao.replace('Medicamento: ', '');
          } else if (e.descricao.startsWith('Cirurgia: ')) {
            initialAnamnese.cirurgiaTexto = e.descricao.replace('Cirurgia: ', '');
          } else if (e.descricao.startsWith('Outro: ')) {
            initialAnamnese.outroCheckbox = true;
            initialAnamnese.outroTexto = e.descricao.replace('Outro: ', '');
          } else {
            initialAnamnese.outroCheckbox = true;
            initialAnamnese.outroTexto = e.descricao;
          }
        }
      });
    }
    setEditAnamnese(initialAnamnese);
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalVal = type === 'checkbox' ? checked : value;

    if (name === 'cpf') finalVal = applyCpfMask(value);
    if (name === 'rg') finalVal = applyRgMask(value);
    if (name === 'contato1' || name === 'contato2') finalVal = applyPhoneMask(value);

    // Se limpar a atividade principal, também limpa a secundária
    if (name === 'atividade1' && !value) {
      setEditForm(prev => ({ ...prev, atividade1: '', atividade2: '' }));
      return;
    }

    setEditForm(prev => ({ ...prev, [name]: finalVal }));
    
    if (name === 'dataNascimento') {
      const parsedAge = calculateEditAge(value);
      setEditIdade(parsedAge);
      setEditForm(prev => ({ ...prev, atividade1: '', atividade2: '' }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditError('');

    try {
      const enfermidades = [];
      if (editAnamnese.bronquiteAsma) enfermidades.push({ tipoEnfermidade: 1, descricao: 'Bronquite/Asma' });
      if (editAnamnese.doencaCardiovascular) enfermidades.push({ tipoEnfermidade: 2, descricao: 'Doença Cardiovascular' });
      if (editAnamnese.epilepsia) enfermidades.push({ tipoEnfermidade: 3, descricao: 'Epilepsia' });
      if (editAnamnese.convulsoes) enfermidades.push({ tipoEnfermidade: 3, descricao: 'Convulsões' });
      if (editAnamnese.diabetes) enfermidades.push({ tipoEnfermidade: 4, descricao: 'Diabetes' });
      if (editAnamnese.problemasAuditivos) enfermidades.push({ tipoEnfermidade: 5, descricao: 'Problemas Auditivos' });
      if (editAnamnese.alergia) enfermidades.push({ tipoEnfermidade: 8, descricao: 'Alergia' });
      if (editAnamnese.problemasOculares) enfermidades.push({ tipoEnfermidade: 6, descricao: 'Problemas Oculares' });
      if (editAnamnese.problemasOrtopedicos) enfermidades.push({ tipoEnfermidade: 7, descricao: 'Problemas Ortopédicos' });

      if (editAnamnese.medicamentoTexto.trim()) {
        enfermidades.push({ tipoEnfermidade: 9, descricao: `Medicamento: ${editAnamnese.medicamentoTexto.trim()}` });
      }
      if (editAnamnese.cirurgiaTexto.trim()) {
        enfermidades.push({ tipoEnfermidade: 9, descricao: `Cirurgia: ${editAnamnese.cirurgiaTexto.trim()}` });
      }
      if (editAnamnese.outroCheckbox && editAnamnese.outroTexto.trim()) {
        enfermidades.push({ tipoEnfermidade: 9, descricao: `Outro: ${editAnamnese.outroTexto.trim()}` });
      }

      const possuiEnfermidade = enfermidades.length > 0;
      const anamnese = {
        possuiEnfermidade,
        observacoesGerais: '',
        enfermidades
      };

      const payload = {
        ...editForm,
        genero: parseInt(editForm.genero),
        corRaca: parseInt(editForm.corRaca),
        zonaMoradia: parseInt(editForm.zonaMoradia),
        tipoMoradia: parseInt(editForm.tipoMoradia),
        responsavelTransporte: parseInt(editForm.responsavelTransporte),
        meioTransporte: parseInt(editForm.meioTransporte),
        tipoEscola: parseInt(editForm.tipoEscola),
        turno: parseInt(editForm.turno),
        numeroPessoasCasa: parseInt(editForm.numeroPessoasCasa),
        atividade1: editForm.atividade1 ? parseInt(editForm.atividade1) : null,
        atividade2: editForm.atividade2 ? parseInt(editForm.atividade2) : null,
        anamnese
      };

      await api.put(`/Alunos/${alunoToEdit.id}`, payload);

      fetchAlunosETurmas();
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
          <Filter size={20} /> Filtros
        </button>
      </div>

      {showFilters && (
        <div className="advanced-filters glass-panel">
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
            <button className="btn btn-cancel" onClick={() => setFilters({idadeMin: '', idadeMax: '', dataInicio: '', dataFim: ''})}>
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
                <th>Data Criação</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(aluno => (
                <tr key={aluno.id}>
                  <td className="font-medium">{aluno.nome}</td>
                  <td>{aluno.cpf}</td>
                  <td>{getAge(aluno.dataNascimento)} anos</td>
                  <td>{format(parseISO(aluno.dataCadastro), 'dd/MM/yyyy')}</td>
                  <td>
                    <span className={`status-badge ${aluno.enturmado ? 'ativo' : 'em-espera'}`}>
                      {aluno.enturmado ? 'Enturmado' : 'Em espera'}
                    </span>
                  </td>
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
          <div className="modal-content large" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>Detalhes do Aluno</h2>
              <button className="close-btn" onClick={() => setSelectedAluno(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h3>Dados Pessoais e Familiares</h3>
                <div className="grid-3">
                  <div><strong>Nome:</strong> {selectedAluno.nome}</div>
                  <div><strong>CPF:</strong> {selectedAluno.cpf}</div>
                  <div><strong>RG:</strong> {selectedAluno.rg}</div>
                  <div><strong>Nascimento:</strong> {format(parseISO(selectedAluno.dataNascimento), 'dd/MM/yyyy')} ({getAge(selectedAluno.dataNascimento)} anos)</div>
                  <div><strong>Gênero:</strong> {generosMap[selectedAluno.genero] || 'Não Informado'}</div>
                  <div><strong>Cor/Etnia:</strong> {corRacaMap[selectedAluno.corRaca] || 'Não Informada'}</div>
                  <div><strong>Responsável:</strong> {selectedAluno.nomeResponsavel}</div>
                  <div><strong>Nome do Pai:</strong> {selectedAluno.nomePai || 'Não informado'}</div>
                  <div><strong>Nome da Mãe:</strong> {selectedAluno.nomeMae || 'Não informado'}</div>
                  <div><strong>Renda Familiar:</strong> {selectedAluno.rendaFamiliar || 'Não informada'}</div>
                  <div><strong>Recebe Benefício?</strong> {selectedAluno.recebeBeneficio ? 'Sim' : 'Não'}</div>
                  <div>
                    <strong>Status:</strong>{' '}
                    <span className={`status-badge ${selectedAluno.enturmado ? 'ativo' : 'em-espera'}`}>
                      {selectedAluno.enturmado ? 'Enturmado' : 'Em espera'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Endereço e Moradia</h3>
                <div className="grid-3">
                  <div style={{ gridColumn: 'span 2' }}><strong>Rua/Avenida:</strong> {selectedAluno.endereco}, {selectedAluno.numeroEndereco}</div>
                  <div><strong>Bairro:</strong> {selectedAluno.bairro}</div>
                  <div><strong>CEP:</strong> {selectedAluno.cep}</div>
                  <div><strong>Município/UF:</strong> {selectedAluno.municipio} - {selectedAluno.estado}</div>
                  <div><strong>Zona de Moradia:</strong> {zonaMoradiaMap[selectedAluno.zonaMoradia] || 'Não Informado'}</div>
                  <div><strong>Tipo de Moradia:</strong> {tipoMoradiaMap[selectedAluno.tipoMoradia] || 'Não Informado'}</div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Dados Escolares e Logística</h3>
                <div className="grid-3">
                  <div><strong>Escola:</strong> {selectedAluno.escola}</div>
                  <div><strong>Tipo de Escola:</strong> {tipoEscolaMap[selectedAluno.tipoEscola] || 'Não Informado'}</div>
                  <div><strong>Série:</strong> {selectedAluno.serie}</div>
                  <div><strong>Turno:</strong> {turnosMap[selectedAluno.turno] || 'Não Informado'}</div>
                  <div><strong>Nº Pessoas na Casa:</strong> {selectedAluno.numeroPessoasCasa}</div>
                  <div><strong>Resp. pelo Transporte:</strong> {responsavelTransporteMap[selectedAluno.responsavelTransporte] || 'Não Informado'}</div>
                  <div><strong>Meio de Transporte:</strong> {meioTransporteMap[selectedAluno.meioTransporte] || 'Não Informado'}</div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Contatos</h3>
                <div className="grid-2">
                  <div><strong>Contato 1 (Celular):</strong> {selectedAluno.contato1}</div>
                  <div><strong>Contato 2:</strong> {selectedAluno.contato2 || 'Não informado'}</div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Atividades</h3>
                <div className="grid-2">
                  <div><strong>Atividade Principal:</strong> {atividadesMap[selectedAluno.atividade1] || 'Nenhuma'}</div>
                  <div><strong>Atividade Secundária:</strong> {atividadesMap[selectedAluno.atividade2] || 'Nenhuma'}</div>
                </div>
              </div>

              <div className="detail-section">
                <h3>Anamnese (Histórico de Saúde)</h3>
                {selectedAluno.anamnese && selectedAluno.anamnese.possuiEnfermidade ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {selectedAluno.anamnese.enfermidades && selectedAluno.anamnese.enfermidades.filter(e => e.tipoEnfermidade !== 9).length > 0 && (
                      <div>
                        <strong>Condições/Doenças:</strong>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                          {selectedAluno.anamnese.enfermidades.filter(e => e.tipoEnfermidade !== 9).map(e => (
                            <span key={e.id || e.descricao} className="status-badge" style={{ backgroundColor: '#fee2e2', color: '#991b1b', fontWeight: '500' }}>
                              {e.descricao}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedAluno.anamnese.enfermidades && selectedAluno.anamnese.enfermidades.filter(e => e.tipoEnfermidade === 9).length > 0 && (
                      <div style={{ marginTop: '0.5rem' }}>
                        <strong>Observações Médicas:</strong>
                        <ul style={{ paddingLeft: '1.25rem', marginTop: '0.25rem', margin: 0 }}>
                          {selectedAluno.anamnese.enfermidades.filter(e => e.tipoEnfermidade === 9).map(e => (
                            <li key={e.id || e.descricao} style={{ marginBottom: '0.25rem' }}>
                              {e.descricao}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)', margin: 0 }}>Nenhuma enfermidade ou observação médica registrada.</p>
                )}
              </div>

              <div className="detail-section" style={{ borderBottom: 'none', paddingBottom: 0, marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <div style={{ display: 'flex', gap: '2rem' }}>
                  <span><strong>Cadastrado em:</strong> {format(parseISO(selectedAluno.dataCadastro), 'dd/MM/yyyy HH:mm')}</span>
                  {selectedAluno.dataCadastro !== selectedAluno.dataAtualizacao && selectedAluno.dataAtualizacao && (
                    <span><strong>Última atualização:</strong> {format(parseISO(selectedAluno.dataAtualizacao), 'dd/MM/yyyy HH:mm')}</span>
                  )}
                </div>
              </div>
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
          <div className="modal-content large" onClick={e => e.stopPropagation()} style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header">
              <h2>Editar Aluno</h2>
              <button className="close-btn" onClick={() => setAlunoToEdit(null)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-body">
              <form className="form-cadastro" onSubmit={handleEditSubmit} style={{ padding: 0, boxShadow: 'none', background: 'transparent' }}>
                <div className="form-section">
                  <h3>Dados Pessoais e Familiares</h3>
                  <div className="grid-3">
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label>Nome Completo do Aluno *</label>
                      <input type="text" name="nome" value={editForm.nome} onChange={handleEditChange} required maxLength="200" />
                    </div>
                    <div className="form-group">
                      <label>Data de Nascimento *</label>
                      <input type="date" name="dataNascimento" value={editForm.dataNascimento} onChange={handleEditChange} required />
                      {editIdade && <small className="idade-hint">Idade calculada: {editIdade.display}</small>}
                    </div>
                    <div className="form-group">
                      <label>CPF *</label>
                      <input type="text" name="cpf" value={editForm.cpf} onChange={handleEditChange} required placeholder="000.000.000-00" />
                    </div>
                    <div className="form-group">
                      <label>RG *</label>
                      <input type="text" name="rg" value={editForm.rg} onChange={handleEditChange} required placeholder="00.000.000-0" />
                    </div>
                    <div className="form-group">
                      <label>Gênero *</label>
                      <select name="genero" value={editForm.genero} onChange={handleEditChange} required>
                        <option value="1">Masculino</option>
                        <option value="2">Feminino</option>
                        <option value="3">Outro</option>
                        <option value="4">Prefiro não dizer</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Cor ou Etnia *</label>
                      <select name="corRaca" value={editForm.corRaca} onChange={handleEditChange} required>
                        <option value="1">Branco</option>
                        <option value="2">Preto</option>
                        <option value="3">Pardo</option>
                        <option value="4">Amarelo</option>
                        <option value="5">Indígena</option>
                        <option value="6">Não Informado</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Nome Completo do Responsável *</label>
                      <input type="text" name="nomeResponsavel" value={editForm.nomeResponsavel} onChange={handleEditChange} required />
                    </div>
                    <div className="form-group">
                      <label>Nome do Pai</label>
                      <input type="text" name="nomePai" value={editForm.nomePai || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                      <label>Nome da Mãe</label>
                      <input type="text" name="nomeMae" value={editForm.nomeMae || ''} onChange={handleEditChange} />
                    </div>
                    <div className="form-group">
                      <label>Renda Familiar</label>
                      <input type="text" name="rendaFamiliar" value={editForm.rendaFamiliar || ''} onChange={handleEditChange} placeholder="Ex: R$ 2.000,00" />
                    </div>
                    <div className="form-group" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '60px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '0.95rem' }}>
                        <input 
                          type="checkbox" 
                          name="recebeBeneficio" 
                          checked={editForm.recebeBeneficio} 
                          onChange={handleEditChange} 
                          style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                        />
                        Alguém da família recebe benefício?
                      </label>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Endereço e Moradia</h3>
                  <div className="grid-3">
                    <div className="form-group">
                      <label>CEP *</label>
                      <input type="text" name="cep" value={editForm.cep} onChange={handleEditChange} required maxLength="9" />
                    </div>
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
                      <input type="text" name="estado" value={editForm.estado} onChange={handleEditChange} required maxLength="2" placeholder="Ex: SP" />
                    </div>
                    <div className="form-group">
                      <label>Zona de Moradia *</label>
                      <select name="zonaMoradia" value={editForm.zonaMoradia} onChange={handleEditChange} required>
                        <option value="1">Urbana</option>
                        <option value="2">Rural</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Tipo de Moradia *</label>
                      <select name="tipoMoradia" value={editForm.tipoMoradia} onChange={handleEditChange} required>
                        <option value="1">Própria</option>
                        <option value="2">Alugada</option>
                        <option value="3">Cedida</option>
                        <option value="4">Outro</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Dados Escolares e Logística</h3>
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
                      <label>Nº Pessoas na Casa *</label>
                      <input type="number" name="numeroPessoasCasa" value={editForm.numeroPessoasCasa} onChange={handleEditChange} required min="1" max="50" />
                    </div>
                    <div className="form-group">
                      <label>Resp. por levar às aulas *</label>
                      <select name="responsavelTransporte" value={editForm.responsavelTransporte} onChange={handleEditChange} required>
                        <option value="1">Mãe</option>
                        <option value="2">Pai</option>
                        <option value="3">Sozinho</option>
                        <option value="4">Outro (Membro da Família)</option>
                        <option value="5">Outro (Não Membro)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Meio de Transporte *</label>
                      <select name="meioTransporte" value={editForm.meioTransporte} onChange={handleEditChange} required>
                        <option value="1">Andando</option>
                        <option value="2">Ônibus</option>
                        <option value="3">Veículo Particular</option>
                        <option value="4">Bicicleta</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Contatos</h3>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Contato 1 (Celular) *</label>
                      <input type="text" name="contato1" value={editForm.contato1} onChange={handleEditChange} required placeholder="(00) 00000-0000" />
                    </div>
                    <div className="form-group">
                      <label>Contato 2 (Opcional)</label>
                      <input type="text" name="contato2" value={editForm.contato2 || ''} onChange={handleEditChange} placeholder="(00) 00000-0000" />
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <h3>Anamnese (Histórico de Saúde)</h3>
                  <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px' }}>
                      <input
                        type="checkbox"
                        id="edit-bronquiteAsma"
                        name="bronquiteAsma"
                        checked={editAnamnese.bronquiteAsma}
                        onChange={handleEditAnamneseChange}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                      <label htmlFor="edit-bronquiteAsma" style={{ margin: 0, cursor: 'pointer' }}>Bronquite/Asma</label>
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px' }}>
                      <input
                        type="checkbox"
                        id="edit-doencaCardiovascular"
                        name="doencaCardiovascular"
                        checked={editAnamnese.doencaCardiovascular}
                        onChange={handleEditAnamneseChange}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                      <label htmlFor="edit-doencaCardiovascular" style={{ margin: 0, cursor: 'pointer' }}>Doença Cardiovascular</label>
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px' }}>
                      <input
                        type="checkbox"
                        id="edit-epilepsia"
                        name="epilepsia"
                        checked={editAnamnese.epilepsia}
                        onChange={handleEditAnamneseChange}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                      <label htmlFor="edit-epilepsia" style={{ margin: 0, cursor: 'pointer' }}>Epilepsia</label>
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px' }}>
                      <input
                        type="checkbox"
                        id="edit-convulsoes"
                        name="convulsoes"
                        checked={editAnamnese.convulsoes}
                        onChange={handleEditAnamneseChange}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                      <label htmlFor="edit-convulsoes" style={{ margin: 0, cursor: 'pointer' }}>Convulsões</label>
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px' }}>
                      <input
                        type="checkbox"
                        id="edit-diabetes"
                        name="diabetes"
                        checked={editAnamnese.diabetes}
                        onChange={handleEditAnamneseChange}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                      <label htmlFor="edit-diabetes" style={{ margin: 0, cursor: 'pointer' }}>Diabetes</label>
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px' }}>
                      <input
                        type="checkbox"
                        id="edit-problemasAuditivos"
                        name="problemasAuditivos"
                        checked={editAnamnese.problemasAuditivos}
                        onChange={handleEditAnamneseChange}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                      <label htmlFor="edit-problemasAuditivos" style={{ margin: 0, cursor: 'pointer' }}>Problemas Auditivos</label>
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px' }}>
                      <input
                        type="checkbox"
                        id="edit-alergia"
                        name="alergia"
                        checked={editAnamnese.alergia}
                        onChange={handleEditAnamneseChange}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                      <label htmlFor="edit-alergia" style={{ margin: 0, cursor: 'pointer' }}>Alergia</label>
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px' }}>
                      <input
                        type="checkbox"
                        id="edit-problemasOculares"
                        name="problemasOculares"
                        checked={editAnamnese.problemasOculares}
                        onChange={handleEditAnamneseChange}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                      <label htmlFor="edit-problemasOculares" style={{ margin: 0, cursor: 'pointer' }}>Problemas Oculares</label>
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px' }}>
                      <input
                        type="checkbox"
                        id="edit-problemasOrtopedicos"
                        name="problemasOrtopedicos"
                        checked={editAnamnese.problemasOrtopedicos}
                        onChange={handleEditAnamneseChange}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                      <label htmlFor="edit-problemasOrtopedicos" style={{ margin: 0, cursor: 'pointer' }}>Problemas Ortopédicos</label>
                    </div>
                  </div>

                  <div className="grid-2">
                    <div className="form-group">
                      <label htmlFor="edit-medicamentoTexto">Tomando Algum Medicamento? Se sim, qual?</label>
                      <input
                        type="text"
                        id="edit-medicamentoTexto"
                        name="medicamentoTexto"
                        value={editAnamnese.medicamentoTexto}
                        onChange={handleEditAnamneseChange}
                        placeholder="Nome do medicamento e dosagem"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="edit-cirurgiaTexto">Já realizou alguma cirurgia? Se sim, qual?</label>
                      <input
                        type="text"
                        id="edit-cirurgiaTexto"
                        name="cirurgiaTexto"
                        value={editAnamnese.cirurgiaTexto}
                        onChange={handleEditAnamneseChange}
                        placeholder="Descrição da cirurgia"
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: '1.5rem' }}>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px', marginBottom: '0.5rem' }}>
                      <input
                        type="checkbox"
                        id="edit-outroCheckbox"
                        name="outroCheckbox"
                        checked={editAnamnese.outroCheckbox}
                        onChange={handleEditAnamneseChange}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                      />
                      <label htmlFor="edit-outroCheckbox" style={{ margin: 0, cursor: 'pointer' }}>Outro</label>
                    </div>
                    {editAnamnese.outroCheckbox && (
                      <div className="form-group" style={{ marginTop: '0.5rem' }}>
                        <label htmlFor="edit-outroTexto">Especifique:</label>
                        <input
                          type="text"
                          id="edit-outroTexto"
                          name="outroTexto"
                          value={editAnamnese.outroTexto}
                          onChange={handleEditAnamneseChange}
                          placeholder="Descreva outras condições ou observações médicas"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-section">
                  <h3>Atividades</h3>
                  <div className="grid-2">
                    <div className="form-group">
                      <label>Atividade Principal *</label>
                      <select name="atividade1" value={editForm.atividade1} onChange={handleEditChange} required disabled={!editIdade}>
                        <option value="">{editIdade ? 'Selecione uma atividade...' : 'Preencha a data de nascimento primeiro'}</option>
                        {editIdade && filterAtividadesPorIdade(editIdade).map(ativ => (
                          <option key={ativ.id} value={ativ.id}>{ativ.nome}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Atividade Secundária (Opcional)</label>
                      <select name="atividade2" value={editForm.atividade2} onChange={handleEditChange} disabled={!editIdade || !editForm.atividade1}>
                        <option value="">{editIdade ? 'Selecione uma atividade (opcional)...' : 'Preencha a data de nascimento primeiro'}</option>
                        {editIdade && filterAtividadesPorIdade(editIdade)
                          .filter(ativ => ativ.id !== parseInt(editForm.atividade1))
                          .map(ativ => (
                            <option key={ativ.id} value={ativ.id}>{ativ.nome}</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                </div>

                {editError && (
                  <div className="form-message error" style={{ marginBottom: '1rem' }}>
                    {editError}
                  </div>
                )}

                <div className="modal-footer" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '2rem' }}>
                  <button type="button" className="btn btn-cancel" onClick={() => setAlunoToEdit(null)} style={{ padding: '0.5rem 1.5rem', width: 'auto', minWidth: '150px', display: 'flex', justifyContent: 'center' }}>Cancelar</button>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', width: 'auto', minWidth: '150px', display: 'flex', justifyContent: 'center' }}>Salvar Alterações</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
