import { useState, useEffect, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import api from '../api';
import './Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function Dashboard() {
  const [alunos, setAlunos] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [total, setTotal] = useState(0);

  // Estados dos Filtros
  const [filterType, setFilterType] = useState('ano'); // 'ano', 'mensal', 'semanal'
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  // Inicialização de semana de segunda a domingo
  const getMonday = (d) => {
    d = new Date(d);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };
  const getSunday = (d) => {
    const mon = getMonday(d);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);
    return sun;
  };
  const formatDateString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [startDate, setStartDate] = useState(formatDateString(getMonday(new Date())));
  const [endDate, setEndDate] = useState(formatDateString(getSunday(new Date())));

  const [chartTitle, setChartTitle] = useState('');

  const mesesNomes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const res = await api.get('/Alunos');
        setAlunos(res.data);
        setTotal(res.data.length);
      } catch (err) {
        console.error("Erro ao buscar alunos para o dashboard", err);
      }
    };
    fetchAlunos();
  }, []);

  useEffect(() => {
    if (alunos.length === 0) {
      // Cria gráfico vazio caso não haja alunos
      setChartData({
        labels: [],
        datasets: [{ label: 'Alunos Cadastrados', data: [], borderColor: '#078C36', fill: true }]
      });
      setChartTitle('Sem matrículas no período');
      return;
    }

    let labels = [];
    let counts = [];
    let title = '';

    if (filterType === 'ano') {
      const mesesLabels = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      labels = mesesLabels;
      counts = new Array(12).fill(0);

      alunos.forEach(aluno => {
        const d = new Date(aluno.dataCadastro);
        if (d.getFullYear() === selectedYear) {
          counts[d.getMonth()]++;
        }
      });
      title = `Matrículas em ${selectedYear}`;

    } else if (filterType === 'mensal') {
      const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
      labels = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));
      counts = new Array(daysInMonth).fill(0);

      alunos.forEach(aluno => {
        const d = new Date(aluno.dataCadastro);
        if (d.getFullYear() === selectedYear && d.getMonth() === selectedMonth) {
          counts[d.getDate() - 1]++;
        }
      });
      title = `Matrículas em ${mesesNomes[selectedMonth]} de ${selectedYear}`;

    } else if (filterType === 'semanal') {
      if (!startDate || !endDate) return;
      const start = new Date(startDate + 'T00:00:00');
      const end = new Date(endDate + 'T23:59:59');

      // Gerar dias do intervalo
      const dates = [];
      let curr = new Date(start);
      let limit = 0;
      while (curr <= end && limit < 100) {
        dates.push(new Date(curr));
        curr.setDate(curr.getDate() + 1);
        limit++;
      }

      labels = dates.map(d => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`);
      counts = new Array(dates.length).fill(0);

      alunos.forEach(aluno => {
        const ad = new Date(aluno.dataCadastro);
        if (ad >= start && ad <= end) {
          // Achar a diferença de dias exata para somar no dia correspondente
          const diffTime = ad.getTime() - start.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays >= 0 && diffDays < counts.length) {
            counts[diffDays]++;
          }
        }
      });

      const formatDateLabel = (dStr) => {
        const pts = dStr.split('-');
        return `${pts[2]}/${pts[1]}/${pts[0]}`;
      };
      title = `Matrículas de ${formatDateLabel(startDate)} a ${formatDateLabel(endDate)}`;
    }

    setChartTitle(title);
    setChartData({
      labels: labels,
      datasets: [
        {
          label: 'Alunos Cadastrados',
          data: counts,
          borderColor: '#078C36',
          backgroundColor: 'rgba(7, 140, 54, 0.2)',
          fill: true,
          tension: 0.1
        }
      ]
    });
  }, [alunos, filterType, selectedYear, selectedMonth, startDate, endDate]);

  // Anos disponíveis dinamicamente dos alunos + ano atual
  const anosDisponiveis = useMemo(() => {
    const anos = Array.from(new Set(alunos.map(a => new Date(a.dataCadastro).getFullYear())));
    const anoAtual = new Date().getFullYear();
    if (!anos.includes(anoAtual)) {
      anos.push(anoAtual);
    }
    return anos.sort((a, b) => b - a);
  }, [alunos]);

  // Import react-chartjs Options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: chartTitle }
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="page-title">Dashboard</h1>

      <div className="stats-cards">
        <div className="stat-card glass-panel">
          <h3>Total de Alunos</h3>
          <div className="stat-value">{total}</div>
          <p>matriculados na instituição</p>
        </div>
      </div>

      <div className="dashboard-filters glass-panel">
        <div className="filter-group">
          <label>Visualização</label>
          <select value={filterType} onChange={e => setFilterType(e.target.value)}>
            <option value="ano">Ano</option>
            <option value="mensal">Mensal</option>
            <option value="semanal">Semanal</option>
          </select>
        </div>

        {filterType !== 'semanal' && (
          <div className="filter-group">
            <label>Ano</label>
            <select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))}>
              {anosDisponiveis.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        )}

        {filterType === 'mensal' && (
          <div className="filter-group">
            <label>Mês</label>
            <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))}>
              {mesesNomes.map((m, idx) => (
                <option key={m} value={idx}>{m}</option>
              ))}
            </select>
          </div>
        )}

        {filterType === 'semanal' && (
          <>
            <div className="filter-group">
              <label>Data de Início</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div className="filter-group">
              <label>Data de Fim</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </>
        )}
      </div>

      <div className="chart-container glass-panel">
        {chartData ? <Line options={options} data={chartData} /> : <p>Carregando gráfico...</p>}
      </div>
    </div>
  );
}
