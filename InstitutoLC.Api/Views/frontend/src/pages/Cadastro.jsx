import { useState, useEffect } from 'react';
import api from '../api';
import './Cadastro.css';

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
  v = v.replace(/^(\d{2})(\d)/g, "($1) $2");
  v = v.replace(/(\d)(\d{4})$/, "$1-$2");
  return v;
};

const filterAtividadesPorIdade = (idade, list) => {
  if (!idade || !list) return [];
  const { years, totalMonths } = idade;
  return list.filter(ativ => {
    if (ativ.id === 12 || ativ.nome.toLowerCase().includes('creche')) { // Creche (10 meses a 3 anos)
      return totalMonths >= 10 && years <= 3;
    } else {
      return years >= ativ.minIdade && years <= ativ.maxIdade;
    }
  });
};

export default function Cadastro() {
  const [formData, setFormData] = useState({
    nome: '',
    dataNascimento: '',
    cpf: '',
    rg: '',
    genero: '1',
    corRaca: '1',
    nomeResponsavel: '',
    nomePai: '',
    nomeMae: '',
    recebeBeneficio: false,
    rendaFamiliar: '',
    endereco: '',
    numeroEndereco: '',
    bairro: '',
    municipio: '',
    estado: '',
    cep: '',
    zonaMoradia: '1',
    tipoMoradia: '1',
    escola: '',
    tipoEscola: '0',
    serie: '',
    turno: '0',
    numeroPessoasCasa: '',
    contato1: '',
    contato2: '',
    responsavelTransporte: '1',
    meioTransporte: '1',
    atividade1: '',
    atividade2: ''
  });

  const [idade, setIdade] = useState(null);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [atividadesList, setAtividadesList] = useState([]);

  useEffect(() => {
    api.get('/Atividades')
      .then(res => setAtividadesList(res.data))
      .catch(err => console.error('Erro ao buscar atividades:', err));
  }, []);

  const [anamneseData, setAnamneseData] = useState({
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

  const handleAnamneseChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalVal = type === 'checkbox' ? checked : value;
    setAnamneseData(prev => ({ ...prev, [name]: finalVal }));
  };

  const calculateAge = (dob) => {
    if (!dob) {
      setIdade(null);
      setFormData(prev => ({ ...prev, atividade1: '', atividade2: '' }));
      return;
    }
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
    setIdade({ years, months, totalMonths, display });
    setFormData(prev => ({ ...prev, atividade1: '', atividade2: '' }));
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalVal = type === 'checkbox' ? checked : value;

    if (name === 'cpf') finalVal = applyCpfMask(value);
    if (name === 'rg') finalVal = applyRgMask(value);
    if (name === 'contato1' || name === 'contato2') finalVal = applyPhoneMask(value);

    // Se limpar a atividade principal, também limpa a secundária
    if (name === 'atividade1' && !value) {
      setFormData(prev => ({ ...prev, atividade1: '', atividade2: '' }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: finalVal }));

    if (name === 'dataNascimento') {
      calculateAge(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setIsError(false);
    setLoading(true);

    try {
      const enfermidades = [];
      if (anamneseData.bronquiteAsma) enfermidades.push({ tipoEnfermidade: 1, descricao: 'Bronquite/Asma' });
      if (anamneseData.doencaCardiovascular) enfermidades.push({ tipoEnfermidade: 2, descricao: 'Doença Cardiovascular' });
      if (anamneseData.epilepsia) enfermidades.push({ tipoEnfermidade: 3, descricao: 'Epilepsia' });
      if (anamneseData.convulsoes) enfermidades.push({ tipoEnfermidade: 3, descricao: 'Convulsões' });
      if (anamneseData.diabetes) enfermidades.push({ tipoEnfermidade: 4, descricao: 'Diabetes' });
      if (anamneseData.problemasAuditivos) enfermidades.push({ tipoEnfermidade: 5, descricao: 'Problemas Auditivos' });
      if (anamneseData.alergia) enfermidades.push({ tipoEnfermidade: 8, descricao: 'Alergia' });
      if (anamneseData.problemasOculares) enfermidades.push({ tipoEnfermidade: 6, descricao: 'Problemas Oculares' });
      if (anamneseData.problemasOrtopedicos) enfermidades.push({ tipoEnfermidade: 7, descricao: 'Problemas Ortopédicos' });

      if (anamneseData.medicamentoTexto.trim()) {
        enfermidades.push({ tipoEnfermidade: 9, descricao: `Medicamento: ${anamneseData.medicamentoTexto.trim()}` });
      }
      if (anamneseData.cirurgiaTexto.trim()) {
        enfermidades.push({ tipoEnfermidade: 9, descricao: `Cirurgia: ${anamneseData.cirurgiaTexto.trim()}` });
      }
      if (anamneseData.outroCheckbox && anamneseData.outroTexto.trim()) {
        enfermidades.push({ tipoEnfermidade: 9, descricao: `Outro: ${anamneseData.outroTexto.trim()}` });
      }

      const possuiEnfermidade = enfermidades.length > 0;
      const anamnese = {
        possuiEnfermidade,
        observacoesGerais: '',
        enfermidades
      };

      const payload = {
        ...formData,
        genero: parseInt(formData.genero),
        corRaca: parseInt(formData.corRaca),
        zonaMoradia: parseInt(formData.zonaMoradia),
        tipoMoradia: parseInt(formData.tipoMoradia),
        responsavelTransporte: parseInt(formData.responsavelTransporte),
        meioTransporte: parseInt(formData.meioTransporte),
        tipoEscola: parseInt(formData.tipoEscola),
        turno: parseInt(formData.turno),
        numeroPessoasCasa: parseInt(formData.numeroPessoasCasa),
        atividade1: formData.atividade1 ? parseInt(formData.atividade1) : null,
        atividade2: formData.atividade2 ? parseInt(formData.atividade2) : null,
        anamnese
      };

      await api.post('/Alunos', payload);

      setMsg('Aluno cadastrado com sucesso!');
      setFormData({
        nome: '', dataNascimento: '', cpf: '', rg: '', genero: '1', corRaca: '1',
        nomeResponsavel: '', nomePai: '', nomeMae: '', recebeBeneficio: false, rendaFamiliar: '',
        endereco: '', numeroEndereco: '', bairro: '', municipio: '', estado: '', cep: '',
        zonaMoradia: '1', tipoMoradia: '1', escola: '', tipoEscola: '0', serie: '', turno: '0',
        numeroPessoasCasa: '', contato1: '', contato2: '', responsavelTransporte: '1', meioTransporte: '1',
        atividade1: '', atividade2: ''
      });
      setAnamneseData({
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
      setIdade(null);
    } catch (err) {
      setIsError(true);
      setMsg(err.response?.data?.message || 'Erro ao cadastrar aluno.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cadastro-container">
      <h1 className="page-title">Cadastrar Aluno</h1>

      <form className="glass-panel form-cadastro" onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Dados Pessoais e Familiares</h3>
          <div className="grid-3">
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Nome Completo do Aluno *</label>
              <input type="text" name="nome" value={formData.nome} onChange={handleChange} required maxLength="200" />
            </div>
            <div className="form-group">
              <label>Data de Nascimento *</label>
              <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} required />
              {idade && <small className="idade-hint">Idade calculada: {idade.display}</small>}
            </div>
            <div className="form-group">
              <label>CPF *</label>
              <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} required placeholder="000.000.000-00" />
            </div>
            <div className="form-group">
              <label>RG *</label>
              <input type="text" name="rg" value={formData.rg} onChange={handleChange} required placeholder="00.000.000-0" />
            </div>
            <div className="form-group">
              <label>Gênero *</label>
              <select name="genero" value={formData.genero} onChange={handleChange} required>
                <option value="1">Masculino</option>
                <option value="2">Feminino</option>
                <option value="3">Outro</option>
                <option value="4">Prefiro não dizer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Cor ou Etnia *</label>
              <select name="corRaca" value={formData.corRaca} onChange={handleChange} required>
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
              <input type="text" name="nomeResponsavel" value={formData.nomeResponsavel} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Nome do Pai</label>
              <input type="text" name="nomePai" value={formData.nomePai} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Nome da Mãe</label>
              <input type="text" name="nomeMae" value={formData.nomeMae} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label>Renda Familiar</label>
              <input type="text" name="rendaFamiliar" value={formData.rendaFamiliar} onChange={handleChange} placeholder="Ex: R$ 2.000,00" />
            </div>
            <div className="form-group" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '60px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '0.95rem' }}>
                <input 
                  type="checkbox" 
                  name="recebeBeneficio" 
                  checked={formData.recebeBeneficio} 
                  onChange={handleChange} 
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
              <input type="text" name="cep" value={formData.cep} onChange={handleChange} required maxLength="9" />
            </div>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Rua/Avenida *</label>
              <input type="text" name="endereco" value={formData.endereco} onChange={handleChange} required maxLength="300" />
            </div>
            <div className="form-group">
              <label>Número *</label>
              <input type="text" name="numeroEndereco" value={formData.numeroEndereco} onChange={handleChange} required maxLength="20" />
            </div>
            <div className="form-group">
              <label>Bairro *</label>
              <input type="text" name="bairro" value={formData.bairro} onChange={handleChange} required maxLength="100" />
            </div>
            <div className="form-group">
              <label>Município *</label>
              <input type="text" name="municipio" value={formData.municipio} onChange={handleChange} required maxLength="100" />
            </div>
            <div className="form-group">
              <label>Estado (UF) *</label>
              <input type="text" name="estado" value={formData.estado} onChange={handleChange} required maxLength="2" placeholder="Ex: SP" />
            </div>
            <div className="form-group">
              <label>Zona de Moradia *</label>
              <select name="zonaMoradia" value={formData.zonaMoradia} onChange={handleChange} required>
                <option value="1">Urbana</option>
                <option value="2">Rural</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tipo de Moradia *</label>
              <select name="tipoMoradia" value={formData.tipoMoradia} onChange={handleChange} required>
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
              <input type="text" name="escola" value={formData.escola} onChange={handleChange} required maxLength="200" />
            </div>
            <div className="form-group">
              <label>Tipo de Escola *</label>
              <select name="tipoEscola" value={formData.tipoEscola} onChange={handleChange} required>
                <option value="0">Pública</option>
                <option value="1">Privada</option>
              </select>
            </div>
            <div className="form-group">
              <label>Série *</label>
              <input type="text" name="serie" value={formData.serie} onChange={handleChange} required maxLength="50" />
            </div>
            <div className="form-group">
              <label>Turno *</label>
              <select name="turno" value={formData.turno} onChange={handleChange} required>
                <option value="0">Matutino</option>
                <option value="1">Vespertino</option>
                <option value="2">Noturno</option>
                <option value="3">Integral</option>
              </select>
            </div>
            <div className="form-group">
              <label>Nº Pessoas na Casa *</label>
              <input type="number" name="numeroPessoasCasa" value={formData.numeroPessoasCasa} onChange={handleChange} required min="1" max="50" />
            </div>
            <div className="form-group">
              <label>Resp. por levar às aulas *</label>
              <select name="responsavelTransporte" value={formData.responsavelTransporte} onChange={handleChange} required>
                <option value="1">Mãe</option>
                <option value="2">Pai</option>
                <option value="3">Sozinho</option>
                <option value="4">Outro (Membro da Família)</option>
                <option value="5">Outro (Não Membro)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Meio de Transporte *</label>
              <select name="meioTransporte" value={formData.meioTransporte} onChange={handleChange} required>
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
              <input type="text" name="contato1" value={formData.contato1} onChange={handleChange} required placeholder="(00) 00000-0000" />
            </div>
            <div className="form-group">
              <label>Contato 2 (Opcional)</label>
              <input type="text" name="contato2" value={formData.contato2} onChange={handleChange} placeholder="(00) 00000-0000" />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Anamnese (Histórico de Saúde)</h3>
          <div className="grid-3" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px' }}>
              <input
                type="checkbox"
                id="bronquiteAsma"
                name="bronquiteAsma"
                checked={anamneseData.bronquiteAsma}
                onChange={handleAnamneseChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="bronquiteAsma" style={{ margin: 0, cursor: 'pointer' }}>Bronquite/Asma</label>
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px' }}>
              <input
                type="checkbox"
                id="doencaCardiovascular"
                name="doencaCardiovascular"
                checked={anamneseData.doencaCardiovascular}
                onChange={handleAnamneseChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="doencaCardiovascular" style={{ margin: 0, cursor: 'pointer' }}>Doença Cardiovascular</label>
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px' }}>
              <input
                type="checkbox"
                id="epilepsia"
                name="epilepsia"
                checked={anamneseData.epilepsia}
                onChange={handleAnamneseChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="epilepsia" style={{ margin: 0, cursor: 'pointer' }}>Epilepsia</label>
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px' }}>
              <input
                type="checkbox"
                id="convulsoes"
                name="convulsoes"
                checked={anamneseData.convulsoes}
                onChange={handleAnamneseChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="convulsoes" style={{ margin: 0, cursor: 'pointer' }}>Convulsões</label>
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px' }}>
              <input
                type="checkbox"
                id="diabetes"
                name="diabetes"
                checked={anamneseData.diabetes}
                onChange={handleAnamneseChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="diabetes" style={{ margin: 0, cursor: 'pointer' }}>Diabetes</label>
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px' }}>
              <input
                type="checkbox"
                id="problemasAuditivos"
                name="problemasAuditivos"
                checked={anamneseData.problemasAuditivos}
                onChange={handleAnamneseChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="problemasAuditivos" style={{ margin: 0, cursor: 'pointer' }}>Problemas Auditivos</label>
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px' }}>
              <input
                type="checkbox"
                id="alergia"
                name="alergia"
                checked={anamneseData.alergia}
                onChange={handleAnamneseChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="alergia" style={{ margin: 0, cursor: 'pointer' }}>Alergia</label>
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px' }}>
              <input
                type="checkbox"
                id="problemasOculares"
                name="problemasOculares"
                checked={anamneseData.problemasOculares}
                onChange={handleAnamneseChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="problemasOculares" style={{ margin: 0, cursor: 'pointer' }}>Problemas Oculares</label>
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px' }}>
              <input
                type="checkbox"
                id="problemasOrtopedicos"
                name="problemasOrtopedicos"
                checked={anamneseData.problemasOrtopedicos}
                onChange={handleAnamneseChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="problemasOrtopedicos" style={{ margin: 0, cursor: 'pointer' }}>Problemas Ortopédicos</label>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label htmlFor="medicamentoTexto">Tomando Algum Medicamento? Se sim, qual?</label>
              <input
                type="text"
                id="medicamentoTexto"
                name="medicamentoTexto"
                value={anamneseData.medicamentoTexto}
                onChange={handleAnamneseChange}
                placeholder="Nome do medicamento e dosagem"
              />
            </div>
            <div className="form-group">
              <label htmlFor="cirurgiaTexto">Já realizou alguma cirurgia? Se sim, qual?</label>
              <input
                type="text"
                id="cirurgiaTexto"
                name="cirurgiaTexto"
                value={anamneseData.cirurgiaTexto}
                onChange={handleAnamneseChange}
                placeholder="Descrição da cirurgia"
              />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', minHeight: '40px', marginBottom: '0.5rem' }}>
              <input
                type="checkbox"
                id="outroCheckbox"
                name="outroCheckbox"
                checked={anamneseData.outroCheckbox}
                onChange={handleAnamneseChange}
                style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
              />
              <label htmlFor="outroCheckbox" style={{ margin: 0, cursor: 'pointer' }}>Outro</label>
            </div>
            {anamneseData.outroCheckbox && (
              <div className="form-group" style={{ marginTop: '0.5rem' }}>
                <label htmlFor="outroTexto">Especifique:</label>
                <input
                  type="text"
                  id="outroTexto"
                  name="outroTexto"
                  value={anamneseData.outroTexto}
                  onChange={handleAnamneseChange}
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
              <select name="atividade1" value={formData.atividade1} onChange={handleChange} required disabled={!idade}>
                <option value="">{idade ? 'Selecione uma atividade...' : 'Preencha a data de nascimento primeiro'}</option>
                {idade && filterAtividadesPorIdade(idade, atividadesList).map(ativ => (
                  <option key={ativ.id} value={ativ.id}>{ativ.nome}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Atividade Secundária (Opcional)</label>
              <select name="atividade2" value={formData.atividade2} onChange={handleChange} disabled={!idade || !formData.atividade1}>
                <option value="">{idade ? 'Selecione uma atividade (opcional)...' : 'Preencha a data de nascimento primeiro'}</option>
                {idade && filterAtividadesPorIdade(idade, atividadesList)
                  .filter(ativ => ativ.id !== parseInt(formData.atividade1))
                  .map(ativ => (
                    <option key={ativ.id} value={ativ.id}>{ativ.nome}</option>
                  ))
                }
              </select>
            </div>
          </div>
        </div>

        {msg && (
          <div className={`form-message ${isError ? 'error' : 'success'}`}>
            {msg}
          </div>
        )}

        <div className="form-actions" style={{ justifyContent: 'center' }}>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ padding: '0.5rem 2rem', fontSize: '1rem', width: 'auto', display: 'inline-block' }}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </form>
    </div>
  );
}
