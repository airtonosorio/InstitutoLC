using InstitutoLC.Api.Models.Enums;

namespace InstitutoLC.Api.Models.DTOs;

public class AlunoResponse
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public DateTime DataNascimento { get; set; }
    public string CPF { get; set; } = string.Empty;
    public string RG { get; set; } = string.Empty;
    public Genero Genero { get; set; }
    public CorRaca CorRaca { get; set; }
    public string NomeResponsavel { get; set; } = string.Empty;
    public string NomePai { get; set; } = string.Empty;
    public string NomeMae { get; set; } = string.Empty;
    public bool RecebeBeneficio { get; set; }
    public string RendaFamiliar { get; set; } = string.Empty;
    public string Endereco { get; set; } = string.Empty;
    public string NumeroEndereco { get; set; } = string.Empty;
    public string Bairro { get; set; } = string.Empty;
    public string Municipio { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public string CEP { get; set; } = string.Empty;
    public ZonaMoradia ZonaMoradia { get; set; }
    public TipoMoradia TipoMoradia { get; set; }
    public ResponsavelTransporte ResponsavelTransporte { get; set; }
    public MeioTransporte MeioTransporte { get; set; }
    public string Escola { get; set; } = string.Empty;
    public TipoEscola TipoEscola { get; set; }
    public string Serie { get; set; } = string.Empty;
    public Turno Turno { get; set; }
    public int NumeroPessoasCasa { get; set; }
    public string Contato1 { get; set; } = string.Empty;
    public string? Contato2 { get; set; }
    public TipoAtividade? Atividade1 { get; set; }
    public TipoAtividade? Atividade2 { get; set; }
    public bool Enturmado { get; set; }
    public AnamneseResponse? Anamnese { get; set; }
    public DateTime DataCadastro { get; set; }
    public DateTime? DataAtualizacao { get; set; }
}

public class AnamneseResponse
{
    public int Id { get; set; }
    public bool PossuiEnfermidade { get; set; }
    public string? ObservacoesGerais { get; set; }
    public List<EnfermidadeResponse> Enfermidades { get; set; } = new();
}

public class EnfermidadeResponse
{
    public int Id { get; set; }
    public TipoEnfermidade TipoEnfermidade { get; set; }
    public string? Descricao { get; set; }
}

