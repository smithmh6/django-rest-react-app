import React from 'react';
import Plot from 'react-plotly.js';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

export default function ValueIndicator(props) {
  const { title, delta, value, width, inverted, info, placement } = props;

  return (
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
        style={{
          borderRadius: '25px',
          background: '#FFFFFF40',
          margin: '5px 0px 10px 5px',
        }}
      >
        <Plot
          style={{
            margin: 'auto',
            padding: '5px 5px 5px 5px',
            width: `${width || 310}px`,
          }}
          data={[
            {
              type: 'indicator',
              mode: delta ? 'number+delta' : 'number',
              value,
              number: {
                prefix: '$',
                font: {
                  // eslint-disable-next-line no-nested-ternary
                  color: '#E0E0E0',
                  size: 46,
                },
                valueformat: '.4s',
              },
              delta: {
                position: 'top',
                reference: delta,
                increasing: { color: inverted ? '#f53131' : '#8CBD18' },
                decreasing: { color: inverted ? '#8CBD18' : '#f53131' },
                valueformat: '.3s',
              },
              domain: { x: [0, 1], y: [0, 1] },
            },
          ]}
          layout={{
            title: {
              text: title,
              y: 0.9,
              font: {
                size: 28,
                color: '#E0E0E0',
              },
            },
            paper_bgcolor: 'rgba(0,0,0,0)',
            width: width ? width - 10 : 300,
            height: 140,
            margin: { t: 60, r: 0, l: 0, b: 30 },
          }}
          config={{ displayModeBar: false }}
        />
      </div>
    </OverlayTrigger>
  );
}
