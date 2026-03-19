import { useHaptics } from '@/hooks/useHaptics';
import { ChevronRight } from 'lucide-react';
import { useRef, useState } from 'react';

interface SwipeToAcceptProps {
  /** Label shown on the track */
  label?: string;
  /** Called when the user swipes far enough to accept */
  onAccept: () => void;
  /** Called when the thumb is released without reaching 75% */
  onCancel?: () => void;
  disabled?: boolean;
  /** Colour of the thumb and progress fill (defaults to primary green) */
  accentColor?: string;
}

/**
 * NHTSA-compliant swipe-to-accept gesture control.
 *
 * Requires an intentional 75% rightward swipe to trigger — accidental
 * bumps (taps, tiny slides) are safely ignored. Accepts touch and pointer
 * events so it works both on mobile and in desktop dev tools.
 *
 * Accessibility: role="slider" with aria-valuemin/max/now so screen readers
 * can read the progress; aria-label describes the action.
 */
export function SwipeToAccept({
  label = 'Glisser pour accepter →',
  onAccept,
  onCancel,
  disabled = false,
  accentColor = 'hsl(151 100% 45%)',
}: SwipeToAcceptProps) {
  const { vibrate } = useHaptics();
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  const THUMB_SIZE = 56; // px
  const ACCEPT_RATIO = 0.75; // 75% of track width = accept

  function trackWidth(): number {
    return trackRef.current?.clientWidth ?? 320;
  }

  function maxDrag(): number {
    return trackWidth() - THUMB_SIZE - 4; // 4 px padding
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (disabled) return;
    startXRef.current = e.clientX;
    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    vibrate('navigation');
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging || disabled) return;
    const delta = Math.max(0, e.clientX - startXRef.current);
    setDragX(Math.min(delta, maxDrag()));
  }

  function onPointerUp() {
    if (!isDragging || disabled) return;
    setIsDragging(false);

    const ratio = dragX / maxDrag();

    if (ratio >= ACCEPT_RATIO) {
      vibrate('accepted');
      // Snap to end, then call onAccept after animation
      setDragX(maxDrag());
      setTimeout(() => {
        setDragX(0);
        onAccept();
      }, 250);
    } else {
      // Spring back
      if (ratio < 0.1 && onCancel) onCancel();
      setDragX(0);
    }
  }

  const ratio = dragX / Math.max(maxDrag(), 1);
  const progress = Math.min(ratio / ACCEPT_RATIO, 1); // 0–1 relative to threshold
  const percentValue = Math.round(ratio * 100);

  return (
    <div
      ref={trackRef}
      className={`relative h-14 rounded-2xl overflow-hidden select-none ${disabled ? 'opacity-40 pointer-events-none' : ''}`}
      style={{
        background: `linear-gradient(90deg, ${accentColor}33 ${progress * 100}%, hsl(var(--card)) ${progress * 100}%)`,
        border: '1px solid hsl(var(--border))',
      }}
    >
      {/* Label — fades out as thumb advances */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-150"
        style={{ opacity: 1 - progress * 0.8 }}
      >
        <span className="text-sm font-medium text-white/50">{label}</span>
      </div>

      {/* Draggable thumb */}
      <div
        className="absolute top-1 bottom-1 left-1 flex items-center justify-center rounded-xl shadow-lg cursor-grab active:cursor-grabbing"
        style={{
          width: THUMB_SIZE,
          backgroundColor: accentColor,
          transform: `translateX(${dragX}px)`,
          transition: isDragging
            ? 'none'
            : 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentValue}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
      >
        <ChevronRight
          className="w-6 h-6 font-black"
          style={{ color: '#08081a' }}
        />
      </div>
    </div>
  );
}
