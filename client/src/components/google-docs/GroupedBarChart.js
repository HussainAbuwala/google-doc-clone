import React, { useEffect, useRef } from 'react';
import Chart from "chart.js/auto";

export default function GroupedBarChart({data}) {

    const chartRef = useRef(null);

  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    const labels = data.map(statInfo => statInfo.email)
    const inserts = data.map(statInfo => statInfo.inserts);
    const deletes = data.map(statInfo => statInfo.deletes);
    const edits = data.map(statInfo => statInfo.inserts + statInfo.deletes);
    const formats = data.map(statInfo => statInfo.formats);
    const types = data.map(statInfo => statInfo.types);

    

    const gbc = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Inserts',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
            data: inserts,
          },
          {
            label: 'Deletes',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1,
            data: deletes,
          },
          {
            label: 'Edits',
            backgroundColor: 'rgba(255, 255, 0, 0.2)',
            borderColor: 'rgba(255, 255, 0, 1)',
            borderWidth: 1,
            data: edits,
          },
          {
            label: 'Formats',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            data: formats,
          },
          {
            label: 'Types',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderColor: 'rgba(0, 0, 0, 1)',
            borderWidth: 1,
            data: types,
          }
        ],
      },
      options: {
        
        scales: {
            x: { stacked: false }, // Don't stack on the x-axis
            y: { beginAtZero: true },
        },
      },
    });

    return () => {
        gbc.destroy();
    };

  }, [data]);

  return <canvas ref={chartRef} />;

}
