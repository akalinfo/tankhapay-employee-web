import { Injectable } from '@angular/core';
import { Observable, Subject, Subscription } from 'rxjs';

declare var $:any;

@Injectable({
  providedIn: 'root'
})
export class ConfirmationDialogService {

  private subject = new Subject<boolean>();

  confirm(message: string, title: string): Observable<boolean> {
    const modalId = 'confirmationModal';

    // Remove previous modal element if it exists
    $('#' + modalId).remove();

    const modal = `
      <div class="modal fade" id="${modalId}" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header theme-bg">
              <h4 class="modal-title" id="exampleModalLabel">${title}</h4>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body" style="font-size:15px;text-align: justify;">${message}</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" id="confirmButton">Yes</button>
              <button type="button" class="btn btn-secondary" id="cancelButton" data-dismiss="modal">No</button>
            </div>
          </div>
        </div>
      </div>
    `;

    $(document.body).append(modal);

    const confirmButton = document.getElementById('confirmButton');
    const cancelButton = document.getElementById('cancelButton');

    // Create a new observable each time confirm is called
    return new Observable<boolean>((observer) => {
      const confirmHandler = () => {
        observer.next(true);
        observer.complete();
        this.closeModal();
      };

      const cancelHandler = () => {
        observer.next(false);
        observer.complete();
        this.closeModal();
      };

      $(`#${modalId}`).modal('show');

      confirmButton.addEventListener('click', confirmHandler);
      cancelButton.addEventListener('click', cancelHandler);

      // Cleanup function
      return () => {
        confirmButton.removeEventListener('click', confirmHandler);
        cancelButton.removeEventListener('click', cancelHandler);
      };
    });
  }

  // private closeModal() {
  //   const modalId = 'confirmationModal';
  //   $('#' + modalId).modal('hide');
  //   $('#' + modalId).remove();
  //   $('body').removeClass('modal-open');
  //   $('.modal-backdrop').remove();
  // }
  private closeModal() {
    const modalId = 'confirmationModal';
    $('#' + modalId).modal('hide');
    $('#' + modalId).remove();
    $('body').css('padding-right', ''); // Reset the padding-right property
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
  }
}