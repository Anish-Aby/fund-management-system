import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './header/header';

@Component({
  selector: 'app-core',
  imports: [RouterOutlet, Header],
  templateUrl: './core.html',
  styleUrl: './core.scss',
})
export class Core {}
