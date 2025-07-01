import { Component } from '@angular/core';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})
export class ReportComponent {

  access_rights: any;
  payroll_report: any = [];
  statutory_report: any = [];
  dec_invstment_report: any = [];
  attendance_report: any = [];
  taxes_form_report: any = [];
  leave_report: any = [];
  asset_report: any = [];
  visitor_report: any = [];
  Esic_and_UAN_report: any = [];
  Miscellaneous_report: any = [];
  is_insufficient_fund: boolean = false;
  showSidebar: boolean = true;

  ngOnInit(): void {
    this.getReportsModule();

  }
  getReportsModule() {

    // this.access_rights = JSON.parse(localStorage.getItem('access_rights'));
    // console.log(this.access_rights);
    // for (let idx = 0; idx < this.access_rights.length; idx++) {
    //   if (this.access_rights[idx].module_category === 'Attendance Report' &&
    //     this.access_rights[idx].moduleid === 60 &&
    //     this.access_rights[idx].modulename === 'Check-In/Check Out Report') {
    //     this.attendance_report.push({
    //       modulename_display: this.access_rights[idx].modulename,
    //       linkname: this.access_rights[idx].linkname
    //     })
    //   }
    //   // leave_report
    //   else if (this.access_rights[idx].module_category == 'Leave Reports' && this.access_rights[idx].moduleid === 69 || this.access_rights[idx].moduleid === 70) {
    //     this.leave_report.push({
    //       modulename_display: this.access_rights[idx].modulename,
    //       linkname: this.access_rights[idx].linkname
    //     })
    //   }
    // }
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

}
