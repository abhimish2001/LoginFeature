using System.Security.Cryptography;
using System.Text;

namespace backend.Services;

public class EncryptionService
{
    private readonly byte[] _key;

    public EncryptionService(IConfiguration config)
    {
        var keyString = config["Security:EncryptionKey"] ?? "AuthPortalSecKey2026#SecureP@ss!";
        _key = Encoding.UTF8.GetBytes(keyString.PadRight(32).Substring(0, 32));
    }

    public string DecryptPassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            return string.Empty;

        // If not encrypted with ENC: prefix (e.g. testing in Swagger directly with plain text)
        if (!password.StartsWith("ENC:"))
            return password;

        try
        {
            var fullCipher = Convert.FromBase64String(password.Substring(4));
            if (fullCipher.Length < 16)
                return password;

            using var aes = Aes.Create();
            aes.Key = _key;
            aes.Mode = CipherMode.CBC;
            aes.Padding = PaddingMode.PKCS7;

            // Extract 16-byte IV
            var iv = new byte[16];
            Array.Copy(fullCipher, 0, iv, 0, 16);
            aes.IV = iv;

            using var ms = new MemoryStream(fullCipher, 16, fullCipher.Length - 16);
            using var cs = new CryptoStream(ms, aes.CreateDecryptor(), CryptoStreamMode.Read);
            using var sr = new StreamReader(cs, Encoding.UTF8);
            return sr.ReadToEnd();
        }
        catch
        {
            // Fallback if decryption fails
            return password;
        }
    }
}
