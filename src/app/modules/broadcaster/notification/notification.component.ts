import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import decode from 'jwt-decode';
import { dongleState, grooveState } from 'src/app/app.animation';
import { AlertService } from 'src/app/shared/_alert';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { BroadcasterService } from '../broadcaster.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import moment from 'moment';
import { BusinesSettingsService } from '../../business-settings/business-settings.service';
import { FaceCheckinService } from '../../attendance/face-checkin.service'; // May not be needed if getemployeeList is not used
import { ReportService } from '../../reports/report.service';

declare var $: any;
@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
  animations: [dongleState, grooveState]
})

export class NotificationComponent {
  // [x: string]: any; // Avoid if possible, list out properties explicitly
  product_type: any = '';
  tp_account_id: any = '';
  Audience_list_data: any = [];
  fullAudienceListData: any[] = []; // New property
  campaign_detail__data: any = [];
  token: any = '';
  showSidebar: boolean = true;
  Campaign_Form: FormGroup;
  viewPopup: boolean = false;
  custumerAccountId: any = ""; // Already exists
  dropdownSettings: any = {}; // Existing, will be for org_unit now
  selectedItems: any = []; // Already exists
  placeholder: string; // Already exists
  Save_Notification_Form: FormGroup; // Already exists
  showSaveNotificationsPopup: boolean = false; // Already exists
  unique_campaign_detail__data: any; // Already exists
  filteredcampaign_detail: any; // Already exists
  campaign_detail_json_data: any; // Already exists
  showAudiencePopup: boolean = false; // Already exists
  action: string; // Already exists
  Form_title_name: string; // Already exists
  filteredStr: string; // Already exists
  remainingChars: number = 500; // Already exists
  htmlContent: string = ''; // Already exists
  sanitizedDescriptions: { [key: string]: SafeHtml } = {}; // Already exists
  targetAudience__data: any = []; // Already exists
  maxCharacters = 500; // Already exists
  userid: any; // Added, was in ngOnInit token decode
  isWfhFormValid: boolean = true; // Added, was used in filterByDate
  searchQuery: string = ''; // Added for filterByDate
  errorMsg: string = ''; // Added for error handling in updateStatus, publishCampaign

  // New properties from the plan
  org_data: any = []; // This will hold selected org units from the dropdown
  deptName: any = []; // This will hold selected departments
  desgName: any = []; // This will hold selected designations

  deptList: any = []; // For department dropdown data source
  desgList: any = []; // For designation dropdown data source

  geo_fencing_list_data: any = []; // Source for Organization Unit dropdown (as per EmployeesComponent)
                                  // Will be mapped to organizationUnitData for clarity in HTML
  organizationUnitData: any = []; // Data for Organization Unit dropdown
  departmentData: any = [];       // Data for Department dropdown
  designationData: any = [];      // Data for Designation dropdown

  deptDropdownSettings: any = {}; // Settings for Department dropdown
  desgDropdownSettings: any = {}; // Settings for Designation dropdown
  audienceDropdownSettings: any = {}; // New property for audience dropdown settings
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

  constructor(
    private _EncrypterService: EncrypterService,
    private _SessionService: SessionService,
    private router: Router,
    private _formBuilder: FormBuilder,
    public toastr: ToastrService,
    private _alertservice: AlertService,
    private broadcasterService: BroadcasterService,
    private sanitizer: DomSanitizer,
    private _BusinesSettingsService: BusinesSettingsService, // Added
    private _ReportService: ReportService, // Added
    // private _faceCheckinService: FaceCheckinService, // Not adding yet, only if getemployeeList is adapted
  ) { }

  ngOnInit() {
    let session_obj_d: any = JSON.parse(
      this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.userid = this.token.userid;
    this.product_type = localStorage.getItem('product_type');
    this.userid = this.token.userid; // Moved from previous spot for consistency

    this.Campaign_Form = this._formBuilder.group({
      FromDate: ['', [Validators.required]],
      ToDate: ['', [Validators.required]],
      searchKeyword: ['']
    });

    // Existing placeholder for Audience dropdown
    this.placeholder = 'Select Audience';

    // Initialize audienceDropdownSettings
    this.audienceDropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'audiencename',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 6, // As it was originally for audience
      allowSearchFilter: true
    };

    // Dropdown settings for Organization Units (this is the existing dropdownSettings)
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'org_unit_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };

    this.deptDropdownSettings = {
      singleSelection: false,
      idField: 'posting_department', // Based on EmployeesComponent get_att_dept_master_list
      textField: 'posting_department',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3, // Example limit
      allowSearchFilter: true
    };

    this.desgDropdownSettings = {
      singleSelection: false,
      idField: 'post_offered', // Based on EmployeesComponent get_att_role_master_list
      textField: 'post_offered',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3, // Example limit
      allowSearchFilter: true
    };

    this.Get_AudienceList(); // Existing call for original audience dropdown
    this.get_geo_fencing_list(); // Call for Organization Units data
    this.get_att_dept_master_list(); // Call for Departments data
    this.get_att_role_master_list(); // Call for Designations data

    this.Save_Notification_Form = this._formBuilder.group({
      action: ['', [Validators.required]],
      // startDate: ['', [Validators.required]],
      // endDate: ['', [Validators.required]],
      notificationAudienceIds: [[], [Validators.required]],
      campaignName: ['', [Validators.required]],
      notificationDescription: ['', [Validators.required, Validators.maxLength(500)]],
      notificationTitle: ['', [Validators.required]],
      campaignId: [''],
      organizationUnitModal: [[]], // New FormControl for modal
      departmentModal: [[]],       // New FormControl for modal
      designationModal: [[]]        // New FormControl for modal
    });
    this.Save_Notification_Form.get('notificationDescription')?.valueChanges.subscribe((value: string) => {
      this.remainingChars = 500 - (value?.length || 0);
    });
  }

  ngAfterViewInit() {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    setTimeout(() => {
      $('#FromDate2').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', firstDayOfMonth); // Set first day of current month
    }, 500);

    setTimeout(() => {
      $('#ToDate2').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', lastDayOfMonth); // Set last day of current month
      this.searchCampaigns();
    }, 500);

    // create request form - dated 09.05.2025 by sidharth kaul
    setTimeout(() => {
      $('#FromDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', null);

      $('#ToDate').datepicker({
        dateFormat: 'dd/mm/yy',
        changeMonth: true,
        changeYear: true,
      }).datepicker('setDate', null);

      $('body').on('change', '#FromDate', function () {
        $('#recdate').trigger('click');
      });

      $('body').on('change', '#ToDate', function () {
        $('#recdate').trigger('click');
      });
      // this.Notification_Alert();

    }, 100);

  }

    // New filter logic sidharth kaul dated 09.05.2025
    filterByDate(): void {

      this.isWfhFormValid = true;
      let fromDate = $(`#FromDate`).val();
      let toDate = $(`#ToDate`).val();

      // Check if both dates have values
      if (!fromDate || !toDate) {
        console.log('One of the dates is missing, skipping validation');
        return;
      }

      let formatted_fromDate = moment(fromDate, 'DD-MM-YYYY').format('YYYY-MM-DD');
      let formatted_toDate = moment(toDate, 'DD-MM-YYYY').format('YYYY-MM-DD');

      if (fromDate && toDate) {
        if (new Date(formatted_toDate) >= new Date(formatted_fromDate)) {
          this.searchQuery = '';
          // this.Notification_Alert(); // Removed as it's undefined
        } else {
          this.toastr.error("From date should be less than or equal to the To date", 'Invalid Date Range!');
          $('#FromDate').datepicker('setDate', new Date());
          $('#ToDate').datepicker('setDate', new Date());
          this.isWfhFormValid = false;
          return;
        }
      }

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

  updateCharCount() {
    const currentValue = this.Save_Notification_Form.get('notificationDescription')?.value || '';
    this.remainingChars = 500 - currentValue.length;
  }
  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  searchCampaigns() {
    const startDate = $('#FromDate2').val();
    const endDate = $('#ToDate2').val();
    this.GetCampaigns_Details(startDate, endDate);
  }
  search(key: any) {
    this.filteredcampaign_detail = this.campaign_detail_json_data.filter(function (element: any) {
      return element.campaign_name.toLowerCase().includes(key.target.value.toLowerCase()) ||
        element.notification_title.toLowerCase().includes(key.target.value.toLowerCase()) ||
        element.notification_desc.toLowerCase().includes(key.target.value.toLowerCase());
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-indexed
    const year = date.getFullYear();
    const formattedDate = `${day.toString().padStart(2, '0')}/${month.toString().padStart(2, '0')}/${year}`;
    return formattedDate;
  }

  GetCampaigns_Details(startDate?: string, endDate?: string) {
    // Use form values if startDate/endDate not provided (e.g. from applyFilters or initial load)
    const formValues = this.Campaign_Form.value;
    // const orgUnitIds = formValues.organizationUnit && formValues.organizationUnit.length > 0 ?
    //                    formValues.organizationUnit.map((item: any) => item.id).join(',') : "";
    // const departmentNames = formValues.department && formValues.department.length > 0 ?
    //                         formValues.department.map((item: any) => item.posting_department).join(',') : "";
    // const designationNames = formValues.designation && formValues.designation.length > 0 ?
    //                          formValues.designation.map((item: any) => item.post_offered).join(',') : "";

    const payload = {
      "customerAccountId": this.tp_account_id?.toString(),
      "searchKeyword": formValues.searchKeyword || "",
      "startDate": startDate || formValues.FromDate, // Use passed dates first, then form dates
      "endDate": endDate || formValues.ToDate,     // Use passed dates first, then form dates
      // "organizationUnitIds": orgUnitIds,       // New parameter - REMOVED
      // "department": departmentNames,        // New parameter - REMOVED
      // "designation": designationNames      // New parameter - REMOVED
    };

    this.broadcasterService.GetCampaignsDetails(payload).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.campaign_detail__data = resData.commonData;
        this.campaign_detail_json_data = (this.campaign_detail__data);
        this.filteredcampaign_detail = this.campaign_detail_json_data;
        // console.log(this.filteredcampaign_detail);
      } else {
        this.campaign_detail__data = [];
        this.filteredcampaign_detail = [];
        this.toastr.error(resData.message);
      }
    });
  }

  async Get_AudienceList() {
    let obj = {
      "customerAccountId": this.tp_account_id?.toString()
    };

    await this.broadcasterService.GetAudienceList(obj).subscribe((resData: any) => {
      if (resData.statusCode) {
        let decryptData = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
        this.Audience_list_data = decryptData.map((item: { emp_id: any; emp_name: any; /* Potentially other fields if API provides them */ }) => {
          return {
            id: item.emp_id,
            audiencename: item.emp_name,
            // Assuming the API might provide these, otherwise client-side filtering is limited
            // org_unit_id: item.org_unit_id,
            // department_name: item.department_name,
            // designation_name: item.designation_name
          };
        });
        this.fullAudienceListData = [...this.Audience_list_data]; // Store the full list
      } else {
        this.Audience_list_data = [];
        this.fullAudienceListData = []; // Also clear full list on error
        this.toastr.error(resData.message);
      }
    });
  }

  filterAudienceList() {
    const orgUnitsSelected = this.Save_Notification_Form.controls['organizationUnitModal'].value || [];
    const departmentsSelected = this.Save_Notification_Form.controls['departmentModal'].value || [];
    const designationsSelected = this.Save_Notification_Form.controls['designationModal'].value || [];

    const selectedOrgUnitIds = orgUnitsSelected.map((item: any) => item.id);
    const selectedDepartmentNames = departmentsSelected.map((item: any) => item.posting_department);
    const selectedDesignationNames = designationsSelected.map((item: any) => item.post_offered);

    const anyFilterActive = selectedOrgUnitIds.length > 0 || selectedDepartmentNames.length > 0 || selectedDesignationNames.length > 0;

    if (!anyFilterActive) {
      this.Audience_list_data = [...this.fullAudienceListData];
      this.Save_Notification_Form.controls['notificationAudienceIds'].setValue([]);
      return; // Return early if no filters are active
    }

    const payload: any = {
      customerAccountId: this.tp_account_id?.toString(),
    };

    if (selectedOrgUnitIds.length > 0) {
      payload.ouIds = selectedOrgUnitIds.join(',');
    }
    if (selectedDepartmentNames.length > 0) {
      payload.department = selectedDepartmentNames.join(',');
    }
    if (selectedDesignationNames.length > 0) {
      payload.designation = selectedDesignationNames.join(',');
    }

    // console.log("Calling GetFilteredAudienceList with payload:", payload);

    this.broadcasterService.GetFilteredAudienceList(payload).subscribe(
      (resData: any) => {
        if (resData.statusCode) {
          let decryptData = JSON.parse(this._EncrypterService.aesDecrypt(resData.commonData));
          
          this.Audience_list_data = decryptData.map((item: { emp_id: any; emp_name: any; }) => {
            return {
              id: item.emp_id,
              audiencename: item.emp_name,
            };
          });

        // console.log("Raw GetAudienceList: ", decryptData);
        // console.log("Filtered GetAudienceList:", this.Audience_list_data);
        
        // Note: As per correction, fullAudienceListData should not be updated here.
        // It always holds the absolute full list fetched initially.

        } else {
          this.Audience_list_data = [];
          this.toastr.error(resData.message || 'Failed to fetch filtered audience list.');
        }
        // Reset audience selection in the form after updating the list
        this.Save_Notification_Form.controls['notificationAudienceIds'].setValue([]);
      },
      (error: any) => {
        this.Audience_list_data = [];
        this.toastr.error('An error occurred while fetching the filtered audience list.');
        console.error("Error fetching filtered audience list:", error);
        // Reset audience selection in the form
        this.Save_Notification_Form.controls['notificationAudienceIds'].setValue([]);
      }
    );

  }

  onItemSelect(item: any) {
    this.selectedItems.push(item);
    // console.log(this.selectedItems, "Selected items");
  }

  onSelectAll(items: any) {
    this.selectedItems = [...items];
    // console.log(this.selectedItems, "Selected items after selecting all");
  }

  onItemUnselect(item: any) {
    this.selectedItems = this.selectedItems.filter((selectedItem: { id: any; }) => selectedItem.id !== item.id);
    // console.log(this.selectedItems, "unslect>>>>");
  }

  onUnselectAll(items: any) {
    this.selectedItems = [];
    // console.log(this.selectedItems, "this.selectedItems>>>>>>>>>>>>");
  }

  OpenCreateNewNotifications() {
    this.showSaveNotificationsPopup = true;
    this.Form_title_name = 'Create Push Notification';
    this.action = 'AddNewNotification';
    this.Save_Notification_Form.patchValue({
      'action': "AddNewNotification"
    })
  }

  close_NotificationPopup() {
    this.showSaveNotificationsPopup = false;
    this.Save_Notification_Form.reset();
  }

  openEditPopup(campaignId: any) {
    // console.log(this.selectedItems, 'selected');
    this.Form_title_name = 'Edit Push Notification';
    this.action = 'EditPushNotifications';
    this.Get_UniqueCampaignDetails(campaignId)
    this.Save_Notification_Form.patchValue({
      'action': "EditPushNotifications",
      'campaignId': campaignId

    })
  }

  open_viewpopup(campaignId: any) {
    this.Form_title_name = 'View Push Notification';
    this.action = '';
    this.Get_UniqueCampaignDetails(campaignId)
  }

  Get_UniqueCampaignDetails(campaignId: any) {
    this.broadcasterService.GetUniqueCampaignDetails({
      "customerAccountId": this.tp_account_id?.toString(),
      "campaignId": campaignId.toString(),
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.unique_campaign_detail__data = resData.commonData;
        this.patch_viewpopup();
      } else {
        this.unique_campaign_detail__data = [];
        this.toastr.error(resData.message);
      }
    });
  }

  // Create Notifications Pt.1
  Creat_New_PushNotifications() {
    let data = this.Save_Notification_Form.value;
    this.Save_AddEditPushNotifications(data);
  }

  // Create Notifications Pt.2
  Save_AddEditPushNotifications(formData: any) {
    let action = formData.action.toString();
    let notificationAudienceIds = formData.notificationAudienceIds.map((item: { id: any; }) => item.id).join(',');
    let campaignName = formData.campaignName.toString();
    let notificationDescription = formData.notificationDescription
      ? this.processContent(formData.notificationDescription) : '';
    let notificationTitle = formData.notificationTitle.toString();
    let campaignId: any;
    if (action === 'AddNewNotification') {
      campaignId = "";
    } else {
      campaignId = formData.campaignId;
    }

    if(!($(`#FromDate`).val()) || !($(`#ToDate`).val())){
      this.toastr.error("From and To Date are required!");
      return;
    }

    this.broadcasterService.AddEditPushNotifications({
      "customerAccountId": this.tp_account_id?.toString(),
      "action": action,
      "createdBy": this.tp_account_id?.toString(),
      "startDate": $(`#FromDate`).val(),
      "endDate": $(`#ToDate`).val(),
      "notificationAudienceIds": notificationAudienceIds,
      "campaignName": campaignName,
      "notificationDescription": notificationDescription,
      "notificationTitle": notificationTitle,
      "campaignId": campaignId
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.toastr.success(resData.message)
        this.Save_Notification_Form.reset();
        this.showSaveNotificationsPopup = false;
        this.GetCampaigns_Details($('#FromDate2').val(), $('#ToDate2').val());
      } else {
        this.toastr.error(resData.message);
        this.Save_Notification_Form.reset();
        this.showSaveNotificationsPopup = false;
      }
    });

  }

  // Patch for View
  patch_viewpopup() {
    const unique_campaign_name = this.unique_campaign_detail__data.campaign_name;
    const unique_notification_title = this.unique_campaign_detail__data.notification_title;
    const unique_notification_desc = this.unique_campaign_detail__data?.notification_desc
      ? this.processContent(this.unique_campaign_detail__data.notification_desc)
      : '';
    const unique_target_audience_ids = this.unique_campaign_detail__data.target_audience_ids.toString();
    const selectedIds = unique_target_audience_ids.split(',').map(id => parseInt(id.trim(), 10));
    const selectedItems = this.Audience_list_data.filter(item => selectedIds.includes(parseInt(item.id, 10)));
    const unique_start_date = this.unique_campaign_detail__data.start_date;
    const unique_end_date = this.unique_campaign_detail__data.end_date;
    // console.log("unique_start_date", unique_start_date)

    $('#FromDate').datepicker('setDate', unique_start_date);
    $('#ToDate').datepicker('setDate', unique_end_date);

    this.Save_Notification_Form.patchValue({
      'campaignName': unique_campaign_name,
      'notificationTitle': unique_notification_title,
      'notificationDescription': unique_notification_desc,
      'notificationAudienceIds': selectedItems,
      // 'startDate': unique_start_date,
      // 'endDate': unique_end_date,

    })
    this.showSaveNotificationsPopup = true;
  }

  open_audiencepopup(campaignId: any) {
    this.broadcasterService.GetTargetAudience({
      "customerAccountId": this.tp_account_id?.toString(),
      "campaignId": campaignId.toString(),
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.targetAudience__data = resData.commonData;
        this.showAudiencePopup = true;
      } else {
        this.targetAudience__data = [];
        this.toastr.error(resData.message);
      }
    });

  }
  closeshowAudiencePopup() {
    this.showAudiencePopup = false;
  }

  updateStatus(status: any, campaign_data: any) {
    if (!campaign_data?.campaign_id) {
      this.toastr.error("Invalid campaign data provided.");
      return;
    }
    let campaign_id = campaign_data.campaign_id.toString();
    let statusType = '';
    if (status === 'Approved') {
      statusType = 'publish';
    } else if (status === 'Rejected') {
      statusType = 'reject';
    }
    const confirmationMessage = `Are you sure you want to ${statusType} this campaign?`;
    if (window.confirm(confirmationMessage)) {
      this.broadcasterService.ChangeApprovalStatusForCampaign({
        "customerAccountId": this.tp_account_id?.toString(),
        "createdBy": this.tp_account_id?.toString(),
        "campaignId": campaign_id,
        "approvalStatus": status.toString(),
      }).subscribe({
        next: (resData: any) => {
          if (resData.statusCode) {
            this.toastr.success(resData.message)
            if (status === 'Approved') {
              this.publishCampaign(campaign_data)
            }
            this.GetCampaigns_Details($('#FromDate2').val(), $('#ToDate2').val());
          } else {
            this.toastr.error(resData.message);
          }
        },
        error: (error: any) => {
          this.errorMsg = error.error.message;
          this.toastr.error(this.errorMsg, 'Oops!');
        }
      });
    } else {

    }
  }

  publishCampaign(data: any) {
    let target_js_ids = data.target_js_ids;
    let notification_desc = this.removeHtmlTags(data.notification_desc);
    // const confirmationMessage = "Are you sure you want to publish this campaign?";
    // if (window.confirm(confirmationMessage)) {
    this.broadcasterService.Send_Tpnotify({
      "productTypeId": this.product_type?.toString(),
      "user_id": target_js_ids?.toString(),
      "message": notification_desc?.toString(),
      "user_type": "Employee",
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message);
          // this.updateStatus('Published', data.campaign_id);
        } else {
          this.toastr.error(resData.message);
        }
      },
      error: (error: any) => {
        this.errorMsg = error.error.message;
        this.toastr.error(this.errorMsg, 'Oops!');
      }
    });
    // this.FinalSubmit();
    // } else {
    //   // User clicked 'Cancel', do nothing or handle accordingly
    // }
  }

  filterValues(input: string): string {
    return input.split(',')
      .map(Number)
      .filter(num => num <= 50)
      .join(',');
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

  // +++++++++++++++++ NEW METHODS (Adapted from EmployeesComponent) ++++++++++++++++++++++

  get_geo_fencing_list(key: any = '') {
    this._BusinesSettingsService.GetGeoFencing_List({
      "customerAccountId": (this.tp_account_id).toString(),
      "action": "GetAllGeoFencingForCustomer",
      "searchKeyword": key // In EmployeesComponent, this was from a form, here it's optional
    }).subscribe((resData: any) => {
      if (resData.statusCode && resData.commonData && resData.commonData.length > 0) {
        this.organizationUnitData = resData.commonData.map((item: any) => ({
          id: item.id,
          org_unit_name: item.org_unit_name
        }));
        // console.log('Organization Unit Data Loaded:', JSON.stringify(this.organizationUnitData));
      } else {
        this.organizationUnitData = []; // Set to empty if no data or error
        if (!resData.statusCode) {
          // this.toastr.error('Failed to load organization units: ' + resData.message, 'Error'); // Optional
          console.error("Error fetching organization units or no data:", resData.message || "No data returned");
        } else if (!resData.commonData || resData.commonData.length === 0) {
          console.log("No organization units found.");
        }
      }
    }, (error: any) => {
      this.organizationUnitData = []; // Set to empty on API error
      // this.toastr.error('API Error fetching organization units', 'Error'); // Optional
      console.error("API Error fetching organization units:", error);
    });
  }

  get_att_dept_master_list() {
    this._ReportService.GetMaster_Dropdown({
      "actionType": "GetPostingDepartments",
      "productTypeId": this.product_type, // Already available in this component
      "customerAccountId": this.tp_account_id.toString(),
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.departmentData = resData.commonData; // Data for ng-multiselect-dropdown
                                                // Ensure 'posting_department' is the field for both idField and textField
      } else {
        this.departmentData = [];
        // this.toastr.error('Failed to load departments: ' + resData.message, 'Error'); // Optional
        console.error("Error fetching departments: ", resData.message);
      }
    });
  }

  get_att_role_master_list() {
    this._ReportService.GetMaster_Dropdown({
      "actionType": "GetMasterPostOffered",
      "productTypeId": this.product_type, // Already available in this component
      "customerAccountId": this.tp_account_id.toString(),
    }).subscribe((resData: any) => {
      if (resData.statusCode) {
        this.designationData = resData.commonData; // Data for ng-multiselect-dropdown
                                                 // Ensure 'post_offered' is the field for both idField and textField
      } else {
        this.designationData = [];
        // this.toastr.error('Failed to load designations: ' + resData.message, 'Error'); // Optional
        console.error("Error fetching designations: ", resData.message);
      }
    });
  }

  // applyFilters() { // Method removed as per instruction, if it only handled these filters
  //   // This method will be called when any of the filter dropdowns change,
  //   // or when the main search button is clicked.
  //   // It should re-fetch the campaign details using all current filter values.
  //   const formValues = this.Campaign_Form.value;
  //   this.GetCampaigns_Details(formValues.FromDate, formValues.ToDate);
  //   // GetCampaigns_Details will internally use all form values, including new filters
  // }

  resetFilter() {
    const formValues = this.Campaign_Form.value; // Get current date values
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const lastDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    this.Campaign_Form.patchValue({
      searchKeyword: '',
      // organizationUnit: [], // REMOVED
      // department: [],       // REMOVED
      // designation: []       // REMOVED
      // FromDate and ToDate are intentionally not reset here,
      // to maintain existing date filter behavior unless explicitly changed by user.
      // If they also need reset, uncomment below and ensure datepickers are also updated.
      // FromDate: $('#FromDate2').datepicker('setDate', firstDayOfMonth),
      // ToDate: $('#ToDate2').datepicker('setDate', lastDayOfMonth)
    });

    // After resetting form controls, call GetCampaigns_Details directly to refresh the list
    // (since applyFilters might be removed or changed)
    this.GetCampaigns_Details(this.Campaign_Form.value.FromDate, this.Campaign_Form.value.ToDate);
  }
}
