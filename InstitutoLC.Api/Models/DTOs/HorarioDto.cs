namespace InstitutoLC.Api.Models.DTOs;

public class HorarioRequest
{
    public string NomeAtividade { get; set; } = string.Empty;
    public string HoraInicio { get; set; } = string.Empty;
    public string HoraFim { get; set; } = string.Empty;
}

public class HorarioResponse
{
    public int Id { get; set; }
    public string NomeAtividade { get; set; } = string.Empty;
    public string HoraInicio { get; set; } = string.Empty;
    public string HoraFim { get; set; } = string.Empty;
}
