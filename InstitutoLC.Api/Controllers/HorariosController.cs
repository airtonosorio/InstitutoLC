using InstitutoLC.Api.Data;
using InstitutoLC.Api.Models.DTOs;
using InstitutoLC.Api.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InstitutoLC.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HorariosController : ControllerBase
{
    private readonly InstitutoDbContext _context;

    public HorariosController(InstitutoDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HorarioResponse>>> GetHorarios()
    {
        var horarios = await _context.Horarios.ToListAsync();
        return Ok(horarios.Select(h => new HorarioResponse
        {
            Id = h.Id,
            NomeAtividade = h.NomeAtividade,
            HoraInicio = h.HoraInicio,
            HoraFim = h.HoraFim
        }));
    }

    [HttpPost]
    public async Task<ActionResult<HorarioResponse>> CreateHorario(HorarioRequest request)
    {
        var horario = new Horario
        {
            NomeAtividade = request.NomeAtividade,
            HoraInicio = request.HoraInicio,
            HoraFim = request.HoraFim
        };

        _context.Horarios.Add(horario);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetHorarios), new { id = horario.Id }, new HorarioResponse
        {
            Id = horario.Id,
            NomeAtividade = horario.NomeAtividade,
            HoraInicio = horario.HoraInicio,
            HoraFim = horario.HoraFim
        });
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteHorario(int id)
    {
        var horario = await _context.Horarios.FindAsync(id);
        if (horario == null) return NotFound();

        _context.Horarios.Remove(horario);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}
