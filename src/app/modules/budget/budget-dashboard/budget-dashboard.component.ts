import { Component } from '@angular/core';
import { FaceCheckinService } from '../../attendance/face-checkin.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { debounceTime } from 'rxjs';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
declare var $: any;
@Component({
  selector: 'app-budget-dashboard',
  templateUrl: './budget-dashboard.component.html',
  styleUrls: ['./budget-dashboard.component.css']
})
export class BudgetDashboardComponent {
  token: any;
  product_type: string;
  localdata: any;
  project_master_list_data: any;
  formattedValue: string;

  constructor(
    private _encrypterService: EncrypterService,
    private _faceCheckinService: FaceCheckinService,
    private _sessionService: SessionService,
  ) { }
  tp_account_id: any;
  projectList: any;
  showSidebar: boolean = true;
  toggle() {
    this.showSidebar = !this.showSidebar;
  }
  chartData: any[] = [];



  view: [number, number] = [500, 300]; // width, height
  showXAxis = true;
  showYAxis = true;
  showLegend = false;
  showXAxisLabel = true;
  xAxisLabel = 'Project (Year)';
  showYAxisLabel = true;
  yAxisLabel = 'Budget (₹)';
  colorScheme = {
    domain: ['#4e79a7', '#f28e2b', '#e15759', '#76b7b2', '#59a14f', '#edc949']
  };

  // view1: any[] = [300, 300]; // Size of the chart
  // speed = 70; // Speed value
  // maxSpeed = 200; // Max value of speedometer

  // Define the speed data
  // gaugeData = [
  //   { name: 'Current Speed', value: 70 },
  //   { name: 'Remaining', value: 30 }
  // ];
  // speed = 75;

  // Color scheme for the chart
  colorScheme1 = {
    domain: ['#00FF00', '#D3D3D3']
  };
  // speed: number = 50;  // Initial speed
  maxSpeed: number = 100;  // Maximum speed for the gauge

  budgetList = [];
  speed = 0; // Default value for the speedometer
  ngOnInit(): void {
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    const currentFinYear = this.getCurrentFinancialYear();
    console.log('Current Financial Year:', currentFinYear);
    this.getProjectList();
    this.getbudgetList(0, 0);
    this.setSpeed(5);
  }
  setSpeed(index: number) {
    const selectedBudget = this.budgetList[index]; // Change the index as needed
    this.speed = selectedBudget.budget_amount; // Dynamically setting the value for the speedometer
    this.formattedValue = this.formatAmount(this.speed);  // e.g., '2M'

    // Method to format the amount in a readable way

  }
  formatAmount(amount: number): string {
    if (amount >= 1000000) {
      return (amount / 1000000).toFixed(1) + 'M';  // Format to 'M' for millions
    } else if (amount >= 1000) {
      return (amount / 1000).toFixed(1) + 'K';  // Format to 'K' for thousands
    }
    return amount.toString();  // Return the number if it's less than 1000
  }
  fychage(e: any) {
    // console.log(e);

    this.getbudgetList(e, $('#project').val());

  }
  projectchage(e: any) {
    // console.log(e);

    this.getbudgetList($('#fy').val(), e);

  }
  getbudgetList(fy: any = '', project: any) {
    console.log(fy, project);

    this._faceCheckinService.getemployeeList({
      "action": "mst_budget_list",
      "customeraccountid": this.tp_account_id.toString(),
      "emp_code": "",
      "organization_unitid": "",
      "keyword": '',
      "fromdate": "",
      "todate": ""
    }).pipe(debounceTime(100)).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.projectList = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
        this.budgetList = this.projectList;
        console.log(this.projectList);

        if (fy != 0 && project != 0) {

          this.localdata = this.projectList.filter(x => x.fin_year === fy.toString() && x.project_id.toString() === project.toString());
        } else if (fy == 0 && project != 0) {

          this.localdata = this.projectList.filter(x => x.project_id.toString() === project.toString());
        } else if (fy != 0 && project == 0) {
          this.localdata = this.projectList.filter(x => x.fin_year === fy.toString());
        } else {
          this.localdata = this.projectList;
        }

        this.chartData = this.localdata.map(item => ({
          name: `${item.project_name} (${item.fin_year})`,
          value: item.budget_amount
        }));
      } else {
        this.projectList = [];
      }
    })
  }
  getCurrentFinancialYear(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1; // JS months are 0-indexed

    if (month >= 4) {
      // Financial year starts in April
      return `${year}-${year + 1}`;
    } else {
      // Jan, Feb, March → part of the previous financial year
      return `${year - 1}-${year}`;
    }
  }

  getProjectList() {
    this._faceCheckinService.getemployeeList({
      "action": "mst_project_list",
      "customeraccountid": this.tp_account_id.toString(),
      "emp_code": "",
      "organization_unitid": "",
      "keyword": "",
      "fromdate": "",
      "todate": ""
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.project_master_list_data = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
        console.log(this.project_master_list_data);

      } else {
        this.project_master_list_data = [];
      }
    })
  }


}
