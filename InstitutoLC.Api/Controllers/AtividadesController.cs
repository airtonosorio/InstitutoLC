using InstitutoLC.Api.Data;
using InstitutoLC.Api.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace InstitutoLC.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AtividadesController : ControllerBase
    {
        private readonly InstitutoDbContext _context;

        public AtividadesController(InstitutoDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Atividade>>> GetAtividades()
        {
            return await _context.Atividades.ToListAsync();
        }

        [HttpPost]
        public async Task<ActionResult<Atividade>> CreateAtividade(Atividade request)
        {
            if (string.IsNullOrWhiteSpace(request.Nome))
            {
                return BadRequest(new { message = "O nome da atividade é obrigatório." });
            }

            var atividade = new Atividade
            {
                Nome = request.Nome,
                MinIdade = request.MinIdade,
                MaxIdade = request.MaxIdade
            };

            _context.Atividades.Add(atividade);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAtividades), new { id = atividade.Id }, atividade);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteAtividade(int id)
        {
            var atividade = await _context.Atividades.FindAsync(id);
            if (atividade == null)
            {
                return NotFound(new { message = "Atividade não encontrada." });
            }

            _context.Atividades.Remove(atividade);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
