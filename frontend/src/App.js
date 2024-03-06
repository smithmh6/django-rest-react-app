import React, { Component } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './common/Layout';
import Plates from './pages/Plates';
import Batches from './pages/Batches';
import Parts from './pages/Parts';
import Skus from './pages/Skus';
import SkuForm from './components/forms/SkuForm';
// import MaintenanceForm from './components/forms/MaintenanceForm';
// import MOEProjectForm from './components/forms/MOEProjectForm';
// import CustomerForm from './components/forms/CustomerForm';
// import MOEPaymentForm from './components/forms/MOEPaymentForm';
import RevenueDashboard from './pages/purchasing/dashboard/RevenueDashboard';
import TARBatchList from './pages/TARBatch/List';
import TARBatchDetail from './pages/TARBatch/Detail';
import ShipmentList from './pages/Shipment/List';
import ShipmentCreate from './pages/Shipment/Create';
import ShipmentDetail from './pages/Shipment/Detail';
import PurchaseRequests from './pages/purchasing/requests/PurchaseRequests';
import PurchaseRequestDetail from './pages/purchasing/requests/PurchaseRequestDetail';
import AuthorizationRequests from './pages/purchasing/authorizations/AuthorizationRequests';
import AuthorizationRequestDetail from './pages/purchasing/authorizations/AuthorizationRequestDetail';
import ApprovalRequests from './pages/purchasing/approvals/ApprovalRequests';
import ApprovalRequestDetail from './pages/purchasing/approvals/ApprovalRequestDetail';
import Purchasing from './pages/purchasing/transactions/Purchasing';
import Receiving from './pages/purchasing/transactions/Receiving';
import TAREtching from './pages/TAREtching/TAREtching';
import TARFails from './pages/TARFails/TARFails';
import TARSKUs from './pages/TARSKU/TARSKUs';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="batches/tar-batches" element={<TARBatchList />} />
            <Route
              path="batches/tar-batches/:id"
              element={<TARBatchDetail />}
            />
            <Route path="skus/textured-ar/" element={<TARSKUs />} />
            <Route path="textured-ar/etching" element={<TAREtching />} />
            <Route path="failcodes/textured-ar" element={<TARFails />} />
            <Route path="batches/:batchType" element={<Batches />} />
            <Route
              path="batches/:batchType/:batchId/:batchView"
              element={<Plates />}
            />
            <Route
              path="batches/:batchType/:batchId/:batchView/:plateId/:parts"
              element={<Parts />}
            />

            <Route path="skus/:productLine/:skuType" element={<Skus />} />
            <Route
              path="skus/:productLine/:skuType/create"
              element={<SkuForm />}
            />
            {
              // <Route path="purchases/add-customer" element={<CustomerForm />} />
              // <Route
              //   path="purchases/add-moe-project"
              //   element={<MOEProjectForm />}
              // />
              // <Route
              //   path="purchases/add-moe-payment"
              //   element={<MOEPaymentForm />}
              // />
            }
            <Route
              path="purchases/user-requests"
              element={<PurchaseRequests />}
            />
            <Route
              path="purchases/requests/:id"
              element={<PurchaseRequestDetail />}
            />
            <Route
              path="purchases/authorization-requests"
              element={<AuthorizationRequests />}
            />
            <Route
              path="purchases/authorizations/:id"
              element={<AuthorizationRequestDetail />}
            />
            <Route
              path="purchases/approval-requests"
              element={<ApprovalRequests />}
            />
            <Route
              path="purchases/approvals/:id"
              element={<ApprovalRequestDetail />}
            />
            <Route path="purchases/purchasing" element={<Purchasing />} />
            <Route path="purchases/receiving" element={<Receiving />} />
            <Route path="purchases/dashboard" element={<RevenueDashboard />} />

            {
              // <Route path="purchases/:viewType" element={<Purchases />} />
            }

            {
              // <Route
              //   path="purchases/:viewType/create"
              //   element={<PurchaseForm />}
              // />
            }

            <Route path="shipments" element={<ShipmentList />} />
            <Route path="shipments/create" element={<ShipmentCreate />} />
            <Route path="shipments/:id" element={<ShipmentDetail />} />

            {
              // <Route path="request-maintenance" element={<MaintenanceForm />} />
            }
          </Route>
        </Routes>
      </BrowserRouter>
    );
  }
}

export default App;
