import { Component, ElementRef, ViewChild } from '@angular/core';
import { RecruitService } from '../../recruit/recruit.service';
import { SessionService } from 'src/app/shared/services/session.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import decode from 'jwt-decode';
import { ToastrService } from 'ngx-toastr';
import { EmployeeManagementService } from '../employee-management.service';
import { ActivatedRoute, Router } from '@angular/router';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import insertTextAtCursor  from 'insert-text-at-cursor';

declare var $:any;

@Component({
  selector: 'app-create-letter',
  templateUrl: './create-letter.component.html',
  styleUrls: ['./create-letter.component.css']
})
export class CreateLetterComponent {
  showSidebar: boolean = true;
  tp_account_id: any;
  templateTypeList:any[]=[];
  templateForm: FormGroup;
  cursorPosition: any=null;
  currentCursorField: any=null;
  lastRange: any;
  templateFormField: any=[];
  popupType: string;
  token: any;
  templateList: any[]=[];
  submitted: boolean=false;
  product_type: string;
  letterid: any='';
  letterType: any='';
  masterTemplateList: any=[];
  letterTypeId: any;
  isListVisible: boolean = false;
  searchTerm: string = '';
  filteredFields: any[] = [];
  editorInstance: any;
  // editorConfig: AngularEditorConfig = {
  //   editable: true,
  //   spellcheck: true,
  //   height: '15rem',
  //   minHeight: '5rem',
  //   placeholder: 'Enter text here...',
  //   translate: 'no',
  //   defaultParagraphSeparator: 'p',
  //   defaultFontName: 'Arial',
  //   toolbarHiddenButtons: [
  //     ['bold']
  //     ],
  //   customClasses: [
  //     {
  //       name: "quote",
  //       class: "quote",
  //     },
  //     {
  //       name: 'redText',
  //       class: 'redText'
  //     },
  //     {
  //       name: "titleText",
  //       class: "titleText",
  //       tag: "h1",
  //     },
  //   ]
  // };

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    fonts: [
      { class: 'arial', name: 'Arial' },
      { class: 'times-new-roman', name: 'Times New Roman' },
      { class: 'calibri', name: 'Calibri' },
      { class: 'comic-sans-ms', name: 'Comic Sans MS' },
      { class: 'courier-new', name: 'Courier New' },
      { class: 'georgia', name: 'Georgia' },
      { class: 'helvetica', name: 'Helvetica' },
      { class: 'impact', name: 'Impact' },
      { class: 'verdana', name: 'Verdana' }
    ],
    // toolbarHiddenButtons: [
    //   ['bold'] // example
    // ],
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ]
  };

  // public config: any = {
  //   airMode: false,
  //   tabDisable: true,
  //   popover: {
  //     table: [
  //       ['add', ['addRowDown', 'addRowUp', 'addColLeft', 'addColRight']],
  //       ['delete', ['deleteRow', 'deleteCol', 'deleteTable']],
  //     ],
  //     image: [
  //       ['image', ['resizeFull', 'resizeHalf', 'resizeQuarter', 'resizeNone']],
  //       ['float', ['floatLeft', 'floatRight', 'floatNone']],
  //       ['remove', ['removeMedia']]
  //     ],
  //     link: [
  //       ['link', ['linkDialogShow', 'unlink']]
  //     ],
  //     air: [
  //       [
  //         'font',
  //         [
  //           'bold',
  //           'italic',
  //           'underline',
  //           'strikethrough',
  //           'superscript',
  //           'subscript',
  //           'clear'
  //         ]
  //       ],
  //     ]
  //   },
  //   height: '350px',
  //   // uploadImagePath: '/api/upload',
  //   toolbar: [
  //     ['misc', ['codeview', 'undo', 'redo', 'codeBlock']],
  //     [
  //       'font',
  //       [
  //         'bold',
  //         'italic',
  //         'underline',
  //         'strikethrough',
  //         'superscript',
  //         'subscript',
  //         'clear'
  //       ]
  //     ],
  //     ['fontsize', ['fontname', 'fontsize', 'color']],
  //     ['para', ['style0', 'ul', 'ol', 'paragraph', 'height']],
  //     ['insert', ['table', 'link', 'hr']],
  //     ['insert', ['table', 'picture', 'link', 'video', 'hr']],
  //   ],
  //   callbacks: {
  //     onImageUpload: (files: File[]) => {
  //       this.convertToBase64(files[0]);
  //     }
  //   },
  //   codeviewFilter: true,
  //   // codeviewFilterRegex: /<\/*(?:applet|b(?:ase|gsound|link)|embed|frame(?:set)?|ilayer|l(?:ayer|ink)|meta|object|s(?:cript|tyle)|t(?:itle|extarea)|xml|.*onmouseover)[^>]*?>/gi,
  //   codeviewIframeFilter: true
  // };


  @ViewChild('final-bill',{ static: true }) modalElement!: ElementRef;

  constructor(private _recruitService : RecruitService,
    private _sessionService : SessionService,
    private _encrypterService : EncrypterService,
    private _fb : FormBuilder,
    private toastr : ToastrService,
    private _employeemgmtService : EmployeeManagementService,
    private route : ActivatedRoute,
    private router : Router) {
    this.route.params.subscribe((params: any) => {
      let param = params['id'];
      if(param){
       this.letterType = (this._encrypterService.aesDecrypt(param)).split(',')[0];
       this.letterTypeId = (this._encrypterService.aesDecrypt(param)).split(',')[1];

      }
    });
  }

  ngOnInit(){
    let session_obj_d: any = JSON.parse(
      this._sessionService.get_user_session()
    );
    this.token = decode(session_obj_d.token);
    this.tp_account_id = this.token.tp_account_id;
    this.product_type = localStorage.getItem('product_type');
    this.initializeForm();
    this.getMasterLetters();
    this.getAllTemplates();
    this.getTemplateFormFieldAction();
    this.getTemplateTypes();
  }

  toggle() {
    this.showSidebar = !this.showSidebar;
  }

  // sidharth kaul dated. 26.06.2025 - offer letter fixes
  convertToBase64(file: File) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      $('#body-editor').summernote('insertImage', base64, 'inserted image');
    };
    reader.readAsDataURL(file);
  }

  setActiveEditor(editor: any) {
    // console.log("Active Editor:", editor)
    this.currentCursorField = editor;
  }

  getEditorConfig(editorName: any) {
    return {
      airMode: false,
      tabDisable: true,
      height: '350px',
      toolbar: [
        ['misc', ['codeview', 'undo', 'redo', 'codeBlock']],
        ['font', ['bold', 'italic', 'underline', 'strikethrough', 'superscript', 'subscript', 'clear']],
        ['fontsize', ['fontname', 'fontsize', 'color']],
        ['para', ['style0', 'ul', 'ol', 'paragraph', 'height']],
        ['insert', ['table', 'link', 'picture', 'video', 'hr']]
      ],
      popover: {
        table: [
          ['add', ['addRowDown', 'addRowUp', 'addColLeft', 'addColRight']],
          ['delete', ['deleteRow', 'deleteCol', 'deleteTable']],
        ],
        image: [
          ['image', ['resizeFull', 'resizeHalf', 'resizeQuarter', 'resizeNone']],
          ['float', ['floatLeft', 'floatRight', 'floatNone']],
          ['remove', ['removeMedia']]
        ],
        link: [['link', ['linkDialogShow', 'unlink']]]
      },
      callbacks: {
        onImageUpload: (files: File[]) => {
          this.convertToBase64(files[0]);
        },
        onFocus: () => {
          this.setActiveEditor(editorName);
        }
      },
      codeviewFilter: true,
      codeviewIframeFilter: true
    };
  }
  // end

  initializeForm() {
    this.templateForm = this._fb.group({
      templateId: [''],
      templateTypeName :[this.letterType,[Validators.required]],
      templateType: [this.letterTypeId, Validators.required],
      templateName: ['', Validators.required],
      subject: ['', Validators.required],
      body: ['', Validators.required],
      attachment: ['', Validators.required],
      rowid :['']
    });
  }

  get f() { return this.templateForm.controls; }


  getTemplateTypes() {
    let obj = {
      customeraccountid: this.tp_account_id.toString(),
    };
    this._recruitService.getAllTemplateTypes(obj).subscribe((resp: any) => {
      if (resp.statusCode) {
        let alltemplatetypes = JSON.parse(this._encrypterService.aesDecrypt(resp.commonData));
        this.templateTypeList = alltemplatetypes.data;
        this.initializeForm();
      }
    });
  }

  getMasterLetters(){

    this._employeemgmtService.getMasterLetters({'productTypeId': this.product_type,'customerAccountId':this.tp_account_id.toString(),
      'lettersType': this.letterType, 'letterId':this.letterid
    }).subscribe((resData:any)=>{
      if(resData.statusCode){
        if(!this.letterid){
          this.masterTemplateList= JSON.parse(this._encrypterService.aesDecrypt(resData.commonData));
        }
        if(this.letterid){
          let template =JSON.parse(this._encrypterService.aesDecrypt(resData.commonData))[0];
          this.templateForm.patchValue({
            templateId: template.template_id,
            templateName: template.template_name,
            subject: template.emailsubject,
            body: template.emailbody,
            attachment: template.template_html,
            templateType: this.letterTypeId,
            templateTypeName : this.letterType,
            rowid : template.row_id
          });
        }
      }
    })
  }

   // Keep track of the cursor position when typing
   updateCursorPosition(inputFieldPlace: any, event: any): void {
    this.currentCursorField = inputFieldPlace;
    const inputElement = event.target;
    this.cursorPosition = inputElement.selectionStart;
  }

  closeModal() {
    this.templateForm.patchValue({
      templateId: '',
      templateTypeName :this.letterType,
      templateType: this.letterTypeId,
      templateName: '',
      subject: '',
      body: '',
      attachment: '',
      rowid : ''
    });
  }

  saveCurrentRange(editorId: string) {
    let editor;
   
    if (editorId == 'body-editor') {
      this.currentCursorField = 'body-editor'
      editor = $('#body');
    } else {
      this.currentCursorField = 'attachment-editor'
      editor = $('#attachment');
    }
    this.lastRange = editor.summernote('createRange');
  }


  getAllTemplates() {
    let obj = {
      customeraccountid: this.tp_account_id.toString(),
    };
    this._recruitService.getAlltemplateList(obj).subscribe((resp: any) => {
      if (resp.statusCode) {
        let alltemplatesData = JSON.parse(this._encrypterService.aesDecrypt(resp.commonData));
        this.templateList = alltemplatesData.data;
      } else {
        this.templateList = []
      }
    });
  }
  
  getTemplateFormFieldAction() {
    let obj = {
      customeraccountid: this.tp_account_id.toString(),
      templateType : this.letterType,
      productTypeId : this.product_type
    };

    this._employeemgmtService.getMasterFieldsForTemplateType(obj).subscribe((resp: any) => {
      if (resp.statusCode) {
        let templatefieldList= JSON.parse(this._encrypterService.aesDecrypt(resp.commonData));

        // Creating the header and submenu structure
        this.templateFormField = templatefieldList;
        this.filteredFields = this.templateFormField;
      }
    });

  }

  openAddTemplateModal(value: string, template?: any) {
    this.popupType = value;
    this.submitted = false;

    $('#final-bill').modal('show');
   
    if (value == 'createTemplate') {
      this.letterid='';
      this.templateForm.patchValue({
        templateType: this.letterTypeId,
        templateTypeName : this.letterType
      })
    } else {
      this.letterid = template.row_id;
      this.getMasterLetters()
      
    }
  }


  restoreSelection() {
    const editor = $('#body');
    if (this.lastRange) {
      this.lastRange.select();  // Restore the selection
    }
  }

  insertFieldIntoTemplate(fieldName: string) {

    if (this.currentCursorField === 'subject') {
      const inputElement = document.getElementById('subject') as HTMLInputElement;
      const value = inputElement.value;

      const newValue =
        value.slice(0, this.cursorPosition) + fieldName + value.slice(this.cursorPosition);

      // Update the input field value
      inputElement.value = newValue;

      // Update the form control value
      this.f.subject?.setValue(newValue);

      // Move the cursor after the inserted text
      const newCursorPos = this.cursorPosition + fieldName.length + 2; // +2 for brackets
      inputElement?.setSelectionRange(newCursorPos, newCursorPos);

      // Update the cursor position
      this.cursorPosition = newCursorPos;
    }

    if (this.currentCursorField=='body') {
      const el = document.getElementById('body-editor');
      insertTextAtCursor(el, fieldName);
    }

    if (this.currentCursorField == 'attachment') {
      const el = document.getElementById('attachment-editor');
      insertTextAtCursor(el, fieldName);
    }
  }
  
  onSaveTemplate() {
    this.submitted = true;
    // console.log(this.templateForm.value);
    
    // Stop here if the form is invalid
    if (this.templateForm.invalid) {
      return;
    }

    if (this.popupType === 'createTemplate') {
      let obj = {
        action: 'AddTemplateDetails',
        template_name: this.templateForm.value.templateName,
        subject: this.templateForm.value.subject,
        body_text: this.templateForm.value.body,
        template_text: this.templateForm.value.attachment,
        templatetype_id: this.templateForm.value.templateType,
        customeraccountid: this.tp_account_id.toString(),
        product_type : this.product_type,
        rowid:this.templateForm.value.rowid
      }
      // return;
      this._employeemgmtService.addEditTemplate(obj).subscribe((resp: any) => {
        if (resp.statusCode) {
          // let decryptedData = JSON.parse(this._encrypterService.aesDecrypt(resp.commonData));
          this.toastr.success(resp.message);
          this.popupType = '';
          this.templateForm.reset();
          $('#final-bill').modal('hide');
          this.letterid='';
          this.getMasterLetters();
        } else {
          this.toastr.error(resp.message, 'Error');
        }
      });
    }

    if (this.popupType === 'editTemplate') {
      let obj = {
        action: 'EditTemplateDetails',
        template_id: this.templateForm.value.templateId, //
        template_name: this.templateForm.value.templateName,
        subject: this.templateForm.value.subject,
        body_text: this.templateForm.value.body,
        template_text: this.templateForm.value.attachment,
        templatetype_id: this.templateForm.value.templateType,
        customeraccountid: this.tp_account_id.toString(),
        product_type : this.product_type,
        rowid:this.templateForm.value.rowid
      }
      this._employeemgmtService.addEditTemplate(obj).subscribe((resp: any) => {
        if (resp.statusCode) {
          // let decryptedData = JSON.parse(this._encrypterService.aesDecrypt(resp.commonData));
          this.toastr.success(resp.message);
          this.popupType = '';
          this.templateForm.reset();
          $('#final-bill').modal('hide');
          this.letterid='';
          this.getMasterLetters();
        } else {
          this.toastr.error(resp.message, 'Error');
        }
      });
    }
  }
  
  generatePDF(template:any) {
    const encryptedParams = encodeURIComponent(this._encrypterService.aesEncrypt('template,'+this.letterType + ',' + template.row_id));
    const url = `${window.location.origin}/employee-mgmt/preview-pdf/${encryptedParams}`;
    window.open(url, '_blank');
  }

  // Function to toggle the list visibility
  toggleList() {
    this.isListVisible = !this.isListVisible;
  }

  // Function to filter fields based on the search term
  filterFields() {
    if (this.searchTerm) {
      this.filteredFields = this.templateFormField.filter(field =>
        field.field_name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredFields = this.templateFormField; // Reset to original list if no search term
    }
  }
  
}
