import { Injectable } from '@angular/core';
import { CallApiService } from 'src/app/shared/services/call-api.service';
import * as constants from '../../shared/helpers/constants';

@Injectable({
  providedIn: 'root'
})
export class UserMgmtService {

  constructor(
    private _callApiService: CallApiService
  ) { }

  private getRoles_url: string = constants.getRoles_url;
  private getAllUser_url: string = constants.getAllUser_url;
  private saveUser_url: string = constants.saveUser_url;
  private addUpdateDashboardSetting_url: string = constants.addUpdateDashboardSetting_url;
  private saveRole_url: string = constants.saveRole_url;
  private getRoleById_url: string = constants.getRoleById_url;
  private getModules_url: string = constants.getModules_url;
  private savePrivilege_url: string = constants.savePrivilege_url;
  private getPrivilege_url: string = constants.getPrivilege_url;
  private addSubmodules_url: string = constants.addSubmodules_url;
  private getGeoFencing_url: string = constants.getGeoFencing_url;
  private registerSubUser_url: string = constants.registerSubUser_url;
  private manageProjects_url: string = constants.manageProjects_url;
  private managevendors_url: string = constants.managevendors_url;

  getRoles(userData: any) {
    return this._callApiService.post_enc(userData, this.getRoles_url);
  }
  getAllUser(userData: any) {
    return this._callApiService.post_enc(userData, this.getAllUser_url);
  }
  saveUser(userData: any) {
    return this._callApiService.post_enc(userData, this.saveUser_url);
  }

  addUpdateDashboardSetting(userData: any) {
    return this._callApiService.post_enc(userData, this.addUpdateDashboardSetting_url);
  }
  saveRole(userData: any) {
    return this._callApiService.post_enc(userData, this.saveRole_url);
  }
  getRoleById(userData: any) {
    return this._callApiService.post_enc(userData, this.getRoleById_url);
  }
  getModules(userData: any) {
    return this._callApiService.post_enc(userData, this.getModules_url);
  }
  savePrivilege(userData: any) {
    return this._callApiService.post_enc(userData, this.savePrivilege_url);
  }
  getPrivilege(userData: any) {
    return this._callApiService.post_enc(userData, this.getPrivilege_url);
  }
  addSubmodules(userData: any) {
    return this._callApiService.post_enc(userData, this.addSubmodules_url);
  }
  getGeoFencing(userData: any) {
    return this._callApiService.post_enc(userData, this.getGeoFencing_url);
  }
  registerSubUser(userData: any) {
    return this._callApiService.post_enc(userData, this.registerSubUser_url);
  }
  private saveDesignation_url: string = constants.saveDesignation_url;
  saveDesignation(userData: any) {
    return this._callApiService.post_enc(userData, this.saveDesignation_url);
  }


  manageProjects(userData: any) {
    return this._callApiService.post_enc(userData, this.manageProjects_url);
  }
  private getDeptWiseEmployees_url: string = constants.getDeptWiseEmployees_url;
  getDeptWiseEmployees(userData: any) {
    return this._callApiService.post_enc(userData, this.getDeptWiseEmployees_url);
  }
  // Pankaj Bhonsle dated. 23.04.2025
  private contractrenewal_url: string = constants.contractrenewal_url;
  contractrenewal(userData: any) {
    return this._callApiService.post_enc(userData, this.contractrenewal_url);
  }

  managevenodrs(userData: any) {
    return this._callApiService.post_enc(userData, this.managevendors_url);
  }
  // end

  private deleteAllCacheKeysForAccount_url: string = constants.deleteAllCacheKeysForAccount_url;
  deleteAllCacheKeysForAccount(userData:any) {
    return this._callApiService.post_enc(userData, this.deleteAllCacheKeysForAccount_url);
  }
}
