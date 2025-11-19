// Funcionalidade de importação de Excel
document.addEventListener('DOMContentLoaded', () => {
    const btnImportar = document.querySelector('.importar');
    const btnExportar = document.querySelector('.exportar');
    const inputFile = document.createElement('input');
    inputFile.type = 'file';
    inputFile.accept = '.xlsx,.xls';
    inputFile.style.display = 'none';

    document.body.appendChild(inputFile);

    if (btnImportar) {
        btnImportar.addEventListener('click', () => {
            inputFile.click();
        });
    }

    inputFile.addEventListener('change', async (e) => {
        const arquivo = e.target.files[0];
        if (arquivo) {
            await importarExcel(arquivo);
        }
    });

    if (btnExportar) {
        btnExportar.addEventListener('click', async () => {
            await exportarAlunos();
        });
    }
});

async function importarExcel(arquivo) {
    // Validar extensão
    const extensao = arquivo.name.split('.').pop().toLowerCase();
    if (extensao !== 'xlsx' && extensao !== 'xls') {
        mostrarMensagem('Por favor, selecione um arquivo Excel (.xlsx ou .xls)', 'error');
        return;
    }

    // Mostrar loading
    const loadingDiv = criarLoading();
    document.body.appendChild(loadingDiv);

    try {
        const resultado = await AlunosAPI.importarExcel(arquivo);
        
        // Remover loading
        document.body.removeChild(loadingDiv);

        // Exibir resultado
        exibirResultadoImportacao(resultado);
        
    } catch (error) {
        document.body.removeChild(loadingDiv);
        mostrarMensagem('Erro ao importar arquivo: ' + error.message, 'error');
    }
}

function criarLoading() {
    const div = document.createElement('div');
    div.id = 'loadingImportacao';
    div.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    div.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; text-align: center;">
            <div class="spinner" style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
            <p>Processando arquivo...</p>
        </div>
    `;
    
    // Adicionar animação CSS
    if (!document.getElementById('spinnerStyle')) {
        const style = document.createElement('style');
        style.id = 'spinnerStyle';
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    return div;
}

function exibirResultadoImportacao(resultado) {
    const modal = criarModalResultado(resultado);
    document.body.appendChild(modal);
}

function criarModalResultado(resultado) {
    const modal = document.createElement('div');
    modal.id = 'modalResultado';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;

    const errosHTML = resultado.erros && resultado.erros.length > 0
        ? `<div class="erros-section">
            <h3>Erros (${resultado.totalErros})</h3>
            <div class="erros-lista" style="max-height: 200px; overflow-y: auto; background: #fee; padding: 10px; border-radius: 5px;">
                ${resultado.erros.map(erro => `<p style="margin: 5px 0; color: #c00;">${erro}</p>`).join('')}
            </div>
          </div>`
        : '';

    const sucessosHTML = resultado.alunos && resultado.alunos.length > 0
        ? `<div class="sucessos-section">
            <h3>Alunos Importados (${resultado.totalImportados})</h3>
            <div class="sucessos-lista" style="max-height: 200px; overflow-y: auto; background: #efe; padding: 10px; border-radius: 5px;">
                ${resultado.alunos.map(aluno => `<p style="margin: 5px 0; color: #0a0;">Linha ${aluno.linha}: ${aluno.nome} (CPF: ${aluno.cpf})</p>`).join('')}
            </div>
          </div>`
        : '';

    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
            <h2 style="margin-top: 0;">Resultado da Importação</h2>
            <div style="margin-bottom: 20px;">
                <p><strong>Total Importados:</strong> ${resultado.totalImportados}</p>
                <p><strong>Total de Erros:</strong> ${resultado.totalErros}</p>
            </div>
            ${sucessosHTML}
            ${errosHTML}
            <div style="margin-top: 20px; text-align: right;">
                <button id="fecharModal" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
                    Fechar
                </button>
            </div>
        </div>
    `;

    modal.querySelector('#fecharModal').addEventListener('click', () => {
        document.body.removeChild(modal);
        // Recarregar lista se estiver na página de lista
        if (typeof carregarAlunos === 'function') {
            carregarAlunos();
        }
        // Redirecionar para lista se estiver em outra página
        if (window.location.pathname.includes('config')) {
            window.location.href = 'lista.html';
        }
    });

    return modal;
}

async function exportarAlunos() {
    try {
        const alunos = await AlunosAPI.listar();
        
        // Criar CSV
        const headers = ['Nome', 'Data Nascimento', 'RG', 'CPF', 'Endereço', 'Número', 'Bairro', 'Município', 'Estado', 'Escola', 'Tipo Escola', 'Série', 'Turno', 'Número Pessoas Casa', 'Contato 1', 'Contato 2'];
        const rows = alunos.map(aluno => [
            aluno.nome,
            new Date(aluno.dataNascimento).toLocaleDateString('pt-BR'),
            aluno.rg,
            aluno.cpf,
            aluno.endereco,
            aluno.numeroEndereco,
            aluno.bairro,
            aluno.municipio,
            aluno.estado,
            aluno.escola,
            aluno.tipoEscola === 1 ? 'Pública' : 'Privada',
            aluno.serie,
            getTurnoTexto(aluno.turno),
            aluno.numeroPessoasCasa,
            aluno.contato1,
            aluno.contato2 || ''
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        // Download
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `alunos_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();

        mostrarMensagem('Exportação realizada com sucesso!', 'success');
    } catch (error) {
        mostrarMensagem('Erro ao exportar alunos: ' + error.message, 'error');
    }
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

function mostrarMensagem(mensagem, tipo = 'info') {
    // Implementar sistema de notificações melhor
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
        setTimeout(() => document.body.removeChild(toast), 300);
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

