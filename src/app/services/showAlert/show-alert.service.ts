import { Injectable } from '@angular/core';
import Swal from 'sweetalert2'

@Injectable({
  providedIn: 'root'
})
export class ShowAlertService {

  constructor() { }

  showSuccess(title:string, text:string){
    Swal.fire({
      icon: 'success',
      title,
      text,
    })
  }
  showError(title:string, text:string){
    Swal.fire({
      icon: 'error',
      title,
      text,
    })
  }
}
