import { Injectable } from '@angular/core';
import {NgxSpinnerService} from "ngx-spinner";

@Injectable({
  providedIn: 'root'
})
export class SpinnerService {

  constructor(private spinner: NgxSpinnerService) { }

  show(){
    this.spinner.show("mySpinner", {
      type: "ball-scale-multiple",
      size: "medium",
      bdColor: "rgba(51,51,51,0.8)",
      color: "#fff",
      template:
        "<img width='50' height='50' src='assets/img/gif.gif'/>",
    });
  }

  hide(){
    this.spinner.hide("mySpinner");
  }
}
