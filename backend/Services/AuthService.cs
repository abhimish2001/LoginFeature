using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly JwtService _jwt;
    private readonly CaptchaService _captcha;
    private readonly EncryptionService _encryption;
    private readonly PasswordHasher<User> _hasher = new();
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        AppDbContext db,
        JwtService jwt,
        CaptchaService captcha,
        EncryptionService encryption,
        ILogger<AuthService> logger)
    {
        _db = db;
        _jwt = jwt;
        _captcha = captcha;
        _encryption = encryption;
        _logger = logger;
    }

    public async Task<(bool Success, string Message, LoginResponse? Response, int StatusCode)> LoginAsync(LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return (false, "Email and password are required.", null, 400);

        // 1. Verify CAPTCHA
        if (!_captcha.ValidateCaptcha(request.CaptchaId, request.CaptchaCode))
        {
            _logger.LogWarning("Invalid or expired CAPTCHA for email: {Email}", request.Email);
            return (false, "Invalid or expired CAPTCHA code.", null, 400);
        }

        // 2. Find user by email
        var normalizedEmail = request.Email.Trim().ToLower();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (user == null)
        {
            _logger.LogWarning("User not found: {Email}", request.Email);
            return (false, "Invalid email or password.", null, 401);
        }

        // Decrypt password if encrypted by frontend client
        var plainPassword = _encryption.DecryptPassword(request.Password);

        // 3. Verify PBKDF2 Password
        var verifyResult = _hasher.VerifyHashedPassword(user, user.PasswordHash, plainPassword);
        if (verifyResult is not (PasswordVerificationResult.Success or PasswordVerificationResult.SuccessRehashNeeded))
        {
            _logger.LogWarning("Invalid password for email: {Email}", request.Email);
            return (false, "Invalid email or password.", null, 401);
        }

        // 4. Verify Active Status
        if (!user.IsActive)
        {
            _logger.LogWarning("Inactive user: {Email}", user.Email);
            return (false, "User account is inactive.", null, 403);
        }

        // 5. Generate token & record last login
        var (token, expiresAt) = _jwt.GenerateToken(user);
        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var response = new LoginResponse
        {
            Email = user.Email,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Role = user.Role,
            Token = token,
            ExpiresAt = expiresAt
        };

        _logger.LogInformation("Login successful for email: {Email}", user.Email);
        return (true, "Login successful.", response, 200);
    }
}
