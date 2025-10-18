using InstitutoLC.Api.Data; // ✅ Use Data em vez de Models.Entities
using InstitutoLC.Api.Models.DTOs;

namespace InstitutoLC.Api.Services
{
    public interface IEsporteService
    {
        Task<ValidacaoInscricaoResult> ValidarInscricao(int alunoId, int esporteId);
        Task<List<Esporte>> GetEsportesValidosParaAluno(int alunoId);
    }
}