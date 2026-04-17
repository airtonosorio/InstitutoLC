const DASHBOARD_COLORS = {
    forest: '#0B5F3A',
    green: '#149B58',
    mint: '#7BE4B4',
    sea: '#127A67',
    gold: '#E5B94A',
    coral: '#D46A54',
    olive: '#7E9B36',
    soft: '#DCE9DE'
};

const TURNO_LABELS = {
    1: 'Matutino',
    2: 'Vespertino',
    3: 'Noturno',
    4: 'Integral'
};

const ESCOLA_LABELS = {
    1: 'Publica',
    2: 'Privada'
};

const ENFERMIDADE_LABELS = {
    1: 'Bronquite / Asma',
    2: 'Doenca cardiaca',
    3: 'Epilepsia',
    4: 'Diabetes',
    5: 'Problema auditivo',
    6: 'Problema visual',
    7: 'Doenca ortopedica',
    8: 'Alergia',
    9: 'Outros'
};

const MONTH_LABELS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

const dashboardState = {
    alunos: [],
    filtrados: [],
    charts: {}
};

document.addEventListener('DOMContentLoaded', () => {
    inicializarDashboard().catch((error) => {
        console.error('Erro ao iniciar dashboard:', error);
        atualizarTexto('filtersSummary', 'Nao foi possivel carregar o dashboard.');
        mostrarMensagem('Erro ao carregar dashboard: ' + error.message, 'error');
    });
});

async function inicializarDashboard() {
    configurarEventos();
    await aguardarDependencias();
    await carregarAlunos();
}

async function aguardarDependencias() {
    const tentativasMaximas = 20;

    for (let tentativa = 0; tentativa < tentativasMaximas; tentativa++) {
        if (typeof AlunosAPI !== 'undefined' && typeof Chart !== 'undefined') {
            return;
        }

        await new Promise((resolve) => setTimeout(resolve, 150));
    }

    throw new Error('Dependencias do dashboard nao foram carregadas.');
}

function configurarEventos() {
    const ids = ['filtroBusca', 'filtroTipoEscola', 'filtroTurno', 'filtroEstado', 'filtroMunicipio', 'filtroSaude'];

    ids.forEach((id) => {
        const elemento = document.getElementById(id);
        if (!elemento) {
            return;
        }

        const evento = id === 'filtroBusca' ? 'input' : 'change';
        elemento.addEventListener(evento, () => {
            if (id === 'filtroEstado') {
                atualizarMunicipiosDisponiveis();
            }

            aplicarFiltros();
        });
    });

    const limparFiltros = document.getElementById('limparFiltros');
    if (limparFiltros) {
        limparFiltros.addEventListener('click', () => {
            resetarFiltros();
            aplicarFiltros();
        });
    }
}

async function carregarAlunos() {
    atualizarTexto('filtersSummary', 'Carregando dados do dashboard...');

    const resposta = await AlunosAPI.listar();
    dashboardState.alunos = Array.isArray(resposta) ? resposta.map(normalizarAluno) : [];

    preencherEstados();
    atualizarMunicipiosDisponiveis();
    aplicarFiltros();
}

function normalizarAluno(raw) {
    const anamneseBruta = raw.anamnese ?? raw.Anamnese ?? null;
    const enfermidadesBrutas = anamneseBruta?.enfermidades ?? anamneseBruta?.Enfermidades ?? [];

    return {
        id: Number(raw.id ?? raw.Id ?? 0),
        nome: textoSeguro(raw.nome ?? raw.Nome),
        cpf: somenteDigitos(raw.cpf ?? raw.CPF),
        escola: textoSeguro(raw.escola ?? raw.Escola),
        serie: textoSeguro(raw.serie ?? raw.Serie),
        municipio: textoSeguro(raw.municipio ?? raw.Municipio),
        estado: textoSeguro(raw.estado ?? raw.Estado).toUpperCase(),
        tipoEscola: Number(raw.tipoEscola ?? raw.TipoEscola ?? 0),
        turno: Number(raw.turno ?? raw.Turno ?? 0),
        dataNascimento: raw.dataNascimento ?? raw.DataNascimento ?? null,
        dataCadastro: raw.dataCadastro ?? raw.DataCadastro ?? null,
        anamnese: anamneseBruta ? {
            possuiEnfermidade: Boolean(anamneseBruta.possuiEnfermidade ?? anamneseBruta.PossuiEnfermidade),
            enfermidades: Array.isArray(enfermidadesBrutas)
                ? enfermidadesBrutas.map((item) => ({
                    tipoEnfermidade: Number(item.tipoEnfermidade ?? item.TipoEnfermidade ?? 0),
                    descricao: textoSeguro(item.descricao ?? item.Descricao)
                }))
                : []
        } : null
    };
}

function textoSeguro(valor) {
    return String(valor ?? '').trim();
}

function somenteDigitos(valor) {
    return String(valor ?? '').replace(/\D/g, '');
}

function preencherEstados() {
    const seletor = document.getElementById('filtroEstado');
    if (!seletor) {
        return;
    }

    const atual = seletor.value;
    const estados = Array.from(new Set(
        dashboardState.alunos
            .map((aluno) => aluno.estado)
            .filter(Boolean)
    )).sort((a, b) => a.localeCompare(b, 'pt-BR'));

    seletor.innerHTML = '<option value="">Todos</option>';

    estados.forEach((estado) => {
        const option = document.createElement('option');
        option.value = estado;
        option.textContent = estado;
        seletor.appendChild(option);
    });

    seletor.value = estados.includes(atual) ? atual : '';
}

function atualizarMunicipiosDisponiveis() {
    const seletorEstado = document.getElementById('filtroEstado');
    const seletorMunicipio = document.getElementById('filtroMunicipio');

    if (!seletorEstado || !seletorMunicipio) {
        return;
    }

    const estadoSelecionado = seletorEstado.value;
    const municipioAtual = seletorMunicipio.value;

    const municipios = Array.from(new Set(
        dashboardState.alunos
            .filter((aluno) => !estadoSelecionado || aluno.estado === estadoSelecionado)
            .map((aluno) => aluno.municipio)
            .filter(Boolean)
    )).sort((a, b) => a.localeCompare(b, 'pt-BR'));

    seletorMunicipio.innerHTML = '<option value="">Todos</option>';

    municipios.forEach((municipio) => {
        const option = document.createElement('option');
        option.value = municipio;
        option.textContent = municipio;
        seletorMunicipio.appendChild(option);
    });

    seletorMunicipio.value = municipios.includes(municipioAtual) ? municipioAtual : '';
}

function resetarFiltros() {
    atualizarCampo('filtroBusca', '');
    atualizarCampo('filtroTipoEscola', '');
    atualizarCampo('filtroTurno', '');
    atualizarCampo('filtroEstado', '');
    atualizarMunicipiosDisponiveis();
    atualizarCampo('filtroMunicipio', '');
    atualizarCampo('filtroSaude', '');
}

function atualizarCampo(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.value = valor;
    }
}

function aplicarFiltros() {
    const filtros = lerFiltros();

    dashboardState.filtrados = dashboardState.alunos.filter((aluno) => {
        return correspondeBusca(aluno, filtros.busca)
            && correspondeTipoEscola(aluno, filtros.tipoEscola)
            && correspondeTurno(aluno, filtros.turno)
            && correspondeEstado(aluno, filtros.estado)
            && correspondeMunicipio(aluno, filtros.municipio)
            && correspondeSaude(aluno, filtros.saude);
    });

    renderizarDashboard(filtros);
}

function lerFiltros() {
    return {
        busca: textoSeguro(document.getElementById('filtroBusca')?.value),
        tipoEscola: textoSeguro(document.getElementById('filtroTipoEscola')?.value),
        turno: textoSeguro(document.getElementById('filtroTurno')?.value),
        estado: textoSeguro(document.getElementById('filtroEstado')?.value),
        municipio: textoSeguro(document.getElementById('filtroMunicipio')?.value),
        saude: textoSeguro(document.getElementById('filtroSaude')?.value)
    };
}

function correspondeBusca(aluno, busca) {
    if (!busca) {
        return true;
    }

    const termo = normalizarTexto(busca);
    const termoNumerico = somenteDigitos(busca);
    const campos = [
        aluno.nome,
        aluno.escola,
        aluno.municipio,
        aluno.serie,
        aluno.estado
    ].map(normalizarTexto);

    const bateTexto = campos.some((campo) => campo.includes(termo));
    const bateCpf = termoNumerico ? aluno.cpf.includes(termoNumerico) : false;

    return bateTexto || bateCpf;
}

function correspondeTipoEscola(aluno, tipoEscola) {
    return !tipoEscola || String(aluno.tipoEscola) === tipoEscola;
}

function correspondeTurno(aluno, turno) {
    return !turno || String(aluno.turno) === turno;
}

function correspondeEstado(aluno, estado) {
    return !estado || aluno.estado === estado;
}

function correspondeMunicipio(aluno, municipio) {
    return !municipio || aluno.municipio === municipio;
}

function correspondeSaude(aluno, saude) {
    if (!saude) {
        return true;
    }

    const possuiRegistro = possuiRegistroSaude(aluno);
    return saude === 'com' ? possuiRegistro : !possuiRegistro;
}

function normalizarTexto(valor) {
    return textoSeguro(valor)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function renderizarDashboard(filtros) {
    const total = dashboardState.filtrados.length;
    atualizarTexto('heroTotal', String(total));
    atualizarTexto('heroAtualizacao', formatarMomentoAtual());

    renderizarResumoFiltros(filtros);
    renderizarCards();
    renderizarGraficos();
    renderizarRankingMunicipios();
    renderizarInsights();
}

function renderizarResumoFiltros(filtros) {
    const totalGeral = dashboardState.alunos.length;
    const totalFiltrado = dashboardState.filtrados.length;

    const mensagem = totalFiltrado === totalGeral
        ? `Exibindo todos os ${totalFiltrado} alunos cadastrados.`
        : `Mostrando ${totalFiltrado} de ${totalGeral} alunos no recorte atual.`;

    atualizarTexto('filtersSummary', mensagem);

    const chips = [];
    if (filtros.busca) chips.push(`Busca: ${filtros.busca}`);
    if (filtros.tipoEscola) chips.push(`Escola: ${ESCOLA_LABELS[filtros.tipoEscola] ?? filtros.tipoEscola}`);
    if (filtros.turno) chips.push(`Turno: ${TURNO_LABELS[filtros.turno] ?? filtros.turno}`);
    if (filtros.estado) chips.push(`Estado: ${filtros.estado}`);
    if (filtros.municipio) chips.push(`Municipio: ${filtros.municipio}`);
    if (filtros.saude) chips.push(`Saude: ${filtros.saude === 'com' ? 'Com registro' : 'Sem registro'}`);

    const container = document.getElementById('activeChips');
    if (!container) {
        return;
    }

    if (!chips.length) {
        container.innerHTML = '<span class="chip chipNeutral">Sem filtros ativos</span>';
        return;
    }

    container.innerHTML = chips.map((texto) => `<span class="chip">${texto}</span>`).join('');
}

function renderizarCards() {
    const alunos = dashboardState.filtrados;
    const total = alunos.length;
    const publicos = contar(alunos, (aluno) => aluno.tipoEscola === 1);
    const privados = contar(alunos, (aluno) => aluno.tipoEscola === 2);
    const percentualPublicos = percentual(publicos, total);
    const mediaIdade = calcularMediaIdade(alunos);
    const faixaDominante = obterFaixaEtariaDominante(alunos);
    const registrosSaude = contar(alunos, possuiRegistroSaude);
    const percentualSaude = percentual(registrosSaude, total);
    const municipios = new Set(alunos.map((aluno) => aluno.municipio).filter(Boolean));
    const estados = new Set(alunos.map((aluno) => aluno.estado).filter(Boolean));
    const turnoDominante = obterEntradaDominante(alunos, (aluno) => TURNO_LABELS[aluno.turno] ?? 'Nao informado');

    atualizarTexto('metricTotal', String(total));
    atualizarTexto('metricTotalMeta', `${dashboardState.alunos.length} alunos no total do sistema.`);

    atualizarTexto('metricEscolas', `${percentualPublicos}%`);
    atualizarTexto('metricEscolasMeta', `${publicos} publicos e ${privados} privados no recorte.`);

    atualizarTexto('metricIdade', mediaIdade ? `${mediaIdade.toFixed(1)} anos` : '--');
    atualizarTexto('metricIdadeMeta', faixaDominante ? `Faixa dominante: ${faixaDominante.label}.` : 'Sem idade suficiente para leitura.');

    atualizarTexto('metricSaude', `${percentualSaude}%`);
    atualizarTexto('metricSaudeMeta', `${registrosSaude} alunos com registro de saude.`);

    atualizarTexto('metricTerritorio', String(municipios.size));
    atualizarTexto('metricTerritorioMeta', `${estados.size} estados e ${municipios.size} municipios no recorte.`);

    atualizarTexto('metricTurno', turnoDominante ? turnoDominante.label : '--');
    atualizarTexto('metricTurnoMeta', turnoDominante ? `${turnoDominante.count} alunos nesse turno.` : 'Sem dados suficientes.');
}

function renderizarGraficos() {
    const alunos = dashboardState.filtrados;
    const cadastros = montarSerieCadastros(alunos);
    const escolas = montarSerieEscolas(alunos);
    const turnos = montarSerieTurnos(alunos);
    const idades = montarSerieIdades(alunos);
    const saude = montarSerieSaude(alunos);

    atualizarGrafico('cadastros', 'chartCadastros', {
        type: 'line',
        data: {
            labels: cadastros.labels,
            datasets: [{
                label: 'Cadastros',
                data: cadastros.values,
                fill: true,
                backgroundColor: 'rgba(20, 155, 88, 0.12)',
                borderColor: DASHBOARD_COLORS.green,
                borderWidth: 3,
                tension: 0.35,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#FFFFFF',
                pointBorderColor: DASHBOARD_COLORS.green,
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });

    atualizarGrafico('escolas', 'chartEscolas', {
        type: 'doughnut',
        data: {
            labels: escolas.labels,
            datasets: [{
                data: escolas.values,
                backgroundColor: escolas.placeholder ? [DASHBOARD_COLORS.soft] : [DASHBOARD_COLORS.green, DASHBOARD_COLORS.mint],
                borderWidth: 0
            }]
        },
        options: opcoesDoughnut()
    });

    atualizarGrafico('turnos', 'chartTurnos', {
        type: 'polarArea',
        data: {
            labels: turnos.labels,
            datasets: [{
                data: turnos.values,
                backgroundColor: turnos.placeholder
                    ? [DASHBOARD_COLORS.soft]
                    : ['rgba(20, 155, 88, 0.78)', 'rgba(18, 122, 103, 0.74)', 'rgba(212, 106, 84, 0.72)', 'rgba(229, 185, 74, 0.72)'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    grid: { color: 'rgba(4, 90, 35, 0.08)' },
                    pointLabels: { color: '#305146' },
                    ticks: { display: false }
                }
            },
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });

    atualizarGrafico('idades', 'chartIdades', {
        type: 'bar',
        data: {
            labels: idades.labels,
            datasets: [{
                label: 'Alunos',
                data: idades.values,
                backgroundColor: [DASHBOARD_COLORS.green, DASHBOARD_COLORS.sea, DASHBOARD_COLORS.gold, DASHBOARD_COLORS.coral],
                borderRadius: 12,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { precision: 0 }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });

    atualizarGrafico('saude', 'chartSaude', {
        type: 'doughnut',
        data: {
            labels: saude.labels,
            datasets: [{
                data: saude.values,
                backgroundColor: saude.placeholder ? [DASHBOARD_COLORS.soft] : [DASHBOARD_COLORS.coral, DASHBOARD_COLORS.green],
                borderWidth: 0
            }]
        },
        options: opcoesDoughnut()
    });
}

function opcoesDoughnut() {
    return {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
            legend: {
                position: 'bottom'
            }
        }
    };
}

function montarSerieCadastros(alunos) {
    const hoje = new Date();
    const periodo = [];
    const contagem = new Map();

    for (let indice = 5; indice >= 0; indice--) {
        const data = new Date(hoje.getFullYear(), hoje.getMonth() - indice, 1);
        const chave = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
        periodo.push({
            key: chave,
            label: `${MONTH_LABELS[data.getMonth()]}/${String(data.getFullYear()).slice(-2)}`
        });
        contagem.set(chave, 0);
    }

    alunos.forEach((aluno) => {
        const dataCadastro = converterData(aluno.dataCadastro);
        if (!dataCadastro) {
            return;
        }

        const chave = `${dataCadastro.getFullYear()}-${String(dataCadastro.getMonth() + 1).padStart(2, '0')}`;
        if (contagem.has(chave)) {
            contagem.set(chave, contagem.get(chave) + 1);
        }
    });

    return {
        labels: periodo.map((item) => item.label),
        values: periodo.map((item) => contagem.get(item.key) ?? 0)
    };
}

function montarSerieEscolas(alunos) {
    const publicos = contar(alunos, (aluno) => aluno.tipoEscola === 1);
    const privados = contar(alunos, (aluno) => aluno.tipoEscola === 2);

    if (!publicos && !privados) {
        return { labels: ['Sem dados'], values: [1], placeholder: true };
    }

    return { labels: ['Publica', 'Privada'], values: [publicos, privados], placeholder: false };
}

function montarSerieTurnos(alunos) {
    const valores = [1, 2, 3, 4].map((turno) => contar(alunos, (aluno) => aluno.turno === turno));

    if (valores.every((valor) => valor === 0)) {
        return { labels: ['Sem dados'], values: [1], placeholder: true };
    }

    return { labels: ['Matutino', 'Vespertino', 'Noturno', 'Integral'], values: valores, placeholder: false };
}

function montarSerieIdades(alunos) {
    const faixas = {
        '5 a 7 anos': 0,
        '8 a 10 anos': 0,
        '11 a 13 anos': 0,
        '14+ anos': 0
    };

    alunos.forEach((aluno) => {
        const idade = calcularIdade(aluno.dataNascimento);
        if (idade <= 0) {
            return;
        }

        if (idade <= 7) faixas['5 a 7 anos']++;
        else if (idade <= 10) faixas['8 a 10 anos']++;
        else if (idade <= 13) faixas['11 a 13 anos']++;
        else faixas['14+ anos']++;
    });

    return { labels: Object.keys(faixas), values: Object.values(faixas) };
}

function montarSerieSaude(alunos) {
    const comRegistro = contar(alunos, possuiRegistroSaude);
    const semRegistro = Math.max(alunos.length - comRegistro, 0);

    if (!alunos.length) {
        return { labels: ['Sem dados'], values: [1], placeholder: true };
    }

    return { labels: ['Com registro', 'Sem registro'], values: [comRegistro, semRegistro], placeholder: false };
}

function atualizarGrafico(chave, elementId, config) {
    const canvas = document.getElementById(elementId);
    if (!canvas) {
        return;
    }

    const existente = dashboardState.charts[chave];
    if (existente) {
        existente.config.type = config.type;
        existente.data = config.data;
        existente.options = config.options;
        existente.update();
        return;
    }

    dashboardState.charts[chave] = new Chart(canvas.getContext('2d'), config);
}

function renderizarRankingMunicipios() {
    const container = document.getElementById('municipiosRanking');
    if (!container) {
        return;
    }

    const ranking = obterTopEntradas(dashboardState.filtrados, (aluno) => aluno.municipio || 'Nao informado', 5);
    const total = dashboardState.filtrados.length;

    if (!ranking.length) {
        container.innerHTML = '<p class="emptyState">Nenhum municipio disponivel para este recorte.</p>';
        return;
    }

    container.innerHTML = ranking.map((item, index) => {
        const proporcao = total ? Math.round((item.count / total) * 100) : 0;

        return `
            <div class="rankingItem">
                <span class="rankingIndex">${index + 1}</span>
                <div class="rankingInfo">
                    <strong>${item.label}</strong>
                    <small>${item.count} aluno(s) no recorte</small>
                    <div class="progressTrack">
                        <div class="progressBar" style="width: ${Math.max(proporcao, 6)}%;"></div>
                    </div>
                </div>
                <span class="rankingValue">${proporcao}%</span>
            </div>
        `;
    }).join('');
}

function renderizarInsights() {
    const container = document.getElementById('insightsList');
    if (!container) {
        return;
    }

    const alunos = dashboardState.filtrados;
    if (!alunos.length) {
        container.innerHTML = '<li class="emptyState">Sem dados para gerar insights neste recorte.</li>';
        return;
    }

    const turnoDominante = obterEntradaDominante(alunos, (aluno) => TURNO_LABELS[aluno.turno] ?? 'Nao informado');
    const municipioDominante = obterEntradaDominante(alunos, (aluno) => aluno.municipio || 'Nao informado');
    const serieDominante = obterEntradaDominante(alunos, (aluno) => aluno.serie || 'Nao informada');
    const faixaDominante = obterFaixaEtariaDominante(alunos);
    const principalEnfermidade = obterEntradaDominanteEnfermidades(alunos);
    const publicos = contar(alunos, (aluno) => aluno.tipoEscola === 1);
    const privados = contar(alunos, (aluno) => aluno.tipoEscola === 2);
    const percentualSaude = percentual(contar(alunos, possuiRegistroSaude), alunos.length);

    const insights = [
        {
            icon: 'fa-solid fa-location-dot',
            titulo: 'Maior concentracao territorial',
            descricao: municipioDominante
                ? `${municipioDominante.label} lidera o recorte com ${municipioDominante.count} aluno(s).`
                : 'Nao foi possivel identificar um municipio dominante.'
        },
        {
            icon: 'fa-solid fa-clock',
            titulo: 'Turno mais representativo',
            descricao: turnoDominante
                ? `${turnoDominante.label} aparece com mais frequencia, com ${turnoDominante.count} aluno(s).`
                : 'Nao foi possivel identificar um turno dominante.'
        },
        {
            icon: 'fa-solid fa-user-graduate',
            titulo: 'Faixa etaria e serie em destaque',
            descricao: `${faixaDominante ? faixaDominante.label : 'Sem faixa dominante'} e ${serieDominante ? serieDominante.label : 'sem serie dominante'} formam o recorte mais forte.`
        },
        {
            icon: 'fa-solid fa-heart-pulse',
            titulo: 'Leitura de saude',
            descricao: principalEnfermidade
                ? `${percentualSaude}% dos alunos do recorte possuem registro. A ocorrencia mais comum e ${principalEnfermidade.label}.`
                : `${percentualSaude}% dos alunos do recorte possuem registro de saude.`
        },
        {
            icon: 'fa-solid fa-school',
            titulo: 'Equilibrio entre escolas',
            descricao: `O recorte atual tem ${publicos} aluno(s) de escola publica e ${privados} de escola privada.`
        }
    ];

    container.innerHTML = insights.map((insight) => `
        <li class="insightItem">
            <div class="insightIcon">
                <i class="${insight.icon}"></i>
            </div>
            <div>
                <strong>${insight.titulo}</strong>
                <p>${insight.descricao}</p>
            </div>
        </li>
    `).join('');
}

function obterFaixaEtariaDominante(alunos) {
    const contagem = new Map();

    alunos.forEach((aluno) => {
        const faixa = classificarFaixaEtaria(calcularIdade(aluno.dataNascimento));
        if (!faixa) {
            return;
        }

        contagem.set(faixa, (contagem.get(faixa) ?? 0) + 1);
    });

    return transformarMapaEmTop(contagem)[0] ?? null;
}

function classificarFaixaEtaria(idade) {
    if (!idade) return '';
    if (idade <= 7) return '5 a 7 anos';
    if (idade <= 10) return '8 a 10 anos';
    if (idade <= 13) return '11 a 13 anos';
    return '14+ anos';
}

function calcularMediaIdade(alunos) {
    const idades = alunos.map((aluno) => calcularIdade(aluno.dataNascimento)).filter((idade) => idade > 0);
    if (!idades.length) {
        return 0;
    }

    return idades.reduce((total, idade) => total + idade, 0) / idades.length;
}

function calcularIdade(dataNascimento) {
    const data = converterData(dataNascimento);
    if (!data) {
        return 0;
    }

    const hoje = new Date();
    let idade = hoje.getFullYear() - data.getFullYear();
    const aindaNaoFezAniversario = hoje.getMonth() < data.getMonth()
        || (hoje.getMonth() === data.getMonth() && hoje.getDate() < data.getDate());

    if (aindaNaoFezAniversario) {
        idade--;
    }

    return idade > 0 ? idade : 0;
}

function converterData(valor) {
    if (!valor) {
        return null;
    }

    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? null : data;
}

function possuiRegistroSaude(aluno) {
    if (!aluno.anamnese) {
        return false;
    }

    return aluno.anamnese.possuiEnfermidade || aluno.anamnese.enfermidades.length > 0;
}

function obterEntradaDominante(alunos, seletor) {
    const contagem = new Map();

    alunos.forEach((aluno) => {
        const valor = textoSeguro(seletor(aluno));
        if (!valor) {
            return;
        }

        contagem.set(valor, (contagem.get(valor) ?? 0) + 1);
    });

    return transformarMapaEmTop(contagem)[0] ?? null;
}

function obterEntradaDominanteEnfermidades(alunos) {
    const contagem = new Map();

    alunos.forEach((aluno) => {
        if (!aluno.anamnese) {
            return;
        }

        aluno.anamnese.enfermidades.forEach((enfermidade) => {
            const label = ENFERMIDADE_LABELS[enfermidade.tipoEnfermidade] ?? 'Outros';
            contagem.set(label, (contagem.get(label) ?? 0) + 1);
        });
    });

    return transformarMapaEmTop(contagem)[0] ?? null;
}

function obterTopEntradas(alunos, seletor, limite) {
    const contagem = new Map();

    alunos.forEach((aluno) => {
        const valor = textoSeguro(seletor(aluno));
        if (!valor) {
            return;
        }

        contagem.set(valor, (contagem.get(valor) ?? 0) + 1);
    });

    return transformarMapaEmTop(contagem).slice(0, limite);
}

function transformarMapaEmTop(mapa) {
    return Array.from(mapa.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label, 'pt-BR'));
}

function contar(lista, criterio) {
    return lista.reduce((total, item) => total + (criterio(item) ? 1 : 0), 0);
}

function percentual(valor, total) {
    if (!total) {
        return 0;
    }

    return Math.round((valor / total) * 100);
}

function formatarMomentoAtual() {
    return new Date().toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function atualizarTexto(id, valor) {
    const elemento = document.getElementById(id);
    if (elemento) {
        elemento.textContent = valor;
    }
}

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
        border-radius: 12px;
        box-shadow: 0 12px 28px rgba(0,0,0,0.18);
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
