using InstitutoLC.Api.Models.Enums;

namespace InstitutoLC.Api.Models.Entities;

public class Aluno
{
    public int Id { get; set; }
    
    // Dados Cadastrais
    public string Nome { get; set; } = string.Empty;
    public DateTime DataNascimento { get; set; }
    public string CPF { get; set; } = string.Empty;
    
    // Endereço
    public string Endereco { get; set; } = string.Empty;
    public string NumeroEndereco { get; set; } = string.Empty;
    public string Bairro { get; set; } = string.Empty;
    public string Municipio { get; set; } = string.Empty;
    public string Estado { get; set; } = string.Empty;
    
    // Dados Escolares
    public string Escola { get; set; } = string.Empty;
    public TipoEscola TipoEscola { get; set; }
    public string Serie { get; set; } = string.Empty;
    public Turno Turno { get; set; }
    
    // Dados Familiares
    public int NumeroPessoasCasa { get; set; }
    
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
}

