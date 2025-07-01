import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { EmployeeManagementService } from '../employee-management.service';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { ReportService } from '../../reports/report.service';
import { RecruitService } from '../../recruit/recruit.service';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import { EmployeeService } from '../../employee/employee.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-preview-pdf',
  templateUrl: './preview-pdf.component.html',
  styleUrls: ['./preview-pdf.component.css']
})
export class PreviewPdfComponent {
  token: any;
  tp_account_id: any;
  product_type: string;
  letterType: any;
  templateid: any;
  templateData: any = '';
  isTemplate: any;
  employer_profile: any = {};
  salaryStructure: any;
  isGratuity: boolean;
  isGrpInsuranceAllowed: string;
  isGrpInsurance: boolean;
  employeeInsurance: any;
  isShowSalaryTable: boolean;
  isEmployerGratuity: boolean;
  edli_adminchargesincludeinctc: any;
  safeTemplateData: SafeHtml;

  constructor(
    private route: ActivatedRoute,
    private _encrypterService: EncrypterService,
    private _employeemgmtService: EmployeeManagementService,
    private _sessionService: SessionService,
    private _ReportService: ReportService,
    private _recruitService: RecruitService,
    private _faceCheckinService: FaceCheckinService,
    private _EmployeeService: EmployeeService,
    private sanitizer: DomSanitizer
  ) {
    this.route.params.subscribe(params => {
      let template = this._encrypterService.aesDecrypt(params.id);
      this.isTemplate = template.split(',')[0];
      this.letterType = template.split(',')[1];
      this.templateid = template.split(',')[2];
      // console.log(this.isTemplate, this.letterType, this.templateid);
    });

  }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session()
    );
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.get_Employer_Profile();
    
    if (this.isTemplate == 'template') {
      this.getLetterTemplate();
    } else if (this.isTemplate == 'filled') {
      this.getTemplateById();
    }
    //  else if (this.isTemplate == 'candidate') {
    // } 
    else if (this.isTemplate == 'filledwithannexure') {
      this.getTemplateById();
      this.getSalaryStructure();
    } else if (this.isTemplate == 'candidate') {

      
      this.getAllCandidates();
    } else if (this.isTemplate == 'policy') {
      this.getPolicyListByid()
    }
    console.log("hedojhfeohroewuhroweu>",this.isTemplate);
    console.log("letterType>",this.letterType);
  }

  get_Employer_Profile() {
    this._ReportService.getEmployerProfile({
      customeraccountid: (this.tp_account_id),
      productTypeId: this.product_type,
    })
      .subscribe((resData: any) => {
        if (resData.statusCode) {
          // this.employer_profile = resData.commonData;

          // this.cur_payout_day = this.employer_profile.payout_frequency_dt;
          //     this.employer_name= this.employer_profile.full_name,
          //     this.company_name= this.employer_profile.company_name;
          //     this.user_type= this.employer_profile.user_type,
          //     this.employer_mobile= this.employer_profile.employer_mobile,
          //     this.employer_email= this.employer_profile.employer_email,
          //     this.registered_address= (this.employer_profile.company_address).trim(),
          //     this.billing_address= this.employer_profile.bill_address + '  ' + this.employer_profile.bill_city + '  ' + this.employer_profile.bill_pincode + '  ' + this.employer_profile.bill_state,
          //     this.payout_date= this.employer_profile.payout_frequency_dt + ' date of every month'

        } else {
          this.employer_profile = {};
          // this.toastr.error(resData.message, 'Oops!');
        }
      });
  }

  getTemplateById() {
    let postData = {
      productTypeId: this.product_type,
      customerAccountId: this.tp_account_id.toString(),
      empId: this.letterType,
      templateId: this.templateid
    }
    this._employeemgmtService.getLetterTemplateId(postData).subscribe((resData: any) => {
      if (resData.statusCode) {
        let template = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData))[0];
        this.templateData = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData))[0].templatetext;
        this.safeTemplateData = this.sanitizer.bypassSecurityTrustHtml(this.templateData);
        // console.log("templateData---------", this.templateData);
        this.employer_profile = {
          ...this.employer_profile,
          header: template.header,
          footer: template.footer
        };
      }
    })
  }

  getLetterTemplate() {
    this._employeemgmtService.getMasterLetters({
      'productTypeId': this.product_type, 'customerAccountId': this.tp_account_id.toString(),
      'lettersType': this.letterType, 'letterId': this.templateid
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        let template = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData))[0];
        this.templateData = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData))[0].template_html;
        this.safeTemplateData = this.sanitizer.bypassSecurityTrustHtml(this.templateData);
        // console.log("templateData---------", this.templateData);
        this.employer_profile = {
          ...this.employer_profile,
          header: template.header,
          footer: template.footer
        };
        // this.employer_profile['footer'] = template.footer;
      }
    })
  }

  getAllCandidates() {
    let obj = {
      action: 'get_candidate',
      customeraccountid: this.tp_account_id.toString(),
      searchInput: '',
      joiningDate: null,
      department: null,
      offer_status: null,
      page: 1,
      limit: 10,
      candidateid: this.letterType
    };
    this._recruitService.getAllCandidateList(obj).subscribe((resp: any) => {
      console.log("resp", resp);
      if (resp.statusCode) { 
        let template = JSON.parse(this._encrypterService.aesDecrypt(resp.commonData))[0];

        this.templateData = JSON.parse(this._encrypterService.aesDecrypt(resp.commonData))[0].offer_letter_data.attachment;
        this.safeTemplateData = this.sanitizer.bypassSecurityTrustHtml(this.templateData);
        // console.log("templateData---------", this.templateData);

        this.employer_profile = {
          ...this.employer_profile,
          header: template.header,
          footer: template.footer
        };

      }
    });
  }


  printCardContent() {
    const printContent = document.getElementById('printableCard').innerHTML;
    // console.log(printContent);

    // const orignalCntnt = printContent;
    // w.document.body.innerHTML=orignalCntnt;
    // w.window.print();
    // w.window.close();

    const printWindow = window.open('', '');
    printWindow.document.title = '';
    printWindow.document.write('<html><head>');
    // printWindow.document.write('<link rel="stylesheet" href="assets/css/style.css">');

    // Include styles inline
    const styles = document.getElementsByTagName('style');
    for (let i = 0; i < styles.length; i++) {
      printWindow.document.write(styles[i].outerHTML);
    }

    printWindow.document.write(`</head><style>.table{ width:100% !important; margin-bottom: 20px; }.table>thead>tr>th {vertical-align: bottom; border-bottom: 2px solid #ddd;}.danger3 td, .danger3 th {  background: #337ab7 !important; color: #fff;}.d-flex.justify-content-between.align-items-center {display: flex;  justify-content: center; align-items: center; width: 100%;}.d-flex.justify-content-between.align-items-center .col-md-4 {width: 33.33%;  padding: 10px;}.table>tbody>tr>td, .table>tbody>tr>th, .table>tfoot>tr>td, .table>tfoot>tr>th, .table>thead>tr>td, .table>thead>tr>th {  padding: 8px;  line-height: 1.42857143; vertical-align: top;border-top: 1px solid #ddd;}.table tr.danger1 th {text-align: left;font-weight: 600;}table.table thead tr th {text-align: left;} .d-flex.justify-content-between.align-items-center .col-md-4 strong {font-size: 12px;}</style><body>`);

    // Write the content to the new window
    printWindow.document.write(printContent);
    printWindow.document.write('</body></html>');

    var printStyle = `<style>  @media print {.page-break {page-break-before: always;}.manage-list-row .job-details {display: inline-block;font-size: 16px;display: flex;flex-wrap: wrap;align-items:center;} .light-skyblue{background:lightblue}.white{background:white}.export-button{background-color:#72ee74;color:white;border:0;padding:10px 20px;text-align:center;text-decoration:none;display:inline-block;font-size:10px;margin:4px 2px;cursor:pointer;border-radius:4px}.dropdown.float-right-box ul#menu3{left:-52px}.top-right-outer-box{display:flex;justify-content:flex-start}.form-check{padding-top:10px}.form-check .form-check-input{height:20px;width:20px;vertical-align:text-bottom;margin:3px 5px 0 0}.table-responsive.reports-table-outer-box thead{background:#1669b6 !important;color:#fff}table.table-striped td{border:1px solid black;padding:2px;border-collapse:collapse;color:#000}.brd-top{border-top:none !important}.brd-btm{border-bottom:none !important}*{-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box}.text-left{text-align:left}table.salary-slip-logo-box{vertical-align:text-bottom}.salary-slip-logo-box{padding:20px}.salary-slip-address-box{text-align:right;float:right;max-width:300px;padding:20px}.salary-slip-address-box p{font-weight:600;font-size:12px;margin-bottom:5px}.Salary-Slip-month-title-box h4{width:100%;text-align:center;display:block;padding-bottom:30px;font-weight:500;font-size:22px}p.print-btn-box.text-right{position:absolute;top:-45px;right:0}.table-responsive.reports-table-outer-box table tr td,.table-responsive.reports-table-outer-box table tr th{padding:4px !important;font-size:12px}} </style>`;
    printWindow.document.head.insertAdjacentHTML('beforeend', printStyle);


    // Close the document
    printWindow.document.close();
    // Trigger the print dialog
    printWindow.print();
  }

  getPolicyListByid() {
    this._faceCheckinService.getemployeeList({
      "action": "get_policies_trn",
      "customeraccountid": this.token.tp_account_id.toString(),
      "emp_code": '',
      "organization_unitid": this.templateid,
      "keyword": "",
      "fromdate": "",
      "todate": ""
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        let template = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData))[0];
        this.templateData = template.policies_text;
        this.safeTemplateData = this.sanitizer.bypassSecurityTrustHtml(this.templateData);
        this.employer_profile = {
          ...this.employer_profile,
          header: template.header,
          footer: template.footer
        };
        // this.policyList = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
        // this.policyType = this.policyList[0].policies_type;

      } else {
        // this.policyList= [];
      }
    })
  }
  getSalaryStructure() {
    this._EmployeeService.getSalaryStructure({
      'productTypeId': this._encrypterService.aesEncrypt(this.product_type),
      'customerAccountId': this._encrypterService.aesEncrypt(this.tp_account_id.toString()), 'empId':
        this._encrypterService.aesEncrypt(this.letterType),
      'salaryMode': 'Custom'
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.salaryStructure = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));

        this.isGratuity = this.salaryStructure.gratuity == '' || (this.salaryStructure.gratuity != '' && Math.round(this.salaryStructure.gratuity) == 0) ? false : true;

        let date = !this.salaryStructure.effectivefrom ? '' : (this.salaryStructure.effectivefrom.substring(0, 10).split('/')[1] + '/' +
          this.salaryStructure.effectivefrom.substring(0, 10).split('/')[0] + '/' +
          this.salaryStructure.effectivefrom.substring(0, 10).split('/')[2]);


        if (this.isGrpInsuranceAllowed == 'Y') {
          this.isGrpInsurance = this.salaryStructure.isgroupinsurance == 'Y' ? true : false;
          if (this.isGrpInsurance) {

            this.employeeInsurance = this.salaryStructure.insuranceamount;
            this.employeeInsurance = this.salaryStructure.employerinsuranceamount;

          }
        }

        // this.calculateSal();

        this.isShowSalaryTable = true;
        this.isEmployerGratuity = this.salaryStructure.employergratuityopted != 'N' ? true : false;
        this.edli_adminchargesincludeinctc = this.salaryStructure.edli_adminchargesincludeinctc;

        // if(this.candidateDetails.joiningStatus=='RESTRUCTURE' && localStorage.getItem('restructureMode')=='CustomRestructureMode'){
        //   this.getuspccalcgrossfromctc_withoutconveyance();
        // }

        this.salaryStructure['ctcAnnual'] = Math.round(this.salaryStructure['ctc'] * 12);
        this.salaryStructure['inHandAnnual'] = Math.round(this.salaryStructure['salaryinhand'] * 12);
        this.salaryStructure['grossAnnual'] = Math.round(this.salaryStructure['gross'] * 12);
        this.salaryStructure['total'] = (parseFloat(this.salaryStructure.gross) + parseFloat(this.salaryStructure.bonus || '0') + parseFloat(this.salaryStructure.employerepfrate || '0') + parseFloat(this.salaryStructure.employeresirate || '0') + parseFloat(this.salaryStructure.employerlwf || '0') + parseFloat(this.salaryStructure.employergratuity || '0')
          + parseFloat(this.salaryStructure.mealvouchers || '0') + parseFloat(this.salaryStructure.medicalinsurancepremium || '0') + parseFloat(this.salaryStructure.teaallowances || '0')) + parseFloat(this.salaryStructure.employerinsuranceamount || '0');

        this.salaryStructure['totalAnnual'] = Math.round(this.salaryStructure['total'] * 12)
        this.salaryStructure['total'] = Math.round(this.salaryStructure['total'])

        if (this.salaryStructure && typeof this.salaryStructure === 'object') {
          for (const key in this.salaryStructure) {
            if (typeof Math.round(this.salaryStructure[key]) === 'number' && !Number.isNaN(Math.round(this.salaryStructure[key]))) {

              this.salaryStructure[key] = Math.round(this.salaryStructure[key]);
            }
          }
        }

        const exclusions = [
          'Conveyance Allowance',
          'Medical',
          'Bonus',
          'Meal Vouchers',
          'Medical Insurance Premium',
          'Tea Allowances'
        ];

        this.salaryStructure['OtherDeductions'] = [
          {
            'deduction_name': 'Salary Bonus',
            'deduction_amount': this.salaryStructure.salarybonus
          },
          {
            'deduction_name': 'Commission',
            'deduction_amount': this.salaryStructure.commission
          },
          {
            'deduction_name': 'Transport Allowance',
            'deduction_amount': this.salaryStructure.transport_allowance
          },
          {
            'deduction_name': 'Travelling Allowance',
            'deduction_amount': this.salaryStructure.travelling_allowance
          },
          {
            'deduction_name': 'Leave Encashment',
            'deduction_amount': this.salaryStructure.leave_encashment
          },
          {
            'deduction_name': 'Gratuity In Hand',
            'deduction_amount': this.salaryStructure.gratuityinhand
          },
          {
            'deduction_name': 'Overtime Allowance',
            'deduction_amount': this.salaryStructure.overtime_allowance
          },
          {
            'deduction_name': 'Notice Pay',
            'deduction_amount': this.salaryStructure.notice_pay
          },
          {
            'deduction_name': 'Hold Salary (Non Taxable)',
            'deduction_amount': this.salaryStructure.hold_salary_non_taxable
          },
          {
            'deduction_name': 'Children Education Allowance',
            'deduction_amount': this.salaryStructure.children_education_allowance
          },
          ...(this.salaryStructure.OtherDeductions && this.salaryStructure.OtherDeductions.trim() !== ""
            ? JSON.parse(this.salaryStructure.OtherDeductions).filter((deduction: any) =>
              !exclusions.includes(deduction.deduction_name)
            )
            : [])
        ];
        // let template = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData))[0];<!-- This adds 50 non-breaking spaces -->
        this.templateData += `<style>.table {
    width: 100% !important;
    max-width: 100% !important;;
    margin-bottom: 20px !important;
    padding:10px !important;
}</style>
        ${'\u00A0'.repeat(500)} 
        <div class="page-break"></div>
       <center><b>ANNEXURE-A</b></center>${'\u00A0'.repeat(500)}
<div class="table-responsive" *ngIf="salaryStructure != ''">
    <table class="table" style="width: 100%;margin-bottom:20px;">
        <thead>
            <tr>
                <th>Salary Bucket11xx</th>
                <th>Monthly</th>
                <th>Annually</th>
            </tr>
        </thead>
        <tbody id="roundedValues">
            
            <tr class="danger1">
                <th colspan="3">1. GROSS SALARY</th>
            </tr>
            <tr class="danger1">
                <td scope="col">Basic</td>
                <td>${this.salaryStructure.basic}</td>
                <td>${this.salaryStructure.basic * 12}</td>
            </tr>
            <tr class="danger1">
                <td scope="col">HRA</td>
                <td>${this.salaryStructure.hra}</td>
                <td>${this.salaryStructure.hra * 12}</td>
            </tr>
             
            
            ${this.salaryStructure.allowances && this.salaryStructure.allowances != '0' ? `
            <tr class="danger1">
                <td scope="col">Special Allowance</td>
                <td>${this.salaryStructure.allowances}</td>
                <td>${this.salaryStructure.allowances * 12}</td>
            </tr>` : ''}

            ${this.salaryStructure.conveyance_allowance && this.salaryStructure.conveyance_allowance != '0' ? `
            <tr class="danger1">
                <td scope="col">Conveyance Allowance</td>
                <td>${this.salaryStructure.conveyance_allowance}</td>
                <td>${this.salaryStructure.conveyance_allowance * 12}</td>
            </tr>` : ''}

            <tr class="danger3">
                <td>Salary Bucket Total</td>
                <td>${this.salaryStructure.ctc}</td>
                <td>${this.salaryStructure.ctcAnnual}</td>
            </tr>
            <tr class="danger3">
                <td>Salary In Hand</td>
                <td>${this.salaryStructure.salaryinhand}</td>
                <td>${this.salaryStructure.inHandAnnual}</td>
            </tr>
        </tbody>
    </table>
    <div class="row">
        <div class="col-md-12">
            <div class="d-flex justify-content-between align-items-center">
                <div class="col-md-4">
                    <label><strong>Effective Date : &nbsp;</strong></label>
                    <span class="ml-2">${this.salaryStructure.effectivefrom ? this.salaryStructure.effectivefrom.substring(0, 10) : ''}</span>
                </div>
                <div class="col-md-4">
                    <label><strong>Professional Tax Applied : &nbsp;</strong></label>
                    <span class="ml-2">${this.salaryStructure.is_professional_tax_applied}</span>
                </div>
                <div class="col-md-4">
                    <label><strong>LWF Applied :&nbsp;</strong></label>
                    <span class="ml-2">${this.salaryStructure.is_lwf_applied}</span>
                </div>
            </div>
        </div>
    </div>
</div>
`;


        console.log(this.templateData);

      } else {
        this.salaryStructure = '';
      }
    })
  }

}
