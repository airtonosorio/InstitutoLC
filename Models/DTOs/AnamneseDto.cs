namespace InstitutoLC.Api.Models.DTOs;

public class AnamneseDto
{
    public bool PossuiEnfermidade { get; set; }
    public string? ObservacoesGerais { get; set; }
    public List<EnfermidadeDto> Enfermidades { get; set; } = new();
}

