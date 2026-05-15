using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InstitutoLC.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAtividadesToAluno : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "Atividade1",
                table: "Alunos",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Atividade2",
                table: "Alunos",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Atividade1",
                table: "Alunos");

            migrationBuilder.DropColumn(
                name: "Atividade2",
                table: "Alunos");
        }
    }
}
