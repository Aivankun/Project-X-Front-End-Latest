// src/components/LandingPage/Header.jsx
import React from 'react';
import { Navbar, Container } from 'react-bootstrap';
import logo from '../../assets/logo.png';

const Header = () => {
  return (
    <Navbar>
      <Container>
        <Navbar.Brand href="/" className="d-flex align-items-center">
          <img
            src={logo}
            alt="Logo"
            width="75"
            height="75"
            className=""
          />
          <div>
            <div className="logoname">HR-HATCH</div>
            <small className="sublogoname">The Tech Behind Talent.</small>
          </div>
        </Navbar.Brand>
      </Container>
    </Navbar>
  );
};

export default Header;
