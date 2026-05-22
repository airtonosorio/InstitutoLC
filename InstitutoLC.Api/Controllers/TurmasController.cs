using InstitutoLC.Api.Data;
using InstitutoLC.Api.Models.DTOs;
using InstitutoLC.Api.Models.Entities;
using InstitutoLC.Api.Models.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InstitutoLC.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TurmasController : ControllerBase
{
    private readonly InstitutoDbContext _context;

    public TurmasController(InstitutoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<TurmaResponse>>> GetTurmas([FromQuery] int? alunoId)
    {
        var query = _context.Turmas
            .Include(t => t.Horario)
            .Include(t => t.AlunosTurma)
            .AsQueryable();

        var turmas = await query.ToListAsync();

        return Ok(turmas.Select(MapToResponse));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TurmaResponse>> GetTurma(int id)
    {
        var turma = await _context.Turmas
            .Include(t => t.Horario)
            .Include(t => t.AlunosTurma)
                .ThenInclude(at => at.Aluno)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (turma == null) return NotFound();

        var response = MapToResponse(turma);

        return Ok(new {
            turma = response,
            alunos = turma.AlunosTurma.Select(at => new {
                id = at.Aluno.Id,
                nome = at.Aluno.Nome,
                cpf = at.Aluno.CPF
            })
        });
    }

    [HttpPost]
    public async Task<ActionResult<TurmaResponse>> CreateTurma(TurmaRequest request)
    {
        int horarioIdToUse = 0;
        if (!string.IsNullOrWhiteSpace(request.HoraInicio) && !string.IsNullOrWhiteSpace(request.HoraFim))
        {
            var horarioExistente = await _context.Horarios
                .FirstOrDefaultAsync(h => h.HoraInicio == request.HoraInicio && h.HoraFim == request.HoraFim);
            if (horarioExistente != null)
            {
                horarioIdToUse = horarioExistente.Id;
            }
            else
            {
                var novoHorario = new Horario 
                { 
                    NomeAtividade = request.Nome,
                    HoraInicio = request.HoraInicio,
                    HoraFim = request.HoraFim
                };
                _context.Horarios.Add(novoHorario);
                await _context.SaveChangesAsync();
                horarioIdToUse = novoHorario.Id;
            }
        }
        else if (request.HorarioId.HasValue)
        {
            horarioIdToUse = request.HorarioId.Value;
        }
        else
        {
            var defaultHorario = await _context.Horarios.FirstOrDefaultAsync();
            if (defaultHorario != null)
            {
                horarioIdToUse = defaultHorario.Id;
            }
            else
            {
                var novoHorario = new Horario 
                { 
                    NomeAtividade = "Padrão",
                    HoraInicio = "08:00",
                    HoraFim = "10:00"
                };
                _context.Horarios.Add(novoHorario);
                await _context.SaveChangesAsync();
                horarioIdToUse = novoHorario.Id;
            }
        }

        var turma = new Turma
        {
            Nome = request.Nome,
            LimiteAlunos = request.LimiteAlunos,
            Atividade = request.Atividade,
            DataInicio = request.DataInicio,
            DataFim = request.DataFim,
            StatusAtiva = request.StatusAtiva,
            IdadeMinima = request.IdadeMinima,
            IdadeMaxima = request.IdadeMaxima,
            HorarioId = horarioIdToUse
        };

        _context.Turmas.Add(turma);
        await _context.SaveChangesAsync();

        turma.Horario = await _context.Horarios.FindAsync(horarioIdToUse);

        return CreatedAtAction(nameof(GetTurma), new { id = turma.Id }, MapToResponse(turma));
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TurmaResponse>> UpdateTurma(int id, TurmaRequest request)
    {
        var turma = await _context.Turmas.Include(t => t.Horario).Include(t => t.AlunosTurma).FirstOrDefaultAsync(t => t.Id == id);
        if (turma == null) return NotFound();

        int horarioIdToUse = 0;
        if (!string.IsNullOrWhiteSpace(request.HoraInicio) && !string.IsNullOrWhiteSpace(request.HoraFim))
        {
            var horarioExistente = await _context.Horarios
                .FirstOrDefaultAsync(h => h.HoraInicio == request.HoraInicio && h.HoraFim == request.HoraFim);
            if (horarioExistente != null)
            {
                horarioIdToUse = horarioExistente.Id;
            }
            else
            {
                var novoHorario = new Horario 
                { 
                    NomeAtividade = request.Nome,
                    HoraInicio = request.HoraInicio,
                    HoraFim = request.HoraFim
                };
                _context.Horarios.Add(novoHorario);
                await _context.SaveChangesAsync();
                horarioIdToUse = novoHorario.Id;
            }
        }
        else if (request.HorarioId.HasValue)
        {
            horarioIdToUse = request.HorarioId.Value;
        }
        else
        {
            horarioIdToUse = turma.HorarioId;
        }

        turma.Nome = request.Nome;
        turma.LimiteAlunos = request.LimiteAlunos;
        turma.Atividade = request.Atividade;
        turma.DataInicio = request.DataInicio;
        turma.DataFim = request.DataFim;
        turma.StatusAtiva = request.StatusAtiva;
        turma.IdadeMinima = request.IdadeMinima;
        turma.IdadeMaxima = request.IdadeMaxima;
        turma.HorarioId = horarioIdToUse;

        await _context.SaveChangesAsync();

        turma.Horario = await _context.Horarios.FindAsync(horarioIdToUse);

        return Ok(MapToResponse(turma));
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteTurma(int id)
    {
        var turma = await _context.Turmas.FindAsync(id);
        if (turma == null) return NotFound();

        _context.Turmas.Remove(turma);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{turmaId}/alunos/{alunoId}")]
    public async Task<ActionResult> AdicionarAlunoTurma(int turmaId, int alunoId)
    {
        var turma = await _context.Turmas.Include(t => t.AlunosTurma).FirstOrDefaultAsync(t => t.Id == turmaId);
        if (turma == null) return NotFound(new { message = "Turma não encontrada" });

        var aluno = await _context.Alunos.FindAsync(alunoId);
        if (aluno == null) return NotFound(new { message = "Aluno não encontrado" });

        if (turma.AlunosTurma.Count >= turma.LimiteAlunos)
        {
            return BadRequest(new { message = "A turma já está cheia." });
        }

        // Calcula a idade
        var hoje = DateTime.Today;
        var idade = hoje.Year - aluno.DataNascimento.Year;
        if (aluno.DataNascimento.Date > hoje.AddYears(-idade)) idade--;

        if (idade < turma.IdadeMinima || idade > turma.IdadeMaxima)
        {
            return BadRequest(new { message = $"O aluno não está na faixa etária permitida ({turma.IdadeMinima} - {turma.IdadeMaxima} anos)." });
        }

        if (turma.AlunosTurma.Any(at => at.AlunoId == alunoId))
        {
            return BadRequest(new { message = "O aluno já está matriculado nesta turma." });
        }

        turma.AlunosTurma.Add(new AlunoTurma { AlunoId = alunoId, TurmaId = turmaId });
        await _context.SaveChangesAsync();

        return Ok(new { message = "Aluno matriculado com sucesso." });
    }

    [HttpDelete("{turmaId}/alunos/{alunoId}")]
    public async Task<ActionResult> RemoverAlunoTurma(int turmaId, int alunoId)
    {
        var alunoTurma = await _context.AlunosTurmas.FirstOrDefaultAsync(at => at.TurmaId == turmaId && at.AlunoId == alunoId);
        if (alunoTurma == null) return NotFound(new { message = "Vínculo não encontrado" });

        _context.AlunosTurmas.Remove(alunoTurma);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Aluno removido da turma com sucesso." });
    }

    [HttpPut("{id}/alunos")]
    public async Task<ActionResult> AtualizarAlunosTurma(int id, [FromBody] List<int> alunoIds)
    {
        var turma = await _context.Turmas
            .Include(t => t.AlunosTurma)
            .FirstOrDefaultAsync(t => t.Id == id);
        
        if (turma == null) return NotFound(new { message = "Turma não encontrada" });

        // Remover alunos que não estão na nova lista
        var paraRemover = turma.AlunosTurma.Where(at => !alunoIds.Contains(at.AlunoId)).ToList();
        foreach (var at in paraRemover)
        {
            _context.AlunosTurmas.Remove(at);
        }

        // Adicionar novos alunos
        var existentesIds = turma.AlunosTurma.Select(at => at.AlunoId).ToList();
        var paraAdicionarIds = alunoIds.Where(aid => !existentesIds.Contains(aid)).ToList();

        if (turma.AlunosTurma.Count - paraRemover.Count + paraAdicionarIds.Count > turma.LimiteAlunos)
        {
            return BadRequest(new { message = $"O limite de {turma.LimiteAlunos} alunos foi excedido." });
        }

        foreach (var aid in paraAdicionarIds)
        {
            var aluno = await _context.Alunos.FindAsync(aid);
            if (aluno == null) continue;

            // Calcula a idade do aluno
            var hoje = DateTime.Today;
            var idade = hoje.Year - aluno.DataNascimento.Year;
            if (aluno.DataNascimento.Date > hoje.AddYears(-idade)) idade--;

            if (idade < turma.IdadeMinima || idade > turma.IdadeMaxima)
            {
                return BadRequest(new { message = $"O aluno {aluno.Nome} não está na faixa etária permitida ({turma.IdadeMinima} - {turma.IdadeMaxima} anos)." });
            }

            turma.AlunosTurma.Add(new AlunoTurma { AlunoId = aid, TurmaId = id });
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Matrículas atualizadas com sucesso." });
    }

    // Endpoint para teste solicitado
    [HttpPost("gerar-teste")]
    public async Task<ActionResult> GerarDadosTeste()
    {
        if (!await _context.Horarios.AnyAsync())
        {
            var horario1 = new Horario { NomeAtividade = "Manhã - Padrão", HoraInicio = "08:00", HoraFim = "10:00" };
            var horario2 = new Horario { NomeAtividade = "Tarde - Padrão", HoraInicio = "14:00", HoraFim = "16:00" };
            _context.Horarios.AddRange(horario1, horario2);
            await _context.SaveChangesAsync();

            var turma1 = new Turma { 
                Nome = "Futsal Sub-12", 
                LimiteAlunos = 2, 
                Atividade = TipoAtividade.Futsal, 
                DataInicio = DateTime.Now, 
                DataFim = DateTime.Now.AddMonths(6), 
                IdadeMinima = 10, 
                IdadeMaxima = 12, 
                HorarioId = horario1.Id 
            };

            var turma2 = new Turma { 
                Nome = "Judô Infantil", 
                LimiteAlunos = 15, 
                Atividade = TipoAtividade.Judo, 
                DataInicio = DateTime.Now, 
                DataFim = DateTime.Now.AddMonths(6), 
                IdadeMinima = 6, 
                IdadeMaxima = 9, 
                HorarioId = horario2.Id 
            };

            _context.Turmas.AddRange(turma1, turma2);
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Dados de teste gerados com sucesso." });
    }

    private static TurmaResponse MapToResponse(Turma turma)
    {
        return new TurmaResponse
        {
            Id = turma.Id,
            Nome = turma.Nome,
            LimiteAlunos = turma.LimiteAlunos,
            Atividade = turma.Atividade,
            DataInicio = turma.DataInicio,
            DataFim = turma.DataFim,
            StatusAtiva = turma.StatusAtiva,
            IdadeMinima = turma.IdadeMinima,
            IdadeMaxima = turma.IdadeMaxima,
            HorarioId = turma.HorarioId,
            TotalAlunos = turma.AlunosTurma?.Count ?? 0,
            Horario = turma.Horario == null ? null : new HorarioResponse
            {
                Id = turma.Horario.Id,
                NomeAtividade = turma.Horario.NomeAtividade,
                HoraInicio = turma.Horario.HoraInicio,
                HoraFim = turma.Horario.HoraFim
            }
        };
    }
}
