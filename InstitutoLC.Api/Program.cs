using InstitutoLC.Api.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.IdentityModel.Tokens;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    })
    .ConfigureApiBehaviorOptions(options =>
    {
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
                message = "Erro de validacao",
                errors
            });
        };
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey) || jwtKey.Length < 32)
{
    throw new InvalidOperationException("Jwt:Key precisa ter pelo menos 32 caracteres.");
}

var key = Encoding.ASCII.GetBytes(jwtKey);
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
        ValidateIssuer = false,
        ValidateAudience = false
    };
});

var allowedOrigins = (builder.Configuration["Cors:AllowedOrigins"] ?? string.Empty)
    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

builder.Services.AddCors(options =>
{
    options.AddPolicy("ConfiguredOrigins", policy =>
    {
        if (allowedOrigins.Length == 0)
        {
            policy.AllowAnyMethod()
                  .AllowAnyHeader();
            return;
        }

        policy.WithOrigins(allowedOrigins)
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.Services.AddDbContext<InstitutoDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        sqlOptions =>
        {
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

    for (var i = 0; i < maxRetries; i++)
    {
        try
        {
            Console.WriteLine($"Tentando conectar ao banco de dados... (Tentativa {i + 1}/{maxRetries})");

            if (db.Database.CanConnect())
            {
                Console.WriteLine("Conexao com banco de dados estabelecida.");
            }
            else
            {
                Console.WriteLine("Banco ainda indisponivel; as migrations tentarao criar ou atualizar a base.");
            }

            db.Database.Migrate();
            Console.WriteLine("Migracoes aplicadas com sucesso!");
            break;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Tentativa {i + 1} falhou: {ex.Message}");

            if (i == maxRetries - 1)
            {
                if (!app.Environment.IsDevelopment())
                {
                    throw new InvalidOperationException(
                        "Nao foi possivel conectar ao banco e aplicar as migrations.",
                        ex);
                }

                Console.WriteLine("Nao foi possivel conectar ao banco apos varias tentativas.");
                Console.WriteLine("A aplicacao continuara rodando em desenvolvimento, mas algumas funcionalidades podem nao funcionar.");
                break;
            }

            Console.WriteLine($"Aguardando {delay.TotalSeconds} segundos antes da proxima tentativa...");
            Thread.Sleep(delay);
        }
    }
}

var staticFileOptions = new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "Views")),
    RequestPath = ""
};

app.UseStaticFiles(staticFileOptions);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("ConfiguredOrigins");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("index.html", staticFileOptions);
app.Run();
