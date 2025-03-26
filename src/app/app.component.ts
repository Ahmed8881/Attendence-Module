import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AttendenceComponent } from "./attendence/attendence.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, AttendenceComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'Attendence-Module';
}
