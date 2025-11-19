using InstitutoLC.Api.Data;
using InstitutoLC.Api.Models.DTOs;
using InstitutoLC.Api.Models.Entities;
using InstitutoLC.Api.Models.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using OfficeOpenXml;
using System.Text.RegularExpressions;

namespace InstitutoLC.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
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
    public async Task<ActionResult<IEnumerable<AlunoResponse>>> GetAlunos()
    {
        var alunos = await _context.Alunos
            .Include(a => a.Anamnese)
                .ThenInclude(an => an!.Enfermidades)
            .ToListAsync();

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
            RG = request.RG,
            CPF = request.CPF,
            Endereco = request.Endereco,
            NumeroEndereco = request.NumeroEndereco,
            Bairro = request.Bairro,
            Municipio = request.Municipio,
            Estado = request.Estado,
            Escola = request.Escola,
            TipoEscola = request.TipoEscola,
            Serie = request.Serie,
            Turno = request.Turno,
            NumeroPessoasCasa = request.NumeroPessoasCasa,
            Contato1 = request.Contato1,
            Contato2 = request.Contato2,
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

        if (!string.IsNullOrWhiteSpace(request.Contato1))
            aluno.Contato1 = request.Contato1;

        if (request.Contato2 != null)
            aluno.Contato2 = request.Contato2;

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
    public async Task<ActionResult> ImportarAlunos(IFormFile arquivo)
    {
        if (arquivo == null || arquivo.Length == 0)
        {
            return BadRequest(new { message = "Arquivo não fornecido" });
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
                    var rowCount = worksheet.Dimension?.Rows ?? 0;

                    if (rowCount < 2)
                    {
                        return BadRequest(new { message = "O arquivo deve conter pelo menos uma linha de cabeçalho e uma linha de dados" });
                    }

                    // Ler cabeçalhos (primeira linha)
                    var headers = new Dictionary<string, int>();
                    var dimension = worksheet.Dimension;
                    if (dimension == null)
                    {
                        return BadRequest(new { message = "Arquivo Excel vazio ou inválido" });
                    }
                    
                    for (int col = 1; col <= dimension.End.Column; col++)
                    {
                        var headerValue = worksheet.Cells[1, col].Value?.ToString()?.Trim().ToLower() ?? "";
                        if (!string.IsNullOrEmpty(headerValue))
                        {
                            headers[headerValue] = col;
                        }
                    }

                    // Validar colunas obrigatórias
                    var colunasObrigatorias = new[] { "nome", "data de nascimento", "rg", "cpf", "endereço", "número", "bairro", "município", "estado", "escola", "tipo escola", "série", "turno", "número de pessoas na casa", "contato 1" };
                    var colunasFaltando = colunasObrigatorias.Where(c => !headers.ContainsKey(c)).ToList();
                    if (colunasFaltando.Any())
                    {
                        return BadRequest(new { message = $"Colunas obrigatórias faltando: {string.Join(", ", colunasFaltando)}" });
                    }

                    // Processar linhas de dados
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
                            var dataNascStr = worksheet.Cells[row, headers["data de nascimento"]].Value?.ToString()?.Trim();
                            if (string.IsNullOrWhiteSpace(dataNascStr))
                            {
                                erros.Add($"Linha {row}: Data de nascimento é obrigatória");
                                continue;
                            }
                            
                            if (!DateTime.TryParse(dataNascStr, out dataNascimento))
                            {
                                erros.Add($"Linha {row}: Data de nascimento inválida: {dataNascStr}");
                                continue;
                            }

                            var rg = worksheet.Cells[row, headers["rg"]].Value?.ToString()?.Trim() ?? "";
                            var cpf = worksheet.Cells[row, headers["cpf"]].Value?.ToString()?.Trim() ?? "";
                            
                            // Limpar CPF (remover pontos e traços)
                            cpf = Regex.Replace(cpf, @"[^\d]", "");

                            if (string.IsNullOrWhiteSpace(cpf))
                            {
                                erros.Add($"Linha {row}: CPF é obrigatório");
                                continue;
                            }

                            // Verificar se CPF já existe
                            if (await _context.Alunos.AnyAsync(a => a.CPF == cpf))
                            {
                                erros.Add($"Linha {row}: CPF {cpf} já cadastrado");
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
                                RG = rg,
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

            // Salvar alunos válidos
            if (alunosParaImportar.Any())
            {
                _context.Alunos.AddRange(alunosParaImportar);
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                sucesso = true,
                totalImportados = alunosParaImportar.Count,
                totalErros = erros.Count,
                alunos = sucessos,
                erros = erros
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erro ao processar arquivo: {ex.Message}" });
        }
    }

    private static AlunoResponse MapToResponse(Aluno aluno)
    {
        return new AlunoResponse
        {
            Id = aluno.Id,
            Nome = aluno.Nome,
            DataNascimento = aluno.DataNascimento,
            RG = aluno.RG,
            CPF = aluno.CPF,
            Endereco = aluno.Endereco,
            NumeroEndereco = aluno.NumeroEndereco,
            Bairro = aluno.Bairro,
            Municipio = aluno.Municipio,
            Estado = aluno.Estado,
            Escola = aluno.Escola,
            TipoEscola = aluno.TipoEscola,
            Serie = aluno.Serie,
            Turno = aluno.Turno,
            NumeroPessoasCasa = aluno.NumeroPessoasCasa,
            Contato1 = aluno.Contato1,
            Contato2 = aluno.Contato2,
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

