namespace InstitutoLC.Api.Models.Entities;

public class AnamneseAluno
{
    public int Id { get; set; }
    public int AlunoId { get; set; }
    public Aluno Aluno { get; set; } = null!;
    
    public bool PossuiEnfermidade { get; set; }
    public string? ObservacoesGerais { get; set; }
    
    // Relacionamento com Enfermidades
    public ICollection<Enfermidade> Enfermidades { get; set; } = new List<Enfermidade>();
    
    public DateTime DataCadastro { get; set; } = DateTime.Now;
    public DateTime? DataAtualizacao { get; set; }
}

