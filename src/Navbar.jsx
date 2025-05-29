// Navbar.jsx — Sticky navigation for all pages

import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.nav`
  position: sticky;
  top: 0;
  width: 100%;
  background: white;
  color: black;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 2rem;
  border-bottom: 1px solid #ccc;
  z-index: 1000;
`;

const Title = styled.h1`
  font-size: 1.4rem;
  font-family: serif;
`;

const Button = styled.button`
  background: black;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;

  &:hover {
    background: #333;
  }
`;

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  return (
    <Nav>
      <Title>murmur.red</Title>
      {!isHome && <Button onClick={() => navigate('/')}>Back to Overview</Button>}
    </Nav>
  );
}