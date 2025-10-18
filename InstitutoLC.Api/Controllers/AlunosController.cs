using InstitutoLC.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InstitutoLC.Api.Controllers
{
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
        public async Task<ActionResult<IEnumerable<object>>> GetAlunos()
        {
            var alunos = await _context.Alunos.ToListAsync();
            return Ok(alunos);
        }

        /// <summary>
        /// Busca um aluno por ID
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<Aluno>> GetAluno(int id)
        {
            var aluno = await _context.Alunos.FindAsync(id);

            if (aluno == null)
            {
                return NotFound(new { message = "Aluno não encontrado" });
            }

            return Ok(aluno);
        }

        /// <summary>
        /// Cria um novo aluno
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<Aluno>> CreateAluno([FromBody] Aluno aluno)
        {
            // Validações básicas
            if (string.IsNullOrEmpty(aluno.Nome))
                return BadRequest(new { message = "Nome é obrigatório" });

            if (string.IsNullOrEmpty(aluno.CPF))
                return BadRequest(new { message = "CPF é obrigatório" });

            // Verificar se CPF já existe
            if (await _context.Alunos.AnyAsync(a => a.CPF == aluno.CPF))
            {
                return BadRequest(new { message = "CPF já cadastrado" });
            }

            // Garantir dados corretos
            aluno.DataCadastro = DateTime.Now;
            aluno.DataAtualizacao = null;

            _context.Alunos.Add(aluno);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAluno), new { id = aluno.Id }, aluno);
        }

        /// <summary>
        /// Atualiza um aluno existente
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<Aluno>> UpdateAluno(int id, [FromBody] Aluno alunoAtualizado)
        {
            var aluno = await _context.Alunos.FindAsync(id);

            if (aluno == null)
            {
                return NotFound(new { message = "Aluno não encontrado" });
            }

            // Atualizar campos
            aluno.Nome = alunoAtualizado.Nome;
            aluno.DataNascimento = alunoAtualizado.DataNascimento;
            aluno.RG = alunoAtualizado.RG;
            aluno.Endereco = alunoAtualizado.Endereco;
            aluno.NumeroEndereco = alunoAtualizado.NumeroEndereco;
            aluno.Bairro = alunoAtualizado.Bairro;
            aluno.Municipio = alunoAtualizado.Municipio;
            aluno.Estado = alunoAtualizado.Estado;
            aluno.Escola = alunoAtualizado.Escola;
            aluno.TipoEscola = alunoAtualizado.TipoEscola;
            aluno.Serie = alunoAtualizado.Serie;
            aluno.Turno = alunoAtualizado.Turno;
            aluno.NumeroPessoasCasa = alunoAtualizado.NumeroPessoasCasa;
            aluno.Contato1 = alunoAtualizado.Contato1;
            aluno.Contato2 = alunoAtualizado.Contato2;
            aluno.DataAtualizacao = DateTime.Now;

            await _context.SaveChangesAsync();

            return Ok(aluno);
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
        /// Endpoint simples para teste
        /// </summary>
        [HttpGet("test")]
        public ActionResult Test()
        {
            return Ok(new { 
                message = "AlunosController funcionando!", 
                status = "OK",
                timestamp = DateTime.Now 
            });
        }
    }
}