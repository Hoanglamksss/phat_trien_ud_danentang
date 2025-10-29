using Microsoft.EntityFrameworkCore;
using CarRental.Api.Models;
using Microsoft.AspNetCore.Identity; 

namespace CarRental.Api.Data;


public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<Car> Cars => Set<Car>();
    public DbSet<User> Users => Set<User>();
    public DbSet<Booking> Bookings { get; set; } 


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder); 
             
        var hasher = new PasswordHasher<User>();

        modelBuilder.Entity<User>().HasData(new User
        {
            Id = 1,
            Username = "admin", 
            FullName = "System Admin",
            PhoneNumber = "0123456789",
            Cmnd = "000000000",
            Role = UserRole.Admin,
            PasswordHash = hasher.HashPassword(null!, "Admin@123")
        });

     
        modelBuilder.Entity<Car>().Property(c => c.PricePerHour).HasPrecision(18,2);
    }
}