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
import { TinhNguyenVienService, TemplateResult, PaginatedResult, QuaTangService, LocationService } from '../../services';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-tang-qua',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    Select2Module,
    TableDirective,
    Select2Module,
  ],
  templateUrl: './tang-qua.component.html',
  styleUrl: './tang-qua.component.css'
})
export class TangQuaComponent implements OnInit {
  constructor(private fb: FormBuilder,
    private tinhNguyenVienService: TinhNguyenVienService,
    private quaTangService: QuaTangService,
    private locationService: LocationService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
    });
    this.tangQuaForm = this.fb.group({
      quaTang: ['', Validators.required],
      noiDung: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadQuaTang();
    this.searchTinhNguyenVien();
  }
  searchForm: FormGroup;
  tangQuaForm: FormGroup;

  tinhNguyenVienList: any[] = [];
  TNVSelected: any = null;

  quaTangList: any[] = [];
  selectedQuaTang: any

  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;

  isEditModalOpen: boolean = false;

  loadQuaTang() {
    this.quaTangService.getAllQuaTangPaginated(this.pageSize, this.currentPage).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.quaTangList = response.data.items.map((quaTang: any) => ({
            value: quaTang.maQua,
            label: quaTang.tenQua + " : " + quaTang.giaTri + " VNĐ",
          }));
          console.log(this.quaTangList);
        }
        if (response.code === 404 || response.code === 400) {
          console.error(response.message);
        }
      },
      error: (error) => {
        console.error('Lỗi khi tải quà tặng:', error);
      }
    });
  }

  async searchTinhNguyenVien() {
    const searchTerm = this.searchForm.get('searchTerm')?.value || 'Nội dung tìm kiếm';

    try {
      const response = await firstValueFrom(
        this.quaTangService.searchTNV(searchTerm, this.pageSize, this.currentPage)
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
      const response = await firstValueFrom(
        this.quaTangService.searchTNV(searchTerm, 1000, 1)
      );
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

    } catch (error) {
      console.error('Lỗi khi tải tình nguyện viên:', error);
    }

    const excelData = tinhNguyenVien.map((tinhNguyenVien, index) => ({
      'STT': index + 1,
      'Họ tên': tinhNguyenVien.hoTen,
      'Số điện thoại': tinhNguyenVien.soDienThoai,
      'Email': tinhNguyenVien.email,
      'Địa chỉ': tinhNguyenVien.noiO,
      'Số lần hiến': tinhNguyenVien.soLanHien,
      'Số quà đã nhận': tinhNguyenVien.soLanHien,
    }));

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Số Quà Đã Tặng');

    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, 'SoQuaDaTang.xlsx');
  }

  OpenEditModal(tinhNguyenVien: any) {
    this.TNVSelected = tinhNguyenVien;
    this.isEditModalOpen = true;
  }

  closeEditModal() {
    this.isEditModalOpen = false;
    this.tangQuaForm.reset();
  }

  saveChanges() {
    if (this.tangQuaForm.valid) {
      const updatedData = {
        cccd: this.TNVSelected.cccd,
        maQua: this.tangQuaForm.value.quaTang,
        noiDung: this.tangQuaForm.value.noiDung,
      };
      this.quaTangService.tangQua(updatedData).subscribe({
        next: (response) => {
          if (response.code == 200) {
            this.isEditModalOpen = false;
            this.tangQuaForm.reset();
            this.searchTinhNguyenVien();
            alert('Tặng quà thành công!')
          }
          if (response.code === 404 || response.code === 400) {
            alert(response.message);
          }
        },
        error: (err) => {
          alert('Có lỗi xảy ra khi tậng quà!');
        },
      });
    }
    else {
      this.tangQuaForm.markAllAsTouched();
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
