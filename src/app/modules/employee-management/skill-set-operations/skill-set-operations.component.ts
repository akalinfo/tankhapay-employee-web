import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, Input, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { SkillSetService } from './services/skill-set.service';
import { GeneralSettingService } from './services/general-setting.service';
import { environment } from 'src/environments/environment';
import { Environment } from '@tensorflow/tfjs';


@Component({
  selector: 'app-skill-set-operations',
  templateUrl: './skill-set-operations.component.html',
  styleUrls: ['./skill-set-operations.component.css']
})

export class SkillSetOperationsComponent {
  @Input() empCode!: string;

  public showDropdown: boolean = false;
  public showSidebar: boolean = true;
  showFilter: any = false;
  upgradeForm: FormGroup
  addSkillForm: FormGroup;
  dropdownSettings: {};
  filteredSkillSetList: any = [];
  department: { id: number; name: string; }[];
  goalSelect: any = '';
  operationName: any = '';
  skill: any;
  weightage: any;
  token: any;
  tp_account_id: any;
  product_type: any;
  renameData: any;
  searchSkillText: any;
  skillSetList: any;
  user_id: any;
  tagSkillSetList: any;
  skill_set_upgradeid: any;
  updateSkillSetlevelObj: any;
  originalTexts: any;
  levelPotential: number;
  textMatch: any;
  fileName: any;
  fileUploadData: any;
  skillSetMetrix: any;
  originpathformsession: string;


  selectOperation(val: any) {
    if (val == 'imp-kra') this.operationName = 'imp-kra';
    else if (val == 'exp-kra') this.operationName = 'exp-kra';
    else if (val == 'imp-skill-set') this.operationName = 'imp-skill-set';
    else if (val == 'exp-skill-set') this.operationName = 'exp-skill-set';
    else if (val == 'imp-competency') this.operationName = 'imp-competency';
    else if (val == 'exp-competency') this.operationName = 'exp-competency';
  }


  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  isShowFilter() {
    this.showFilter = !this.showFilter
  }



  constructor(
    private fb: FormBuilder,
    private encriptedService: EncrypterService,
    private _SessionService: SessionService,
    private toastr: ToastrService,
    private generalSettingService: GeneralSettingService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private skillSetService: SkillSetService,
    private renderer: Renderer2,
    private el: ElementRef) {

    this.addSkillForm = this.fb.group({
      title: ["", Validators.required],
      description: [""]
    })

    this.upgradeForm = this.fb.group({
      attachDocument: [""],
      reason: [""],
    })

  }


  ngOnInit() {

    this.originpathformsession = sessionStorage.getItem('opr_sourcepath');
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = this.token.product_type;

    this.renameData = JSON.parse(localStorage.getItem('renameObj'))
    // this.user_id = JSON.parse(localStorage.getItem('emp_id'));
    this.user_id = this.empCode;
    // console.log("Employee Code received:", this.empCode);
    if (environment.production == false || this.tp_account_id == '6148' || this.tp_account_id == '3088') {
      this.getDepartmentList();
      this.getSkillSet();
      this.getAlltaggedSkillSet();
      this.getSkillSetSettings();
    }

  }

  // ngAfterViewInit() {
  //   const modal = this.el.nativeElement.querySelector('#tag-skillset');
  //   if (modal) {
  //     this.renderer.appendChild(document.body, modal);
  //   }
  // }

  ngAfterViewInit(): void {
    const modalIds = ['tag-skillset', 'level-upgrade-skillset', 'delete-skillset-model', 'add-skillset'];
    modalIds.forEach(id => {
      const modal = this.el.nativeElement.querySelector(`#${id}`);
      if (modal) {
        this.renderer.appendChild(document.body, modal);
      }
    });
  }

  ngOnDestroy(): void {
    const modalIds = ['tag-skillset', 'level-upgrade-skillset', 'delete-skillset-model', 'add-skillset'];
    modalIds.forEach(id => {
      const modal = document.body.querySelector(`#${id}`);
      if (modal) {
        document.body.removeChild(modal);
      }
    });
  }

  async getDepartmentList() {

    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 2,
      allowSearchFilter: true
    };

    this.department = [
      { id: 0, name: 'Sid' },
      { id: 1, name: 'Mohan' },
      { id: 2, name: 'Rohan' },
      { id: 3, name: 'Sohan' },
    ]
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;
  }

  /////////////////////////////////////////////////////////

  // itemsArray: Array<{ id: number, level: number, weightage: number }> = [];

  // onCheckboxChange(event: any,item:any) {
  //   if (event.target.checked) {
  //     this.itemsArray.push();
  //   } else {
  //     this.itemsArray = this.itemsArray.filter(item => item.id !== this.item.id);
  //   }
  //   console.log(this.itemsArray);
  // }

  // onLevelChange(event: any) {
  //   this.item.level = +event.target.value;
  //   this.itemsArray = this.itemsArray.map(item => {
  //     if (item.id === this.item.id) {
  //       return { ...item, level: this.item.level };
  //     }
  //     return item;
  //   });
  //   console.log(this.itemsArray);
  // }

  /////////////////////////////////////////////////////////////////////////////////////

  public skillToArray = []

  addSkillToArray(val) {

    let obj = {

      id: val?.id,
      level: '0',
      title: val?.title

    }

    if (!this.skillToArray.some(skill => skill.id === obj.id)) {
      this.skillToArray.push(obj);

    } else {
      this.skillToArray = this.skillToArray.filter(skill => skill.id !== val.id);
    }

  }

  isSkillChecked(id) {
    return this.skillToArray.some(skill => skill.id === id);
  }

  updateSkillLevel(id, event) {
    const level = event.target.value;
    const skill = this.skillToArray.find(skill => skill.id === id);
    if (skill) {
      skill.level = level;
    }
  }


  createSkillSet() {

    let obj = {

      customeraccountid: this.tp_account_id?.toString(),
      action: "save_new_skill_set_tags",
      tag_type: "userspecific",
      tag_id: this.user_id?.toString(),
      selected_skill_set: this.skillToArray

    }

    this.skillSetService.tagSkillSet(obj).subscribe((res: any) => {
      if (res?.statusCode) {
        this.toastr.success(res?.message);
        this.getAlltaggedSkillSet();
        this.getSkillSet();
      } else {
        this.toastr.error(res?.message);
      }
    })

  }


  // showSelect: boolean = false;
  // selectedLevel: string = 'Level 1';
  // levels: string[] = ['Level 1', 'Level 2', 'Level 3'];

  // onCheckboxChange() {
  //   if (!this.showSelect) {
  //     this.selectedLevel = this.levels[0];
  //   }
  // }

  ////////////////////////////////////////////////////////////////////


  toggleVisibility(skill) {
    skill.isVisible = !skill.isVisible;
  }


  getSkillSet() {

    let obj = {

      action: "GET_USERSPECIFIC_SKILLSET",
      customeraccountid: this.tp_account_id?.toString(),
      isactive: true,
      search_text: this.searchSkillText,
      user_id: this.user_id?.toString()

    }


    this.skillSetService.getSkillSet(obj).subscribe((res: any) => {
      if (res.statusCode) {

        this.filteredSkillSetList = [];

        if (res?.message == 'Record not found') {
          this.skillSetList = res?.commonData
        } else {
          let decryptData = JSON.parse(this.encriptedService.aesDecrypt(res.commonData))
          this.skillSetList = decryptData;
          this.skillSetList.forEach(skill => {
            skill.isVisible = false;
          });

          this.filteredSkillSetList = this.skillSetList
          // console.log("SKILL SET------------", this.filteredSkillSetList)

        }
      } else {
        this.toastr.error(res?.message)
      }
    })
  }


  getAlltaggedSkillSet() {

    let obj = {

      action: "GET_SKILL_SET_TAGS",
      customeraccountid: this.tp_account_id?.toString(),
      tag_type: "userspecific",
      tag_id: this.user_id?.toString(),
      isactive: true

    }

    this.skillSetService.getSkillSetTag(obj).subscribe((res: any) => {
      if (res?.statusCode) {
        let dData = JSON.parse(this.encriptedService.aesDecrypt(res?.commonData))
        this.tagSkillSetList = dData;
        this.calculatePotential(this.tagSkillSetList)
      } else {
        this.toastr.error(res?.message)
      }
    })

  }

  ///////////////////////////////////////////  Level Potential Calculation ////////////////////////////////////////


  calculatePotential(data) {

    let totalWeightedScore = 0;
    let maxPossibleScore = 0;

    data.forEach(skill => {
      const weightage = skill.latest_weightage / 100;
      const level = skill.latest_level;

      // Weighted score for the current skill
      totalWeightedScore += level * weightage;

      // Maximum possible weighted score for the current skill
      maxPossibleScore += 4 * weightage;
    });

    // Calculate the potential
    const potential = (totalWeightedScore / maxPossibleScore) * 100;

    this.levelPotential = potential;

  }


  onWeightageInput(skill: any) {
    if (skill.latest_weightage > 100) {
      skill.latest_weightage = 100;
    } else if (skill.latest_weightage < 0) {
      skill.latest_weightage = 0;
    }
  }


  updateSkillSetLevel(val) {

    this.updateSkillSetlevelObj = val
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileName = file.name;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Data = (reader.result as string).split(',')[1];
        this.uploadFile(base64Data, file.name);
      };
      reader.onerror = (error) => {
        this.toastr.error('Failed to read file', 'Error');
      };
    } else {
      this.fileName = "Choose file"
    }
  }

  detectMimeType(b64): any {

    var signatures = {
      JVBERi0: "application/pdf",
      R0lGODdh: "image/gif",
      R0lGODlh: "image/gif",
      iVBORw0KGgo: "image/png",
      "/9j/": "image/jpg"
    };

    for (var s in signatures) {
      if (b64.indexOf(s) === 0) {
        return signatures[s] + ";base64,";
      }
    }
  }


  uploadFile(base64Data: string, fileName: string) {
    // this.isUploading = true;

    let base64Data1 = "data:" + this.detectMimeType(base64Data) + base64Data;

    const payload = {
      data: base64Data1,
      name: fileName,
      type: 'methods',

    };

    this.skillSetService.fileUpload(payload).subscribe(
      (response: any) => {
        // this.isUploading = false;
        if (response?.status) {
          this.toastr.success(response?.msg);
          let dData = JSON.parse(this.encriptedService.aesDecrypt(response?.commmonData));
          this.fileUploadData = dData;
          // this.uploadForm.patchValue({
          //   doc: response.file_path
          // });
        } else {
          this.toastr.error(response?.msg);
        }
      }
    )
  }



  submitUpgradedSkillSet() {

    let obj = {

      customeraccountid: this.tp_account_id?.toString(),
      action: "upgrade_skill_set_tags",
      tag_id: this.updateSkillSetlevelObj?.tag_id?.toString(),
      skillset_id: this.updateSkillSetlevelObj?.skill_set_id?.toString(),
      skill_set_tag_id: this.updateSkillSetlevelObj?.id?.toString(),
      skillset_supportingdoc: this.fileUploadData?.file_path,
      skillset_upgradereason: this.upgradeForm?.value?.reason,
      skillset_weightage: this.updateSkillSetlevelObj?.latest_weightage?.toString(),
      skillset_level: this.updateSkillSetlevelObj?.latest_level?.toString(),
      skillset_doc_name: this.fileUploadData?.file_name,
      emp_code: this.user_id?.toString(),

    }

    this.skillSetService.tagSkillSet(obj).subscribe((res: any) => {
      if (res?.statusCode) {
        this.toastr.success(res?.message);
        this.getAlltaggedSkillSet();
        this.upgradeForm.reset();
      } else {
        this.toastr.error(res?.message)
      }
    })

  }


  deleteSkillSetLevelWise(val, text) {

    this.skill_set_upgradeid = val;
    this.textMatch = text

  }


  confirmDelete() {

    let obj = {

      customeraccountid: this.tp_account_id?.toString(),
      action: "delete_skill_set_tags_ByUser",
      tag_type: this.skill_set_upgradeid?.tag_type,
      tag_id: this.skill_set_upgradeid?.tag_id?.toString(),
      user_id: this.user_id?.toString(),
      skill_set_tag_id: (this.textMatch == 'parent') ? (this.skill_set_upgradeid?.id?.toString()) : (this.skill_set_upgradeid?.skill_set_tag_id?.toString()),
      skill_set_upgradeid: (this.textMatch == 'parent') ? null : this.skill_set_upgradeid?.id?.toString()

    }

    this.skillSetService.tagSkillSet(obj).subscribe((res: any) => {
      if (res?.statusCode) {
        this.getAlltaggedSkillSet();
        this.getSkillSet();
        this.toastr.success(res?.message)
      } else {
        this.toastr.error(res?.message)
      }
    })

  }

  ///////////////////////////////////  Update skillset Weightage //////////////////////////////////


  toggleEditMode(index: number) {
    this.originalTexts = this.tagSkillSetList[index]?.latest_weightage;
    this.tagSkillSetList[index].isEditMode = !this.tagSkillSetList[index].isEditMode;
    if (!this.tagSkillSetList[index].isEditMode) {
      this.cdr.detectChanges();
    }
  }

  save(index: number) {

    this.tagSkillSetList[index].isEditMode = false;

    let obj = {

      customeraccountid: this.tp_account_id?.toString(),
      action: "update_skill_set_weightage",
      skill_set_tag_id: this.tagSkillSetList[index]?.id?.toString(),
      skillset_weightage: this.tagSkillSetList[index]?.latest_weightage?.toString(),
      skill_set_upgradeid: this.tagSkillSetList[index]?.latest_upgarde_id?.toString()

    }


    this.skillSetService.tagSkillSet(obj).subscribe((res: any) => {
      if (res?.statusCode) {
        this.toastr.success(res?.message);
        this.getAlltaggedSkillSet();
      } else {
        this.toastr.error(res?.message)
        let dData = this.encriptedService.aesDecrypt(res?.commonData)
      }
    })
  }

  cancel(index: number) {

    this.tagSkillSetList[index].kra_weightage = this.originalTexts;
    this.tagSkillSetList[index].isEditMode = false;

  }


  ////////////////////////////////// searching ///////////////////////////////////

  searchSkillSet(event: any) {
    let term = event.target.value
    const searchTerm = term?.toLowerCase();
    this.filteredSkillSetList = this.skillSetList.filter((item: any) => {
      return item?.title.toLowerCase().includes(searchTerm);
    });
  }


  getSkillSetSettings() {

    let obj = {
      action: "GET_CONFIGURATION",
      customeraccountid: this.tp_account_id.toString(),
      module_id: '5'
    }

    this.generalSettingService.getKraSettings(obj).subscribe((res: any) => {
      if (res.statusCode) {
        let decriptData = JSON.parse(this.encriptedService.aesDecrypt(res?.commonData))
        this.skillSetMetrix = decriptData[0];
        // console.log(this.skillSetMetrix,">>>>>>>>>this.oppppppppppp>>>>>>>")
      } else {
        this.toastr.error(res?.message)
      }
    })
  }


  popupType: any = 'addSkill'
  skillSetId: any

  createSkillCatalogue() {

    if (this.addSkillForm.invalid) {
      this.addSkillForm.markAllAsTouched();

    } else {

      let obj = {

        customeraccountid: this.tp_account_id.toString(),
        skill_set_title: this.addSkillForm.value.title,
        action: "INSERT_UPDATE_SKILL_SET",
        skill_set_desc: this.addSkillForm.value.description,
        skill_set_userspecific: true,
        // createdby_ip: "192.168.1.1",
        id: this.popupType == 'addSkill' ? '' : this.skillSetId.toString()

      }

      // console.log(obj,"objobjjjjjjjjjjjjjjj")

      this.skillSetService.createSkillSet(obj).subscribe((res: any) => {
        if (res.statusCode) {
          this.toastr.success(res?.message)
          this.addSkillForm.reset();
          this.getSkillSet()
        } else {
          this.toastr.error(res?.message)
        }
      })
    }

  }

  cancelForm() {

  }

}


