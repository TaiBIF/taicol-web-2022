import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartData } from 'chart.js';
import { Bar  } from 'react-chartjs-2';
import "chartjs-plugin-datalabels";
import type { KingdomProps } from 'src/types/frontend';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
  legend: {
    display: true,
    position: 'right',
    labels: {
      padding: 16,
      usePointStyle: true,
      generateLabels: function() {
        const labels = [
          {text:'dsfd'},
          {text:'fsdf'},
          {text:'sdfsdf'}
        ];
        return labels;
      }
    }
  },
  indexAxis: 'y' as const,
  plugins: {
    datalabels: { display: false },
    title: {
      display: false,
    },
    legend: {
      display: false
    }
  },
  responsive: true,
  redraw: true,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  scales: {
    xAxes: {
      grid: {
          display: false,
        },
      ticks: {
        display: true,
      },
    },
  },
};

type Props = {
  data: KingdomProps[]
}
const SpeciesCountBarChart: React.VFC<Props> = (props) => {
  const { data } = props;

  const chartData:ChartData<'bar'> = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        label: '全球現有種數',
        data: data.map((item) => item.count),
        backgroundColor: '#85BBD0',
        borderWidth: 0,
      }
    ]
  }

  return (
   <Bar data={chartData}  options={options}  />
  )
};

export default SpeciesCountBarChart;
