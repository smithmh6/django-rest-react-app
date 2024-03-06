import React from 'react';
import Plot from 'react-plotly.js';

// default color sequence
// '#1f77b4',  // muted blue
// '#ff7f0e',  // safety orange
// '#2ca02c',  // cooked asparagus green
// '#d62728',  // brick red
// '#9467bd',  // muted purple
// '#8c564b',  // chestnut brown
// '#e377c2',  // raspberry yogurt pink
// '#7f7f7f',  // middle gray
// '#bcbd22',  // curry yellow-green
// '#17becf'   // blue-teal

export default function CumulativeRevenuePlot({
  spending,
  revenue,
  predictedSpend,
}) {
  const xValues1 = spending.map((point) => point.requested);
  const yValues1 = spending.map((point) => point.cumulative_total);

  const xPredSpend = predictedSpend.map((point) => point.requested);
  const yPredSpend = predictedSpend.map((point) => point.cumulative_total);

  const xValues2 = revenue.map((point) => point.date);
  const yValues2 = revenue.map((point) => point.cumulative_total);

  const trace1 = {
    x: xValues1,
    y: yValues1,
    mode: 'lines',
    line: {
      color: '#d62728',
      width: 3,
      shape: 'spline',
    },
    name: 'Expenses',
  };

  const trace1a = {
    x: xPredSpend,
    y: yPredSpend,
    mode: 'lines',
    line: {
      color: '#d62728',
      width: 3,
      shape: 'spline',
      dash: 'dot',
    },
    name: 'Projected (Exp.)',
  };

  const trace2 = {
    x: xValues2,
    y: yValues2,
    mode: 'lines',
    line: {
      color: '#8CBD18',
      width: 3,
      shape: 'spline',
    },
    name: 'Shipped',
  };

  const trace2a = {
    x: ['9-14-2023'],
    y: [4000000],
    mode: 'lines',
    line: {
      color: '#8CBD18',
      width: 3,
      shape: 'spline',
      dash: 'dot',
    },
    name: 'Projected (Sh.)',
  };

  return (
    <div
      style={{
        display: 'block',
        margin: 'auto',
        padding: '5px 5px 5px 5px',
        width: '1290px',
        border: '2px solid #FFFFFF40',
        borderRadius: '25px',
      }}
    >
      <Plot
        data={[trace1, trace1a, trace2, trace2a]}
        layout={{
          title: {
            text: 'Expenses & Shipped Value',
            font: {
              size: 28,
              color: '#E0E0E0',
            },
          },
          width: 1290,
          height: 500,
          paper_bgcolor: 'rgba(0,0,0,0)',
          plot_bgcolor: 'rgba(0,0,0,0)',
          font: { color: '#E0E0E0', family: 'Arial', size: 16 },
          margin: { t: 60, r: 60, l: 80, b: 30 },
          xaxis: {
            gridcolor: '#FFFFFF40',
          },
          legend: {
            x: 0,
            y: 1,
          },
          yaxis: {
            title: 'Daily Total ($)',
            gridcolor: '#FFFFFF40',
          },
        }}
        config={{ displayModeBar: false }}
      />
    </div>
  );
}
