import React, { useEffect, useRef } from 'react';
import { Chart, LinearScale, CategoryScale } from 'chart.js/auto';
import { BoxPlotController, BoxAndWiskers } from '@sgratzl/chartjs-chart-boxplot';

Chart.register(BoxPlotController, BoxAndWiskers, LinearScale, CategoryScale);

export default function BoxPlot({data}) {
    const chartRef = useRef(null);

    useEffect(() => {
      const ctx = chartRef.current.getContext('2d');

      const boxplotData = {
        labels: ['Inserts', 'Deletes', 'Edits','Formats', 'Types'],
        datasets: [{
            label: '',
            backgroundColor: 'rgba(255,0,0,0.5)',
            borderColor: 'red',
            borderWidth: 1,
            outlierColor: '#999999',
            padding: 10,
            itemRadius: 0,
            data: [
                data.map(statInfo => statInfo.inserts), 
                data.map(statInfo => statInfo.deletes),
                data.map(statInfo => statInfo.inserts + statInfo.deletes),
                data.map(statInfo => statInfo.formats),
                data.map(statInfo => statInfo.types),
            ]
        }]
      }
  
      const bp = new Chart(ctx, {
        type: 'boxplot',
        data: boxplotData,
        options: {
          responsive: true,
        },
      });

      return () => {
        bp.destroy();
    };

    }, [data]);
  
    return <canvas ref={chartRef} />;
}
