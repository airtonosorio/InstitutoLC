using System;

namespace InstitutoLC.Api.Models.Entities
{
    public class Atividade
    {
        public int Id { get; set; }
        public string Nome { get; set; } = string.Empty;
        public int MinIdade { get; set; }
        public int MaxIdade { get; set; }
    }
}
