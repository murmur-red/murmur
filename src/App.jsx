// App.jsx — 'murmur' locked center, poetic lines appear below

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
gsap.registerPlugin(ScrollToPlugin);
import styled from 'styled-components';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ComingSoon from "./pages/ComingSoon";

const Main = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  font-family: serif;
`;

const Scene = styled.section`
  height: 100vh;
  width: 100vw;
  background: black;
  color: white;
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 1;
  pointer-events: none;
  z-index: 0;
`;

const ActiveScene = styled(Scene)`
  opacity: 1;
  pointer-events: auto;
  z-index: 1;
`;

const MurmurContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 2;
`;

const LinesContainer = styled.div`
  position: absolute;
  top: calc(50% + 5rem);
  left: 50%;
  transform: translateX(-50%);
  width: 70vw;
  text-align: center;
  z-index: 1;
`;

const Title = styled.h1`
  font-size: 3rem;
  pointer-events: none;
`;

const AboutLine = styled.h1`
  font-size: 1.5rem;
  font-weight: normal;
  line-height: 1.3;
  margin-top: 1.5rem;
  pointer-events: none;
`;

const CursorDot = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: white;
  pointer-events: none;
  z-index: 100;
  mix-blend-mode: difference;
  opacity: 1;
  transition: opacity 0.3s ease;
`;

const ScrollHint = styled.div`
  position: absolute;
  bottom: 5vh;
  left: 50%;
  transform: translateX(-50%);
  font-size: 2rem;
  opacity: 0;
  z-index: 2;
  pointer-events: auto;
  cursor: pointer;
  animation: float 2s ease-in-out infinite;

  @keyframes float {
    0% { transform: translateX(-50%) translateY(0); }
    50% { transform: translateX(-50%) translateY(10px); }
    100% { transform: translateX(-50%) translateY(0); }
  }
`;

const Header = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  z-index: 50;
  color: white;
  font-size: 0.9rem;
  pointer-events: none;
`;

const HeaderLeft = styled.div`
  pointer-events: auto;
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-style: italic;
  font-weight: 500;
  text-transform: lowercase;
  gap: 0.75rem;
  .arrow {
    display: inline-block;
    transition: transform 0.3s ease;
  }
  &:hover .arrow {
    transform: translateX(6px);
  }
`;

function App() {
  const cursorRef = useRef(null);
  const scrollHintRef = useRef(null);
  const sceneRefs = useRef([]);
  const currentScene = useRef(0);
  const [transitioning, setTransitioning] = useState(false);
  const [bitcoinPrice, setBitcoinPrice] = useState(null);
  const [aboutLines, setAboutLines] = useState('');
  const [isReady, setIsReady] = useState(false);
  const videos = [
    null,
    "/videos/video1.mp4",
    "/videos/video2.mp4",
    "/videos/video3.mp4",
    "/videos/video4.mp4",
    "/videos/video5.mp4",
    "/videos/video6.mp4",
    "/videos/video7.mp4",
  ];

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      gsap.to(cursorRef.current, {
        x: clientX - 6,
        y: clientY - 6,
        duration: 0.2,
        ease: "power3.out",
      });
    };
    gsap.to(scrollHintRef.current, {
      opacity: 1,
      delay: 3,
      duration: 1,
      ease: "power2.out",
    });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Disable scroll
  useEffect(() => {
    const disableScroll = (e) => e.preventDefault();
    window.addEventListener("wheel", disableScroll, { passive: false });
    return () => window.removeEventListener("wheel", disableScroll);
  }, []);

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd")
      .then(res => res.json())
      .then(data => {
        setBitcoinPrice(`$${data.bitcoin.usd}`);
      })
      .catch(() => {
        setBitcoinPrice("N/A");
      });
  }, []);

  useEffect(() => {
    fetch('http://localhost:4000/api/openai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    })
      .then(res => res.json())
      .then(data => {
        setAboutLines(data.result || '...');
      })
      .catch(() => {
        setAboutLines('Woke up in the wrong API\nBut still showed up glowing.');
      });
  }, []);

  return (
    <Main>
      {/*
      <Header>
        <HeaderLeft>
          <span style={{ fontSize: '1.6rem', marginRight: '0.4rem' }}>about</span>
          <span className="arrow" style={{ fontSize: '1rem' }}>→</span>
        </HeaderLeft>
        <div></div>
      </Header>
      */}

      {videos.map((src, i) => {
        const isFirst = i === 0;
        return isFirst ? (
          <ActiveScene key={i} ref={(el) => (sceneRefs.current[i] = el)}>
            <CursorDot ref={cursorRef} />
            <MurmurContainer>
              <Title>murmur</Title>
            </MurmurContainer>
            <LinesContainer>
              {aboutLines
                .split(/\n+/)
                .map((line, index) => line.replace(/^\d+\.\s*/, ''))
                .filter(Boolean)
                .map((line, index) => (
                  <AboutLine key={index}>{line}</AboutLine>
                ))}
            </LinesContainer>
            <ScrollHint ref={scrollHintRef}>▾</ScrollHint>
          </ActiveScene>
        ) : (
          <Scene key={i} ref={(el) => (sceneRefs.current[i] = el)}>
            <video
              src={src}
              autoPlay
              loop
              muted
              playsInline
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          </Scene>
        );
      })}
    </Main>
  );
}

export default App;