import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { GojsAngularModule } from 'gojs-angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { HttpClientModule } from "@angular/common/http";
import { MyDiagramComponent } from './components/my-diagram/my-diagram.component';
import { IdentifierComponent } from './components/identifier/identifier.component';
import {FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ListaObjetivosComponent } from './components/lista-objetivos/lista-objetivos.component';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { NgxSpinnerModule } from "ngx-spinner";
import { InspectorRowComponent } from './components/inspector-row/inspector-row.component';
import { InspectorComponent } from './components/inspector/inspector.component';

interface NgxSpinnerConfig {
  type?: string;
}

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    MyDiagramComponent,
    IdentifierComponent,
    ListaObjetivosComponent,
    InspectorRowComponent,
    InspectorComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    GojsAngularModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    NgxSpinnerModule.forRoot({ type: 'ball-scale-multiple' })
  ],
  providers: [],
  bootstrap: [AppComponent]
})

export class AppModule { }
