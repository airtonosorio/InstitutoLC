// Configuração da API
const API_BASE_URL = window.location.origin + '/api';

// Função auxiliar para fazer requisições
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const config = { ...defaultOptions, ...options };
    
    // Se for FormData, remover Content-Type para o browser definir automaticamente
    if (config.body instanceof FormData) {
        delete config.headers['Content-Type'];
    }

    try {
        const response = await fetch(url, config);
        
        // Tentar fazer parse do JSON, mas lidar com respostas não-JSON
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch {
                data = { message: text || `Erro ${response.status}: ${response.statusText}` };
            }
        }
        
        if (!response.ok) {
            let errorMessage = data.message || data.title || `Erro ${response.status}: ${response.statusText}`;
            
            // Tratar erros de validação
            if (data.errors) {
                if (Array.isArray(data.errors)) {
                    errorMessage = data.errors.map(e => 
                        typeof e === 'string' ? e : `${e.field || ''}: ${e.message || e}`
                    ).join(', ');
                } else if (typeof data.errors === 'object') {
                    // Formato do ASP.NET Core: { "Field": ["Error1", "Error2"] }
                    const validationErrors = Object.entries(data.errors)
                        .map(([field, messages]) => {
                            const msgs = Array.isArray(messages) ? messages.join(', ') : messages;
                            return `${field}: ${msgs}`;
                        })
                        .join('; ');
                    errorMessage = validationErrors || errorMessage;
                }
            }
            
            throw new Error(errorMessage);
        }
        
        return data;
    } catch (error) {
        console.error('Erro na requisição:', error);
        // Se já é um Error, apenas relançar
        if (error instanceof Error) {
            throw error;
        }
        // Caso contrário, criar um novo Error
        throw new Error(error.message || 'Erro desconhecido na requisição');
    }
}

// API de Alunos
const AlunosAPI = {
    // Listar todos os alunos
    async listar() {
        const response = await apiRequest('/alunos');
        // ASP.NET Core retorna { value: [...] } para arrays
        if (response && typeof response === 'object' && !Array.isArray(response)) {
            if (Array.isArray(response.value)) {
                return response.value;
            } else if (Array.isArray(response.data)) {
                return response.data;
            }
        }
        return response;
    },

    // Buscar aluno por ID
    async buscarPorId(id) {
        return await apiRequest(`/alunos/${id}`);
    },

    // Criar novo aluno
    async criar(aluno) {
        return await apiRequest('/alunos', {
            method: 'POST',
            body: JSON.stringify(aluno),
        });
    },

    // Atualizar aluno
    async atualizar(id, aluno) {
        return await apiRequest(`/alunos/${id}`, {
            method: 'PUT',
            body: JSON.stringify(aluno),
        });
    },

    // Deletar aluno
    async deletar(id) {
        return await apiRequest(`/alunos/${id}`, {
            method: 'DELETE',
        });
    },

    // Importar alunos do Excel
    async importarExcel(arquivo) {
        const formData = new FormData();
        formData.append('arquivo', arquivo);

        return await apiRequest('/alunos/importar', {
            method: 'POST',
            body: formData,
        });
    }
};

