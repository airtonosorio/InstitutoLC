using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InstitutoLC.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddNovosCamposTurmas : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CEP",
                table: "Alunos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "CorRaca",
                table: "Alunos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Genero",
                table: "Alunos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MeioTransporte",
                table: "Alunos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "NomeMae",
                table: "Alunos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomePai",
                table: "Alunos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "NomeResponsavel",
                table: "Alunos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "RG",
                table: "Alunos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "RecebeBeneficio",
                table: "Alunos",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "RendaFamiliar",
                table: "Alunos",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "ResponsavelTransporte",
                table: "Alunos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TipoMoradia",
                table: "Alunos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "ZonaMoradia",
                table: "Alunos",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "Horarios",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    NomeAtividade = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HoraInicio = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HoraFim = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Horarios", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Turmas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nome = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LimiteAlunos = table.Column<int>(type: "int", nullable: false),
                    Atividade = table.Column<int>(type: "int", nullable: false),
                    DataInicio = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DataFim = table.Column<DateTime>(type: "datetime2", nullable: false),
                    StatusAtiva = table.Column<bool>(type: "bit", nullable: false),
                    IdadeMinima = table.Column<int>(type: "int", nullable: false),
                    IdadeMaxima = table.Column<int>(type: "int", nullable: false),
                    HorarioId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Turmas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Turmas_Horarios_HorarioId",
                        column: x => x.HorarioId,
                        principalTable: "Horarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AlunosTurmas",
                columns: table => new
                {
                    AlunoId = table.Column<int>(type: "int", nullable: false),
                    TurmaId = table.Column<int>(type: "int", nullable: false),
                    DataMatricula = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AlunosTurmas", x => new { x.AlunoId, x.TurmaId });
                    table.ForeignKey(
                        name: "FK_AlunosTurmas_Alunos_AlunoId",
                        column: x => x.AlunoId,
                        principalTable: "Alunos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AlunosTurmas_Turmas_TurmaId",
                        column: x => x.TurmaId,
                        principalTable: "Turmas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AlunosTurmas_TurmaId",
                table: "AlunosTurmas",
                column: "TurmaId");

            migrationBuilder.CreateIndex(
                name: "IX_Turmas_HorarioId",
                table: "Turmas",
                column: "HorarioId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AlunosTurmas");

            migrationBuilder.DropTable(
                name: "Turmas");

            migrationBuilder.DropTable(
                name: "Horarios");

            migrationBuilder.DropColumn(
                name: "CEP",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "CorRaca",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "Genero",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "MeioTransporte",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "NomeMae",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "NomePai",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "NomeResponsavel",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "RG",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "RecebeBeneficio",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "RendaFamiliar",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "ResponsavelTransporte",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "TipoMoradia",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "ZonaMoradia",
                table: "Alunos");
        }
    }
}
