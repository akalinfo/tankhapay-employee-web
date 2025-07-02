import { Component, ViewChild, ElementRef } from '@angular/core';
import { MessageService, TreeNode } from 'primeng/api';
import { EmployeeManagementService } from '../../employee-management/employee-management.service';
import { SessionService } from 'src/app/shared/services/session.service';
import jwtDecode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { dongleState, grooveState } from 'src/app/app.animation';
import { ShiftSpecificService } from '../../attendance/shift-specific-service';


@Component({
  selector: 'app-organization-chart',
  templateUrl: './organization-chart.component.html',
  providers: [MessageService],
  styleUrls: ['./organization-chart.component.css'],
  animations: [grooveState, dongleState],
})
export class OrganizationChartComponent {
  data1: TreeNode[];
  // data2: TreeNode[];
  selectedNode: TreeNode;
  decoded_token: any;
  tp_account_id: any;
  showSidebar: boolean = false;
  orgForm: FormGroup;
  showAddEditOrgModal: boolean = false;
  showOptionOrgModal: boolean = false;
  orgModalTitle: any = '';
  node_selected_data: any;
  product_type: any;
  GeoFenceId: any;
  userList_original: any = [];
  userList_modified: any = [];
  dropdownSettings: any = {};
  selectedItems: any = [];
  selectedItems_copy: any = [];
  selectedItems_table_data: any = [];
  showChart: boolean = false;

  constructor(
    private messageService: MessageService,
    private _employeeMgmtService: EmployeeManagementService,
    private _sessionService: SessionService,
    private toastr: ToastrService,
    private _formBuilder: FormBuilder,
    private shiftSettingService: ShiftSpecificService,
  ) { }

  ngOnInit() {
    let session_obj = this._sessionService.get_user_session();
    let token = JSON.parse(session_obj).token;
    this.decoded_token = jwtDecode(token);
    // console.log(this.decoded_token)
    this.tp_account_id = this.decoded_token.tp_account_id;

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'emp_code',
      textField: 'emp_name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };

    this.orgForm = this._formBuilder.group({
      level_role: [''],
      level_role_desc: [''],
      row_id: [''],
      children_cnt: [0],

    })

    this.getUserList();
    this.get_org_hierarchy();

    // this.data1 = [{
    //     label: 'CEO',
    //     type: 'person',
    //     styleClass: 'p-person',
    //     expanded: true,
    //     data: {name:'Walter White'},
    //     children: [
    //         {
    //             label: 'CFO',
    //             type: 'person',
    //             styleClass: 'p-person',
    //             expanded: true,
    //             data: {name:'Saul Goodman', 'avatar': 'saul.jpg'},
    //             children:[{
    //                 label: 'Tax',
    //                 styleClass: 'department-cfo'
    //             },
    //             {
    //                 label: 'Legal',
    //                 styleClass: 'department-cfo'
    //             }],
    //         },
    //         {
    //             label: 'COO',
    //             type: 'person',
    //             styleClass: 'p-person',
    //             expanded: true,
    //             data: {name:'Mike E.', 'avatar': 'mike.jpg'},
    //             children:[{
    //                 label: 'Operations',
    //                 styleClass: 'department-coo'
    //             }]
    //         },
    //         {
    //             label: 'CTO',
    //             type: 'person',
    //             styleClass: 'p-person',
    //             expanded: true,
    //             data: {name:'Jesse Pinkman', 'avatar': 'jesse.jpg'},
    //             children:[{
    //                 label: 'Development',
    //                 styleClass: 'department-cto',
    //                 expanded: true,
    //                 children:[{
    //                     label: 'Analysis',
    //                     styleClass: 'department-cto'
    //                 },
    //                 {
    //                     label: 'Front End',
    //                     styleClass: 'department-cto'
    //                 },
    //                 {
    //                     label: 'Back End',
    //                     styleClass: 'department-cto'
    //                 }]
    //             },
    //             {
    //                 label: 'QA',
    //                 styleClass: 'department-cto'
    //             },
    //             {
    //                 label: 'R&D',
    //                 styleClass: 'department-cto'
    //             }]
    //         }
    //     ]
    // }];
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  async get_org_hierarchy() {
    this.data1 = [];

    await this._employeeMgmtService.get_tp_hierarchy({
      'action': 'get_org_hierarchy',
      'account_id': this.tp_account_id,
    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.data1 = resData.commonData;

          // console.log(this.data1);
        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  add_root_level() {
    let data = this.orgForm.value;

    if (!data.level_role || !data.level_role_desc) {
      this.toastr.error("Role name and description required", 'Oops!');
      return;
    }

    let emp_codes = [];
    this.selectedItems.map((el: any) => {
      emp_codes.push(el.emp_code);
    })

    this._employeeMgmtService.manage_tp_hierarchy({
      'action': 'AddRootLevel',
      'account_id': this.tp_account_id,
      'level_role': data.level_role,
      'level_role_desc': data.level_role_desc,
      'row_id': data.row_id,
      'emp_code': emp_codes.join(','),

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.closeOptionOrgModal();
          this.get_org_hierarchy();

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  add_new_org_level() {
    let data = this.orgForm.value;
    // console.log(data);
    // return;

    if (!data.level_role || !data.level_role_desc) {
      this.toastr.error("Role name and description required", 'Oops!');
      return;
    }

    let emp_codes = [];
    this.selectedItems.map((el: any) => {
      emp_codes.push(el.emp_code);
    })

    this._employeeMgmtService.manage_tp_hierarchy({
      'action': 'AddNewOrgLevel',
      'account_id': this.tp_account_id,
      'level_role': data.level_role,
      'level_role_desc': data.level_role_desc,
      'row_id': data.row_id,
      'emp_code': emp_codes.join(','),

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.closeOptionOrgModal();
          this.get_org_hierarchy();

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  update_org_level() {
    let data = this.orgForm.value;

    if (!data.level_role || !data.level_role_desc) {
      this.toastr.error("Role name and description required", 'Oops!');
      return;
    }

    let emp_codes = [];
    this.selectedItems.map((el: any) => {
      emp_codes.push(el.emp_code);
    })

    this._employeeMgmtService.manage_tp_hierarchy({
      'action': 'EditOrgLevel',
      'account_id': this.tp_account_id,
      'level_role': data.level_role,
      'level_role_desc': data.level_role_desc,
      'row_id': data.row_id,
      'emp_code': emp_codes.join(','),

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.closeOptionOrgModal();
          this.get_org_hierarchy();

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }

  delete_org_level() {
    let data = this.orgForm.value;
    // console.log(data);
    // return;

    if (!data.level_role || !data.level_role_desc) {
      this.toastr.error("Role name and description required", 'Oops!');
      return;
    }

    this._employeeMgmtService.manage_tp_hierarchy({
      'action': 'RemoveOrgLevel',
      'account_id': this.tp_account_id,
      'level_role': data.level_role,
      'level_role_desc': data.level_role_desc,
      'row_id': data.row_id,

    }).subscribe({
      next: (resData: any) => {
        if (resData.statusCode) {
          this.toastr.success(resData.message, 'Success');
          this.closeOptionOrgModal();
          this.get_org_hierarchy();

        } else {
          this.toastr.error(resData.message, 'Oops!');
        }
      }
    })
  }


  // update_node_users() {
  //   let data = this.orgForm.value;
  //   console.log(data);
  //   console.log(this.selectedItems);

  //   let emp_codes = [];
  //   this.selectedItems.map((el:any) => {
  //     emp_codes.push(el.emp_code);
  //   })
  //   return;

  //   if (!data.level_role || !data.level_role_desc) {
  //     this.toastr.error("Role name and description required", 'Oops!');
  //     return;
  //   }

  //   this._employeeMgmtService.manage_tp_hierarchy({
  //     'action': 'UpdateNodeUsers',
  //     'account_id': this.tp_account_id,
  //     'level_role': data.level_role,
  //     'level_role_desc': data.level_role_desc,
  //     'row_id': data.row_id,
  //     'emp_code': emp_codes.join(','),

  //   }).subscribe({
  //     next: (resData: any) => {
  //       if (resData.statusCode) {
  //         this.toastr.success(resData.message, 'Success');
  //         this.closeOptionOrgModal();
  //         this.get_org_hierarchy();

  //       } else {
  //         this.toastr.error(resData.message, 'Oops!');
  //       }
  //     }
  //   })
  // }

  closeAddUpdateOrgModal() {
    this.showAddEditOrgModal = false;
    if (this.orgModalTitle != 'Add Root') {
      this.showOptionOrgModal = true;
    }

    this.orgForm.patchValue({
      level_role: '',
      level_role_desc: '',
      row_id: '',
    })
  }

  //Option Org Modal
  onNodeSelect(event: any) {
    this.selectedItems = [];
    this.selectedItems_table_data = [];

    // console.log(event)
    this.showOptionOrgModal = true;
    let children_length = !event.node.children ? 0 : event.node.children.length;

    this.node_selected_data = event.node;
    let data = this.node_selected_data.data;


    this.orgForm.patchValue({
      level_role: data.role_name,
      level_role_desc: data.role_desc,
      row_id: data.row_id,
      children_cnt: children_length,
    })
    // this.messageService.add({severity: 'success', summary: 'Node Selected', detail: event.node.label});

    // For Multiselect Dropdown Patch Value
    const emp_code_arr = !data.emp_codes ? [] : data.emp_codes.split(",").map((el) => el.trim());
    if (emp_code_arr.length > 0) {
      const filteredEmployees = this.userList_original.filter((e) =>
        emp_code_arr.includes(e.emp_code)
      );

      this.selectedItems = filteredEmployees.map((el) => ({
        emp_code: el.emp_code,
        emp_name: `${el.emp_name} (${el.tpcode})`,
      }));

      this.selectedItems_table_data = this.deepCopyArray(filteredEmployees);
    }

    this.selectedItems_copy = this.selectedItems;
    // console.log(this.selectedItems);
    // console.log(this.selectedItems_table_data);
  }



  closeOptionOrgModal() {
    this.showAddEditOrgModal = false;
    this.showOptionOrgModal = false;
    this.orgForm.patchValue({
      level_role: '',
      level_role_desc: '',
      row_id: '',
      children_cnt: 0,
    })
  }
  //Option Org Modal

  add_root_node() {
    this.orgModalTitle = 'Add Root';
    this.showAddEditOrgModal = true;
    this.showOptionOrgModal = false;
    // this.selectedItems_copy = this.selectedItems;
    this.selectedItems = [];

    this.orgForm.patchValue({
      level_role: '',
      level_role_desc: '',
    })

  }

  add_new_node() {
    this.orgModalTitle = 'Add';
    this.showAddEditOrgModal = true;
    this.showOptionOrgModal = false;
    // this.selectedItems_copy = this.selectedItems;
    this.selectedItems = [];

    this.orgForm.patchValue({
      level_role: '',
      level_role_desc: '',

    })
    // console.log(this.selectedItems, this.selectedItems_copy);

  }

  update_current_node() {
    this.orgModalTitle = 'Update';
    this.showAddEditOrgModal = true;
    this.showOptionOrgModal = false;
    this.selectedItems = this.selectedItems_copy;

    let data = this.node_selected_data.data;
    this.orgForm.patchValue({
      level_role: data.role_name,
      level_role_desc: data.role_desc,
      row_id: data.row_id,
    })

  }

  delete_current_node() {
    this.orgModalTitle = 'Delete';
    this.showAddEditOrgModal = true;
    this.showOptionOrgModal = false;
    this.selectedItems = this.selectedItems_copy;

    let data = this.node_selected_data.data;
    this.orgForm.patchValue({
      level_role: data.role_name,
      level_role_desc: data.role_desc,
      row_id: data.row_id,
    })
  }


  toggleNode(node: TreeNode, event: MouseEvent): void {
    node.expanded = !node.expanded;
    event.stopPropagation(); // Prevent triggering the node selection event
  }


  async getUserList() {
    this.showChart = false;
    let obj =
    {
      customeraccountid: this.tp_account_id.toString(),
      productTypeId: this.decoded_token.product_type.toString(),
      GeoFenceId: this.decoded_token.geo_location_id
    }

    await this.shiftSettingService.getUserList(obj)
      .subscribe((res: any) => {
        this.showChart = true;
        if (res.statusCode) {
          this.userList_original = [];
          this.userList_modified = [];

          let userList_original = res.commonData;
          userList_original.map((item) => {
            if (item.joiningstatus.trim() == 'Active' && item.dateofrelieveing == '') {
              this.userList_original.push({ ...item }); // shallow copy
              item.emp_name = item.emp_name + ` (${item.orgempcode != '' ? item.orgempcode : (item.tpcode ? item.tpcode : item.emp_code)})`
              this.userList_modified.push({ ...item }); // shallow copy
            }
          })

          // console.log(this.userList_original, this.userList_modified);
        } else {

        }
      })

  }

  onItemSelect(item: any) {
    // console.log(item);
    const isAlreadySelected = this.selectedItems.some(
      (selectedItem) => selectedItem.emp_code == item.emp_code
    );

    if (!isAlreadySelected) {
      this.selectedItems.push(item);
    }

    // console.log(this.selectedItems);
  }

  onSelectAll(items: any) {
    this.selectedItems = [...items];
    // console.log(this.selectedItems);
  }

  onItemUnselect(item: any) {
    this.selectedItems = this.selectedItems.filter((selectedItem) => selectedItem.emp_code !== item.emp_code);
  }

  onUnselectAll(items) {
    this.selectedItems = [];
  }

  get_node_user_cnt(data: any) {
    if (data && data.emp_codes) {
      let arr = data.emp_codes.split(",");
      return arr.length;
    }
    return 0;
  }

  /**Deep Copy**/
  deepCopyArray(arr) {
    const copy = [];

    arr.forEach(item => {
      if (Array.isArray(item)) {
        copy.push(this.deepCopyArray(item)); // Recursively copy arrays
      } else if (typeof item === 'object' && item !== null) {
        copy.push(this.deepCopyObject(item)); // Recursively copy objects
      } else {
        copy.push(item); // Copy primitive values
      }
    });

    return copy;
  }
  deepCopyObject(obj) {
    const copy = {};

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (Array.isArray(obj[key])) {
          copy[key] = this.deepCopyArray(obj[key]); // Recursively copy arrays
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          copy[key] = this.deepCopyObject(obj[key]); // Recursively copy objects
        } else {
          copy[key] = obj[key]; // Copy primitive values
        }
      }
    }

    return copy;
  }
  /**Deep Copy**/
}
