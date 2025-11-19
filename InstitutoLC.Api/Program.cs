using InstitutoLC.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        // Aceitar propriedades em camelCase do frontend
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    })
    .ConfigureApiBehaviorOptions(options =>
    {
        // Personalizar resposta de validação
        options.InvalidModelStateResponseFactory = context =>
        {
            var errors = context.ModelState
                .Where(x => x.Value?.Errors.Count > 0)
                .SelectMany(x => x.Value!.Errors.Select(e => new
                {
                    Field = x.Key,
                    Message = e.ErrorMessage
                }))
                .ToList();

            return new BadRequestObjectResult(new
            {
                message = "Erro de validação",
                errors = errors
            });
        };
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Habilitar CORS para permitir requisições do frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

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

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<InstitutoDbContext>();

    var maxRetries = 10;
    var delay = TimeSpan.FromSeconds(5);

    for (int i = 0; i < maxRetries; i++)
    {
        try
        {
            Console.WriteLine($"Tentando conectar ao banco de dados... (Tentativa {i + 1}/{maxRetries})");
            
            // Testar conexão (Migrate() cria o banco automaticamente se não existir)
            try
            {
                if (db.Database.CanConnect())
                {
                    Console.WriteLine("Conexão com banco de dados estabelecida.");
                }
                else
                {
                    Console.WriteLine("Banco não existe ainda, será criado pelas migrações...");
                }
                
                // Migrate() cria o banco automaticamente se não existir
                db.Database.Migrate();
                Console.WriteLine("Migrações aplicadas com sucesso!");
                break;
            }
            catch (Exception migrateEx)
            {
                // Se falhar, pode ser que o banco ainda não esteja pronto
                throw new Exception($"Erro ao aplicar migrações: {migrateEx.Message}");
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Tentativa {i + 1} falhou: {ex.Message}");
            if (i == maxRetries - 1)
            {
                Console.WriteLine("⚠️ ATENÇÃO: Não foi possível conectar ao banco após várias tentativas.");
                Console.WriteLine("A aplicação continuará rodando, mas algumas funcionalidades podem não funcionar.");
                Console.WriteLine("Verifique:");
                Console.WriteLine("  1. Se o SQL Server está rodando");
                Console.WriteLine("  2. Se a connection string está correta");
                Console.WriteLine("  3. Se a senha no arquivo .env está correta");
                // Não lançar exceção para permitir que a aplicação continue
                // throw;
                break;
            }
            Console.WriteLine($"Aguardando {delay.TotalSeconds} segundos antes da próxima tentativa...");
            Thread.Sleep(delay);
        }
    }
}

// Servir arquivos estáticos (HTML, CSS, JS) da pasta Views
var staticFileOptions = new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "Views")),
    RequestPath = "/Views"
};
app.UseStaticFiles(staticFileOptions);

// Servir arquivos estáticos padrão (wwwroot se existir)
app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Habilitar CORS
app.UseCors("AllowAll");

app.UseAuthorization();
app.MapControllers();
app.Run();
