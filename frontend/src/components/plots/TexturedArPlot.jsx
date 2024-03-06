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

export default function TexturedArPlot(props) {
  const { plotData } = props;

  const makeDataList = (inputData) =>
    inputData.map((obj) => ({
      x: obj.xdata,
      y: obj.ydata,
      name: obj.serial,
      type: 'scatter',
      showlegend: true,
    }));

  return (
    <div>
      <Plot
        data={makeDataList(plotData)}
        layout={{
          title: 'Spectral Data',
          width: 1100,
          height: 650,
          paper_bgcolor: '#0D0D0D',
          plot_bgcolor: '#252525',
          legend: { tracegroupgap: 255, font: { color: '#FFFFFF' } },
          margin: { t: 25, b: 35 },
          shapes: [
            {
              type: 'line',
              x0: 400,
              y0: 0.98,
              x1: 1650,
              y1: 0.98,
              line: {
                color: '#d62728',
                width: 5,
                dash: 'longdash',
              },
            },
          ],
        }}
      />
    </div>
  );
}
