using System.Security.Claims;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/user")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly AppDbContext _db;

    public UserController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var emailClaim = User.FindFirstValue(ClaimTypes.Email) 
                      ?? User.FindFirstValue(ClaimTypes.NameIdentifier) 
                      ?? User.FindFirstValue("sub");

        if (string.IsNullOrEmpty(emailClaim))
            return Unauthorized(ApiResponse<object>.Fail("Invalid token claims."));

        var normalizedEmail = emailClaim.Trim().ToLower();
        var user = await _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user == null)
            return NotFound(ApiResponse<object>.Fail("User not found."));

        var response = new UserResponse
        {
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role,
            IsActive = user.IsActive
        };

        return Ok(ApiResponse<UserResponse>.Ok(response, "Profile retrieved successfully."));
    }
}
