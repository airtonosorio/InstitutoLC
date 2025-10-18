using Microsoft.AspNetCore.Mvc;

namespace InstitutoLC.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TestController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { 
                message = "API InstitutoLC está funcionando! 🚀",
                timestamp = DateTime.Now,
                status = "Online"
            });
        }
        
        [HttpGet("ping")]
        public IActionResult Ping()
        {
            return Ok("Pong! 🏓");
        }
    }
}