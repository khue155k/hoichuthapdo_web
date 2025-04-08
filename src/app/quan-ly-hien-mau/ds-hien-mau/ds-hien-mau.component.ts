import { Component, OnInit, ViewChildren, ElementRef, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { TTHienMau, DsHienMauService, DotHienMauService, PaginatedResult, TemplateResult, TinhNguyenVienService } from '../../services/index.js';
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
export class DsHienMauComponent implements OnInit {
  constructor(private dsHienMauService: DsHienMauService,
    private locationService: LocationService,
    private tinhNguyenVienService: TinhNguyenVienService,
    private dotHienMauService: DotHienMauService,
    private fb: FormBuilder, private router: Router) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      status: [this.currentStatus],
      dot_hm_id: [0]
    });
    this.editForm = this.fb.group({
      cccd: ['', Validators.required],
      ho_ten: ['', Validators.required],
      dien_thoai: ['', Validators.required],
      ngay_sinh: ['', Validators.required],
      gioi_tinh: ['', Validators.required],
      tinh_thanh: ['', Validators.required],
      quan_huyen: ['', Validators.required],
      phuong_xa: ['', Validators.required],
      email: [''],
      so_lan: ['', Validators.required],
      noi_o: ['', Validators.required],
      nghe_nghiep: ['', Validators.required],
      co_quan: ['', Validators.required],
      thoi_gian: ['', Validators.required],
      don_vi_mau: ['', Validators.required],
      gioi_tinh_text: [''],
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
  dot_hien_mau: any = null;
  dotHienMauStatus: string = '';
  ds_hien_mau: any[] = [];
  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  currentStatus: string = 'Chưa hiến';
  tnv_Selected: any = null;
  isAdmin: boolean = false;
  dot_hien_mau_id: number = 0;

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
  gioi_tinh: string = '';

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
    if (key === 'gioi_tinh')
      this.gioi_tinh = event.value;
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
  ngay_bd_str: string = ''
  ngay_kt_str: string = ''
  ngay_bd: any | null = null;
  ngay_kt: any | null = null;
  validateDate(): void {
    const thoiGianControl = this.editForm.controls['thoi_gian'];
    const thoiGianValue = thoiGianControl.value;

    if (thoiGianValue) {
      const ngayNhap = new Date(thoiGianValue);
      const ngayBd = new Date(this.ngay_bd_str);
      const ngayKt = new Date(this.ngay_kt_str);

      if (ngayNhap < ngayBd || ngayNhap > ngayKt) {
        thoiGianControl.setErrors({ outOfRange: true });
      } else {
        thoiGianControl.setErrors(null);
      }
    }
  }

  getDotHienMauStatus(): string {
    const now = new Date();
    const ngay_bd = new Date(this.dot_hien_mau.ngayBd)
    const ngay_kt = new Date(this.dot_hien_mau.ngayKt)

    if (ngay_bd && now < ngay_bd) {
      return 'Chưa diễn ra';
    }
    if (ngay_bd && ngay_kt && now >= ngay_bd && now <= ngay_kt) {
      return 'Đang diễn ra';
    }
    if (this.dot_hien_mau.ngayKt && now > ngay_kt) {
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
    this.dsHienMauService.search(searchTerm, this.currentStatus.toString(), this.dot_hien_mau_id, 1000, 1)
      .subscribe(
        (response: TemplateResult<PaginatedResult<TTHienMau>>) => {
          ds_hien_mau = response.data.items;

          const excelData = ds_hien_mau.map((tnv, index) => ({
            'STT': index + 1,
            'Họ và tên': tnv.ho_ten,
            'Năm sinh': tnv.ngay_sinh.substring(0, 4),
            'Đơn vị': tnv.ten_don_vi,
            'Thể tích máu hiến (ml)': tnv.the_tich,
            'Số lần đã hiến': tnv.so_lan,
          }));

          const tong_the_tich_mau = ds_hien_mau.reduce((total, tnv) => {
            const theTichValue = parseInt(tnv.the_tich, 10);
            return total + (isNaN(theTichValue) ? 0 : theTichValue);
          }, 0);

          excelData.push({
            'STT': 0,
            'Họ và tên': 'Tổng cộng',
            'Năm sinh': '',
            'Đơn vị': '',
            'Thể tích máu hiến (ml)': tong_the_tich_mau,
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
        if (response.code === 200)
          this.theTichMauHienList = response.data;
      },
      error: (err) => {
        console.error('Lỗi khi load thể tích máu hiến:', err);
      },
    });
  }
  loadDonVisByDotHienMau(): Promise<void> {
    return new Promise((resolve, reject) => {
      var id = 0;
      if (this.isEdit) {
        id = Number(this.tnv_Selected.dot_hien_mau_id)
      }
      else if (this.isAdd) {
        id = Number(this.dot_hien_mau.value);
      }
      this.dotHienMauService.getDonVisByDotHienMauId(id).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.donViList = response.data;
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
              ngayBd: dotHM.thoiGianBatDau,
              ngayKt: dotHM.thoiGianKetThuc
            }));

            if (this.dotHienMauList.length > 0) {
              const lastDotHienMau = this.dotHienMauList[this.dotHienMauList.length - 1];
              this.dot_hien_mau_id = lastDotHienMau.value;
              this.searchForm.get('dot_hm_id')?.setValue(this.dot_hien_mau_id);
              this.dot_hien_mau = lastDotHienMau
              this.dotHienMauStatus = this.getDotHienMauStatus();
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
    this.dot_hien_mau_id = event.value;
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
            this.selectedProvince = response.data.tinh_thanh_code;
            this.gioi_tinh = response.data.gioi_tinh;

            setTimeout(() => {
              this.selectedDistrict = response.data.quan_huyen_code;
              setTimeout(() => {
                this.selectedWard = response.data.phuong_xa_code;
                setTimeout(() => {
                  this.editForm.patchValue({
                    cccd: response.data.cccd,
                    ho_ten: response.data.ho_ten,
                    dien_thoai: response.data.sdt,
                    ngay_sinh: response.data.ngay_sinh.substring(0, 10),
                    gioi_tinh: response.data.gioi_tinh,
                    email: response.data.email,
                    so_lan: response.data.so_lan
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
              ho_ten: '',
              dien_thoai: '',
              ngay_sinh: '',
              gioi_tinh: '',
              email: '',
              so_lan: ''
            });
            this.isReadOnlyAutoFill = false;
          }
          if (response.code === 400) {
            alert(response.message);
          }
        },
        error: (err) => {
          console.log(err);
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
      this.ds_hien_mau.forEach((t) => this.selectedItemList.add(t.id));

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
    const dot_hien_mau_id = this.searchForm.get('dot_hm_id')?.value || 0;
    if (dot_hien_mau_id != 0) {
      this.isAdd = true;
      this.loadDonVisByDotHienMau();
      this.isEditModalOpen = true;
    }
    else {
      alert('Phải chọn đợt hiến máu trước khi đăng ký!')
    }
  }
  DangKy() {
    if (this.editForm.valid) {
      const ds_hien_mau_data = {
        id: 0,
        dot_hien_mau_id: this.dot_hien_mau_id,
        tnv_id: 0,
        the_tich_id: Number(this.selectedTheTich),
        co_quan_id: this.selectedCoQuanID,
        nghe_nghiep: this.editForm.value.nghe_nghiep,
        noi_o: this.editForm.value.noi_o,
        ngay_dang_ky: this.editForm.value.thoi_gian,
        ket_qua: 'Chưa hiến'
      }

      // Thêm kiểm tra cccd đã có thì load thông tin ra
      const tinh_nguyen_vien_data = {
        id: 0,
        ho_ten: this.editForm.value.ho_ten,
        ngay_sinh: this.editForm.value.ngay_sinh,
        cccd: this.editForm.value.cccd,
        gioi_tinh: this.editForm.value.gioi_tinh,
        sdt: this.editForm.value.dien_thoai,
        email: this.editForm.value.email,
        tinh_thanh_code: this.selectedProvince,
        quan_huyen_code: this.selectedDistrict,
        phuong_xa_code: this.selectedWard,
        so_lan: this.editForm.value.so_lan,
        khen_thuong: ''
      }
      this.tinhNguyenVienService.createTinhNguyenVien(tinh_nguyen_vien_data).subscribe({
        next: (response) => {
          if (response.code === 200) {
            ds_hien_mau_data.tnv_id = response.data.id
            this.dsHienMauService.createTTHienMau(ds_hien_mau_data).subscribe({
              next: (response) => {
                if (response.code === 200) {
                  alert('Gửi đăng ký thành công.');
                }
                if (response.code === 400) {
                  alert(response.message);
                }
              },
              error: (err) => {
                console.log(err);
                alert('Đăng ký không thành công, vui lòng thử lại.')
              }
            })
          }
          if (response.code === 400) {
            alert(response.message);
          }
        },
        error: (err) => {
          console.log(err);
          alert('Đăng ký không thành công, vui lòng thử lại.')
        }
      });
    } else {
      this.editForm.markAllAsTouched();
    }
  }
  OpenViewModal(ttHM: any) {
    this.tnv_Selected = ttHM;
    console.log(this.tnv_Selected);
    this.isViewModalOpen = true;
  }

  OpenEditModal(ttHM: any) {
    this.tnv_Selected = ttHM;
    this.isEdit = true;
    this.loadDonVisByDotHienMau().then(() => {
      this.isEditModalOpen = true;
      this.editForm.patchValue({
        cccd: this.tnv_Selected.cccd,
        ho_ten: this.tnv_Selected.ho_ten,
        dien_thoai: this.tnv_Selected.sdt,
        ngay_sinh: this.tnv_Selected.ngay_sinh.substring(0, 10),
        gioi_tinh: this.tnv_Selected.gioi_tinh,
        email: this.tnv_Selected.email,
        so_lan: this.tnv_Selected.so_lan,
        noi_o: this.tnv_Selected.cho_o,
        nghe_nghiep: this.tnv_Selected.nghe_nghiep,
        thoi_gian: this.tnv_Selected.ngay_dang_ky,
      });
    })
    this.gioi_tinh = this.tnv_Selected.gioi_tinh;
    this.selectedProvince = this.tnv_Selected.tinh_thanh_code;
    setTimeout(() => {
      this.selectedDistrict = this.tnv_Selected.quan_huyen_code
      setTimeout(() => {
        this.selectedWard = this.tnv_Selected.phuong_xa_code
      }, 100);
    }, 100);
    this.selectedCoQuanID = this.tnv_Selected.co_quan_id
    this.selectedTheTich = this.tnv_Selected.the_tich_mau_id
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

  closeViewModal(){
    this.isViewModalOpen = false;
  }
  closeEditModal() {
    this.isEdit = false
    this.isAdd = false
    this.isEditModalOpen = false;
    this.selectedCoQuanID = 0;
    this.selectedTheTich = '';
    this.gioi_tinh = '';
    this.isReadOnlyAutoFill = false;
    this.editForm.reset();
  }

  capNhatKetQua(ketQuaMoi: string, ttHM: any) {
    this.tnv_Selected = ttHM;
    const confirmUpdate = window.confirm('Xác nhận cập nhật trạng thái cho ' + this.tnv_Selected.ho_ten + ' thành ' + ketQuaMoi + '?');
    if (confirmUpdate) {
      this.dsHienMauService.updateStatus(this.tnv_Selected.id, ketQuaMoi).subscribe({
        next: (response) => {
          console.log(response);
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
    console.log(this.selectedItemList);
    const confirmUpdate = window.confirm('Xác nhận cập nhật trạng thái cho các dòng đã chọn thành ' + ketQuaMoi + '?');
    if (confirmUpdate) {
      this.dsHienMauService.updateListStatus(ketQuaMoi, this.selectedItemList).subscribe({
        next: (response) => {
          console.log(response);
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
          dot_hien_mau_id: this.dot_hien_mau_id,

          cccd: this.editForm.value.cccd,
          ho_ten: this.editForm.value.ho_ten,
          sdt: this.editForm.value.dien_thoai,
          ngay_sinh: this.editForm.value.ngay_sinh,
          gioi_tinh: this.editForm.value.gioi_tinh,
          tinh_thanh_code: this.selectedProvince,
          quan_huyen_code: this.selectedDistrict,
          phuong_xa_code: this.selectedWard,
          email: this.editForm.value.email,
          so_lan: this.editForm.value.so_lan,
          noi_o: this.editForm.value.noi_o,
          nghe_nghiep: this.editForm.value.nghe_nghiep,
          co_quan_id: Number(this.selectedCoQuanID),
          ngay_dang_ky: this.editForm.value.thoi_gian,
          the_tich_mau_id: this.selectedTheTich,
        };
        this.dsHienMauService.updateTTHienMau(this.tnv_Selected.id, updatedData).subscribe({
          next: (response) => {
            if (response.code == 200) {
              this.isEditModalOpen = false;
              this.selectedCoQuanID = 0;
              this.selectedTheTich = '';
              this.editForm.reset();
              this.viewDetails(this.tnv_Selected.id, false)
              this.isEdit = false
              this.searchTTHienMau();
              alert('Cập nhật thông tin thành công!')
              console.log(updatedData);
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
    this.selectedItemList.clear();
    this.selectAllValue = false;
    this.selectAllIndeterminate = false;

    const searchTerm = this.searchForm.get('searchTerm')?.value || 'Nội dung tìm kiếm';
    this.currentStatus = this.searchForm.get('status')?.value || 'Nội dung tìm kiếm';

    this.dsHienMauService.search(searchTerm, this.currentStatus.toString(), this.dot_hien_mau_id, this.pageSize, this.currentPage)
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
    if ((this.tnv_Selected && this.tnv_Selected.id == id) && unReload) return;

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
