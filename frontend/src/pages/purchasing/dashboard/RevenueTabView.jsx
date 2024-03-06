import React, { useState } from 'react';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Button from 'react-bootstrap/Button';
import GaugePlot from '../../../components/plots/RevenueGaugePlot';
import ValueIndicator from '../../../components/indicators/ValueIndicator';
import CumulativeRevenuePlot from '../../../components/plots/CumulativeRevenuePlot';

export default function RevenueTabView(props) {
  // unpack the data for each tab
  const { goalsTabData, forecastTabData } = props;

  // unpack the grouped values for each tab
  const { guageValues, shippedValues, revenueValues } = goalsTabData;
  const { plotData, totalValues } = forecastTabData;

  // unpack the individual values from each group
  const { ytdTarget, revenueGoal } = guageValues;
  const { rttShipped, tarShipped, moeBooked } = shippedValues;
  const { ytdPrevRevenue, ytdRevenue, ytdSpent } = revenueValues;
  const { cumulativeSpending, cumulativeRevenue } = plotData;
  const { totalSpending, projectedTotalSpend, totalRevenue } = totalValues;

  // state hook for toggling delta values on/off
  const [showDeltas, setShowDeltas] = useState(true);

  return (
    <Tabs
      defaultActiveKey="goals"
      id="revenue-tab"
      className="mx-2 my-1"
      justify
    >
      <Tab eventKey="goals" title="Goals" className="mx-2 my-1">
        <Container>
          <Row className="justify-content-center">
            <Col className="justify-content-center">
              <GaugePlot
                ytdRevenue={ytdRevenue.toPrecision(3)}
                target={ytdTarget.toPrecision(3)}
                delta={showDeltas ? ytdTarget.toPrecision(3) : null}
                max={revenueGoal}
                title="YTD Shipped Value"
                placement="top"
                info="YTD shipped value show with the target YTD value calculated from the annual goal and delta from target."
              />
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md="auto">
              <Button
                variant="primary"
                size="lg"
                style={{ width: '150px', marginBottom: '10px' }}
                type="submit"
                onClick={() => {
                  setShowDeltas(!showDeltas);
                }}
              >
                {showDeltas ? 'Hide Deltas' : 'Show Deltas'}
              </Button>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md="auto">
              <ValueIndicator
                title="RTT Shipped"
                delta={showDeltas ? rttShipped.prev_total : null}
                value={rttShipped.current_total}
                info="YTD shipped value of Reticle & Test Target Sku's with delta referenced from last year's YTD value."
              />
            </Col>
            <Col md="auto">
              <ValueIndicator
                title="TAR Shipped"
                delta={showDeltas ? tarShipped.prev_total : null}
                value={tarShipped.current_total}
                info="YTD shipped value of Textured-AR Sku's with delta referenced from last year's YTD value."
              />
            </Col>
            <Col md="auto">
              <ValueIndicator
                title="MOE Booked"
                delta={showDeltas ? moeBooked.prev_total : null}
                value={moeBooked.current_total}
                info="YTD value of MOE projects with delta referenced from last year's YTD value."
              />
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md="auto">
              <ValueIndicator
                title="Total Value"
                delta={showDeltas ? ytdPrevRevenue : null}
                width={480}
                value={ytdRevenue}
                info="The total YTD revenue across all product lines with delta referenced from last year's YTD value."
                placement="left"
              />
            </Col>
            <Col md="auto">
              <ValueIndicator
                title="Total Spent"
                delta={showDeltas ? ytdSpent.prev_year : null}
                width={480}
                value={ytdSpent.current_year}
                info="The YTD total of approved purchases with delta referenced from last year's YTD value."
                placement="right"
                inverted
              />
            </Col>
          </Row>
        </Container>
      </Tab>
      {
        // <Tab eventKey="sales" title="Sales" className="mx-2 my-1">
        //   sales data here
        // </Tab>
      }
      <Tab eventKey="forecast" title="Forecast" className="mx-2 my-1">
        <Container>
          <Row className="justify-content-center">
            <Col>
              <CumulativeRevenuePlot
                spending={cumulativeSpending.cumulative_totals}
                predictedSpend={cumulativeSpending.predicted_totals}
                revenue={cumulativeRevenue}
              />
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col>
              <ValueIndicator
                title="Expenses"
                delta={showDeltas ? -projectedTotalSpend : null}
                value={-totalSpending}
                info="The historical total expenses incurred by TSW where the delta is a 30 day, AI-generated spending forecast. Employee salaries are not included."
                inverted
              />
            </Col>
            <Col>
              <ValueIndicator
                title="Shipped Value"
                value={totalRevenue}
                info="The historical grand total of shipped value produced by TSW."
              />
            </Col>
            <Col>
              <ValueIndicator
                title="Net"
                value={totalRevenue - totalSpending}
                info="The value of total shipped value minus total expenses for TSW."
              />
            </Col>
          </Row>
        </Container>
      </Tab>
      {
        // <Tab eventKey="breakdown" title="Breakdown" className="mx-2 my-1">
        //   breakdown info here
        // </Tab>
        // <Tab eventKey="snapshot" title="Snapshot" className="mx-2 my-1">
        //   breakdown info here
        // </Tab>
      }
    </Tabs>
  );
}
