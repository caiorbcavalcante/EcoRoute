import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteService } from '../../services/route.service';
import { Point } from '../../models/point.model';
import Chart from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';

Chart.register(zoomPlugin);

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
  @ViewChild('rotaCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  points: Point[] = [{ x: 0, y: 0 }];
  optimizedRoute: Point[] = [];
  chart: Chart | undefined;
  manualMode = false;

  constructor(private routeService: RouteService) {}

  ngAfterViewInit(): void {
    this.inicializarGrafico();
  }

  private inicializarGrafico() {
    const ctx = this.canvasRef.nativeElement.getContext('2d')!;

    // Dataset para pontos com cor diferenciada para o depósito
    const pontosDataset = {
      label: 'Pontos',
      data: this.points.map(p => ({ x: p.x, y: p.y })),
      backgroundColor: this.points.map(p => p.x === 0 && p.y === 0 ? '#ffffff' : '#ff4081'), // branco para depósito
      pointRadius: 6,
      pointHoverRadius: 8,
      showLine: false
    };

    this.chart = new Chart(ctx, {
      type: 'scatter',
      data: {
        datasets: [pontosDataset]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            type: 'linear',
            position: 'bottom',
            title: { display: true, text: 'X' },
            grid: { color: '#333333' },
            min: -100,
            max: 100
          },
          y: {
            type: 'linear',
            title: { display: true, text: 'Y' },
            grid: { color: '#333333' },
            min: -100,
            max: 100
          }
        },
        plugins: {
          tooltip: {
            callbacks: {
              label: (context) => {
                const ponto = context.raw as { x: number; y: number };
                return `(${ponto.x}, ${ponto.y})`;
              }
            }
          },
          legend: { display: false },
          zoom: {
            zoom: {
              wheel: {
                enabled: true,
                speed: 0.1
              },
              pinch: {
                enabled: true
              },
              mode: 'xy'
            },
            pan: {
              enabled: true,
              mode: 'xy',
            }
          }
        },
        backgroundColor: '#1e1e1e'
      }
    });
  }

  private atualizarPontos() {
    if (this.chart) {
      // Atualiza os dados e também as cores (o depósito sempre branco)
      this.chart.data.datasets[0].data = this.points.map(p => ({ x: p.x, y: p.y }));
      this.chart.data.datasets[0].backgroundColor = this.points.map(p => 
        p.x === 0 && p.y === 0 ? '#ffffff' : '#ff4081'
      );
      this.chart.update();
    }
  }

  private desenharRota() {
    if (this.optimizedRoute.length === 0) return;

    if (this.chart && this.chart.data.datasets.length > 1) {
      this.chart.data.datasets.pop();
    }

    this.chart?.data.datasets.push({
      label: 'Rota',
      data: this.optimizedRoute.map(p => ({ x: p.x, y: p.y })),
      borderColor: '#00ffcc',
      backgroundColor: 'transparent',
      showLine: true,
      pointRadius: 0,
      borderWidth: 2,
      order: 0
    });

    this.chart?.update();
  }

  private limparRota() {
    if (this.chart && this.chart.data.datasets.length > 1) {
      this.chart.data.datasets.pop();
      this.chart?.update();
    }
    this.optimizedRoute = [];
  }

  toggleManualMode() {
    this.manualMode = !this.manualMode;
  }

  onCanvasClick(event: MouseEvent) {
    if (!this.manualMode) return;

    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const mouseX = (event.clientX - rect.left) * scaleX;
    const mouseY = (event.clientY - rect.top) * scaleY;

    if (this.chart) {
      const xScale = this.chart.scales['x'];
      const yScale = this.chart.scales['y'];
      if (xScale && yScale) {
        const xValue = xScale.getValueForPixel(mouseX);
        const yValue = yScale.getValueForPixel(mouseY);
        if (xValue !== undefined && yValue !== undefined && !isNaN(xValue) && !isNaN(yValue)) {
          const novoPonto: Point = {
            x: Math.round(xValue),
            y: Math.round(yValue)
          };
          this.points.push(novoPonto);
          this.atualizarPontos();
          this.limparRota();
        }
      }
    }
  }

  addRandomPoint() {
    const novoPonto: Point = {
      x: Math.floor(Math.random() * 200 - 100),
      y: Math.floor(Math.random() * 200 - 100)
    };
    this.points.push(novoPonto);
    this.atualizarPontos();
    this.limparRota();
  }

  generate20RandomPoints() {
    this.points = [{ x: 0, y: 0 }];
    for (let i = 0; i < 19; i++) {
      this.points.push({
        x: Math.floor(Math.random() * 200 - 100),
        y: Math.floor(Math.random() * 200 - 100)
      });
    }
    this.atualizarPontos();
    this.limparRota();
  }

  clear() {
    this.points = [{ x: 0, y: 0 }];
    this.atualizarPontos();
    this.limparRota();
  }

  optimize() {
    if (this.points.length < 2) return;

    this.routeService.optimize(this.points).subscribe({
      next: (route) => {
        this.optimizedRoute = route;
        this.desenharRota();
      },
      error: (err) => {
        console.error('Backend error:', err);
      }
    });
  }
}