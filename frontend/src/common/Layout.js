import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import {
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  // useIsAuthenticated,
} from '@azure/msal-react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import SignInButton from '../components/buttons/SignInButton';
import SignOutButton from '../components/buttons/SignOutButton';
import NavBarIconButton from '../components/buttons/NavBarIconButton';

// this is where you should build the main page layout
// outlet serves as a placeholder where child pages
// will be rendered on demand
function Layout() {
  // const isAuthenticated = useIsAuthenticated();

  return (
    <>
      <AuthenticatedTemplate>
        <Navbar expand="lg" className="bg-body-tertiary" sticky="top">
          <Container fluid="fluid">
            <Navbar.Brand href="https://www.thorlabs.com/">
              <img
                src="/ezra_logo.png"
                width="30"
                height="30"
                alt="Thorlabs Inc Logo"
                className="d-inline-block align-top"
              />{' '}
              Thorlabs Spectral Works
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link href="#home">Home</Nav.Link>
                <NavDropdown title="Purchases" id="basic-nav-dropdown">
                  <NavDropdown.Item as={Link} to="purchases/dashboard">
                    Dashboard
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="/purchases/user-requests">
                    Requests
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/purchases/authorization-requests">
                    Authorizations
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/purchases/approval-requests">
                    Approvals
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="/purchases/purchasing">
                    Purchasing
                  </NavDropdown.Item>
                  <NavDropdown.Item href="/purchases/receiving">
                    Receiving
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#">Customers</NavDropdown.Item>
                  <NavDropdown.Item href="#">Vendors</NavDropdown.Item>
                  <NavDropdown.Item href="#">Groups</NavDropdown.Item>
                  <NavDropdown.Item href="#">Projects</NavDropdown.Item>
                  <NavDropdown.Item href="#">Categories</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="Reticle" id="basic-nav-dropdown">
                  <NavDropdown.Item href="#">Dashboard</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item to="batches/coat" as={Link}>
                    Coat
                  </NavDropdown.Item>
                  <NavDropdown.Item to="batches/sheet" as={Link}>
                    Sheet
                  </NavDropdown.Item>
                  <NavDropdown.Item to="batches/dice" as={Link}>
                    Dice
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item to="/skus/reticle/rawmaterial" as={Link}>
                    RM SKUs
                  </NavDropdown.Item>
                  <NavDropdown.Item to="/skus/reticle/coat" as={Link}>
                    Coat SKUs
                  </NavDropdown.Item>
                  <NavDropdown.Item to="/skus/reticle/sheet" as={Link}>
                    Sheet SKUs
                  </NavDropdown.Item>
                  <NavDropdown.Item to="/skus/reticle/dice" as={Link}>
                    Dice SKUs
                  </NavDropdown.Item>
                  <NavDropdown.Item to="/skus/reticle/finalproduct" as={Link}>
                    FP SKUs
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item to="/skus/reticle/photomask" as={Link}>
                    Photomasks
                  </NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="Textured" id="basic-nav-dropdown">
                  <NavDropdown.Item href="#">Dashboard</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item to="batches/tar-batches" as={Link}>
                    Batches
                  </NavDropdown.Item>
                  <NavDropdown.Item to="/skus/textured-ar/" as={Link}>
                    SKUs
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item to="textured-ar/etching" as={Link}>
                    Etching
                  </NavDropdown.Item>
                  <NavDropdown.Item to="failcodes/textured-ar" as={Link}>
                    Failcodes
                  </NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="MOE" id="basic-nav-dropdown">
                  <NavDropdown.Item href="#">Projects</NavDropdown.Item>
                  <NavDropdown.Item href="#">Payments</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item href="#">MOEs</NavDropdown.Item>
                  <NavDropdown.Item href="#">Customer Data</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="Services" id="basic-nav-dropdown">
                  <NavDropdown.Item href="#">Create</NavDropdown.Item>
                  <NavDropdown.Item href="#">Update</NavDropdown.Item>
                  <NavDropdown.Item href="#">Search</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="Shipments" id="basic-nav-dropdown">
                  <NavDropdown.Item to="shipments/create" as={Link}>
                    Create
                  </NavDropdown.Item>
                  <NavDropdown.Item to="shipments/" as={Link}>
                    Update
                  </NavDropdown.Item>
                  <NavDropdown.Item href="#">Search</NavDropdown.Item>
                </NavDropdown>
                <NavDropdown title="Database" id="basic-nav-dropdown">
                  <NavDropdown.Item href="#">Optics</NavDropdown.Item>
                  <NavDropdown.Item href="#">Images</NavDropdown.Item>
                  <NavDropdown.Item href="#">Instruments</NavDropdown.Item>
                  <NavDropdown.Item href="#">Samples</NavDropdown.Item>
                  <NavDropdown.Item href="#">Spectra</NavDropdown.Item>
                  <NavDropdown.Item href="#">Substrates</NavDropdown.Item>
                </NavDropdown>
              </Nav>
              <NavBarIconButton
                imgSource="/notify_dark_50x50.png"
                tooltipText="Notifications"
                altText="Notification Icon"
              />
              <NavBarIconButton
                imgSource="/gear_dark_50x50.png"
                tooltipText="Settings"
                altText="Settings Icon"
              />
              <NavBarIconButton
                imgSource="/bug_dark_50x50.png"
                tooltipText="Bugs"
                altText="Bugs Icon"
                linkUrl="/request-maintenance/"
              />
              <NavBarIconButton
                imgSource="/comment_dark_50x50.png"
                tooltipText="Feedback"
                altText="Feedback Icon"
              />
              <NavBarIconButton
                imgSource="/help_dark_50x50.png"
                tooltipText="Help"
                altText="Help Icon"
              />
              <SignOutButton />
            </Navbar.Collapse>
          </Container>
        </Navbar>
        <Outlet />
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <div
          style={{
            backgroundImage: 'url(/TSW_ThorSign-76x136_v2.png)',
            backgroundPosition: 'center',
            backgroundSize: 'contain',
            width: '100vw',
            height: '100vh',
          }}
        >
          <Container
            className="d-flex flex-column min-vh-100 justify-content-center align-items-center"
            fluid="xxl"
          >
            <SignInButton />
          </Container>
        </div>
      </UnauthenticatedTemplate>
    </>
  );
}

export default Layout;
