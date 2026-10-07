using System.Security.Cryptography;
using System.Text;
using backend.Models;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Services;

public class CaptchaService
{
    private readonly IMemoryCache _cache;
    private static readonly char[] Chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ".ToCharArray();
    private static readonly string[] Colors = ["#2563eb", "#dc2626", "#059669", "#7c3aed", "#d97706"];

    public CaptchaService(IMemoryCache cache)
    {
        _cache = cache;
    }

    public CaptchaResponse GenerateCaptcha()
    {
        var captchaId = Guid.NewGuid().ToString("N");
        var code = new StringBuilder(5);
        for (int i = 0; i < 5; i++)
        {
            code.Append(Chars[RandomNumberGenerator.GetInt32(Chars.Length)]);
        }

        var codeStr = code.ToString();
        _cache.Set($"captcha_{captchaId}", codeStr, TimeSpan.FromMinutes(3));

        var svg = GenerateSvg(codeStr);
        var base64Svg = Convert.ToBase64String(Encoding.UTF8.GetBytes(svg));

        return new CaptchaResponse
        {
            CaptchaId = captchaId,
            CaptchaImage = $"data:image/svg+xml;base64,{base64Svg}"
        };
    }

    public bool ValidateCaptcha(string captchaId, string userCode)
    {
        if (string.IsNullOrWhiteSpace(captchaId) || string.IsNullOrWhiteSpace(userCode))
            return false;

        var key = $"captcha_{captchaId}";
        if (_cache.TryGetValue(key, out string? cached) && cached != null)
        {
            _cache.Remove(key);
            return string.Equals(cached, userCode.Trim(), StringComparison.OrdinalIgnoreCase);
        }
        return false;
    }

    private static string GenerateSvg(string code)
    {
        var sb = new StringBuilder();
        sb.Append("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"150\" height=\"45\" viewBox=\"0 0 150 45\">");
        sb.Append("<rect width=\"100%\" height=\"100%\" fill=\"#f8fafc\" rx=\"6\" stroke=\"#cbd5e1\" stroke-width=\"1\"/>");

        for (int i = 0; i < 4; i++)
        {
            var x1 = RandomNumberGenerator.GetInt32(150);
            var y1 = RandomNumberGenerator.GetInt32(45);
            var x2 = RandomNumberGenerator.GetInt32(150);
            var y2 = RandomNumberGenerator.GetInt32(45);
            var color = Colors[RandomNumberGenerator.GetInt32(Colors.Length)];
            sb.Append($"<line x1=\"{x1}\" y1=\"{y1}\" x2=\"{x2}\" y2=\"{y2}\" stroke=\"{color}\" stroke-width=\"1.5\" opacity=\"0.3\"/>");
        }

        for (int i = 0; i < code.Length; i++)
        {
            var x = 16 + (i * 26);
            var y = 30 + RandomNumberGenerator.GetInt32(-3, 4);
            var rotate = RandomNumberGenerator.GetInt32(-18, 19);
            var color = Colors[RandomNumberGenerator.GetInt32(Colors.Length)];
            sb.Append($"<text x=\"{x}\" y=\"{y}\" fill=\"{color}\" font-family=\"Courier New, monospace\" font-size=\"24\" font-weight=\"bold\" transform=\"rotate({rotate} {x} {y})\">{code[i]}</text>");
        }

        sb.Append("</svg>");
        return sb.ToString();
    }
}
