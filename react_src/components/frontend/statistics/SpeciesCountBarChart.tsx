import * as React from 'react';
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
import type { KingdomProps } from '../types';
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);
import { useTranslation } from 'react-i18next';

const options:any = {
  legend: {
    display: true,
    position: 'right',
    labels: {
      padding: 16,
      usePointStyle: true,

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
          display: true,
        },
      ticks: {
        display: true,
        callback: function (value: string) {
          const count = parseInt(value) / 1000;
          return count.toString() + 'k';
        }
      },
    },

    yAxes: {
      grid: {
          display: false,
        },
      ticks: {
        display: true
      }
    },
  },
};

type Props = {
  data: KingdomProps[]
}
const SpeciesCountBarChart: React.VFC<Props> = (props) => {
  const { data } = props;

  const { t, i18n } = useTranslation();
  const countLable = t('物種數')
  const chartData:ChartData<'bar'> = {
    labels: data.map((item) => t(item.name)),
    datasets: [
      {
        label: countLable,
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
