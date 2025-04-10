import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TableDirective,
}
  from '@coreui/angular';

import { debounceTime } from 'rxjs';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DotHienMauService, TemplateResult, PaginatedResult } from '../../services';

@Component({
  selector: 'app-dot-hien-mau',
  standalone: true,
  imports: [
    TableDirective,
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './dot-hien-mau.component.html',
  styleUrl: './dot-hien-mau.component.css'
})
export class DotHienMauComponent implements OnInit {
  constructor(private fb: FormBuilder,
    private dotHienMauService: DotHienMauService,
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
    });
    this.dotHMForm = this.fb.group({
      tenDot: ['', Validators.required],
      diaDiem: ['', Validators.required],
      thoiGianBatDau: ['', Validators.required],
      thoiGianKetThuc: ['', Validators.required],
      donViMau: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadDotHienMau();
  }

  searchForm: FormGroup;
  dotHMForm: FormGroup;

  dotHienMauList: any[] = [];
  dotHMSelected: any = null;

  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;

  isEditModalOpen: boolean = false;
  isEdit: boolean = false;
  isAdd: boolean = false
  editTitle: string = 'Chỉnh sửa thông tin'
  addTitle: string = 'Tạo đợt hiến máu'

  loadDotHienMau(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dotHienMauService.getAllDotHienMauPaginated(this.pageSize, this.currentPage).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.totalCount = response.data.totalCount;
            this.dotHienMauList = response.data.items.map((dotHM: any) => ({
              ...dotHM,
              status: this.getDotHienMauStatus(dotHM),
            }));
          }
          if (response.code === 404 || response.code === 400) {
            console.error(response.message)
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

  getDotHienMauStatus(dotHM: any): string {
    const now = new Date();
    const thoiGianBatDau = new Date(dotHM.thoiGianBatDau)
    const thoiGianKetThuc = new Date(dotHM.thoiGianKetThuc)

    if (thoiGianBatDau && now < thoiGianBatDau) {
      return 'Chưa diễn ra';
    }
    if (thoiGianBatDau && thoiGianKetThuc && now >= thoiGianBatDau && now <= thoiGianKetThuc) {
      return 'Đang diễn ra';
    }
    if (dotHM.thoiGianKetThuc && now > thoiGianKetThuc) {
      return 'Đã kết thúc';
    }
    return '';
  }

  searchDotHienMau(): void {
    const searchTerm = this.searchForm.get('searchTerm')?.value || 'Nội dung tìm kiếm';

    this.dotHienMauService.search(searchTerm, this.pageSize, this.currentPage)
      .subscribe({
        next: (response: TemplateResult<PaginatedResult<any>>) => {
          this.totalCount = response.data.totalCount;
          this.dotHienMauList = response.data.items.map((dotHM: any) => ({
            ...dotHM,
            status: this.getDotHienMauStatus(dotHM),
          }));
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
  }
  searchDotHienMauForm(): void {
    this.currentPage = 1;
    this.searchDotHienMau();
  }

  searchDotHienMauFormDelay() {
    debounceTime(400);
    this.searchDotHienMauForm();
  }

  exportExcel() {
    let dotHienMau: any[] = [];
    const searchTerm = this.searchForm.get('searchTerm')?.value || 'Nội dung tìm kiếm';

    this.dotHienMauService.search(searchTerm, 1000, 1)
      .subscribe({
        next: (response: TemplateResult<PaginatedResult<any>>) => {
          dotHienMau = response.data.items;

          const excelData = dotHienMau.map((dotHM, index) => ({
            'STT': index + 1,
            'Tên đợt': dotHM.tenDot,
            'Địa điểm': dotHM.diaDiem,
            'Thời gian bắt đầu': dotHM.thoiGianBatDau,
            'Thời gian kết thúc': dotHM.thoiGianKetThuc,
            'Đơn vị máu đăng ký': dotHM.donViMau,
          }));

          const tong_theTich_mau = dotHienMau.reduce((total, dotHM) => {
            const donViMauValue = parseInt(dotHM.donViMau, 10);
            return total + (isNaN(donViMauValue) ? 0 : donViMauValue);
          }, 0);

          excelData.push({
            'STT': 0,
            'Tên đợt': 'Tổng cộng',
            'Địa điểm': '',
            'Thời gian bắt đầu': '',
            'Thời gian kết thúc': '',
            'Đơn vị máu đăng ký': tong_theTich_mau,
          });

          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Đợt Hiến Máu');

          const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
          saveAs(data, 'DanhSachDotHienMau.xlsx');
        },
        error: (error) => {
          console.error('Lỗi khi tải danh sách đợt hiến máu:', error);
        }
      });
  }

  OpenCreateModal() {
    this.isAdd = true;
    this.isEditModalOpen = true;
  }
  OpenEditModal(dotHm: any) {
    this.dotHMSelected = dotHm;
    this.isEdit = true;
    this.isEditModalOpen = true;
    this.dotHMForm.patchValue({
      tenDot: this.dotHMSelected.tenDot,
      diaDiem: this.dotHMSelected.diaDiem,
      thoiGianBatDau: this.dotHMSelected.thoiGianBatDau,
      thoiGianKetThuc: this.dotHMSelected.thoiGianKetThuc,
      donViMau: this.dotHMSelected.donViMau
    });
  }

  OpenDeleteModal(dotHm: any) {
    this.dotHMSelected = dotHm;
    const confirmDelete = window.confirm('Xác nhận xóa đợt hiến máu ' + this.dotHMSelected.tenDot + ' ?');
    if (confirmDelete) {
      this.dotHienMauService.deleteDotHienMau(this.dotHMSelected.maDot).subscribe({
        next: (response) => {
          if (response.code == 200) {
            this.searchDotHienMau();
            alert('Xóa đợt hiến máu thành công!')
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
    this.dotHMForm.reset();
  }

  saveChanges() {
    if (this.isAdd) {
      this.AddDotHM();
    }
    else {
      if (this.dotHMForm.valid) {
        const updatedData = {
          tenDot: this.dotHMForm.value.tenDot,
          diaDiem: this.dotHMForm.value.diaDiem,
          thoiGianBatDau: this.dotHMForm.value.thoiGianBatDau,
          thoiGianKetThuc: this.dotHMForm.value.thoiGianKetThuc,
          donViMau: this.dotHMForm.value.donViMau
        };
        this.dotHienMauService.updateDotHienMau(this.dotHMSelected.maDot, updatedData).subscribe({
          next: (response) => {
            if (response.code == 200) {
              this.isEditModalOpen = false;
              this.dotHMForm.reset();
              this.searchDotHienMau();
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
        this.dotHMForm.markAllAsTouched();
      }
    }
  }
  AddDotHM() {
    if (this.dotHMForm.valid) {
      const dotHMdata = {
        tenDot: this.dotHMForm.value.tenDot,
        diaDiem: this.dotHMForm.value.diaDiem,
        thoiGianBatDau: this.dotHMForm.value.thoiGianBatDau,
        thoiGianKetThuc: this.dotHMForm.value.thoiGianKetThuc,
        donViMau: this.dotHMForm.value.donViMau
      }

      this.dotHienMauService.createDotHienMau(dotHMdata).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.searchDotHienMau();
            alert('Tạo đợt hiến máu thành công.');
            this.isEditModalOpen = false;
          }
          if (response.code === 400 || response.code === 404) {
            alert(response.message);
          }
        },
        error: (err) => {
          alert('Tạo đợt hiến máu không thành công, vui lòng thử lại.')
        }
      });
    } else {
      this.dotHMForm.markAllAsTouched();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.searchDotHienMau();
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.totalCount) {
      this.currentPage++;
      this.searchDotHienMau();
    }
  }

  prePage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.searchDotHienMau();
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
