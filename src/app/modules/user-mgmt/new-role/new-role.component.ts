import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup,FormControl, Validators } from '@angular/forms';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { UserMgmtService } from '../user-mgmt.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { ActivatedRoute } from '@angular/router';
import { AlertService } from 'src/app/shared/_alert';
import { GlobalConstants } from 'src/app/shared/global-constants';
import { dongleState, grooveState } from 'src/app/app.animation';

declare var $:any;

@Component({
  selector: 'app-new-role',
  templateUrl: './new-role.component.html',
  styleUrls: ['./new-role.component.css'],
  animations: [grooveState, dongleState]
})
export class NewRoleComponent {

  showSidebar: boolean = true;
  editRoleForm : FormGroup;
  token : any;
  tp_account_id: any;
  product_type:any;
  modules:any=[];
  roleid:any;
  roleData: any={};
  privilegeData: any=[];
  moduleForm: FormGroup;
  isSubmodule: boolean = false;
  subModuleForm : FormGroup;
  index: number;

  constructor(
    private _SessionService : SessionService,
    private _userMgmtService : UserMgmtService,
    private _formBuilder : FormBuilder,
    private _encrypterService : EncrypterService,
    private router : ActivatedRoute,
    private _alertservice : AlertService
  ){
    this.router.params.subscribe(param=>{
      this.roleid =this._encrypterService.aesDecrypt(param.id);
    })
  }

  ngOnInit(){
    let session_obj_d: any = JSON.parse(this._SessionService.get_user_session());
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = this.token.product_type;

    this.editRoleForm = this._formBuilder.group({
      roleName :[''],
      roledesc : ['']
    })

    this.moduleForm = this._formBuilder.group({
      module : new FormArray([])
    })

    this.subModuleForm = this._formBuilder.group({
      subModule : ['',[Validators.required]],
      moduleid : [''],
      linkname:[''],
      postLink : ['',[Validators.required,Validators.pattern(/^[a-zA-Z].*$/)]] 
    })
    this.getRolebyId();
    this.getModules();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  get moduleArr(){
    return this.moduleForm.controls.module as FormArray;
  }

  getRolebyId(){
    this._userMgmtService.getRoleById({'roleid':Number(this.roleid)}).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.roleData = this._encrypterService.aesDecrypt(resData.commonData) !=''?JSON.parse(this._encrypterService.aesDecrypt(resData.commonData)):'';
        this.editRoleForm.patchValue({
          roleName : this.roleData.role_name,
          roledesc : this.roleData.role_description
        })
        
        this.getPrivilege();
      }
    })
  }
  getModules(){
    this._userMgmtService.getModules({}).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.modules = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
     
        this.modules.forEach(ele => {
            // let submodule = ele.sub_module!=null ? JSON.parse(ele.sub_module) :[];
          let submodule = ele.sub_module!=null ? (ele.sub_module) :[];
         
          const moduleGroup =this._formBuilder.group({
            'moduleid': ele.moduleid,
            'privilegeid': ele.privilegeid,
            'accessid': ele.accessid,
            'modulename_display': ele.modulename_display,
            'linkname': ele.linkname,
            'submodules': this._formBuilder.array([]) 
          });

          this.subModuleForm.patchValue({
            linkname : ele.linkname
          })
          
          const submodulesArray = moduleGroup.get('submodules') as FormArray;
  
            submodulesArray.push(this._formBuilder.group({
              submoduleid : ele.moduleid,
              submodulename_display : ele.modulename_display,
              parentid : 1,
              fullaccess : false,
              view: false,
              edit: false,
              create : false
            }))
            submodule.forEach(submodule => {
              const submoduleGroup = this._formBuilder.group({
                submoduleid: submodule.moduleid,
                submodulename_display: submodule.modulename,
                parentid : submodule.parentid,
                fullaccess : false,
                view: false,
                edit: false,
                create: false,
                sub_module_1 : this._formBuilder.array([])
              });

              submodulesArray.push(submoduleGroup);

              if (submodule.sub_module_1) {
                const submodule1Array = submoduleGroup.get('sub_module_1') as FormArray;
                submodule.sub_module_1.forEach(submodule1 => {
                  submodule1Array.push(this._formBuilder.group({
                    submoduleid: submodule1.moduleid,
                    submodulename_display: submodule1.modulename,
                    parentid: submodule1.parentid,
                    fullaccess: false,
                    view: false,
                    edit: false,
                    create: false
                  }));
                });
              }
            });
          
          this.moduleArr.push(moduleGroup);
        });
        this.getPrivilege();
      }else{
        this.modules =[];
      }
    })
  }

  savePrivilege(idx:number){

    let length = $('.moduleCheckbox').length;
    let postData :any={
    'profileid': this.roleData.role_id.toString(),
    'updateBy': this.token.id};
    let indexData=[];
    let submodules= this.moduleArr.controls[idx].value.submodules;

    this.index= idx;
    let isModuleChecked=false;
    for(let i=0;i<submodules.length;i++){
         indexData.push({
          'moduleid': submodules[i].submoduleid,
          'modulename' : submodules[i].submodulename_display,
          // 'submoduleid': submodules[i].submoduleid,
          'parentmodule':submodules[i].parentid,
          "view_checked":submodules[i].view,
          "add_checked":submodules[i].create,
          "edit_checked":submodules[i].edit,  
          "fullcontrol_checked":submodules[i].fullaccess,
        })

        if(submodules[i].sub_module_1){
          for(let j=0;j< submodules[i].sub_module_1.length;j++){
            let sub_module_1 = submodules[i].sub_module_1;
            indexData.push({
              'moduleid': sub_module_1[j].submoduleid,
            'modulename' : sub_module_1[j].submodulename_display,
            // 'submoduleid': submodules[i].submoduleid,
            'parentmodule':sub_module_1[j].parentid,
            "view_checked":sub_module_1[j].view,
            "add_checked":sub_module_1[j].create,
            "edit_checked":sub_module_1[j].edit,  
            "fullcontrol_checked":sub_module_1[j].fullaccess,
            })
          }
        }
        if((submodules[i].view || submodules[i].create || submodules[i].edit) && i!=0){
          isModuleChecked=true;
        }
        if(submodules[i].parentid!=1 && (submodules[i].view || submodules[i].create || submodules[i].edit) && !submodules[0].fullaccess){
          indexData.push({
            'moduleid': submodules[0].submoduleid,
            'modulename' : submodules[0].submodulename_display,
            // 'submoduleid': submodules[i].submoduleid,
            'parentmodule': submodules[0].parentid,
            "view_checked":true,
            "add_checked":true,
            "edit_checked":true,  
            "fullcontrol_checked":true,
            "sub_module_1": submodules[0].sub_module_1
          })
        }

        if(submodules.length>1 && submodules[i].submodulename_display== submodules[0].submodulename_display && i!=0){
          if(i==submodules.length-1 && !isModuleChecked){
            indexData[0]={
              'moduleid': submodules[0].submoduleid,
              'modulename' : submodules[0].submodulename_display,
              // 'submoduleid': submodules[i].submoduleid,
              'parentmodule':submodules[0].parentid,
              "view_checked":false,
              "add_checked":false,
              "edit_checked":false,  
              "fullcontrol_checked":false,
              "sub_module_1": submodules[0].sub_module_1
            }
          }
        }
    }
    if (submodules.length > 1 && submodules[0].parentid == 1 && !isModuleChecked) {
      indexData[0] = {
          'moduleid': submodules[0].submoduleid,
          'modulename': submodules[0].submodulename_display,
          'parentmodule': submodules[0].parentid,
          "view_checked": false,
          "add_checked": false,
          "edit_checked": false,
          "fullcontrol_checked": false,
          "sub_module_1": submodules[0].sub_module_1
      };
  }

    postData ={
      'privilegeText': JSON.stringify(indexData),
      ...postData,
    }

 
      this._userMgmtService.savePrivilege(postData).subscribe((resData:any)=>{
        if(resData.statusCode){
          this.getPrivilege();
          this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose);
          return
        }else{
          this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose);
          return

        }
      })
      
  }

  getPrivilege(){

    this._userMgmtService.getPrivilege({'profileid':Number(this.roleData.role_id)}).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.privilegeData = JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
        for(const privilege of this.privilegeData){
       
          if(privilege.parentid!=1){
            for(let j=0;j<(this.moduleArr.length);j++){
              // console.log(privilege)
                let module =this.moduleArr.controls[j];
                
              if(module.value.moduleid== privilege.parentid){
                for(let i=0;i< module.value.submodules.length;i++){
                  let subModuleArr=((this.moduleForm.get('module') as FormArray).at(j).get('submodules') as FormArray).at(i) as FormGroup;
                //  console.log(module.value)
                  if(subModuleArr.controls.submoduleid.value==privilege.moduleid){
                    subModuleArr.patchValue({
                      fullaccess : privilege.fullcontrol !=0 ? true: false,
                      view: privilege.view !=0 ? true: false,
                      edit: privilege.edit !=0 ? true: false,
                      create: privilege.add !=0 ? true: false
                    })
                  }

                }

              }
              for(let i=0;i< module.value.submodules.length;i++){
                let subModuleArr=((this.moduleForm.get('module') as FormArray).at(j).get('submodules') as FormArray).at(i) as FormGroup;
                let sub_module_1_Arr = subModuleArr.get('sub_module_1') ?subModuleArr.get('sub_module_1') as FormArray: new FormArray([]);
             
                for(let k=0;k< sub_module_1_Arr.value.length;k++){
                  let sub_module_1= sub_module_1_Arr.at(k) as FormGroup;
                  
                  if(sub_module_1.value.submoduleid==privilege.moduleid){
                    sub_module_1.patchValue({
                      fullaccess : privilege.fullcontrol !=0 ? true: false,
                      view: privilege.view !=0 ? true: false,
                      edit: privilege.edit !=0 ? true: false,
                      create: privilege.add !=0 ? true: false
                    })
                  }
                  
                }
              }
            }          
          }else{
            for(let j=0;j<(this.moduleArr.length);j++){;
              
              let module =this.moduleArr.controls[j];
              
              for(let i=0;i< module.value.submodules.length;i++){
                let subModuleArr=((this.moduleForm.get('module') as FormArray).at(j).get('submodules') as FormArray).at(i) as FormGroup;
                if(subModuleArr.controls.submoduleid.value==privilege.moduleid){
                  subModuleArr.patchValue({
                    fullaccess : privilege.fullcontrol !=0 ? true: false,
                    view: privilege.view !=0 ? true: false,
                    edit: privilege.edit !=0 ? true: false,
                    create: privilege.add !=0 ? true: false
                  })
                }
                
              }
            }
          }
        }
    
      }else{
        this.privilegeData=[];
      }
    })
  }

  showSubModule(module :any){

    this.isSubmodule= true;
    console.log(module);

    this.subModuleForm.patchValue({
      moduleid : module.moduleid,
      linkname : module.linkname +'/'
    })

    this.subModuleForm.controls.linkname.setValidators([Validators.minLength(module.linkname.length+1)])
    this.subModuleForm.get('linkname').updateValueAndValidity()
  }

  addSubModule(){

    if(this.subModuleForm.controls.subModule.errors){
      return this._alertservice.error('Please Enter Submodule name', GlobalConstants.alert_options_autoClose); 
    }
    if(this.subModuleForm.controls.postLink.errors && this.subModuleForm.controls.postLink.errors.pattern){
      return this._alertservice.error('Please Enter valid Submodule Link', GlobalConstants.alert_options_autoClose); 
    }
    if(this.subModuleForm.controls.postLink.errors){
      return this._alertservice.error('Please Enter Submodule Link', GlobalConstants.alert_options_autoClose); 
    }
    let postData ={
      ...this.subModuleForm.value,
      'updateBy': this.token.tp_account_id,
      'action': 'insert_submodule'
    }
    this._userMgmtService.addSubmodules(postData).subscribe((resData:any)=>{
      if(resData.statusCode){
        this.closeSubModule();
        return this._alertservice.success(resData.message, GlobalConstants.alert_options_autoClose); 
      }else{
        return this._alertservice.error(resData.message, GlobalConstants.alert_options_autoClose); 
      }
    })
  }

  closeSubModule(){
    this.isSubmodule=false;
    this.subModuleForm.reset();
    this.moduleArr.clear();
    this.getModules();
  }

  toggleAllPermissions(checked: any, moduleIndex: number, subModulIdx: number, subModule1Idx?: number) {
    const submodulesArray = ((this.moduleForm.get('module') as FormArray).at(moduleIndex).get('submodules') as FormArray).at(subModulIdx) as FormGroup;
  
    if (subModule1Idx === undefined) {
      // Toggle permissions for main submodule (Level 1)
      submodulesArray.patchValue({
        fullaccess: checked.target.checked,
        view: checked.target.checked,
        create: checked.target.checked,
        edit: checked.target.checked
      });
  
      // If sub_module_1 exists, also toggle permissions for all of its submodules (Level 2)
      const submodule1Array = submodulesArray.get('sub_module_1') as FormArray;
      if (submodule1Array) {
        submodule1Array.controls.forEach((submodule1: FormGroup) => {
          submodule1.patchValue({
            fullaccess: checked.target.checked,
            view: checked.target.checked,
            create: checked.target.checked,
            edit: checked.target.checked
          });
        });
      }
    } else {
      // Toggle permissions only for a specific sub_module_1 (Level 2)
      const submodule1Array = submodulesArray.get('sub_module_1') as FormArray;
      if (submodule1Array) {
        const submodule1 = submodule1Array.at(subModule1Idx) as FormGroup;
        submodule1.patchValue({
          fullaccess: checked.target.checked,
          view: checked.target.checked,
          create: checked.target.checked,
          edit: checked.target.checked
        });
      }
      let isSubModule1Checked = false;
      for(let i=0;i< submodule1Array.length;i++){
        if(submodule1Array.value[i].create || submodule1Array.value[i].edit || submodule1Array.value[i].view
          || submodule1Array.value[i].fullaccess
        ){
          isSubModule1Checked = true;
        }
      }
      submodulesArray.patchValue({
        fullaccess: isSubModule1Checked,
        view: isSubModule1Checked,
        create: isSubModule1Checked,
        edit: isSubModule1Checked
      })
    }
  }
  
  updateFullAccess(i: number, j: number, subModule1Idx?: number) {
    const submodules = (this.moduleForm.get('module') as FormArray).at(i).get('submodules') as FormArray;
    const submodule = submodules.at(j) as FormGroup;
    const permissions = ['view', 'create', 'edit'];
  
    if (subModule1Idx === undefined) {
      // Check permissions for the main submodule (Level 1)
      const allChecked = permissions.every(perm => submodule.get(perm).value);
  
      // Update fullaccess for the main submodule (Level 1)
      submodule.get('fullaccess').setValue(allChecked);
  
      // Check if sub_module_1 exists and update its fullaccess
      const submodule1Array = submodule.get('sub_module_1') as FormArray;
      if (submodule1Array) {
        submodule1Array.controls.forEach((submodule1: FormGroup) => {
          const allSubmodule1Checked = permissions.every(perm => submodule1.get(perm).value);
          submodule1.get('fullaccess').setValue(allSubmodule1Checked);
        });
      }
    } else {
      // Update full access for a specific sub_module_1 (Level 2)
      const submodule1Array = submodule.get('sub_module_1') as FormArray;
      if (submodule1Array) {
        const submodule1 = submodule1Array.at(subModule1Idx) as FormGroup;
        const allChecked = permissions.every(perm => submodule1.get(perm).value);
        submodule1.get('fullaccess').setValue(allChecked);
      }
      let isSubModule1Checked = false;
      for(let i=0;i< submodule1Array.length;i++){
        if(submodule1Array.value[i].create || submodule1Array.value[i].edit || submodule1Array.value[i].view
          || submodule1Array.value[i].fullaccess
        ){
          isSubModule1Checked = true;
        }
      }
      submodule.patchValue({
        fullaccess: isSubModule1Checked,
        view: isSubModule1Checked,
        create: isSubModule1Checked,
        edit: isSubModule1Checked
      })
    }
  }
  
  
  
}
