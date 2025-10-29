using System.ComponentModel.DataAnnotations;


namespace CarRental.Api.Models;


public class Car
{
public int Id { get; set; }


[Required]
public string Name { get; set; } = string.Empty;


[Required]
public string Brand { get; set; } = string.Empty;


[Required]
public string ImageName { get; set; } = string.Empty;


[Required]
public string Horsepower { get; set; } = string.Empty;


[Required]
public decimal PricePerHour { get; set; }


public bool IsAvailable { get; set; } = true;
}