import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[appDecimalLimit]'
})
export class DecimalLimitDirective {
  @Input() maxLength = 5;

  constructor(private el: ElementRef, private control: NgControl) { }

  @HostListener('keyup', ['$event']) onKeyup(event: KeyboardEvent) {
    this.updateValue();
  }

  @HostListener('blur', ['$event']) onBlur(event: FocusEvent) {
    this.updateValue();
  }

  private updateValue() {
    let input = this.el.nativeElement.value;

    // Allow only numbers and a single decimal point
    input = input.replace(/[^0-9.]/g, ''); // Remove non-numeric and non-decimal characters

    // Ensure only one decimal point is allowed
    const decimalParts = input.split('.');

    if (decimalParts[0].length > 2) {
      // Limit digits before the decimal to 2
      decimalParts[0] = decimalParts[0].substring(0, 2);
    }

    if (decimalParts.length > 2) {
      // Ensure there's only one decimal point, and concatenate only the first two parts
      input = `${decimalParts[0]}.${decimalParts[1]}`;
    } else {
      input = decimalParts.join('.');
    }

    // Limit the total input length to 5 characters
    if (input.length > this.maxLength) {
      input = input.substring(0, this.maxLength);
    }

    // Update the DOM and Angular form control value
    this.el.nativeElement.value = input;
    if (this.control && this.control.control) {
      this.control.control.setValue(input, { emitEvent: false });
    }
  }
}
