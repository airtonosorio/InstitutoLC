using InstitutoLC.Api.Models.Enums;

namespace InstitutoLC.Api.Models.Entities;

public class Enfermidade
{
    public int Id { get; set; }
    public int AnamneseAlunoId { get; set; }
    public AnamneseAluno AnamneseAluno { get; set; } = null!;
    
    public TipoEnfermidade TipoEnfermidade { get; set; }
    public string? Descricao { get; set; }
    
    public DateTime DataCadastro { get; set; } = DateTime.Now;
}

