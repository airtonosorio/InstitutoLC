using System.ComponentModel.DataAnnotations;

namespace InstitutoLC.Api.Models.DTOs
{
    public class ChangePasswordRequest
    {
        [Required(ErrorMessage = "A senha antiga é obrigatória")]
        public string OldPassword { get; set; } = string.Empty;

        [Required(ErrorMessage = "A nova senha é obrigatória")]
        [MinLength(6, ErrorMessage = "A nova senha deve conter pelo menos 6 caracteres")]
        public string NewPassword { get; set; } = string.Empty;
    }
}
