import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appNumberonly]',
  standalone: true
})
export class NumberonlyDirective {
  constructor(private el: ElementRef) {}

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    const allowedKeys = [
      'Backspace', 'ArrowLeft', 'ArrowRight', 'Tab', 'Delete',
      'Home', 'End'
    ];
    if (allowedKeys.includes(event.key)) {
      return; // Allow control keys
    }

    // Allow Ctrl/Command + A, C, V, X for copy-paste actions
    if (
      (event.key === 'a' || event.key === 'c' || event.key === 'v' || event.key === 'x' || event.key=='r') &&
      (event.ctrlKey || event.metaKey)
    ) {
      return;
    }

    const inputValue: string = this.el.nativeElement.value;

    // Allow numbers (0-9), a single decimal point (.), and a negative sign (-) at the beginning
    if (
      (event.key >= '0' && event.key <= '9') ||
      (event.key === '.' && !inputValue.includes('.')) ||
      (event.key === '-' && inputValue === '')
    ) {
      return; // Valid input
    }

    event.preventDefault(); // Block invalid input
  }

  @HostListener('input', ['$event'])
  onInput(event: Event) {
    this.sanitizeInput();
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');
    const sanitizedValue = this.getSanitizedValue(pastedText);
    this.el.nativeElement.value = sanitizedValue;
    this.el.nativeElement.dispatchEvent(new Event('input')); // Trigger input event for Angular
  }

  private sanitizeInput() {
    const inputElement = this.el.nativeElement;
    const sanitizedValue = this.getSanitizedValue(inputElement.value);
    if (inputElement.value !== sanitizedValue) {
      inputElement.value = sanitizedValue;
      inputElement.dispatchEvent(new Event('input')); // Trigger input event for Angular
    }
  }

  private getSanitizedValue(value: string): string {
    if (!value) {
      return '';
    }

    // Remove non-numeric characters except for a single decimal point and leading negative sign
    let filteredValue = value.replace(/[^0-9.-]/g, '');

    // Ensure only one decimal point exists
    const decimalIndex = filteredValue.indexOf('.');
    if (decimalIndex !== -1) {
      filteredValue =
        filteredValue.substring(0, decimalIndex + 1) +
        filteredValue.substring(decimalIndex + 1).replace(/\./g, '');
    }

    // Ensure the negative sign appears only at the start
    if (filteredValue.includes('-')) {
      filteredValue = '-' + filteredValue.replace(/-/g, '');
    }

    return filteredValue;
  }
}
