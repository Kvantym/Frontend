import { Component } from '@angular/core';
import {RouterLink, RouterOutlet} from "@angular/router";
import { TranslatePipe } from '../shared/translate.pipe';

@Component({
  selector: 'app-main-layout-component',
    imports: [
        RouterLink,
        RouterOutlet,
        TranslatePipe
    ],
  templateUrl: './main-layout-component.html',
  styleUrl: './main-layout-component.scss'
})
export class MainLayoutComponent {

}
