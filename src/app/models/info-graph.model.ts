import {InfoNodeModel} from "./info-node.model";
import {InfoRelationModel} from "./info-relation.model";

export interface InfoGraphModel {
  nodes:InfoNodeModel[];
  relations:InfoRelationModel[];
}
