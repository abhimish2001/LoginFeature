using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

[Table("Users")]
public class User
{
    [Key]
    public int Id { get; set; }

    [StringLength(100)]
    public string UserName { get; set; } = string.Empty;

    [StringLength(200)]
    public string Email { get; set; } = string.Empty;

    [StringLength(500)]
    public string PasswordHash { get; set; } = string.Empty;

    [StringLength(100)]
    public string? FirstName { get; set; }

    [StringLength(100)]
    public string? LastName { get; set; }

    [StringLength(50)]
    public string Role { get; set; } = "User";

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }

    public DateTime? LastLoginAt { get; set; }
}
