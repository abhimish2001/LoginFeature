using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;
    private readonly CaptchaService _captchaService;

    public AuthController(AuthService authService, CaptchaService captchaService)
    {
        _authService = authService;
        _captchaService = captchaService;
    }

    [HttpGet("captcha")]
    public IActionResult GetCaptcha()
    {
        var captcha = _captchaService.GenerateCaptcha();
        return Ok(ApiResponse<CaptchaResponse>.Ok(captcha, "Captcha generated successfully."));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        var (success, message, response, statusCode) = await _authService.LoginAsync(request);

        return statusCode switch
        {
            200 => Ok(ApiResponse<LoginResponse>.Ok(response!, message)),
            401 => Unauthorized(ApiResponse<object>.Fail(message)),
            403 => StatusCode(403, ApiResponse<object>.Fail(message)),
            _ => BadRequest(ApiResponse<object>.Fail(message))
        };
    }
}
