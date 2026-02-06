import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type DialogState = {
  open: boolean;
  type: 'alert' | 'confirm' | null;
  message: string | null;
};

@Injectable({ providedIn: 'root' })
export class DialogService {
  private stateSubject = new BehaviorSubject<DialogState>({ open: false, type: null, message: null });
  state$ = this.stateSubject.asObservable();

  private resolveFn: ((value?: any) => void) | null = null;

  alert(message: string): Promise<void> {
    this.stateSubject.next({ open: true, type: 'alert', message });
    return new Promise<void>((resolve) => {
      this.resolveFn = () => {
        this.close();
        resolve();
      };
    });
  }

  confirm(message: string): Promise<boolean> {
    this.stateSubject.next({ open: true, type: 'confirm', message });
    return new Promise<boolean>((resolve) => {
      this.resolveFn = (val?: any) => {
        this.close();
        resolve(Boolean(val));
      };
    });
  }

  closeWith(result?: any) {
    if (this.resolveFn) {
      this.resolveFn(result);
      this.resolveFn = null;
    }
  }

  close() {
    this.stateSubject.next({ open: false, type: null, message: null });
    this.resolveFn = null;
  }
}
