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
import { ThongBaoService, TemplateResult, PaginatedResult } from '../services';

@Component({
  selector: 'app-quan-ly-thong-bao',
  standalone: true,
  imports: [
    TableDirective,
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './quan-ly-thong-bao.component.html',
  styleUrl: './quan-ly-thong-bao.component.css'
})
export class ThongBaoComponent implements OnInit {
  constructor(private fb: FormBuilder,
    private thongBaoService: ThongBaoService,
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
    });
    this.thongBaoForm = this.fb.group({
      tieuDe: ['', Validators.required],
      noiDung: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadThongBao();
  }

  searchForm: FormGroup;
  thongBaoForm: FormGroup;

  thongBaoList: any[] = [];
  thongBaoSelected: any = null;

  totalCount: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;

  isEditModalOpen: boolean = false;
  isEdit: boolean = false;
  isAdd: boolean = false
  editTitle: string = 'Chỉnh sửa thông tin'
  addTitle: string = 'Tạo thông báo'

  loadThongBao(){
      this.thongBaoService.getAllThongBaoPaginated(this.pageSize, this.currentPage).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.totalCount = response.data.totalCount;
            this.thongBaoList = response.data.items.filter((item: any) => item.tieuDe !== "Đợt hiến máu mới");
          }
          if (response.code === 404 || response.code === 400) {
            console.error(response.message);
          }
        },
        error: (error) => {
          console.error('Lỗi khi tải thông báo:', error);
        }
      });
  }

  searchThongBao(): void {
    const searchTerm = this.searchForm.get('searchTerm')?.value || 'Nội dung tìm kiếm';

    this.thongBaoService.search(searchTerm, this.pageSize, this.currentPage)
      .subscribe({
        next: (response: TemplateResult<PaginatedResult<any>>) => {
          this.totalCount = response.data.totalCount;
          this.thongBaoList = response.data.items.filter((item: any) => item.tieuDe !== "Đợt hiến máu mới");
        },
        error: (error) => {
          console.error('Error fetching data:', error);
        }
      });
  }
  searchThongBaoForm(): void {
    this.currentPage = 1;
    this.searchThongBao();
  }

  searchThongBaoFormDelay() {
    debounceTime(400);
    this.searchThongBaoForm();
  }

  exportExcel() {
    let thongBao: any[] = [];
    const searchTerm = this.searchForm.get('searchTerm')?.value || 'Nội dung tìm kiếm';

    this.thongBaoService.search(searchTerm, 1000, 1)
      .subscribe({
        next: (response: TemplateResult<PaginatedResult<any>>) => {
          thongBao = response.data.items;

          const excelData = thongBao.map((thongBao, index) => ({
            'STT': index + 1,
            'Tiêu đề': thongBao.tieuDe,
            'Nội dung': thongBao.noiDung,
            'Thời gian gửi': thongBao.thoiGianGui,
          }));

          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(excelData);

          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Danh Sách Thông Báo');

          const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
          const data: Blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
          saveAs(data, 'DanhSachThongBao.xlsx');
        },
        error: (error) => {
          console.error('Lỗi khi tải danh sách thông báo:', error);
        }
      });
  }

  OpenCreateModal() {
    this.isAdd = true;
    this.isEditModalOpen = true;
  }
  OpenEditModal(thongBao: any) {
    this.thongBaoSelected = thongBao;
    this.isEdit = true;
    this.isEditModalOpen = true;
    this.thongBaoForm.patchValue({
      tieuDe: this.thongBaoSelected.tieuDe,
      noiDung: this.thongBaoSelected.noiDung,
    });
  }

  OpenDeleteModal(thongBao: any) {
    this.thongBaoSelected = thongBao;
    const confirmDelete = window.confirm('Xác nhận xóa thông báo ' + this.thongBaoSelected.tieuDe + ' ?');
    if (confirmDelete) {
      this.thongBaoService.deleteThongBao(this.thongBaoSelected.maTB).subscribe({
        next: (response) => {
          if (response.code == 200) {
            this.searchThongBao();
            alert('Xóa thông báo thành công!')
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
    this.thongBaoForm.reset();
  }

  saveChanges() {
    if (this.isAdd) {
      this.AddThongBao();
    }
    else {
      if (this.thongBaoForm.valid) {
        const updatedData = {
          tieuDe: this.thongBaoForm.value.tieuDe,
          noiDung: this.thongBaoForm.value.noiDung,
        };
        this.thongBaoService.updateThongBao(this.thongBaoSelected.maTB, updatedData).subscribe({
          next: (response) => {
            if (response.code == 200) {
              this.isEditModalOpen = false;
              this.thongBaoForm.reset();
              this.searchThongBao();
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
        this.thongBaoForm.markAllAsTouched();
      }
    }
  }
  AddThongBao() {
    if (this.thongBaoForm.valid) {
      const thongBaodata = {
        tieuDe: this.thongBaoForm.value.tieuDe,
        noiDung: this.thongBaoForm.value.noiDung,     
        thoiGianGui: Date.now, 
      }
      this.thongBaoService.createThongBao(thongBaodata).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.searchThongBao();
            this.isAdd = false;
            this.isEditModalOpen = false;
            this.thongBaoForm.reset();
            alert('Tạo thông báo thành công.');
          }
          if (response.code === 400 || response.code === 404) {
            alert(response.message);
          }
        },
        error: (err) => {
          alert('Tạo thông báo không thành công, vui lòng thử lại.')
        }
      });
    } else {
      this.thongBaoForm.markAllAsTouched();
    }
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.searchThongBao();
  }

  nextPage(): void {
    if (this.currentPage * this.pageSize < this.totalCount) {
      this.currentPage++;
      this.searchThongBao();
    }
  }

  prePage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.searchThongBao();
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
