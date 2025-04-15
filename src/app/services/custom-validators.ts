import { AbstractControl, ValidatorFn, FormGroup } from '@angular/forms';

export class CustomValidators {
  static passwordMatch(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const password = control.get('password');
      const confirmPassword = control.get('passwordConfirm');
      if (!password || !confirmPassword) return null;
      return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    };
  }

  static strongPassword(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      const value = control.value;
      if (!value) return null;

      if (value.length < 6) {
        return { weakPassword: 'Mật khẩu phải có ít nhất 6 ký tự' };
      }
      if (!/[^a-zA-Z0-9]/.test(value)) {
        return { weakPassword: 'Mật khẩu phải chứa ít nhất một ký tự đặc biệt' };
      }
      if (!/[A-Z]/.test(value)) {
        return { weakPassword: 'Mật khẩu phải có ít nhất một chữ hoa' };
      }
      if (!/[a-z]/.test(value)) {
        return { weakPassword: 'Mật khẩu phải có ít nhất một chữ thường' };
      }
      if (!/[0-9]/.test(value)) {
        return { weakPassword: 'Mật khẩu phải có ít nhất một chữ số (0-9)' };
      }
      return null;
    };
  }
}
