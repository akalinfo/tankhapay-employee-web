import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { finalize, retry, catchError, delay, tap } from 'rxjs/operators';
import { Router } from '@angular/router';
@Injectable()
export class httpInterceptor implements HttpInterceptor {


  constructor(private router: Router) { }
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    var loadingContainer1: HTMLElement = document.getElementsByClassName('loader1').item(0) as HTMLElement;
    var loadingContainer: HTMLElement = document.getElementsByClassName('loader').item(0) as HTMLElement;
    var loaderOverlay: HTMLElement = document.getElementsByClassName('loader-overlay1').item(0) as HTMLElement;
    var routerMain: HTMLElement = document.getElementById('router-main') as HTMLElement;

    const excludedRoutes = [
      '/reports',           // adjust as per your actual route paths
      '/attendance',
      '/employees',
      '/employee-mgmt',
      '/business-settings'
    ];
    const currentUrl = this.router.url;

    const disableKeyEvents = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };

    const addEventListeners = () => {
      document.addEventListener('keydown', disableKeyEvents, true);
      document.addEventListener('keyup', disableKeyEvents, true);
    };

    const removeEventListeners = () => {
      document.removeEventListener('keydown', disableKeyEvents, true);
      document.removeEventListener('keyup', disableKeyEvents, true);
    };

    if (loadingContainer1) {
      loadingContainer1.style.display = 'block';
    }
    if (loadingContainer) {
      loadingContainer.style.display = 'block';
    }
    if (loaderOverlay) {
      loaderOverlay.style.display = 'block';
    }


    if (routerMain) {
      routerMain.classList.add('no-click');
      if (!(req.url.includes('api/hdfcPaymentStatus') || req.url.includes('api/direct_login'))) {
        routerMain.style.filter = 'blur(2px)';
      }

    }

    const shouldBlockEvents = !excludedRoutes.some(route => currentUrl.startsWith(route));
    if (shouldBlockEvents) {
      addEventListeners();
    }

    const session_obj: string | null = localStorage.getItem('activeUser');

    if (session_obj) {
      let token = JSON.parse(session_obj).token;
      if (req.url.includes('employeeLoginByMob')) {
        const basicAuth = 'Basic ' + btoa('tppunch_usr:TPm5q9EF2024');
        req = req.clone({
          setHeaders: {
            Authorization: basicAuth
          }
        });
      } else {
        req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
      }
    }


    if (!req.headers.has('Content-Type')) {
      req = req.clone({ headers: req.headers.set('Content-Type', 'application/json') });
    }

    req = req.clone({ headers: req.headers.set('Accept', 'application/json') });
    return next.handle(req).pipe(
      tap(event => {
        // Access response status here if needed
        if (event instanceof HttpResponse) {
          if (event.status == 201 || event.status == 202) {
            // 401 handled in auth.interceptor
            localStorage.removeItem('activeUser');
            this.router.navigate(['/logout']);
          }
        }
      }),
      //delay(500),
      // retry(2),
      finalize(() => {
        if (loadingContainer1) {
          loadingContainer1.style.display = 'none';
        }
        if (loadingContainer) {
          loadingContainer.style.display = 'none';
        }
        if (loaderOverlay) {
          loaderOverlay.style.display = 'none';
        }
        if (routerMain) {
          routerMain.classList.remove('no-click');
          routerMain.style.filter = null;
        }

        if (shouldBlockEvents) {
          removeEventListeners();
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (loadingContainer1) {
          loadingContainer1.style.display = 'none';
        }
        if (loadingContainer) {
          loadingContainer.style.display = 'none';
        }
        if (loaderOverlay) {
          loaderOverlay.style.display = 'none';
        }
        if (error.status == 201 || error.status == 202) {
          // 401 handled in auth.interceptor
          //this.toastr.error(error.message);
          localStorage.removeItem('activeUser');
          this.router.navigate(['/logout']);
        }
        if (shouldBlockEvents) {
          removeEventListeners();
        }
        return throwError(error);
      })
    );
  }
}
