import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { projectReducer, PROJECT_FEATURE_KEY } from './store/project.reducer';
import { ProjectEffects } from './store/project.effects';
import { AppComponent } from './app.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { TrackPanelComponent } from './components/track-panel/track-panel.component';
import { TransportBarComponent } from './components/transport-bar/transport-bar.component';
import { PianoRollCanvasComponent } from './components/piano-roll-canvas/piano-roll-canvas.component';

@NgModule({
  imports: [
    BrowserModule,
    StoreModule.forRoot({ [PROJECT_FEATURE_KEY]: projectReducer }),
    EffectsModule.forRoot([ProjectEffects]),
    AppComponent,
    ToolbarComponent,
    TrackPanelComponent,
    TransportBarComponent,
    PianoRollCanvasComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
