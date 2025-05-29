// HomeScrollLayout.jsx
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
gsap.registerPlugin(ScrollToPlugin);
import styled from 'styled-components';
import AI from './AI';

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

export default function HomeScrollLayout() {
  const cursorRef = useRef(null);
  const sceneRefs = useRef([]);
  const currentScene = useRef(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientX, clientY } = e;
      gsap.to(cursorRef.current, {
        x: clientX - 6,
        y: clientY - 6,
        duration: 0.2,
        ease: 'power3.out',
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleScroll = (e) => {
      e.preventDefault();
      if (transitioning) return;
      if (e.deltaY > 0) triggerSceneAdvance();
      else if (e.deltaY < 0) triggerSceneBack();
    };
    window.addEventListener('wheel', handleScroll, { passive: false });
    return () => window.removeEventListener('wheel', handleScroll);
  }, [transitioning]);

  const triggerSceneAdvance = () => {
    if (currentScene.current >= sceneRefs.current.length - 1) return;
    transitionToScene(currentScene.current + 1);
  };

  const triggerSceneBack = () => {
    if (currentScene.current <= 0) return;
    transitionToScene(currentScene.current - 1);
  };

  const transitionToScene = (nextIndex) => {
    setTransitioning(true);
    const current = sceneRefs.current[currentScene.current];
    const next = sceneRefs.current[nextIndex];
    const tl = gsap.timeline({
      onComplete: () => {
        currentScene.current = nextIndex;
        setTransitioning(false);
      },
    });
    tl.to(current, {
      opacity: 0,
      duration: 1,
      ease: 'power2.inOut',
      onStart: () => (current.style.zIndex = 0),
    });
    tl.set(next, { pointerEvents: 'auto', zIndex: 1 });
    tl.to(next, {
      opacity: 1,
      duration: 1.4,
      ease: 'power2.inOut',
    });
  };

  return (
    <Main>
      <CursorDot ref={cursorRef} />
      <ActiveScene ref={(el) => (sceneRefs.current[0] = el)}>
        <AI />
      </ActiveScene>
    </Main>
  );
}
