using InstitutoLC.Api.Data; // ✅ Use Data em vez de Models.Entities
using InstitutoLC.Api.Models.DTOs;
using Microsoft.EntityFrameworkCore;

namespace InstitutoLC.Api.Services
{
    public class EsporteService : IEsporteService
    {
        private readonly InstitutoDbContext _context;

        public EsporteService(InstitutoDbContext context)
        {
            _context = context;
        }

        public async Task<ValidacaoInscricaoResult> ValidarInscricao(int alunoId, int esporteId)
        {
            var result = new ValidacaoInscricaoResult();
            
            var aluno = await _context.Alunos.FindAsync(alunoId);
            var esporte = await _context.Esportes.FindAsync(esporteId);
            
            if (aluno == null || esporte == null)
            {
                result.Valido = false;
                result.Mensagem = "Aluno ou esporte não encontrado.";
                return result;
            }
            
            // Calcular idade
            var idade = DateTime.Now.Year - aluno.DataNascimento.Year;
            if (DateTime.Now < aluno.DataNascimento.AddYears(idade)) idade--;
            
            result.IdadeAluno = idade;
            result.IdadeMinima = esporte.IdadeMinima;
            result.IdadeMaxima = esporte.IdadeMaxima;
            
            // Validar idade
            if (idade < esporte.IdadeMinima || idade > esporte.IdadeMaxima)
            {
                result.Valido = false;
                result.Mensagem = $"Idade não permitida. Aluno tem {idade} anos. " +
                                 $"Faixa etária do esporte: {esporte.IdadeMinima} a {esporte.IdadeMaxima} anos.";
                return result;
            }
            
            // Validar limite de esportes
            var esportesAtivos = await _context.AlunosEsportes
                .CountAsync(ae => ae.AlunoId == alunoId && ae.Status == 1);
                
            result.EsportesAtuais = esportesAtivos;
            
            if (esportesAtivos >= 2)
            {
                result.Valido = false;
                result.Mensagem = "Aluno já atingiu o limite máximo de 2 esportes ativos.";
                return result;
            }
            
            result.Valido = true;
            result.Mensagem = "Inscrição válida.";
            return result;
        }

        public async Task<List<Esporte>> GetEsportesValidosParaAluno(int alunoId)
        {
            var aluno = await _context.Alunos.FindAsync(alunoId);
            if (aluno == null) return new List<Esporte>();
            
            var idade = DateTime.Now.Year - aluno.DataNascimento.Year;
            if (DateTime.Now < aluno.DataNascimento.AddYears(idade)) idade--;
            
            return await _context.Esportes
                .Where(e => e.Ativo && idade >= e.IdadeMinima && idade <= e.IdadeMaxima)
                .ToListAsync();
        }
    }
}