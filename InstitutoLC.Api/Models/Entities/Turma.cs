using InstitutoLC.Api.Models.Enums;

namespace InstitutoLC.Api.Models.Entities;

public class Turma
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public int LimiteAlunos { get; set; }
    public TipoAtividade Atividade { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public bool StatusAtiva { get; set; } = true;
    public int IdadeMinima { get; set; }
    public int IdadeMaxima { get; set; }
    
    // Foreign Key para Horário
    public int HorarioId { get; set; }
    public Horario? Horario { get; set; }
    
    public ICollection<AlunoTurma> AlunosTurma { get; set; } = new List<AlunoTurma>();
}
