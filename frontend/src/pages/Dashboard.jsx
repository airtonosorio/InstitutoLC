import { useState, useEffect } from 'react';
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
  const [chartData, setChartData] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const fetchAlunos = async () => {
      try {
        const res = await api.get('/Alunos');
        const alunos = res.data;
        setTotal(alunos.length);

        // Agrupar por mês
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const contagemPorMes = new Array(12).fill(0);

        alunos.forEach(aluno => {
          const data = new Date(aluno.dataCadastro);
          const mes = data.getMonth();
          contagemPorMes[mes]++;
        });

        setChartData({
          labels: meses,
          datasets: [
            {
              label: 'Alunos Cadastrados',
              data: contagemPorMes,
              borderColor: '#078C36',
              backgroundColor: 'rgba(7, 140, 54, 0.2)',
              fill: true,
              tension: 0
            }
          ]
        });

      } catch (err) {
        console.error("Erro ao buscar alunos para o dashboard", err);
      }
    };
    fetchAlunos();
  }, []);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Matrículas por Mês em 2026' }
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

      <div className="chart-container glass-panel">
        {chartData ? <Line options={options} data={chartData} /> : <p>Carregando gráfico...</p>}
      </div>
    </div>
  );
}
