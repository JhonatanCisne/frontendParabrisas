import { Injectable } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';

/**
 * Custom ErrorStateMatcher that only shows validation errors
 * after the user attempts to submit the form.
 * Fields will NOT turn red on blur/touch — only on submit.
 */
@Injectable()
export class SubmitErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    return !!(control?.invalid && form?.submitted);
  }
}
