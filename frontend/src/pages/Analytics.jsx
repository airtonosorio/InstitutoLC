import { useEffect, useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Activity, GraduationCap, HeartPulse, TrendingUp, Users } from 'lucide-react';
import { differenceInYears, parseISO } from 'date-fns';
import api from '../api';
import './Analytics.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

const generosMap = {
  1: 'Masculino',
  2: 'Feminino',
  3: 'Outro',
  4: 'Prefiro não dizer'
};

const turnosMap = {
  0: 'Matutino',
  1: 'Matutino',
  2: 'Vespertino',
  3: 'Noturno',
  4: 'Integral'
};

const tipoEscolaMap = {
  0: 'Pública',
  1: 'Pública',
  2: 'Privada'
};

const turnoFilterOptions = {
  1: 'Matutino',
  2: 'Vespertino',
  3: 'Noturno',
  4: 'Integral'
};

const tipoEscolaFilterOptions = {
  1: 'Pública',
  2: 'Privada'
};

const zonaMoradiaMap = {
  1: 'Urbana',
  2: 'Rural'
};

const enfermidadeMap = {
  1: 'Bronquite/Asma',
  2: 'Cardiovascular',
  3: 'Epilepsia/Convulsões',
  4: 'Diabetes',
  5: 'Auditivos',
  6: 'Oculares',
  7: 'Ortopédicos',
  8: 'Alergia',
  9: 'Outros'
};

const palette = ['#078C36', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6', '#64748b', '#db2777'];

const emptyFilters = {
  idadeMin: '',
  idadeMax: '',
  atividade: '',
  genero: '',
  turno: '',
  tipoEscola: '',
  zonaMoradia: '',
  enturmado: '',
  beneficio: '',
  saude: '',
  dataInicio: '',
  dataFim: ''
};

const asNumber = value => value === null || value === undefined || value === '' ? null : Number(value);

const normalizeTurno = value => Number(value) === 0 ? 1 : Number(value);

const normalizeTipoEscola = value => Number(value) === 2 ? 2 : 1;

const getAge = aluno => {
  if (!aluno.dataNascimento) return null;
  const date = typeof aluno.dataNascimento === 'string' ? parseISO(aluno.dataNascimento) : new Date(aluno.dataNascimento);
  if (Number.isNaN(date.getTime())) return null;
  return differenceInYears(new Date(), date);
};

const countBy = (items, getKey) => {
  const map = new Map();
  items.forEach(item => {
    const key = getKey(item);
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  });
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
};

const topEntries = (entries, limit = 8) => entries.slice(0, limit);

const makeDoughnutData = entries => ({
  labels: entries.map(([label]) => label),
  datasets: [{
    data: entries.map(([, value]) => value),
    backgroundColor: palette,
    borderColor: '#ffffff',
    borderWidth: 2
  }]
});

const makeBarData = (entries, label) => ({
  labels: entries.map(([name]) => name),
  datasets: [{
    label,
    data: entries.map(([, value]) => value),
    backgroundColor: entries.map((_, index) => palette[index % palette.length]),
    borderRadius: 6
  }]
});

export default function Analytics() {
  const [alunos, setAlunos] = useState([]);
  const [atividades, setAtividades] = useState([]);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [alunosRes, atividadesRes] = await Promise.all([
          api.get('/Alunos'),
          api.get('/Atividades')
        ]);
        setAlunos(alunosRes.data || []);
        setAtividades(atividadesRes.data || []);
      } catch (err) {
        console.error('Erro ao carregar analytics:', err);
        setError('Não foi possível carregar os dados de analytics.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const atividadesMap = useMemo(() => {
    const map = {};
    atividades.forEach(atividade => {
      map[atividade.id] = atividade.nome;
    });
    return map;
  }, [atividades]);

  const filteredAlunos = useMemo(() => {
    return alunos.filter(aluno => {
      const idade = getAge(aluno);
      const idadeMin = asNumber(filters.idadeMin);
      const idadeMax = asNumber(filters.idadeMax);

      if (idadeMin !== null && (idade === null || idade < idadeMin)) return false;
      if (idadeMax !== null && (idade === null || idade > idadeMax)) return false;

      if (filters.atividade) {
        const atividadeId = Number(filters.atividade);
        if (Number(aluno.atividade1) !== atividadeId && Number(aluno.atividade2) !== atividadeId) return false;
      }

      if (filters.genero && Number(aluno.genero) !== Number(filters.genero)) return false;
      if (filters.turno && normalizeTurno(aluno.turno) !== Number(filters.turno)) return false;
      if (filters.tipoEscola !== '' && normalizeTipoEscola(aluno.tipoEscola) !== Number(filters.tipoEscola)) return false;
      if (filters.zonaMoradia && Number(aluno.zonaMoradia) !== Number(filters.zonaMoradia)) return false;
      if (filters.enturmado !== '' && Boolean(aluno.enturmado) !== (filters.enturmado === 'sim')) return false;
      if (filters.beneficio !== '' && Boolean(aluno.recebeBeneficio) !== (filters.beneficio === 'sim')) return false;
      if (filters.saude !== '' && Boolean(aluno.anamnese?.possuiEnfermidade) !== (filters.saude === 'sim')) return false;

      if (filters.dataInicio) {
        const inicio = new Date(`${filters.dataInicio}T00:00:00`);
        const cadastro = new Date(aluno.dataCadastro);
        if (cadastro < inicio) return false;
      }

      if (filters.dataFim) {
        const fim = new Date(`${filters.dataFim}T23:59:59`);
        const cadastro = new Date(aluno.dataCadastro);
        if (cadastro > fim) return false;
      }

      return true;
    });
  }, [alunos, filters]);

  const analytics = useMemo(() => {
    const total = filteredAlunos.length;
    const ages = filteredAlunos.map(getAge).filter(age => age !== null);
    const mediaIdade = ages.length ? ages.reduce((acc, age) => acc + age, 0) / ages.length : 0;
    const enturmados = filteredAlunos.filter(aluno => aluno.enturmado).length;
    const comBeneficio = filteredAlunos.filter(aluno => aluno.recebeBeneficio).length;
    const comAlertaSaude = filteredAlunos.filter(aluno => aluno.anamnese?.possuiEnfermidade).length;

    const atividadeEntries = countBy(
      filteredAlunos.flatMap(aluno => [aluno.atividade1, aluno.atividade2].filter(Boolean)),
      id => atividadesMap[id] || `Atividade ${id}`
    );

    const idadeEntries = [
      ['0-3 anos', ages.filter(age => age <= 3).length],
      ['4-5 anos', ages.filter(age => age >= 4 && age <= 5).length],
      ['6-9 anos', ages.filter(age => age >= 6 && age <= 9).length],
      ['10-13 anos', ages.filter(age => age >= 10 && age <= 13).length],
      ['14-17 anos', ages.filter(age => age >= 14 && age <= 17).length],
      ['18+ anos', ages.filter(age => age >= 18).length]
    ].filter(([, value]) => value > 0);

    const generoEntries = countBy(filteredAlunos, aluno => generosMap[aluno.genero] || 'Não informado');
    const turnoEntries = countBy(filteredAlunos, aluno => turnosMap[normalizeTurno(aluno.turno)] || 'Não informado');
    const escolaEntries = countBy(filteredAlunos, aluno => aluno.escola?.trim() || 'Não informada');
    const bairroEntries = countBy(filteredAlunos, aluno => aluno.bairro?.trim() || 'Não informado');
    const tipoEscolaEntries = countBy(filteredAlunos, aluno => tipoEscolaMap[normalizeTipoEscola(aluno.tipoEscola)] || 'Não informado');
    const zonaEntries = countBy(filteredAlunos, aluno => zonaMoradiaMap[aluno.zonaMoradia] || 'Não informada');

    const enfermidadeEntries = countBy(
      filteredAlunos.flatMap(aluno => aluno.anamnese?.enfermidades || []),
      enf => enfermidadeMap[enf.tipoEnfermidade] || 'Outros'
    );

    const monthlyMap = new Map();
    filteredAlunos.forEach(aluno => {
      if (!aluno.dataCadastro) return;
      const date = new Date(aluno.dataCadastro);
      if (Number.isNaN(date.getTime())) return;
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap.set(key, (monthlyMap.get(key) || 0) + 1);
    });

    const monthlyEntries = [...monthlyMap.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, value]) => {
        const [year, month] = key.split('-');
        return [`${month}/${year.slice(2)}`, value];
      });

    return {
      total,
      mediaIdade,
      enturmados,
      comBeneficio,
      comAlertaSaude,
      atividadeEntries,
      idadeEntries,
      generoEntries,
      turnoEntries,
      escolaEntries,
      bairroEntries,
      tipoEscolaEntries,
      zonaEntries,
      enfermidadeEntries,
      monthlyEntries
    };
  }, [filteredAlunos, atividadesMap]);

  const percent = value => analytics.total ? Math.round((value / analytics.total) * 100) : 0;

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, color: '#374151' }
      }
    }
  };

  const barOptions = {
    ...commonOptions,
    scales: {
      x: { grid: { display: false }, ticks: { color: '#6b7280' } },
      y: { beginAtZero: true, ticks: { precision: 0, color: '#6b7280' } }
    }
  };

  const horizontalBarOptions = {
    ...barOptions,
    indexAxis: 'y',
    scales: {
      x: { beginAtZero: true, ticks: { precision: 0, color: '#6b7280' } },
      y: { grid: { display: false }, ticks: { color: '#6b7280' } }
    }
  };

  const monthlyData = {
    labels: analytics.monthlyEntries.map(([label]) => label),
    datasets: [{
      label: 'Matrículas',
      data: analytics.monthlyEntries.map(([, value]) => value),
      borderColor: '#078C36',
      backgroundColor: 'rgba(7, 140, 54, 0.16)',
      tension: 0.25,
      fill: true
    }]
  };

  const socialData = makeBarData([
    ['Enturmados', analytics.enturmados],
    ['Em espera', Math.max(analytics.total - analytics.enturmados, 0)],
    ['Com benefício', analytics.comBeneficio],
    ['Alerta de saúde', analytics.comAlertaSaude]
  ], 'Alunos');

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="analytics-container">
      <div className="analytics-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="analytics-subtitle">Indicadores consolidados de matrículas, perfil dos alunos, atividades e saúde.</p>
        </div>
        <button className="btn btn-cancel" onClick={() => setFilters(emptyFilters)}>Limpar filtros</button>
      </div>

      <section className="analytics-filters glass-panel">
        <div className="filter-group">
          <label>Idade mínima</label>
          <input type="number" min="0" value={filters.idadeMin} onChange={e => handleFilterChange('idadeMin', e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Idade máxima</label>
          <input type="number" min="0" value={filters.idadeMax} onChange={e => handleFilterChange('idadeMax', e.target.value)} />
        </div>
        <div className="filter-group wide">
          <label>Atividade</label>
          <select value={filters.atividade} onChange={e => handleFilterChange('atividade', e.target.value)}>
            <option value="">Todas</option>
            {atividades.map(atividade => (
              <option key={atividade.id} value={atividade.id}>{atividade.nome}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Gênero</label>
          <select value={filters.genero} onChange={e => handleFilterChange('genero', e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(generosMap).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Turno</label>
          <select value={filters.turno} onChange={e => handleFilterChange('turno', e.target.value)}>
            <option value="">Todos</option>
            {Object.entries(turnoFilterOptions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Tipo de escola</label>
          <select value={filters.tipoEscola} onChange={e => handleFilterChange('tipoEscola', e.target.value)}>
            <option value="">Todas</option>
            {Object.entries(tipoEscolaFilterOptions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Moradia</label>
          <select value={filters.zonaMoradia} onChange={e => handleFilterChange('zonaMoradia', e.target.value)}>
            <option value="">Todas</option>
            {Object.entries(zonaMoradiaMap).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Enturmação</label>
          <select value={filters.enturmado} onChange={e => handleFilterChange('enturmado', e.target.value)}>
            <option value="">Todos</option>
            <option value="sim">Enturmados</option>
            <option value="nao">Em espera</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Benefício</label>
          <select value={filters.beneficio} onChange={e => handleFilterChange('beneficio', e.target.value)}>
            <option value="">Todos</option>
            <option value="sim">Recebe</option>
            <option value="nao">Não recebe</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Saúde</label>
          <select value={filters.saude} onChange={e => handleFilterChange('saude', e.target.value)}>
            <option value="">Todos</option>
            <option value="sim">Com alerta</option>
            <option value="nao">Sem alerta</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Data inicial</label>
          <input type="date" value={filters.dataInicio} onChange={e => handleFilterChange('dataInicio', e.target.value)} />
        </div>
        <div className="filter-group">
          <label>Data final</label>
          <input type="date" value={filters.dataFim} onChange={e => handleFilterChange('dataFim', e.target.value)} />
        </div>
      </section>

      {error && <div className="analytics-alert">{error}</div>}

      <section className="analytics-kpis">
        <div className="analytics-kpi glass-panel">
          <Users size={22} />
          <span>Total filtrado</span>
          <strong>{loading ? '...' : analytics.total}</strong>
          <small>de {alunos.length} alunos cadastrados</small>
        </div>
        <div className="analytics-kpi glass-panel">
          <TrendingUp size={22} />
          <span>Idade média</span>
          <strong>{analytics.mediaIdade.toFixed(1)}</strong>
          <small>anos no grupo filtrado</small>
        </div>
        <div className="analytics-kpi glass-panel">
          <Activity size={22} />
          <span>Enturmados</span>
          <strong>{percent(analytics.enturmados)}%</strong>
          <small>{analytics.enturmados} alunos em turmas</small>
        </div>
        <div className="analytics-kpi glass-panel">
          <HeartPulse size={22} />
          <span>Alertas de saúde</span>
          <strong>{analytics.comAlertaSaude}</strong>
          <small>{percent(analytics.comAlertaSaude)}% do filtro atual</small>
        </div>
        <div className="analytics-kpi glass-panel">
          <GraduationCap size={22} />
          <span>Benefício social</span>
          <strong>{percent(analytics.comBeneficio)}%</strong>
          <small>{analytics.comBeneficio} alunos declarados</small>
        </div>
      </section>

      <section className="analytics-grid">
        <div className="analytics-chart glass-panel span-2">
          <div className="chart-heading">
            <h2>Evolução de matrículas</h2>
            <span>últimos 12 meses no filtro</span>
          </div>
          <div className="chart-frame">
            <Line options={barOptions} data={monthlyData} />
          </div>
        </div>

        <div className="analytics-chart glass-panel">
          <div className="chart-heading">
            <h2>Faixa etária</h2>
            <span>distribuição do público</span>
          </div>
          <div className="chart-frame compact">
            <Doughnut options={commonOptions} data={makeDoughnutData(analytics.idadeEntries)} />
          </div>
        </div>

        <div className="analytics-chart glass-panel span-2">
          <div className="chart-heading">
            <h2>Atividades mais procuradas</h2>
            <span>atividade principal e secundária</span>
          </div>
          <div className="chart-frame tall">
            <Bar options={horizontalBarOptions} data={makeBarData(topEntries(analytics.atividadeEntries, 10), 'Seleções')} />
          </div>
        </div>

        <div className="analytics-chart glass-panel">
          <div className="chart-heading">
            <h2>Gênero</h2>
            <span>perfil informado</span>
          </div>
          <div className="chart-frame compact">
            <Doughnut options={commonOptions} data={makeDoughnutData(analytics.generoEntries)} />
          </div>
        </div>

        <div className="analytics-chart glass-panel">
          <div className="chart-heading">
            <h2>Situação geral</h2>
            <span>enturmação, benefício e saúde</span>
          </div>
          <div className="chart-frame">
            <Bar options={barOptions} data={socialData} />
          </div>
        </div>

        <div className="analytics-chart glass-panel">
          <div className="chart-heading">
            <h2>Turnos</h2>
            <span>distribuição escolar</span>
          </div>
          <div className="chart-frame">
            <Bar options={barOptions} data={makeBarData(analytics.turnoEntries, 'Alunos')} />
          </div>
        </div>

        <div className="analytics-chart glass-panel">
          <div className="chart-heading">
            <h2>Tipo de escola</h2>
            <span>rede de origem</span>
          </div>
          <div className="chart-frame compact">
            <Doughnut options={commonOptions} data={makeDoughnutData(analytics.tipoEscolaEntries)} />
          </div>
        </div>

        <div className="analytics-chart glass-panel">
          <div className="chart-heading">
            <h2>Zona de moradia</h2>
            <span>território declarado</span>
          </div>
          <div className="chart-frame compact">
            <Doughnut options={commonOptions} data={makeDoughnutData(analytics.zonaEntries)} />
          </div>
        </div>
      </section>

      <section className="analytics-lists">
        <Ranking title="Top escolas" entries={analytics.escolaEntries} />
        <Ranking title="Top bairros" entries={analytics.bairroEntries} />
        <Ranking title="Alertas de saúde" entries={analytics.enfermidadeEntries} emptyText="Sem alertas no filtro atual" />
      </section>
    </div>
  );
}

function Ranking({ title, entries, emptyText = 'Sem dados no filtro atual' }) {
  const visibleEntries = topEntries(entries, 6);
  const total = entries.reduce((acc, [, value]) => acc + value, 0);

  return (
    <div className="analytics-ranking glass-panel">
      <h2>{title}</h2>
      {visibleEntries.length === 0 ? (
        <p className="empty-ranking">{emptyText}</p>
      ) : (
        <ul>
          {visibleEntries.map(([label, value]) => (
            <li key={label}>
              <div>
                <strong>{label}</strong>
                <span>{total ? Math.round((value / total) * 100) : 0}% do grupo</span>
              </div>
              <em>{value}</em>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
