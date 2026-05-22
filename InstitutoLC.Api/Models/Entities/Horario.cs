namespace InstitutoLC.Api.Models.Entities;

public class Horario
{
    public int Id { get; set; }
    public string NomeAtividade { get; set; } = string.Empty;
    public string HoraInicio { get; set; } = string.Empty;
    public string HoraFim { get; set; } = string.Empty;
    
    public ICollection<Turma> Turmas { get; set; } = new List<Turma>();
}
