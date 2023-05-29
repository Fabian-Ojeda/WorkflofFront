import { Component } from '@angular/core';
import {InfoNodeModel} from "../../models/info-node.model";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  public objetivosPersona: InfoNodeModel[]=[]
  public idObjetivoABuscar!: number;
  recibirObjetivosPersona(nodos: InfoNodeModel[]){
    this.objetivosPersona = nodos;
  }

  recibirObjetivoABuscar(idNodo:number){
    this.idObjetivoABuscar=idNodo
  }
}
