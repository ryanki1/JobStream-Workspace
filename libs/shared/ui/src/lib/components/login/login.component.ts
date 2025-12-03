import { Component, inject, OnInit } from '@angular/core';
import {
  AuthService,
  LoginRequest,
} from '@jobstream-workspace/shared/api-types';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'lib-login',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {

  public readonly fb = inject(FormBuilder);
  public form!: FormGroup;

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      role: ['Admin', Validators.required] // TODO [kr] Admin, Freelacer, Company
    })

  }
  public login() {
    const request: LoginRequest = {
      email: this.form.get('email')?.value,
      password: this.form.get('password')?.value,
    };
    AuthService.postApiAuthLogin({ requestBody: request }).then(
      (response: { token?: string }) => {
        if (response.token) {
          localStorage.setItem('token', response.token)
        }
      }
    );
  }
}
