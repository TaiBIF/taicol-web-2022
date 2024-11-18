import * as React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { ChartData, ChartOptions } from 'chart.js';
import { Doughnut  } from 'react-chartjs-2';
import "chartjs-plugin-datalabels";
import ChartDataLabels from "chartjs-plugin-datalabels";
import type { SourceProps } from '../types';
import { Translation } from 'react-i18next';
import { useTranslation } from 'react-i18next';

const colors = [
"#a6cee3",
"#1f78b4",
"#b2df8a",
"#33a02c",
"#fb9a99",
"#e31a1c",
"#fdbf6f",
// "#ff7f00",
"#cab2d6",
"#6a3d9a",
"#ffff99",
"#b15928",
"#d3d3d3"
];

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

// set react chartjs 2 fontsize to 20px
ChartJS.defaults.font.size = 14;
// set react chartjs 2 height of label bar to 5px
ChartJS.defaults.plugins.legend.labels.boxHeight = 6;
ChartJS.defaults.plugins.legend.labels.boxWidth = 25;
ChartJS.defaults.plugins.legend.labels.padding = 20;

export const getTotal = (data:SourceProps[]) => {
  return data.reduce((a, r): number => {
    const count =r.count as number
    const total = a + count
    return total
  }, 0)

}
const getOptions = (data: SourceProps[],total:number):ChartOptions<'doughnut'> => {
  return {
    plugins: {
      datalabels: {
        display: function(context:any) {
          return  Math.ceil(context.dataset.data[context.dataIndex] / total * 100) >= 2; // or >= 1 or ...
        },
        color: "#000",
        font: {
          size: 10,
          weight: "bold"
        },
        formatter: (value: number,) => {
          return Math.ceil(value / total * 100)+ "%"
        }
      }
    }
  }
}

type Props = {
  data: SourceProps[]
}

const RedlistDoughnutChart: React.FC<Props> = (props) => {
  const { data } = props;
  const total = getTotal(data)
  const { t, i18n } = useTranslation();

  const chartData:ChartData<'doughnut'> = {
    labels: data.map((item) => t(item.name)),
    datasets: [
      {
        data: data.map((item) => item.count),
        backgroundColor: colors,
        borderWidth: 0,
      },

    ]
  }
  const options:ChartOptions<'doughnut'> = getOptions(data,total);
  return (
    <div className="item-p1">
      <div className="mark-title mb-0">
        <img src="/static/image/title-mark.svg"/>
        <Translation>{ t =>
        <p>{t('臺灣紅皮書評估統計')}</p>
        }</Translation>
      </div>
      <div className="mark-title-note">
      <Translation>{ t =>
        <p>{t('單位：種 / 種下')}</p>
      }</Translation>
      </div>
      <div className="for-canvas doughnut">
        <Doughnut data={chartData}  options={options}  />
      </div>
  </div>
  )
};

export default RedlistDoughnutChart;
