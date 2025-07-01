import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, EventEmitter, Output, Renderer2,Inject } from '@angular/core';
import { SessionService } from 'src/app/shared/services/session.service';
import decode from 'jwt-decode';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { Router,ActivatedRoute } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import jwtDecode from 'jwt-decode';
import { environment } from 'src/environments/environment';
import { EncrypterService } from 'src/app/shared/services/encrypter.service';
import { InsightService } from './insight.service';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})


export class SidebarComponent {

  safeHtml!: SafeHtml;
  showSidebar: boolean = true;
  decoded_token: any;
  @Output() toggleEmitter = new EventEmitter<void>();
  show_toggle_buttions: boolean = true;
  is_production: boolean = environment.production;
  @ViewChild('dynamicContainer') dynamicContainer!: ElementRef;
  constructor(
    private _sessionsService: SessionService,
    private sanitizer: DomSanitizer,
    private router: Router,
    public elementRef: ElementRef,
    private renderer: Renderer2,
    private _encrypterService : EncrypterService,
    private route : ActivatedRoute,
    private insightService: InsightService,
   @Inject(DOCUMENT) private document: Document,
  ) { }

  ngOnInit(): void {

    let session_obj = JSON.parse(this._sessionsService.get_user_session());
    let token = (session_obj).token;
    this.decoded_token = jwtDecode(token);
    

    if (session_obj) {
      let menu = session_obj.menuhtml;
      
      let employeeMenu = session_obj.employeeMenuHtml;
      if(window.location.pathname.startsWith('/profile') ){
        if(employeeMenu)
          this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(employeeMenu.replaceAll('"', ''));
        else this.router.navigate(['/logout']);
      }else{
        this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(menu.replaceAll('"', ''));
      }
    }


    if (this.router.url == '/dashboard' || this.router.url == '/change-password' || this.router.url == '/dashboard/summary-dashboard'  || this.router.url == '/attendance/face-checkin'
      || this.router.url == '/employees/bulk-employee' || this.router.url == '/dashboard/summary-dashboard-new' || this.router.url.includes('reports/pay-summary/consultant-invoice/')
    ) {
      this.showSidebar = false;
      this.show_toggle_buttions = false
    }

    this.route.queryParams.subscribe(params => {
      const type = params['type'];
        if (type === 'mobile') {
          this.document.body.classList.add('mobile-type');
        }
        else{
          this.document.body.classList.remove('mobile-type');
        }
      }
    )

  }

  toggle() {
    this.showSidebar = !this.showSidebar;
    this.toggleEmitter.emit();

    // console.log(this.toggleEmitter);
  }

  ngAfterViewInit() {

    this.renderer.listen(this.dynamicContainer.nativeElement, 'click', (event) => {
      // Check if the click is on a specific element
      const clickedElement = event.target as HTMLElement;
      /////////////////
      const href = clickedElement.getAttribute('href') || clickedElement?.parentElement?.getAttribute('href');
      if(href == '/Insights' || href == 'Insights') {
        event.preventDefault(); 
        this.verifyDashboardToken();
        return
      }
	        //////////////////////
      if (clickedElement.tagName === 'A') {
        // Handle specific clicks
        let href = clickedElement.getAttribute('href');
  
        if ( href.startsWith('/tnd') || href.startsWith('/recruit') || href.startsWith('/performance') || href.startsWith('/ats') || href.startsWith('/feedback')) {
          console.log('Specific link clicked!');
          let sessionid = localStorage.getItem('sessionid');
          let accountid = this.decoded_token.tp_account_id;
          let redirecturl =  `${environment.PMS_TND_ATL_URL}${href}?p1=${encodeURIComponent(sessionid)}&p2=${encodeURIComponent(this._encrypterService.aesEncrypt(accountid.toString()))}`;
          window.open(redirecturl,'_blank');
          // history.back();
        }

        else if (href.startsWith('/survey-management')) {
          console.log('Specific link clicked!');
          let sessionid = localStorage.getItem('sessionid');
          let accountid = this.decoded_token.tp_account_id;
          let redirecturl =  `${environment.Survey_Web_URL}${href}?p1=${encodeURIComponent(sessionid)}&p2=${encodeURIComponent(this._encrypterService.aesEncrypt(accountid.toString()))}`;
          window.open(redirecturl,'_blank');
          // history.back();
        }
        else
        {
          // nothing to do
        }
      }
    });
    this.openParentMenuFromStoredSubmenu();
  }

  openParentMenuFromStoredSubmenu(): void {
    const storedSubmenuId = localStorage.getItem('activeTab');

    if (storedSubmenuId) {
      this.closeAllSubmenus(); // Close all submenus
      this.toggleSubMenu(storedSubmenuId, true); // Open the stored submenu's parent
    }
  }

  closeAllSubmenus(): void {
    const allSubmenus = this.elementRef.nativeElement.querySelectorAll('.nav-second-level, .nav-second-level-1');
    allSubmenus.forEach((submenu: HTMLElement) => submenu.classList.remove('in'));
    
    const activeItems = this.elementRef.nativeElement.querySelectorAll('.active');
    activeItems.forEach((item: HTMLElement) => item.classList.remove('active'));
  }

  escapeCssSelector(selector: string): string {
    return selector.replace(/([!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~])/g, '\\$1');
  }
  
  toggleSubMenu(menuId: string, isOpen: boolean): void {
    const escapedMenuId = this.escapeCssSelector(menuId);
    const submenu = this.elementRef.nativeElement.querySelector(`#${escapedMenuId}`);    
    if (submenu) {
      // Ensure the submenu opens/closes
      submenu.classList.toggle('in', isOpen);      
      // Find and activate the closest parent `li`
      const limenu = submenu.closest('li');
      if (limenu) {
        limenu.classList.toggle('active', isOpen);
      }
      // Open each parent `ul` recursively up to the top level
      this.openParentMenusRecursively(submenu, isOpen);
    }
  }
  openParentMenusRecursively(element: HTMLElement, isOpen: boolean): void {
    while (element) {
    const parentUl = element.closest('ul.nav-second-level, ul.nav-second-level-1');
    // Stop if we reach the main sidebar or no more matching parent Uls are found
    if (!parentUl || parentUl === this.elementRef.nativeElement) break;
    // Find the parent `li` of the found `ul`, if available
    const parentLi = parentUl.closest('li');
    if (parentLi) {
      // parentLi.classList.toggle('active', isOpen); // Add/remove `active` class on parent `li`
    }
    parentUl.classList.toggle('in', isOpen); // Toggle `in` class on the found `ul`

    // Move up the hierarchy to continue opening parent menus
    element = parentLi;
    }
  }
  ngAfterViewChecked() {
    // console.log('ksdnjfsajfbs==>',environment.production);

    // account_id 4744
    // Please enable leave management,attendance management & visitor management for trailing mail accounts.
    //2719 ,3088
    // Vinod, Plz enable trailing mail feature in this account id 4766(SRB INTERNATIONAL PRIVATE LIMITED#09AAPCS4451D1Z6-20240514 10:05:23),
    //  Plz activate leave management,attendance management reat as previous employer. Employer id 4742
    //4789 , FISH WHITE PRIVATE LIMITED#09AAECF8932H1ZC-20240517 07:05:49
    // show visitor in dummy account and GS IT SOLUTIONS as per request.
    // 4623 Pronomio Solutions  add special feature on dated. 22.05.2024
    //  Account id 4815 (Zillion Brands Private Limited) dated. 10.06.2024
    // 4643 , KATEBAA plz enable all modules excluding vistor managment dated. 13.06.2024
    let is_show_menu_visitor = (
      this.decoded_token.tp_account_id == '4744'
      // || this.decoded_token.tp_account_id == '3088'
    ) ? true : false;

    let is_show_menu = (
      this.decoded_token.tp_account_id == '4744'
      || this.decoded_token.tp_account_id == '2719'
      || this.decoded_token.tp_account_id == '3088'
      || this.decoded_token.tp_account_id == '4766'
      || this.decoded_token.tp_account_id == '4742'
      || this.decoded_token.tp_account_id == '4789'
      || this.decoded_token.tp_account_id == '4623'
      || this.decoded_token.tp_account_id == '4815'
      || this.decoded_token.tp_account_id == '4643'
    ) ? true : false;



    /* Comment it as managed by OPS-CRM dated. 14.06.2024
        // apply for production only.
        if (environment.production) {
    
          // show only in SSO Login dated 01.06.2024 now public on dated. 10.06.2024
          // let ul14: HTMLElement = document.getElementById('id_Dashboard_Summary');
          // if (ul14) {
          //       const liElement4 = ul14.parentElement;
          //       if (!this.decoded_token.sso_admin_id) {
          //       liElement4.style.display = 'none';
          //     }
          // }
    
          let ul15: HTMLElement = document.getElementById('id_Face_Checkin');
          if (ul15) {
            const liElement15 = ul15.parentElement;
            if (!this.decoded_token.sso_admin_id) {
              liElement15.style.display = 'none';
            }
          }
          // end 
    
          // show visitor in dummy account and GS IT SOLUTIONS as per request.
          if (is_show_menu_visitor == false) {
            let ul2: HTMLElement = document.getElementById('id_Visitor_Management');
            if (ul2) {
              const liElement2 = ul2.parentElement;
              if (!this.decoded_token.sso_admin_id) {
                liElement2.style.display = 'none';
              }
            }
            // for show hide visitor management
          }
    
          // show special menu for selected customers
          if (is_show_menu == false) {
    
            let ul: HTMLElement = document.getElementById('id_User_Management');
    
            if (ul) {
              const liElement = ul.parentElement;
              if (!this.decoded_token.sso_admin_id) {
                liElement.style.display = 'none';
              }
            }
            // for show hide id_Leave_Management 
            // dated. 22.05-2024 show it for all users
            // let ul3: HTMLElement = document.getElementById('id_Leave_Management');
            // if (ul3) {
            //   const liElement3 = ul3.parentElement;
            //   if (!this.decoded_token.sso_admin_id) {
            //     liElement3.style.display = 'none';
            //   }
            // }
            // for show hide id_Leave_Management
    
            // for show hide id_Attendance_Settings remane it to Attendance_Management
            let ul4: HTMLElement = document.getElementById('id_Attendance_Management');
            if (ul4) {
              const liElement4 = ul4.parentElement;
              if (!this.decoded_token.sso_admin_id) {
                liElement4.style.display = 'none';
              }
            }
            // for show hide id_Attendance_Settings
    
            // for id_Broadcaster
            let ul6: HTMLElement = document.getElementById('id_Broadcast');
            if (ul6) {
              const liElement6 = ul6.parentElement;
              if (!this.decoded_token.sso_admin_id) {
                liElement6.style.display = 'none';
              }
            }
            // end
          }
    
        }
    */
    //for show hide reports
    let ul5: HTMLElement = document.getElementById("id_Reports");
    const anchorTag: any = document.querySelector('a[ng-reflect-router-link="/reports"]');
    if (anchorTag) {
      const spanTag = anchorTag.querySelector('span.fa');
      // console.log(ul5);
      // if (ul5) {
      //   ul5.style.display = 'none';
      // }
      if (anchorTag) {
        // iTag.style.display = 'none';
        if (spanTag)
          spanTag.style.display = 'none';
        anchorTag.href = '/reports';
      }
    }
    //for show hide reports
  }

     verifyDashboardToken(): void {
  
    let name=this.decoded_token?.name?.split(' ')
    
    const user = {
    username:(this.decoded_token?.emp_code != '')?this.decoded_token?.emp_code:this.decoded_token.mobile,
    email: this.decoded_token?.userid,
    first_name: name[0],
    last_name: name[1]
   };

   this.insightService.getInsightTokenForSSO(user).subscribe((res:any)=>{
    if(res.success){
    const dashboardUrl = res.url;
    window.open(dashboardUrl, '_blank');
    }else{
      console.log('Server error')
    }
   })

  }

}
