import { Injectable } from '@angular/core';
import { CallApiService } from '../../shared/services/call-api.service';
import * as constants from '../../shared/helpers/constants';
@Injectable({
    providedIn: 'root'
})
export class MasterServiceService {

    constructor(private _CallApiService: CallApiService) { }
    private password_login_urlUlr: string = constants.password_login_url;
    private show_bus_setting_page_url:string = constants.show_bus_setting_page_url;
    private get_url_access_right_global_url : string = constants.get_url_access_right_global_url
    private manage_tp_master_url:string = constants.manage_tp_master_url;
    private useSession_url : string = constants.useSession_url;
    private employeeLoginByMob_url : string= constants.employeeLoginByMob_url;
    private getEmployeeMenu_url : string= constants.getEmployeeMenu_url;
    
    setEmployerPassword(userData: any) {
        return this._CallApiService.post_enc(userData, this.password_login_urlUlr);
    }
    show_bus_setting_page(userData:any)
    {
        return this._CallApiService.post_enc(userData, this.show_bus_setting_page_url);
    }
    get_url_access_right_global(userData:any){
        
        return this._CallApiService.post_enc(userData,this.get_url_access_right_global_url);
    }
    useSession(userData:any){
        return this._CallApiService.post_enc(userData,this.useSession_url);
    }
    employeeLoginByMob(userData:any){
        return this._CallApiService.post_enc(userData,this.employeeLoginByMob_url);
    }
    getEmployeeMenu(userData:any){
        return this._CallApiService.post_enc(userData,this.getEmployeeMenu_url);
    }

    checkAccessRights(url:string):any{
        let acccess_data = !localStorage.getItem('access_rights')? []:JSON.parse(localStorage.getItem('access_rights'));
        for(let i=0;i< acccess_data.length;i++){
            if(url==acccess_data[i].linkname){
                return {
                    'Add':acccess_data[i].add,
                    'Edit':acccess_data[i].edit,
                    'View':acccess_data[i].view,
                    'Fullcontrol':acccess_data[i].fullcontrol
                }
            }
        }
    }

    routeAccessRights(url:string):any{
        let acccess_data = !localStorage.getItem('access_rights')? []:JSON.parse(localStorage.getItem('access_rights'));
        for(let i=0;i< acccess_data.length;i++){
            if(acccess_data[i].linkname.includes(url)){
                return {
                    'Add':acccess_data[i].add,
                    'Edit':acccess_data[i].edit,
                    'View':acccess_data[i].view,
                    'Fullcontrol':acccess_data[i].fullcontrol
                }
            }
        }
    }
    

    manage_tp_master(userData:any){
    return this._CallApiService.post_enc(userData, this.manage_tp_master_url);
    }
}

