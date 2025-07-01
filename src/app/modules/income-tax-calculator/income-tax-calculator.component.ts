import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IncomeTaxCalculatorService } from './services/income-tax-calculator.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { Location } from '@angular/common';
@Component({
  selector: 'app-income-tax-calculator',
  templateUrl: './income-tax-calculator.component.html',
  styleUrls: ['./income-tax-calculator.component.css']
})
export class IncomeTaxCalculatorComponent implements OnInit {

  taxForm: FormGroup;
  isSubmitted: boolean = false;
  isCalculated: boolean = false;
  isVisibleNewTax: boolean = false;
  isVisibleOldTax: boolean = false;
  currentFY: string = '';
  nextFY: string = '';
  selectedFY: string = '';
  old_regime_data: any[] = [];
  new_regime_data: any[] = [];
  
  oldTax: number = 0;
  newTax: number = 0;
  taxDifference: number = 0;
  bestRegime: string = 'New'; // Default to New

  previousFY: string = ''; // Previous Fiscal Year
  showCurrentAndNext: boolean = true; // Determines which fiscal years to show

  constructor(
    private fb: FormBuilder,
    private _incomeTaxCalculatorService: IncomeTaxCalculatorService,
    private _EncrypterService: EncrypterService,
    private location: Location
  ) {
    this.taxForm = this.fb.group({
      grossEarnings: [0, [Validators.required, Validators.min(1)]],
      // age: ['', Validators.required],
      // savingsInterest: [0],
      // rentalIncome: [0],
      // municipalTax: [0],
      // homeLoanInterest: [0],
      // otherIncome: [0],
      hraExemption: [0],
      homeLoanExemption: [0],
      deduction80c: [0],
      deduction80ccdEmployee: [0],
      deduction80ccd1b: [0],
      deduction80dMediclaim: [0],
      deduction80eEduLoanInterest: [0],
      deduction80eeaHomeLoan: [0],
      deduction80eebEvLoan: [0],
      deduction80gDonations: [0],
      proffesionalTax: [0],
      magazineAllowance: [0],
      uniformAllowance: [0],
      driverAllowance: [0],
      fuelAllowance: [0],
      educationAllowance: [0],
      lta: [0],
      oneMonthBasic: [0]
    });
  }

  ngOnInit(): void {
    this.setFiscalYears();
    (window as any).$('[data-toggle="tooltip"]').tooltip();
  }
  // setFiscalYears(): void {
  //   const currentDate = new Date();
  //   const currentYear = currentDate.getFullYear();
  //   const startMonth = 4; // Fiscal Year starts in April

  //   let fyStartYear = currentYear;
  //   if (currentDate.getMonth() + 1 < startMonth) {
  //     fyStartYear = currentYear - 1;
  //   }

  //   this.currentFY = `${fyStartYear}-${fyStartYear + 1}`;
  //   this.nextFY = `${fyStartYear + 1}-${fyStartYear + 2}`;
  //   this.selectedFY = this.currentFY; // Default to current fiscal year
  // }

  // toggleFY(period: string): void {
  //   this.selectedFY = period === 'previous' ? this.currentFY : this.nextFY;
  //   if (this.taxForm.valid && !this.isCalculated) {
  //     this.calculateTax();
  //   } 
  // }

  setFiscalYears(): void {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // Get month (1-based index)
    console.log(currentMonth, 'currentMonth')
    const startMonth = 4; // Fiscal Year starts in April

    let fyStartYear = currentYear;

    // If current month is before April, fiscal year belongs to the previous year
    if (currentMonth < startMonth) {
      fyStartYear = currentYear - 1;
    }

    // Determine if we should show Current & Next FY (for March)
    this.showCurrentAndNext = currentMonth === 3; // True only in March

    // Set fiscal years dynamically
    this.previousFY = `${fyStartYear - 1}-${fyStartYear}`;
    this.currentFY = `${fyStartYear}-${fyStartYear + 1}`;
    this.nextFY = `${fyStartYear + 1}-${fyStartYear + 2}`;
    this.selectedFY = this.currentFY; // Default selection
  }

  toggleFY(period: string): void {
    if (period === 'previous') {
      this.selectedFY = this.previousFY;
    } else if (period === 'current') {
      this.selectedFY = this.currentFY;
    } else if (period === 'next') {
      this.selectedFY = this.nextFY;
    }
    if (this.taxForm.valid && this.isCalculated) {
      this.calculateTax();
    }
  }

  toggleBreakUp(taxType: string) {
    if (taxType === 'new-tax') {
      this.isVisibleNewTax = !this.isVisibleNewTax;
      this.isVisibleOldTax = false;
    } else if (taxType === 'old-tax') {
      this.isVisibleOldTax = !this.isVisibleOldTax;
      this.isVisibleNewTax = false;
    }
  }

  onSubmit(): void {
    this.isSubmitted = true;
    if (this.taxForm.valid) {
      this.calculateTax();
      
    } else {
      alert("Please fill in all required fields.");
    }
  }

  calculateTax() {
    const formData = this.taxForm.value;
    const taxPayload = {
      financialYear: this.selectedFY,
      grossEarnings: formData.grossEarnings,
      // age: formData.age,
      // savingsInterest: formData.savingsInterest,
      // rentalIncome: formData.rentalIncome,
      // municipalTax: formData.municipalTax,
      // homeLoanInterest: formData.homeLoanInterest,
      // otherIncome: formData.otherIncome,
      // comment by ak as 28-03-2025
      age: 0,
      savingsInterest: 0,
      rentalIncome: 0,
      municipalTax: 0,
      homeLoanInterest: 0,
      otherIncome: 0,
      hraExemption: formData.hraExemption,
      homeLoanExemption: formData.homeLoanExemption,
      deduction80c: formData.deduction80c,
      deduction80ccdEmployee: formData.deduction80ccdEmployee,
      deduction80ccd1b: formData.deduction80ccd1b,
      deduction80dMediclaim: formData.deduction80dMediclaim,
      deduction80eEduLoanInterest: formData.deduction80eEduLoanInterest,
      deduction80eeaHomeLoan: formData.deduction80eeaHomeLoan,
      deduction80eebEvLoan: formData.deduction80eebEvLoan,
      deduction80gDonations: formData.deduction80gDonations,
      proffesionalTax: formData.proffesionalTax,
      magazineAllowance: formData.magazineAllowance,
      uniformAllowance: formData.uniformAllowance,
      driverAllowance: formData.driverAllowance,
      fuelAllowance: formData.fuelAllowance,
      educationAllowance: formData.educationAllowance,
      lta: formData.lta,
      oneMonthBasic: formData.oneMonthBasic
    };

    this._incomeTaxCalculatorService.TaxCalculator(taxPayload)
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          let resultJson = this._EncrypterService.aesDecrypt(resData.commonData);
          let commonData = JSON.parse(resultJson);
          this.old_regime_data = commonData.OldRegime || [];
          this.new_regime_data = commonData.NewRegime || [];
          this.isCalculated = true;
          let old_balancetax = this.old_regime_data?.[0]?.balancetax;
          let new_balancetax = this.new_regime_data?.[0]?.balancetax;
          this.calculateTaxDifference(old_balancetax,new_balancetax);
        } else {
          this.old_regime_data = [];
          this.new_regime_data = [];
          // this.toastr.error(resData.message);
        }
      });
  }


  backToEdit(): void {
    this.isCalculated = false;
    this.isSubmitted = false;
  }

  resetPage(): void {
    this.taxForm.reset();
    this.isCalculated = false;
    this.isSubmitted = false;
  }

  restrictToNumbers(event: KeyboardEvent | ClipboardEvent) {
    if (event instanceof KeyboardEvent) {
      const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
      
      // Allow navigation & editing keys
      if (allowedKeys.includes(event.key)) {
        return;
      }
  
      // Prevent non-numeric characters
      if (event.key < '0' || event.key > '9') {
        event.preventDefault();
      }
    } 
    
    else if (event instanceof ClipboardEvent) {
      const clipboardData = event.clipboardData?.getData('text') || '';
  
      // Allow only numbers when pasting
      if (!/^\d+$/.test(clipboardData)) {
        event.preventDefault();
      }
    }
  }

  enforceLimit(event: any, maxLimit: number) {
    const inputValue = Number(event.target.value);
    if (inputValue > maxLimit) {
      event.target.value = maxLimit;
    }
  }

  calculateTaxDifference(old_balancetax: any,new_balancetax: any) {
    this.oldTax = old_balancetax;
    this.newTax = new_balancetax;
    this.taxDifference = Math.abs(this.oldTax - this.newTax); // Always positive
    this.bestRegime = this.newTax < this.oldTax ? 'New' : 'Old';
  }
 goBack(): void {
    this.location.back();
  }
}
