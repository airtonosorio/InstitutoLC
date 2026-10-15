using InstitutoLC.Api.Data;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InstitutoLC.Api.Migrations;

[DbContext(typeof(InstitutoDbContext))]
[Migration("20261015230000_AllowEmptyCpf")]
public partial class AllowEmptyCpf : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        // Only replace the index; existing rows and encrypted values stay untouched.
        migrationBuilder.DropIndex(name: "IX_Alunos_CPF", table: "Alunos");
        migrationBuilder.CreateIndex(
            name: "IX_Alunos_CPF", table: "Alunos", column: "CPF",
            unique: true, filter: "[CPF] <> N''");
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        // Never delete students to make a rollback fit the old uniqueness rule.
        migrationBuilder.Sql("""
            IF (SELECT COUNT(*) FROM [Alunos] WHERE [CPF] = N'') > 1
                THROW 51000, 'Cannot restore the old CPF index while multiple students have empty CPF. Keep the filtered index.', 1;
            """);
        migrationBuilder.DropIndex(name: "IX_Alunos_CPF", table: "Alunos");
        migrationBuilder.CreateIndex(
            name: "IX_Alunos_CPF", table: "Alunos", column: "CPF", unique: true);
    }
}
