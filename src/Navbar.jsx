import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const NavBar = styled.nav`
  padding: 1.5rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-family: serif;
  font-size: 1.2rem;
  background: var(--bg);
  color: var(--text);
  transition: background 0.3s ease, color 0.3s ease;
`;

const Logo = styled.span`
  font-weight: bold;
  font-size: 1.4rem;
  cursor: pointer;
  color: var(--text);
`;

const Button = styled.button`
  background: var(--text);
  color: var(--bg);
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.3s ease, color 0.3s ease;
`;

const Toggle = styled.button`
  background: transparent;
  color: var(--text);
  border: 1px solid currentColor;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  margin-left: 1rem;
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.8;
  }
`;

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  const [darkMode, setDarkMode] = useState(
    localStorage.getItem('theme') === 'dark'
  );

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  return (
    <NavBar>
      <Logo onClick={() => navigate('/')}>murmur.red</Logo>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {!isHome && (
          <Button onClick={() => navigate('/')}>Back to Overview</Button>
        )}
        <Toggle onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? '☀ Light' : '🌙 Dark'}
        </Toggle>
      </div>
    </NavBar>
  );
}
