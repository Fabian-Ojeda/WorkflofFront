import {InfoNodeModel} from "./info-node.model";
import {InfoRelationModel} from "./info-relation.model";

export interface SaveInfoTareasObjetivoModel {
  idObjetivo:number;
  nodes:InfoNodeModel[];
  relations:InfoRelationModel[];
}
