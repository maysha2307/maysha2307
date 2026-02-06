import { Component, OnInit } from '@angular/core';
import { DialogService, DialogState } from '../../../services/dialog.service';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent implements OnInit {
  state: DialogState = { open: false, type: null, message: null };

  constructor(public dialog: DialogService) {}

  ngOnInit(): void {
    this.dialog.state$.subscribe(s => this.state = s);
  }

  close() {
    this.dialog.closeWith(false);
  }

  ok() {
    if (this.state.type === 'confirm') this.dialog.closeWith(true);
    else this.dialog.closeWith(true);
  }
}
