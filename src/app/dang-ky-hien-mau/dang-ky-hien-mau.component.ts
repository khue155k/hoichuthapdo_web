import { AfterViewInit, Component, CUSTOM_ELEMENTS_SCHEMA, OnInit } from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DotHienMauService } from '../services/dot-hien-mau.service';
import { Router } from '@angular/router';
import { LocationService } from '../services/location.service';
import { Select2Module, Select2Data, Select2UpdateEvent } from 'ng-select2-component';
// import { TTHienMauService } from '../services/ds-hien-mau1.service';
import { TTHienMauService } from '../services/ds-hien-mau.service';
import { TinhNguyenVienService } from '../services/tinh-nguyen-vien.service';
import { DonViService } from '../services';

@Component({
  selector: 'app-dang-ky-hien-mau',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, Select2Module],
  templateUrl: './dang-ky-hien-mau.component.html',
  styleUrl: './dang-ky-hien-mau.component.css'
})
export class DangKyHienMauComponent {
  constructor(private fb: FormBuilder, private locationService: LocationService,
    private dotHienMauService: DotHienMauService, private donViService: DonViService,
    private tinhNguyenVienService: TinhNguyenVienService,
    private dsHienMauService: TTHienMauService) {
    this.registerForm = this.fb.group({
      hoTen: ['', Validators.required],
      ngaySinh: ['', Validators.required],
      cccd: ['', Validators.required],
      gioiTinh: ['', Validators.required],
      ngheNghiep: ['', Validators.required],
      tinh_thanh: ['', Validators.required],
      quan_huyen: ['', Validators.required],
      phuong_xa: ['', Validators.required],
      noiO: ['', Validators.required],
      don_vi: ['', Validators.required],
      don_vi_mau: ['', Validators.required],
      thoi_gian: ['', Validators.required],
      email: [''],
      dien_thoai: ['', Validators.required],
      dongy1: [false, Validators.requiredTrue],
      gioiTinh_text: [''],
      tinh_thanh_text: [''],
      quan_huyen_text: [''],
      phuong_xa_text: [''],
    });
  }

  ngOnInit() {
    this.loadDotHienMau();
    this.loadDonVis();
    this.loadTheTichMauHien();
    this.loadProvinces()
  }

  isReadOnlyAutoFill: boolean = false;
  dotHienMauList: any[] = [];
  maDot: number = 0;
  selectedDotHM: any;

  registerForm: FormGroup;
  showScanner: boolean = false;
  qrResultString: string = '';

  provinces: any[] = [];
  districts: any[] = [];
  wards: any[] = [];

  selectedProvince: string = '';
  selectedDistrict: string = '';
  selectedWard: string = '';

  selectedProvinceName: string = '';
  selectedDistrictName: string = '';
  selectedWardName: string = '';

  donViList: any[] = [];
  theTichMauHienList: any[] = [];
  selectedCoQuanID: number = 0;
  selectedTheTich: string = ''
  gioiTinhOptions = [
    { value: 'Nam', label: 'Nam' },
    { value: 'Nữ', label: 'Nữ' }
  ];
  gioiTinh: string = ''
  sl2_tinh_thanh: any[] = []
  sl2_quan_huyen: any[] = []
  sl2_phuong_xa: any[] = []

  updateDotHM(event: Select2UpdateEvent<any>) {
    this.maDot = event.value;
    this.selectedDotHM = this.dotHienMauList.find(dot => dot.value === this.maDot);
  }

  update(key: string, event: Select2UpdateEvent<any>) {
    if (key === 'gioiTinh') {
      this.gioiTinh = event.value;
    }
    else if (key === 'tinh_thanh') {
      this.sl2_quan_huyen = []
      this.sl2_phuong_xa = []
      if (this.selectedProvince != '')
        this.onProvinceChange();
    }
    else if (key === 'quan_huyen') {
      this.sl2_phuong_xa = []
      if (this.selectedDistrict != '')
        this.onDistrictChange()
    }
    else if (key === 'phuong_xa') {
      if (this.selectedWard != '')
        this.onWardChange()
    }
  }


  loadTheTichMauHien() {
    this.dotHienMauService.getTheTichMauHien().subscribe({
      next: (response) => {
        if (response.code === 200)
          this.theTichMauHienList = response.data;
      },
      error: (err) => {
        console.error('Lỗi khi load thể tích máu hiến:', err);
      },
    });
  }
  private formatToISO(date: Date): string {
    return date.toISOString().slice(0, 16);
  }

  loadDotHienMau(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dotHienMauService.getAllDotHienMau().subscribe({
        next: (response) => {
          if (response.code === 200) {
            const now = new Date();
            console.log(response.data);
            console.log(now);

            this.dotHienMauList = response.data.map((dotHM: any) => ({
              value: dotHM.maDot,
              label: dotHM.tenDot + " từ " + formatDate(dotHM.thoiGianBatDau, 'HH:mm dd-MM-yyyy', 'en-US') + " đến " + formatDate(dotHM.thoiGianKetThuc, 'HH:mm dd-MM-yyyy', 'en-US'),
              tenDot: dotHM.tenDot,
              diaDiem: dotHM.diaDiem,
              thoiGianBatDau: dotHM.thoiGianBatDau,
              thoiGianKetThuc: dotHM.thoiGianKetThuc
            })).filter(dot => new Date(dot.thoiGianKetThuc) > now);
            console.log(this.dotHienMauList);
          } else {
            console.error('Lỗi khi tải đợt hiến máu');
          }
          resolve();
        },
        error: (error) => {
          console.error('Lỗi khi tải đợt hiến máu:', error);
          reject();
        }
      });
    });
  }

  validateDate(): void {
    const thoiGianControl = this.registerForm.controls['thoi_gian'];
    const thoiGianValue = thoiGianControl.value;

    if (thoiGianValue && this.maDot) {
      if (!this.selectedDotHM) return;

      const ngayNhap = new Date(thoiGianValue);
      const ngayBd = new Date(this.selectedDotHM.thoiGianBatDau);
      const ngayKt = new Date(this.selectedDotHM.thoiGianKetThuc);

      if (ngayNhap < ngayBd || ngayNhap > ngayKt) {
        thoiGianControl.setErrors({ outOfRange: true });
      } else {
        thoiGianControl.setErrors(null); // Xóa lỗi nếu hợp lệ
      }
    }
  }


  loadDonVis() {
    this.donViService.getDonVis().subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.donViList = response.data.map((donVi: any) => ({
            value: donVi.maDV,
            label: donVi.tenDV,
          }));
        }
      },
      error: (err) => {
        console.error('Lỗi khi lấy danh sách đơn vị:', err);
      }
    });
  }

  loadProvinces() {
    this.locationService.getProvinces().subscribe(data => {
      this.provinces = data;
      this.sl2_tinh_thanh = this.getSelect2DataProvince();
    });
  }
  getSelect2DataProvince() {
    return this.provinces.map(item => ({
      value: item.provinceId,
      label: item.name,
    }));
  }
  getSelect2DataDistrict() {
    return this.districts.map(item => ({
      value: item.districtId,
      label: item.name,
    }));
  }
  getSelect2DataWard() {
    return this.wards.map(item => ({
      value: item.wardId,
      label: item.name,
    }));
  }

  onProvinceChange() {
    this.selectedProvinceName = this.sl2_tinh_thanh.find(t => t.value == this.selectedProvince).label;
    this.registerForm.controls['quan_huyen'].markAsUntouched();
    this.registerForm.controls['phuong_xa'].markAsUntouched();
    this.locationService.getDistricts(this.selectedProvince).subscribe(data => {
      this.districts = data;
      this.wards = [];
      this.selectedDistrict = '';
      this.selectedWard = '';
      this.sl2_quan_huyen = this.getSelect2DataDistrict();
      this.sl2_phuong_xa = this.getSelect2DataWard();
    });
  }

  onDistrictChange() {
    this.selectedDistrictName = this.sl2_quan_huyen.find(q => q.value == this.selectedDistrict).label;
    this.registerForm.controls['phuong_xa'].markAsUntouched();
    this.locationService.getWards(this.selectedDistrict).subscribe(data => {
      this.wards = data;
      this.selectedWard = '';
      this.sl2_phuong_xa = this.getSelect2DataWard();
    });
  }
  onWardChange() {
    this.selectedWardName = this.sl2_phuong_xa.find(p => p.value == this.selectedWard).label;
  }

  autoFill() {
    if (this.registerForm.get('cccd')?.value != '') {
      this.tinhNguyenVienService.getTinhNguyenVienByCCCD(this.registerForm.get('cccd')?.value).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.isReadOnlyAutoFill = true;
            this.selectedProvince = response.data.maTinhThanh;
            this.gioiTinh = response.data.gioiTinh;

            setTimeout(() => {
              this.selectedDistrict = response.data.maQuanHuyen;
              setTimeout(() => {
                this.selectedWard = response.data.maPhuongXa;
                setTimeout(() => {
                  this.registerForm.patchValue({
                    cccd: response.data.cccd,
                    hoTen: response.data.hoTen,
                    dien_thoai: response.data.soDienThoai,
                    ngaySinh: response.data.ngaySinh.substring(0, 10),
                    gioiTinh: response.data.gioiTinh,
                    email: response.data.email,
                  });
                }, 100)
              }, 100);
            }, 100);
          }
          if (response.code === 404) {
            this.registerForm.controls['hoTen'].markAsUntouched();
            this.registerForm.controls['dien_thoai'].markAsUntouched();
            this.registerForm.controls['ngaySinh'].markAsUntouched();
            this.registerForm.controls['gioiTinh'].markAsUntouched();
            this.registerForm.controls['tinh_thanh'].markAsUntouched();
            this.registerForm.controls['quan_huyen'].markAsUntouched();
            this.registerForm.controls['phuong_xa'].markAsUntouched();

            this.selectedProvince = '';
            this.selectedDistrict = '';
            this.selectedWard = '';
            this.registerForm.patchValue({
              hoTen: '',
              dien_thoai: '',
              ngaySinh: '',
              gioiTinh: '',
              email: '',
            });
            this.isReadOnlyAutoFill = false;
          }
          if (response.code === 400) {
            alert(response.message);
          }
        },
        error: (err) => {
          alert(err);
        },
      })
    }
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const tt_hien_mau_data = {
        id: 0,
        maDot: this.maDot,
        CCCD: '',
        maTheTich: Number(this.selectedTheTich),
        maDV: this.selectedCoQuanID,
        ngheNghiep: this.registerForm.value.ngheNghiep,
        noiO: this.registerForm.value.noiO,
        thoiGianDangKy: this.registerForm.value.thoi_gian,
        ketQua: 'Chưa hiến'
      }
      const tinh_nguyen_vien_data = {
        id: 0,
        hoTen: this.registerForm.value.hoTen,
        ngaySinh: this.registerForm.value.ngaySinh,
        cccd: this.registerForm.value.cccd,
        gioiTinh: this.registerForm.value.gioiTinh,
        soDienThoai: this.registerForm.value.dien_thoai,
        email: this.registerForm.value.email,
        maTinhThanh: this.selectedProvince,
        maQuanHuyen: this.selectedDistrict,
        maPhuongXa: this.selectedWard,
      }
      this.tinhNguyenVienService.createTinhNguyenVien(tinh_nguyen_vien_data).subscribe({
        next: (response) => {
          if (response.code === 200) {
            tt_hien_mau_data.CCCD = response.data.CCCD
            this.dsHienMauService.createTTHienMau(tt_hien_mau_data).subscribe({
              next: (response) => {
                if (response.code === 200) {
                  this.isReadOnlyAutoFill = false;
                  this.registerForm.reset();
                  alert('Gửi đăng ký thành công.');
                }
                if (response.code === 400) {
                  alert(response.message);
                }
              },
              error: (err) => {
                alert('Đăng ký không thành công, vui lòng thử lại.')
              }
            })
          }
          if (response.code === 400) {
            alert(response.message);
          }
        },
        error: (err) => {
          alert('Đăng ký không thành công, vui lòng thử lại.')
        }
      });
    } else {
      this.registerForm.markAllAsTouched();
    }
  }
}
