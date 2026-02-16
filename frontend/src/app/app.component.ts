import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MapComponent } from './components/map.component/map.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MapComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {}
