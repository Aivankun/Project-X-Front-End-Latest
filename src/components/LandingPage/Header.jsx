// src/components/LandingPage/Header.jsx
import React from 'react';
import { Navbar, Container, Button } from 'react-bootstrap';
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
          />
          <div>
            <div className="logoname">HR-HATCH</div>
            <small className="sublogoname">The Tech Behind Talent.</small>
          </div>
        </Navbar.Brand>
        <Button href="/login" className="btn-login d-flex align-items-center justify-content-center">
          Login
        </Button>
      </Container>
    </Navbar>
  );
};

export default Header;
