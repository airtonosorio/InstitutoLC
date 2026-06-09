using InstitutoLC.Api.Models.Enums;

namespace InstitutoLC.Api.Models.Entities;

public class Aluno
{
    public int Id { get; set; }

    // Dados Cadastrais
    public string Nome { get; set; } = string.Empty;
    public DateTime DataNascimento { get; set; }
    public string CPF { get; set; } = string.Empty;
    public string RG { get; set; } = string.Empty;
    public Genero Genero { get; set; }
    public CorRaca CorRaca { get; set; }

    // Dados Familiares
    public string NomeResponsavel { get; set; } = string.Empty;
    public string NomePai { get; set; } = string.Empty;
    public string NomeMae { get; set; } = string.Empty;
    public bool RecebeBeneficio { get; set; }
    public string RendaFamiliar { get; set; } = string.Empty;
    public int NumeroPessoasCasa { get; set; }

    // Endereço
    public string Endereco { get; set; } = string.Empty;
    public string NumeroEndereco { get; set; } = string.Empty;
    public string Bairro { get; set; } = string.Empty;
    public string Municipio { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    public string CEP { get; set; } = string.Empty;
    public ZonaMoradia ZonaMoradia { get; set; }
    public TipoMoradia TipoMoradia { get; set; }

    // Transporte e Logística
    public ResponsavelTransporte ResponsavelTransporte { get; set; }
    public MeioTransporte MeioTransporte { get; set; }

    // Dados Escolares
    public string Escola { get; set; } = string.Empty;
    public TipoEscola TipoEscola { get; set; }
    public string Serie { get; set; } = string.Empty;
    public Turno Turno { get; set; }

    // Contatos
    public string Contato1 { get; set; } = string.Empty;
    public string? Contato2 { get; set; }

    // Anamnese
    public AnamneseAluno? Anamnese { get; set; }

    // Atividades da ONG
    public TipoAtividade? Atividade1 { get; set; }
    public TipoAtividade? Atividade2 { get; set; }

    // Auditoria
    public DateTime DataCadastro { get; set; } = DateTime.Now;
    public DateTime? DataAtualizacao { get; set; }

    public ICollection<AlunoTurma> AlunosTurmas { get; set; } = new List<AlunoTurma>();
}
