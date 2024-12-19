import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const FloatingElements = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const elements = container.getElementsByClassName('floating-element');
      
      Array.from(elements).forEach((element) => {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        const deltaX = (clientX - centerX) / 50;
        const deltaY = (clientY - centerY) / 50;
        
        (element as HTMLElement).style.transform = `translate(${deltaX}px, ${deltaY}px)`;
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Travel Inspired */}
      <div className={cn(
        "floating-element absolute w-32 h-32 rounded-full",
        "bg-[url('/images/photo-1504893524553-b855bce32c67.jpg')] bg-cover bg-center",
        "top-[20%] left-[15%] opacity-20 transition-transform duration-300 blur-sm"
      )} />
      <div className={cn(
        "floating-element absolute w-48 h-48 rounded-full",
        "bg-[url('/images/photo-1501854140801-50d01698950b.jpg')] bg-cover bg-center",
        "top-[40%] right-[10%] opacity-20 transition-transform duration-300 blur-sm"
      )} />

      {/* Living Abroad */}
      <div className={cn(
        "floating-element absolute w-40 h-40 rounded-full",
        "bg-[url('/images/photo-1465146344425-f00d5f5c8f07.jpg')] bg-cover bg-center",
        "bottom-[30%] left-[25%] opacity-20 transition-transform duration-300 blur-sm"
      )} />

      {/* Adventure */}
      <div className={cn(
        "floating-element absolute w-36 h-36 rounded-full",
        "bg-[url('/images/photo-1470071459604-3b5ec3a7fe05.jpg')] bg-cover bg-center",
        "top-[15%] right-[25%] opacity-20 transition-transform duration-300 blur-sm"
      )} />
    </div>
  );
};

export default FloatingElements;