// lib/chart-setup.ts
// Chart.js setup and registration

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  LineController,
  BarController,
  DoughnutController,
  Title,
  Tooltip,
  Legend,
  Filler,
  type ChartOptions,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

// Register ALL Chart.js components including controllers
ChartJS.register(
  // Scales
  CategoryScale,
  LinearScale,
  // Elements
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  // Controllers (REQUIRED for chart types)
  LineController,
  BarController,
  DoughnutController,
  // Plugins
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartDataLabels
);

export { ChartJS };
export type { ChartOptions };
