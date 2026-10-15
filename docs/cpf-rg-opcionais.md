# CPF e RG opcionais

Cadastro e edição permitem documentos vazios. Na criação, ausência, null e espaços são armazenados como texto vazio. Na edição, campos omitidos ou null preservam o documento; texto vazio limpa o campo. A importação mantém o modelo de colunas existente e permite células de documentos vazias.

A migration `20261015230000_AllowEmptyCpf` substitui somente o índice `IX_Alunos_CPF` por um índice único com filtro `[CPF] <> N''`. Não modifica colunas, registros, IDs, relacionamentos, senhas ou chaves de criptografia. O banco continua impedindo CPFs preenchidos idênticos.

## Validação local realizada

- Três alunos fictícios cadastrados antes da atualização; comparação dos quatro registros presentes no banco antes/depois, incluindo o registro preexistente: todos idênticos na resposta da API.
- Criação de quatro alunos com documentos omitidos, vazios, null e espaços.
- CPF duplicado rejeitado no cadastro e na edição.
- Preenchimento posterior, preservação de documentos omitidos e limpeza na edição.
- Limites de tamanho de CPF/RG preservados.
- Importação de duas linhas com CPF/RG vazios.
- Login válido e builds de frontend/backend concluídos.
- Índice filtrado e migration confirmados diretamente no SQL Server local.

Esses testes não validam o estado do servidor de produção. Não houve deploy remoto.

## Antes de produção

Confirmar versão em execução, volume persistente, banco e migrations aplicadas. Fazer backup recuperável, guardar cópia fora da VPS e preservar o .env/chave de criptografia de produção. Não substituir essa configuração pelo .env local.

O workflow atual aplica migrations ao iniciar a API e não executa backup nem validação de saúde. Deve ser preparado antes da publicação. A mudança do índice pode bloquear escritas brevemente; prever uma janela de manutenção.

Para voltar a uma versão anterior da aplicação, manter o índice filtrado evita remover os novos alunos sem CPF. A migration reversa bloqueia a reversão se houver mais de um CPF vazio; nunca elimina alunos para recriar o índice antigo.
