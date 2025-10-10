using InstitutoLC.Api.Data;
using InstitutoLC.Api.Models.DTOs;
using InstitutoLC.Api.Models.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
            if (request.Anamnese.Enfermidades?.Any() == true)
            {
                foreach (var enfDto in request.Anamnese.Enfermidades)
                {
                    aluno.Anamnese.Enfermidades.Add(new Enfermidade
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
                Enfermidades = aluno.Anamnese.Enfermidades.Select(e => new EnfermidadeResponse
                {
                    Id = e.Id,
                    TipoEnfermidade = e.TipoEnfermidade,
                    Descricao = e.Descricao
                }).ToList()
            }
        };
    }
}

