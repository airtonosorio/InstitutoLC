// Variável global para armazenar todos os alunos
let todosAlunos = [];

// Função para inicializar quando o DOM estiver pronto
function inicializarLista() {
    console.log('🚀 Inicializando lista de alunos...');
    
    // Verificar se os elementos existem
    const campoPesquisa = document.getElementById('campoPesquisa');
    const btnFecharDetalhes = document.getElementById('btnFecharDetalhes');
    const modalDetalhes = document.querySelector('.modalDetalhesAluno');
    const barraPesquisa = document.querySelector('.barraPesquisa');
    
    console.log('📋 Elementos encontrados:', {
        campoPesquisa: !!campoPesquisa,
        btnFecharDetalhes: !!btnFecharDetalhes,
        modalDetalhes: !!modalDetalhes,
        barraPesquisa: !!barraPesquisa
    });
    
    // Configurar barra de pesquisa
    if (campoPesquisa) {
        campoPesquisa.addEventListener('input', (e) => {
            const valor = e.target.value;
            pesquisarAlunos(valor);
        });
        console.log('✅ Event listener de pesquisa configurado');
    } else {
        console.error('❌ Campo de pesquisa não encontrado!');
    }
    
    // Configurar botão de fechar modal de detalhes
    if (btnFecharDetalhes) {
        btnFecharDetalhes.addEventListener('click', fecharModalDetalhes);
        console.log('✅ Botão fechar modal configurado');
    }
    
    // Fechar modal ao clicar fora dele
    if (modalDetalhes) {
        modalDetalhes.addEventListener('click', (e) => {
            if (e.target === modalDetalhes) {
                fecharModalDetalhes();
            }
        });
        console.log('✅ Modal de detalhes encontrado e configurado');
    } else {
        console.error('❌ Modal de detalhes não encontrado!');
    }
    
    // Carregar alunos
    carregarAlunos().catch(err => {
        console.error('❌ Erro ao carregar alunos:', err);
    });
}

// Carregar lista de alunos ao carregar a página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarLista);
} else {
    // DOM já está carregado
    inicializarLista();
}

async function carregarAlunos() {
    try {
        console.log('📥 Carregando alunos...');
        const alunos = await AlunosAPI.listar();
        console.log('📦 Resposta da API:', alunos);
        console.log('📦 Tipo da resposta:', typeof alunos, Array.isArray(alunos));
        
        // Verificar se a resposta é um array ou um objeto com array
        let alunosArray = alunos;
        if (alunos && !Array.isArray(alunos)) {
            if (alunos.value && Array.isArray(alunos.value)) {
                alunosArray = alunos.value;
            } else if (alunos.data && Array.isArray(alunos.data)) {
                alunosArray = alunos.data;
            }
        }
        
        // Garantir que todosAlunos sempre seja um array
        todosAlunos = Array.isArray(alunosArray) ? alunosArray : []; // Armazenar todos os alunos
        console.log('✅ Total de alunos carregados:', todosAlunos.length);
        
        // Debug: verificar estrutura do primeiro aluno se existir
        if (todosAlunos.length > 0) {
            const primeiroAluno = todosAlunos[0];
            console.log('📋 Estrutura do primeiro aluno:', {
                chaves: Object.keys(primeiroAluno),
                nome: primeiroAluno.nome || primeiroAluno.Nome || 'NÃO ENCONTRADO',
                cpf: primeiroAluno.cpf || primeiroAluno.CPF || 'NÃO ENCONTRADO',
                alunoCompleto: primeiroAluno
            });
        }
        
        exibirAlunosNaTabela(todosAlunos);
    } catch (error) {
        console.error('❌ Erro ao carregar alunos:', error);
        todosAlunos = []; // Garantir que seja um array vazio em caso de erro
        mostrarMensagem('Erro ao carregar alunos: ' + error.message, 'error');
        // Mostrar mensagem na tabela
        const tbody = document.getElementById('tbodyAlunos') || document.querySelector('#tabelaAlunos tbody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px; color: red;">Erro ao carregar alunos. Verifique se a API está rodando.</td></tr>';
        }
    }
}

function pesquisarAlunos(termo) {
    console.log('🔍 pesquisarAlunos chamada com:', termo);
    console.log('📊 Total de alunos disponíveis:', todosAlunos?.length || 0);
    
    // Garantir que todosAlunos é um array
    if (!Array.isArray(todosAlunos)) {
        console.warn('⚠️ todosAlunos não é um array, convertendo...');
        todosAlunos = [];
        return;
    }
    
    // Se termo vazio, mostrar todos
    if (!termo || termo.trim() === '') {
        console.log('📝 Termo vazio - exibindo todos os alunos');
        exibirAlunosNaTabela(todosAlunos);
        return;
    }
    
    // Preparar termo de busca
    const termoLimpo = termo.toLowerCase().trim();
    const termoNormalizado = termoLimpo.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const termoLimpoNumerico = termo.replace(/\D/g, '');
    
    console.log('🔍 Termos preparados:', {
        original: termo,
        limpo: termoLimpo,
        normalizado: termoNormalizado,
        numerico: termoLimpoNumerico
    });
    
    // Filtrar alunos usando filter para melhor performance
    const alunosFiltrados = todosAlunos.filter(aluno => {
        try {
            // Obter nome do aluno (suporta camelCase e PascalCase)
            const nomeOriginal = aluno.nome || aluno.Nome || '';
            const nomeAluno = String(nomeOriginal).toLowerCase();
            const nomeNormalizado = nomeAluno.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            
            // Obter CPF do aluno (suporta camelCase e PascalCase)
            const cpfOriginal = aluno.cpf || aluno.CPF || '';
            const cpfFormatado = formatarCPF(cpfOriginal) || '';
            const cpfLimpo = String(cpfOriginal).replace(/\D/g, '');
            
            // Verificar correspondências:
            // 1. Busca por nome (case-insensitive, com acentos)
            const matchNome = nomeAluno.includes(termoLimpo);
            
            // 2. Busca por nome normalizado (sem acentos)
            const matchNomeNormalizado = nomeNormalizado.includes(termoNormalizado);
            
            // 3. Busca por CPF - só se o termo contiver números
            let matchCPF = false;
            if (termoLimpoNumerico.length > 0) {
                // Busca por CPF formatado (ex: 123.456.789-00)
                const matchCPFFormatado = cpfFormatado && cpfFormatado.toLowerCase().includes(termoLimpo);
                // Busca por CPF limpo (apenas números)
                const matchCPFLimpo = cpfLimpo && cpfLimpo.includes(termoLimpoNumerico);
                matchCPF = matchCPFFormatado || matchCPFLimpo;
            }
            
            // Retornar true se qualquer correspondência for encontrada
            const encontrado = matchNome || matchNomeNormalizado || matchCPF;
            
            return encontrado;
        } catch (error) {
            console.error('Erro ao processar aluno na pesquisa:', error);
            return false;
        }
    });
    
    console.log('✅ Resultado da pesquisa:', {
        totalFiltrado: alunosFiltrados.length,
        totalOriginal: todosAlunos.length,
        alunos: alunosFiltrados.map(a => a.nome || a.Nome)
    });
    
    // Exibir resultados filtrados
    exibirAlunosNaTabela(alunosFiltrados);
}

function exibirAlunosNaTabela(alunos) {
    const tbody = document.getElementById('tbodyAlunos') || document.querySelector('#tabelaAlunos tbody');
    if (!tbody) {
        console.error('❌ tbody não encontrado!');
        return;
    }

    // Limpar tabela
    tbody.innerHTML = '';

    // Se não houver alunos, exibir mensagem
    if (!alunos || alunos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 20px;">Nenhum aluno encontrado</td></tr>';
        return;
    }

    // Adicionar cada aluno à tabela
    alunos.forEach(aluno => {
        const row = criarLinhaAluno(aluno);
        tbody.appendChild(row);
    });
}

function criarLinhaAluno(aluno) {
    const tr = document.createElement('tr');
    tr.dataset.alunoId = aluno.id; // Armazenar ID do aluno na linha
    
    const dataNasc = new Date(aluno.dataNascimento).toLocaleDateString('pt-BR');
    const dataCad = new Date(aluno.dataCadastro).toLocaleDateString('pt-BR');

    tr.innerHTML = `
        <td style="padding: 10px; border: 1px solid #ddd;">${aluno.nome}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${dataNasc}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${formatarCPF(aluno.cpf)}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${aluno.escola}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${aluno.serie}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${getTurnoTexto(aluno.turno)}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">${dataCad}</td>
        <td style="padding: 10px; border: 1px solid #ddd;">
            <button onclick="event.stopPropagation(); editarAluno(${aluno.id})" class="btn-editar" style="padding: 5px 10px; margin: 2px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">Editar</button>
            <button onclick="event.stopPropagation(); deletarAluno(${aluno.id})" class="btn-deletar" style="padding: 5px 10px; margin: 2px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">Deletar</button>
        </td>
    `;
    
    // Adicionar evento de clique na linha (exceto na última coluna de ações)
    tr.addEventListener('click', (e) => {
        // Não abrir modal se clicar nos botões de ação
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
            return;
        }
        console.log('Linha clicada, abrindo modal para aluno ID:', aluno.id);
        abrirModalDetalhes(aluno.id);
    });

    return tr;
}

function formatarCPF(cpf) {
    if (!cpf) return '';
    const cpfLimpo = cpf.replace(/\D/g, '');
    if (cpfLimpo.length === 11) {
        return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    return cpf;
}

function getTurnoTexto(turno) {
    const turnos = {
        1: 'Matutino',
        2: 'Vespertino',
        3: 'Noturno',
        4: 'Integral'
    };
    return turnos[turno] || 'N/A';
}

async function editarAluno(id) {
    try {
        const aluno = await AlunosAPI.buscarPorId(id);
        // Preencher formulário e abrir modal
        preencherFormularioEdicao(aluno);
        abrirModalAdicionar();
    } catch (error) {
        mostrarMensagem('Erro ao buscar aluno: ' + error.message, 'error');
    }
}

function preencherFormularioEdicao(aluno) {
    document.getElementById('nomeAluno').value = aluno.nome || '';
    document.getElementById('NascimentoAluno').value = formatarDataBR(new Date(aluno.dataNascimento));
    document.getElementById('RG').value = aluno.rg || '';
    document.getElementById('cpfAluno').value = formatarCPF(aluno.cpf);
    document.getElementById('enderecoAluno').value = aluno.endereco || '';
    document.getElementById('numeroEndereco').value = aluno.numeroEndereco || '';
    document.getElementById('bairroAluno').value = aluno.bairro || '';
    document.getElementById('municipioAluno').value = aluno.municipio || '';
    document.getElementById('estadoAluno').value = aluno.estado || '';
    document.getElementById('escolaAluno').value = aluno.escola || '';
    document.getElementById('tipoEscolaAluno').value = aluno.tipoEscola || '1';
    document.getElementById('serieAluno').value = aluno.serie || '';
    document.getElementById('turnoAluno').value = aluno.turno || '1';
    document.getElementById('numeroPessoasCasa').value = aluno.numeroPessoasCasa || 1;
    document.getElementById('contato1Aluno').value = aluno.contato1 || '';
    document.getElementById('contato2Aluno').value = aluno.contato2 || '';
    
    // Preencher dados de anamnese se existir
    const checkboxAnamnese = document.getElementById('checkboxAnamnese');
    
    if (aluno.anamnese && aluno.anamnese.possuiEnfermidade && aluno.anamnese.enfermidades && aluno.anamnese.enfermidades.length > 0) {
        if (checkboxAnamnese) {
            checkboxAnamnese.checked = true;
        }
        
        // Preencher checkboxes de enfermidades
        aluno.anamnese.enfermidades.forEach(enfermidade => {
            const checkbox = document.querySelector(`.checkboxEnfermidade[value="${enfermidade.tipoEnfermidade}"]`);
            if (checkbox) {
                checkbox.checked = true;
                
                // Se for "Outros" (valor 9), preencher o textarea
                if (enfermidade.tipoEnfermidade === 9 && enfermidade.descricao) {
                    const containerOutros = document.getElementById('descricaoOutrosContainer');
                    const descricaoOutros = document.getElementById('descricaoOutros');
                    if (containerOutros) {
                        containerOutros.style.display = 'block';
                    }
                    if (descricaoOutros) {
                        descricaoOutros.value = enfermidade.descricao;
                    }
                }
            }
        });
    } else {
        if (checkboxAnamnese) {
            checkboxAnamnese.checked = false;
        }
    }
    
    // Marcar que está editando
    window.alunoEditandoId = aluno.id;
}

function formatarDataBR(data) {
    if (!data) return '';
    const d = new Date(data);
    const dia = String(d.getDate()).padStart(2, '0');
    const mes = String(d.getMonth() + 1).padStart(2, '0');
    const ano = d.getFullYear();
    return `${dia}/${mes}/${ano}`;
}

function abrirModalAdicionar() {
    const telaModal = document.querySelector('.telaModal');
    const modalAdicionarAluno = document.querySelector('.modalAdicionarAluno');
    if (telaModal && modalAdicionarAluno) {
        telaModal.style.display = 'flex';
        modalAdicionarAluno.style.display = 'block';
        
        // Reconfigurar checkbox de anamnese após abrir o modal
        // Usar setTimeout para garantir que o DOM foi atualizado
        setTimeout(() => {
            if (typeof configurarCheckboxAnamnese === 'function') {
                configurarCheckboxAnamnese();
            }
        }, 100);
    }
}

// Garantir que a função abrirModalAdicionarAluno também existe (usada em js-api.js)
if (typeof abrirModalAdicionarAluno === 'undefined') {
    window.abrirModalAdicionarAluno = abrirModalAdicionar;
}

async function deletarAluno(id) {
    if (!confirm('Tem certeza que deseja deletar este aluno?')) {
        return;
    }

    try {
        await AlunosAPI.deletar(id);
        mostrarMensagem('Aluno deletado com sucesso!', 'success');
        // Recarregar todos os alunos e atualizar a lista
        await carregarAlunos();
        // Manter o filtro de pesquisa se houver
        const campoPesquisa = document.getElementById('campoPesquisa');
        if (campoPesquisa && campoPesquisa.value.trim() !== '') {
            pesquisarAlunos(campoPesquisa.value);
        }
    } catch (error) {
        mostrarMensagem('Erro ao deletar aluno: ' + error.message, 'error');
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
        border-radius: 5px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        z-index: 10001;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = mensagem;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (toast.parentNode) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);

    // Adicionar animações CSS se não existirem
    if (!document.getElementById('toastAnimations')) {
        const style = document.createElement('style');
        style.id = 'toastAnimations';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

async function abrirModalDetalhes(alunoId) {
    try {
        console.log('Abrindo modal de detalhes para aluno ID:', alunoId);
        const aluno = await AlunosAPI.buscarPorId(alunoId);
        console.log('Dados do aluno recebidos:', aluno);
        exibirDetalhesAluno(aluno);
        
        const modal = document.querySelector('.modalDetalhesAluno');
        console.log('Modal encontrado:', modal);
        if (modal) {
            modal.style.display = 'flex';
            console.log('Modal exibido');
        } else {
            console.error('Modal não encontrado no DOM!');
        }
    } catch (error) {
        console.error('Erro ao buscar detalhes do aluno:', error);
        mostrarMensagem('Erro ao carregar detalhes do aluno: ' + error.message, 'error');
    }
}

function fecharModalDetalhes() {
    const modal = document.querySelector('.modalDetalhesAluno');
    if (modal) {
        modal.style.display = 'none';
    }
}

function exibirDetalhesAluno(aluno) {
    const modalBody = document.getElementById('modalDetalhesBody');
    if (!modalBody) return;
    
    const dataNasc = new Date(aluno.dataNascimento).toLocaleDateString('pt-BR');
    const dataCad = aluno.dataCadastro ? new Date(aluno.dataCadastro).toLocaleDateString('pt-BR') : 'N/A';
    const dataAtualizacao = aluno.dataAtualizacao ? new Date(aluno.dataAtualizacao).toLocaleDateString('pt-BR') : 'N/A';
    
    const tipoEscolaTexto = aluno.tipoEscola === 1 ? 'Pública' : aluno.tipoEscola === 2 ? 'Privada' : 'N/A';
    const turnoTexto = getTurnoTexto(aluno.turno);
    
    let html = `
        <div class="detalheAluno">
            <label>Nome Completo:</label>
            <span>${aluno.nome || 'N/A'}</span>
        </div>
        <div class="detalheAluno">
            <label>Data de Nascimento:</label>
            <span>${dataNasc}</span>
        </div>
        <div class="detalheAluno">
            <label>RG:</label>
            <span>${aluno.rg || 'N/A'}</span>
        </div>
        <div class="detalheAluno">
            <label>CPF:</label>
            <span>${formatarCPF(aluno.cpf) || 'N/A'}</span>
        </div>
        <div class="detalheAluno">
            <label>Endereço:</label>
            <span>${aluno.endereco || 'N/A'}${aluno.numeroEndereco ? ', ' + aluno.numeroEndereco : ''}</span>
        </div>
        <div class="detalheAluno">
            <label>Bairro:</label>
            <span>${aluno.bairro || 'N/A'}</span>
        </div>
        <div class="detalheAluno">
            <label>Município:</label>
            <span>${aluno.municipio || 'N/A'}</span>
        </div>
        <div class="detalheAluno">
            <label>Estado:</label>
            <span>${aluno.estado || 'N/A'}</span>
        </div>
        <div class="detalheAluno">
            <label>Escola:</label>
            <span>${aluno.escola || 'N/A'}</span>
        </div>
        <div class="detalheAluno">
            <label>Tipo de Escola:</label>
            <span>${tipoEscolaTexto}</span>
        </div>
        <div class="detalheAluno">
            <label>Série:</label>
            <span>${aluno.serie || 'N/A'}</span>
        </div>
        <div class="detalheAluno">
            <label>Turno:</label>
            <span>${turnoTexto}</span>
        </div>
        <div class="detalheAluno">
            <label>Número de Pessoas na Casa:</label>
            <span>${aluno.numeroPessoasCasa || 'N/A'}</span>
        </div>
        <div class="detalheAluno">
            <label>Contato 1:</label>
            <span>${formatarTelefone(aluno.contato1) || 'N/A'}</span>
        </div>
        <div class="detalheAluno">
            <label>Contato 2:</label>
            <span>${aluno.contato2 ? formatarTelefone(aluno.contato2) : 'N/A'}</span>
        </div>
        <div class="detalheAluno">
            <label>Data de Cadastro:</label>
            <span>${dataCad}</span>
        </div>
        ${aluno.dataAtualizacao ? `
        <div class="detalheAluno">
            <label>Última Atualização:</label>
            <span>${dataAtualizacao}</span>
        </div>
        ` : ''}
    `;
    
    // Adicionar seção de anamnese se existir
    if (aluno.anamnese && aluno.anamnese.possuiEnfermidade && aluno.anamnese.enfermidades && aluno.anamnese.enfermidades.length > 0) {
        html += `
            <div class="secaoEnfermidades">
                <h3>Anamnese - Enfermidades</h3>
                <div class="listaEnfermidades">
        `;
        
        aluno.anamnese.enfermidades.forEach(enfermidade => {
            const nomeEnfermidade = getNomeEnfermidade(enfermidade.tipoEnfermidade);
            html += `
                <div class="itemEnfermidade">
                    <strong>${nomeEnfermidade}</strong>
                    ${enfermidade.descricao ? `<p>${enfermidade.descricao}</p>` : ''}
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    } else if (aluno.anamnese && aluno.anamnese.possuiEnfermidade) {
        html += `
            <div class="secaoEnfermidades">
                <h3>Anamnese</h3>
                <p class="semEnfermidades">Nenhuma enfermidade cadastrada</p>
            </div>
        `;
    }
    
    modalBody.innerHTML = html;
}

function getNomeEnfermidade(tipo) {
    const nomes = {
        1: 'Bronquite/Asma',
        2: 'Doença de Coração',
        3: 'Epilepsia/Convulsões',
        4: 'Diabetes',
        5: 'Problema Auditivo',
        6: 'Problema Visual',
        7: 'Doença Ortopédica',
        8: 'Alergia',
        9: 'Outros'
    };
    return nomes[tipo] || 'Desconhecido';
}

function formatarTelefone(telefone) {
    if (!telefone) return '';
    const telLimpo = telefone.replace(/\D/g, '');
    if (telLimpo.length === 11) {
        return telLimpo.replace(/(\d{2})(\d{5})(\d{4})/, '($1)$2-$3');
    }
    return telefone;
}

// Tornar funções disponíveis globalmente
window.abrirModalDetalhes = abrirModalDetalhes;
window.fecharModalDetalhes = fecharModalDetalhes;
window.pesquisarAlunos = pesquisarAlunos;
window.carregarAlunos = carregarAlunos;

