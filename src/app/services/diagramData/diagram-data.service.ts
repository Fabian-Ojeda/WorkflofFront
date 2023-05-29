import { Injectable } from '@angular/core';
import {  HttpClient, HttpErrorResponse, HttpStatusCode} from "@angular/common/http";
import {catchError, retry, map} from "rxjs/operators";
import { throwError } from "rxjs"
import {environment} from "../../environments/environment.dev";
import {InfoNodeModel} from "../../models/info-node.model";
import {InfoGraphModel} from "../../models/info-graph.model";
import {SaveInfoTareasObjetivoModel} from "../../models/save-info-tareas-objetivo.model";
import {ResponseDTOModel} from "../../models/response-dto.model";
import {PersonaNodosDTOModel} from "../../models/persona-nodos-dto.model";

@Injectable({
  providedIn: 'root'
})
export class DiagramDataService {


  constructor(
    private httpClient: HttpClient
  ) {
  }
  getAllData(){
    return this.httpClient.get(`${environment.API_URL}`, { responseType: 'text' }).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('Error:', error);
        return throwError(()=>'Ocurrió un error en la solicitud');
      })
    )
  }

  getObjetivosPorCreador(personaId:number){
    return this.httpClient.get<PersonaNodosDTOModel>(`${environment.API_URL}obtenerObjetivosPorCreador?personaId=${personaId}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('Error:', error);
        return throwError(()=>'Ocurrió un error en la solicitud');
      })
    )
  }

  getInfoObjetivos(idObjetivo:number){
    return this.httpClient.post<InfoGraphModel>(`${environment.API_URL}obtenerTareasPorObjetivo`,{idObjetivo:idObjetivo}).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('Error:', error);
        return throwError(()=>'Ocurrió un error en la solicitud');
      })
    )
  }
  guardarDataTareasObjetivo(dataToSave : SaveInfoTareasObjetivoModel){
    console.log("esto nos llega para guardar", dataToSave)
    return this.httpClient.post<ResponseDTOModel>(`${environment.API_URL}guardarTareasPorObjetivo`,dataToSave).pipe(
      catchError((error: HttpErrorResponse) => {
        console.log('Error:', error);
        return throwError(()=>'Ocurrió un error en la solicitud');
      })
    )
  }
}
