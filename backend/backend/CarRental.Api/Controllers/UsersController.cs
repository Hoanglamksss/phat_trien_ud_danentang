using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CarRental.Api.Data;
using CarRental.Api.Models;

namespace CarRental.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly IConfiguration _config;
        private readonly PasswordHasher<User> _hasher = new();

        public UsersController(ApplicationDbContext db, IConfiguration config)
        {
            _db = db;
            _config = config;
        }

        // Đăng ký
        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] User user)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (string.IsNullOrWhiteSpace(user.Username) || string.IsNullOrWhiteSpace(user.PasswordHash))
                return BadRequest("Username và password là bắt buộc");

            if (await _db.Users.AnyAsync(u => u.Username == user.Username))
                return BadRequest("Username đã tồn tại");

            user.PasswordHash = _hasher.HashPassword(user, user.PasswordHash!);
            if (user.Role == 0)
                user.Role = UserRole.User;

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Đăng ký thành công", user.Id, user.Username, user.Role });
        }

        // Đăng nhập
       [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
    if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
        return BadRequest("Username và password là bắt buộc");

    var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
    if (user == null)
        return Unauthorized("Sai username hoặc password");

    var result = _hasher.VerifyHashedPassword(user, user.PasswordHash!, request.Password!);
    if (result == PasswordVerificationResult.Failed)
        return Unauthorized("Sai username hoặc password");

    // Sinh JWT token 
    var claims = new[]
    {
        new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
        new Claim(ClaimTypes.Name, user.Username),
        new Claim(ClaimTypes.Role, user.Role.ToString())
    };

    var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
    var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

    var token = new JwtSecurityToken(
        issuer: _config["Jwt:Issuer"],
        audience: _config["Jwt:Audience"],
        claims: claims,
        expires: DateTime.Now.AddHours(6),
        signingCredentials: creds
    );

    var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

    return Ok(new
    {
        id = user.Id,
        username = user.Username,
        fullName = user.FullName,
        role = user.Role.ToString(),
        token = tokenString
    });
}


        // Lấy thông tin user theo id
        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> Get(int id)
        {
            var user = await _db.Users.FindAsync(id);
            if (user == null)
                return NotFound();

            return Ok(new { user.Id, user.Username, user.FullName, user.Role });
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
