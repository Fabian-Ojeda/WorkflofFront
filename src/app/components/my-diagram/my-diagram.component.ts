import {ChangeDetectorRef, Component, OnInit, ViewChild, ViewEncapsulation, Input} from '@angular/core';
import * as go from 'gojs';
import { DataSyncService, DiagramComponent, PaletteComponent } from 'gojs-angular';
import produce from 'immer';
import { DiagramDataService } from "../../services/diagramData/diagram-data.service";
import {InfoNodeModel} from "../../models/info-node.model";
import {InfoRelationModel} from "../../models/info-relation.model";
import {SpinnerService} from "../../services/spinner/spinner.service";
import {ShowAlertService} from "../../services/showAlert/show-alert.service";
import {SaveInfoTareasObjetivoModel} from "../../models/save-info-tareas-objetivo.model";

@Component({
  selector: 'app-my-diagram',
  templateUrl: './my-diagram.component.html',
  styleUrls: ['./my-diagram.component.css'],
  encapsulation: ViewEncapsulation.ShadowDom
})
export class MyDiagramComponent implements OnInit{
  @Input() set idObjetivoBuscar(idObjetivo:number){
    if(idObjetivo){
      this.loadTareasObjetivo(idObjetivo);
      this.idObjetivoActual=idObjetivo
    }
  }
  @ViewChild('myDiagram', { static: true }) public myDiagramComponent!: DiagramComponent;
  @ViewChild('myPalette', { static: true }) public myPaletteComponent!: PaletteComponent;
  idObjetivoActual!:number;
  dataNodosObjetivos:InfoNodeModel[] = []
  dataLinks:InfoRelationModel[] = []
  public state = {
    // Diagram state props
    diagramNodeData: this.dataNodosObjetivos,
    diagramLinkData: this.dataLinks,
    diagramModelData: { prop: 'value' },
    skipsDiagramUpdate: false,
    selectedNodeData: null, // used by InspectorComponent

    // Palette state props
    paletteNodeData: [
      { key: 'Epsilon', text: 'Epsilon', color: 'red' },
      { key: 'Kappa', text: 'Kappa', color: 'purple' }
    ],
    paletteModelData: { prop: 'val' }
  };

  constructor(
    private diagramDataService: DiagramDataService,
    private cdr: ChangeDetectorRef,
    private spinnerService: SpinnerService,
    private showAlert: ShowAlertService
  ) {
  }

  public diagramDivClassName = 'myDiagramDiv';
  public observedDiagram!:any;
  public oDivClassName = 'myOverviewDiv';
  public selectedNodeData: go.ObjectData = {};
  ngOnInit(): void {

    this.spinnerService.show();
    setTimeout(() => {
      /** spinner ends after 5 seconds */
      this.spinnerService.hide();
    }, 2000);
  }
  private loadTareasObjetivo(idObjetivo:number){
    console.log("se va a buscar las tareas de "+idObjetivo)
    this.spinnerService.show();
    this.diagramDataService.getInfoObjetivos(idObjetivo).subscribe(
      data=> {

        console.log("nodos que llegan", data.nodes)
        console.log("relaciones que llegan", data.relations)
        this.myDiagramComponent.clear();

        this.state = produce(this.state, draft => {
          draft.skipsDiagramUpdate = false;
          draft.diagramNodeData = data.nodes;
          draft.diagramLinkData = data.relations;
        });

        this.spinnerService.hide();
      },
      error => {
        this.spinnerService.hide();
        this.showAlert.showError("Error", error);
      }
    )
  }

  public initDiagram(): go.Diagram {
    const $ = go.GraphObject.make;
    const dia = $(go.Diagram, {
      'undoManager.isEnabled': true,
      'clickCreatingTool.archetypeNodeData': { text: 'new node', color: 'lightgreen' },
      model: $(go.GraphLinksModel,
        {
          nodeKeyProperty: 'id',
          linkToPortIdProperty: 'toPort',
          linkFromPortIdProperty: 'fromPort',
          linkKeyProperty: 'key' // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
        }
      ),
      layout:$(go.TreeLayout, { angle: 90, nodeSpacing: 10, layerSpacing: 30 }
      )
    });

    dia.commandHandler.archetypeGroupData = { key: 'Group', isGroup: true };

    // tslint:disable-next-line:only-arrow-functions
    //TODO Revisar como funciona lo de los puertos
    const makePort = function(id: string, spot: go.Spot) {
      return $(go.Shape, 'Circle',
        {
          opacity: .5,
          fill: 'gray', strokeWidth: 0, desiredSize: new go.Size(8, 8),
          portId: id, alignment: spot,
          fromLinkable: true, toLinkable: true
        }
      );
    }

    // define the Node template
    dia.nodeTemplate =
      $(go.Node, 'Spot',
        {
          contextMenu:
            $('ContextMenu',
              $('ContextMenuButton',
                $(go.TextBlock, 'Group'),
                { click(e, obj) { e.diagram.commandHandler.groupSelection(); } },
                // tslint:disable-next-line:only-arrow-functions
                new go.Binding('visible', '', function(o) {
                  return o.diagram.selection.count > 1;
                }).ofObject())
            )
        },
        //TODO mirar que es el binding otra vez
        new go.Binding('location', 'loc', go.Point.parse).makeTwoWay(go.Point.stringify),
        $(go.Panel, 'Auto',
          $(go.Shape, 'RoundedRectangle', { stroke: null },
            new go.Binding('fill', 'color', (c, panel) => {
              return c;
            })
          ),
          $(go.TextBlock, { margin: 8, editable: true },
            new go.Binding('text').makeTwoWay())
        ),
        // Ports
        makePort('t', go.Spot.TopCenter),
        makePort('l', go.Spot.Left),
        makePort('r', go.Spot.Right),
        makePort('b', go.Spot.BottomCenter)
      );

    dia.linkTemplate = $(go.Link,
    //Un arreglo que no se para que sea
      {
        curve:go.Link.Bezier,
        adjusting: go.Link.Stretch,
        reshapable: true, relinkableFrom: true, relinkableTo: true,
        toShortLength: 3
      },

      //A continuación algo que no se que hace
      new go.Binding("curviness"),
      //A continuación la linea
      $(go.Shape,  // the link shape
        { strokeWidth: 1.5 },
        new go.Binding('stroke', 'progress', progress => progress ? "#52ce60" /* green */ : 'black'),
        new go.Binding('strokeWidth', 'progress', progress => progress ? 2.5 : 1.5)),
      // A continuación el simbolo de la flecha
      $(go.Shape,  // the arrowhead
        { toArrow: "standard", stroke: null },
        new go.Binding('fill', 'progress', progress => progress ? "#52ce60" /* green */ : 'black')),

      $(go.Panel, "Auto",
        //a continuación la sección del texto
        $(go.TextBlock, "inserte relación",  // the label text
          {
            textAlign: "center",
            font: "9pt helvetica, arial, sans-serif",
            margin: 4,
            background: "white",
            editable: true  // enable in-place editing
          },
          // editing the text automatically updates the model data
          new go.Binding("text").makeTwoWay())
        )
    )

    return dia;
  }

  public initOverview(): go.Overview {
    const $ = go.GraphObject.make;
    const overview = $(go.Overview);
    return overview;
  }

  public ngAfterViewInit() {
    if (this.observedDiagram) return;

    this.observedDiagram = this.myDiagramComponent.diagram;
    this.cdr.detectChanges();
    const appComp: MyDiagramComponent = this;
    // tslint:disable-next-line:only-arrow-functions
    this.myDiagramComponent.diagram.addDiagramListener('ChangedSelection', function(e) {
      if (e.diagram.selection.count === 0) {
        appComp.selectedNodeData = {};
      }
      const node = e.diagram.selection.first();
      appComp.state = produce(appComp.state, draft => {
        if (node instanceof go.Node) {
          // tslint:disable-next-line:no-shadowed-variable triple-equals
          const idx = draft.diagramNodeData.findIndex(nd => nd.id == node.data.id);
          const nd = draft.diagramNodeData[idx];
          // @ts-ignore
          draft.selectedNodeData = nd;
        } else {
          draft.selectedNodeData = null;
        }
      });
    });
  }

  public diagramModelChange = (changes: go.IncrementalData) => {
    if (!changes) return;
    const appComp = this;
    this.state = produce(this.state, draft => {
      // set skipsDiagramUpdate: true since GoJS already has this update
      // this way, we don't log an unneeded transaction in the Diagram's undoManager history
      draft.skipsDiagramUpdate = true;
      // @ts-ignore
      draft.diagramNodeData = DataSyncService.syncNodeData(changes, draft.diagramNodeData, appComp.observedDiagram.model);
      // @ts-ignore
      draft.diagramLinkData = DataSyncService.syncLinkData(changes, draft.diagramLinkData, appComp.observedDiagram.model);
      // @ts-ignore
      draft.diagramModelData = DataSyncService.syncModelData(changes, draft.diagramModelData);
      // If one of the modified nodes was the selected node used by the inspector, update the inspector selectedNodeData object
      const modifiedNodeDatas = changes.modifiedNodeData;
      if (modifiedNodeDatas && draft.selectedNodeData) {
        // tslint:disable-next-line:prefer-for-of
        for (let i = 0; i < modifiedNodeDatas.length; i++) {
          const mn = modifiedNodeDatas[i];
          const nodeKeyProperty = appComp.myDiagramComponent.diagram.model.nodeKeyProperty as string;
          if (mn[nodeKeyProperty] === draft.selectedNodeData![nodeKeyProperty]) {
            // @ts-ignore
            draft.selectedNodeData = mn;
          }
        }
      }
    });
  }

  public handleInspectorChange(changedPropAndVal: { prop: any; newVal: any; }) {

    const path = changedPropAndVal.prop;
    const value = changedPropAndVal.newVal;

    this.state = produce(this.state, draft => {
      const data = draft.selectedNodeData;

      // @ts-ignore
      data[path] = value;
      // @ts-ignore
      const key = data.id;
      // tslint:disable-next-line:triple-equals
      const idx = draft.diagramNodeData.findIndex(nd => nd.id == key);
      if (idx >= 0) {
        // @ts-ignore
        draft.diagramNodeData[idx] = data;
        draft.skipsDiagramUpdate = false; // we need to sync GoJS data with this new app state, so do not skips Diagram update
      }
    });
  }

  saveChanges(){

    let infoToSave: SaveInfoTareasObjetivoModel= {
      idObjetivo: this.idObjetivoActual,
      nodes: this.state.diagramNodeData,
      relations: this.state.diagramLinkData
    };
    this.spinnerService.show();
    this.diagramDataService.guardarDataTareasObjetivo(infoToSave).subscribe(
      data=> {
        this.spinnerService.hide();
        this.showAlert.showSuccess("Información guardada", data.description)
        console.log(data)
      },
      error => {
        this.spinnerService.hide();
        this.showAlert.showError("Error", error);
      }
    )
     }

}
