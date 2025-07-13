import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search.html',
  styleUrl: './search.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]  // 👈 바로 이거 추가해야 함!
})
export class SearchComponent {
  items = ['Angular', 'React', 'Vue'];
}