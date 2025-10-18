namespace InstitutoLC.Api.Models.DTOs
{
    public class InscricaoEsporteDto
    {
        public int AlunoId { get; set; }
        public int EsporteId { get; set; }
    }

    public class ValidacaoInscricaoResult
    {
        public bool Valido { get; set; }
        public string Mensagem { get; set; } = string.Empty;
        public int? IdadeAluno { get; set; }
        public int? IdadeMinima { get; set; }
        public int? IdadeMaxima { get; set; }
        public int? EsportesAtuais { get; set; }
    }
}