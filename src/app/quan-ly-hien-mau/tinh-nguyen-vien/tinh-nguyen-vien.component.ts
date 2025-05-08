import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TableDirective,
}
  from '@coreui/angular';

import { Select2Module, Select2UpdateEvent } from 'ng-select2-component';
import { debounceTime } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { TinhNguyenVienService, TemplateResult, PaginatedResult, LocationService } from '../../services';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-tinh-nguyen-vien',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Select2Module,
    TableDirective,
    Select2Module,
  ],
  templateUrl: './tinh-nguyen-vien.component.html',
  styleUrl: './tinh-nguyen-vien.component.css'
})
export class TinhNguyenVienComponent implements OnInit {
  constructor(private fb: FormBuilder,
    private tinhNguyenVienService: TinhNguyenVienService,
    private locationService: LocationService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
    });
    this.tinhNguyenVienForm = this.fb.group({
      cccd: ['', Validators.required],
      hoTen: ['', Validators.required],
      ngaySinh: ['', Validators.required],
      gioiTinh: ['', Validators.required],
      soDienThoai: ['', Validators.required],
      email: ['', Validators.required],
      maTinhThanh: ['', Validators.required],
      maQuanHuyen: ['', Validators.required],
      maPhuongXa: ['', Validators.required],
      soLanHien: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadProvinces();
    this.loadTinhNguyenVien();
  }

  searchForm: FormGroup;
  tinhNguyenVienForm: FormGroup;

  tinhNguyenVienList: any[] = [];
  TNVSelected: any = null;

  provinces: any[] = [];
  districts: any[] = [];
  wards: any[] = [];
  selectedProvince: string = '';
  selectedDistrict: string = '';
  selectedWard: string = '';

  selectedProvinceName: string = '';
  selectedDistrictName: string = '';
  selectedWardName: string = '';

  gioiTinhOptions = [
    { value: 'Nam', label: 'Nam' },
    { value: 'Nữ', label: 'Nữ' }
  ];
  gioiTinh: string = '';

  sl2_tinhThanh: any[] = []
  sl2_quanHuyen: any[] = []
  sl2_phuongXa: any[] = []

  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;

  isEditModalOpen: boolean = false;
  isEdit: boolean = false;
  isAdd: boolean = false
  editTitle: string = 'Chỉnh sửa thông tin'
  addTitle: string = 'Tạo tình nguyện viên'

  async loadTinhNguyenVien() {
    try {
      const response = await firstValueFrom(
        this.tinhNguyenVienService.getAllTinhNguyenVienPaginated(this.pageSize, this.currentPage, false)
      );

      if (response.code === 200) {
        this.totalCount = response.data.totalCount;
        const items = response.data.items;

        const promises = items.map(async (TNV: any) => {
          const [tinh, huyen, xa] = await Promise.all([
            firstValueFrom(this.locationService.getProvince(TNV.maTinhThanh)),
            firstValueFrom(this.locationService.getDistrict(TNV.maQuanHuyen)),
            firstValueFrom(this.locationService.getWard(TNV.maPhuongXa)),
          ]);
          return {
            ...TNV,
            tinhThanh: tinh?.name,
            quanHuyen: huyen?.name,
            phuongXa: xa?.name
          };
        });

        this.tinhNguyenVienList = await Promise.all(promises);
      }

      if (response.code === 404 || response.code === 400) {
        console.error(response.message);
      }
    } catch (error) {
      console.error('Lỗi khi tải tình nguyện viên:', error);
    }
  }

  async searchTinhNguyenVien() {
    const searchTerm = this.searchForm.get('searchTerm')?.value || 'Nội dung tìm kiếm';

    try {
      const response: TemplateResult<PaginatedResult<any>> = await firstValueFrom(
        this.tinhNguyenVienService.search(searchTerm, this.pageSize, this.currentPage, false)
      );
      if (response.code === 200) {
        this.totalCount = response.data.totalCount;
        const items = response.data.items;

        const promises = items.map(async (TNV: any) => {
          const [tinh, huyen, xa] = await Promise.all([
            firstValueFrom(this.locationService.getProvince(TNV.maTinhThanh)),
            firstValueFrom(this.locationService.getDistrict(TNV.maQuanHuyen)),
            firstValueFrom(this.locationService.getWard(TNV.maPhuongXa)),
          ]);

          return {
            ...TNV,
            tinhThanh: tinh?.name,
            quanHuyen: huyen?.name,
            phuongXa: xa?.name
          };
        });

        this.tinhNguyenVienList = await Promise.all(promises);
      }
      if (response.code === 404 || response.code === 400) {
        console.error(response.message);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  searchTinhNguyenVienForm(): void {
    this.currentPage = 1;
    this.searchTinhNguyenVien();
  }

  searchTinhNguyenVienFormDelay() {
    debounceTime(400);
    this.searchTinhNguyenVienForm();
  }

  async exportExcel() {
    let tinhNguyenVien: any[] = [];
    const searchTerm = this.searchForm.get('searchTerm')?.value || 'Nội dung tìm kiếm';

    try {
      const response: TemplateResult<PaginatedResult<any>> = await firstValueFrom(
        this.tinhNguyenVienService.search(searchTerm, 1000, 1, false)
      );
      if (response.code === 200) {
        this.totalCount = response.data.totalCount;
        const items = response.data.items;

        const promises = items.map(async (TNV: any) => {
          const [tinh, huyen, xa] = await Promise.all([
            firstValueFrom(this.locationService.getProvince(TNV.maTinhThanh)),
            firstValueFrom(this.locationService.getDistrict(TNV.maQuanHuyen)),
            firstValueFrom(this.locationService.getWard(TNV.maPhuongXa)),
          ]);

          return {
            ...TNV,
            tinhThanh: tinh?.name,
            quanHuyen: huyen?.name,
            phuongXa: xa?.name
          };
        });

        tinhNguyenVien = await Promise.all(promises);
      }
      if (response.code === 404 || response.code === 400) {
        console.error(response.message);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }

    const excelData = tinhNguyenVien.map((tinhNguyenVien, index) => ({
      'STT': index + 1,
      'CCCD': tinhNguyenVien.cccd,
      'Họ tên': tinhNguyenVien.hoTen,
      'Ngày sinh': tinhNguyenVien.ngaySinh,
      'Giới tính': tinhNguyenVien.gioiTinh,
      'Số điện thoại': tinhNguyenVien.soDienThoai,
      'Email': tinhNguyenVien.email,
      'Địa chỉ thường trú': tinhNguyenVien.tinhThanh + ", " + tinhNguyenVien.quanHuyen + ", " + tinhNguyenVien.phuongXa,
      'Số lần hiến': tinhNguyenVien.soLanHien
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Tình Nguyện Viên');

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'DanhSachTinhNguyenVien.xlsx');
  }

  update(key: string, event: Select2UpdateEvent<any>) {
    if (key === 'gioiTinh')
      this.gioiTinh = event.value;
    else if (key === 'maTinhThanh') {
      this.sl2_quanHuyen = []
      this.sl2_phuongXa = []
      if (this.selectedProvince != '')
        this.onProvinceChange();
    }
    else if (key === 'maQuanHuyen') {
      this.sl2_phuongXa = []
      if (this.selectedDistrict != '')
        this.onDistrictChange()
    }
    else if (key === 'maPhuongXa') {
      if (this.selectedWard != '')
        this.onWardChange()
    }
  }
  loadProvinces() {
    this.locationService.getProvinces().subscribe(data => {
      this.provinces = data;
      this.sl2_tinhThanh = this.getSelect2DataProvince();
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
    this.selectedProvinceName = this.sl2_tinhThanh.find(t => t.value == this.selectedProvince).label;
    this.tinhNguyenVienForm.controls['maQuanHuyen'].markAsUntouched();
    this.tinhNguyenVienForm.controls['maPhuongXa'].markAsUntouched();
    this.locationService.getDistricts(this.selectedProvince).subscribe(data => {
      this.districts = data;
      console.log(data);
      this.wards = [];
      this.selectedDistrict = '';
      this.selectedWard = '';
      this.sl2_quanHuyen = this.getSelect2DataDistrict();
    });
  }

  onDistrictChange() {
    this.selectedDistrictName = this.sl2_quanHuyen.find(q => q.value == this.selectedDistrict).label;
    this.tinhNguyenVienForm.controls['maPhuongXa'].markAsUntouched();
    this.locationService.getWards(this.selectedDistrict).subscribe(data => {
      this.wards = data;
      this.selectedWard = '';
      this.sl2_phuongXa = this.getSelect2DataWard();
    });
  }
  onWardChange() {
    this.selectedWardName = this.sl2_phuongXa.find(p => p.value == this.selectedWard).label;
  }

  OpenCreateModal() {
    this.isAdd = true;
    this.isEditModalOpen = true;
  }
  OpenEditModal(tinhNguyenVien: any) {
    this.TNVSelected = tinhNguyenVien;
    this.isEdit = true;
    this.isEditModalOpen = true;
    console.log(this.TNVSelected)
    this.tinhNguyenVienForm.patchValue({
      cccd: this.TNVSelected.cccd,
      hoTen: this.TNVSelected.hoTen,
      ngaySinh: this.TNVSelected.ngaySinh.substring(0, 10),
      gioiTinh: this.TNVSelected.gioiTinh,
      soDienThoai: this.TNVSelected.soDienThoai,
      email: this.TNVSelected.email,
      soLanHien: this.TNVSelected.soLanHien,
    });
    this.gioiTinh = this.TNVSelected.gioiTinh;
    this.selectedProvince = this.TNVSelected.maTinhThanh;
    setTimeout(() => {
      this.selectedDistrict = this.TNVSelected.maQuanHuyen
      console.log(this.selectedDistrict);

      setTimeout(() => {
        this.selectedWard = this.TNVSelected.maPhuongXa
      }, 100);
    }, 100);
  }

  OpenDeleteModal(tinhNguyenVien: any) {
    this.TNVSelected = tinhNguyenVien;
    const confirmDelete = window.confirm('Xác nhận xóa tình nguyện viên ' + this.TNVSelected.cccd + ' ?');
    if (confirmDelete) {
      this.tinhNguyenVienService.deleteTinhNguyenVien(this.TNVSelected.cccd).subscribe({
        next: (response) => {
          if (response.code == 200) {
            this.searchTinhNguyenVien();
            alert('Xóa tình nguyện viên thành công!')
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

  closeEditModal() {
    this.isEdit = false
    this.isAdd = false
    this.isEditModalOpen = false;
    this.tinhNguyenVienForm.reset();
  }

  saveChanges() {
    if (this.isAdd) {
      this.AddTinhNguyenVien();
    }
    else {
      if (this.tinhNguyenVienForm.valid) {
        const updatedData = {
          cccd: this.tinhNguyenVienForm.value.cccd,
          hoTen: this.tinhNguyenVienForm.value.hoTen,
          ngaySinh: this.tinhNguyenVienForm.value.ngaySinh,
          gioiTinh: this.tinhNguyenVienForm.value.gioiTinh,
          soDienThoai: this.tinhNguyenVienForm.value.soDienThoai,
          email: this.tinhNguyenVienForm.value.email,
          maTinhThanh: this.tinhNguyenVienForm.value.maTinhThanh,
          maQuanHuyen: this.tinhNguyenVienForm.value.maQuanHuyen,
          maPhuongXa: this.tinhNguyenVienForm.value.maPhuongXa,
          soLanHien: this.tinhNguyenVienForm.value.soLanHien,
        };
        this.tinhNguyenVienService.updateTinhNguyenVien(this.TNVSelected.cccd, updatedData).subscribe({
          next: (response) => {
            if (response.code == 200) {
              this.isEditModalOpen = false;
              this.tinhNguyenVienForm.reset();
              this.searchTinhNguyenVien();
              this.isEdit = false
              alert('Cập nhật thông tin thành công!')
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
        this.tinhNguyenVienForm.markAllAsTouched();
      }
    }
  }
  AddTinhNguyenVien() {
    if (this.tinhNguyenVienForm.valid) {
      const tinhNguyenViendata = {
        cccd: this.tinhNguyenVienForm.value.cccd,
        hoTen: this.tinhNguyenVienForm.value.hoTen,
        ngaySinh: this.tinhNguyenVienForm.value.ngaySinh,
        gioiTinh: this.tinhNguyenVienForm.value.gioiTinh,
        soDienThoai: this.tinhNguyenVienForm.value.soDienThoai,
        email: this.tinhNguyenVienForm.value.email,
        maTinhThanh: this.tinhNguyenVienForm.value.maTinhThanh,
        maQuanHuyen: this.tinhNguyenVienForm.value.maQuanHuyen,
        maPhuongXa: this.tinhNguyenVienForm.value.maPhuongXa,
        soLanHien: this.tinhNguyenVienForm.value.soLanHien,
      }

      this.tinhNguyenVienService.createTinhNguyenVien(tinhNguyenViendata).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.searchTinhNguyenVien();
            this.isEditModalOpen = false;
            this.tinhNguyenVienForm.reset();
            alert('Tạo tình nguyện viên thành công.');
          }
          if (response.code === 400 || response.code === 404) {
            alert(response.message);
          }
        },
        error: (err) => {
          alert('Tạo tình nguyện viên không thành công, vui lòng thử lại.')
        }
      });
    } else {
      this.tinhNguyenVienForm.markAllAsTouched();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.searchTinhNguyenVien();
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.totalCount) {
      this.currentPage++;
      this.searchTinhNguyenVien();
    }
  }

  prePage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.searchTinhNguyenVien();
    }
  }

  goFirstPage(): void {
    if (this.currentPage > 1) {
      this.currentPage = 1;
      this.searchTinhNguyenVien();
    }
  }

  goLastPage(): void {
    const totalPages = Math.ceil(this.totalCount / this.pageSize);
    if (this.currentPage * this.pageSize < this.totalCount) {
      this.currentPage = totalPages;
      this.searchTinhNguyenVien();
    }
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
