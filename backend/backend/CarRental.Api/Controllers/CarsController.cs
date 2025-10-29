using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using CarRental.Api.Data;
using CarRental.Api.Models;
using Microsoft.AspNetCore.Authorization;


namespace CarRental.Api.Controllers;


[Route("api/[controller]")]
[ApiController]
public class CarsController : ControllerBase
{
private readonly ApplicationDbContext _db;
public CarsController(ApplicationDbContext db) => _db = db;


[HttpGet]
public async Task<IActionResult> GetAll() => Ok(await _db.Cars.ToListAsync());


[HttpGet("{id}")]
public async Task<IActionResult> Get(int id)
{
var car = await _db.Cars.FindAsync(id);
if (car == null) return NotFound();
return Ok(car);
}


[HttpPost]
[Authorize]
public async Task<IActionResult> Create([FromBody] Car car)
{
if (!ModelState.IsValid) return BadRequest(ModelState);
_db.Cars.Add(car);
await _db.SaveChangesAsync();
return CreatedAtAction(nameof(Get), new { id = car.Id }, car);
}


[HttpPut("{id}")]
[Authorize]
public async Task<IActionResult> Update(int id, [FromBody] Car car)
{
if (id != car.Id) return BadRequest();
if (!ModelState.IsValid) return BadRequest(ModelState);
_db.Entry(car).State = EntityState.Modified;
await _db.SaveChangesAsync();
return NoContent();
}


[HttpDelete("{id}")]
[Authorize]
public async Task<IActionResult> Delete(int id)
{
var car = await _db.Cars.FindAsync(id);
if (car == null) return NotFound();
_db.Cars.Remove(car);
await _db.SaveChangesAsync();
return NoContent();
}
}