import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import * as constants from '../../shared/helpers/constants';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

pdfMake.vfs = pdfFonts.pdfMake.vfs;

@Injectable({
  providedIn: 'root'
})
export class EmployeeManagementService {
  private menuList: { module_name: string, isActive: number }[] =
    [{ 'module_name': 'Profile', 'isActive': 1 },
    { 'module_name': 'Payrolling', 'isActive': 1 },
    { 'module_name': 'Investment', 'isActive': 1 },
    { 'module_name': 'Leave', 'isActive': 1 },
    { 'module_name': 'Attendance', 'isActive': 1 },
    { 'module_name': 'Documents', 'isActive': 1 },
    { 'module_name': 'Approval Workflow', 'isActive': 0 },
    { 'module_name': 'Service Book', 'isActive': 1 },
    { 'module_name': 'Asset Details', 'isActive': 1 },
    ]

  constructor(
    private _EncrypterService: EncrypterService,
    private _CallApiService: CallApiService,) { }

  getList(): { module_name: string, isActive: number }[] {
    return this.menuList;
  }

  // GetExitDetails_url GetReasonsOfLeaving_url
  private GetExitDetails_url: string = constants.GetExitDetails_url;
  private GetReasonsOfLeaving_url: string = constants.GetReasonsOfLeaving_url;
  private AddEditExitDetails_url: string = constants.AddEditExitDetails_url;
  private getLetterTemplateCategories_url: string = constants.getLetterTemplateCategories_url;
  private addEditLetterCateogory_url: string = constants.addEditLetterCateogory_url;
  private deleteLetterCtg_url: string = constants.deleteLetterCtg_url;
  // added by harsh on dated. 30.09.2024
  private get_asset_master_url: string = constants.get_asset_master_url;
  private insert_asset_location_category_url: string = constants.insert_asset_location_category_url;
  private insert_update_assets_url: string = constants.insert_update_assets_url;
  private remove_verify_assets_url: string = constants.remove_verify_assets_url;
  // end

  private save_remove_confirm_release_asset_url: string = constants.save_remove_confirm_release_asset_url;
  private get_assets_url: string = constants.get_assets_url;
  private GetServiceBookDetails_url: string = constants.GetServiceBookDetails_url;
  GetServiceBookDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetServiceBookDetails_url);
  }
  AddEditExitDetails(Data: any) {
    return this._CallApiService.post_enc(Data, this.AddEditExitDetails_url);
  }
  GetExitDetails(Data: any) {
    return this._CallApiService.post_enc(Data, this.GetExitDetails_url);
  }

  GetReasonsOfLeaving(Data: any) {
    return this._CallApiService.post_enc(Data, this.GetReasonsOfLeaving_url);
  }

  private educationDetails_url: string = constants.educationDetails_url;
  private workExperience_url: string = constants.workExperience_url;
  private trainingDetails_url: string = constants.trainingDetails_url;
  private familyDetails_url: string = constants.familyDetails_url;
  educationDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.educationDetails_url);
  }
  workExperience(userData: any) {
    return this._CallApiService.post_enc(userData, this.workExperience_url);
  }
  trainingDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.trainingDetails_url);
  }
  familyDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.familyDetails_url);
  }
  private GetSalarySlipURL_url: string = constants.GetSalarySlipURL_url;

  GetSalarySlipURL(Data: any) {
    return this._CallApiService.post_enc(Data, this.GetSalarySlipURL_url);
  }
  private GetForm16Details_url: string = constants.GetForm16Details_url;
  private AddEditForm16_url: string = constants.AddEditForm16_url;

  GetForm16Details(Data: any) {
    return this._CallApiService.post_enc(Data, this.GetForm16Details_url);
  }
  AddEditForm16(Data: any) {
    return this._CallApiService.post_enc(Data, this.AddEditForm16_url);
  }

  getLetterTemplateCategories(Data: any) {
    return this._CallApiService.post_enc(Data, this.getLetterTemplateCategories_url);
  }
  addEditLetterCateogory(Data: any) {
    return this._CallApiService.post_enc(Data, this.addEditLetterCateogory_url);
  }
  deleteLetterCtg(Data: any) {
    return this._CallApiService.post_enc(Data, this.deleteLetterCtg_url);
  }
  // harsh dated. 30.09.2024
  get_asset_master(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_asset_master_url);
  }
  insert_asset_location_category(userData: any) {
    return this._CallApiService.post_enc(userData, this.insert_asset_location_category_url);
  }
  insert_update_assets(userData: any) {
    return this._CallApiService.post_enc(userData, this.insert_update_assets_url);
  }
  remove_verify_assets(userData: any) {
    return this._CallApiService.post_enc(userData, this.remove_verify_assets_url);
  }
  // end harsh dated. 30.09.2024
  private getMasterLetters_url: string = constants.getMasterLetters_url;
  getMasterLetters(Data: any) {
    return this._CallApiService.post_enc(Data, this.getMasterLetters_url);
  }

  private getMasterFieldsForTemplateType_url: string = constants.getMasterFieldsForTemplateType_url;
  private addEditTemplate_url: string = constants.addEditTemplate_url;

  getMasterFieldsForTemplateType(userData: any) {
    return this._CallApiService.post_enc(userData, this.getMasterFieldsForTemplateType_url)
  }
  addEditTemplate(userData: any) {
    return this._CallApiService.post_enc(userData, this.addEditTemplate_url)
  }
  private GetDocumentMasterDetails_url: string = constants.GetDocumentMasterDetails_url;
  private AddNewCatagory_url: string = constants.AddNewCatagory_url;
  private AddCatagoryDocumentName_url: string = constants.AddCatagoryDocumentName_url;
  private EnableDisableCatagoryDocument_url: string = constants.EnableDisableCatagoryDocument_url;

  EnableDisableCatagoryDocument(Data: any) {
    return this._CallApiService.post_enc(Data, this.EnableDisableCatagoryDocument_url);
  }
  AddCatagoryDocumentName(Data: any) {
    return this._CallApiService.post_enc(Data, this.AddCatagoryDocumentName_url);
  }
  AddNewCatagory(Data: any) {
    return this._CallApiService.post_enc(Data, this.AddNewCatagory_url);
  }
  GetDocumentMasterDetails(Data: any) {
    return this._CallApiService.post_enc(Data, this.GetDocumentMasterDetails_url);
  }
  private AddEditDocument_url: string = constants.AddEditDocument_url;
  private GetCandidateDocumentMasterDetails_url: string = constants.GetCandidateDocumentMasterDetails_url;
  GetCandidateDocumentMasterDetails(Data: any) {
    return this._CallApiService.post_enc(Data, this.GetCandidateDocumentMasterDetails_url);
  }
  AddEditDocument(Data: any) {
    return this._CallApiService.post_enc(Data, this.AddEditDocument_url);
  }

  private getLetterTemplateId_url: string = constants.getLetterTemplateId_url;
  getLetterTemplateId(Data: any) {
    return this._CallApiService.post_enc(Data, this.getLetterTemplateId_url);
  }

  private manageCandidateAppointmentLetter_url: string = constants.manageCandidateAppointmentLetter_url;

  manageCandidateAppointmentLetter(Data: any) {
    return this._CallApiService.post_enc(Data, this.manageCandidateAppointmentLetter_url);
  }

  // Generate pdf from html content (By Karan)
  generatePdf(htmlContent: string) {
    const documentDefinition = this.getDocumentDefinition(htmlContent);
    pdfMake.createPdf(documentDefinition).open();
  }

  private getDocumentDefinition(htmlContent: string) {
    const parsedContent = this.convertHtmlToPdfContent(htmlContent);

    return {
      content: parsedContent,
      defaultStyle: {
        font: 'Roboto',
      },
    };
  }

  private convertHtmlToPdfContent(html: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const content = [];

    const elements = doc.body.childNodes;

    elements.forEach((element: ChildNode) => {
      if (element.nodeType === Node.ELEMENT_NODE) {
        const tagName = (element as HTMLElement).tagName.toLowerCase();
        const textContent = (element as HTMLElement).textContent || '';

        switch (tagName) {
          case 'p':
            content.push({ text: textContent, margin: [0, 0, 0, 10] });
            break;
          case 'strong':
            content.push({ text: textContent, bold: true });
            break;
          case 'ol':
            content.push(this.convertList(element, 'decimal'));
            break;
          case 'ul':
            content.push(this.convertList(element, 'bullet'));
            break;
          case 'li':
            content.push({ text: textContent, margin: [10, 0, 0, 5] });
            break;
          case 'br':
            content.push({ text: '\n' });
            break;
          default:
            if (textContent) {
              content.push({ text: textContent });
            }
            break;
        }
      }
    });

    return content;
  }

  private convertList(element: ChildNode, listType: string) {
    const items = [];
    element.childNodes.forEach((li: ChildNode) => {
      if (li.nodeType === Node.ELEMENT_NODE && li.nodeName === 'LI') {
        const listItemText = (li as HTMLElement).textContent || '';
        items.push({ text: listItemText, margin: [0, 0, 0, 5] });
      }
    });
    return { [listType === 'bullet' ? 'ul' : 'ol']: items };
  }
  // Generate pdf from html content ends

  private manage_tp_master_url: string = constants.manage_tp_master_url;

  manage_tp_master(userData: any) {
    return this._CallApiService.post_enc(userData, this.manage_tp_master_url);
  }

  // end harsh dated. 30.09.2024
  save_asset(userData: any) {
    return this._CallApiService.post_enc(userData, this.save_remove_confirm_release_asset_url);
  }
  get_assets(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_assets_url);
  }
  release_asset(userData: any) {
    return this._CallApiService.post_enc(userData, this.save_remove_confirm_release_asset_url);
  }
  remove_asset(userData: any) {
    return this._CallApiService.post_enc(userData, this.save_remove_confirm_release_asset_url);
  }
  confirm_asset(userData: any) {
    return this._CallApiService.post_enc(userData, this.save_remove_confirm_release_asset_url);
  }
  private manage_tp_hierarchy_url: string = constants.manage_tp_hierarchy_url;
  manage_tp_hierarchy(userData: any) {
    return this._CallApiService.post_enc(userData, this.manage_tp_hierarchy_url);
  }
  private sendLetterMail_url: string = constants.sendLetterMail_url;

  sendLetterMail(userData: any) {
    return this._CallApiService.post_enc(userData, this.sendLetterMail_url);
  }

  private insertLetterHead_url: string = constants.insertLetterHead_url;

  insertLetterHead(userData: any) {
    return this._CallApiService.post_enc(userData, this.insertLetterHead_url);
  }

  private get_tp_hierarchy_url: string = constants.get_tp_hierarchy_url;
  get_tp_hierarchy(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_tp_hierarchy_url);
  }

  private managePolicy_url: string = constants.managePolicy_url;

  managePolicy(userData: any) {
    return this._CallApiService.post_enc(userData, this.managePolicy_url);
  }
  // arpit service
  private AddEditDisciplinaryAction_url: string = constants.AddEditDisciplinaryAction_url;
  private AddEditRewards_url: string = constants.AddEditRewards_url;
  private DeleteRewardDetails_url: string = constants.DeleteRewardDetails_url;
  private DeleteDisciplinaryAction_url: string = constants.DeleteDisciplinaryAction_url;
  private EditRewards_url: string = constants.EditRewards_url;
  private EditDisciplinaryAction_url: string = constants.EditDisciplinaryAction_url;
  private manageEmpAppSettings_url: string = constants.manageEmpAppSettings_url;

  EditDisciplinaryAction(userData: any) {
    return this._CallApiService.post_enc(userData, this.EditDisciplinaryAction_url);
  }
  EditRewards(userData: any) {
    return this._CallApiService.post_enc(userData, this.EditRewards_url);
  }
  DeleteDisciplinaryAction(userData: any) {
    return this._CallApiService.post_enc(userData, this.DeleteDisciplinaryAction_url);
  }
  DeleteRewardDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.DeleteRewardDetails_url);
  }
  AddEditRewards(userData: any) {
    return this._CallApiService.post_enc(userData, this.AddEditRewards_url);
  }
  AddEditDisciplinaryAction(userData: any) {
    return this._CallApiService.post_enc(userData, this.AddEditDisciplinaryAction_url);
  }

  manageEmpAppSettings(userData: any) {
    return this._CallApiService.post_enc(userData, this.manageEmpAppSettings_url);
  }

  private get_monthly_attendance_employee_url: string = constants.get_monthly_attendance_employee_url;

  get_monthly_attendance_employee(userData: any) {
    return this._CallApiService.post_enc(userData, this.get_monthly_attendance_employee_url);
  }
  private getMasterListingOfApproval_url: string = constants.getMasterListingOfApproval_url;

  getMasterListingOfApproval(userData: any) {
    return this._CallApiService.post_enc(userData, this.getMasterListingOfApproval_url);
  }
  private getApprovalRequestByActionType_url: string = constants.getApprovalRequestByActionType_url;

  getApprovalRequestByActionType(userData: any) {
    return this._CallApiService.post_enc(userData, this.getApprovalRequestByActionType_url);
  }

  private approveRejectLeave_url: string = constants.approveRejectLeave_url;
  private changeDocumentStatusAcceptReject_url: string = constants.changeDocumentStatusAcceptReject_url;

  approveRejectLeave(userData: any) {
    return this._CallApiService.post_enc(userData, this.approveRejectLeave_url);
  }

  changeDocumentStatusAcceptReject(userData: any) {
    return this._CallApiService.post_enc(userData, this.changeDocumentStatusAcceptReject_url);
  }

  private SaveEmpRegime_url: string = constants.SaveEmpRegime_url;
  private Save80cComponents_url: string = constants.Save80cComponents_url;
  private saveCH6ProofDetails_url: string = constants.saveCH6ProofDetails_url;

  SaveEmpRegime(userData: any) {
    return this._CallApiService.post_enc(userData, this.SaveEmpRegime_url);
  }

  Save80cComponents(userData: any) {
    return this._CallApiService.post_enc(userData, this.Save80cComponents_url);
  }
  saveCH6ProofDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.saveCH6ProofDetails_url);
  }
  private GetViewInvestmentsProof_url: string = constants.GetViewInvestmentsProof_url;
  private saveHraProof_url: string = constants.saveHraProof_url;
  private saveHomeLoanDetails_url: string = constants.saveHomeLoanDetails_url;
  GetViewInvestmentsProof(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetViewInvestmentsProof_url);
  }

  saveHraProof(userData: any) {
    return this._CallApiService.post_enc(userData, this.saveHraProof_url);
  }

  saveHomeLoanDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.saveHomeLoanDetails_url);
  }
  private updateMasterCatDefineEmployee_url: string = constants.updateMasterCatDefineEmployee_url;
  updateMasterCatDefineEmployeeApi(userData: any) {
    return this._CallApiService.post_enc(userData, this.updateMasterCatDefineEmployee_url);
  }

  private SavePreviousIncomeDetail_url: string = constants.SavePreviousIncomeDetail_url

  SavePreviousIncomeDetail(userData: any) {
    return this._CallApiService.post_enc(userData, this.SavePreviousIncomeDetail_url);
  }
  private SaveEmpInvestment_url: string = constants.SaveEmpInvestment_url
  private GetEmpRegimeAndTaxProjection_url: string = constants.GetEmpRegimeAndTaxProjection_url

  SaveEmpInvestment(userData: any) {
    return this._CallApiService.post_enc(userData, this.SaveEmpInvestment_url);
  }
  GetEmpRegimeAndTaxProjection(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetEmpRegimeAndTaxProjection_url);
  }
  // harsh 21 mar 2025
  private project_map_url: string = constants.project_map_url;
  private manageResources_url: string = constants.manageResources_url;

  project_map(userData: any) {
    return this._CallApiService.post_enc(userData, this.project_map_url);
  }
  manageResources(userData: any) {
    return this._CallApiService.post_enc(userData, this.manageResources_url);
  }

  // add by ak 27-03-2025
  private SaveEmpInvestmentDeclaration_url: string = constants.SaveEmpInvestmentDeclaration_url;

  SaveEmpInvestmentDeclaration(userData: any) {
    return this._CallApiService.post_enc(userData, this.SaveEmpInvestmentDeclaration_url);
  }

  private emp_location_hist_url: string = constants.emp_location_hist_url;

  emp_location_hist(userData: any) {
    return this._CallApiService.post_enc(userData, this.emp_location_hist_url);
  }

  private GetHomeLoanDetails_url: string = constants.GetHomeLoanDetails_url;
  private SaveHomeLoan_url: string = constants.SaveHomeLoan_url;

  GetHomeLoanDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.GetHomeLoanDetails_url);
  }

  SaveHomeLoanDeclaration(userData: any) {
    return this._CallApiService.post_enc(userData, this.SaveHomeLoan_url);
  }

  private saveEmpRentDetails_url: string = constants.saveEmpRentDetails_url;
  saveEmpRentDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.saveEmpRentDetails_url);
  }

  private getEmpRentDetails_url: string = constants.getEmpRentDetails_url;
  getEmpRentDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.getEmpRentDetails_url);
  }
  // rekha 20-06-2025
  private full_and_final_get_url: string = constants.full_and_final_get_url;
  getFullAndFinalDetail(userData: any) {
    return this._CallApiService.post_enc(userData, this.full_and_final_get_url);
  }

   private clearance_form_save_url: string = constants.clearance_form_save_url;
  saveCleranceForm(userData: any) {
    return this._CallApiService.post_enc(userData, this.clearance_form_save_url);
  }
  private exit_form_url: string = constants.exit_form_url
  getExitFormDetails(userData: any) {
    return this._CallApiService.post_enc(userData, this.exit_form_url);
  }

  private send_email_remainder: string = constants.send_email_remainder_url;
  sendFormReminder(userData: any) {
    return this._CallApiService.post_enc(userData, this.send_email_remainder);
  }
  private markExitFormSentToEmployee: string = constants.markExitFormSentToEmployee
  markExitFormSent(userData: any) {
    return this._CallApiService.post_enc(userData, this.markExitFormSentToEmployee);
  }
  
  private submitApprovalFeedbackForm: string = constants.submitApprovalFeedbackForm
  approvalFeedbackForm(userData: any) {
    return this._CallApiService.post_enc(userData, this.submitApprovalFeedbackForm);
  }
}
