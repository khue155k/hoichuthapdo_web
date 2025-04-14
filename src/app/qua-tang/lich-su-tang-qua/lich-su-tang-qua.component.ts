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
import { LichSuTangQuaService, TemplateResult, PaginatedResult } from '../../services';

@Component({
  selector: 'app-lich-su-tang-qua',
  standalone: true,
  imports: [
    TableDirective,
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './lich-su-tang-qua.component.html',
  styleUrl: './lich-su-tang-qua.component.css'
})
export class LichSuTangQuaComponent implements OnInit {
  constructor(private fb: FormBuilder,
    private lichSuService: LichSuTangQuaService,
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
    });
    this.lichSuForm = this.fb.group({
      cccd: ['', Validators.required],
      maQua: ['', Validators.required],
      noiDung: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadLSTQ();
  }

  searchForm: FormGroup;
  lichSuForm: FormGroup;

  lichSuList: any[] = [];
  lichSuSelected: any = null;

  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;

  isEditModalOpen: boolean = false;

  loadLSTQ() {
    this.lichSuService.getAllLSTQPaginated(this.pageSize, this.currentPage).subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.totalCount = response.data.totalCount;
          this.lichSuList = response.data.items;
        }
        if (response.code === 404 || response.code === 400) {
          console.error(response.message);
        }
      },
      error: (error) => {
        console.error('Lỗi khi tải lịch sử tặng quà:', error);
      }
    });
  }

  searchLSTQ(): void {
    const searchTerm = this.searchForm.get('searchTerm')?.value || 'Nội dung tìm kiếm';

    this.lichSuService.search(searchTerm, this.pageSize, this.currentPage)
      .subscribe({
        next: (response: TemplateResult<PaginatedResult<any>>) => {
          this.totalCount = response.data.totalCount;
          this.lichSuList = response.data.items;
          console.log(this.lichSuList);
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
  }
  searchLSTQForm(): void {
    this.currentPage = 1;
    this.searchLSTQ();
  }

  searchLSTQFormDelay() {
    debounceTime(400);
    this.searchLSTQForm();
  }

  exportExcel() {
    let lichSu: any[] = [];
    const searchTerm = this.searchForm.get('searchTerm')?.value || 'Nội dung tìm kiếm';

    this.lichSuService.search(searchTerm, 1000, 1)
      .subscribe({
        next: (response: TemplateResult<PaginatedResult<any>>) => {
          lichSu = response.data.items;

          const excelData = lichSu.map((lichSu, index) => ({
            'STT': index + 1,
            'CCCD': lichSu.cccd,
            'Mã quà': lichSu.maQua,
            'Nội dung': lichSu.noiDung,
          }));

          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Lịch Sử Tặng Quà');

          const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
          saveAs(data, 'DanhSachLichSuTangQua.xlsx');
        },
        error: (error) => {
          console.error('Lỗi khi tải danh sách lịch sử tặng quà:', error);
        }
      });
  }

  OpenEditModal(lichSu: any) {
    this.lichSuSelected = lichSu;
    this.isEditModalOpen = true;
    this.lichSuForm.patchValue({
      cccd: this.lichSuSelected.cccd,
      maQua: this.lichSuSelected.maQua,
      noiDung: this.lichSuSelected.noiDung,
    });
  }

  OpenDeleteModal(lichSu: any) {
    this.lichSuSelected = lichSu;
    const confirmDelete = window.confirm('Xác nhận xóa lịch sử tặng quà đã chọn?');
    if (confirmDelete) {
      this.lichSuService.deleteLSTQ(this.lichSuSelected.cccd, this.lichSuSelected.maQua).subscribe({
        next: (response) => {
          if (response.code == 200) {
            this.searchLSTQ();
            alert('Xóa lịch sử tặng quà thành công!')
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
    this.isEditModalOpen = false;
    this.lichSuForm.reset();
  }

  saveChanges() {
    if (this.lichSuForm.valid) {
      const updatedData = {
        cccd: this.lichSuForm.value.cccd,
        maQua: this.lichSuForm.value.maQua,
        noiDung: this.lichSuForm.value.noiDung,
      };
      this.lichSuService.updateLSTQ(this.lichSuSelected.cccd, this.lichSuSelected.maQua, updatedData).subscribe({
        next: (response) => {
          if (response.code == 200) {
            this.isEditModalOpen = false;
            this.lichSuForm.reset();
            this.searchLSTQ();
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
      this.lichSuForm.markAllAsTouched();
    }
  }
  
  goToPage(page: number): void {
    this.currentPage = page;
    this.searchLSTQ();
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.totalCount) {
      this.currentPage++;
      this.searchLSTQ();
    }
  }

  prePage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.searchLSTQ();
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
