// Funções auxiliares para formulário de cadastro de aluno usando API
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.formAddAluno');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await cadastrarAluno();
        });
    }

    // Event listener para botão "Adicionar Aluno"
    const btnAddAluno = document.querySelector('.addAluno');
    if (btnAddAluno) {
        btnAddAluno.addEventListener('click', () => {
            abrirModalAdicionarAluno();
        });
    }

    // Event listener para botão "Adicionar em Massa"
    const btnAdicionarEmMassa = document.querySelector('.adicionarEmMassa');
    if (btnAdicionarEmMassa) {
        btnAdicionarEmMassa.addEventListener('click', () => {
            abrirModalAdicionarEmMassa();
        });
    }

    // Event listener para botão "Cancelar" do modal de adicionar aluno
    const btnCancelarAluno = document.getElementById('btnCancelarAluno');
    if (btnCancelarAluno) {
        btnCancelarAluno.addEventListener('click', () => {
            fecharModal();
        });
    }

    // Event listener para botão "Cancelar" do modal de adicionar em massa
    const btnCancelarMassa = document.getElementById('btnCancelarMassa');
    if (btnCancelarMassa) {
        btnCancelarMassa.addEventListener('click', () => {
            fecharModal();
        });
    }

    // Event listener para botão "Adicionar" do modal de adicionar em massa
    const btnAdicionarMassa = document.getElementById('btnAdicionarMassa');
    if (btnAdicionarMassa) {
        btnAdicionarMassa.addEventListener('click', async () => {
            await adicionarAlunosEmMassa();
        });
    }

    // Aplicar máscaras nos campos do formulário
    aplicarMascaras();

    // Configurar checkbox de anamnese (pode ser chamado múltiplas vezes)
    configurarCheckboxAnamnese();
    
    // Configurar botões do modal de anamnese
    const btnCancelarAnamnese = document.getElementById('btnCancelarAnamnese');
    if (btnCancelarAnamnese) {
        btnCancelarAnamnese.addEventListener('click', () => {
            fecharModalAnamnese(true); // true = cancelar
        });
    }
    
    const btnConfirmarAnamnese = document.getElementById('btnConfirmarAnamnese');
    if (btnConfirmarAnamnese) {
        btnConfirmarAnamnese.addEventListener('click', () => {
            confirmarAnamnese();
        });
    }
    
    // Configurar checkbox "Outros" no modal de anamnese
    const checkboxOutros = document.getElementById('checkboxOutros');
    if (checkboxOutros) {
        checkboxOutros.addEventListener('change', (e) => {
            const containerOutros = document.getElementById('descricaoOutrosContainer');
            if (containerOutros) {
                if (e.target.checked) {
                    containerOutros.style.display = 'block';
                } else {
                    containerOutros.style.display = 'none';
                    const descricaoOutros = document.getElementById('descricaoOutros');
                    if (descricaoOutros) {
                        descricaoOutros.value = '';
                    }
                }
            }
        });
    }
});

// Função para configurar o checkbox de anamnese
// Pode ser chamada quando o modal é aberto para garantir que funcione
function configurarCheckboxAnamnese() {
    try {
        const checkboxAnamnese = document.getElementById('checkboxAnamnese');
        
        if (!checkboxAnamnese) {
            return; // Elemento não existe ainda, retornar sem erro
        }
        
        // Remover listeners anteriores usando uma flag
        if (checkboxAnamnese.dataset.listenerAttached === 'true') {
            return; // Já tem listener, não adicionar novamente
        }
        
        // Adicionar listener
        checkboxAnamnese.addEventListener('change', function(e) {
            try {
                if (e.target.checked) {
                    abrirModalAnamnese();
                } else {
                    // Limpar dados de anamnese quando desmarcar
                    limparDadosAnamnese();
                }
            } catch (error) {
                console.error('Erro ao manipular checkbox de anamnese:', error);
            }
        });
        
        // Marcar que o listener foi adicionado
        checkboxAnamnese.dataset.listenerAttached = 'true';
    } catch (error) {
        console.error('Erro ao configurar checkbox de anamnese:', error);
    }
}

// Função para abrir o modal de anamnese
function abrirModalAnamnese() {
    const modalAnamnese = document.querySelector('.modalAnamnese');
    if (modalAnamnese) {
        // Criar overlay se não existir
        let overlay = document.querySelector('.telaModalAnamnese');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.className = 'telaModalAnamnese';
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    fecharModalAnamnese(true);
                }
            });
            document.body.appendChild(overlay);
        }
        
        // Mover modal para dentro do overlay se não estiver
        if (modalAnamnese.parentNode !== overlay) {
            overlay.appendChild(modalAnamnese);
        }
        
        overlay.style.display = 'flex';
        modalAnamnese.style.display = 'block';
    }
}

// Função para fechar o modal de anamnese
function fecharModalAnamnese(cancelar = false) {
    const modalAnamnese = document.querySelector('.modalAnamnese');
    const overlay = document.querySelector('.telaModalAnamnese');
    
    if (modalAnamnese) {
        modalAnamnese.style.display = 'none';
    }
    
    if (overlay) {
        overlay.style.display = 'none';
    }
    
    // Se for cancelamento, limpar dados e desmarcar checkbox
    if (cancelar) {
        limparDadosAnamnese();
        const checkboxAnamnese = document.getElementById('checkboxAnamnese');
        if (checkboxAnamnese) {
            checkboxAnamnese.checked = false;
        }
    }
}

// Função para confirmar anamnese
function confirmarAnamnese() {
    const checkboxes = document.querySelectorAll('.checkboxEnfermidade:checked');
    if (checkboxes.length === 0) {
        mostrarMensagem('Selecione pelo menos uma opção de anamnese', 'error');
        return;
    }
    
    // Marcar o checkbox de anamnese no formulário principal
    const checkboxAnamnese = document.getElementById('checkboxAnamnese');
    if (checkboxAnamnese) {
        checkboxAnamnese.checked = true;
    }
    
    fecharModalAnamnese();
    mostrarMensagem('Anamnese selecionada com sucesso!', 'success');
}

// Função para limpar dados de anamnese
function limparDadosAnamnese() {
    const checkboxes = document.querySelectorAll('.checkboxEnfermidade');
    checkboxes.forEach(cb => {
        cb.checked = false;
    });
    
    const descricaoOutros = document.getElementById('descricaoOutros');
    if (descricaoOutros) {
        descricaoOutros.value = '';
    }
    
    const containerOutros = document.getElementById('descricaoOutrosContainer');
    if (containerOutros) {
        containerOutros.style.display = 'none';
    }
}

function aplicarMascaras() {
    // Máscara de CPF (xxx.xxx.xxx-xx) - máximo 11 dígitos
    const cpfInput = document.getElementById('cpfAluno');
    if (cpfInput) {
        cpfInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            // Limitar a exatamente 11 dígitos
            if (value.length > 11) {
                value = value.substring(0, 11);
            }
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            }
        });
        
        // Prevenir colar mais de 11 dígitos
        cpfInput.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
            if (pasted.length <= 11) {
                cpfInput.value = pasted.replace(/(\d{3})(\d)/, '$1.$2')
                                      .replace(/(\d{3})(\d)/, '$1.$2')
                                      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            } else {
                const limited = pasted.substring(0, 11);
                cpfInput.value = limited.replace(/(\d{3})(\d)/, '$1.$2')
                                       .replace(/(\d{3})(\d)/, '$1.$2')
                                       .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            }
        });
        
        cpfInput.addEventListener('blur', (e) => {
            const cpfLimpo = limparCPF(e.target.value);
            if (cpfLimpo.length !== 11 && cpfLimpo.length > 0) {
                mostrarMensagem('CPF deve conter exatamente 11 dígitos', 'error');
                e.target.focus();
            }
        });
    }

    // Máscara de RG - aceita de 7 a 11 dígitos (sem formatação rígida, apenas limita dígitos)
    const rgInput = document.getElementById('RG');
    if (rgInput) {
        rgInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            // Limitar a no máximo 11 dígitos
            if (value.length > 11) {
                value = value.substring(0, 11);
            }
            e.target.value = value;
        });

        // Prevenir colar mais de 11 dígitos
        rgInput.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
            const limited = pasted.length > 11 ? pasted.substring(0, 11) : pasted;
            rgInput.value = limited;
        });

        rgInput.addEventListener('blur', (e) => {
            const rgLimpo = limparRG(e.target.value);
            if (rgLimpo.length > 0 && (rgLimpo.length < 7 || rgLimpo.length > 11)) {
                mostrarMensagem('RG deve conter entre 7 e 11 dígitos', 'error');
                e.target.focus();
            }
        });
    }

    // Máscara de Data de Nascimento (dd/mm/yyyy) - máximo 8 dígitos
    const dataInput = document.getElementById('NascimentoAluno');
    if (dataInput) {
        dataInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            // Limitar a exatamente 8 dígitos
            if (value.length > 8) {
                value = value.substring(0, 8);
            }
            if (value.length <= 8) {
                value = value.replace(/(\d{2})(\d)/, '$1/$2');
                value = value.replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
                e.target.value = value;
            }
        });

        // Prevenir colar mais de 8 dígitos
        dataInput.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
            if (pasted.length <= 8) {
                const formatted = pasted.replace(/(\d{2})(\d)/, '$1/$2')
                                       .replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
                dataInput.value = formatted;
            } else {
                const limited = pasted.substring(0, 8);
                dataInput.value = limited.replace(/(\d{2})(\d)/, '$1/$2')
                                         .replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
            }
        });

        dataInput.addEventListener('blur', (e) => {
            const dataStr = e.target.value;
            if (dataStr && !validarData(dataStr)) {
                mostrarMensagem('Data de nascimento inválida. Use o formato dd/mm/yyyy', 'error');
                e.target.focus();
            }
        });
    }

    // Validação de UF (2 letras maiúsculas)
    const estadoInput = document.getElementById('estadoAluno');
    if (estadoInput) {
        estadoInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^a-zA-Z]/g, '').toUpperCase();
            if (value.length > 2) {
                value = value.substring(0, 2);
            }
            e.target.value = value;
        });
    }

    // Máscara de telefone (00)00000-0000) - máximo 11 dígitos
    function aplicarMascaraTelefone(input) {
        if (!input) return;
        
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            // Limitar a exatamente 11 dígitos
            if (value.length > 11) {
                value = value.substring(0, 11);
            }
            if (value.length <= 11) {
                if (value.length <= 2) {
                    value = value.replace(/(\d{2})/, '($1)');
                } else if (value.length <= 7) {
                    value = value.replace(/(\d{2})(\d{5})/, '($1)$2');
                } else {
                    value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1)$2-$3');
                }
                e.target.value = value;
            }
        });

        // Prevenir colar mais de 11 dígitos
        input.addEventListener('paste', (e) => {
            e.preventDefault();
            const pasted = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
            if (pasted.length <= 11) {
                let formatted = pasted;
                if (formatted.length <= 2) {
                    formatted = formatted.replace(/(\d{2})/, '($1)');
                } else if (formatted.length <= 7) {
                    formatted = formatted.replace(/(\d{2})(\d{5})/, '($1)$2');
                } else {
                    formatted = formatted.replace(/(\d{2})(\d{5})(\d{4})/, '($1)$2-$3');
                }
                input.value = formatted;
            } else {
                const limited = pasted.substring(0, 11);
                input.value = limited.replace(/(\d{2})(\d{5})(\d{4})/, '($1)$2-$3');
            }
        });

        input.addEventListener('blur', (e) => {
            const telLimpo = e.target.value.replace(/\D/g, '');
            if (telLimpo.length > 0 && telLimpo.length !== 11) {
                mostrarMensagem('Telefone deve ter exatamente 11 dígitos no formato (00)00000-0000', 'error');
                e.target.focus();
            }
        });
    }

    aplicarMascaraTelefone(document.getElementById('contato1Aluno'));
    aplicarMascaraTelefone(document.getElementById('contato2Aluno'));

    // Validação de N° (apenas números)
    const numeroInput = document.getElementById('numeroEndereco');
    if (numeroInput) {
        numeroInput.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
}

function validarData(dataStr) {
    const partes = dataStr.split('/');
    if (partes.length !== 3) return false;
    
    const dia = parseInt(partes[0], 10);
    const mes = parseInt(partes[1], 10);
    const ano = parseInt(partes[2], 10);
    
    if (isNaN(dia) || isNaN(mes) || isNaN(ano)) return false;
    if (dia < 1 || dia > 31) return false;
    if (mes < 1 || mes > 12) return false;
    if (ano < 1900 || ano > new Date().getFullYear()) return false;
    
    // Verificar se a data é válida
    const data = new Date(ano, mes - 1, dia);
    return data.getDate() === dia && 
           data.getMonth() === mes - 1 && 
           data.getFullYear() === ano;
}

async function cadastrarAluno() {
    const form = document.querySelector('.formAddAluno');
    if (!form) return;

    // Coletar dados do formulário
    const alunoId = window.alunoEditandoId;
    
    const dataNascInput = document.getElementById('NascimentoAluno')?.value || '';
    const cpfInput = document.getElementById('cpfAluno')?.value || '';
    const estadoInput = document.getElementById('estadoAluno')?.value || '';
    const contato1Input = document.getElementById('contato1Aluno')?.value || '';
    const contato2Input = document.getElementById('contato2Aluno')?.value || '';

    // Validações de formato
    if (dataNascInput && !validarData(dataNascInput)) {
        mostrarMensagem('Data de nascimento inválida. Use o formato dd/mm/yyyy', 'error');
        document.getElementById('NascimentoAluno')?.focus();
        return;
    }

    const cpfLimpo = limparCPF(cpfInput);
    if (cpfInput && cpfLimpo.length !== 11) {
        mostrarMensagem('CPF deve conter exatamente 11 dígitos', 'error');
        document.getElementById('cpfAluno')?.focus();
        return;
    }

    const rgInput = document.getElementById('RG')?.value || '';
    const rgLimpo = limparRG(rgInput);
    if (rgInput && rgLimpo.length > 0 && (rgLimpo.length < 7 || rgLimpo.length > 11)) {
        mostrarMensagem('RG deve conter entre 7 e 11 dígitos', 'error');
        document.getElementById('RG')?.focus();
        return;
    }

    if (estadoInput && estadoInput.length !== 2) {
        mostrarMensagem('Estado deve ter 2 letras', 'error');
        document.getElementById('estadoAluno')?.focus();
        return;
    }

    const contato1Limpo = contato1Input.replace(/\D/g, '');
    if (contato1Input && contato1Limpo.length !== 11) {
        mostrarMensagem('Contato 1 deve ter exatamente 11 dígitos no formato (00)00000-0000', 'error');
        document.getElementById('contato1Aluno')?.focus();
        return;
    }

    let contato2Limpo = null;
    if (contato2Input) {
        contato2Limpo = contato2Input.replace(/\D/g, '');
        if (contato2Limpo.length > 0 && contato2Limpo.length !== 11) {
            mostrarMensagem('Contato 2 deve ter exatamente 11 dígitos no formato (00)00000-0000', 'error');
            document.getElementById('contato2Aluno')?.focus();
            return;
        }
    }

    // Verificar se o aluno possui anamnese
    const possuiAnamnese = document.getElementById('checkboxAnamnese')?.checked || false;
    
    // Coletar enfermidades selecionadas
    const enfermidades = [];
    if (possuiAnamnese) {
        const checkboxesEnfermidades = document.querySelectorAll('.checkboxEnfermidade:checked');
        
        if (checkboxesEnfermidades.length === 0) {
            mostrarMensagem('Selecione pelo menos uma opção de anamnese', 'error');
            abrirModalAnamnese();
            return;
        }
        
        // Verificar se "Outros" está selecionado e se tem descrição
        for (let i = 0; i < checkboxesEnfermidades.length; i++) {
            const checkbox = checkboxesEnfermidades[i];
            const tipoEnfermidade = parseInt(checkbox.value);
            if (tipoEnfermidade === 9) {
                const descricao = document.getElementById('descricaoOutros')?.value?.trim() || null;
                if (!descricao) {
                    mostrarMensagem('Por favor, especifique a anamnese para a opção "Outros"', 'error');
                    abrirModalAnamnese();
                    document.getElementById('descricaoOutros')?.focus();
                    return;
                }
            }
        }
        
        // Coletar todas as enfermidades
        for (let i = 0; i < checkboxesEnfermidades.length; i++) {
            const checkbox = checkboxesEnfermidades[i];
            const tipoEnfermidade = parseInt(checkbox.value);
            let descricao = null;
            
            // Se for "Outros" (valor 9), pegar a descrição do textarea
            if (tipoEnfermidade === 9) {
                descricao = document.getElementById('descricaoOutros')?.value?.trim() || null;
            }
            
            enfermidades.push({
                tipoEnfermidade: tipoEnfermidade,
                descricao: descricao
            });
        }
    }

    const aluno = {
        nome: document.getElementById('nomeAluno')?.value || '',
        dataNascimento: converterData(dataNascInput),
        rg: limparRG(rgInput),
        cpf: cpfLimpo,
        endereco: document.getElementById('enderecoAluno')?.value || '',
        numeroEndereco: document.getElementById('numeroEndereco')?.value || '',
        bairro: document.getElementById('bairroAluno')?.value || '',
        municipio: document.getElementById('municipioAluno')?.value || '',
        estado: estadoInput.toUpperCase(),
        escola: document.getElementById('escolaAluno')?.value || '',
        tipoEscola: parseInt(document.getElementById('tipoEscolaAluno')?.value || '1'),
        serie: document.getElementById('serieAluno')?.value || '',
        turno: parseInt(document.getElementById('turnoAluno')?.value || '1'),
        numeroPessoasCasa: parseInt(document.getElementById('numeroPessoasCasa')?.value || '1'),
        contato1: contato1Limpo,
        contato2: contato2Limpo
    };

    // Adicionar anamnese se o aluno possui anamnese
    if (possuiAnamnese && enfermidades.length > 0) {
        aluno.anamnese = {
            possuiEnfermidade: true,
            observacoesGerais: null,
            enfermidades: enfermidades
        };
    }

    // Validações básicas
    if (!aluno.nome || !aluno.cpf || !aluno.dataNascimento) {
        mostrarMensagem('Preencha todos os campos obrigatórios', 'error');
        return;
    }

    try {
        if (alunoId) {
            // Atualizar aluno existente
            await AlunosAPI.atualizar(alunoId, aluno);
            mostrarMensagem('Aluno atualizado com sucesso!', 'success');
            window.alunoEditandoId = null;
        } else {
            // Criar novo aluno
            await AlunosAPI.criar(aluno);
            mostrarMensagem('Aluno cadastrado com sucesso!', 'success');
        }
        
        form.reset();
        // Resetar dados de anamnese
        limparDadosAnamnese();
        const checkboxAnamnese = document.getElementById('checkboxAnamnese');
        if (checkboxAnamnese) {
            checkboxAnamnese.checked = false;
        }
        fecharModal();
        
        // Recarregar lista se a função existir
        if (typeof carregarAlunos === 'function') {
            await carregarAlunos();
        }
        
        // Atualizar gráficos se a função existir
        if (typeof atualizarGraficos === 'function') {
            await atualizarGraficos();
        }
    } catch (error) {
        mostrarMensagem('Erro ao salvar aluno: ' + error.message, 'error');
    }
}

function converterData(dataStr) {
    // Converter de dd/mm/aaaa para aaaa-mm-dd
    const partes = dataStr.split('/');
    if (partes.length === 3) {
        return `${partes[2]}-${partes[1]}-${partes[0]}`;
    }
    return dataStr;
}

function limparCPF(cpf) {
    return cpf.replace(/[^\d]/g, '');
}

function limparRG(rg) {
    return rg.replace(/[^\d]/g, '');
}

function abrirModalAdicionarAluno() {
    const telaModal = document.querySelector('.telaModal');
    const modalAdicionarAluno = document.querySelector('.modalAdicionarAluno');
    const modalAdicionarEmMassa = document.querySelector('.modalAdicionarEmMassa');
    
    if (telaModal && modalAdicionarAluno) {
        // Esconder modal de massa se estiver aberto
        if (modalAdicionarEmMassa) {
            modalAdicionarEmMassa.style.display = 'none';
        }
        // Mostrar modal de adicionar aluno
        telaModal.style.display = 'flex';
        modalAdicionarAluno.style.display = 'block';
        
        // Reconfigurar checkbox de anamnese após abrir o modal
        // Usar setTimeout para garantir que o DOM foi atualizado
        setTimeout(() => {
            configurarCheckboxAnamnese();
        }, 100);
    }
}

function abrirModalAdicionarEmMassa() {
    const telaModal = document.querySelector('.telaModal');
    const modalAdicionarAluno = document.querySelector('.modalAdicionarAluno');
    const modalAdicionarEmMassa = document.querySelector('.modalAdicionarEmMassa');
    
    if (telaModal && modalAdicionarEmMassa) {
        // Esconder modal de adicionar aluno se estiver aberto
        if (modalAdicionarAluno) {
            modalAdicionarAluno.style.display = 'none';
        }
        // Mostrar modal de adicionar em massa
        telaModal.style.display = 'flex';
        modalAdicionarEmMassa.style.display = 'block';
    }
}

function fecharModal() {
    const telaModal = document.querySelector('.telaModal');
    const modalAdicionarAluno = document.querySelector('.modalAdicionarAluno');
    const modalAdicionarEmMassa = document.querySelector('.modalAdicionarEmMassa');
    
    if (telaModal) {
        telaModal.style.display = 'none';
    }
    if (modalAdicionarAluno) {
        modalAdicionarAluno.style.display = 'none';
        // Resetar formulário e campos de anamnese
        const form = modalAdicionarAluno.querySelector('.formAddAluno');
        if (form) {
            form.reset();
        }
        limparDadosAnamnese();
        const checkboxAnamnese = document.getElementById('checkboxAnamnese');
        if (checkboxAnamnese) {
            checkboxAnamnese.checked = false;
        }
        // Fechar modal de anamnese se estiver aberto
        fecharModalAnamnese();
        // Limpar ID de edição
        window.alunoEditandoId = null;
    }
    if (modalAdicionarEmMassa) {
        modalAdicionarEmMassa.style.display = 'none';
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
    `;
    toast.textContent = mensagem;
    document.body.appendChild(toast);

    setTimeout(() => {
        if (toast.parentNode) {
            document.body.removeChild(toast);
        }
    }, 3000);
}

async function adicionarAlunosEmMassa() {
    const textoArea = document.getElementById('textoArea');
    if (!textoArea) return;

    const texto = textoArea.value.trim();
    if (!texto) {
        mostrarMensagem('Por favor, insira os dados dos alunos', 'error');
        return;
    }

    // Processar cada linha do texto
    const linhas = texto.split('\n').filter(linha => linha.trim());
    const erros = [];
    let sucessos = 0;

    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i].trim();
        if (!linha) continue;

        try {
            // Tentar parsear o formato: Nome, DataNascimento, CPF, ...
            const partes = linha.split(',').map(p => p.trim());
            
            if (partes.length < 3) {
                erros.push(`Linha ${i + 1}: Formato inválido. Use: Nome, DataNascimento, CPF, ...`);
                continue;
            }

            const aluno = {
                nome: partes[0] || '',
                dataNascimento: converterData(partes[1] || ''),
                cpf: limparCPF(partes[2] || ''),
                rg: partes[3] || '',
                endereco: partes[4] || '',
                numeroEndereco: partes[5] || '',
                bairro: partes[6] || '',
                municipio: partes[7] || '',
                estado: partes[8] || '',
                escola: partes[9] || '',
                tipoEscola: parseInt(partes[10] || '1'),
                serie: partes[11] || '',
                turno: parseInt(partes[12] || '1'),
                numeroPessoasCasa: parseInt(partes[13] || '1'),
                contato1: partes[14] || '',
                contato2: partes[15] || null
            };

            // Validações básicas
            if (!aluno.nome || !aluno.cpf || !aluno.dataNascimento) {
                erros.push(`Linha ${i + 1}: Dados obrigatórios faltando (Nome, DataNascimento, CPF)`);
                continue;
            }

            await AlunosAPI.criar(aluno);
            sucessos++;
        } catch (error) {
            erros.push(`Linha ${i + 1}: ${error.message}`);
        }
    }

    // Mostrar resultado
    if (sucessos > 0) {
        mostrarMensagem(`${sucessos} aluno(s) cadastrado(s) com sucesso!`, 'success');
    }
    
    if (erros.length > 0) {
        console.error('Erros ao cadastrar alunos:', erros);
        mostrarMensagem(`${erros.length} erro(s) encontrado(s). Verifique o console para detalhes.`, 'error');
    }

    // Limpar textarea e fechar modal
    textoArea.value = '';
    fecharModal();

    // Recarregar dados se necessário
    if (typeof carregarAlunos === 'function') {
        await carregarAlunos();
    }
    
    // Atualizar gráficos após adicionar em massa
    if (typeof atualizarGraficos === 'function') {
        await atualizarGraficos();
    }
}

