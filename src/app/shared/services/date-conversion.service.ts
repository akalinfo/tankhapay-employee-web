import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateConversionService {

  constructor() { }

  convertDate(inputDate: string): string {
    // Split the input date string
    const [day, month, year] = inputDate.split('-').map(Number);

    // Create a new Date object
    const date = new Date(year, month - 1, day);

    // Define month names
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    // Format the date to "Month-Year"
    const formattedDate = `${monthNames[date.getMonth()]}-${date.getFullYear()}`;

    return formattedDate;
  }
}