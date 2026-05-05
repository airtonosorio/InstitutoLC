import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Download, FileSpreadsheet, Filter } from 'lucide-react';
import { differenceInYears, parseISO } from 'date-fns';
import api from '../api';
import './ImportExport.css';

const atividadesMap = {
  0: 'Futebol',
  1: 'Ballet',
  2: 'Música',
  3: 'Natação',
  4: 'Reforço Escolar'
};

const turnosMap = {
  0: 'Matutino',
  1: 'Vespertino',
  2: 'Noturno',
  3: 'Integral'
};

export default function ImportExport() {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);
  const fileInputRef = useRef(null);

  // Filtros de Exportação
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

      // Aplicar filtros avançados (Mesma lógica da Consulta)
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
        start.setHours(0,0,0,0);
        alunos = alunos.filter(a => new Date(a.dataCadastro) >= start);
      }
      if (filters.dataFim) {
        const end = new Date(filters.dataFim);
        end.setHours(23,59,59,999);
        alunos = alunos.filter(a => new Date(a.dataCadastro) <= end);
      }

      if (alunos.length === 0) {
        setMsg({ type: 'error', text: 'Nenhum aluno encontrado com esses filtros para exportação.' });
        setLoading(false);
        return;
      }

      const dataToExport = alunos.map(a => ({
        'Nome': a.nome,
        'Data de Nascimento': new Date(a.dataNascimento).toLocaleDateString('pt-BR'),
        'Idade': differenceInYears(new Date(), parseISO(a.dataNascimento)),
        'CPF': a.cpf,
        'Endereço': a.endereco,
        'Número': a.numeroEndereco,
        'Bairro': a.bairro,
        'Município': a.municipio,
        'Estado': a.estado,
        'Escola': a.escola,
        'Tipo Escola': a.tipoEscola === 0 ? 'Pública' : 'Privada',
        'Série': a.serie,
        'Turno': turnosMap[a.turno],
        'Número de Pessoas na Casa': a.numeroPessoasCasa,
        'Contato 1': a.contato1,
        'Contato 2': a.contato2 || '',
        'Atividade 1': atividadesMap[a.atividade1],
        'Atividade 2': a.atividade2 !== null ? atividadesMap[a.atividade2] : '',
        'Data Cadastro': new Date(a.dataCadastro).toLocaleDateString('pt-BR')
      }));

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Alunos');
      XLSX.writeFile(workbook, 'Alunos_Exportados.xlsx');
      
      setMsg({ type: 'success', text: `Download iniciado com ${alunos.length} registros!` });

    } catch (err) {
      setMsg({ type: 'error', text: 'Erro ao gerar arquivo Excel.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="import-export-container">
      <h1 className="page-title">Importar / Exportar Dados</h1>

      <div className="actions-grid">
        {/* Card Importação */}
        <div className="action-card glass-panel">
          <div className="card-icon">
            <Upload size={32} color="var(--primary)" />
          </div>
          <h2>Importar Excel</h2>
          <p>Faça o upload de uma planilha para cadastrar alunos em massa. É tolerante a campos ausentes (exceto Nome e CPF).</p>
          
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
          >
            {loading ? 'Processando...' : 'Selecionar Arquivo'}
          </button>
        </div>

        {/* Card Exportação */}
        <div className="action-card glass-panel">
          <div className="card-icon">
            <Download size={32} color="#10b981" />
          </div>
          <h2>Exportar Excel</h2>
          <p>Gere uma planilha com os dados dos alunos cadastrados. Você pode aplicar filtros antes de exportar.</p>
          
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
                <select value={filters.atividade} onChange={e => setFilters({...filters, atividade: e.target.value})}>
                  <option value="">Todas</option>
                  <option value="0">Futebol</option>
                  <option value="1">Ballet</option>
                  <option value="2">Música</option>
                  <option value="3">Natação</option>
                  <option value="4">Reforço Escolar</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Idade Min / Máx</label>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <input type="number" min="0" placeholder="Min" value={filters.idadeMin} onChange={e => setFilters({...filters, idadeMin: e.target.value})} style={{width: '50%'}} />
                  <input type="number" min="0" placeholder="Máx" value={filters.idadeMax} onChange={e => setFilters({...filters, idadeMax: e.target.value})} style={{width: '50%'}} />
                </div>
              </div>
              <div className="filter-group">
                <label>Data Cadastro (Início e Fim)</label>
                <div style={{display: 'flex', gap: '0.5rem'}}>
                  <input type="date" value={filters.dataInicio} onChange={e => setFilters({...filters, dataInicio: e.target.value})} style={{width: '50%'}} />
                  <input type="date" value={filters.dataFim} onChange={e => setFilters({...filters, dataFim: e.target.value})} style={{width: '50%'}} />
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
