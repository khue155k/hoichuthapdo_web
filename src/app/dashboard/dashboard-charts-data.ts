import { Injectable } from '@angular/core';
import {
  ChartData,
  ChartDataset,
  ChartOptions,
  ChartType,
  PluginOptionsByType,
  ScaleOptions,
  TooltipLabelStyle,
  TooltipItem
} from 'chart.js';

import { getStyle, hexToRgba } from '@coreui/utils';
import { DashboardService } from '../services/dashboard.service';
import { ceil } from 'lodash-es';
export interface IChartProps {
  data?: ChartData;
  labels?: any;
  options?: ChartOptions;
  colors?: any;
  type: ChartType;
  legend?: any;

  [propName: string]: any;
}

@Injectable({
  providedIn: 'any'
})
export class DashboardChartsData {
  constructor(private dashboardService: DashboardService) {
    this.initMainChart();
  }

  public dsHM: any[] = [];

  ttHMTheoDot(year: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dashboardService.ttHMTheoDot(year).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.dsHM = response.data;
          }
          resolve();
        },
        error: (err) => {
          alert(`Có lỗi khi lấy danh sách đợt hiến máu: ${err}`);
          reject();
        },
      });
    });
  }

  ttHMTheoThang(year: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.dashboardService.ttHMTheoThang(year).subscribe({
        next: (response) => {
          if (response.code === 200) {
            this.dsHM = response.data;
          }
          resolve();
        },
        error: (err) => {
          alert(`Có lỗi khi lấy danh sách hiến máu theo tháng: ${err}`);
          reject();
        },
      });
    });
  }

  public mainChart: IChartProps = { type: 'line' };
  public random(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }
  max = 0;

  async initMainChart(period: string = 'Dot', year: number = new Date(Date.now()).getFullYear()) {
    const brandSuccess = getStyle('--cui-success') ?? '#4dbd74';
    const brandInfo = getStyle('--cui-info') ?? '#20a8d8';
    const brandInfoBg = hexToRgba(getStyle('--cui-info') ?? '#20a8d8', 10);
    const brandDanger = getStyle('--cui-danger') ?? '#f86c6b';

    if (period == 'Dot') {
      await this.ttHMTheoDot(year);
    }
    if (period == 'Thang') {
      await this.ttHMTheoThang(year);
    }
    this.mainChart['elements'] = this.dsHM.length;
    this.mainChart['Data1'] = [];
    this.mainChart['Data2'] = [];
    this.mainChart['Data3'] = [];
    this.mainChart['TongSoNguoiDangKy'] = 0;
    this.mainChart['TongSoNguoiHienMau'] = 0;
    this.max = 100;
    
    for (let i = 0; i < this.mainChart['elements']; i++) {
      this.mainChart['Data1'].push(this.dsHM.at(i).soNguoiDangKy);
      if (this.dsHM.at(i).soNguoiDangKy > this.max) this.max = this.dsHM.at(i).soNguoiDangKy;
      this.mainChart['Data2'].push(this.dsHM.at(i).soNguoiHienMau);
      this.mainChart['Data3'].push(this.dsHM.at(i).soNguoiDangKy - this.dsHM.at(i).soNguoiHienMau);

      this.mainChart['TongSoNguoiDangKy'] += this.dsHM.at(i).soNguoiDangKy;
      this.mainChart['TongSoNguoiHienMau'] += this.dsHM.at(i).soNguoiHienMau;
    }
    this.max = ceil(this.max / 100) * 100;

    let labels: string[] = [];

    if (period === 'Thang') {
      for (let i = 1; i <= this.mainChart['elements']; i++) {
        labels.push(`Tháng ${this.dsHM.at(i - 1).month}`);
      }
    } else if (period === 'Dot') {
      for (let i = 1; i <= this.mainChart['elements']; i++) {
        labels.push(this.dsHM.at(i-1).tenDot);
      }
    }

    if (this.mainChart['elements'] == 1) {
      this.mainChart['elements'] = 2;
      this.mainChart['Data1'].push(this.mainChart['Data1'].at(0));
      this.mainChart['Data2'].push(this.mainChart['Data2'].at(0));
      this.mainChart['Data3'].push(this.mainChart['Data3'].at(0));
      labels.push(labels[0]);
    }

    const colors = [
      {
        // brandInfo
        backgroundColor: brandInfoBg,
        borderColor: brandInfo,
        pointHoverBackgroundColor: brandInfo,
        borderWidth: 2,
        fill: true
      },
      {
        // brandSuccess
        backgroundColor: 'transparent',
        borderColor: brandSuccess || '#4dbd74',
        pointHoverBackgroundColor: '#fff'
      },
      {
        // brandDanger
        backgroundColor: 'transparent',
        borderColor: brandDanger || '#f86c6b',
        pointHoverBackgroundColor: brandDanger,
        borderWidth: 1,
        borderDash: [8, 5]
      }
    ];

    const datasets: ChartDataset[] = [
      {
        data: this.mainChart['Data1'],
        label: 'Số người đăng kí',
        ...colors[0]
      },
      {
        data: this.mainChart['Data2'],
        label: 'Số người đã hiến',
        ...colors[1]
      },
      {
        data: this.mainChart['Data3'],
        label: 'Số người đăng kí mà không hiến',
        ...colors[2]
      }
    ];
    const plugins: any = {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          labelColor: (context: TooltipItem<'line'>) => ({
            backgroundColor: context.dataset.borderColor as string
          } as TooltipLabelStyle)
        }
      }
    };

    const scales = this.getScales();

    const options: ChartOptions = {
      maintainAspectRatio: false,
      plugins,
      scales,
      elements: {
        line: {
          tension: 0.4
        },
        point: {
          radius: 0,
          hitRadius: 10,
          hoverRadius: 4,
          hoverBorderWidth: 3
        }
      }
    };

    this.mainChart.type = 'line';
    this.mainChart.options = options;
    this.mainChart.data = {
      datasets,
      labels
    };
  }

  getScales() {
    const colorBorderTranslucent = getStyle('--cui-border-color-translucent');
    const colorBody = getStyle('--cui-body-color');

    const scales: ScaleOptions<any> = {
      x: {
        grid: {
          color: colorBorderTranslucent,
          drawOnChartArea: false
        },
        ticks: {
          color: colorBody
        }
      },
      y: {
        border: {
          color: colorBorderTranslucent
        },
        grid: {
          color: colorBorderTranslucent
        },
        max: this.max,
        beginAtZero: true,
        ticks: {
          color: colorBody,
          maxTicksLimit: 5,
          stepSize: Math.ceil(this.max / 5)
        }
      }
    };
    return scales;
  }
}
