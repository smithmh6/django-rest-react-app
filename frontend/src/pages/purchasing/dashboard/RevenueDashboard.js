import React, { Component } from 'react';
import { MsalContext } from '@azure/msal-react';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Container from 'react-bootstrap/Container';
import { config } from '../../../Settings';
import withRouter from '../../../common/withRouter';
import RequestService from '../../../services/requests/RequestService';
import RevenueTabView from './RevenueTabView';

const sleep = (ms) => {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
};

class RevenueDashboard extends Component {
  static contextType = MsalContext;

  static revenueGoal = 2000000;

  static ytdTarget = Math.floor(
    RevenueDashboard.yearPercent(new Date()) * RevenueDashboard.revenueGoal
  );

  // Method that takes in a date and returns
  // what % of the current year has passed by that date
  static yearPercent(date) {
    const yearOfDate = date.getFullYear();
    const startOfYear = new Date(yearOfDate, 0, 0);
    const diffInMs = date - startOfYear;
    const msInDay = 1000 * 60 * 60 * 24; // ms, seconds, minute, hours
    // Account for leap years
    const daysInYear =
      (yearOfDate % 4 === 0 && yearOfDate % 100 > 0) || yearOfDate % 400 === 0
        ? 366
        : 365;
    const daysPassed = Math.floor(diffInMs / msInDay);
    return daysPassed / daysInYear;
  }

  static asCurrency(number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      compactDisplay: 'long',
      minimumFractionDigits: 2,
    }).format(number);
  }

  constructor(props) {
    super(props);
    this.state = {
      isFetching: true,
      percentLoaded: 0,
      moeBooked: null,
      rttShipped: null,
      tarShipped: null,
      ytdSpent: null,
      ytdRevenue: null,
      ytdPrevRevenue: null,
    };
  }

  componentDidMount() {
    // After mounting, fetch API data
    this.fetchData();
  }

  fetchData = async () => {
    this.setState({ isFetching: true });

    const cumulativeSpendingUrl = `${config.url}/api/dashboards/cumulative-spending`;
    const cumulativeRevenueUrl = `${config.url}/api/dashboards/cumulative-revenue`;
    const moeBookedUrl = `${config.url}api/dashboards/moe-revenue/`;
    const rttShippedUrl = `${config.url}api/batches/reticle/ship/ytd-value/`;
    const tarShippedUrl = `${config.url}api/dashboards/textured_ar/ytd-value/`;
    const totalSpendingUrl = `${config.url}api/dashboards/ytd-spending/`;

    try {
      const [
        cumulativeSpending,
        cumulativeRevenue,
        moeBooked,
        rttShipped,
        tarShipped,
        ytdSpent,
      ] = await Promise.all([
        RequestService.makeRequest('GET', cumulativeSpendingUrl),
        RequestService.makeRequest('GET', cumulativeRevenueUrl),
        RequestService.makeRequest('GET', moeBookedUrl),
        RequestService.makeRequest('GET', rttShippedUrl),
        RequestService.makeRequest('GET', tarShippedUrl),
        RequestService.makeRequest('GET', totalSpendingUrl),
      ]);

      // eslint-disable-next-line no-plusplus
      for (let i = 1; i < 5; i++) {
        this.setState({ percentLoaded: (i * 100) / 5 });
        // eslint-disable-next-line no-await-in-loop
        await sleep(500);
      }

      this.setState({
        isFetching: false,
        percentLoaded: 100,
        cumulativeSpending,
        cumulativeRevenue,
        moeBooked,
        rttShipped,
        tarShipped,
        ytdSpent,
        ytdRevenue:
          rttShipped.current_total +
          tarShipped.current_total +
          moeBooked.current_total,
        ytdPrevRevenue:
          rttShipped.prev_total + tarShipped.prev_total + moeBooked.prev_total,
      });
    } catch (error) {
      console.error(error);
      this.setState({ isFetching: false });
    }
  };

  render() {
    if (this.state.isFetching)
      return (
        <Container
          className="d-flex flex-column min-vh-100 justify-content-center align-items-center"
          fluid="xxl"
        >
          <ProgressBar
            animated
            variant="success"
            style={{ height: '45px', width: '75vw', fontSize: '20px' }}
            now={this.state.percentLoaded}
            label={`${this.state.percentLoaded}%`}
          />
        </Container>
      );

    // unpack the values to pass to the tabbed view
    const {
      cumulativeSpending,
      cumulativeRevenue,
      rttShipped,
      tarShipped,
      moeBooked,
      ytdRevenue,
      ytdPrevRevenue,
      ytdSpent,
    } = this.state;

    // extract total spending from last cumulativeSpending value
    const totalSpending =
      cumulativeSpending.cumulative_totals[
        cumulativeSpending.cumulative_totals.length - 1
      ].cumulative_total;

    // extract projected total from last cumulativeSpending prediction
    const projectedTotalSpend =
      cumulativeSpending.predicted_totals[
        cumulativeSpending.predicted_totals.length - 1
      ].cumulative_total;

    // extract total revenue from last cumulativeRevenue value
    const totalRevenue =
      cumulativeRevenue[cumulativeRevenue.length - 1].cumulative_total;

    const { ytdTarget, revenueGoal } = RevenueDashboard;

    // collect the prepared data to send through to RevenueTabView component
    const goalsTabData = {
      guageValues: { ytdTarget, revenueGoal },
      shippedValues: { rttShipped, tarShipped, moeBooked },
      revenueValues: { ytdPrevRevenue, ytdRevenue, ytdSpent },
    };
    const forecastTabData = {
      plotData: { cumulativeSpending, cumulativeRevenue },
      totalValues: { totalSpending, projectedTotalSpend, totalRevenue },
    };
    // const salesTabData = {};  // not yet implemented
    // const breakdownTabData = {};  // not yet implemented
    // const snapshotTabData = {};  // not yet implemented

    return (
      <RevenueTabView
        goalsTabData={goalsTabData}
        forecastTabData={forecastTabData}
      />
    );
  }
}

export default withRouter(RevenueDashboard);
