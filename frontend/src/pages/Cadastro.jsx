import { useState } from 'react';
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

const applyPhoneMask = (val) => {
  if (!val) return "";
  let v = val.replace(/\D/g, '');
  if (v.length > 11) v = v.slice(0, 11);
  v = v.replace(/^(\d{2})(\d)/g,"($1) $2");
  v = v.replace(/(\d)(\d{4})$/,"$1-$2");
  return v;
};

export default function Cadastro() {
  const [formData, setFormData] = useState({
    nome: '',
    dataNascimento: '',
    cpf: '',
    endereco: '',
    numeroEndereco: '',
    bairro: '',
    municipio: '',
    estado: '',
    escola: '',
    tipoEscola: '0',
    serie: '',
    turno: '0',
    numeroPessoasCasa: '',
    contato1: '',
    contato2: '',
    atividade1: '',
    atividade2: ''
  });

  const [idade, setIdade] = useState(null);
  const [msg, setMsg] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const atividadesConfig = [
    { id: 1, label: 'Futebol de campo', minMonths: 6 * 12, maxMonths: 17 * 12 + 11 },
    { id: 2, label: 'Futsal', minMonths: 6 * 12, maxMonths: 17 * 12 + 11 },
    { id: 3, label: 'Futsal contraturno', minMonths: 6 * 12, maxMonths: 17 * 12 + 11 },
    { id: 4, label: 'Judô', minMonths: 10 * 12, maxMonths: 17 * 12 + 11 },
    { id: 5, label: 'Karatê', minMonths: 5 * 12, maxMonths: 17 * 12 + 11 },
    { id: 6, label: 'Jiu-jitsu', minMonths: 5 * 12, maxMonths: 17 * 12 + 11 },
    { id: 7, label: 'Ballet', minMonths: 5 * 12, maxMonths: 17 * 12 + 11 },
    { id: 8, label: 'Capoeira', minMonths: 14 * 12, maxMonths: 17 * 12 + 11 },
    { id: 9, label: 'Triathlon', minMonths: 8 * 12, maxMonths: 17 * 12 + 11 },
    { id: 10, label: 'Futebol Feminino', minMonths: 6 * 12, maxMonths: 17 * 12 + 11 },
    { id: 11, label: 'Orquestra de Música', minMonths: 8 * 12, maxMonths: 17 * 12 + 11 },
    { id: 12, label: 'Creche', minMonths: 10, maxMonths: 3 * 12 + 11 },
  ];

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
    
    const totalMonths = years * 12 + months;
    let displayAge = '';
    if (years === 0) {
      displayAge = `${months} meses`;
    } else {
      displayAge = `${years} anos`;
    }
    setIdade({ years, months, totalMonths, display: displayAge });
    setFormData(prev => ({ ...prev, atividade1: '', atividade2: '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalVal = value;

    if (name === 'cpf') finalVal = applyCpfMask(value);
    if (name === 'contato1' || name === 'contato2') finalVal = applyPhoneMask(value);

    setFormData(prev => ({ ...prev, [name]: finalVal }));

    if (name === 'dataNascimento') {
      calculateAge(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg('');
    setIsError(false);

    if (!formData.atividade1) {
      setMsg('Atividade 1 é obrigatória.');
      setIsError(true);
      return;
    }

    if (formData.atividade1 === formData.atividade2) {
      setMsg('Atividade 1 e 2 não podem ser iguais.');
      setIsError(true);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ...formData,
        tipoEscola: parseInt(formData.tipoEscola),
        turno: parseInt(formData.turno),
        numeroPessoasCasa: parseInt(formData.numeroPessoasCasa),
        atividade1: parseInt(formData.atividade1),
        atividade2: formData.atividade2 ? parseInt(formData.atividade2) : null
      };

      await api.post('/Alunos', payload);
      setMsg('Aluno cadastrado com sucesso!');
      setFormData({
        nome: '', dataNascimento: '', cpf: '',
        endereco: '', numeroEndereco: '', bairro: '', municipio: '', estado: '',
        escola: '', tipoEscola: '0', serie: '', turno: '0', numeroPessoasCasa: '',
        contato1: '', contato2: '', atividade1: '', atividade2: ''
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
          <h3>Dados Cadastrais</h3>
          <div className="grid-2">
            <div className="form-group">
              <label>Nome Completo *</label>
              <input type="text" name="nome" value={formData.nome} onChange={handleChange} required maxLength="200" />
            </div>
            <div className="form-group">
              <label>CPF *</label>
              <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} required placeholder="000.000.000-00" />
            </div>
            <div className="form-group">
              <label>Data de Nascimento *</label>
              <input type="date" name="dataNascimento" value={formData.dataNascimento} onChange={handleChange} required />
              {idade && <small className="idade-hint">Idade calculada: {idade.display}</small>}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Contato</h3>
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
          <h3>Endereço</h3>
          <div className="grid-3">
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
          </div>
        </div>

        <div className="form-section">
          <h3>Dados Escolares</h3>
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
              <label>Nº de Pessoas na Casa *</label>
              <input type="number" name="numeroPessoasCasa" value={formData.numeroPessoasCasa} onChange={handleChange} required min="1" max="50" />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Atividade</h3>
          <div className="grid-2">
            <div className="form-group">
              <label>Atividade 1 (Obrigatória) *</label>
              <select name="atividade1" value={formData.atividade1} onChange={handleChange} required disabled={!idade}>
                <option value="">{idade ? 'Selecione uma atividade' : 'Preencha a data de nascimento'}</option>
                {idade && atividadesConfig.filter(a => idade.totalMonths >= a.minMonths && idade.totalMonths <= a.maxMonths).map(a => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Atividade 2 (Opcional)</label>
              <select name="atividade2" value={formData.atividade2} onChange={handleChange} disabled={!idade}>
                <option value="">Nenhuma / Opcional</option>
                {idade && atividadesConfig.filter(a => idade.totalMonths >= a.minMonths && idade.totalMonths <= a.maxMonths).map(a => (
                  <option key={a.id} value={a.id}>{a.label}</option>
                ))}
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

