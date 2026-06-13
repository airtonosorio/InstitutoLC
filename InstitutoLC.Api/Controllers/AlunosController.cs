using InstitutoLC.Api.Data;
using InstitutoLC.Api.Models.DTOs;
using InstitutoLC.Api.Models.Entities;
using InstitutoLC.Api.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace InstitutoLC.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AlunosController : ControllerBase
{
    private readonly InstitutoDbContext _context;

    public AlunosController(InstitutoDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lista todos os alunos
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AlunoResponse>>> GetAlunos([FromQuery] TipoAtividade? atividade)
    {
        var query = _context.Alunos
            .Include(a => a.AlunosTurmas)
            .Include(a => a.Anamnese)
                .ThenInclude(an => an!.Enfermidades)
            .AsQueryable();

        if (atividade.HasValue)
        {
            query = query.Where(a => a.Atividade1 == atividade.Value || a.Atividade2 == atividade.Value);
        }

        var alunos = await query.ToListAsync();

        var response = alunos.Select(MapToResponse);
        return Ok(response);
    }

    /// <summary>
    /// Busca um aluno por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<AlunoResponse>> GetAluno(int id)
    {
        var aluno = await _context.Alunos
            .Include(a => a.AlunosTurmas)
            .Include(a => a.Anamnese)
                .ThenInclude(an => an!.Enfermidades)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (aluno == null)
        {
            return NotFound(new { message = "Aluno não encontrado" });
        }

        return Ok(MapToResponse(aluno));
    }

    /// <summary>
    /// Cria um novo aluno
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<AlunoResponse>> CreateAluno(CriarAlunoRequest request)
    {
        // Verificar se CPF já existe
        if (await _context.Alunos.AnyAsync(a => a.CPF == request.CPF))
        {
            return BadRequest(new { message = "CPF já cadastrado" });
        }

        var aluno = new Aluno
        {
            Nome = request.Nome,
            DataNascimento = request.DataNascimento,
            CPF = request.CPF,
            RG = request.RG,
            Genero = request.Genero,
            CorRaca = request.CorRaca,
            NomeResponsavel = request.NomeResponsavel,
            NomePai = request.NomePai,
            NomeMae = request.NomeMae,
            RecebeBeneficio = request.RecebeBeneficio,
            RendaFamiliar = request.RendaFamiliar,
            Endereco = request.Endereco,
            NumeroEndereco = request.NumeroEndereco,
            Bairro = request.Bairro,
            Municipio = request.Municipio,
            Estado = request.Estado,
            CEP = request.CEP,
            ZonaMoradia = request.ZonaMoradia,
            TipoMoradia = request.TipoMoradia,
            ResponsavelTransporte = request.ResponsavelTransporte,
            MeioTransporte = request.MeioTransporte,
            Escola = request.Escola,
            TipoEscola = request.TipoEscola,
            Serie = request.Serie,
            Turno = request.Turno,
            NumeroPessoasCasa = request.NumeroPessoasCasa,
            Contato1 = request.Contato1,
            Contato2 = request.Contato2,
            Atividade1 = request.Atividade1,
            Atividade2 = request.Atividade2,
            DataCadastro = DateTime.Now
        };

        // Adicionar anamnese se fornecida
        if (request.Anamnese != null)
        {
            var anamnese = new AnamneseAluno
            {
                PossuiEnfermidade = request.Anamnese.PossuiEnfermidade,
                ObservacoesGerais = request.Anamnese.ObservacoesGerais,
                DataCadastro = DateTime.Now
            };

            if (request.Anamnese.Enfermidades?.Any() == true)
            {
                foreach (var enfDto in request.Anamnese.Enfermidades)
                {
                    anamnese.Enfermidades.Add(new Enfermidade
                    {
                        TipoEnfermidade = enfDto.TipoEnfermidade,
                        Descricao = enfDto.Descricao,
                        DataCadastro = DateTime.Now
                    });
                }
            }

            aluno.Anamnese = anamnese;
        }

        _context.Alunos.Add(aluno);
        await _context.SaveChangesAsync();

        // Recarregar com includes
        await _context.Entry(aluno)
            .Reference(a => a.Anamnese)
            .LoadAsync();

        await _context.Entry(aluno)
            .Collection(a => a.AlunosTurmas)
            .LoadAsync();

        if (aluno.Anamnese != null)
        {
            await _context.Entry(aluno.Anamnese)
                .Collection(an => an.Enfermidades)
                .LoadAsync();
        }

        return CreatedAtAction(nameof(GetAluno), new { id = aluno.Id }, MapToResponse(aluno));
    }

    /// <summary>
    /// Atualiza um aluno existente
    /// </summary>
    [HttpPut("{id}")]
    public async Task<ActionResult<AlunoResponse>> UpdateAluno(int id, AtualizarAlunoRequest request)
    {
        var aluno = await _context.Alunos
            .Include(a => a.AlunosTurmas)
            .Include(a => a.Anamnese)
                .ThenInclude(an => an!.Enfermidades)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (aluno == null)
        {
            return NotFound(new { message = "Aluno não encontrado" });
        }

        // Verificar se CPF está sendo alterado e se já existe
        if (!string.IsNullOrWhiteSpace(request.CPF) && request.CPF != aluno.CPF)
        {
            if (await _context.Alunos.AnyAsync(a => a.CPF == request.CPF && a.Id != id))
            {
                return BadRequest(new { message = "CPF já cadastrado para outro aluno" });
            }
            aluno.CPF = request.CPF;
        }

        // Atualizar campos se fornecidos
        if (!string.IsNullOrWhiteSpace(request.Nome))
            aluno.Nome = request.Nome;
        
        if (request.DataNascimento.HasValue)
            aluno.DataNascimento = request.DataNascimento.Value;

        if (!string.IsNullOrWhiteSpace(request.RG))
            aluno.RG = request.RG;

        if (request.Genero.HasValue)
            aluno.Genero = request.Genero.Value;

        if (request.CorRaca.HasValue)
            aluno.CorRaca = request.CorRaca.Value;

        if (!string.IsNullOrWhiteSpace(request.NomeResponsavel))
            aluno.NomeResponsavel = request.NomeResponsavel;

        if (request.NomePai != null)
            aluno.NomePai = request.NomePai;

        if (request.NomeMae != null)
            aluno.NomeMae = request.NomeMae;

        if (request.RecebeBeneficio.HasValue)
            aluno.RecebeBeneficio = request.RecebeBeneficio.Value;

        if (request.RendaFamiliar != null)
            aluno.RendaFamiliar = request.RendaFamiliar;

        if (!string.IsNullOrWhiteSpace(request.Endereco))
            aluno.Endereco = request.Endereco;

        if (!string.IsNullOrWhiteSpace(request.NumeroEndereco))
            aluno.NumeroEndereco = request.NumeroEndereco;

        if (!string.IsNullOrWhiteSpace(request.Bairro))
            aluno.Bairro = request.Bairro;

        if (!string.IsNullOrWhiteSpace(request.Municipio))
            aluno.Municipio = request.Municipio;

        if (!string.IsNullOrWhiteSpace(request.Estado))
            aluno.Estado = request.Estado;

        if (!string.IsNullOrWhiteSpace(request.CEP))
            aluno.CEP = request.CEP;

        if (request.ZonaMoradia.HasValue)
            aluno.ZonaMoradia = request.ZonaMoradia.Value;

        if (request.TipoMoradia.HasValue)
            aluno.TipoMoradia = request.TipoMoradia.Value;

        if (request.ResponsavelTransporte.HasValue)
            aluno.ResponsavelTransporte = request.ResponsavelTransporte.Value;

        if (request.MeioTransporte.HasValue)
            aluno.MeioTransporte = request.MeioTransporte.Value;

        if (!string.IsNullOrWhiteSpace(request.Escola))
            aluno.Escola = request.Escola;

        if (request.TipoEscola.HasValue)
            aluno.TipoEscola = request.TipoEscola.Value;

        if (!string.IsNullOrWhiteSpace(request.Serie))
            aluno.Serie = request.Serie;

        if (request.Turno.HasValue)
            aluno.Turno = request.Turno.Value;

        if (request.NumeroPessoasCasa.HasValue)
            aluno.NumeroPessoasCasa = request.NumeroPessoasCasa.Value;

        if (request.Contato1 != null)
            aluno.Contato1 = request.Contato1;

        if (request.Contato2 != null)
            aluno.Contato2 = request.Contato2;

        if (request.Atividade1.HasValue || request.Atividade1 == null) // We allow clearing if necessary, but DTO might not specify
            aluno.Atividade1 = request.Atividade1;
            
        if (request.Atividade2.HasValue || request.Atividade2 == null)
            aluno.Atividade2 = request.Atividade2;

        // Atualizar anamnese
        if (request.Anamnese != null)
        {
            if (aluno.Anamnese == null)
            {
                aluno.Anamnese = new AnamneseAluno
                {
                    AlunoId = aluno.Id,
                    DataCadastro = DateTime.Now
                };
            }

            aluno.Anamnese.PossuiEnfermidade = request.Anamnese.PossuiEnfermidade;
            aluno.Anamnese.ObservacoesGerais = request.Anamnese.ObservacoesGerais;
            aluno.Anamnese.DataAtualizacao = DateTime.Now;

            // Remover enfermidades antigas
            if (aluno.Anamnese.Enfermidades?.Any() == true)
            {
                _context.Enfermidades.RemoveRange(aluno.Anamnese.Enfermidades);
            }

            // Adicionar novas enfermidades
            if (request.Anamnese.Enfermidades?.Any() == true && aluno.Anamnese != null)
            {
                foreach (var enfDto in request.Anamnese.Enfermidades)
                {
                    aluno.Anamnese.Enfermidades?.Add(new Enfermidade
                    {
                        TipoEnfermidade = enfDto.TipoEnfermidade,
                        Descricao = enfDto.Descricao,
                        DataCadastro = DateTime.Now
                    });
                }
            }
        }

        aluno.DataAtualizacao = DateTime.Now;

        await _context.SaveChangesAsync();

        // Recarregar com includes para garantir que os dados estão atualizados
        await _context.Entry(aluno)
            .Reference(a => a.Anamnese)
            .LoadAsync();

        await _context.Entry(aluno)
            .Collection(a => a.AlunosTurmas)
            .LoadAsync();

        if (aluno.Anamnese != null)
        {
            await _context.Entry(aluno.Anamnese)
                .Collection(an => an.Enfermidades)
                .LoadAsync();
        }

        return Ok(MapToResponse(aluno));
    }

    /// <summary>
    /// Deleta um aluno
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteAluno(int id)
    {
        var aluno = await _context.Alunos.FindAsync(id);

        if (aluno == null)
        {
            return NotFound(new { message = "Aluno não encontrado" });
        }

        _context.Alunos.Remove(aluno);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Importa alunos a partir de um arquivo Excel
    /// </summary>
    [HttpPost("importar")]
    [EnableRateLimiting("import-limit")]
    public async Task<ActionResult> ImportarAlunosNormalizado(IFormFile arquivo)
    {
        if (arquivo == null || arquivo.Length == 0)
        {
            return BadRequest(new { message = "Arquivo não fornecido" });
        }

        if (arquivo.Length > 5 * 1024 * 1024)
        {
            return BadRequest(new { message = "O tamanho do arquivo não pode ultrapassar 5MB" });
        }

        var extensao = Path.GetExtension(arquivo.FileName).ToLower();
        if (extensao != ".xlsx" && extensao != ".xls")
        {
            return BadRequest(new { message = "Formato de arquivo inválido. Use .xlsx ou .xls" });
        }

        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        var erros = new List<string>();
        var sucessos = new List<object>();
        var alunosParaImportar = new List<Aluno>();
        var atividades = await _context.Atividades.AsNoTracking().ToListAsync();

        try
        {
            using var stream = new MemoryStream();
            await arquivo.CopyToAsync(stream);
            stream.Position = 0;

            using var package = new ExcelPackage(stream);
            var worksheet = package.Workbook.Worksheets.FirstOrDefault();
            var dimension = worksheet?.Dimension;
            if (worksheet == null || dimension == null)
            {
                return BadRequest(new { message = "Arquivo Excel vazio ou inválido" });
            }

            if (dimension.End.Row > 1001)
            {
                return BadRequest(new { message = "O arquivo excede o limite de 1000 registros por importação" });
            }
            if (dimension.End.Column > 60)
            {
                return BadRequest(new { message = "O arquivo excede o limite permitido de 60 colunas" });
            }
            if (dimension.Rows < 2)
            {
                return BadRequest(new { message = "O arquivo deve conter pelo menos uma linha de cabeçalho e uma linha de dados" });
            }

            var headers = new Dictionary<string, int>();
            for (int col = 1; col <= dimension.End.Column; col++)
            {
                var header = NormalizeHeader(worksheet.Cells[1, col].Value?.ToString());
                if (!string.IsNullOrWhiteSpace(header))
                {
                    headers[header] = col;
                }
            }

            var colunasFaltando = RequiredImportColumns
                .Where(column => !headers.ContainsKey(NormalizeHeader(column)))
                .ToList();

            if (colunasFaltando.Any())
            {
                return BadRequest(new
                {
                    message = $"A planilha precisa ter todas as colunas do modelo. Colunas faltando: {string.Join(", ", colunasFaltando)}"
                });
            }

            for (int row = 2; row <= dimension.End.Row; row++)
            {
                try
                {
                    if (IsEmptyRow(worksheet, row, dimension.End.Column))
                    {
                        continue;
                    }

                    var nome = GetCellText(worksheet, headers, row, "Nome");
                    if (string.IsNullOrWhiteSpace(nome))
                    {
                        erros.Add($"Linha {row}: Nome é obrigatório");
                        continue;
                    }

                    if (!TryGetDate(worksheet.Cells[row, headers[NormalizeHeader("Data de Nascimento")]].Value, out var dataNascimento))
                    {
                        erros.Add($"Linha {row}: Data de nascimento é obrigatória e precisa ser válida");
                        continue;
                    }

                    var cpf = OnlyDigits(GetCellText(worksheet, headers, row, "CPF"));
                    if (string.IsNullOrWhiteSpace(cpf))
                    {
                        erros.Add($"Linha {row}: CPF é obrigatório");
                        continue;
                    }

                    if (await _context.Alunos.AnyAsync(a => a.CPF == cpf))
                    {
                        erros.Add($"Linha {row}: CPF {cpf} já cadastrado");
                        continue;
                    }

                    if (alunosParaImportar.Any(a => a.CPF == cpf))
                    {
                        erros.Add($"Linha {row}: CPF {cpf} duplicado no arquivo");
                        continue;
                    }

                    if (!TryGetOptionalDate(worksheet, headers, row, "Data Cadastro", out var dataCadastroImportada, out var dataCadastroTexto))
                    {
                        erros.Add($"Linha {row}: Data Cadastro inválida: {dataCadastroTexto}");
                        continue;
                    }

                    var dataCadastro = dataCadastroImportada ?? DateTime.Now;
                    var anamnese = BuildAnamnese(worksheet, headers, row, dataCadastro);

                    var aluno = new Aluno
                    {
                        Nome = nome,
                        DataNascimento = dataNascimento,
                        CPF = cpf,
                        RG = GetCellText(worksheet, headers, row, "RG"),
                        Genero = ParseGenero(GetCellText(worksheet, headers, row, "Gênero")),
                        CorRaca = ParseCorRaca(GetCellText(worksheet, headers, row, "Cor ou Etnia")),
                        NomeResponsavel = GetCellText(worksheet, headers, row, "Nome do Responsável"),
                        NomePai = GetCellText(worksheet, headers, row, "Nome do Pai"),
                        NomeMae = GetCellText(worksheet, headers, row, "Nome da Mãe"),
                        RecebeBeneficio = ParseBool(GetCellText(worksheet, headers, row, "Recebe Benefício")),
                        RendaFamiliar = GetCellText(worksheet, headers, row, "Renda Familiar"),
                        CEP = GetCellText(worksheet, headers, row, "CEP"),
                        Endereco = GetCellText(worksheet, headers, row, "Endereço"),
                        NumeroEndereco = GetCellText(worksheet, headers, row, "Número"),
                        Bairro = GetCellText(worksheet, headers, row, "Bairro"),
                        Municipio = GetCellText(worksheet, headers, row, "Município"),
                        Estado = GetCellText(worksheet, headers, row, "Estado").ToUpperInvariant(),
                        ZonaMoradia = ParseZonaMoradia(GetCellText(worksheet, headers, row, "Zona de Moradia")),
                        TipoMoradia = ParseTipoMoradia(GetCellText(worksheet, headers, row, "Tipo de Moradia")),
                        Escola = GetCellText(worksheet, headers, row, "Escola"),
                        TipoEscola = ParseTipoEscola(GetCellText(worksheet, headers, row, "Tipo Escola")),
                        Serie = GetCellText(worksheet, headers, row, "Série"),
                        Turno = ParseTurno(GetCellText(worksheet, headers, row, "Turno")),
                        NumeroPessoasCasa = ParseIntOrDefault(GetCellText(worksheet, headers, row, "Número de Pessoas na Casa"), 1),
                        ResponsavelTransporte = ParseResponsavelTransporte(GetCellText(worksheet, headers, row, "Responsável Transporte")),
                        MeioTransporte = ParseMeioTransporte(GetCellText(worksheet, headers, row, "Meio Transporte")),
                        Contato1 = GetCellText(worksheet, headers, row, "Contato 1"),
                        Contato2 = EmptyToNull(GetCellText(worksheet, headers, row, "Contato 2")),
                        Atividade1 = ParseAtividade(GetCellText(worksheet, headers, row, "Atividade 1"), atividades),
                        Atividade2 = ParseAtividade(GetCellText(worksheet, headers, row, "Atividade 2"), atividades),
                        Anamnese = anamnese,
                        DataCadastro = dataCadastro
                    };

                    alunosParaImportar.Add(aluno);
                    sucessos.Add(new { linha = row, nome, cpf });
                }
                catch (Exception ex)
                {
                    erros.Add($"Linha {row}: Erro ao processar - {ex.Message}");
                }
            }

            if (erros.Any())
            {
                return BadRequest(new
                {
                    sucesso = false,
                    message = "A importação falhou porque existem erros no arquivo. Nenhum aluno foi importado.",
                    totalImportados = 0,
                    totalErros = erros.Count,
                    alunos = new List<object>(),
                    erros
                });
            }

            if (alunosParaImportar.Any())
            {
                try
                {
                    _context.Alunos.AddRange(alunosParaImportar);
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new { message = $"Erro ao salvar no banco de dados: {ex.Message}" });
                }
            }

            return Ok(new
            {
                sucesso = true,
                totalImportados = alunosParaImportar.Count,
                totalErros = 0,
                alunos = sucessos,
                erros = new List<string>()
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao processar arquivo: {ex.Message}" });
        }
    }

    [NonAction]
    [HttpPost("importar")]
    [EnableRateLimiting("import-limit")]
    public async Task<ActionResult> ImportarAlunos(IFormFile arquivo)
    {
        if (arquivo == null || arquivo.Length == 0)
        {
            return BadRequest(new { message = "Arquivo não fornecido" });
        }

        // Limitar tamanho do arquivo a 5MB
        if (arquivo.Length > 5 * 1024 * 1024)
        {
            return BadRequest(new { message = "O tamanho do arquivo não pode ultrapassar 5MB" });
        }

        var extensao = Path.GetExtension(arquivo.FileName).ToLower();
        if (extensao != ".xlsx" && extensao != ".xls")
        {
            return BadRequest(new { message = "Formato de arquivo inválido. Use .xlsx ou .xls" });
        }

        ExcelPackage.LicenseContext = LicenseContext.NonCommercial;
        var erros = new List<string>();
        var sucessos = new List<object>();
        var alunosParaImportar = new List<Aluno>();

        try
        {
            using (var stream = new MemoryStream())
            {
                await arquivo.CopyToAsync(stream);
                stream.Position = 0;

                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets[0];
                    var dimension = worksheet.Dimension;
                    if (dimension == null)
                    {
                        return BadRequest(new { message = "Arquivo Excel vazio ou inválido" });
                    }

                    // Limitar quantidade de linhas e colunas para evitar exaustão de recursos
                    if (dimension.End.Row > 1001) // 1 cabeçalho + 1000 dados
                    {
                        return BadRequest(new { message = "O arquivo excede o limite de 1000 registros por importação" });
                    }
                    if (dimension.End.Column > 50)
                    {
                        return BadRequest(new { message = "O arquivo excede o limite permitido de 50 colunas" });
                    }

                    var rowCount = dimension.Rows;

                    if (rowCount < 2)
                    {
                        return BadRequest(new { message = "O arquivo deve conter pelo menos uma linha de cabeçalho e uma linha de dados" });
                    }
                    
                    // Ler cabeçalhos (primeira linha)
                    var headers = new Dictionary<string, int>();
                    for (int col = 1; col <= dimension.End.Column; col++)
                    {
                        var headerValue = worksheet.Cells[1, col].Value?.ToString()?.Trim().ToLower() ?? "";
                        if (!string.IsNullOrEmpty(headerValue))
                        {
                            headers[headerValue] = col;
                        }
                    }

                    // Validar colunas obrigatórias essenciais (Apenas Nome e CPF, o resto é tolerante)
                    var colunasObrigatorias = new[] { "nome", "cpf" };
                    var colunasFaltando = colunasObrigatorias.Where(c => !headers.ContainsKey(c)).ToList();
                    if (colunasFaltando.Any())
                    {
                        return BadRequest(new { message = $"Colunas obrigatórias faltando para importação mínima: {string.Join(", ", colunasFaltando)}" });
                    }

                    // Processar linhas de dados - VALIDAÇÃO COMPLETA ANTES DE IMPORTAR
                    for (int row = 2; row <= rowCount; row++)
                    {
                        try
                        {
                            var nome = worksheet.Cells[row, headers["nome"]].Value?.ToString()?.Trim();
                            if (string.IsNullOrWhiteSpace(nome))
                            {
                                erros.Add($"Linha {row}: Nome é obrigatório");
                                continue;
                            }

                            // Data de nascimento
                            DateTime dataNascimento;
                            var dataNascValue = worksheet.Cells[row, headers["data de nascimento"]].Value;
                            
                            if (dataNascValue == null)
                            {
                                erros.Add($"Linha {row}: Data de nascimento é obrigatória");
                                continue;
                            }
                            
                            // Se a célula contém um objeto DateTime (quando Excel armazena como data)
                            if (dataNascValue is DateTime dt)
                            {
                                dataNascimento = dt;
                            }
                            // Se for um número (número serial do Excel - pode ser double, decimal, float, int)
                            else if (dataNascValue is double dbl)
                            {
                                dataNascimento = DateTime.FromOADate(dbl);
                            }
                            else if (dataNascValue is decimal dec)
                            {
                                dataNascimento = DateTime.FromOADate((double)dec);
                            }
                            else if (dataNascValue is float flt)
                            {
                                dataNascimento = DateTime.FromOADate((double)flt);
                            }
                            else if (dataNascValue is int intVal)
                            {
                                dataNascimento = DateTime.FromOADate((double)intVal);
                            }
                            // Tentar converter para double se for um número
                            else if (double.TryParse(dataNascValue.ToString(), out double numValue))
                            {
                                // Verificar se parece um número serial do Excel (geralmente entre 1 e 100000)
                                if (numValue > 1 && numValue < 1000000)
                                {
                                    dataNascimento = DateTime.FromOADate(numValue);
                                }
                                else
                                {
                                    erros.Add($"Linha {row}: Data de nascimento inválida (número serial inválido): {numValue}");
                                    continue;
                                }
                            }
                            // Se for string, tentar fazer parse
                            else
                            {
                                var dataNascStr = dataNascValue?.ToString()?.Trim();
                                if (string.IsNullOrWhiteSpace(dataNascStr))
                                {
                                    erros.Add($"Linha {row}: Data de nascimento é obrigatória");
                                    continue;
                                }
                                
                                // Tentar parsear com diferentes formatos
                                if (!DateTime.TryParse(dataNascStr, System.Globalization.CultureInfo.InvariantCulture, 
                                    System.Globalization.DateTimeStyles.None, out dataNascimento))
                                {
                                    // Tentar com formato específico dd/MM/yyyy
                                    if (!DateTime.TryParseExact(dataNascStr, new[] { "dd/MM/yyyy", "d/M/yyyy", "dd-MM-yyyy", "d-M-yyyy" }, 
                                        System.Globalization.CultureInfo.InvariantCulture, 
                                        System.Globalization.DateTimeStyles.None, out dataNascimento))
                                    {
                                        erros.Add($"Linha {row}: Data de nascimento inválida: {dataNascStr}");
                                        continue;
                                    }
                                }
                            }

                            var cpf = worksheet.Cells[row, headers["cpf"]].Value?.ToString()?.Trim() ?? "";
                            
                            // Limpar CPF (remover pontos e traços)
                            cpf = Regex.Replace(cpf, @"[^\d]", "");

                            if (string.IsNullOrWhiteSpace(cpf))
                            {
                                erros.Add($"Linha {row}: CPF é obrigatório");
                                continue;
                            }

                            // Verificar se CPF já existe no banco
                            if (await _context.Alunos.AnyAsync(a => a.CPF == cpf))
                            {
                                erros.Add($"Linha {row}: CPF {cpf} já cadastrado");
                                continue;
                            }

                            // Verificar se CPF já está na lista de importação (duplicatas no mesmo arquivo)
                            if (alunosParaImportar.Any(a => a.CPF == cpf))
                            {
                                erros.Add($"Linha {row}: CPF {cpf} duplicado no arquivo");
                                continue;
                            }

                            var endereco = worksheet.Cells[row, headers["endereço"]].Value?.ToString()?.Trim() ?? "";
                            var numeroEndereco = worksheet.Cells[row, headers["número"]].Value?.ToString()?.Trim() ?? "";
                            var bairro = worksheet.Cells[row, headers["bairro"]].Value?.ToString()?.Trim() ?? "";
                            var municipio = worksheet.Cells[row, headers["município"]].Value?.ToString()?.Trim() ?? "";
                            var estado = worksheet.Cells[row, headers["estado"]].Value?.ToString()?.Trim() ?? "";
                            
                            if (estado.Length != 2)
                            {
                                erros.Add($"Linha {row}: Estado deve ter 2 caracteres");
                                continue;
                            }

                            var escola = worksheet.Cells[row, headers["escola"]].Value?.ToString()?.Trim() ?? "";
                            
                            // Tipo Escola
                            var tipoEscolaStr = worksheet.Cells[row, headers["tipo escola"]].Value?.ToString()?.Trim().ToLower();
                            TipoEscola tipoEscola;
                            if (tipoEscolaStr == "pública" || tipoEscolaStr == "publica" || tipoEscolaStr == "1")
                                tipoEscola = TipoEscola.Publica;
                            else if (tipoEscolaStr == "privada" || tipoEscolaStr == "2")
                                tipoEscola = TipoEscola.Privada;
                            else
                            {
                                erros.Add($"Linha {row}: Tipo de escola inválido: {tipoEscolaStr}. Use 'Pública' ou 'Privada'");
                                continue;
                            }

                            var serie = worksheet.Cells[row, headers["série"]].Value?.ToString()?.Trim() ?? "";
                            
                            // Turno
                            var turnoStr = worksheet.Cells[row, headers["turno"]].Value?.ToString()?.Trim().ToLower();
                            Turno turno;
                            if (turnoStr == "matutino" || turnoStr == "1")
                                turno = Turno.Matutino;
                            else if (turnoStr == "vespertino" || turnoStr == "2")
                                turno = Turno.Vespertino;
                            else if (turnoStr == "noturno" || turnoStr == "3")
                                turno = Turno.Noturno;
                            else if (turnoStr == "integral" || turnoStr == "4")
                                turno = Turno.Integral;
                            else
                            {
                                erros.Add($"Linha {row}: Turno inválido: {turnoStr}. Use 'Matutino', 'Vespertino', 'Noturno' ou 'Integral'");
                                continue;
                            }

                            // Número de pessoas na casa
                            var numPessoasStr = worksheet.Cells[row, headers["número de pessoas na casa"]].Value?.ToString()?.Trim();
                            if (!int.TryParse(numPessoasStr, out int numPessoas) || numPessoas < 1)
                            {
                                erros.Add($"Linha {row}: Número de pessoas na casa inválido: {numPessoasStr}");
                                continue;
                            }

                            var contato1 = worksheet.Cells[row, headers["contato 1"]].Value?.ToString()?.Trim() ?? "";
                            var contato2 = headers.ContainsKey("contato 2") 
                                ? worksheet.Cells[row, headers["contato 2"]].Value?.ToString()?.Trim() 
                                : null;

                            var aluno = new Aluno
                            {
                                Nome = nome,
                                DataNascimento = dataNascimento,
                                CPF = cpf,
                                Endereco = endereco,
                                NumeroEndereco = numeroEndereco,
                                Bairro = bairro,
                                Municipio = municipio,
                                Estado = estado.ToUpper(),
                                Escola = escola,
                                TipoEscola = tipoEscola,
                                Serie = serie,
                                Turno = turno,
                                NumeroPessoasCasa = numPessoas,
                                Contato1 = contato1,
                                Contato2 = contato2,
                                DataCadastro = DateTime.Now
                            };

                            alunosParaImportar.Add(aluno);
                            sucessos.Add(new { linha = row, nome = nome, cpf = cpf });
                        }
                        catch (Exception ex)
                        {
                            erros.Add($"Linha {row}: Erro ao processar - {ex.Message}");
                        }
                    }
                }
            }

            // IMPORTACAO ATOMICA: Se houver qualquer erro, não importa nada
            if (erros.Any())
            {
                return BadRequest(new
                {
                    sucesso = false,
                    message = "A importação falhou porque existem erros no arquivo. Nenhum aluno foi importado.",
                    totalImportados = 0,
                    totalErros = erros.Count,
                    alunos = new List<object>(),
                    erros = erros
                });
            }

            // Se chegou aqui, todos os registros são válidos - importar tudo em uma transação
            if (alunosParaImportar.Any())
            {
                try
                {
                    _context.Alunos.AddRange(alunosParaImportar);
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    return StatusCode(500, new { message = $"Erro ao salvar no banco de dados: {ex.Message}" });
                }
            }

            return Ok(new
            {
                sucesso = true,
                totalImportados = alunosParaImportar.Count,
                totalErros = 0,
                alunos = sucessos,
                erros = new List<string>()
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao processar arquivo: {ex.Message}" });
        }
    }

    private static readonly string[] RequiredImportColumns =
    {
        "Nome",
        "Data de Nascimento",
        "CPF",
        "RG",
        "Gênero",
        "Cor ou Etnia",
        "Nome do Responsável",
        "Nome do Pai",
        "Nome da Mãe",
        "Recebe Benefício",
        "Renda Familiar",
        "CEP",
        "Endereço",
        "Número",
        "Bairro",
        "Município",
        "Estado",
        "Zona de Moradia",
        "Tipo de Moradia",
        "Escola",
        "Tipo Escola",
        "Série",
        "Turno",
        "Número de Pessoas na Casa",
        "Responsável Transporte",
        "Meio Transporte",
        "Contato 1",
        "Contato 2",
        "Bronquite/Asma",
        "Doença Cardiovascular",
        "Epilepsia",
        "Convulsões",
        "Diabetes",
        "Problemas Auditivos",
        "Alergia",
        "Problemas Oculares",
        "Problemas Ortopédicos",
        "Medicamento",
        "Cirurgia",
        "Outro",
        "Observações Gerais",
        "Atividade 1",
        "Atividade 2"
    };

    private static string NormalizeHeader(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return string.Empty;
        }

        var normalized = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder();
        foreach (var c in normalized)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(c);
            if (category == UnicodeCategory.NonSpacingMark)
            {
                continue;
            }

            if (char.IsLetterOrDigit(c))
            {
                builder.Append(c);
            }
        }

        return builder.ToString();
    }

    private static string NormalizeValue(string? value) => NormalizeHeader(value);

    private static string GetCellText(ExcelWorksheet worksheet, Dictionary<string, int> headers, int row, string column)
    {
        var key = NormalizeHeader(column);
        if (!headers.TryGetValue(key, out var col))
        {
            return string.Empty;
        }

        var cell = worksheet.Cells[row, col];
        return (cell.Text ?? cell.Value?.ToString() ?? string.Empty).Trim();
    }

    private static bool IsEmptyRow(ExcelWorksheet worksheet, int row, int columnCount)
    {
        for (var col = 1; col <= columnCount; col++)
        {
            if (!string.IsNullOrWhiteSpace(worksheet.Cells[row, col].Value?.ToString()))
            {
                return false;
            }
        }

        return true;
    }

    private static string OnlyDigits(string value) => Regex.Replace(value ?? string.Empty, @"[^\d]", "");

    private static string? EmptyToNull(string value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();

    private static int ParseIntOrDefault(string value, int defaultValue)
    {
        return int.TryParse(value, out var result) ? result : defaultValue;
    }

    private static bool ParseBool(string value)
    {
        var normalized = NormalizeValue(value);
        return normalized is "sim" or "s" or "true" or "1" or "x" or "yes";
    }

    private static bool TryGetDate(object? value, out DateTime date)
    {
        date = default;
        if (value == null)
        {
            return false;
        }

        if (value is DateTime dt)
        {
            date = dt;
            return true;
        }

        if (value is double dbl)
        {
            date = DateTime.FromOADate(dbl);
            return true;
        }

        if (double.TryParse(value.ToString(), out var serial) && serial > 1 && serial < 1000000)
        {
            date = DateTime.FromOADate(serial);
            return true;
        }

        var text = value.ToString()?.Trim();
        if (string.IsNullOrWhiteSpace(text))
        {
            return false;
        }

        var formats = new[] { "dd/MM/yyyy", "d/M/yyyy", "yyyy-MM-dd", "dd-MM-yyyy", "d-M-yyyy" };
        return DateTime.TryParseExact(text, formats, CultureInfo.GetCultureInfo("pt-BR"), DateTimeStyles.None, out date)
            || DateTime.TryParse(text, CultureInfo.GetCultureInfo("pt-BR"), DateTimeStyles.None, out date)
            || DateTime.TryParse(text, CultureInfo.InvariantCulture, DateTimeStyles.None, out date);
    }

    private static bool TryGetOptionalDate(
        ExcelWorksheet worksheet,
        Dictionary<string, int> headers,
        int row,
        string column,
        out DateTime? date,
        out string rawValue)
    {
        date = null;
        rawValue = string.Empty;
        var key = NormalizeHeader(column);
        if (!headers.TryGetValue(key, out var col))
        {
            return true;
        }

        var cell = worksheet.Cells[row, col];
        rawValue = (cell.Text ?? cell.Value?.ToString() ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(rawValue))
        {
            return true;
        }

        if (TryGetDate(cell.Value, out var parsedDate) || TryGetDate(rawValue, out parsedDate))
        {
            date = parsedDate;
            return true;
        }

        return false;
    }

    private static Genero ParseGenero(string value)
    {
        var normalized = NormalizeValue(value);
        if (int.TryParse(value, out var number) && Enum.IsDefined(typeof(Genero), number))
        {
            return (Genero)number;
        }

        return normalized switch
        {
            "masculino" => Genero.Masculino,
            "feminino" => Genero.Feminino,
            "outro" => Genero.Outro,
            "prefironaodizer" or "naoinformado" => Genero.PrefiroNaoDizer,
            _ => Genero.PrefiroNaoDizer
        };
    }

    private static CorRaca ParseCorRaca(string value)
    {
        var normalized = NormalizeValue(value);
        if (int.TryParse(value, out var number) && Enum.IsDefined(typeof(CorRaca), number))
        {
            return (CorRaca)number;
        }

        return normalized switch
        {
            "branco" or "branca" => CorRaca.Branco,
            "preto" or "preta" => CorRaca.Preto,
            "pardo" or "parda" => CorRaca.Pardo,
            "amarelo" or "amarela" => CorRaca.Amarelo,
            "indigena" => CorRaca.Indigena,
            _ => CorRaca.NaoInformado
        };
    }

    private static ZonaMoradia ParseZonaMoradia(string value)
    {
        var normalized = NormalizeValue(value);
        if (int.TryParse(value, out var number) && Enum.IsDefined(typeof(ZonaMoradia), number))
        {
            return (ZonaMoradia)number;
        }

        return normalized == "rural" ? ZonaMoradia.Rural : ZonaMoradia.Urbana;
    }

    private static TipoMoradia ParseTipoMoradia(string value)
    {
        var normalized = NormalizeValue(value);
        if (int.TryParse(value, out var number) && Enum.IsDefined(typeof(TipoMoradia), number))
        {
            return (TipoMoradia)number;
        }

        return normalized switch
        {
            "alugada" or "alugado" => TipoMoradia.Alugada,
            "cedida" or "cedido" => TipoMoradia.Cedida,
            "outro" or "outra" => TipoMoradia.Outro,
            _ => TipoMoradia.Propria
        };
    }

    private static TipoEscola ParseTipoEscola(string value)
    {
        var normalized = NormalizeValue(value);
        if (normalized == "privada" || normalized == "particular" || normalized == "2")
        {
            return TipoEscola.Privada;
        }

        return TipoEscola.Publica;
    }

    private static Turno ParseTurno(string value)
    {
        var normalized = NormalizeValue(value);
        if (int.TryParse(value, out var number))
        {
            if (number == 0) return Turno.Matutino;
            if (Enum.IsDefined(typeof(Turno), number)) return (Turno)number;
        }

        return normalized switch
        {
            "vespertino" => Turno.Vespertino,
            "noturno" => Turno.Noturno,
            "integral" => Turno.Integral,
            _ => Turno.Matutino
        };
    }

    private static ResponsavelTransporte ParseResponsavelTransporte(string value)
    {
        var normalized = NormalizeValue(value);
        if (int.TryParse(value, out var number) && Enum.IsDefined(typeof(ResponsavelTransporte), number))
        {
            return (ResponsavelTransporte)number;
        }

        return normalized switch
        {
            "pai" => ResponsavelTransporte.Pai,
            "sozinho" or "sozinha" => ResponsavelTransporte.Sozinho,
            "outromembrodafamilia" or "outrofamilia" => ResponsavelTransporte.OutroMembroFamilia,
            "outronaomembro" or "outronaomembrodafamilia" => ResponsavelTransporte.OutroNaoMembroFamilia,
            _ => ResponsavelTransporte.Mae
        };
    }

    private static MeioTransporte ParseMeioTransporte(string value)
    {
        var normalized = NormalizeValue(value);
        if (int.TryParse(value, out var number) && Enum.IsDefined(typeof(MeioTransporte), number))
        {
            return (MeioTransporte)number;
        }

        return normalized switch
        {
            "onibus" => MeioTransporte.Onibus,
            "veiculoparticular" or "carro" => MeioTransporte.VeiculoParticular,
            "bicicleta" => MeioTransporte.Bicicleta,
            _ => MeioTransporte.Andando
        };
    }

    private static TipoAtividade? ParseAtividade(string value, List<Atividade> atividades)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        if (int.TryParse(value, out var id) && id > 0)
        {
            return (TipoAtividade)id;
        }

        var normalized = NormalizeValue(value);
        var atividade = atividades.FirstOrDefault(a =>
            NormalizeValue(a.Nome) == normalized ||
            NormalizeValue(Regex.Replace(a.Nome, @"\s*\([^)]*\)", "")) == normalized);

        return atividade == null ? null : (TipoAtividade)atividade.Id;
    }

    private static AnamneseAluno? BuildAnamnese(ExcelWorksheet worksheet, Dictionary<string, int> headers, int row, DateTime dataCadastro)
    {
        var enfermidades = new List<Enfermidade>();

        void AddBool(string column, TipoEnfermidade tipo, string descricao)
        {
            if (ParseBool(GetCellText(worksheet, headers, row, column)))
            {
                enfermidades.Add(new Enfermidade
                {
                    TipoEnfermidade = tipo,
                    Descricao = descricao,
                    DataCadastro = dataCadastro
                });
            }
        }

        void AddText(string column, string prefix)
        {
            var text = GetCellText(worksheet, headers, row, column);
            if (!string.IsNullOrWhiteSpace(text))
            {
                enfermidades.Add(new Enfermidade
                {
                    TipoEnfermidade = TipoEnfermidade.Outros,
                    Descricao = $"{prefix}: {text.Trim()}",
                    DataCadastro = dataCadastro
                });
            }
        }

        AddBool("Bronquite/Asma", TipoEnfermidade.BronquiteAsma, "Bronquite/Asma");
        AddBool("Doença Cardiovascular", TipoEnfermidade.DoencaCoracao, "Doença Cardiovascular");
        AddBool("Epilepsia", TipoEnfermidade.EpilepsiaConvulsoes, "Epilepsia");
        AddBool("Convulsões", TipoEnfermidade.EpilepsiaConvulsoes, "Convulsões");
        AddBool("Diabetes", TipoEnfermidade.Diabetes, "Diabetes");
        AddBool("Problemas Auditivos", TipoEnfermidade.ProblemaAuditivo, "Problemas Auditivos");
        AddBool("Alergia", TipoEnfermidade.Alergia, "Alergia");
        AddBool("Problemas Oculares", TipoEnfermidade.ProblemaVisual, "Problemas Oculares");
        AddBool("Problemas Ortopédicos", TipoEnfermidade.DoencaOrtopedica, "Problemas Ortopédicos");
        AddText("Medicamento", "Medicamento");
        AddText("Cirurgia", "Cirurgia");
        AddText("Outro", "Outro");

        var observacoes = GetCellText(worksheet, headers, row, "Observações Gerais");
        if (!enfermidades.Any() && string.IsNullOrWhiteSpace(observacoes))
        {
            return null;
        }

        return new AnamneseAluno
        {
            PossuiEnfermidade = enfermidades.Any(),
            ObservacoesGerais = EmptyToNull(observacoes),
            DataCadastro = dataCadastro,
            Enfermidades = enfermidades
        };
    }

    private static AlunoResponse MapToResponse(Aluno aluno)
    {
        return new AlunoResponse
        {
            Id = aluno.Id,
            Nome = aluno.Nome,
            DataNascimento = aluno.DataNascimento,
            CPF = aluno.CPF,
            RG = aluno.RG,
            Genero = aluno.Genero,
            CorRaca = aluno.CorRaca,
            NomeResponsavel = aluno.NomeResponsavel,
            NomePai = aluno.NomePai,
            NomeMae = aluno.NomeMae,
            RecebeBeneficio = aluno.RecebeBeneficio,
            RendaFamiliar = aluno.RendaFamiliar,
            Endereco = aluno.Endereco,
            NumeroEndereco = aluno.NumeroEndereco,
            Bairro = aluno.Bairro,
            Municipio = aluno.Municipio,
            Estado = aluno.Estado,
            CEP = aluno.CEP,
            ZonaMoradia = aluno.ZonaMoradia,
            TipoMoradia = aluno.TipoMoradia,
            ResponsavelTransporte = aluno.ResponsavelTransporte,
            MeioTransporte = aluno.MeioTransporte,
            Escola = aluno.Escola,
            TipoEscola = aluno.TipoEscola,
            Serie = aluno.Serie,
            Turno = aluno.Turno,
            NumeroPessoasCasa = aluno.NumeroPessoasCasa,
            Contato1 = aluno.Contato1,
            Contato2 = aluno.Contato2,
            Atividade1 = aluno.Atividade1,
            Atividade2 = aluno.Atividade2,
            Enturmado = aluno.AlunosTurmas != null && aluno.AlunosTurmas.Any(),
            DataCadastro = aluno.DataCadastro,
            DataAtualizacao = aluno.DataAtualizacao,
            Anamnese = aluno.Anamnese == null ? null : new AnamneseResponse
            {
                Id = aluno.Anamnese.Id,
                PossuiEnfermidade = aluno.Anamnese.PossuiEnfermidade,
                ObservacoesGerais = aluno.Anamnese.ObservacoesGerais,
                Enfermidades = aluno.Anamnese.Enfermidades?.Select(e => new EnfermidadeResponse
                {
                    Id = e.Id,
                    TipoEnfermidade = e.TipoEnfermidade,
                    Descricao = e.Descricao
                }).ToList() ?? new List<EnfermidadeResponse>()
            }
        };
    }
}

