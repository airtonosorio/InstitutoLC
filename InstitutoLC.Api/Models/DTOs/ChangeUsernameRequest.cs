using System.ComponentModel.DataAnnotations;

namespace InstitutoLC.Api.Models.DTOs
{
    public class ChangeUsernameRequest
    {
        [Required(ErrorMessage = "O novo nome de usuário é obrigatório")]
        [MinLength(3, ErrorMessage = "O nome de usuário deve conter pelo menos 3 caracteres")]
        [RegularExpression(@"^[a-zA-Z0-9_.]+$", ErrorMessage = "O nome de usuário só pode conter letras, números, pontos e underlines")]
        public string NewUsername { get; set; } = string.Empty;
    }
}
