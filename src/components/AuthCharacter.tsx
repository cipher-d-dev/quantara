import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import gsap from 'gsap';

export type AuthCharacterState = 'idle' | 'email' | 'password' | 'typing' | 'loading' | 'success' | 'error';

export interface AuthCharacterHandle {
  setState: (state: AuthCharacterState) => void;
}

const AuthCharacter = forwardRef<AuthCharacterHandle>((_, ref) => {
  const containerRef = useRef<SVGSVGElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const pupilLeftRef = useRef<SVGCircleElement>(null);
  const pupilRightRef = useRef<SVGCircleElement>(null);
  const eyelidLeftRef = useRef<SVGRectElement>(null);
  const eyelidRightRef = useRef<SVGRectElement>(null);
  const headRef = useRef<SVGGElement>(null);
  const visorRef = useRef<SVGRectElement>(null);
  const mouthRef = useRef<SVGPathElement>(null);
  const glowRef = useRef<SVGEllipseElement>(null);
  const antennaDotRef = useRef<SVGCircleElement>(null);

  // Track whether eyes are currently forced open by a form state
  const formStateRef = useRef<AuthCharacterState>('idle');
  // Track whether cursor is moving
  const moveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const eyesOpenRef = useRef(false);

  const openEyes = () => {
    if (eyesOpenRef.current) return;
    eyesOpenRef.current = true;
    gsap.to([eyelidLeftRef.current, eyelidRightRef.current], {
      scaleY: 0, duration: 0.15, transformOrigin: 'top',
    });
  };

  const closeEyes = () => {
    // Don't close if a form state is keeping them open
    if (['email', 'typing', 'loading', 'success'].includes(formStateRef.current)) return;
    if (!eyesOpenRef.current) return;
    eyesOpenRef.current = false;
    gsap.to([eyelidLeftRef.current, eyelidRightRef.current], {
      scaleY: 1, duration: 0.2, transformOrigin: 'top',
    });
    // Reset pupils to center when closed
    gsap.to([pupilLeftRef.current, pupilRightRef.current], {
      x: 0, y: 0, duration: 0.3, ease: 'power2.out',
    });
  };

  // Ambient float
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(headRef.current, {
        y: -6, duration: 2.8, ease: 'sine.inOut', repeat: -1, yoyo: true,
      });
      gsap.to(antennaDotRef.current, {
        scale: 1.4, opacity: 0.6, transformOrigin: 'center',
        duration: 1.2, ease: 'sine.inOut', repeat: -1, yoyo: true,
      });

      // Start with eyes closed
      gsap.set([eyelidLeftRef.current, eyelidRightRef.current], { scaleY: 1, transformOrigin: 'top' });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  // Cursor: open eyes on movement, close on rest, track pupils, parallax body
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const svg = containerRef.current;
      const wrapper = wrapperRef.current;
      if (!svg || !wrapper) return;

      // Open eyes while moving
      openEyes();

      // Reset close timer
      if (moveTimer.current) clearTimeout(moveTimer.current);
      moveTimer.current = setTimeout(closeEyes, 1200);

      // Pupil tracking — relative to eye center in SVG space
      const rect = svg.getBoundingClientRect();
      const cx = rect.left + rect.width * 0.5;
      const cy = rect.top + rect.height * 0.42;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      const dist = 3;
      gsap.to([pupilLeftRef.current, pupilRightRef.current], {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        duration: 0.3, ease: 'power2.out',
      });

      // Body parallax — subtle drift toward cursor
      const wrect = wrapper.getBoundingClientRect();
      const wx = (e.clientX - wrect.left - wrect.width / 2) / wrect.width;
      const wy = (e.clientY - wrect.top - wrect.height / 2) / wrect.height;
      gsap.to(wrapper, {
        x: wx * 14,
        y: wy * 10,
        duration: 0.6, ease: 'power2.out',
      });
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (moveTimer.current) clearTimeout(moveTimer.current);
    };
  }, []);

  useImperativeHandle(ref, () => ({
    setState(state: AuthCharacterState) {
      formStateRef.current = state;
      const tl = gsap.timeline();

      if (state === 'email' || state === 'typing') {
        openEyes();
        tl.to([pupilLeftRef.current, pupilRightRef.current], { x: 2, y: 0, duration: 0.3, ease: 'power2.out' });
        if (state === 'email') {
          tl.to(mouthRef.current, { attr: { d: 'M 152 190 Q 160 196 168 190' }, duration: 0.3 }, '<');
        } else {
          tl.to(headRef.current, { x: 1.5, duration: 0.1, yoyo: true, repeat: 3, ease: 'none' })
            .to(antennaDotRef.current, { scale: 1.8, opacity: 1, duration: 0.15, yoyo: true, repeat: 1, transformOrigin: 'center' }, '<');
        }

      } else if (state === 'password') {
        // Visor down — privacy mode
        tl.to(visorRef.current, { scaleY: 1, duration: 0.4, ease: 'power2.inOut', transformOrigin: 'top' })
          .to([pupilLeftRef.current, pupilRightRef.current], { x: 0, y: 0, duration: 0.2 }, '<')
          .to(mouthRef.current, { attr: { d: 'M 152 190 Q 160 188 168 190' }, duration: 0.2 }, '<');
        eyesOpenRef.current = false;

      } else if (state === 'loading') {
        openEyes();
        gsap.to([pupilLeftRef.current, pupilRightRef.current], {
          rotation: 360, transformOrigin: '50% 50%',
          duration: 1, ease: 'none', repeat: -1, id: 'pupil-spin',
        });
        tl.to(mouthRef.current, { attr: { d: 'M 152 189 Q 160 194 168 189' }, duration: 0.3 });

      } else if (state === 'success') {
        gsap.killTweensOf([pupilLeftRef.current, pupilRightRef.current], 'rotation');
        openEyes();
        tl.to(glowRef.current, { fill: '#22c55e', opacity: 0.25, duration: 0.3 })
          .to([eyelidLeftRef.current, eyelidRightRef.current], { scaleY: 0.55, duration: 0.2, transformOrigin: 'top' }, '<')
          .to(mouthRef.current, { attr: { d: 'M 150 188 Q 160 198 170 188' }, duration: 0.3 }, '<')
          .to(headRef.current, { y: -12, duration: 0.25, ease: 'power2.out', yoyo: true, repeat: 1 });

      } else if (state === 'error') {
        gsap.killTweensOf([pupilLeftRef.current, pupilRightRef.current], 'rotation');
        tl.to(glowRef.current, { fill: '#ef4444', opacity: 0.25, duration: 0.2 })
          .to(headRef.current, { x: -8, duration: 0.07, repeat: 5, yoyo: true, ease: 'none' }, '<')
          .to(mouthRef.current, { attr: { d: 'M 152 193 Q 160 187 168 193' }, duration: 0.25 })
          .to(glowRef.current, { fill: '#6366f1', opacity: 0.15, duration: 0.8, delay: 0.5 });

      } else {
        // idle — visor up, reset, let cursor control eyes
        gsap.killTweensOf([pupilLeftRef.current, pupilRightRef.current], 'rotation');
        tl.to(visorRef.current, { scaleY: 0, duration: 0.35, ease: 'power2.inOut', transformOrigin: 'top' })
          .to([pupilLeftRef.current, pupilRightRef.current], { x: 0, y: 0, rotation: 0, duration: 0.3 }, '<')
          .to(mouthRef.current, { attr: { d: 'M 152 190 Q 160 194 168 190' }, duration: 0.3 }, '<')
          .to(glowRef.current, { fill: '#6366f1', opacity: 0.15, duration: 0.3 }, '<');
        // Eyes go back to cursor-controlled (closed if cursor at rest)
        if (!eyesOpenRef.current) {
          gsap.set([eyelidLeftRef.current, eyelidRightRef.current], { scaleY: 1, transformOrigin: 'top' });
        }
      }
    },
  }));

  return (
    <div ref={wrapperRef} className="w-full h-full will-change-transform">
      <svg
        ref={containerRef}
        viewBox="80 60 160 220"
        className="w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="headGrad" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#27272a" />
            <stop offset="100%" stopColor="#09090b" />
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <clipPath id="eyeClipL">
            <rect x="136" y="162" width="18" height="18" rx="4" />
          </clipPath>
          <clipPath id="eyeClipR">
            <rect x="166" y="162" width="18" height="18" rx="4" />
          </clipPath>
          <clipPath id="visorClip">
            <rect x="128" y="155" width="64" height="32" rx="6" />
          </clipPath>
        </defs>

        <ellipse ref={glowRef} cx="160" cy="195" rx="55" ry="40" fill="#6366f1" opacity="0.15" filter="url(#softGlow)" />

        <g ref={headRef}>
          <rect x="152" y="220" width="16" height="14" rx="3" fill="#27272a" />
          <rect x="130" y="232" width="60" height="10" rx="5" fill="#1f1f23" />
          <rect x="120" y="140" width="80" height="86" rx="18" fill="url(#headGrad)" stroke="#3f3f46" strokeWidth="1.5" />
          <rect x="135" y="148" width="50" height="6" rx="3" fill="#3f3f46" opacity="0.7" />

          {/* Antenna */}
          <rect x="158" y="125" width="4" height="17" rx="2" fill="#3f3f46" />
          <circle ref={antennaDotRef} cx="160" cy="122" r="5" fill="#6366f1" filter="url(#softGlow)" />

          {/* Eye sockets */}
          <rect x="134" y="160" width="22" height="22" rx="6" fill="#09090b" />
          <rect x="164" y="160" width="22" height="22" rx="6" fill="#09090b" />

          {/* Left eye */}
          <g clipPath="url(#eyeClipL)">
            <circle cx="145" cy="171" r="7" fill="#6366f1" opacity="0.9" />
            <circle ref={pupilLeftRef} cx="145" cy="171" r="3.5" fill="#09090b" />
            <circle cx="147" cy="169" r="1.2" fill="white" opacity="0.8" />
            <rect ref={eyelidLeftRef} x="136" y="162" width="18" height="18" fill="#09090b" />
          </g>

          {/* Right eye */}
          <g clipPath="url(#eyeClipR)">
            <circle cx="175" cy="171" r="7" fill="#6366f1" opacity="0.9" />
            <circle ref={pupilRightRef} cx="175" cy="171" r="3.5" fill="#09090b" />
            <circle cx="177" cy="169" r="1.2" fill="white" opacity="0.8" />
            <rect ref={eyelidRightRef} x="166" y="162" width="18" height="18" fill="#09090b" />
          </g>

          {/* Visor */}
          <rect
            ref={visorRef}
            x="128" y="155" width="64" height="32" rx="6"
            fill="#1f1f23" stroke="#4f46e5" strokeWidth="1"
            style={{ transformOrigin: '160px 155px' }}
            clipPath="url(#visorClip)"
          />

          <path ref={mouthRef} d="M 152 190 Q 160 194 168 190" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" fill="none" />

          <rect x="120" y="172" width="8" height="3" rx="1.5" fill="#4f46e5" opacity="0.6" />
          <rect x="192" y="172" width="8" height="3" rx="1.5" fill="#4f46e5" opacity="0.6" />
          <rect x="140" y="218" width="40" height="3" rx="1.5" fill="#4f46e5" opacity="0.3" />
        </g>
      </svg>
    </div>
  );
});

AuthCharacter.displayName = 'AuthCharacter';
export default AuthCharacter;
