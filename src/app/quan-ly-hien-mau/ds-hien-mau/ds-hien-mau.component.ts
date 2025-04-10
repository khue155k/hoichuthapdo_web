import { Component, OnInit, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TTHienMau, TTHienMauService, DotHienMauService, DonViService, PaginatedResult, TemplateResult, TinhNguyenVienService } from '../../services/index.js';
import { Select2Module, Select2UpdateEvent } from 'ng-select2-component';
import { LocationService } from '../../services/location.service.js';
import 'jspdf-autotable';
import '../../Roboto-Regular-normal.js'
import { debounceTime } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  TableDirective,
}
  from '@coreui/angular';
@Component({
  selector: 'app-ds-hien-mau',
  standalone: true,
  imports:
    [
      CommonModule,
      ReactiveFormsModule,
      Select2Module,
      TableDirective,
      Select2Module,
    ],
  templateUrl: './ds-hien-mau.component.html',
  styleUrl: './ds-hien-mau.component.css'
})
export class TTHienMauComponent implements OnInit {
  constructor(private dsHienMauService: TTHienMauService,
    private locationService: LocationService,
    private tinhNguyenVienService: TinhNguyenVienService,
    private dotHienMauService: DotHienMauService,
    private donViService: DonViService,
    private fb: FormBuilder, private router: Router) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      status: [this.currentStatus],
      dot_hm_id: [0]
    });
    this.editForm = this.fb.group({
      cccd: ['', Validators.required],
      hoTen: ['', Validators.required],
      dien_thoai: ['', Validators.required],
      ngaySinh: ['', Validators.required],
      gioiTinh: ['', Validators.required],
      tinh_thanh: ['', Validators.required],
      quan_huyen: ['', Validators.required],
      phuong_xa: ['', Validators.required],
      email: ['', Validators.email],
      soLanHien: ['', Validators.required],
      noiO: ['', Validators.required],
      ngheNghiep: ['', Validators.required],
      don_vi: ['', Validators.required],
      thoi_gian: ['', Validators.required],
      don_vi_mau: ['', Validators.required],
      gioiTinh_text: [''],
      tinh_thanh_text: [''],
      quan_huyen_text: [''],
      phuong_xa_text: [''],
    });
  }

  ngOnInit(): void {
    this.loadDotHienMau();
    this.loadProvinces();
    this.loadTheTichMauHien();
  }

  searchForm: FormGroup;
  editForm: FormGroup;
  isReadOnlyAutoFill: boolean = false;
  isViewModalOpen: boolean = false;
  isEditModalOpen: boolean = false;
  isEdit: boolean = false;
  isAdd: boolean = false
  editTitle: string = 'Chỉnh sửa thông tin'
  addTitle: string = 'Đăng ký hiến máu'

  dotHienMauList: any[] = [];
  tenDotHM: string = '';
  dotHienMauStatus: string = '';
  ds_hien_mau: any[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  currentStatus: string = 'Chưa hiến';
  tnv_Selected: any = null;
  isAdmin: boolean = false;
  maDot: number = 0;

  selectedCoQuanID: number = 0
  donViList: any[] = [];
  provinces: any[] = [];
  districts: any[] = [];
  wards: any[] = [];

  selectedProvince: string = '';
  selectedDistrict: string = '';
  selectedWard: string = '';

  selectedProvinceName: string = '';
  selectedDistrictName: string = '';
  selectedWardName: string = '';

  theTichMauHienList: any[] = [];
  selectedTheTich: string = '';
  gioiTinh: string = '';

  selectAllValue = false;
  selectAllIndeterminate = false;
  @ViewChildren('checkbox') checkboxs!: QueryList<ElementRef>;
  selectedItemList: Set<number> = new Set<number>();

  gioiTinhOptions = [
    { value: 'Nam', label: 'Nam' },
    { value: 'Nữ', label: 'Nữ' }
  ];
  statusList: any[] = [
    { value: 'Từ chối', label: 'Từ chối' },
    { value: 'Chưa hiến', label: 'Chưa hiến' },
    { value: 'Đã hiến', label: 'Đã hiến' },
    { value: 'Nội dung tìm kiếm', label: 'Tất cả' },
  ];

  sl2_tinh_thanh: any[] = []
  sl2_quan_huyen: any[] = []
  sl2_phuong_xa: any[] = []

  update(key: string, event: Select2UpdateEvent<any>) {
    if (key === 'gioiTinh')
      this.gioiTinh = event.value;
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
  thoiGianBatDau_str: string = ''
  thoiGianKetThuc_str: string = ''
  thoiGianBatDau: any | null = null;
  thoiGianKetThuc: any | null = null;
  validateDate(): void {
    const thoiGianControl = this.editForm.controls['thoi_gian'];
    const thoiGianValue = thoiGianControl.value;

    if (thoiGianValue) {
      const ngayNhap = new Date(thoiGianValue);
      const ngayBd = new Date(this.thoiGianBatDau_str);
      const ngayKt = new Date(this.thoiGianKetThuc_str);

      if (ngayNhap < ngayBd || ngayNhap > ngayKt) {
        thoiGianControl.setErrors({ outOfRange: true });
      } else {
        thoiGianControl.setErrors(null);
      }
    }
  }

  getDotHienMauStatus(maDot: number): string {
    const now = new Date();
    const thoiGianBatDau = new Date(this.dotHienMauList.find(dot => dot.value === maDot).thoiGianBatDau)
    const thoiGianKetThuc = new Date(this.dotHienMauList.find(dot => dot.value === maDot).thoiGianKetThuc)

    if (thoiGianBatDau && now < thoiGianBatDau) {
      return 'Chưa diễn ra';
    }
    if (thoiGianBatDau && thoiGianKetThuc && now >= thoiGianBatDau && now <= thoiGianKetThuc) {
      return 'Đang diễn ra';
    }
    if (thoiGianKetThuc && now > thoiGianKetThuc) {
      return 'Đã kết thúc';
    }
    return '';
  }

  exportExcel() {
    if (this.searchForm.get('dot_hm_id')?.value === '0') {
      alert('Chưa chọn đợt hiến máu.');
      return;
    }

    const searchTerm = this.searchForm.get('searchTerm')?.value || 'Nội dung tìm kiếm';
    this.currentStatus = this.searchForm.get('status')?.value || 'Nội dung tìm kiếm';

    let ds_hien_mau: any[] = [];
    this.dsHienMauService.search(searchTerm, this.currentStatus.toString(), this.maDot, 1000, 1)
      .subscribe(
        (response: TemplateResult<PaginatedResult<TTHienMau>>) => {
          ds_hien_mau = response.data.items;

          const excelData = ds_hien_mau.map((tnv, index) => ({
            'STT': index + 1,
            'Họ và tên': tnv.hoTen,
            'Năm sinh': tnv.ngaySinh.substring(0, 4),
            'Đơn vị': tnv.tenDV,
            'Thể tích máu hiến (ml)': tnv.theTich,
            'Số lần đã hiến': tnv.soLanHien,
          }));

          const tong_theTich_mau = ds_hien_mau.reduce((total, tnv) => {
            const theTichValue = parseInt(tnv.theTich, 10);
            return total + (isNaN(theTichValue) ? 0 : theTichValue);
          }, 0);

          excelData.push({
            'STT': 0,
            'Họ và tên': 'Tổng cộng',
            'Năm sinh': '',
            'Đơn vị': '',
            'Thể tích máu hiến (ml)': tong_theTich_mau,
            'Số lần đã hiến': '',
          });

          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Hiến Máu');

          const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
          saveAs(data, 'DanhSachHienMau.xlsx');
        },
        (error: HttpErrorResponse) => {
          console.error('Lỗi khi tải danh sách tình nguyện viên tham gia hiến máu:', error);
        }
      );
  }

  onProvinceChange() {
    this.selectedProvinceName = this.sl2_tinh_thanh.find(t => t.value == this.selectedProvince).label;
    this.editForm.controls['quan_huyen'].markAsUntouched();
    this.editForm.controls['phuong_xa'].markAsUntouched();
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
    this.editForm.controls['phuong_xa'].markAsUntouched();
    this.locationService.getWards(this.selectedDistrict).subscribe(data => {
      this.wards = data;
      this.selectedWard = '';
      this.sl2_phuong_xa = this.getSelect2DataWard();
    });
  }
  onWardChange() {
    this.selectedWardName = this.sl2_phuong_xa.find(p => p.value == this.selectedWard).label;
  }

  loadTheTichMauHien() {
    this.dotHienMauService.getTheTichMauHien().subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.theTichMauHienList = response.data;
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải thể tích máu hiến:', err);
      },
    });
  }

  loadDonVis(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.donViService.getDonVis().subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.donViList = response.data.map((donVi: any) => ({
              value: donVi.maDV,
              label: donVi.tenDV,
            }));
          }
          resolve();
        },
        error: (err) => {
          console.error('Lỗi khi lấy danh sách đơn vị:', err);
          reject(err);
        }
      });
    });

  }

  loadDotHienMau(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dotHienMauService.getAllDotHienMau().subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.dotHienMauList = response.data.map((dotHM: any) => ({
              value: dotHM.maDot,
              label: dotHM.tenDot,
              diaDiem: dotHM.diaDiem,
              thoiGianBatDau: dotHM.thoiGianBatDau,
              thoiGianKetThuc: dotHM.thoiGianKetThuc
            }));

            if (this.dotHienMauList.length > 0) {
              const lastDotHienMau = this.dotHienMauList[this.dotHienMauList.length - 1];
              this.maDot = lastDotHienMau.value;
              this.searchForm.get('dot_hm_id')?.setValue(this.maDot);
            }
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
  updateDotHM(event: Select2UpdateEvent<any>) {
    this.maDot = event.value;
    this.tenDotHM = this.dotHienMauList.find(dot => dot.value === this.maDot).label;
    console.log(this.dotHienMauList.find(dot => dot.value === this.maDot));
    this.dotHienMauStatus = this.getDotHienMauStatus(this.maDot);
    this.searchTTHienMauForm();
  }

  updateCurrentStatus(event: Select2UpdateEvent<any>) {
    this.currentStatus = event.value;
    this.searchTTHienMauForm();
  }

  autoFill() {
    if (this.isEdit) return;
    if (this.editForm.get('cccd')?.value != '') {
      this.tinhNguyenVienService.getTinhNguyenVienByCCCD(this.editForm.get('cccd')?.value).subscribe({
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
                  this.editForm.patchValue({
                    cccd: response.data.cccd,
                    hoTen: response.data.hoTen,
                    dien_thoai: response.data.soDienThoai,
                    ngaySinh: response.data.ngaySinh.substring(0, 10),
                    gioiTinh: response.data.gioiTinh,
                    email: response.data.email,
                    soLanHien: response.data.soLanHien
                  });
                }, 100)
              }, 100);
            }, 100);
          }
          if (response.code === 404) {
            this.selectedProvince = '';
            this.selectedDistrict = '';
            this.selectedWard = '';
            this.editForm.patchValue({
              hoTen: '',
              dien_thoai: '',
              ngaySinh: '',
              gioiTinh: '',
              email: '',
              soLanHien: ''
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
  onSelectAllChange() {
    this.selectAllIndeterminate = false;
    if (this.selectAllValue == false) {
      this.selectedItemList.clear();
      this.checkboxs.toArray().forEach((checkbox) => {
        checkbox.nativeElement.checked = false;
      });
    } else {
      this.ds_hien_mau.forEach((t) => this.selectedItemList.add(t.maTT));

      this.checkboxs.toArray().forEach((checkbox) => {
        checkbox.nativeElement.checked = true;
      });
    }
  }

  updateSelectItem(id: number, event: any) {
    if (event.target.checked) {
      this.selectedItemList.add(id);
    } else {
      this.selectedItemList.delete(id);
    }

    if (this.selectedItemList.size == 0) {
      this.selectAllValue = false;
      this.selectAllIndeterminate = false;
    }
    else if (this.selectedItemList.size < this.ds_hien_mau.length) {
      this.selectAllValue = false;
      this.selectAllIndeterminate = true;
    } else {
      this.selectAllValue = true;
      this.selectAllIndeterminate = false;
    }
  }

  DangKyOpen() {
    const maDot = this.searchForm.get('dot_hm_id')?.value || 0;
    if (maDot != 0) {
      this.isAdd = true;
      this.loadDonVis();
      this.isEditModalOpen = true;
    }
    else {
      alert('Phải chọn đợt hiến máu trước khi đăng ký!')
    }
  }
  DangKy() {
    if (this.editForm.valid) {
      const tt_hien_mau_data = {
        id: 0,
        maDot: this.maDot,
        cccd: '',
        maTheTich: Number(this.selectedTheTich),
        maDV: this.selectedCoQuanID,
        ngheNghiep: this.editForm.value.ngheNghiep,
        noiO: this.editForm.value.noiO,
        thoiGianDangKy: this.editForm.value.thoi_gian,
        ketQua: 'Chưa hiến'
      }

      const tinh_nguyen_vien_data = {
        id: 0,
        hoTen: this.editForm.value.hoTen,
        ngaySinh: this.editForm.value.ngaySinh,
        cccd: this.editForm.value.cccd,
        gioiTinh: this.editForm.value.gioiTinh,
        soDienThoai: this.editForm.value.dien_thoai,
        email: this.editForm.value.email,
        maTinhThanh: this.selectedProvince,
        maQuanHuyen: this.selectedDistrict,
        maPhuongXa: this.selectedWard,
        soLanHien: this.editForm.value.soLanHien
      }
      this.tinhNguyenVienService.createTinhNguyenVien(tinh_nguyen_vien_data).subscribe({
        next: (response) => {
          if (response.code === 200) {
            tt_hien_mau_data.cccd = response.data.id
            this.dsHienMauService.createTTHienMau(tt_hien_mau_data).subscribe({
              next: (response) => {
                if (response.code === 200) {
                  this.isReadOnlyAutoFill = false;
                  this.isEditModalOpen=false;
                  this.editForm.reset();
                  this.searchTTHienMau();
                  alert('Gửi đăng ký thành công.');
                }
                if (response.code === 400) {
                  alert(response.message);
                }
              },
              error: (err) => {
                alert("Có lỗi xảy ra. Vui lòng thử lại sau")
              }
            })
          }
          if (response.code === 400) {
            alert(response.message);
          }
        },
        error: (err) => {
          alert("Có lỗi xảy ra. Vui lòng thử lại sau")   
        }
      });
    } else {
      this.editForm.markAllAsTouched();
    }
  }
  OpenViewModal(ttHM: any) {
    this.tnv_Selected = ttHM;
    this.isViewModalOpen = true;
  }

  OpenEditModal(ttHM: any) {
    console.log(ttHM);
    this.tnv_Selected = ttHM;
    this.isEdit = true;
    this.loadDonVis().then(() => {
      this.isEditModalOpen = true;
      this.editForm.patchValue({
        cccd: this.tnv_Selected.cccd,
        hoTen: this.tnv_Selected.hoTen,
        dien_thoai: this.tnv_Selected.soDienThoai,
        ngaySinh: this.tnv_Selected.ngaySinh.substring(0, 10),
        gioiTinh: this.tnv_Selected.gioiTinh,
        email: this.tnv_Selected.email,
        soLanHien: this.tnv_Selected.soLanHien,
        noiO: this.tnv_Selected.noiO,
        ngheNghiep: this.tnv_Selected.ngheNghiep,
        thoi_gian: this.tnv_Selected.thoiGianDangKy,
      });
    })
    this.gioiTinh = this.tnv_Selected.gioiTinh;
    this.selectedProvince = this.tnv_Selected.maTinhThanh;
    setTimeout(() => {
      this.selectedDistrict = this.tnv_Selected.maQuanHuyen
      setTimeout(() => {
        this.selectedWard = this.tnv_Selected.maPhuongXa
      }, 100);
    }, 100);
    this.selectedCoQuanID = this.tnv_Selected.maDV
    this.selectedTheTich = this.tnv_Selected.maTheTich
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

  closeViewModal() {
    this.isViewModalOpen = false;
  }
  closeEditModal() {
    this.isEdit = false
    this.isAdd = false
    this.isEditModalOpen = false;
    this.selectedCoQuanID = 0;
    this.selectedTheTich = '';
    this.gioiTinh = '';
    this.isReadOnlyAutoFill = false;
    this.editForm.reset();
  }

  capNhatKetQua(ketQuaMoi: string, ttHM: any) {
    this.tnv_Selected = ttHM;
    const confirmUpdate = window.confirm('Xác nhận cập nhật trạng thái cho ' + this.tnv_Selected.hoTen + ' thành ' + ketQuaMoi + '?');
    if (confirmUpdate) {
      this.dsHienMauService.updateStatus(this.tnv_Selected.maTT, ketQuaMoi).subscribe({
        next: (response) => {
          if (response.code === 200) {
            if (this.ds_hien_mau.length == 1 && this.currentPage > 1) this.currentPage--;
            this.searchTTHienMau();
            alert('Cập nhật trạng thái thành công!');
          }
          if (response.code === 404 || response.code === 400) {
            alert(response.message);
          }
        },
        error: (err) => {
          alert('Có lỗi xảy ra khi cập nhật thông tin.');
          console.error('Lỗi khi cập nhật:', err);
        },
      });
    }
  }

  capNhatKetQuaAll(ketQuaMoi: string) {
    const confirmUpdate = window.confirm('Xác nhận cập nhật trạng thái cho các dòng đã chọn thành ' + ketQuaMoi + '?');
    if (confirmUpdate) {
      this.dsHienMauService.updateListStatus(ketQuaMoi, this.selectedItemList).subscribe({
        next: (response) => {
          if (response.code === 200) {
            if (this.ds_hien_mau.length == this.selectedItemList.size && this.currentPage > 1) this.currentPage--;
            this.searchTTHienMau();
            alert('Cập nhật trạng thái thành công!');
          }
          if (response.code === 404 || response.code === 400) {
            alert(response.message);
          }
        },
        error: (err) => {
          alert('Có lỗi xảy ra khi cập nhật thông tin.');
          console.error('Lỗi khi cập nhật:', err);
        },
      });
    }
  }

  saveChanges() {
    this.isReadOnlyAutoFill = false;
    if (this.isAdd) {
      this.DangKy()
    }
    else {
      if (this.editForm.valid) {
        const updatedData = {
          maDot: this.maDot,
          cccd: this.editForm.value.cccd,
          hoTen: this.editForm.value.hoTen,
          soDienThoai: this.editForm.value.dien_thoai,
          ngaySinh: this.editForm.value.ngaySinh,
          gioiTinh: this.editForm.value.gioiTinh,
          maTinhThanh: this.selectedProvince,
          maQuanHuyen: this.selectedDistrict,
          maPhuongXa: this.selectedWard,
          email: this.editForm.value.email,
          soLanHien: this.editForm.value.soLanHien,
          noiO: this.editForm.value.noiO,
          ngheNghiep: this.editForm.value.ngheNghiep,
          maDV: Number(this.selectedCoQuanID),
          thoiGianDangKy: this.editForm.value.thoi_gian,
          maTheTich: this.selectedTheTich,
        };
        this.dsHienMauService.updateTTHienMau(this.tnv_Selected.maTT, updatedData).subscribe({
          next: (response) => {
            if (response.code == 200) {
              this.selectedCoQuanID = 0;
              this.selectedTheTich = '';
              this.editForm.reset();
              this.viewDetails(this.tnv_Selected.maTT, false)
              this.isEdit = false
              this.isEditModalOpen = false;
              this.searchTTHienMau();
              alert(response.message);
            }
            if (response.code === 404 || response.code === 400) {
              alert(response.message);
            }
          },
          error: (err) => {
            alert('Có lỗi xảy ra khi cập nhật thông tin.');
          },
        });
      }
      else {
        this.editForm.markAllAsTouched();
      }
    }
  }

  getPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  searchTTHienMau(): void {
    console.log("tim kiem")
    this.selectedItemList.clear();
    this.selectAllValue = false;
    this.selectAllIndeterminate = false;

    const searchTerm = this.searchForm.get('searchTerm')?.value || 'Nội dung tìm kiếm';
    this.currentStatus = this.searchForm.get('status')?.value || 'Nội dung tìm kiếm';

    this.dsHienMauService.search(searchTerm, this.currentStatus.toString(), this.maDot, this.pageSize, this.currentPage)
      .subscribe({
        next: (response: TemplateResult<PaginatedResult<TTHienMau>>) => {
          this.ds_hien_mau = response.data.items;
          this.totalCount = response.data.totalCount;
        },
        error: (error: HttpErrorResponse) => {
          console.error('Error fetching data:', error);
        }
      });
  }

  searchTTHienMauForm(): void {
    this.currentPage = 1;
    this.searchTTHienMau();
  }
  searchTTHienMauFormDelay() {
    debounceTime(400);
    this.searchTTHienMauForm()
  }

  viewDetails(id: number, unReload: boolean): void {
    if ((this.tnv_Selected && this.tnv_Selected.ttHM == id) && unReload) return;

    this.dsHienMauService.getTTHienMauById(id).subscribe(
      (response) => {
        if (response.code === 200) {
          this.tnv_Selected = response.data;
        }
        if (response.code === 400 || response.code === 404) {
          alert(response.message);
        }
      },
      (error: HttpErrorResponse) => {
        console.error('Lỗi khi lấy chi tiết người hiến máu:', error);
      }
    );
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.searchTTHienMau();
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.totalCount) {
      this.currentPage++;
      this.searchTTHienMau();
    }
  }
  onCoQuanChange() {
  }

  prePage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.searchTTHienMau();
    }
  }

  onApprove() {
    if (this.isAdmin) {
    }
  }

  onReject() {
    if (this.isAdmin) {
    }
  }

  onCancelApproval() {
    if (this.isAdmin) {
    }
  }
  private updateStatus(status: number) {

  }
  getLimitedPageNumbers(): number[] {
    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

    const maxVisiblePages = 5;
    const halfVisible = Math.floor(maxVisiblePages / 2);

    if (totalPages <= maxVisiblePages) {
      return pageNumbers;
    }

    let start = Math.max(1, this.currentPage - halfVisible);
    let end = Math.min(totalPages, this.currentPage + halfVisible);

    if (start === 1) {
      end = Math.min(maxVisiblePages, totalPages);
    } else if (end === totalPages) {
      start = Math.max(1, totalPages - maxVisiblePages + 1);
    }

    return pageNumbers.slice(start - 1, end);
  }
}
