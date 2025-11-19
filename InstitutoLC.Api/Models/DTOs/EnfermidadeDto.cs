using InstitutoLC.Api.Models.Enums;

namespace InstitutoLC.Api.Models.DTOs;

public class EnfermidadeDto
{
    public TipoEnfermidade TipoEnfermidade { get; set; }
    public string? Descricao { get; set; }
}

