using Microsoft.EntityFrameworkCore;

namespace InstitutoLC.Api.Data
{
    // Classes no namespace Data
    public class Aluno
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public DateTime DataNascimento { get; set; }
        public string RG { get; set; } = string.Empty;
        public string CPF { get; set; } = string.Empty;
        public string Endereco { get; set; } = string.Empty;
        public string NumeroEndereco { get; set; } = string.Empty;
        public string Bairro { get; set; } = string.Empty;
        public string Municipio { get; set; } = string.Empty;
        public string Estado { get; set; } = string.Empty;
        public string Escola { get; set; } = string.Empty;
        public int TipoEscola { get; set; }
        public string Serie { get; set; } = string.Empty;
        public int Turno { get; set; }
        public int NumeroPessoasCasa { get; set; }
        public string Contato1 { get; set; } = string.Empty;
        public string? Contato2 { get; set; }
        public DateTime DataCadastro { get; set; } = DateTime.Now;
        public DateTime? DataAtualizacao { get; set; }
        
        public ICollection<AlunoEsporte>? AlunoEsportes { get; set; }
    }

    public class Esporte
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public string? Descricao { get; set; }
        public int? Vagas { get; set; }
        public bool Ativo { get; set; } = true;
        public int IdadeMinima { get; set; }
        public int IdadeMaxima { get; set; }
        public DateTime DataCadastro { get; set; } = DateTime.Now;
        
        public ICollection<AlunoEsporte>? AlunoEsportes { get; set; }
    }

    public class AlunoEsporte
    {
        public int Id { get; set; }
        public int AlunoId { get; set; }
        public int EsporteId { get; set; }
        public DateTime DataInscricao { get; set; } = DateTime.Now;
        public int Status { get; set; } = 1; // 1=Ativo, 2=Inativo
        public DateTime DataCadastro { get; set; } = DateTime.Now;
        
        public Aluno? Aluno { get; set; }
        public Esporte? Esporte { get; set; }
    }

    public class InstitutoDbContext : DbContext
    {
        public InstitutoDbContext(DbContextOptions<InstitutoDbContext> options) : base(options)
        {
        }

        public DbSet<Aluno> Alunos { get; set; }
        public DbSet<Esporte> Esportes { get; set; }
        public DbSet<AlunoEsporte> AlunosEsportes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Aluno>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<Esporte>(entity =>
            {
                entity.HasKey(e => e.Id);
            });

            modelBuilder.Entity<AlunoEsporte>(entity =>
            {
                entity.HasKey(ae => ae.Id);
            });
        }
    }
}