/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { KeyboardControls, Loader } from '@react-three/drei';
import { useGameStore } from './store/useGameStore';

// Main Scene Component
import { GameScene } from './components/3d/GameScene';

// Effects
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';

// UI Components
import { UILayer } from './components/ui/UILayer';



const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'left', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'right', keys: ['ArrowRight', 'KeyD'] },
  { name: 'jump', keys: ['Space'] },
  { name: 'run', keys: ['Shift'] },
  { name: 'interact', keys: ['KeyE'] },
  { name: 'bark', keys: ['KeyQ'] },
  { name: 'command', keys: ['KeyC'] },
];

// Animated paw print component
function PawPrint({ x, y, delay, size }: { x: number; y: number; delay: number; size: number }) {
  return (
    <div 
      className="absolute opacity-0"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: `${size}px`,
        height: `${size}px`,
        animation: `pawFadeIn 3s ease-in-out ${delay}s infinite`,
      }}
    >
      {/* Paw pad - main */}
      <div 
        className="absolute rounded-full"
        style={{
          width: `${size * 0.45}%`,
          height: `${size * 0.35}%`,
          bottom: '0%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(192, 92, 72, 0.12)',
        }}
      />
      {/* Toes */}
      {[
        { left: '20%', bottom: '55%' },
        { left: '38%', bottom: '68%' },
        { left: '55%', bottom: '68%' },
        { left: '72%', bottom: '55%' },
      ].map((pos, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            width: `${size * 0.18}%`,
            height: `${size * 0.18}%`,
            left: pos.left,
            bottom: pos.bottom,
            backgroundColor: 'rgba(192, 92, 72, 0.12)',
          }}
        />
      ))}
    </div>
  );
}

// Floating particle for title screen
function FloatingParticle({ delay, duration, x }: { delay: number; duration: number; x: number }) {
  return (
    <div
      className="absolute bottom-0 rounded-full"
      style={{
        left: `${x}%`,
        width: `${3 + Math.random() * 5}px`,
        height: `${3 + Math.random() * 5}px`,
        backgroundColor: ['#E8A95B', '#D9773F', '#F6E5C8', '#FDFBF7', '#D93D4A'][Math.floor(Math.random() * 5)],
        opacity: 0.4 + Math.random() * 0.3,
        animation: `floatUp ${duration}s ease-out ${delay}s infinite`,
      }}
    />
  );
}

export default function App() {
  const [started, setStarted] = useState(false);
  const [titleVisible, setTitleVisible] = useState(false);
  const settings = useGameStore(state => state.settings);
  const timeOfDay = useGameStore(state => state.timeOfDay) || 'afternoon';

  useEffect(() => {
    if (!started) {
      // Stagger title animations
      const timer = setTimeout(() => setTitleVisible(true), 300);
      return () => clearTimeout(timer);
    }
  }, [started]);

  const timeColors = {
    morning: { bg: '#88AAB5', fog: '#88AAB5', light: '#FFF6EB', lightInt: 1.2, ambInt: 0.6 },
    afternoon: { bg: '#71A3A5', fog: '#71A3A5', light: '#FFFAF0', lightInt: 1.3, ambInt: 0.65 },
    sunset: { bg: '#E3926B', fog: '#E3926B', light: '#FFCD9E', lightInt: 1.1, ambInt: 0.5 },
    evening: { bg: '#2B4257', fog: '#2B4257', light: '#99B2D1', lightInt: 0.5, ambInt: 0.3 },
  };

  const scheme = timeColors[timeOfDay as keyof typeof timeColors];

  // Generate paw prints for background
  const pawPrints = Array.from({ length: 12 }, (_, i) => ({
    x: 5 + Math.random() * 90,
    y: 5 + Math.random() * 90,
    delay: i * 0.8 + Math.random() * 2,
    size: 30 + Math.random() * 40,
  }));

  // Generate floating particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    delay: i * 0.5 + Math.random() * 3,
    duration: 4 + Math.random() * 4,
    x: Math.random() * 100,
  }));

  return (
    <div className="w-full h-screen bg-teal text-ink font-sans overflow-hidden">
      {/* Global animation styles */}
      <style>{`
        @keyframes pawFadeIn {
          0% { opacity: 0; transform: scale(0.5) rotate(-20deg); }
          15% { opacity: 0.6; transform: scale(1) rotate(0deg); }
          30% { opacity: 0.6; transform: scale(1) rotate(0deg); }
          50% { opacity: 0; transform: scale(1.1) rotate(5deg); }
          100% { opacity: 0; }
        }
        @keyframes floatUp {
          0% { transform: translateY(0) scale(1); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.2; }
          100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
        }
        @keyframes gentleBob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes waveMotion {
          0% { transform: translateX(0) scaleY(1); }
          25% { transform: translateX(-5px) scaleY(1.05); }
          50% { transform: translateX(0) scaleY(1); }
          75% { transform: translateX(5px) scaleY(0.95); }
          100% { transform: translateX(0) scaleY(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {!started ? (
        <div 
          className="flex flex-col items-center justify-center h-full relative z-50 overflow-hidden" 
          style={{ 
            background: `linear-gradient(180deg, ${scheme.bg} 0%, #7AAFB2 50%, #A8C8D9 85%, #E8DCC4 100%)`,
          }}
        >
          {/* Paw prints in background */}
          {pawPrints.map((paw, i) => (
            <PawPrint key={i} {...paw} />
          ))}

          {/* Floating particles */}
          {particles.map((p, i) => (
            <FloatingParticle key={`particle-${i}`} {...p} />
          ))}

          {/* Animated wave at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden">
            <div 
              className="absolute bottom-0 left-0 right-0 h-20 rounded-t-[50%]"
              style={{ 
                backgroundColor: '#A8C8D9',
                opacity: 0.6,
                animation: 'waveMotion 4s ease-in-out infinite',
                marginLeft: '-5%',
                width: '110%',
              }}
            />
            <div 
              className="absolute bottom-0 left-0 right-0 h-16 rounded-t-[50%]"
              style={{ 
                backgroundColor: '#89C4D9',
                opacity: 0.4,
                animation: 'waveMotion 3.5s ease-in-out 0.5s infinite',
                marginLeft: '-5%',
                width: '110%',
              }}
            />
            <div 
              className="absolute bottom-0 left-0 right-0 h-12 rounded-t-[50%]"
              style={{ 
                backgroundColor: '#6BA3BE',
                opacity: 0.3,
                animation: 'waveMotion 3s ease-in-out 1s infinite',
                marginLeft: '-5%',
                width: '110%',
              }}
            />
          </div>

          {/* Island silhouette */}
          <div 
            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[300px] h-[80px] rounded-t-[50%] opacity-15"
            style={{ backgroundColor: '#3C8259' }}
          />
          {/* Lighthouse silhouette */}
          <div 
            className="absolute bottom-28 opacity-10"
            style={{ left: 'calc(50% + 80px)' }}
          >
            <div className="w-3 h-16 bg-[#FDFBF7] mx-auto" />
            <div className="w-5 h-3 bg-[#D93D4A] mx-auto -mt-1" />
          </div>

          {/* Title Card */}
          <div 
            className="bg-paper p-10 sm:p-14 border-4 border-ink shadow-[8px_8px_0_var(--color-ink)] flex flex-col items-center max-w-2xl text-center mx-4 relative"
            style={{
              opacity: titleVisible ? 1 : 0,
              transform: titleVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Decorative corner stamps */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-terracotta/30" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-terracotta/30" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-terracotta/30" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-terracotta/30" />

            {/* Postage stamp decoration */}
            <div 
              className="absolute -top-5 -right-5 w-16 h-16 bg-orange border-2 border-ink flex items-center justify-center -rotate-12 shadow-[2px_2px_0_var(--color-ink)]"
              style={{ animation: 'gentleBob 3s ease-in-out infinite' }}
            >
              <span className="text-white text-[8px] font-bold uppercase tracking-wider leading-tight text-center">
                Pawprint<br/>Bay
              </span>
            </div>

            <div 
              className="text-xs uppercase tracking-[6px] font-semibold mb-3 text-terracotta/60"
              style={{ animation: titleVisible ? 'slideUp 0.6s ease-out 0.3s both' : 'none' }}
            >
              A Cozy Courier Tale
            </div>
            
            <h1 
              className="text-4xl sm:text-6xl font-bold mb-3 tracking-tighter text-terracotta font-display"
              style={{ animation: titleVisible ? 'slideUp 0.6s ease-out 0.5s both' : 'none' }}
            >
              YOSHI & MILO
            </h1>
            
            <div 
              className="w-32 h-0.5 bg-terracotta/30 mb-3"
              style={{ animation: titleVisible ? 'fadeIn 0.6s ease-out 0.7s both' : 'none' }}
            />
            
            <h2 
              className="text-2xl sm:text-3xl font-bold mb-4 tracking-tighter text-ink font-display"
              style={{ animation: titleVisible ? 'slideUp 0.6s ease-out 0.7s both' : 'none' }}
            >
              LETTERS BY THE TIDE
            </h2>
            
            <p 
              className="text-lg sm:text-xl mb-8 font-semibold italic text-moss"
              style={{ animation: titleVisible ? 'slideUp 0.6s ease-out 0.9s both' : 'none' }}
            >
              "Every little delivery brings someone home."
            </p>
            
            <button 
              onClick={() => setStarted(true)}
              className="px-10 py-4 bg-orange text-ink border-2 border-ink rounded-sm font-bold text-lg hover:bg-terracotta hover:text-white transition-all shadow-[4px_4px_0_var(--color-ink)] active:translate-y-1 active:shadow-[0_0_0_var(--color-ink)] hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--color-ink)]"
              style={{ animation: titleVisible ? 'slideUp 0.6s ease-out 1.1s both' : 'none' }}
            >
              🐾 Begin Delivery
            </button>

            <div 
              className="mt-6 text-[10px] text-ink/40 tracking-widest uppercase"
              style={{ animation: titleVisible ? 'fadeIn 0.6s ease-out 1.5s both' : 'none' }}
            >
              WASD to move · E to interact · Q to bark
            </div>
          </div>
        </div>
      ) : (
        <KeyboardControls map={keyboardMap}>
          {/* UI Layer Overlay */}
          <UILayer />
          <div className="absolute inset-0 pointer-events-none z-10 p-10">
             <h1 className="text-2xl font-bold text-terracotta font-display drop-shadow-md">YOSHI & MILO</h1>
          </div>

          <Canvas 
            shadows={settings.graphicsQuality !== 'low'} 
            camera={{ position: [0, 5, 10], fov: 45 }}
            dpr={settings.graphicsQuality === 'high' ? [1, 2] : 1}
          >
            <color attach="background" args={[scheme.bg]} />
            <fog attach="fog" args={[scheme.fog, 15, 50]} />
            
            <Suspense fallback={null}>
              <Physics timeStep="vary">
                <GameScene />
                <ambientLight intensity={scheme.ambInt} />
                <directionalLight 
                  position={[10, 15, 10]} 
                  intensity={scheme.lightInt} 
                  castShadow 
                  shadow-mapSize-width={2048} 
                  shadow-mapSize-height={2048}
                  shadow-camera-far={100}
                  shadow-camera-left={-50}
                  shadow-camera-right={50}
                  shadow-camera-top={50}
                  shadow-camera-bottom={-50}
                  color={scheme.light}
                  shadow-bias={-0.0001}
                />
              </Physics>
              {settings.graphicsQuality === 'high' && (
                <EffectComposer>
                  <Bloom luminanceThreshold={0.7} luminanceSmoothing={0.9} intensity={1.2} />
                  <Vignette eskil={false} offset={0.1} darkness={0.9} />
                </EffectComposer>
              )}
            </Suspense>
          </Canvas>
          <Loader containerStyles={{ backgroundColor: '#FDFBF7' }} innerStyles={{ backgroundColor: '#E06D53' }} barStyles={{ backgroundColor: '#E06D53' }} dataStyles={{ color: '#4A3C31' }} />
        </KeyboardControls>
      )}
    </div>
  );
}
