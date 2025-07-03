import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { EmployeeLoginService } from '../employee-login.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;
// Define interfaces for better type safety
interface ClearanceItem {
  id: number;
  asset_item: string;
  is_cleared: string;
  department_name: string;
  originalIndex?: number; // We'll add this to link the view to the form array
}

interface EmployeeDetails {
  emp_name: string;
  orgempcode: string; // Corrected from your log: 'orgempcode'
  posting_department: string;
  current_designation: string;
  dateofjoining: string;
  dateofresignation: string;
  hodRo: string; // Assuming this key exists
  last_working_day_at_the_organization: string;
}

@Component({
  selector: 'app-exit-clearance-form',
  templateUrl: './exit-clearance-form.component.html',
  styleUrls: ['./exit-clearance-form.component.css']
})
export class ExitClearanceFormComponent implements OnInit {
  // --- Component State ---
  clearanceForm!: FormGroup;
  isLoadingAccess = true;
  canAccessForm = false;

  // --- Data Properties ---
  employee: EmployeeDetails;
  allClearanceItems: ClearanceItem[] = [];
  groupedItems: { [key: string]: ClearanceItem[] } = {}; // For the view grouping
  departmentKeys: string[] = []; // For easier iteration in the template

  // --- Accordion Toggles ---
  showSidebar: boolean = false;
  showEmployeeInfo = true;
  showTable = true;
  showSignature = true;
  is_submitted = false;

  // --- Session/Token Info ---
  private token: any;
  private tp_account_id: any;
  private product_type: any;
  private emp_code: any;


  constructor(
    private fb: FormBuilder,
    private exitFormService: EmployeeLoginService,
    private _sessionService: SessionService,
    private _encrypterService: EncrypterService,
    private _toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    // 1. Get user and employee info from session/storage
    const session_obj_d: any = JSON.parse(this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    const empLocalData = localStorage.getItem("empDataFromParent");

    this.tp_account_id = this.token.tp_account_id;
    this.product_type = this.token.product_type;
    this.emp_code = empLocalData ? JSON.parse(empLocalData).emp_code : null;

    // 2. Load all necessary data and then build the form
    this.loadDataAndBuildForm();
  }

  // --- Getter for easy template access to the FormArray ---
  get clearanceItemsArray(): FormArray {
    return this.clearanceForm.get('clearanceItems') as FormArray;
  }

  loadDataAndBuildForm(): void {
    if (!this.emp_code) {
      this._toastrService.error("Employee code not found. Cannot load form.");
      this.isLoadingAccess = false;
      this.canAccessForm = false;
      return;
    }

    this.isLoadingAccess = true;
    const payload = {
      customerAccountId: this.tp_account_id,
      empCode: this.emp_code,
      productTypeId: this.product_type,
      actionType: 'Get_MST_CLEARANCE_FORM',
    };

    this.exitFormService.getExitFormDetails(payload).subscribe({
      next: (res: any) => {
        if (res?.statusCode === true && res?.commonData) {
          const data = JSON.parse(this._encrypterService.aesDecrypt(res.commonData));
         
          this.employee = data[0]?.employeedetails?.[0] || {};
          this.allClearanceItems = data[0]?.exit_master_reason || [];
          this.is_submitted = data[0]?.submit_status || false;
          this.canAccessForm = data[0].is_feedback_link_status || false;
          if (this.canAccessForm) {
            this.employee = data[0]?.employeedetails?.[0] || {};
            this.allClearanceItems = data[0]?.exit_master_reason || [];
            this.is_submitted = data[0]?.submit_status || false;

            this.groupItemsByDepartment(this.allClearanceItems);
            this.buildForm();

            if (this.is_submitted) {
              this.clearanceForm.disable();
            }
          } else {
            // this._toastrService.warning("You are not authorized to view this form.");
          }

        } else {
          this._toastrService.error("Could not load clearance form data.");
          this.canAccessForm = false;
        }
        this.isLoadingAccess = false;
      },
      error: (err) => {
        console.error('Error loading clearance data:', err);
        this._toastrService.error("An error occurred while fetching form data.");
        this.canAccessForm = false;
        this.isLoadingAccess = false;
      },
    });
  }

  buildForm(): void {
    this.clearanceForm = this.fb.group({
      // Static employee details
      employeeName: [{ value: this.employee.emp_name || '', disabled: true }],
      employeeCode: [{ value: this.employee.orgempcode || '', disabled: true }],
      department: [{ value: this.employee.posting_department || '', disabled: true }],
      designation: [{ value: this.employee.current_designation || '', disabled: true }],
      dateOfJoining: [{ value: this.employee.dateofjoining || '', disabled: true }],
      dateOfResignation: [{ value: this.employee.dateofresignation || '', disabled: true }],
      hodRo: [{ value: this.employee.hodRo || '', disabled: true }],
      lastWorkingDay: [{ value: this.employee.last_working_day_at_the_organization || '', disabled: true }],

      clearanceItems: this.fb.array(this.createClearanceItemControls()),
    });
  }

  createClearanceItemControls(): FormGroup[] {
    return this.allClearanceItems.map(item => this.fb.group({
      id: [item.id], 
      status: [item.is_cleared || '', Validators.required], 
      
    }));
  }

  groupItemsByDepartment(items: ClearanceItem[]): void {
    this.groupedItems = items.reduce((acc, item, index) => {
      const dept = item.department_name;
      if (!acc[dept]) {
        acc[dept] = [];
      }
      
      acc[dept].push({ ...item, originalIndex: index });
      return acc;
    }, {} as { [key: string]: ClearanceItem[] });

    this.departmentKeys = Object.keys(this.groupedItems);
  }

  onSubmit() {
    if (this.clearanceForm.invalid) {
      this._toastrService.error('Please fill all required fields before submitting.');
      this.clearanceForm.markAllAsTouched();
      return;
    }


    const formData = this.clearanceForm.getRawValue(); 
    const send_payload = {
      empCode: this.emp_code,
      customerAccountId: this.tp_account_id,
      createdBy: this.emp_code,
      createdIp: "::1",
      clearanceData: JSON.stringify(formData.clearanceItems.map(item => ({
        clearance_master_id: item.id,
        is_cleared: item.status,
        remarks: "",
        verified_by: ""
      }))),
      actionType: "employee"
    };
    this.exitFormService.saveCleranceForm(send_payload).subscribe({
      next: (res: any) => {
        if (res?.statusCode === true || res?.status === 'success') {
          this.is_submitted = true;
          this.clearanceForm.disable(); 
          this._toastrService.success(res?.message);
        } else {
          this._toastrService.error(`${res.message || 'Please try again.'}`);
        }
      },
      error: (err) => {
        console.error('Save error:', err);
        this._toastrService.error(err.message);

      }
    });

  }

  // --- UI Toggle Functions ---
  toggle() { this.showSidebar = !this.showSidebar; }
  toggleEmployeeInfo() { this.showEmployeeInfo = !this.showEmployeeInfo; }
  toggleTable() { this.showTable = !this.showTable; }
  toggleSignature() { this.showSignature = !this.showSignature; }

 

// public generatePdf(): void {
//   // 1. Ensure the correct form is initialized
//   if (!this.clearanceForm) {
//     console.error('Clearance form not initialized.');
//     return;
//   }
//   const formValue = this.clearanceForm.getRawValue();

//   const today = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY

//   // 2. Re-usable helper for creating simple key-value rows
//   const createInfoRow = (label: string, value: any): [any, any] => {
//     return [{ text: label, bold: true }, value || 'N/A'];
//   };

//   // 3. NEW Helper: Build the main clearance table with grouped departments
//   const buildClearanceTable = () => {
//     // Define the table header
//     const tableHeader = [
//       { text: 'Department', style: 'tableHeader' },
//       { text: 'Assets / Item Description', style: 'tableHeader' },
//       { text: 'Handed Over? (Y/N)', style: 'tableHeader' },
//     ];

//     const tableBody: any[][] = [tableHeader];

//     // This logic mimics your HTML structure using `groupedItems` and `departmentKeys`
//     // It assumes `this.departmentKeys` and `this.groupedItems` are available in your component
//     this.departmentKeys.forEach(deptKey => {
//       const itemsInDept = this.groupedItems[deptKey];

//       itemsInDept.forEach((item: any, index: number) => {
//         let row = [];
//         // For the first item in a group, add the department name with a rowspan
//         if (index === 0) {
//           row.push({
//             text: item.department_name,
//             bold: true,
//             rowSpan: itemsInDept.length,
//             margin: [0, 5, 0, 5]
//           });
//         } else {
//           // For subsequent items, add an empty cell because the first column is spanned
//           row.push({});
//         }

//         // Add the asset description and status for every item
//         const clearanceItemData = formValue.clearanceItems[item.originalIndex];
//         row.push(
//           { text: item.asset_item, margin: [0, 5, 0, 5] },
//           { text: clearanceItemData.status || 'N/A', alignment: 'center', margin: [0, 5, 0, 5] }
//         );

//         tableBody.push(row);
//       });
//     });

//     return {
//       table: {
//         widths: ['25%', '*', '25%'], // Adjust widths as needed
//         body: tableBody,
//       },
//       layout: 'lightHorizontalLines', // A clean layout for data tables
//     };
//   };

//   // =================================================================
//   // PDF DOCUMENT DEFINITION
//   // =================================================================
//   const docDefinition: any = {
//     pageSize: 'A4',
//     pageMargins: [40, 60, 40, 60],
//     content: [
//       // ---------- Header ----------
//       { text: 'Exit Clearance Form', style: 'header' },

//       // ---------- Employee Details Section ----------
//       { text: 'Employee Details', style: 'subHeader' },
//       {
//         style: 'infoTable',
//         table: {
//           widths: ['auto', '*'],
//           body: [
//             createInfoRow('Employee Name:', formValue.employeeName),
//             createInfoRow('Employee Code:', formValue.employeeCode),
//             createInfoRow('Designation:', formValue.designation),
//             createInfoRow('Department:', formValue.department),
//             createInfoRow('Date of Joining:', formValue.dateOfJoining ? new Date(formValue.dateOfJoining).toLocaleDateString('en-GB') : 'N/A'),
//             createInfoRow('HoD/ RO:', formValue.hodRo),
//             createInfoRow('Date of Resignation:', formValue.dateOfResignation ? new Date(formValue.dateOfResignation).toLocaleDateString('en-GB') : 'N/A'),
//             createInfoRow('Last Working Day:', formValue.lastWorkingDay ? new Date(formValue.lastWorkingDay).toLocaleDateString('en-GB') : 'N/A'),
//           ],
//         },
//         layout: 'noBorders', // A clean layout for info blocks
//       },

//       // ---------- Clearance Table Section ----------
//       { text: 'Asset Clearance Record', style: 'subHeader' },
//       buildClearanceTable(),

//       // ---------- Signatures Section ----------
//       {
//         columns: [
//           { stack: [{ text: 'Exiting Employee', bold: true }, '\n\n\n\n', 'Signature: ________________', { text: `Date: ${today}`, margin: [0, 5, 0, 0] }] },
//           { stack: [{ text: 'Authorizing Department (HR/Admin)', bold: true }, '\n\n\n\n', 'Signature: ________________', { text: 'Date: ________________', margin: [0, 5, 0, 0] }] }
//         ],
//         margin: [0, 60, 0, 0] // Add significant margin before the signature block
//       },
//     ],
//     // Re-usable styles from your first example
//     styles: {
//       header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 20] },
//       subHeader: { fontSize: 14, bold: true, margin: [0, 20, 0, 10] },
//       infoTable: { margin: [0, 5, 0, 15], fontSize: 10 },
//       tableHeader: { bold: true, fontSize: 11, color: 'black', alignment: 'center', fillColor: '#eeeeee' },
//     },
//   };

//   // 4. Generate and download the PDF
//   const fileName = `Exit-Clearance-Form-${formValue.employeeCode || 'Employee'}.pdf`;
//   pdfMake.createPdf(docDefinition).download(fileName);
// }


public generatePdf(): void {
  // 1. Ensure the correct form is initialized
  if (!this.clearanceForm) {
    console.error('Clearance form not initialized.');
    return;
  }
  const formValue = this.clearanceForm.getRawValue();

  // Helper to format dates, returns a placeholder if date is invalid
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date.getTime())
      ? date.toLocaleDateString('en-GB')
      : '________________';
  };

  // Helper to create the two-column employee details section
  const buildEmployeeDetails = () => {
    const createDetailLine = (label: string, value: any) => ({
      columns: [
        { text: `${label}`, width: 'auto' },
        { text: ':', width: 10, alignment: 'center' },
        { text: value || '____________________', bold: true, decoration: 'underline' }
      ],
      margin: [0, 0, 0, 6] // a little space between lines
    });

    return {
      columns: [
        {
          width: '50%',
          stack: [
            createDetailLine('Employee Name', formValue.employeeName),
            createDetailLine('Designation', formValue.designation),
            createDetailLine('Date of Joining', formatDate(formValue.dateOfJoining)),
            createDetailLine('Date of Resignation', formatDate(formValue.dateOfResignation)),
          ]
        },
        {
          width: '50%',
          stack: [
            createDetailLine('Employee Code', formValue.employeeCode),
            createDetailLine('Department', formValue.department),
            createDetailLine('HoD/ RO', formValue.hodRo),
            createDetailLine('Last Working Day', formatDate(formValue.lastWorkingDay)),
          ]
        }
      ],
      margin: [0, 15, 0, 20] // margin around the details block
    };
  };

  // Helper to build the main clearance table, matching the image's structure
  const buildClearanceTable = () => {
    const tableHeader = [
      { text: 'Department', style: 'tableHeader' },
      { text: 'Assets / Item Description', style: 'tableHeader' },
      { text: 'Remarks (Y/N)', style: 'tableHeader' },
      { text: 'Verification/ Remarks by HoD', style: 'tableHeader' },
    ];

    const tableBody: any[][] = [tableHeader];
    
    // This logic assumes `this.departmentKeys` and `this.groupedItems` are available
    this.departmentKeys.forEach(deptKey => {
      const itemsInDept = this.groupedItems[deptKey];
      let itemCounter = 1; // Counter to re-number items for each section

      itemsInDept.forEach((item: any, index: number) => {
        let row = [];

        // Check for special subheading row like "Office assets"
        if (item.asset_item && item.asset_item.toLowerCase() === 'office assets') {
            // This is a subheading row, it spans across multiple columns
            // It doesn't have a department, so the first cell is also part of the span.
            row.push(
                {}, // Placeholder for Department column
                { text: item.asset_item, bold: true, colSpan: 3, alignment: 'left', margin: [2, 2, 2, 2] },
                {},
                {}
            );
            tableBody.push(row);
            itemCounter = 1; // Reset counter after subheading
            return; // Skip to the next item in the loop
        }

        // For the first REAL item in a group, add the department name with a rowspan
        if (index === 0) {
          row.push({
            text: item.department_name,
            bold: true,
            rowSpan: itemsInDept.length,
            alignment: 'center',
            margin: [0, 5, 0, 5]
          });
        } else {
          // For subsequent items, add an empty cell because of the rowspan
          row.push({});
        }
        
        // Get the corresponding form data for this row
        const clearanceItemData = formValue.clearanceItems[item.originalIndex];

        // Add the rest of the columns
        row.push(
          { text: `${itemCounter}. ${item.asset_item}`, margin: [5, 2, 2, 2] },
          { text: clearanceItemData.status || '', alignment: 'center', margin: [2, 2, 2, 2] },
          { text: '', margin: [2, 2, 2, 2] } // Empty column for "Verification"
        );
        
        tableBody.push(row);
        itemCounter++; // Increment for the next numbered item
      });
    });

    return {
      table: {
        widths: ['20%', '*', '15%', '25%'],
        body: tableBody,
      },
    };
  };

  // =================================================================
  // PDF DOCUMENT DEFINITION
  // =================================================================
  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    content: [
      // ---------- PDF Header ----------
      {
        text: 'National e-Governance Division (NeGD) / Digital India Corporation (DIC)',
        style: 'orgHeader'
      },
      {
        text: 'EXIT CLEARANCE FORM',
        style: 'formHeader'
      },

      // ---------- Employee Details Section ----------
      buildEmployeeDetails(),

      // ---------- Clearance Table Section ----------
      buildClearanceTable(),

      // ---------- Signatures Section ----------
      {
          columns: [
              {
                  stack: [
                      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 220, y2: 5, lineWidth: 0.5 }], margin: [0, 50, 0, 0] },
                      { text: 'Employee Signature', bold: true, margin: [0, 2, 0, 0] },
                      { text: `Date: ____________________`, margin: [0, 15, 0, 0] }
                  ]
              },
              {
                  stack: [
                      { canvas: [{ type: 'line', x1: 0, y1: 5, x2: 220, y2: 5, lineWidth: 0.5 }], margin: [0, 50, 0, 0] },
                      { text: 'HR Department Signature', bold: true, margin: [0, 2, 0, 0] }
                  ]
              }
          ]
      }
    ],

    // Re-usable styles to match the document
    styles: {
      orgHeader: { fontSize: 14, bold: true, alignment: 'center' },
      formHeader: { fontSize: 12, bold: true, alignment: 'center', decoration: 'underline', margin: [0, 2, 0, 20] },
      tableHeader: { bold: true, fontSize: 10, color: 'black', alignment: 'center', fillColor: '#eeeeee', margin: [2, 4, 2, 4] },
    },
  };

  // Generate and download the PDF
  const fileName = `Exit-Clearance-${formValue.employeeCode || 'Employee'}.pdf`;
  pdfMake.createPdf(docDefinition).download(fileName);
}
}