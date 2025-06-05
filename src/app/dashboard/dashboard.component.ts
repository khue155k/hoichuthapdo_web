import { DOCUMENT, NgStyle } from '@angular/common';
import { Component, DestroyRef, effect, inject, OnInit, Renderer2, signal, WritableSignal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ChartOptions } from 'chart.js';
import {
  AvatarComponent,
  ButtonDirective,
  ButtonGroupComponent,
  CardBodyComponent,
  CardComponent,
  CardFooterComponent,
  CardHeaderComponent,
  ColComponent,
  FormCheckLabelDirective,
  GutterDirective,
  ProgressBarDirective,
  ProgressComponent,
  RowComponent,
  TableDirective,
  TextColorDirective
} from '@coreui/angular';
import { Select2Data, Select2UpdateEvent, Select2Module } from 'ng-select2-component';
import { ChartjsComponent } from '@coreui/angular-chartjs';
import { IconDirective } from '@coreui/icons-angular';
import { NavigationEnd, Router } from '@angular/router';

import { DashboardChartsData, IChartProps } from './dashboard-charts-data';
import { DecimalPipe } from '@angular/common';
import { DashboardService } from '../services/dashboard.service';

@Component({
  templateUrl: 'dashboard.component.html',
  styleUrls: ['dashboard.component.scss'],
  standalone: true,
  imports: [TextColorDirective, CardComponent, CardBodyComponent, RowComponent, ColComponent, ButtonDirective, IconDirective, ReactiveFormsModule, ButtonGroupComponent, FormCheckLabelDirective, ChartjsComponent, NgStyle, CardFooterComponent, GutterDirective, ProgressBarDirective, ProgressComponent,
    //WidgetsBrandComponent, CardHeaderComponent, TableDirective, AvatarComponent,
    DecimalPipe,
    Select2Module]
})
export class DashboardComponent implements OnInit {

  readonly #destroyRef: DestroyRef = inject(DestroyRef);
  readonly #document: Document = inject(DOCUMENT);
  readonly #renderer: Renderer2 = inject(Renderer2);
  readonly #chartsData: DashboardChartsData = inject(DashboardChartsData);

  constructor(private router: Router, private dashboardService: DashboardService) {
  }
  public trafficRadioGroup = new FormGroup({
    trafficRadio: new FormControl('Dot')
  });

  public mainChart: IChartProps = { type: 'line' };
  public soTNVCoTheHMChart: IChartProps = { type: 'line' };

  namSelected: any;
  namList: any[] = [];

  ngOnInit(): void {
    this.getNamHMs();
    this.setTrafficPeriod(this.trafficRadioGroup.get("trafficRadio")?.value!)
    this.setTrafficPeriod1(this.trafficRadioGroup.get("trafficRadio")?.value!)
    this.updateChartOnColorModeChange();
  }

  getNamHMs() {
    this.dashboardService.getNamHMs().subscribe({
      next: (response) => {
        if (response.code === 200) {
          this.namList = response.data.map((dotHM: any) => ({
            value: dotHM.nam,
            label: dotHM.nam,
          }));
          this.namSelected = new Date(Date.now()).getFullYear();
        }
      },
      error: (err) => {
        alert(`Có lỗi khi lấy danh sách năm hiến máu: ${err}`);
      },
    });
  }

  initCharts(): void {
    this.mainChart = this.#chartsData.mainChart;
  }

  setTrafficPeriod(value: string) {
    this.trafficRadioGroup.setValue({ trafficRadio: value });
    this.#chartsData.initMainChart(value, this.namSelected);
    this.initCharts();
  }

  updateNam(event: Select2UpdateEvent<any>) {
    //console.log('update', event.component.id, event.value, event.options[0].label);
    this.namSelected = event.value;
    this.setTrafficPeriod(this.trafficRadioGroup.get("trafficRadio")?.value!)
  }

  // update color
  updateChartOnColorModeChange() {
    const unListen = this.#renderer.listen(this.#document.documentElement, 'ColorSchemeChange', () => {
      this.setChartStyles();
    });

    this.#destroyRef.onDestroy(() => {
      unListen();
    });
  }

  public mainChartRef: WritableSignal<any> = signal(undefined);
  #mainChartRefEffect = effect(() => {
    if (this.mainChartRef()) {
      this.setChartStyles();
    }
  });

  handleChartRef($chartRef: any) {

    if ($chartRef) {
      this.mainChartRef.set($chartRef);
    }
  }

  setChartStyles() {
    if (this.mainChartRef()) {
      setTimeout(() => {
        const options: ChartOptions = { ...this.mainChart.options };
        const scales = this.#chartsData.getScales();
        this.mainChartRef().options.scales = { ...options.scales, ...scales };
        this.mainChartRef().update();
      });
    }
  }
  // update color

  initCharts1(): void {
    this.soTNVCoTheHMChart = this.#chartsData.soTNVCoTheHMChart;
  }

  setTrafficPeriod1(value: string) {
    this.trafficRadioGroup.setValue({ trafficRadio: value });
    this.#chartsData.initSoTNVCoTheHMChart(value, this.namSelected);
    this.initCharts1();
  }

  public soTNVCoTheHMChartRef: WritableSignal<any> = signal(undefined);
  #soTNVCoTheHMChartRefEffect = effect(() => {
    if (this.soTNVCoTheHMChartRef()) {
      this.setChartStyles();
    }
  });

  handleChartRef1($chartRef: any) {

    if ($chartRef) {
      this.soTNVCoTheHMChartRef.set($chartRef);
    }
  }

  setChartStyles1() {
    if (this.soTNVCoTheHMChartRef()) {
      setTimeout(() => {
        const options: ChartOptions = { ...this.soTNVCoTheHMChart.options };
        const scales = this.#chartsData.getScales();
        this.soTNVCoTheHMChartRef().options.scales = { ...options.scales, ...scales };
        this.soTNVCoTheHMChartRef().update();
      });
    }
  }
  // update color
}
