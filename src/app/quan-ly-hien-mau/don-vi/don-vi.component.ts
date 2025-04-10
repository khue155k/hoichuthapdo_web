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
import { DonViService, TemplateResult, PaginatedResult } from '../../services';

@Component({
  selector: 'app-don-vi',
  standalone: true,
  imports: [
    TableDirective,
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './don-vi.component.html',
  styleUrl: './don-vi.component.css'
})
export class DonViComponent implements OnInit {
  constructor(private fb: FormBuilder,
    private donViService: DonViService,
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
    });
    this.donViForm = this.fb.group({
      tenDV: ['', Validators.required],
      email: ['', Validators.required],
      soDienThoai: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadDonVi();
  }

  searchForm: FormGroup;
  donViForm: FormGroup;

  donViList: any[] = [];
  donViSelected: any = null;

  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;

  isEditModalOpen: boolean = false;
  isEdit: boolean = false;
  isAdd: boolean = false
  editTitle: string = 'Chỉnh sửa thông tin'
  addTitle: string = 'Tạo đơn vị'

  loadDonVi(){
      this.donViService.getAllDonViPaginated(this.pageSize, this.currentPage).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.totalCount = response.data.totalCount;
            this.donViList = response.data.items;
          }
          if (response.code === 404 || response.code === 400) {
            console.error(response.message)
          }
        },
        error: (error) => {
          console.error('Lỗi khi tải đơn vị:', error);
        }
      });
  }

  searchDonVi(): void {
    const searchTerm = this.searchForm.get('searchTerm')?.value || 'Nội dung tìm kiếm';

    this.donViService.search(searchTerm, this.pageSize, this.currentPage)
      .subscribe({
        next: (response: TemplateResult<PaginatedResult<any>>) => {
          this.totalCount = response.data.totalCount;
          this.donViList = response.data.items;
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
  }
  searchDonViForm(): void {
    this.currentPage = 1;
    this.searchDonVi();
  }

  searchDonViFormDelay() {
    debounceTime(400);
    this.searchDonViForm();
  }

  exportExcel() {
    let donVi: any[] = [];
    const searchTerm = this.searchForm.get('searchTerm')?.value || 'Nội dung tìm kiếm';

    this.donViService.search(searchTerm, 1000, 1)
      .subscribe({
        next: (response: TemplateResult<PaginatedResult<any>>) => {
          donVi = response.data.items;

          const excelData = donVi.map((donVi, index) => ({
            'STT': index + 1,
            'Tên đơn vị': donVi.tenDV,
            'Email': donVi.email,
            'Số điện thoại': donVi.soDienThoai,
          }));

          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Đơn Vị');

          const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
          saveAs(data, 'DanhSachDonVi.xlsx');
        },
        error: (error) => {
          console.error('Lỗi khi tải danh sách đơn vị:', error);
        }
      });
  }

  OpenCreateModal() {
    this.isAdd = true;
    this.isEditModalOpen = true;
  }
  OpenEditModal(donVi: any) {
    this.donViSelected = donVi;
    this.isEdit = true;
    this.isEditModalOpen = true;
    this.donViForm.patchValue({
      tenDV: this.donViSelected.tenDV,
      email: this.donViSelected.email,
      soDienThoai: this.donViSelected.soDienThoai,
    });
  }

  OpenDeleteModal(donVi: any) {
    this.donViSelected = donVi;
    const confirmDelete = window.confirm('Xác nhận xóa đơn vị ' + this.donViSelected.tenDV + ' ?');
    if (confirmDelete) {
      this.donViService.deleteDonVi(this.donViSelected.maDV).subscribe({
        next: (response) => {
          if (response.code == 200) {
            this.searchDonVi();
            alert('Xóa đơn vị thành công!')
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
    this.donViForm.reset();
  }

  saveChanges() {
    if (this.isAdd) {
      this.AddDonVi();
    }
    else {
      if (this.donViForm.valid) {
        const updatedData = {
          tenDV: this.donViForm.value.tenDV,
          email: this.donViForm.value.email,
          soDienThoai: this.donViForm.value.soDienThoai,
        };
        this.donViService.updateDonVi(this.donViSelected.maDV, updatedData).subscribe({
          next: (response) => {
            if (response.code == 200) {
              this.isEditModalOpen = false;
              this.donViForm.reset();
              this.searchDonVi();
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
        this.donViForm.markAllAsTouched();
      }
    }
  }
  AddDonVi() {
    if (this.donViForm.valid) {
      const donVidata = {
        tenDV: this.donViForm.value.tenDV,
        email: this.donViForm.value.email,
        soDienThoai: this.donViForm.value.soDienThoai,
      }

      this.donViService.createDonVi(donVidata).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.searchDonVi();
            alert('Tạo đơn vị thành công.');
            this.isEditModalOpen = false;
          }
          if (response.code === 400 || response.code === 404) {
            alert(response.message);
          }
        },
        error: (err) => {
          alert('Tạo đơn vị không thành công, vui lòng thử lại.')
        }
      });
    } else {
      this.donViForm.markAllAsTouched();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.searchDonVi();
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.totalCount) {
      this.currentPage++;
      this.searchDonVi();
    }
  }

  prePage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.searchDonVi();
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
