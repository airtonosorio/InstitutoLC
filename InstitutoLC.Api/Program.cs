using InstitutoLC.Api.Data;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Database
builder.Services.AddDbContext<InstitutoDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Configure explicit port
app.Urls.Add("http://localhost:5080");

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// Add a simple root endpoint
app.MapGet("/", () => "API InstitutoLC está funcionando! 🚀");

// Test database connection
try
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<InstitutoDbContext>();
    var canConnect = dbContext.Database.CanConnect();
    
    if (canConnect)
    {
        Console.WriteLine("✅ Conectado ao banco de dados com sucesso!");
        Console.WriteLine($"✅ Total de esportes: {dbContext.Esportes.Count()}");
    }
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Erro: {ex.Message}");
}

app.Run();