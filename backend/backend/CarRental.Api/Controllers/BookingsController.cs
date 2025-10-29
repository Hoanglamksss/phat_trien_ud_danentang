using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRental.Api.Data;
using CarRental.Api.Models;
using Microsoft.AspNetCore.Authorization; 
using System.Threading.Tasks;         
using System.Linq;                   
using System.Security.Claims;         
using System;                        

namespace CarRental.Api.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public BookingsController(ApplicationDbContext db) => _db = db;

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] Booking booking)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

   
            var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdString) || !int.TryParse(userIdString, out var userId))
            {
                return Unauthorized("Không thể xác thực người dùng từ token.");
            }
            booking.UserId = userId;

            var car = await _db.Cars.FindAsync(booking.CarId);
            if (car == null) return BadRequest("Không tìm thấy xe.");


            if (booking.StartTime >= booking.EndTime) return BadRequest("Thời gian kết thúc phải sau thời gian bắt đầu.");
            if (booking.StartTime < DateTime.UtcNow.AddMinutes(-5)) 
            {
                return BadRequest("Không thể đặt xe trong quá khứ.");
            }

            var hours = (decimal)(booking.EndTime - booking.StartTime).TotalHours;
            booking.TotalPrice = Math.Round(car.PricePerHour * hours, 2);

            _db.Bookings.Add(booking);
            await _db.SaveChangesAsync();

            var createdBooking = await _db.Bookings
                                       .Include(b => b.Car)
                                       .AsNoTracking() 
                                       .FirstOrDefaultAsync(b => b.Id == booking.Id);

            return CreatedAtAction(nameof(GetByUser), new { userId = createdBooking.UserId }, createdBooking);
        }

    
        [HttpGet("user/{userId}")]
        [Authorize]
        public async Task<IActionResult> GetByUser(int userId)
        {

            var currentUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);

            if (currentUserIdString != userId.ToString() && currentUserRole != "Admin")
            {
                return Forbid("Bạn không có quyền xem thông tin đặt xe của người khác.");
            }

            var list = await _db.Bookings
                                .Include(b => b.Car)
                                .Where(b => b.UserId == userId)
                                .OrderByDescending(b => b.StartTime)
                                .AsNoTracking()
                                .ToListAsync();

            return Ok(list);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllBookings()
        {
            var bookings = await _db.Bookings
                                    .Include(b => b.Car)
                                    .Include(b => b.User)
                                    .Select(b => new
                                    {
                                        b.Id,
                                        b.CarId,
                                        b.UserId,
                                        b.StartTime,
                                        b.EndTime,
                                        b.TotalPrice,
                                        Car = new { b.Car.Id, b.Car.Name },
                                        User = new { b.User.Id, b.User.Username, b.User.FullName }
                                    })
                                    .OrderByDescending(b => b.StartTime)
                                    .AsNoTracking()
                                    .ToListAsync();
            return Ok(bookings);
        }

        [HttpDelete("{id}")]
        [Authorize] 
        public async Task<IActionResult> DeleteBooking(int id)
        {
            var booking = await _db.Bookings.FindAsync(id);

            if (booking == null)
            {
                return NotFound($"Không tìm thấy đơn đặt xe với ID: {id}");
            }

            var currentUserIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var currentUserRole = User.FindFirstValue(ClaimTypes.Role);
            if (!int.TryParse(currentUserIdString, out var currentUserId))
            {
                return Unauthorized("User ID không hợp lệ.");
            }


            if (booking.StartTime <= DateTime.UtcNow) 
            {
                 return BadRequest("Không thể hủy đơn hàng đã hoặc đang diễn ra."); 
            }


            _db.Bookings.Remove(booking);
            await _db.SaveChangesAsync();

            return NoContent();
        }
    }
}

