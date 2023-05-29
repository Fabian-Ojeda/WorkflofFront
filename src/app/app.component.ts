import { ChangeDetectorRef, Component, ViewChild, ViewEncapsulation } from '@angular/core';
import * as go from 'gojs';
import { DataSyncService, DiagramComponent, PaletteComponent } from 'gojs-angular';
import produce from 'immer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ahora-si-GoJS';

  @ViewChild('myDiagram', { static: true }) public myDiagramComponent!: DiagramComponent;
  @ViewChild('myPalette', { static: true }) public myPaletteComponent!: PaletteComponent;
  public state = {
    // Diagram state props
    diagramNodeData: [
      { id: 'BMW', text: 'BMW', color: 'lightblue', loc: '0 0' },
      { id: 'Audi', text: 'Audi', color: 'orange', loc: '150 0' },
      { id: 'Mercedes Benz', text: 'Mercedes Benz', color: 'lightgreen', loc: '0 100' },
      { id: 'Porsche', text: 'Porsche', color: 'pink', loc: '150 100' }
    ],
    diagramLinkData: [
      { key: -1, from: 'BMW', to: 'Audi', fromPort: 'r', toPort: '1' },
      { key: -2, from: 'BMW', to: 'Mercedes Benz', fromPort: 'b', toPort: 't' },
      { key: -3, from: 'Audi', to: 'Audi' },
      { key: -4, from: 'Mercedes Benz', to: 'Porsche', fromPort: 'r', toPort: 'l' },
      { key: -5, from: 'Porsche', to: 'BMW', fromPort: 't', toPort: 'r' },
      { key: -6, from: 'BMW', to: 'BMW' },
    ],
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
  constructor(private cdr: ChangeDetectorRef) { }

  public diagramDivClassName = 'myDiagramDiv';
  public observedDiagram = null;
  public selectedNodeData: go.ObjectData = {};
  public initDiagram(): go.Diagram {
    const $ = go.GraphObject.make;
    const dia = $(go.Diagram, {
      'undoManager.isEnabled': true,
      'clickCreatingTool.archetypeNodeData': { text: 'new node', color: 'lightblue' },
      model: $(go.GraphLinksModel,
        {
          nodeKeyProperty: 'id',
          linkToPortIdProperty: 'toPort',
          linkFromPortIdProperty: 'fromPort',
          linkKeyProperty: 'key' // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
        }
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

    return dia;
  }

  public initOverview(): go.Overview {
    const $ = go.GraphObject.make;
    const overview = $(go.Overview);
    return overview;
  }

  public ngAfterViewInit() {
    if (this.observedDiagram) return;
    // @ts-ignore
    this.observedDiagram = this.myDiagramComponent.diagram;
    this.cdr.detectChanges();
    const appComp: AppComponent = this;
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

  public cambiarNodos(){
    //alert("primero que todo buenas tardes")
        this.state.diagramNodeData = [
      { id: 'BMW', text: 'BMW', color: 'orange', loc: '0 0' },
      { id: 'Audi', text: 'Audi', color: 'orange', loc: '150 0' },
      { id: 'Mercedes Benz', text: 'Mercedes Benz', color: 'orange', loc: '0 100' },
      { id: 'Porsche', text: 'Porsche', color: 'orange', loc: '150 100' }
    ]
    alert("Bendito sea el nombre de Dios")
  }

}
