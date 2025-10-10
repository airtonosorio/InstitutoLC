using System.ComponentModel.DataAnnotations;
using InstitutoLC.Api.Models.Enums;

namespace InstitutoLC.Api.Models.DTOs;

public class AtualizarAlunoRequest
{
    [StringLength(200, ErrorMessage = "Nome deve ter no máximo 200 caracteres")]
    public string? Nome { get; set; }

    public DateTime? DataNascimento { get; set; }

    [StringLength(20, ErrorMessage = "RG deve ter no máximo 20 caracteres")]
    public string? RG { get; set; }

    [StringLength(300, ErrorMessage = "Endereço deve ter no máximo 300 caracteres")]
    public string? Endereco { get; set; }

    [StringLength(20, ErrorMessage = "Número deve ter no máximo 20 caracteres")]
    public string? NumeroEndereco { get; set; }

    [StringLength(100, ErrorMessage = "Bairro deve ter no máximo 100 caracteres")]
    public string? Bairro { get; set; }

    [StringLength(100, ErrorMessage = "Município deve ter no máximo 100 caracteres")]
    public string? Municipio { get; set; }

    [StringLength(2, MinimumLength = 2, ErrorMessage = "Estado deve ter 2 caracteres")]
    public string? Estado { get; set; }

    [StringLength(200, ErrorMessage = "Escola deve ter no máximo 200 caracteres")]
    public string? Escola { get; set; }

    public TipoEscola? TipoEscola { get; set; }

    [StringLength(50, ErrorMessage = "Série deve ter no máximo 50 caracteres")]
    public string? Serie { get; set; }

    public Turno? Turno { get; set; }

    [Range(1, 50, ErrorMessage = "Número de pessoas deve estar entre 1 e 50")]
    public int? NumeroPessoasCasa { get; set; }

    [StringLength(20, ErrorMessage = "Contato 1 deve ter no máximo 20 caracteres")]
    public string? Contato1 { get; set; }

    [StringLength(20, ErrorMessage = "Contato 2 deve ter no máximo 20 caracteres")]
    public string? Contato2 { get; set; }

    public AnamneseDto? Anamnese { get; set; }
}

