import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  ma_nv: string = '';
  password: string = '';
  rememberMe: boolean = false;
  loginFalse: boolean = false;
  connectFalse: boolean = false;

  captchaText: string = '';
  userCaptcha: string = '';
  captchaImage: string = '';
  captchaValid: boolean = true

  constructor(private authService: AuthService, private router: Router) {
    this.generateCaptcha();
  }

  ngOnInit() {
    const storedEmail = localStorage.getItem('email');
    const storedPassword = localStorage.getItem('password');

    if (storedEmail && storedPassword) {
      this.ma_nv = storedEmail;
      this.password = storedPassword;
      this.rememberMe = true;
    }
  }
  refreshCaptcha(){
    this.generateCaptcha();
    this.userCaptcha = ''
  }

  generateCaptcha() {
    const chars = '0123456789';
    this.captchaText = Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    this.drawCaptcha();
  }

  drawCaptcha() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 130;
    canvas.height = 60;

    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f3f3f3';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = '40px Arial';
      ctx.fillStyle = '#089';
      ctx.fillText(this.captchaText, 20, 40);

      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.stroke();
      }

      this.captchaImage = canvas.toDataURL();
    } else {
      console.error('Cannot get canvas context');
    }
  }

  onSubmit() {
    this.loginFalse = false
    this.captchaValid = true
    this.connectFalse = false
    if (this.userCaptcha !== this.captchaText) {
      this.captchaValid = false
      this.refreshCaptcha();
      return;
    }
    if (!this.ma_nv || !this.password) {
      this.loginFalse = true;
      this.connectFalse = false;
      return;
    }
    this.authService.login(this.ma_nv, this.password).subscribe(
      (isLoggedIn: boolean) => {
        if (isLoggedIn) {
          if (this.rememberMe) {
            localStorage.setItem('email', this.ma_nv);
            localStorage.setItem('password', this.password);
          } else {
            localStorage.removeItem('password');
          }
          this.authService.redirectBasedOnRole();
        } else {
          this.loginFalse = true;
          this.connectFalse = false;
        }
      },
      (error) => {
        this.refreshCaptcha();
        if (error.status === 401) {
          this.loginFalse = true;
          this.connectFalse = false;
        } else if (error.status === 400 || error.status === 500) {
          this.connectFalse = true;
          this.loginFalse = false;
        }
        console.error('Error:', error);
      }
    );
  }
}
