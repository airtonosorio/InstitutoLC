using System;

namespace InstitutoLC.Api.Models.Entities
{
    public class Usuario
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string Role { get; set; } = "Admin";
        public DateTime DataCadastro { get; set; } = DateTime.Now;
    }
}
