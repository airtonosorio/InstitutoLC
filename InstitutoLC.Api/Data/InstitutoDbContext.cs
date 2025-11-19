using InstitutoLC.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace InstitutoLC.Api.Data;

public class InstitutoDbContext : DbContext
{
    public InstitutoDbContext(DbContextOptions<InstitutoDbContext> options) : base(options)
    {
    }

    public DbSet<Aluno> Alunos { get; set; }
    public DbSet<AnamneseAluno> AnamnesesAlunos { get; set; }
    public DbSet<Enfermidade> Enfermidades { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configuração da entidade Aluno
        modelBuilder.Entity<Aluno>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Nome).IsRequired().HasMaxLength(200);
            entity.Property(e => e.RG).IsRequired().HasMaxLength(20);
            entity.Property(e => e.CPF).IsRequired().HasMaxLength(14);
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
            entity.Property(e => e.ObservacoesGerais).HasMaxLength(1000);
            
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
            entity.Property(e => e.Descricao).HasMaxLength(500);
        });
    }
}

