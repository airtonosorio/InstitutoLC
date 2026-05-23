using InstitutoLC.Api.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

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

// Configurar Autenticação JWT
var jwtSecret = builder.Configuration["Jwt:Secret"] ?? "ChaveSecretaMuitoLongaEComplicadaInstitutoLC2026!!";
var key = Encoding.ASCII.GetBytes(jwtSecret);
builder.Services.AddAuthentication(x =>
{
    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(x =>
{
    x.RequireHttpsMetadata = false;
    x.SaveToken = true;
    x.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "InstitutoLC.Api",
        ValidateAudience = true,
        ValidAudience = builder.Configuration["Jwt:Audience"] ?? "InstitutoLC.Frontend",
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
    x.Events = new JwtBearerEvents
    {
        OnMessageReceived = context =>
        {
            context.Token = context.Request.Cookies["jwt"];
            return Task.CompletedTask;
        }
    };
});

// Habilitar CORS para permitir requisições do frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() 
            ?? new[] { "http://localhost:5173", "http://localhost:8080" };

        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials(); // Permitir cookies HttpOnly
    });
});

// Configurar Rate Limiting nativo do .NET 8
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    options.AddFixedWindowLimiter("auth-limit", opt =>
    {
        opt.PermitLimit = 5; // Limitar a 5 requisições de login/senha
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });

    options.AddFixedWindowLimiter("import-limit", opt =>
    {
        opt.PermitLimit = 3; // Limitar a 3 importações
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
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

                // Realizar seed do usuário administrador se não houver usuários
                if (!db.Usuarios.Any())
                {
                    Console.WriteLine("Seeding default admin user...");
                    var adminUser = new InstitutoLC.Api.Models.Entities.Usuario
                    {
                        Username = builder.Configuration["Admin:Username"] ?? "admin",
                        Role = "Admin",
                        DataCadastro = DateTime.Now
                    };
                    var hasher = new Microsoft.AspNetCore.Identity.PasswordHasher<InstitutoLC.Api.Models.Entities.Usuario>();
                    var defaultPassword = builder.Configuration["Admin:DefaultPassword"] ?? "admin";
                    adminUser.PasswordHash = hasher.HashPassword(adminUser, defaultPassword);

                    db.Usuarios.Add(adminUser);
                    db.SaveChanges();
                    Console.WriteLine("Default admin user seeded successfully.");
                }

                // Realizar seed das atividades iniciais se não houver nenhuma
                if (!db.Atividades.Any())
                {
                    Console.WriteLine("Seeding initial activities...");
                    db.Atividades.AddRange(
                        new InstitutoLC.Api.Models.Entities.Atividade { Nome = "Futebol de campo (06 a 17 anos)", MinIdade = 6, MaxIdade = 17 },
                        new InstitutoLC.Api.Models.Entities.Atividade { Nome = "Futsal (06 a 17 anos)", MinIdade = 6, MaxIdade = 17 },
                        new InstitutoLC.Api.Models.Entities.Atividade { Nome = "Futsal contraturno (06 a 17 anos)", MinIdade = 6, MaxIdade = 17 },
                        new InstitutoLC.Api.Models.Entities.Atividade { Nome = "Judô (10 a 17 anos)", MinIdade = 10, MaxIdade = 17 },
                        new InstitutoLC.Api.Models.Entities.Atividade { Nome = "Karatê (05 a 17 anos)", MinIdade = 5, MaxIdade = 17 },
                        new InstitutoLC.Api.Models.Entities.Atividade { Nome = "Jiu-jitsu (05 a 17 anos)", MinIdade = 5, MaxIdade = 17 },
                        new InstitutoLC.Api.Models.Entities.Atividade { Nome = "Ballet (05 a 17 anos)", MinIdade = 5, MaxIdade = 17 },
                        new InstitutoLC.Api.Models.Entities.Atividade { Nome = "Capoeira (14 a 17 anos)", MinIdade = 14, MaxIdade = 17 },
                        new InstitutoLC.Api.Models.Entities.Atividade { Nome = "Triathlon (08 a 17 anos)", MinIdade = 8, MaxIdade = 17 },
                        new InstitutoLC.Api.Models.Entities.Atividade { Nome = "Futebol Feminino (06 a 17 anos)", MinIdade = 6, MaxIdade = 17 },
                        new InstitutoLC.Api.Models.Entities.Atividade { Nome = "Orquestra de Música (08 a 17 anos)", MinIdade = 8, MaxIdade = 17 },
                        new InstitutoLC.Api.Models.Entities.Atividade { Nome = "Creche (10 meses a 3 anos)", MinIdade = 0, MaxIdade = 3 }
                    );
                    db.SaveChanges();
                    Console.WriteLine("Initial activities seeded successfully.");
                }
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
    RequestPath = ""
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

// Habilitar Rate Limiting
app.UseRateLimiter();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("index.html", staticFileOptions);

app.Run();
