import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
}

export function InteractiveBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    let particleId = 0;

    const addParticle = (x: number, y: number) => {
      const id = particleId++;
      setParticles((prev) => [...prev, { id, x, y }]);
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== id));
      }, 1000);
    };

    const handleWindowClick = (e: MouseEvent) => {
      addParticle(e.clientX, e.clientY);
    };
    
    const handleTouch = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        addParticle(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't spawn if pressing space/enter or modifier keys only to avoid noise
      if (['Shift', 'Control', 'Alt', 'Meta'].includes(e.key)) return;
      
      const x = Math.random() * window.innerWidth;
      const y = Math.random() * window.innerHeight;
      addParticle(x, y);
    };

    window.addEventListener('click', handleWindowClick);
    window.addEventListener('touchstart', handleTouch, { passive: true });
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('click', handleWindowClick);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-white">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.5, scale: 0, x: "-50%", y: "-50%" }}
            animate={{ opacity: 0, scale: 2, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute rounded-full border border-slate-300 w-32 h-32"
            style={{ left: p.x, top: p.y }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
