import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'istToGermanTime' })
export class IstToGermanTimePipe implements PipeTransform {
  transform(istTime: string | null | undefined, istDate: string): string {
    if (!istTime || !istTime.trim() || !istDate) return '';

    // Normalize date format (replace '/' with '-')
    const normalizedDate = istDate.replace(/\//g, '-');

    // Parse IST date and time (dd-mm-yyyy and HH:mm)
    const [day, month, year] = normalizedDate.split('-').map(Number);
    const [hours, minutes] = istTime.split(':').map(Number);

    if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hours) || isNaN(minutes)) {
      return '';
    }

    // If time is exactly 00:00, return '00:00' without conversion
    if (hours === 0 && minutes === 0) {
      return '00:00';
    }

    // Create a Date object in UTC corresponding to IST time
    const istDateObj = new Date(Date.UTC(year, month - 1, day, hours - 5, minutes - 30));

    // Convert to German time zone (Europe/Berlin)
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Europe/Berlin'
    };

    // Format as HH:mm in German time (CET/CEST auto)
    return istDateObj.toLocaleTimeString('en-GB', options);
  }
}

// import { Pipe, PipeTransform } from '@angular/core';

// @Pipe({ name: 'istToGermanTime' })
// export class IstToGermanTimePipe implements PipeTransform {
//   transform(istTime: string | null | undefined, istDate: string): string {
//     if (!istTime || !istTime.trim() || !istDate) return '';

//     // Normalize date format (replace '/' with '-')
//     const normalizedDate = istDate.replace(/\//g, '-');

//     // Parse IST date and time (dd-mm-yyyy and HH:mm)
//     const [day, month, year] = normalizedDate.split('-').map(Number);
//     const [hours, minutes] = istTime.split(':').map(Number);

//     if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hours) || isNaN(minutes)) {
//       return '';
//     }

//     // Create a Date object in UTC corresponding to IST time
//     const istDateObj = new Date(Date.UTC(year, month - 1, day, hours - 5, minutes - 30));

//     // Convert to German time zone (Europe/Berlin)
//     const options: Intl.DateTimeFormatOptions = {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: false,
//       timeZone: 'Europe/Berlin'
//     };

//     // Format as HH:mm in German time (CET/CEST auto)
//     return istDateObj.toLocaleTimeString('en-GB', options);
//   }
// }
