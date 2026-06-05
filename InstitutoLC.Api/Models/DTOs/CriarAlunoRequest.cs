using System.ComponentModel.DataAnnotations;
using InstitutoLC.Api.Models.Enums;

namespace InstitutoLC.Api.Models.DTOs;

public class CriarAlunoRequest
{
    [Required(ErrorMessage = "Nome é obrigatório")]
    [StringLength(200, ErrorMessage = "Nome deve ter no máximo 200 caracteres")]
    public string Nome { get; set; } = string.Empty;

    [Required(ErrorMessage = "Data de nascimento é obrigatória")]
    public DateTime DataNascimento { get; set; }

    [Required(ErrorMessage = "CPF é obrigatório")]
    [StringLength(14, ErrorMessage = "CPF deve ter no máximo 14 caracteres")]
    public string CPF { get; set; } = string.Empty;

    [Required(ErrorMessage = "RG é obrigatório")]
    [StringLength(20, ErrorMessage = "RG deve ter no máximo 20 caracteres")]
    public string RG { get; set; } = string.Empty;

    [Required(ErrorMessage = "Gênero é obrigatório")]
    public Genero Genero { get; set; }

    [Required(ErrorMessage = "Cor ou Raça é obrigatória")]
    public CorRaca CorRaca { get; set; }

    [Required(ErrorMessage = "Nome do responsável é obrigatório")]
    [StringLength(200, ErrorMessage = "Nome do responsável deve ter no máximo 200 caracteres")]
    public string NomeResponsavel { get; set; } = string.Empty;

    public string NomePai { get; set; } = string.Empty;
    public string NomeMae { get; set; } = string.Empty;
    public bool RecebeBeneficio { get; set; }
    public string RendaFamiliar { get; set; } = string.Empty;

    [Required(ErrorMessage = "Endereço é obrigatório")]
    [StringLength(300, ErrorMessage = "Endereço deve ter no máximo 300 caracteres")]
    public string Endereco { get; set; } = string.Empty;

    [Required(ErrorMessage = "Número do endereço é obrigatório")]
    [StringLength(20, ErrorMessage = "Número deve ter no máximo 20 caracteres")]
    public string NumeroEndereco { get; set; } = string.Empty;

    [Required(ErrorMessage = "Bairro é obrigatório")]
    [StringLength(100, ErrorMessage = "Bairro deve ter no máximo 100 caracteres")]
    public string Bairro { get; set; } = string.Empty;

    [Required(ErrorMessage = "Município é obrigatório")]
    [StringLength(100, ErrorMessage = "Município deve ter no máximo 100 caracteres")]
    public string Municipio { get; set; } = string.Empty;

    [Required(ErrorMessage = "Estado é obrigatório")]
    [StringLength(2, MinimumLength = 2, ErrorMessage = "Estado deve ter 2 caracteres")]
    public string Estado { get; set; } = string.Empty;

    [Required(ErrorMessage = "CEP é obrigatório")]
    [StringLength(9, ErrorMessage = "CEP deve ter no máximo 9 caracteres")]
    public string CEP { get; set; } = string.Empty;

    public ZonaMoradia ZonaMoradia { get; set; }
    public TipoMoradia TipoMoradia { get; set; }
    public ResponsavelTransporte ResponsavelTransporte { get; set; }
    public MeioTransporte MeioTransporte { get; set; }

    [Required(ErrorMessage = "Escola é obrigatória")]
    [StringLength(200, ErrorMessage = "Escola deve ter no máximo 200 caracteres")]
    public string Escola { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tipo de escola é obrigatório")]
    public TipoEscola TipoEscola { get; set; }

    [Required(ErrorMessage = "Série é obrigatória")]
    [StringLength(50, ErrorMessage = "Série deve ter no máximo 50 caracteres")]
    public string Serie { get; set; } = string.Empty;

    [Required(ErrorMessage = "Turno é obrigatório")]
    public Turno Turno { get; set; }

    [Required(ErrorMessage = "Número de pessoas na casa é obrigatório")]
    [Range(1, 50, ErrorMessage = "Número de pessoas deve estar entre 1 e 50")]
    public int NumeroPessoasCasa { get; set; }

    [Required(ErrorMessage = "Contato 1 é obrigatório")]
    [StringLength(20, ErrorMessage = "Contato 1 deve ter no máximo 20 caracteres")]
    public string Contato1 { get; set; } = string.Empty;

    [StringLength(20, ErrorMessage = "Contato 2 deve ter no máximo 20 caracteres")]
    public string? Contato2 { get; set; }

    [Required(ErrorMessage = "A Atividade 1 é obrigatória")]
    public TipoAtividade? Atividade1 { get; set; }
    public TipoAtividade? Atividade2 { get; set; }

    public AnamneseDto? Anamnese { get; set; }
}

