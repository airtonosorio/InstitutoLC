using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using InstitutoLC.Api.Data;
using InstitutoLC.Api.Models.Entities;
using InstitutoLC.Api.Models.DTOs;

namespace InstitutoLC.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly InstitutoDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(InstitutoDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public class LoginRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }

        [HttpPost("login")]
        [EnableRateLimiting("auth-limit")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Username == request.Username);
            if (user != null)
            {
                var hasher = new PasswordHasher<Usuario>();
                var verificationResult = hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
                
                if (verificationResult != PasswordVerificationResult.Failed)
                {
                    var tokenHandler = new JwtSecurityTokenHandler();
                    var jwtSecret = _configuration["Jwt:Secret"] ?? "ChaveSecretaMuitoLongaEComplicadaInstitutoLC2026!!";
                    var key = Encoding.ASCII.GetBytes(jwtSecret);
                    
                    var tokenDescriptor = new SecurityTokenDescriptor
                    {
                        Subject = new ClaimsIdentity(new Claim[]
                        {
                            new Claim(ClaimTypes.Name, user.Username),
                            new Claim(ClaimTypes.Role, user.Role)
                        }),
                        Expires = DateTime.UtcNow.AddHours(8),
                        Issuer = _configuration["Jwt:Issuer"] ?? "InstitutoLC.Api",
                        Audience = _configuration["Jwt:Audience"] ?? "InstitutoLC.Frontend",
                        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
                    };
                    
                    var token = tokenHandler.CreateToken(tokenDescriptor);
                    var tokenString = tokenHandler.WriteToken(token);

                    // Configurar cookie HttpOnly
                    var cookieOptions = new CookieOptions
                    {
                        HttpOnly = true,
                        Secure = true, // Habilitar em produção, compatível com localhost em dev
                        SameSite = SameSiteMode.Strict,
                        Expires = DateTimeOffset.UtcNow.AddHours(8)
                    };
                    Response.Cookies.Append("jwt", tokenString, cookieOptions);

                    return Ok(new { username = user.Username, role = user.Role });
                }
            }

            return Unauthorized(new { message = "Usuário ou senha inválidos" });
        }

        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Delete("jwt", new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict
            });
            
            return Ok(new { message = "Logout realizado com sucesso" });
        }

        [Authorize]
        [HttpPost("change-password")]
        [EnableRateLimiting("auth-limit")]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
        {
            var username = User.Identity?.Name;
            if (string.IsNullOrEmpty(username))
            {
                return Unauthorized();
            }

            var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Username == username);
            if (user == null)
            {
                return NotFound(new { message = "Usuário não encontrado" });
            }

            var hasher = new PasswordHasher<Usuario>();
            var verificationResult = hasher.VerifyHashedPassword(user, user.PasswordHash, request.OldPassword);
            if (verificationResult == PasswordVerificationResult.Failed)
            {
                return BadRequest(new { message = "Senha atual incorreta" });
            }

            user.PasswordHash = hasher.HashPassword(user, request.NewPassword);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Senha alterada com sucesso" });
        }

        [Authorize]
        [HttpPost("change-username")]
        [EnableRateLimiting("auth-limit")]
        public async Task<IActionResult> ChangeUsername([FromBody] ChangeUsernameRequest request)
        {
            var currentUsername = User.Identity?.Name;
            if (string.IsNullOrEmpty(currentUsername))
            {
                return Unauthorized();
            }

            var isTaken = await _context.Usuarios.AnyAsync(u => u.Username == request.NewUsername && u.Username != currentUsername);
            if (isTaken)
            {
                return BadRequest(new { message = "Este nome de usuário já está em uso." });
            }

            var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Username == currentUsername);
            if (user == null)
            {
                return NotFound(new { message = "Usuário não encontrado." });
            }

            user.Username = request.NewUsername;
            await _context.SaveChangesAsync();

            // Gerar novo token JWT com claims atualizadas
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtSecret = _configuration["Jwt:Secret"] ?? "ChaveSecretaMuitoLongaEComplicadaInstitutoLC2026!!";
            var key = Encoding.ASCII.GetBytes(jwtSecret);
            
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new Claim[]
                {
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddHours(8),
                Issuer = _configuration["Jwt:Issuer"] ?? "InstitutoLC.Api",
                Audience = _configuration["Jwt:Audience"] ?? "InstitutoLC.Frontend",
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            // Gravar novo cookie de sessão com o username atualizado
            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.Strict,
                Expires = DateTimeOffset.UtcNow.AddHours(8)
            };
            Response.Cookies.Append("jwt", tokenString, cookieOptions);

            return Ok(new { username = user.Username, role = user.Role });
        }
    }
}
