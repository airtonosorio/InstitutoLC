import { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Download, FileSpreadsheet, Filter } from 'lucide-react';
import { differenceInYears, parseISO } from 'date-fns';
import api from '../api';
import './ImportExport.css';

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

const tipoEscolaMap = {
  0: 'Pública',
  1: 'Pública',
  2: 'Privada'
};

const turnosMap = {
  0: 'Matutino',
  1: 'Matutino',
  2: 'Vespertino',
  3: 'Noturno',
  4: 'Integral'
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

const simNao = value => value ? 'Sim' : 'Não';

const hasEnfermidade = (aluno, tipo, descricaoInclui = '') => {
  const enfermidades = aluno.anamnese?.enfermidades || [];
  return enfermidades.some(enf => {
    const descricao = (enf.descricao || '').toLowerCase();
    return enf.tipoEnfermidade === tipo && (!descricaoInclui || descricao.includes(descricaoInclui.toLowerCase()));
  });
};

const getEnfermidadeTexto = (aluno, prefixo) => {
  const enfermidades = aluno.anamnese?.enfermidades || [];
  const item = enfermidades.find(enf => (enf.descricao || '').toLowerCase().startsWith(`${prefixo.toLowerCase()}:`));
  return item?.descricao?.split(':').slice(1).join(':').trim() || '';
};

const buildExportRow = (aluno, atividadesMap) => ({
  'Nome': aluno.nome || '',
  'Data de Nascimento': aluno.dataNascimento ? new Date(aluno.dataNascimento).toLocaleDateString('pt-BR') : '',
  'Idade': aluno.dataNascimento ? differenceInYears(new Date(), parseISO(aluno.dataNascimento)) : '',
  'CPF': aluno.cpf || '',
  'RG': aluno.rg || '',
  'Gênero': generosMap[aluno.genero] || '',
  'Cor ou Etnia': corRacaMap[aluno.corRaca] || '',
  'Nome do Responsável': aluno.nomeResponsavel || '',
  'Nome do Pai': aluno.nomePai || '',
  'Nome da Mãe': aluno.nomeMae || '',
  'Recebe Benefício': simNao(aluno.recebeBeneficio),
  'Renda Familiar': aluno.rendaFamiliar || '',
  'CEP': aluno.cep || '',
  'Endereço': aluno.endereco || '',
  'Número': aluno.numeroEndereco || '',
  'Bairro': aluno.bairro || '',
  'Município': aluno.municipio || '',
  'Estado': aluno.estado || '',
  'Zona de Moradia': zonaMoradiaMap[aluno.zonaMoradia] || '',
  'Tipo de Moradia': tipoMoradiaMap[aluno.tipoMoradia] || '',
  'Escola': aluno.escola || '',
  'Tipo Escola': tipoEscolaMap[aluno.tipoEscola] || '',
  'Série': aluno.serie || '',
  'Turno': turnosMap[aluno.turno] || '',
  'Número de Pessoas na Casa': aluno.numeroPessoasCasa || '',
  'Responsável Transporte': responsavelTransporteMap[aluno.responsavelTransporte] || '',
  'Meio Transporte': meioTransporteMap[aluno.meioTransporte] || '',
  'Contato 1': aluno.contato1 || '',
  'Contato 2': aluno.contato2 || '',
  'Bronquite/Asma': simNao(hasEnfermidade(aluno, 1)),
  'Doença Cardiovascular': simNao(hasEnfermidade(aluno, 2)),
  'Epilepsia': simNao(hasEnfermidade(aluno, 3, 'Epilepsia')),
  'Convulsões': simNao(hasEnfermidade(aluno, 3, 'Convuls')),
  'Diabetes': simNao(hasEnfermidade(aluno, 4)),
  'Problemas Auditivos': simNao(hasEnfermidade(aluno, 5)),
  'Alergia': simNao(hasEnfermidade(aluno, 8)),
  'Problemas Oculares': simNao(hasEnfermidade(aluno, 6)),
  'Problemas Ortopédicos': simNao(hasEnfermidade(aluno, 7)),
  'Medicamento': getEnfermidadeTexto(aluno, 'Medicamento'),
  'Cirurgia': getEnfermidadeTexto(aluno, 'Cirurgia'),
  'Outro': getEnfermidadeTexto(aluno, 'Outro'),
  'Observações Gerais': aluno.anamnese?.observacoesGerais || '',
  'Atividade 1': atividadesMap[aluno.atividade1] || '',
  'Atividade 2': aluno.atividade2 !== null ? (atividadesMap[aluno.atividade2] || '') : '',
  'Enturmado': simNao(aluno.enturmado),
  'Data Cadastro': aluno.dataCadastro ? new Date(aluno.dataCadastro).toLocaleDateString('pt-BR') : ''
});

export default function ImportExport() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const fileInputRef = useRef(null);
  const [atividades, setAtividades] = useState([]);

  useEffect(() => {
    api.get('/Atividades')
      .then(res => setAtividades(res.data))
      .catch(err => console.error('Erro ao buscar atividades:', err));
  }, []);

  const atividadesMap = {};
  atividades.forEach(a => {
    atividadesMap[a.id] = a.nome;
  });

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    atividade: '',
    idadeMin: '',
    idadeMax: '',
    dataInicio: '',
    dataFim: ''
  });

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('arquivo', file);

    setLoading(true);
    setMsg(null);

    try {
      const res = await api.post('/Alunos/importar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMsg({ type: 'success', text: `Sucesso! ${res.data.totalImportados} alunos importados.` });
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Erro ao importar arquivo.';
      const detalhes = err.response?.data?.erros || [];
      setMsg({ type: 'error', text: errorMessage, detalhes });
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await api.get('/Alunos');
      let alunos = res.data;

      if (filters.atividade !== '') {
        const ativ = parseInt(filters.atividade);
        alunos = alunos.filter(a => a.atividade1 === ativ || a.atividade2 === ativ);
      }
      if (filters.idadeMin || filters.idadeMax) {
        const today = new Date();
        alunos = alunos.filter(a => {
          const age = differenceInYears(today, parseISO(a.dataNascimento));
          const min = filters.idadeMin ? parseInt(filters.idadeMin) : 0;
          const max = filters.idadeMax ? parseInt(filters.idadeMax) : 999;
          return age >= min && age <= max;
        });
      }
      if (filters.dataInicio) {
        const start = new Date(filters.dataInicio);
        start.setHours(0, 0, 0, 0);
        alunos = alunos.filter(a => new Date(a.dataCadastro) >= start);
      }
      if (filters.dataFim) {
        const end = new Date(filters.dataFim);
        end.setHours(23, 59, 59, 999);
        alunos = alunos.filter(a => new Date(a.dataCadastro) <= end);
      }

      if (alunos.length === 0) {
        setMsg({ type: 'error', text: 'Nenhum aluno encontrado com esses filtros para exportação.' });
        setLoading(false);
        return;
      }

      const dataToExport = alunos.map(a => buildExportRow(a, atividadesMap));
      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Alunos');
      XLSX.writeFile(workbook, 'Alunos_Exportados.xlsx');

      setMsg({ type: 'success', text: `Download iniciado com ${alunos.length} registros!` });
    } catch {
      setMsg({ type: 'error', text: 'Erro ao gerar arquivo Excel.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-export-container">
      <h1 className="page-title">Exportação/ Importação</h1>

      <div className="actions-grid">
        <div className="action-card glass-panel">
          <div className="card-icon">
            <Upload size={32} color="var(--primary)" />
          </div>
          <h2>Importar Excel</h2>
          <p>Faça o upload de uma planilha para cadastrar alunos em massa. A planilha deve ter todas as colunas do modelo exportado; células vazias são aceitas quando o cadastro permitir.</p>

          <input
            type="file"
            accept=".xlsx, .xls"
            ref={fileInputRef}
            onChange={handleImport}
            style={{ display: 'none' }}
          />
          <button
            className="btn btn-primary"
            onClick={() => fileInputRef.current.click()}
            disabled={loading}
            style={{ marginTop: 'auto' }}
          >
            {loading ? 'Processando...' : 'Selecionar Arquivo'}
          </button>
        </div>

        <div className="action-card glass-panel">
          <div className="card-icon">
            <Download size={32} color="#10b981" />
          </div>
          <h2>Exportar Excel</h2>
          <p>Gere uma planilha com todos os campos do cadastro, inclusive colunas vazias, para consulta ou reimportação.</p>

          <button
            className={`btn-filter ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            style={{ marginBottom: '1rem' }}
          >
            <Filter size={20} /> Filtros para Exportação
          </button>

          {showFilters && (
            <div className="export-filters">
              <div className="filter-group">
                <label>Atividade</label>
                <select value={filters.atividade} onChange={e => setFilters({ ...filters, atividade: e.target.value })}>
                  <option value="">Todas</option>
                  {atividades.map(ativ => (
                    <option key={ativ.id} value={ativ.id}>{ativ.nome.replace(/\s*\([^)]*\)/g, '')}</option>
                  ))}
                </select>
              </div>
              <div className="filter-group">
                <label>Idade Min / Máx</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="number" min="0" placeholder="Min" value={filters.idadeMin} onChange={e => setFilters({ ...filters, idadeMin: e.target.value })} style={{ width: '50%' }} />
                  <input type="number" min="0" placeholder="Máx" value={filters.idadeMax} onChange={e => setFilters({ ...filters, idadeMax: e.target.value })} style={{ width: '50%' }} />
                </div>
              </div>
              <div className="filter-group">
                <label>Data Cadastro (Início e Fim)</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input type="date" value={filters.dataInicio} onChange={e => setFilters({ ...filters, dataInicio: e.target.value })} style={{ width: '50%' }} />
                  <input type="date" value={filters.dataFim} onChange={e => setFilters({ ...filters, dataFim: e.target.value })} style={{ width: '50%' }} />
                </div>
              </div>
            </div>
          )}

          <button
            className="btn"
            style={{ backgroundColor: '#10b981', color: 'white', marginTop: 'auto' }}
            onClick={handleExport}
            disabled={loading}
          >
            <FileSpreadsheet size={20} />
            {loading ? 'Gerando...' : 'Baixar Planilha'}
          </button>
        </div>
      </div>

      {msg && (
        <div className={`message-box glass-panel ${msg.type}`}>
          <p>{msg.text}</p>
          {msg.detalhes && msg.detalhes.length > 0 && (
            <ul className="error-list">
              {msg.detalhes.map((err, i) => <li key={i}>{err}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
