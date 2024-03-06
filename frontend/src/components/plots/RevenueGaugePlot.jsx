import React from 'react';
import Plot from 'react-plotly.js';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

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

export default function GaugePlot(props) {
  const { ytdRevenue, target, max, title, placement, info, delta } = props;

  return (
    <div
      style={{
        display: 'block',
        margin: 'auto',
        padding: '8px 5px 0px 5px',
        width: '800px',
      }}
    >
      <OverlayTrigger
        placement={placement}
        delay={{ show: 2000, hide: 0 }}
        overlay={
          <Tooltip id="button-tooltip-2" style={{ position: 'fixed' }}>
            {info}
          </Tooltip>
        }
      >
        <div
          id="hoverZone"
          style={{
            width: '300px',
            height: '150px',
            zIndex: '10',
            position: 'absolute',
            marginLeft: '250px',
            marginTop: '225px',
            borderRadius: '50px',
          }}
        />
      </OverlayTrigger>
      <Plot
        data={[
          {
            type: 'indicator',
            mode: 'gauge+number+delta',
            value: ytdRevenue, // from props
            delta: {
              position: 'top',
              reference: delta,
              increasing: { color: '#8CBD18' },
              decreasing: { color: '#f53131' },
              valueformat: '.3s',
              font: { size: 28 },
            },
            gauge: {
              axis: {
                visible: true,
                tick0: 0,
                tickmode: 'array',
                tickvals: [0, target, max],
                tickfont: {
                  size: 24,
                  color: '#E0E0E0',
                },
                tickprefix: '$',
                range: [0, max], // from props
              },
              bar: { color: '#e41b23', thickness: 0.9 },
              bgcolor: '#FFFFFF10',
              borderwidth: 2,
              bordercolor: 'gray',
              threshold: {
                line: { color: '#1f77b4', width: 8 },
                thickness: 1,
                value: target, // target from props
              },
            },
            number: {
              prefix: '$',
              font: { color: '#E0E0E0' },
            },
          },
        ]}
        layout={{
          title: {
            text: title,
            y: 0.97,
            font: {
              size: 28,
              color: '#E0E0E0',
            },
          },
          width: 790, // width - left+right padding
          height: 400,
          margin: { t: 30, r: 80, l: 80, b: 0 },
          paper_bgcolor: 'rgba(0,0,0,0)',
          font: { color: 'white', family: 'Arial' },
        }}
        config={{ displayModeBar: false }}
      />
    </div>
  );
}
