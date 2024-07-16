import { CommonModule } from '@angular/common';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-image-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-modal.component.html',
  styleUrl: './image-modal.component.css'
})
export class ImageModalComponent implements OnInit{
  @Input() foodImage: any;

  constructor(private activeModal:NgbActiveModal) { }
  ngOnInit(): void {
  }

}
