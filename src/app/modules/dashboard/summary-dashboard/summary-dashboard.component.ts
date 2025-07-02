import { Component, ElementRef, Renderer2, ViewChild } from '@angular/core';
import { LoginService } from '../../login/login.service';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { SidebarComponent } from 'src/app/components/core/sidebar/sidebar.component';
import { EmployeeService } from '../../employee/employee.service';
import { Router } from '@angular/router';
import { dongleState, grooveState } from 'src/app/app.animation';
import { BroadcasterService } from '../../broadcaster/broadcaster.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { ReportService } from '../../reports/report.service';
declare var $: any;

@Component({
  selector: 'app-company-details',
  templateUrl: './summary-dashboard.component.html',
  styleUrls: ['./summary-dashboard.component.css'],
  animations: [grooveState, dongleState]
})
export class SummaryDashboardComponent {

  showSidebar: boolean = true;
  tp_account_id: any;
  decoded_token: any;
  product_type: any;
  geo_location_id: any;
  ouIds: any;
  get_employee_list_data: any = [];
  get_employee_attendance_data: any = [];
  get_employee_birthday_data: any = [];
  get_employee_leave_data: any = [];
  get_employee_holidays_data: any = [];
  @ViewChild(SidebarComponent, { static: true }) sidebarComponent!: any;
  @ViewChild('sideMenu', { static: true }) sideMenuElement!: ElementRef;
  emp_joining_pending_cnt: any = [];
  state_master_data: any = [];
  sel_state: string;
  org_data: any = [];
  geo_fencing_list_data: any = [];
  geo_fencing_list_data_count: number = 0;
  showBirthdayModal: boolean = false;
  @ViewChild('fileInput') fileInput!: ElementRef;
  saved_birthday_img_urls: any = [];
  selected_birthday_img_url_idx: any = -1;
  uploaded_birthday_img_base64: any = '';
  uploaded_birthday_img_name: any = '';
  action: any = '';
  showSaveNotificationsPopup: boolean = false;
  Save_Notification_Form: FormGroup;
  audienceDropdownSettings: any = {};
  Audience_list_data: any = [];
  Audience_list_data_original: any = [];
  deptDropdownSettings: {};
  deptList: any = [];
  deptName: any = [];
  maxCharacters = 500;
  isProduction = false;
  addImage:boolean = false;

  view: any[] = [700, 400];
  colorScheme = {
    domain: ['#5AA454', '#C7B42C', '#AAAAAA', '#FF5722', '#00BCD4']
  };
  dropdownSettings: any = {};

  public config: any = {
    height: 150, // Editor height
    toolbar: [
      ['insert', ['link']], // Hyperlink
      ['para', ['ul', 'ol', 'paragraph']], // Paragraph options
    ],
    placeholder: 'Type your notification here...',
    callbacks: {
      onKeyup: () => this.limitTextLength(),
    },
  };
  sanitizedDescriptions: { [key: string]: SafeHtml } = {};
  remainingChars: number = 500;
  dept_and_desg_wisedata: any;
  desg_wisedata: any;
  funcdesg_wisedata: any;
  proj_wisedata: any;

  dashboard_settings: any = null;

  constructor(
    private _loginService: LoginService,
    private _sessionService: SessionService,
    private renderer: Renderer2,
    private router: Router,
    private _employeeService: EmployeeService,
    private broadcasterService: BroadcasterService,
    private _EncrypterService: EncrypterService,
    private toastr: ToastrService,
    private _formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private _ReportService: ReportService

  ) { }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    // console.log("decoded_token", this.decoded_token)
    this.tp_account_id = this.decoded_token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.geo_location_id = this.decoded_token.geo_location_id;
    this.ouIds = this.decoded_token.ouIds;
    this.sel_state = this.decoded_token.state.toUpperCase();
    this.isProduction = environment.production;
    this.audienceDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'audiencename',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 6,
      allowSearchFilter: true
    };

    this.Save_Notification_Form = this._formBuilder.group({
      action: ['', [Validators.required]],
      startDate: ['', [Validators.required]],
      endDate: ['', [Validators.required]],
      notificationAudienceIds: [[], [Validators.required]],
      campaignName: ['', [Validators.required]],
      notificationDescription: ['', [Validators.required, Validators.maxLength(500)]],
      notificationTitle: ['', [Validators.required]],
      campaignId: [''],

      emp_name: [''],
      company_name: [''],
      birthday_msg: ['May this year be filled with opportunities, challenges met, and continued professional success.'],

      selected_emp_js_id: [''],
      selected_emp_id: [''],
      post_offered: ['']
    });

    this.Save_Notification_Form.get('notificationDescription')?.valueChanges.subscribe((value: string) => {
      this.remainingChars = 500 - (value?.length || 0);
    });


    this.getStateMaster();

    if (this.decoded_token?.isEmployer == '1') {
      this.get_employee_list(); 
      this.get_employee_attendance(); 
      this.get_employee_birthday(); 
      this.get_employee_leave(); 
      this.get_employee_holidays(); 
      this.get_data_forpiachart(); 
    }

    this.Get_AudienceList();
    this.get_att_dept_master_list();

    if (this.decoded_token?.sub_userid != '') {
      this.getDashboardSettingData();
    }
    
    


    this.deptDropdownSettings = {
      singleSelection: false,
      idField: 'posting_department',
      textField: 'posting_department',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      allowSearchFilter: true,
    };
  }

  get_data_forpiachart() {
    this._employeeService.get_emp_dpt_count({
      action: 'get_emp_dpt_count',
      accountId: (this.tp_account_id),
      p_ou_locationid: this.decoded_token.geo_location_id,
      ouIds: this.decoded_token.ouIds,
    }).subscribe({
      next: (resData: any) => {
        //console.log(resData);

        if (resData.statusCode) {
          //console.log(resData);
          this.dept_and_desg_wisedata = resData.commonData[0].summary_json.department_summary.map(d => ({
            name: `${d.posting_department ?? 'Unknown'} (${d.emp_count})`,
            value: Number(d.emp_count),
            dept_id: Number(d.department_id),
            dept_name: d.posting_department ?? 'Unknown'
          }));
          this.desg_wisedata = resData.commonData[0].summary_json.post_summary.map(d => ({
            name: `${d.post_offered ?? 'Unknown'} (${d.emp_count})`,
            value: Number(d.emp_count),
            desg_id: Number(d.designation_id),
            desg_name: d.post_offered ?? 'Unknown'
          }));
          this.funcdesg_wisedata = resData.commonData[0].summary_json.functional_count.map(d => ({
            name: `${d.functional_designation ?? 'Unknown'} (${d.emp_count})`,
            value: Number(d.emp_count),
            funcdesg_name: d.functional_designation ?? 'Unknown'
          }));
          this.proj_wisedata = resData.commonData[0].summary_json.projectwise_count.map(d => ({
            name: `${d.project_title ?? 'Unknown'} (${d.emp_count})`,
            value: Number(d.emp_count),
            proj_id: Number(d.project_id),
            proj_name: d.project_title ?? 'Unknown'
          }));
          //this.dept_and_desg_wisedata = resData.commonData[0].summary_json.department_summary;
          //console.log(resData.commonData[0].summary_json.department_summary);

        } else {
          console.log(resData.message, 'Oops!');
        }
      }
    })

  }
  get_att_dept_master_list() {
    this._ReportService.GetMaster_Dropdown({
      "actionType": "GetPostingDepartments",
      "productTypeId": this.product_type,
      "customerAccountId": this.tp_account_id.toString(),
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.deptList = resData.commonData;
      } else {
        this.deptList = [];
      }
    });
  }
  onSliceSelect(data: any) {
    // console.log('Slice clicked:', data);
    // this.router.navigate(['/dashboard/employee-details', { queryParams: { country: data.name } }]);
    const selected = this.dept_and_desg_wisedata.find(d => d.name === data.name);
    //console.log(selected);

    this.router.navigate(['/dashboard/employee-details'], {
      state: {
        department: selected.dept_name,
        department_id: selected.dept_id
      }
    });
  }
  onSliceSelectdesg(data: any) {
    const selected = this.desg_wisedata.find(d => d.name === data.name);
    //console.log(selected);

    this.router.navigate(['/dashboard/employee-details'], {
      state: {
        desg_name: selected.desg_name,
        desg_id: selected.desg_id
      }
    });
  }
  onSliceSelectfuncdesg(data: any) {
    const selected = this.funcdesg_wisedata.find(d => d.name === data.name);
    //console.log(selected);

    this.router.navigate(['/dashboard/employee-details'], {
      state: {
        funcdesg_name: selected.funcdesg_name
      }
    });
  }
  onSliceSelectproj(data: any) {
    const selected = this.proj_wisedata.find(d => d.name === data.name);
    //console.log(selected);

    this.router.navigate(['/dashboard/employee-details'], {
      state: {
        proj_name: selected.proj_name,
        proj_id: selected.proj_id
      }
    });
  }

  hideSideMenu(): void {
    const sideMenu = this.sidebarComponent.elementRef.nativeElement.querySelector('.navbar-default.sidebar');
    if (sideMenu) {
      this.renderer.setStyle(sideMenu, 'display', 'none');
    }
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get_employee_list() {
    this._loginService.get_tpay_dashboard_data({
      "action": "get_employee_list",
      "accountId": this.tp_account_id,
      "geo_location_id": this.geo_location_id,
      "ouIds": this.ouIds
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.get_employee_list_data = resData.commonData[0];
          } else {
            this.get_employee_list_data = [];
          }
        }, error: (e) => {
          this.get_employee_list_data = [];
          //console.log(e);
        }
      })
  }
  get_employee_attendance() {
    this._loginService.get_tpay_dashboard_data({
      "action": "get_employee_attendance",
      "accountId": this.tp_account_id,
      "geo_location_id": this.geo_location_id,
      "ouIds": this.ouIds
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.get_employee_attendance_data = resData.commonData[0];
          } else {
            this.get_employee_attendance_data = [];
          }

        }, error: (e) => {
          this.get_employee_attendance_data = [];
          //console.log(e);
        }
      })
  }
  get_employee_birthday() {
    this._loginService.get_tpay_dashboard_data({
      "action": "get_employee_birthday",
      "accountId": this.tp_account_id,
      "geo_location_id": this.geo_location_id,
      "ouIds": this.ouIds
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.get_employee_birthday_data = resData.commonData;
            // console.log("DATATATATA", this.get_employee_birthday_data)
          } else {
            this.get_employee_birthday_data = [];
          }
        }, error: (e) => {
          this.get_employee_birthday_data = [];
          //console.log(e);
        }
      })
  }
  get_employee_leave() {
    this._loginService.get_tpay_dashboard_data({
      "action": "get_employee_leave",
      "accountId": this.tp_account_id,
      "geo_location_id": this.geo_location_id,
      "ouIds": this.ouIds
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.get_employee_leave_data = resData.commonData;
          } else {
            this.get_employee_leave_data = [];
          }

        }, error: (e) => {
          this.get_employee_leave_data = [];
          //console.log(e);
        }
      })
  }
  get_employee_holidays() {
    this._loginService.get_tpay_dashboard_data({
      "action": "get_employee_holidays",
      "accountId": this.tp_account_id,
      "geo_location_id": this.geo_location_id,
      "ouIds": this.ouIds,
      "state_name": this.sel_state
    })
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.get_employee_holidays_data = resData.commonData;
          } else {
            this.get_employee_holidays_data = [];
          }
        }, error: (e) => {
          this.get_employee_holidays_data = [];
          //console.log(e);
        }
      })
  }
  changeState(e: any) {
    // let val = e.target.value;
    this.sel_state = e.target.value;
    this.get_employee_holidays();
  }
  getStateMaster() {
    this._employeeService.getAll_state({})
      .subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            // Filter out records where the state contains "Zone"
            this.state_master_data = resData.commonData.filter(
              (state: any) => !state.state.toLowerCase().includes("zone")
            );
          } else {
            this.state_master_data = [];
          }
        },
        error: (e) => {
          this.state_master_data = [];
        }
      });
  }

  get_holiday_date(dt: any) {
    let split_dt = dt.split('-');
    return split_dt[2];
  }
  get_holiday_month(dt: any) {
    let split_dt = dt.split('-');
    let date = new Date(split_dt[0], split_dt[1] - 1, split_dt[2]);
    // console.log(date);
    return date.toLocaleDateString('default', { month: 'short' });

  }

  // employer_details() {

  //   this._EmployeeService
  //     .employer_details({
  //       customeraccountid: this.tp_account_id.toString(),
  //       productTypeId: this.product_type,
  //       GeoFenceId: this.decoded_token.geo_location_id,
  //       ouIds:this.ouIds
  //     })
  //     .subscribe((resData: any) => {
  //       if (resData.statusCode) {
  //         let employee_data = resData.commonData;
  //         //this._EncrypterService.aesDecrypt(resData.commonData);
  //         this.emp_joining_pending_cnt = 0;

  //         employee_data.map((el) => {
  //           // console.log(el.joiningstatus);
  //           if (el.joiningstatus.toLowerCase().includes('app link sent') ||
  //             el.joiningstatus.toLowerCase().includes('onboarding pending') ||
  //             el.joiningstatus.toLowerCase().includes('set up salary')) {
  //             this.emp_joining_pending_cnt++;
  //           }

  //         })
  //       }
  //     });
  // }

  routeToEmployee(status: any) {
    this.router.navigate(['/dashboard/employee-details'], { state: { 'status': status } });
    // localStorage.setItem('emp_status_filter', status);
  }

  routeToAttReport(status: any) {
    this.router.navigate(['/dashboard/att-report'], { state: { 'status': status } });
  }

  openBirthdayModal(data: any) {
    //console.log(data);
    this.showBirthdayModal = true;
    this.get_saved_birthday_images();
    this.action = 'BirthdayWishes';

    this.Save_Notification_Form.patchValue({
      emp_name: data.emp_name.toUpperCase(),
      company_name: this.decoded_token.company_name,
      post_offered: data.post_offered,
      campaignName: 'Birthday Wishes - ' + data.emp_name,
      notificationTitle: 'Birthday Wishes - ' + data.emp_name,
      birthday_msg: data.emp_name.toUpperCase() + ' - ' + data.post_offered + ', May this year be filled with opportunities, challenges met, and continued professional success.',
      startDate: (new Date()),
      endDate: (new Date()),
      selected_emp_js_id: data.js_id,
      selected_emp_id: data.emp_id,
    })
  }


  closeBirthdayModal() {
    this.showBirthdayModal = false;
    this.Save_Notification_Form.patchValue({
      emp_name: '',
      company_name: '',
      campaignName: '',
      notificationDescription: '',
      birthday_msg: '',
      notificationTitle: '',
      startDate: '',
      endDate: '',
      notificationAudienceIds: [],
      selected_emp_js_id: '',
      selected_emp_id: '',
      post_offered: ''

    })
    this.selected_birthday_img_url_idx = -1;
    this.saved_birthday_img_urls = [];
    this.uploaded_birthday_img_base64 = '';
    this.uploaded_birthday_img_name = '';
    this.addImage = false;
  }


  onOneClick(event: Event) {
    if ((event.target as HTMLElement).classList.contains('modal-content')) {
      event.stopPropagation();
      return;
    } else {
      this.closeBirthdayModal();
    }

    // console.log('Div with class "one" clicked');
  }


  async Get_AudienceList() {
    let obj = {
      "customerAccountId": this.tp_account_id?.toString()
    };
    this.Audience_list_data_original = [];

    await this.broadcasterService.GetAudienceList(obj).subscribe((resData: any) => {
      if (resData.statusCode) {
        let decryptData = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        this.Audience_list_data_original = JSON.parse(JSON.stringify(decryptData));

        this.Audience_list_data = decryptData.map((item: { emp_id: any; emp_name: any; }) => {
          return {
            id: item.emp_id,
            audiencename: item.emp_name,
          };
        });
      } else {
        this.Audience_list_data = [];
        //console.log(resData.message);
      }
    });
  }

  get_saved_birthday_images() {
    this._employeeService.get_dashboard_notifications_data({
      'action': 'get_birthday_images_paths',
      'account_id': this.tp_account_id,
      'category': 'birthday_bg_image',

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.saved_birthday_img_urls = !resData.commonData[0]?.birthday_bg_path ? [] : JSON.parse(resData.commonData[0].birthday_bg_path);
          if (this.saved_birthday_img_urls.length > 0) {
            this.selected_birthday_img_url_idx = 0;
          }
        } else {
          console.log(resData.message, 'Oops!');
        }
        // console.log(this.saved_birthday_img_urls);
        // console.log(this.selected_birthday_img_url);
      }
    })
  }

  upload_save_birthday_image() {
    let saved_birthday_img_urls = this.saved_birthday_img_urls && this.saved_birthday_img_urls.length > 0 ? this.saved_birthday_img_urls.join(',') : "";

    this._employeeService.uploadBirthdayImg({
      'action': 'save_birthday_images_paths',
      'account_id': this.tp_account_id,
      'category': 'birthday_bg_image',
      'param1': '',
      'birthday_img': this.uploaded_birthday_img_base64,
      'birthday_img_name': this.uploaded_birthday_img_name,
      'saved_birthday_img_urls': saved_birthday_img_urls,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.uploaded_birthday_img_base64 = '';
          this.uploaded_birthday_img_name = '';
          this.get_saved_birthday_images();

          this.toastr.success(resData.message, 'Success');
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  delete_save_birthday_image() {
    this.uploaded_birthday_img_base64 = '';
    this.uploaded_birthday_img_name = '';

    if (this.saved_birthday_img_urls.length > 0) {
      this.selected_birthday_img_url_idx = 0;
    } else {
      this.selected_birthday_img_url_idx = -1;
    }
  }

  change_birthday_img() {
    if (this.saved_birthday_img_urls.length > 0) {
      if (this.selected_birthday_img_url_idx + 1 == this.saved_birthday_img_urls.length) {
        this.selected_birthday_img_url_idx = 0;

      } else {
        this.selected_birthday_img_url_idx++;

      }

    } else {
      this.selected_birthday_img_url_idx = -1;
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    // console.log(file.name);
    this.uploaded_birthday_img_name = file.name;

    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // console.log(e.target.result);
        this.uploaded_birthday_img_base64 = e.target.result
        this.selected_birthday_img_url_idx = -1;

      };
      reader.readAsDataURL(file);
    }
  }


  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }


  open_NotificationPopup() {
    this.showSaveNotificationsPopup = true;
    const currentDate = new Date();

    setTimeout(() => {
      $('#FromDate2').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', currentDate); // Set first day of current month
    }, 500);

    setTimeout(() => {
      $('#ToDate2').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', currentDate); // Set last day of current month
    }, 500);

  }

  close_NotificationPopup() {
    this.showSaveNotificationsPopup = false;
  }

  onAudienceSelect(e: any) {
    //console.log(this.Save_Notification_Form.value.notificationAudienceIds);
  }

  onAudienceSelectAll(e: any) {

  }
  onAudienceDeSelect(e: any) {

  }
  onAudienceDeSelectAll(e: any) {

  }

  onEditorChange(event: string): void {
    const contentLength = event?.length || 0; // Length of the HTML content
    this.remainingChars = 500 - contentLength; // Calculate remaining characters

    // Restrict content if it exceeds 500 characters
    if (contentLength > 500) {
      const truncatedContent = event.substring(0, 500);
      this.Save_Notification_Form.get('notificationDescription')?.setValue(truncatedContent);
      this.remainingChars = 0;
    } else {
      this.Save_Notification_Form.get('notificationDescription')?.setValue(event);
    }
  }

  decodeHtmlContent(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  sanitizeDescription(campaignId: string, description: string): SafeHtml {
    if (!this.sanitizedDescriptions[campaignId]) {
      // Add target="_blank" to all links
      const processedDescription = this.addTargetBlankToLinks(description);

      // Sanitize the processed HTML
      this.sanitizedDescriptions[campaignId] = this.sanitizer.bypassSecurityTrustHtml(processedDescription);
    }
    return this.sanitizedDescriptions[campaignId];
  }

  private addTargetBlankToLinks(html: string): string {
    // Use a regular expression to find <a> tags and add target="_blank" if missing
    return html.replace(/<a\s(?![^>]*\btarget=)/g, '<a target="_blank" ');
  }

  processContent(content: string): string {
    // Clean the content as needed
    let cleanedContent = content
      .replace(/\s+/g, ' ')  // Remove extra spaces
      .replace(/<p>\s*<\/p>/g, '')  // Remove empty <p></p> tags
      .replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, '') // Remove <p><br></p>
      .replace(/<br\s*\/?>\s*/g, ''); // Remove extra <br> tags

    return cleanedContent;
  }

  limitTextLength() {
    const editorContent = $('#body-editor').summernote('code'); // Get editor content

    if (editorContent.length > this.maxCharacters) {
      alert(`Character limit exceeded! Maximum allowed is ${this.maxCharacters} characters.`);
      $('#body-editor').summernote('code', editorContent.substring(0, this.maxCharacters)); // Trim excess characters
    }
  }
  removeHtmlTags(input: string): string {
    // Convert line breaks and block elements to spaces or newlines
    let modifiedInput = input
      .replace(/<a[^>]*>(.*?)<\/a>/g, ' $1 ')     // Keep link text with spaces around
      .replace(/<br\s*\/?>/g, '\n')               // Convert <br> to newline
      .replace(/<\/?(div|p|li|ul|ol)[^>]*>/g, '\n') // Convert block elements to newline
      .replace(/<[^>]*>/g, '');                   // Remove remaining HTML tags

    // Replace multiple space-like entities with a normal space
    modifiedInput = modifiedInput.replace(/(&nbsp;|&#160;|&ensp;|&emsp;|&thinsp;)+/g, ' ');

    // Remove zero-width and soft characters
    modifiedInput = modifiedInput.replace(/(&zwnj;|&zwj;|&shy;)/g, '');

    // Replace multiple newlines or spaces with a single space
    modifiedInput = modifiedInput.replace(/(\s*\n\s*)+/g, '\n').replace(/\s+/g, ' ');

    // Trim and replace remaining newlines with spaces (optional)
    modifiedInput = modifiedInput.trim().replace(/\n/g, ' ');

    return modifiedInput;
  }


  updateCharCount() {
    const currentValue = this.Save_Notification_Form.get('notificationDescription')?.value || '';
    this.remainingChars = 500 - currentValue.length;
  }

   Save_AddEditPushNotifications() {
    let formData = this.Save_Notification_Form.value;

    let notificationDescription = `Happy Birthday!<br>
    ${formData.birthday_msg} -  ${formData.company_name}.`;

    // let action = formData.action.toString();
    let startDate_val = this.formatDate(formData.startDate);
    let endDate_val = this.formatDate(formData.endDate);
    let notificationAudienceIds_arr = formData.notificationAudienceIds.map((item: { id: any; }) => item.id);
    let campaignName = formData.campaignName.toString();
    // let notificationDescription = formData.notificationDescription ? formData.notificationDescription : '';
    let notificationTitle = formData.notificationTitle.toString();
    let campaignId: any = '';
    let action = 'AddAutoApprovedNotifications';

    // if (action === 'AddAutoApprovedNotifications') {
    //   campaignId = "";
    // } else {
    //   campaignId = formData.campaignId;
    // }

    let find_idx = notificationAudienceIds_arr.findIndex((el: any) => el == formData.selected_emp_id);
    if (find_idx == -1) {
      let temp_idx = this.Audience_list_data_original.findIndex((el: any) => el.emp_id == formData.selected_emp_id);
      notificationAudienceIds_arr.push(this.Audience_list_data_original[temp_idx].emp_id);
    }

    // Conditionally include image
    let modified_msg: any = `<p>${notificationDescription}</p>`;
    if (this.addImage) {
      const birthdayImageUrl = this.saved_birthday_img_urls[this.selected_birthday_img_url_idx];
      modified_msg += `<p><a href="${birthdayImageUrl}" target="_blank"><span style="font-size:28px;">&#127874;</span></a></p>`;
    }

    // console.log("customerAccountId", this.tp_account_id?.toString(),
    // "action", action,
    // "createdBy", this.tp_account_id?.toString(),
    // "startDate", startDate_val,
    // "endDate", endDate_val,
    // "notificationAudienceIds", notificationAudienceIds_arr.join(','),
    // "campaignName", campaignName,
    // "notificationDescription", modified_msg,
    // "notificationTitle", notificationTitle,
    // "campaignId", campaignId)

    // return;

    let temp_data = {
      "startDate": startDate_val.split('/').join('-'),
      "endDate": endDate_val.split('/').join('-'),
      "emp_id": formData.selected_emp_id.toString(),
    }

    let obj = {
      "customerAccountId": this.tp_account_id?.toString(),
      "action": action,
      "createdBy": this.tp_account_id?.toString(),
      "startDate": startDate_val,
      "endDate": endDate_val,
      "notificationAudienceIds": notificationAudienceIds_arr.join(','),
      "campaignName": campaignName,
      "notificationDescription": modified_msg,
      "notificationTitle": notificationTitle,
      "campaignId": campaignId
    }

    // console.log("OBJJJ", obj);
    // return

    this.broadcasterService.AddEditPushNotifications(obj).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message)
        // this.Save_Notification_Form.reset();
        this.showSaveNotificationsPopup = false;
        this.insert_birthday_wishes(temp_data);
      } else {
        this.toastr.error(resData.message);
      }
    });

  }

  publishCampaign() {
    let data = this.Save_Notification_Form.value;

    let target_js_ids = this.Audience_list_data_original
      .filter(emp => data.notificationAudienceIds.some(aud => aud.id == emp.emp_id))
      .map(emp => emp.js_id);

    let find_idx = target_js_ids.findIndex((el: any) => el == data.selected_emp_js_id);

    if (find_idx == -1) {
      let temp_idx = this.Audience_list_data_original.findIndex((el: any) => el.js_id == data.selected_emp_js_id);
      target_js_ids.push(this.Audience_list_data_original[temp_idx].js_id);
    }

    let final_js_ids = target_js_ids.length > 0 ? target_js_ids.join(',') : '';

    // ${data.emp_name} 
    let notificationDescription = `Happy Bithday! 
    ${data.birthday_msg} -  ${data.company_name}.`;

    // let notification_desc = this.removeHtmlTags(data.notification_desc);

    // console.log(matchingJsIds);
    // console.log(this.Audience_list_data_original);

    // return;
    // let target_js_ids = data.target_js_ids;
    // const confirmationMessage = "Are you sure you want to publish this campaign?";
    // if (window.confirm(confirmationMessage)) {
    this.broadcasterService.Send_Tpnotify({
      "productTypeId": this.product_type?.toString(),
      "user_id": final_js_ids?.toString(),
      "message": notificationDescription,
      "user_type": "Employee",
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          // this.toastr.success(resData.message);
          //console.log(resData.message);
          this.closeBirthdayModal();
          // this.updateStatus('Published', data.campaign_id);
        } else {
          this.toastr.error(resData.message);

        }
      },
      error: (error: any) => {
        let errorMsg = error.message;
        // this.toastr.error(errorMsg, 'Oops!');
        console.log(error);
      }
    });
    // this.FinalSubmit();
    // } else {
    //   // User clicked 'Cancel', do nothing or handle accordingly
    // }
  }

  // akkchay sir's Notification Code
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-indexed
    const year = date.getFullYear();
    const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    return formattedDate;
  }


  my_formatDate(date: Date): string {
    const dd = date.getDate().toString().padStart(2, '0');
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const yy = date.getFullYear().toString();
    return `${dd}/${mm}/${yy}`;
  }

  send_call() {
    this.publishCampaign();
    this.Save_AddEditPushNotifications();

  }

  public accountClass(hmd: any): string {

    //console.log(hmd);
    // 'verified-holiday': (hmd.is_verified=='Y' && hmd.holiday_type=='Public'),'verified-holiday-rh':
    //                    (hmd.is_verified=='Y' && hmd.holiday_type=='Restricted'), 'inactive-holiday': hmd.status=='0'
    //"Public Holiday"
    if (GlobalConstants.NEW_THEME_IDS.includes(this.tp_account_id.toString())) {
      if (hmd.is_verified == 'Y' && hmd.holiday_type == 'Public Holiday') {
        return 'verified-holiday';
      }
      else if (hmd.is_verified == 'Y' && hmd.holiday_type == 'Restricted Holiday') {
        return 'verified-holiday-rh';
      }

      else if (hmd.status == '0') {
        return 'inactive-holiday';
      }
      else {
        return '';
      }

    } else {
      if (hmd.is_verified == 'Y' && hmd.holiday_type == 'Public') {
        return 'verified-holiday-spl';
      }
      else if (hmd.is_verified == 'Y' && hmd.holiday_type == 'Restricted') {
        return 'verified-holiday-rh-spl';
      }

      else if (hmd.status == '0') {
        return 'inactive-holiday';
      }
      else {
        return '';
      }
    }


  }
  customTooltipText({ data }): string {
    return data.name;
  }
  insert_birthday_wishes(data:any) {

    this._loginService.insert_birthday_wishes({
      "action": "insert_bithday_wishes",
      "accountid": this.tp_account_id?.toString(),
      "emp_id": data.emp_id,
      "birthday_date": data.startDate,
      "notification_ctg": 'birthday-wish',

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          if (resData.msgcd == 1) {
            this.get_employee_birthday();
          }
          // console.log(resData.message);
        } else {
          // console.log(resData.message);
        }
      }
    })
  }


  // Get Dashboard Setting for Sub_User - sidharth kaul dated. 19.06.2025
  getDashboardSettingData() {
      this.dashboard_settings = {};

      this._ReportService.GetDashboardSettingData({
        'action': 'GET_DASHBOARD_SETTINGS',
        'customeraccountid': this.tp_account_id?.toString(),
        'subuser_id': this.decoded_token?.sub_userid?.toString()

      }).subscribe({
        next: (resData: any) => {
          // console.log(resData);

          if (resData.statusCode) {
            this.dashboard_settings = resData.commonData;
            // console.log("dashboard_settings",this.dashboard_settings);
          } else {
            this.dashboard_settings = null;
            console.log("No setting found for this subUserId!");
          }

          // Conditional Logic for api calls - Start
          if (!this.dashboard_settings || this.dashboard_settings.employee_list){
            this.get_employee_list(); 
          }
          if (!this.dashboard_settings || this.dashboard_settings.attendance){
            this.get_employee_attendance(); 
          }
          if (!this.dashboard_settings || this.dashboard_settings.birthday){
            this.get_employee_birthday(); 
          }
          if (!this.dashboard_settings || this.dashboard_settings.leaves){
            this.get_employee_leave(); 
          }
          if (!this.dashboard_settings || this.dashboard_settings.holidays){
            this.get_employee_holidays(); 
          }
          if (!this.dashboard_settings || this.dashboard_settings.chart){
            this.get_data_forpiachart(); 
          }
          // Conditional Logic for api calls - End




        }
      })
    }


}
