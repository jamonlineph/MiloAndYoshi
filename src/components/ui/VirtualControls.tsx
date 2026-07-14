import { useEffect, useRef, useState } from 'react';
import { useInputStore } from '../../store/useInputStore';
import { useGameStore } from '../../store/useGameStore';

export function VirtualControls() {
  const setJoystick = useInputStore(state => state.setJoystick);
  const setButton = useInputStore(state => state.setButton);
  const currentMenu = useGameStore(state => state.currentMenu);
  const activeDialog = useGameStore(state => state.activeDialog);
  const clearDialog = useGameStore(state => state.clearDialog);
  
  const [isTouch, setIsTouch] = useState(false);
  
  const joyRef = useRef<HTMLDivElement>(null);
  const touchIdRef = useRef<number | null>(null);

  useEffect(() => {
    const handleTouch = () => setIsTouch(true);
    window.addEventListener('touchstart', handleTouch, { once: true });
    return () => window.removeEventListener('touchstart', handleTouch);
  }, []);

  if (!isTouch) return null;
  if (currentMenu !== 'none') return null;

  const handleJoyStart = (e: React.TouchEvent) => {
    e.preventDefault();
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    updateJoystick(touch);
  };

  const handleJoyMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current === null) return;
    const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
    if (touch) updateJoystick(touch);
  };

  const handleJoyEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    if (touchIdRef.current === null) return;
    const touch = Array.from(e.changedTouches).find(t => t.identifier === touchIdRef.current);
    if (touch) {
      touchIdRef.current = null;
      setJoystick({ x: 0, y: 0 });
      if (joyRef.current) {
        joyRef.current.style.transform = `translate(0px, 0px)`;
      }
    }
  };

  const updateJoystick = (touch: React.Touch) => {
      // Calculate from center of the joystick ring
      const ringRect = document.getElementById('joystick-ring')?.getBoundingClientRect();
      if (!ringRect) return;

      const centerX = ringRect.left + ringRect.width / 2;
      const centerY = ringRect.top + ringRect.height / 2;
      
      let dx = touch.clientX - centerX;
      let dy = touch.clientY - centerY;
      
      const maxDist = ringRect.width / 2;
      const dist = Math.sqrt(dx*dx + dy*dy);
      
      if (dist > maxDist) {
          dx = (dx / dist) * maxDist;
          dy = (dy / dist) * maxDist;
      }

      if (joyRef.current) {
        joyRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
      }

      // Normalize to -1 to 1
      setJoystick({ x: dx / maxDist, y: dy / maxDist });
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-40">
      {/* Joystick Area */}
      <div 
        className="absolute bottom-8 left-8 w-32 h-32 bg-ink/20 rounded-full pointer-events-auto border-2 border-white/30 backdrop-blur-sm"
        id="joystick-ring"
        onTouchStart={handleJoyStart}
        onTouchMove={handleJoyMove}
        onTouchEnd={handleJoyEnd}
        onTouchCancel={handleJoyEnd}
      >
        <div 
            ref={joyRef}
            className="absolute top-1/2 left-1/2 w-12 h-12 -ml-6 -mt-6 bg-white border-2 border-ink rounded-full shadow-[0_4px_0_var(--color-ink)]"
        />
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-8 right-8 flex gap-4 pointer-events-auto">
         {activeDialog ? (
             <button 
                className="w-16 h-16 bg-orange border-2 border-ink text-ink font-bold rounded-full shadow-[0_4px_0_var(--color-ink)] active:translate-y-1 active:shadow-none transition-transform flex items-center justify-center text-sm"
                onTouchStart={(e) => { e.preventDefault(); clearDialog(); }}
              >
               Next
             </button>
         ) : (
             <>
                <button 
                  className="w-16 h-16 bg-cream border-2 border-ink text-ink font-bold rounded-full shadow-[0_4px_0_var(--color-ink)] active:translate-y-1 active:shadow-none transition-transform flex items-center justify-center text-sm"
                  onTouchStart={(e) => { e.preventDefault(); setButton('bark', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); setButton('bark', false); }}
                >
                  Bark
                </button>
                <button 
                  className="w-16 h-16 bg-cream border-2 border-ink text-ink font-bold rounded-full shadow-[0_4px_0_var(--color-ink)] active:translate-y-1 active:shadow-none transition-transform flex items-center justify-center text-sm"
                  onTouchStart={(e) => { e.preventDefault(); setButton('jump', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); setButton('jump', false); }}
                >
                  Jump
                </button>
                <button 
                  className="w-16 h-16 bg-orange border-2 border-ink text-ink font-bold rounded-full shadow-[0_4px_0_var(--color-ink)] active:translate-y-1 active:shadow-none transition-transform flex items-center justify-center text-sm"
                  onTouchStart={(e) => { e.preventDefault(); setButton('interact', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); setButton('interact', false); }}
                >
                  Interact
                </button>
             </>
         )}
      </div>
      
      {/* Run Button toggler or hold? Hold is annoying on mobile, let's make it a toggle or hold. Wait, let's make a Run button nearby */}
      {!activeDialog && (
          <div className="absolute bottom-28 right-12 pointer-events-auto">
             <button 
                  className="w-14 h-14 bg-sky border-2 border-ink text-ink font-bold rounded-full shadow-[0_4px_0_var(--color-ink)] active:translate-y-1 active:shadow-none transition-transform flex items-center justify-center text-xs"
                  onTouchStart={(e) => { e.preventDefault(); setButton('run', true); }}
                  onTouchEnd={(e) => { e.preventDefault(); setButton('run', false); }}
                >
                  Sprint
                </button>
          </div>
      )}
    </div>
  );
}
