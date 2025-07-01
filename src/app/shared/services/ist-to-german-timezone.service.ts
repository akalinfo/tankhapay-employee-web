import { Injectable } from '@angular/core';
import decode from 'jwt-decode';
import { GlobalConstants } from 'src/app/shared/global-constants';
@Injectable({
  providedIn: 'root'
})
export class IstToGermanTimeService {
  convertIstToGermanTime(istTime: string | null | undefined, istDate: string): string {
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


  convertGermanToIst(germanTime: string | null | undefined, germanDate: string): string {
    if (!germanTime || !germanTime.trim() || !germanDate) return '';

    // Normalize date format (replace '/' with '-')
    const normalizedDate = germanDate.replace(/\//g, '-');

    // Parse German date and time (dd-mm-yyyy and HH:mm)
    const [day, month, year] = normalizedDate.split('-').map(Number);
    const [hours, minutes] = germanTime.split(':').map(Number);

    if (isNaN(day) || isNaN(month) || isNaN(year) || isNaN(hours) || isNaN(minutes)) {
      return '';
    }

    // Create a Date object in UTC corresponding to German time (Europe/Berlin)
    const germanDateObj = new Date(Date.UTC(year, month - 1, day, hours, minutes));
    // Get the UTC time for the given German time
    const utcDateStr = germanDateObj.toLocaleString('en-GB', {
      timeZone: 'Europe/Berlin',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    // Parse the UTC date and time from the formatted string
    // Format: "dd/mm/yyyy, HH:MM"
    const [datePart, timePart] = utcDateStr.split(',').map(s => s.trim());
    const [d, m, y] = datePart.split('/').map(Number);
    const [h, min] = timePart.split(':').map(Number);

    // Create a UTC date object from the parsed values
    const utcDate = new Date(Date.UTC(y, m - 1, d, h, min));

    // Add IST offset (+5:30)
    utcDate.setUTCMinutes(utcDate.getUTCMinutes() + 330);

    // Format as HH:mm in IST
    const istHours = utcDate.getUTCHours().toString().padStart(2, '0');
    const istMinutes = utcDate.getUTCMinutes().toString().padStart(2, '0');
    return `${istHours}:${istMinutes}`;
  }
   checkIfGermanTimeZone() {
    const activeUser: string | null = localStorage.getItem('activeUser');
    if (activeUser) {
      const token: any = decode(JSON.parse(activeUser).token);

      if (GlobalConstants.NEW_GERMAN_TIME_IDS.includes(token.tp_account_id.toString())) {
        return true;
      } else {
        return false;
      }
    }

    return false;
  }
}
