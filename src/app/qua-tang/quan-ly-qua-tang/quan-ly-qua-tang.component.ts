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
import { QuaTangService, TemplateResult, PaginatedResult } from '../../services';

@Component({
  selector: 'app-quan-ly-qua-tang',
  standalone: true,
  imports: [
    TableDirective,
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './quan-ly-qua-tang.component.html',
  styleUrl: './quan-ly-qua-tang.component.css'
})
export class QuaTangComponent implements OnInit {
  constructor(private fb: FormBuilder,
    private quaTangService: QuaTangService,
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
    });
    this.quaTangForm = this.fb.group({
      tenQua: ['', Validators.required],
      giaTri: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadQuaTang();
  }

  searchForm: FormGroup;
  quaTangForm: FormGroup;

  quaTangList: any[] = [];
  quaTangSelected: any = null;

  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;

  isEditModalOpen: boolean = false;
  isEdit: boolean = false;
  isAdd: boolean = false
  editTitle: string = 'Chỉnh sửa thông tin'
  addTitle: string = 'Tạo quà tặng'

  loadQuaTang(){
      this.quaTangService.getAllQuaTangPaginated(this.pageSize, this.currentPage).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.totalCount = response.data.totalCount;
            this.quaTangList = response.data.items;
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

  searchQuaTang(): void {
    const searchTerm = this.searchForm.get('searchTerm')?.value || 'Nội dung tìm kiếm';

    this.quaTangService.search(searchTerm, this.pageSize, this.currentPage)
      .subscribe({
        next: (response: TemplateResult<PaginatedResult<any>>) => {
          this.totalCount = response.data.totalCount;
          this.quaTangList = response.data.items;
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
  }
  searchQuaTangForm(): void {
    this.currentPage = 1;
    this.searchQuaTang();
  }

  searchQuaTangFormDelay() {
    debounceTime(400);
    this.searchQuaTangForm();
  }

  exportExcel() {
    let quaTang: any[] = [];
    const searchTerm = this.searchForm.get('searchTerm')?.value || 'Nội dung tìm kiếm';

    this.quaTangService.search(searchTerm, 1000, 1)
      .subscribe({
        next: (response: TemplateResult<PaginatedResult<any>>) => {
          quaTang = response.data.items;

          const excelData = quaTang.map((quaTang, index) => ({
            'STT': index + 1,
            'Tên quà tặng': quaTang.tenQua,
            'Giá trị': quaTang.giaTri,
          }));

          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Quà Tặng');

          const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
          saveAs(data, 'DanhSachQuaTang.xlsx');
        },
        error: (error) => {
          console.error('Lỗi khi tải danh sách quà tặng:', error);
        }
      });
  }

  OpenCreateModal() {
    this.isAdd = true;
    this.isEditModalOpen = true;
  }
  OpenEditModal(quaTang: any) {
    this.quaTangSelected = quaTang;
    this.isEdit = true;
    this.isEditModalOpen = true;
    this.quaTangForm.patchValue({
      tenQua: this.quaTangSelected.tenQua,
      giaTri: this.quaTangSelected.giaTri,
    });
  }

  OpenDeleteModal(quaTang: any) {
    this.quaTangSelected = quaTang;
    const confirmDelete = window.confirm('Xác nhận xóa quà tặng ' + this.quaTangSelected.tenQua + ' ?');
    if (confirmDelete) {
      this.quaTangService.deleteQuaTang(this.quaTangSelected.maQua).subscribe({
        next: (response) => {
          if (response.code == 200) {
            this.searchQuaTang();
            alert('Xóa quà tặng thành công!')
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
    this.quaTangForm.reset();
  }

  saveChanges() {
    if (this.isAdd) {
      this.AddQuaTang();
    }
    else {
      if (this.quaTangForm.valid) {
        const updatedData = {
          tenQua: this.quaTangForm.value.tenQua,
          giaTri: this.quaTangForm.value.giaTri,
        };
        this.quaTangService.updateQuaTang(this.quaTangSelected.maQua, updatedData).subscribe({
          next: (response) => {
            if (response.code == 200) {
              this.isEditModalOpen = false;
              this.quaTangForm.reset();
              this.searchQuaTang();
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
        this.quaTangForm.markAllAsTouched();
      }
    }
  }
  AddQuaTang() {
    if (this.quaTangForm.valid) {
      const quaTangdata = {
        tenQua: this.quaTangForm.value.tenQua,
        giaTri: this.quaTangForm.value.giaTri,      }

      this.quaTangService.createQuaTang(quaTangdata).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.searchQuaTang();
            this.isEditModalOpen = false;
            this.quaTangForm.reset();
            alert('Tạo quà tặng thành công.');
          }
          if (response.code === 400 || response.code === 404) {
            alert(response.message);
          }
        },
        error: (err) => {
          alert('Tạo quà tặng không thành công, vui lòng thử lại.')
        }
      });
    } else {
      this.quaTangForm.markAllAsTouched();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.searchQuaTang();
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.totalCount) {
      this.currentPage++;
      this.searchQuaTang();
    }
  }

  prePage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.searchQuaTang();
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
