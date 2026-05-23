using InstitutoLC.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace InstitutoLC.Api.Data;

public class InstitutoDbContext : DbContext
{
    private readonly IConfiguration _configuration;

    public InstitutoDbContext(DbContextOptions<InstitutoDbContext> options, IConfiguration configuration) : base(options)
    {
        _configuration = configuration;
    }

    public DbSet<Aluno> Alunos { get; set; }
    public DbSet<AnamneseAluno> AnamnesesAlunos { get; set; }
    public DbSet<Enfermidade> Enfermidades { get; set; }
    public DbSet<Turma> Turmas { get; set; }
    public DbSet<Horario> Horarios { get; set; }
    public DbSet<AlunoTurma> AlunosTurmas { get; set; }
    public DbSet<Usuario> Usuarios { get; set; }
    public DbSet<Atividade> Atividades { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuração da entidade Atividade
        modelBuilder.Entity<Atividade>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(200);
        });

        // Configuração de Criptografia
        var encryptionKey = _configuration?["Encryption:Key"] ?? "ChaveSecretaDeCriptografiaDoILC!";
        var stringEncryptionConverter = new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<string, string>(
            v => EncryptionHelper.Encrypt(v, encryptionKey),
            v => EncryptionHelper.Decrypt(v, encryptionKey)
        );
        var nullableStringEncryptionConverter = new Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<string?, string?>(
            v => v == null ? null : EncryptionHelper.Encrypt(v, encryptionKey),
            v => v == null ? null : EncryptionHelper.Decrypt(v, encryptionKey)
        );

        // Configuração da entidade Usuario
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
            entity.Property(e => e.PasswordHash).IsRequired().HasMaxLength(500);
            entity.Property(e => e.Role).IsRequired().HasMaxLength(50);
            entity.HasIndex(e => e.Username).IsUnique();
        });

        // Configuração da entidade Aluno
        modelBuilder.Entity<Aluno>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(200);
            entity.Property(e => e.CPF).IsRequired().HasMaxLength(100).HasConversion(stringEncryptionConverter);
            entity.Property(e => e.RG).IsRequired().HasMaxLength(100).HasConversion(stringEncryptionConverter);
            entity.Property(e => e.Endereco).IsRequired().HasMaxLength(300);
            entity.Property(e => e.NumeroEndereco).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Bairro).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Municipio).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Estado).IsRequired().HasMaxLength(2);
            entity.Property(e => e.Escola).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Serie).IsRequired().HasMaxLength(50);
            entity.Property(e => e.Contato1).IsRequired().HasMaxLength(20);
            entity.Property(e => e.Contato2).HasMaxLength(20);
            
            // Relacionamento um-para-um com Anamnese
            entity.HasOne(e => e.Anamnese)
                .WithOne(a => a.Aluno)
                .HasForeignKey<AnamneseAluno>(a => a.AlunoId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => e.CPF).IsUnique();
        });

        // Configuração da entidade AnamneseAluno
        modelBuilder.Entity<AnamneseAluno>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.ObservacoesGerais).HasMaxLength(1000).HasConversion(nullableStringEncryptionConverter);
            
            // Relacionamento um-para-muitos com Enfermidades
            entity.HasMany(e => e.Enfermidades)
                .WithOne(enf => enf.AnamneseAluno)
                .HasForeignKey(enf => enf.AnamneseAlunoId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configuração da entidade Enfermidade
        modelBuilder.Entity<Enfermidade>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Descricao).HasMaxLength(500).HasConversion(nullableStringEncryptionConverter);
        });

        modelBuilder.Entity<Horario>(entity =>
        {
            entity.HasKey(e => e.Id);
        });

        modelBuilder.Entity<Turma>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(t => t.Horario)
                  .WithMany(h => h.Turmas)
                  .HasForeignKey(t => t.HorarioId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<AlunoTurma>(entity =>
        {
            entity.HasKey(at => new { at.AlunoId, at.TurmaId });
            
            entity.HasOne(at => at.Aluno)
                  .WithMany(a => a.AlunosTurmas)
                  .HasForeignKey(at => at.AlunoId);

            entity.HasOne(at => at.Turma)
                  .WithMany(t => t.AlunosTurma)
                  .HasForeignKey(at => at.TurmaId);
        });
    }
}

