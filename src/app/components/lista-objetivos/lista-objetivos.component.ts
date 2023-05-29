import { Component, Input, EventEmitter, Output } from '@angular/core';
import {InfoNodeModel} from "../../models/info-node.model";

@Component({
  selector: 'app-lista-objetivos',
  templateUrl: './lista-objetivos.component.html',
  styleUrls: ['./lista-objetivos.component.css']
})
export class ListaObjetivosComponent {
  @Output() idObjetivoABuscar = new EventEmitter<number>()
  listaObjetivos: InfoNodeModel[]=[]

  @Input() set objetivosPersonaIn(objetivos: InfoNodeModel[]){
    this.listaObjetivos=objetivos;
  }

  cargarTareasObjetivo(objetivoId:string){
    this.idObjetivoABuscar.emit(Number(objetivoId));
  }

}
