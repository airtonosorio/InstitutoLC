using System;
using InstitutoLC.Api.Models.Enums;

namespace InstitutoLC.Api.Models.DTOs;

public class TurmaRequest
{
    public string Nome { get; set; } = string.Empty;
    public int LimiteAlunos { get; set; }
    public TipoAtividade Atividade { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public bool StatusAtiva { get; set; } = true;
    public int IdadeMinima { get; set; }
    public int IdadeMaxima { get; set; }
    public int? HorarioId { get; set; }
    public string? HoraInicio { get; set; }
    public string? HoraFim { get; set; }
}

public class TurmaResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public int LimiteAlunos { get; set; }
    public TipoAtividade Atividade { get; set; }
    public DateTime DataInicio { get; set; }
    public DateTime DataFim { get; set; }
    public bool StatusAtiva { get; set; }
    public int IdadeMinima { get; set; }
    public int IdadeMaxima { get; set; }
    public int HorarioId { get; set; }
    public HorarioResponse? Horario { get; set; }
    public int TotalAlunos { get; set; }
}
