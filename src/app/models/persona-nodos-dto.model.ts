import {PersonaDTOModel} from "./persona-dto.model";
import {InfoNodeModel} from "./info-node.model";

export interface PersonaNodosDTOModel {
  infoPersona: PersonaDTOModel;
  nodos: InfoNodeModel[]
}
