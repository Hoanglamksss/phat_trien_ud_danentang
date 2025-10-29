using System.ComponentModel.DataAnnotations;




namespace CarRental.Api.Models
{
    public class Booking
    {
        public int Id { get; set; }
        public int CarId { get; set; }
        public int UserId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal TotalPrice { get; set; }

        
        public Car? Car { get; set; }
        public User? User { get; set; }
    }
}
