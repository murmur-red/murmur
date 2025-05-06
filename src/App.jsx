// App.jsx

import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import styled from 'styled-components';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ComingSoon from "./pages/ComingSoon";


// ========== Styled Components ==========

const Main = styled.div`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  position: relative;
  font-family: serif;

  @keyframes flashline-left {
    0% { transform: translateX(100%); }
    100% { transform: translateX(0); }
  }

  @keyframes flashline-right {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(0); }
  }
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

const BoundingBox = styled.div`
  width: 50vw;
  height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const Title = styled.h1`
  font-size: 3rem;
  pointer-events: none;
`;

const PlayButton = styled.button`
  margin-top: 2rem;
  font-size: 1.5rem;
  padding: 0.5rem 2rem;
  color: white;
  background: transparent;
  border: 1px solid white;
  border-radius: 100px;
  cursor: pointer;
  opacity: 1;
  
  transition: all 0.3s ease;
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
  font-weight: 500;
  gap: 0.75rem;
  .arrow {
    display: inline-block;
    transition: transform 0.3s ease;
  }
  &:hover .arrow {
    transform: translateX(6px);
  }
`;

const MenuIcon = styled.div`
  position: fixed;
  top: 50%;
  left: 2rem;
  transform: translateY(-50%);
  z-index: 100;
  font-size: 3rem;
  color: white;
  cursor: pointer;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: black;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99;
  opacity: 0;
  pointer-events: none;
`;

function App() {
  const cursorRef = useRef(null);
  const scrollHintRef = useRef(null);
  const sceneRefs = useRef([]);
  const overlayRef = useRef(null);
  const currentScene = useRef(0);
  const [transitioning, setTransitioning] = useState(false);
  // Play button no longer scales, so no state needed
// const [playScale, setPlayScale] = useState(0);
  const playButtonRef = useRef(null);
  const [hoverLeft, setHoverLeft] = useState(false);
  const [hoverRight, setHoverRight] = useState(false);

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

  useEffect(() => {
    const handleScroll = (e) => {
      e.preventDefault();
      if (transitioning) return;

      if (e.deltaY > 0) {
  // scroll down → transition to block2
  triggerSceneAdvance();
}
    };


    window.addEventListener("wheel", handleScroll, { passive: false });
    return () => window.removeEventListener("wheel", handleScroll);
  }, [transitioning]);

  const triggerSceneAdvance = () => {
    if (currentScene.current >= videos.length - 1) return;
    setTransitioning(true);

    const current = sceneRefs.current[currentScene.current];
    const next = sceneRefs.current[currentScene.current + 1];

    const tl = gsap.timeline({
      onComplete: () => {
        currentScene.current += 1;
        setTransitioning(false);
      },
    });

    tl.to(current, {
      opacity: 0,
      duration: 1,
      ease: "power2.inOut",
      onStart: () => current.style.zIndex = 0,
    });

    tl.set(next, { pointerEvents: "auto", zIndex: 1 });

    tl.to(next, {
      opacity: 1,
      duration: 1.4,
      ease: "power2.inOut",
    });
  };

  const openOverlay = () => {
    gsap.set(overlayRef.current, { pointerEvents: "auto" });
    gsap.to(overlayRef.current, {
      opacity: 1,
      duration: 1.4,
      ease: "power2.inOut",
    });
  };

  return (
    <Main>
      <Header>
        <HeaderLeft>
          <span style={{ fontSize: '1.6rem', marginRight: '0.4rem' }}>murmur</span>
          <span style={{ fontSize: '1rem', margin: '0 0.4rem' }}>/</span>
          <span style={{ fontSize: '1rem', marginRight: '0.2rem' }}>About</span>
          <span className="arrow" style={{ fontSize: '1rem' }}>→</span>
        </HeaderLeft>
        <div></div>
      </Header>

      <MenuIcon onClick={openOverlay}>☰</MenuIcon>

      <Overlay ref={overlayRef}>Full-page overlay menu (to be filled with content)</Overlay>

      {videos.map((src, i) => {
        const isFirst = i === 0;
        return isFirst ? (
          <ActiveScene key={i} ref={(el) => (sceneRefs.current[i] = el)}>
            <CursorDot ref={cursorRef} />
            <BoundingBox>
              <Title>murmur</Title>
              {/* <PlayButton
  ref={playButtonRef}
  onClick={triggerSceneAdvance}
>
  play
</PlayButton> */}
            </BoundingBox>

            {/* Arrows for left/right scroll suggestion */}
            <div style={{
  position: 'absolute',
  bottom: '6vh',
  left: '30vw',
  
  fontSize: '2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem'
}}>
              <span style={{ fontSize: '0.8rem' }}>xxx</span>
              <span style={{ display: 'inline-block', width: '7cm', height: '1px', background: 'white', position: 'relative', overflow: 'hidden' }} onMouseEnter={() => setHoverLeft(true)} onAnimationEnd={() => setHoverLeft(false)}>
  <span style={{ position: 'absolute', left: 0, top: '-5px', width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderRight: '10px solid white' }}></span>
  {hoverLeft && (
    <span style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: '100%', background: 'white', transform: 'translateX(100%)', animation: 'flashline-left 0.8s linear forwards' }}></span>
  )}
</span>
            </div>

            <div style={{
  position: 'absolute',
  bottom: '6vh',
  right: '30vw',
  fontSize: '2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem'
}}>
              <span style={{ fontSize: '0.8rem' }}>xxx</span>
              <span style={{ display: 'inline-block', width: '7cm', height: '1px', background: 'white', position: 'relative', overflow: 'hidden' }} onMouseEnter={() => setHoverRight(true)} onAnimationEnd={() => setHoverRight(false)}>
  <span style={{ position: 'absolute', right: 0, top: '-5px', width: 0, height: 0, borderTop: '6px solid transparent', borderBottom: '6px solid transparent', borderLeft: '10px solid white' }}></span>
  {hoverRight && (
    <span style={{ position: 'absolute', top: 0, right: 0, height: '100%', width: '100%', background: 'white', transform: 'translateX(-100%)', animation: 'flashline-right 0.8s linear forwards' }}></span>
  )}
</span>
            </div>
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
