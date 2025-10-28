using InstitutoLC.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Adiciona controllers e Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configuração do banco de dados com retry automático
builder.Services.AddDbContext<InstitutoDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions =>
        {
            // Repetir conexões falhas (banco subindo, por exemplo)
            sqlOptions.EnableRetryOnFailure(
                maxRetryCount: 5,
                maxRetryDelay: TimeSpan.FromSeconds(10),
                errorNumbersToAdd: null);
        }
    ));

var app = builder.Build();

// Executa migração com tentativas e atraso, para dar tempo do SQL iniciar
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<InstitutoDbContext>();

    var maxRetries = 10;
    var delay = TimeSpan.FromSeconds(5);

    for (int i = 0; i < maxRetries; i++)
    {
        try
        {
            Console.WriteLine("🟡 Tentando aplicar migrações...");
            db.Database.Migrate();
            Console.WriteLine("✅ Migrações aplicadas com sucesso!");
            break;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ Tentativa {i + 1} falhou: {ex.Message}");
            if (i == maxRetries - 1)
            {
                Console.WriteLine("🚨 Não foi possível conectar ao banco após várias tentativas.");
                throw;
            }
            Thread.Sleep(delay);
        }
    }
}

// Middlewares padrão
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseAuthorization();
app.MapControllers();
app.Run();

