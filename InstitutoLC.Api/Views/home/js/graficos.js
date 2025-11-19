// Variáveis globais para os gráficos
let graficoPizza = null;
let graficoBarras = null;
let graficoLinha = null;
let graficoSaude = null;

// Função para calcular idade a partir da data de nascimento
function calcularIdade(dataNascimento) {
    if (!dataNascimento) return 0;
    const nascimento = new Date(dataNascimento);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nascimento.getFullYear();
    const mesAtual = hoje.getMonth();
    const diaAtual = hoje.getDate();
    const mesNasc = nascimento.getMonth();
    const diaNasc = nascimento.getDate();
    
    if (mesAtual < mesNasc || (mesAtual === mesNasc && diaAtual < diaNasc)) {
        idade--;
    }
    
    return idade;
}

// Função para atualizar os totais na página
function atualizarTotais(alunos) {
    console.log('Atualizando totais com', alunos.length, 'alunos');
    
    const totalMatriculados = alunos.length;
    let totalPublicas = 0;
    let totalParticulares = 0;

    alunos.forEach(aluno => {
        // tipoEscola: 1 = Pública, 2 = Privada
        console.log('Aluno:', aluno.nome, '- TipoEscola:', aluno.tipoEscola);
        if (aluno.tipoEscola === 1) {
            totalPublicas++;
        } else if (aluno.tipoEscola === 2) {
            totalParticulares++;
        }
    });

    console.log(`Totais calculados - Matriculados: ${totalMatriculados}, Públicas: ${totalPublicas}, Particulares: ${totalParticulares}`);

    // Atualizar elementos na página
    const elemTotalMatriculados = document.getElementById('totalMatriculados');
    const elemTotalPublicas = document.getElementById('totalPublicas');
    const elemTotalParticulares = document.getElementById('totalParticulares');

    if (elemTotalMatriculados) {
        elemTotalMatriculados.textContent = totalMatriculados;
        console.log('totalMatriculados atualizado para:', totalMatriculados);
    } else {
        console.error('Elemento totalMatriculados não encontrado!');
    }
    
    if (elemTotalPublicas) {
        elemTotalPublicas.textContent = totalPublicas;
        console.log('totalPublicas atualizado para:', totalPublicas);
    } else {
        console.error('Elemento totalPublicas não encontrado!');
    }
    
    if (elemTotalParticulares) {
        elemTotalParticulares.textContent = totalParticulares;
        console.log('totalParticulares atualizado para:', totalParticulares);
    } else {
        console.error('Elemento totalParticulares não encontrado!');
    }
    
    // Garantir que as seções estão visíveis
    const secaoInformacoes = document.querySelector('.informacoes');
    const secaoGraficos = document.querySelector('.graficos');
    
    if (secaoInformacoes) {
        secaoInformacoes.style.display = 'block';
        console.log('Seção informacoes está visível');
    } else {
        console.error('Seção .informacoes não encontrada!');
    }
    
    if (secaoGraficos) {
        secaoGraficos.style.display = 'grid';
        console.log('Seção graficos está visível');
    } else {
        console.error('Seção .graficos não encontrada!');
    }
}

// Função para atualizar todos os gráficos
async function atualizarGraficos() {
    try {
        console.log('Carregando dados dos gráficos...');
        
        // Verificar se Chart.js está disponível
        if (typeof Chart === 'undefined') {
            throw new Error('Chart.js não está disponível. Verifique se o CDN foi carregado.');
        }
        
        // Carregar alunos da API (já retorna array após processamento em api.js)
        const alunos = await AlunosAPI.listar();
        
        console.log('Alunos carregados:', alunos);
        
        // Verificar se alunos é um array válido
        if (!Array.isArray(alunos)) {
            console.error('Resposta da API não é um array:', alunos);
            throw new Error('Formato de resposta da API inválido');
        }
        
        console.log(`Total de alunos encontrados: ${alunos.length}`);

        // Atualizar totais
        atualizarTotais(alunos);

        // Contadores para gráfico de pizza
        let publico = 0;
        let particular = 0;

        alunos.forEach(aluno => {
            // tipoEscola: 1 = Pública, 2 = Privada
            if (aluno.tipoEscola === 1) {
                publico++;
            } else if (aluno.tipoEscola === 2) {
                particular++;
            }
        });

        // Atualizar ou criar gráfico de pizza
        const ctxPizza = document.getElementById('graficoPizza');
        if (!ctxPizza) {
            console.error('Elemento graficoPizza não encontrado!');
            throw new Error('Elemento graficoPizza não encontrado no DOM');
        }
        
        console.log(`Valores para gráfico de pizza - Públicas: ${publico}, Particulares: ${particular}`);
        
        if (graficoPizza) {
            graficoPizza.data.datasets[0].data = [publico, particular];
            graficoPizza.update();
            console.log('Gráfico de pizza atualizado');
        } else {
            console.log('Criando gráfico de pizza...');
            graficoPizza = new Chart(ctxPizza.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: ['Pública', 'Particular'],
                    datasets: [{
                        data: [publico, particular],
                        backgroundColor: [
                            'rgba(122, 250, 175, 0.7)',
                            'rgba(20, 128, 38, 0.7)'
                        ],
                        borderColor: [
                            'rgba(0, 0, 0, 1)',
                            'rgba(0, 0, 0, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        }
                    }
                }
            });
            console.log('Gráfico de pizza criado com sucesso!');
        }

        // Gráfico de Barras: Distribuição de Idades 
        const idades = alunos
            .map(aluno => calcularIdade(aluno.dataNascimento))
            .filter(idade => idade >= 5 && idade <= 16);

        // Criar contador de idades (5 a 16)
        const contagemIdades = {};
        for (let i = 5; i <= 16; i++) contagemIdades[i] = 0;

        // Contar quantos alunos têm cada idade
        idades.forEach(idade => {
            contagemIdades[idade]++;
        });

        // Transformar em arrays para o gráfico
        const labelsIdades = Object.keys(contagemIdades);
        const valoresIdades = Object.values(contagemIdades);

        // Atualizar ou criar gráfico de barras
        const ctxBarras = document.getElementById('graficoBarras');
        if (!ctxBarras) {
            console.error('Elemento graficoBarras não encontrado!');
            throw new Error('Elemento graficoBarras não encontrado no DOM');
        }
        
        console.log(`Labels de idades: ${labelsIdades.join(', ')}`);
        console.log(`Valores de idades: ${valoresIdades.join(', ')}`);
        
        if (graficoBarras) {
            graficoBarras.data.labels = labelsIdades;
            graficoBarras.data.datasets[0].data = valoresIdades;
            graficoBarras.update();
            console.log('Gráfico de barras atualizado');
        } else {
            console.log('Criando gráfico de barras...');
            graficoBarras = new Chart(ctxBarras.getContext('2d'), {
                type: 'bar',
                data: {
                    labels: labelsIdades,
                    datasets: [{
                        label: 'Quantidade de Alunos por Idade',
                        data: valoresIdades,
                        backgroundColor: '#54eb5ccc',
                        borderColor: 'rgba(7, 7, 7, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { stepSize: 1 }
                        }
                    }
                }
            });
            console.log('Gráfico de barras criado com sucesso!');
        }

        // GRÁFICO DE LINHA EVOLUÇÃO MENSAL DE NÚMERO DE ALUNOS
        const ctxLinha = document.getElementById('graficoLinha');
        if (!ctxLinha) {
            console.error('Elemento graficoLinha não encontrado!');
            throw new Error('Elemento graficoLinha não encontrado no DOM');
        }
        
        const dadosLinha = [0, 0, 0, 0, 0, alunos.length];
        console.log(`Dados para gráfico de linha: ${dadosLinha.join(', ')}`);
        
        if (graficoLinha) {
            graficoLinha.data.datasets[0].data = dadosLinha;
            graficoLinha.update();
            console.log('Gráfico de linha atualizado');
        } else {
            console.log('Criando gráfico de linha...');
            graficoLinha = new Chart(ctxLinha.getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['6 meses atrás', '5 meses atrás', '4 meses atrás', '3 meses atrás', '2 meses atrás', 'Último mês'],
                    datasets: [{
                        label: 'Alunos Ativos',
                        data: dadosLinha,
                        fill: true,
                        backgroundColor: 'rgba(58, 231, 73, 0.2)',
                        borderColor: 'rgba(4, 110, 27, 1)',
                        borderWidth: 2,
                        tension: 0.3
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { 
                        legend: { position: 'bottom' } 
                    },
                    scales: { y: { beginAtZero: true } }
                }
            });
            console.log('Gráfico de linha criado com sucesso!');
        }

        // GRÁFICO DE PROBLEMAS DE SAÚDE
        const ctxSaude = document.getElementById('graficoSaude');
        if (!ctxSaude) {
            console.error('Elemento graficoSaude não encontrado!');
            throw new Error('Elemento graficoSaude não encontrado no DOM');
        }
        
        // Contar alunos com e sem problema de saúde
        let alunosComProblemaSaude = 0;
        let alunosSemProblemaSaude = 0;

        alunos.forEach(aluno => {
            // Verificar se o aluno tem anamnese e se possui enfermidade
            if (aluno.anamnese && aluno.anamnese.possuiEnfermidade === true) {
                alunosComProblemaSaude++;
            } else {
                alunosSemProblemaSaude++;
            }
        });

        console.log(`Alunos com problema de saúde: ${alunosComProblemaSaude}, Sem problema: ${alunosSemProblemaSaude}`);
        
        if (graficoSaude) {
            graficoSaude.data.datasets[0].data = [alunosComProblemaSaude, alunosSemProblemaSaude];
            graficoSaude.update();
            console.log('Gráfico de saúde atualizado');
        } else {
            console.log('Criando gráfico de saúde...');
            graficoSaude = new Chart(ctxSaude.getContext('2d'), {
                type: 'pie',
                data: {
                    labels: ['Com Problema de Saúde', 'Sem Problema de Saúde'],
                    datasets: [{
                        data: [alunosComProblemaSaude, alunosSemProblemaSaude],
                        backgroundColor: [
                            'rgba(183, 28, 28, 0.7)',  // Vermelho para com problema
                            'rgba(76, 175, 80, 0.7)'   // Verde para sem problema
                        ],
                        borderColor: [
                            'rgba(0, 0, 0, 1)',
                            'rgba(0, 0, 0, 1)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        }
                    }
                }
            });
            console.log('Gráfico de saúde criado com sucesso!');
        }

        console.log('Gráficos atualizados com sucesso!');
    } catch (error) {
        console.error('Erro ao carregar dados para gráficos:', error);
        console.error('Stack trace:', error.stack);
        
        // Verificar se Chart.js está disponível
        if (typeof Chart === 'undefined') {
            console.error('Chart.js não está carregado!');
            mostrarMensagem('Erro: Chart.js não foi carregado. Verifique a conexão com a internet.', 'error');
        } else {
            mostrarMensagem('Erro ao carregar dados estatísticos: ' + error.message, 'error');
        }
    }
}

// Função auxiliar para mostrar mensagens (se não existir)
function mostrarMensagem(mensagem, tipo = 'info') {
    const cores = {
        success: '#4caf50',
        error: '#f44336',
        info: '#2196f3'
    };
    
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${cores[tipo] || cores.info};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10001;
    `;
    toast.textContent = mensagem;
    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            document.body.removeChild(toast);
        }
    }, 3000);
}

// Carregar dados quando a página carregar
window.addEventListener('DOMContentLoaded', async () => {
    console.log('=== INÍCIO DO CARREGAMENTO DE GRÁFICOS ===');
    console.log('DOM carregado');
    
    // Verificar se api.js foi carregado
    if (typeof AlunosAPI === 'undefined') {
        console.error('AlunosAPI não está disponível! Verifique se api.js foi carregado.');
        return;
    }
    console.log('AlunosAPI disponível');
    
    // Verificar se Chart.js está disponível
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js não está disponível ainda! Aguardando carregamento...');
        // Aguardar um pouco e tentar novamente
        let tentativas = 0;
        const maxTentativas = 10;
        const verificarChart = setInterval(async () => {
            tentativas++;
            if (typeof Chart !== 'undefined') {
                clearInterval(verificarChart);
                console.log('Chart.js carregado após', tentativas * 200, 'ms');
                await atualizarGraficos();
            } else if (tentativas >= maxTentativas) {
                clearInterval(verificarChart);
                console.error('Chart.js ainda não está disponível após timeout');
                mostrarMensagem('Erro: Chart.js não foi carregado. Recarregue a página.', 'error');
            }
        }, 200);
    } else {
        console.log('Chart.js já disponível');
        await atualizarGraficos();
    }
    
    console.log('=== FIM DO CARREGAMENTO DE GRÁFICOS ===');
});
