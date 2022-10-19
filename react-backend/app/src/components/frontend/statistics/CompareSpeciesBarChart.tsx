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
import type { SpeciesCompareProps } from 'src/types/frontend';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const options = {
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
  data: SpeciesCompareProps[]
}
const CompareSpeciesBarChart: React.VFC<Props> = (props) => {
  const { data } = props;

  const chartData:ChartData<'bar'> = {
    labels: data.map((item) => item.name),
    datasets: [
      {
        label: '全球現有種數',
        data: data.map((item) => item.GlobalCount || 0),
        backgroundColor: '#85BBD0',
        borderWidth: 0,
      }
      ,{
        label: '臺灣現有種數',
        data:  data.map((item) => item.TaiwanCount || 0),
        backgroundColor: '#FDD440',
        borderWidth: 0,
      }
    ]
  }

  return (
   <Bar data={chartData}  options={options}  />
  )
};

export default CompareSpeciesBarChart;
