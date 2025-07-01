// hide-digits.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hideDigits'
})
export class HideDigitsPipe implements PipeTransform {
  transform(value: number, start: number = 0, end: number = 0): string {
    const stringValue = value.toString();

    if (start < 0 || end < 0 || start >= stringValue.length || end >= stringValue.length || start > end) {
      // Invalid range, return the original value
      return stringValue;
    }

    const hiddenPart = stringValue.substring(0, start) + '*'.repeat(end - start + 1) + stringValue.substring(end + 1);
    return hiddenPart;
  }
}
