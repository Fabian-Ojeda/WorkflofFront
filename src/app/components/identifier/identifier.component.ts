import {Component, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import { DiagramDataService } from "../../services/diagramData/diagram-data.service";
import {InfoNodeModel} from "../../models/info-node.model";
import {SpinnerService} from "../../services/spinner/spinner.service";
import {ShowAlertService} from "../../services/showAlert/show-alert.service";

@Component({
  selector: 'app-identifier',
  templateUrl: './identifier.component.html',
  styleUrls: ['./identifier.component.css']
})
export class IdentifierComponent {
  public nombreUsuario:string="";
  public cargoUsuario:string="";
  public formIdentifyUser!:FormGroup;
  @Output() nodosObjetivosUser = new EventEmitter<InfoNodeModel[]>();

  constructor(
    private fb: FormBuilder,
    private diagramDataService: DiagramDataService,
    private spinnerService: SpinnerService,
    private showAlert: ShowAlertService
  ) {
    this.initForm()
  }


  initForm(){
    this.formIdentifyUser = this.fb.group({
      idUser:['', [Validators.required]]
    })
  }
  login(){
    if (this.formIdentifyUser.valid) {
      this.spinnerService.show();
      this.diagramDataService.getObjetivosPorCreador(this.formIdentifyUser.controls['idUser'].value).subscribe(
        data=> {
           this.nombreUsuario= data.infoPersona.nombres+" "+data.infoPersona.apellidos
           this.cargoUsuario= data.infoPersona.cargo
           this.nodosObjetivosUser.emit(data.nodos)
          this.spinnerService.hide();
        },
        error => {
          this.spinnerService.hide();
          this.showAlert.showError('Pailas', error)
        })
    }
    else {
      this.showAlert.showError('Campo vacio', 'Debe introducir un valor de id de persona')
    }
  }
}
