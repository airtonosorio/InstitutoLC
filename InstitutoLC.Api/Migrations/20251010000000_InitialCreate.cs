using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InstitutoLC.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Alunos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DataNascimento = table.Column<DateTime>(type: "datetime2", nullable: false),
                    RG = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    CPF = table.Column<string>(type: "nvarchar(14)", maxLength: 14, nullable: false),
                    Endereco = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    NumeroEndereco = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Bairro = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Municipio = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Estado = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    Escola = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    TipoEscola = table.Column<int>(type: "int", nullable: false),
                    Serie = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Turno = table.Column<int>(type: "int", nullable: false),
                    NumeroPessoasCasa = table.Column<int>(type: "int", nullable: false),
                    Contato1 = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Contato2 = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    DataCadastro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataAtualizacao = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Alunos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AnamnesesAlunos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AlunoId = table.Column<int>(type: "int", nullable: false),
                    PossuiEnfermidade = table.Column<bool>(type: "bit", nullable: false),
                    ObservacoesGerais = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    DataCadastro = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataAtualizacao = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AnamnesesAlunos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AnamnesesAlunos_Alunos_AlunoId",
                        column: x => x.AlunoId,
                        principalTable: "Alunos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Enfermidades",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    AnamneseAlunoId = table.Column<int>(type: "int", nullable: false),
                    TipoEnfermidade = table.Column<int>(type: "int", nullable: false),
                    Descricao = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    DataCadastro = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Enfermidades", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Enfermidades_AnamnesesAlunos_AnamneseAlunoId",
                        column: x => x.AnamneseAlunoId,
                        principalTable: "AnamnesesAlunos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Alunos_CPF",
                table: "Alunos",
                column: "CPF",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AnamnesesAlunos_AlunoId",
                table: "AnamnesesAlunos",
                column: "AlunoId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Enfermidades_AnamneseAlunoId",
                table: "Enfermidades",
                column: "AnamneseAlunoId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Enfermidades");

            migrationBuilder.DropTable(
                name: "AnamnesesAlunos");

            migrationBuilder.DropTable(
                name: "Alunos");
        }
    }
}

