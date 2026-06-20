import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import gsap from 'gsap';
import { FileText, CheckCircle2, Cpu, Bell, BarChart2, Lock, User } from 'lucide-react';

export type WorkspaceFocusState = 'idle' | 'email' | 'password' | 'typing' | 'loading' | 'success' | 'error';

export interface WorkspacePreviewHandle {
  setFocus: (state: WorkspaceFocusState) => void;
  pulse: () => void;
}

const WorkspacePreview = forwardRef<WorkspacePreviewHandle>((_, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const securityRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement>(null);
  const currentState = useRef<WorkspaceFocusState>('idle');

  // Cursor parallax
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left - rect.width / 2) / rect.width;
      const y = (e.clientY - rect.top - rect.height / 2) / rect.height;

      gsap.to(profileRef.current, { x: x * 12, y: y * 8, duration: 0.6, ease: 'power2.out' });
      gsap.to(aiRef.current, { x: x * -8, y: y * 12, duration: 0.6, ease: 'power2.out' });
      gsap.to(chartRef.current, { x: x * 6, y: y * -10, duration: 0.6, ease: 'power2.out' });
      gsap.to(notifRef.current, { x: x * -10, y: y * -6, duration: 0.6, ease: 'power2.out' });
    };

    // Attach to window so parallax works even when cursor is over form
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, []);

  // Entry animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from([profileRef.current, aiRef.current, chartRef.current, notifRef.current, securityRef.current], {
        opacity: 0,
        y: 20,
        scale: 0.95,
        duration: 0.7,
        stagger: 0.1,
        ease: 'power3.out',
        delay: 0.3,
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  useImperativeHandle(ref, () => ({
    setFocus(state: WorkspaceFocusState) {
      if (currentState.current === state) return;
      currentState.current = state;

      // Reset all to idle dim
      gsap.to([profileRef.current, securityRef.current, aiRef.current, chartRef.current, notifRef.current], {
        opacity: 0.4, scale: 1, duration: 0.3, ease: 'power2.out',
      });

      if (state === 'email') {
        gsap.to(profileRef.current, { opacity: 1, scale: 1.03, duration: 0.4, ease: 'power2.out' });
        gsap.to(aiRef.current, { opacity: 0.8, duration: 0.4 });
      } else if (state === 'password') {
        gsap.to(securityRef.current, { opacity: 1, scale: 1.03, duration: 0.4, ease: 'power2.out' });
        gsap.to(profileRef.current, { opacity: 0.6, duration: 0.3 });
      } else if (state === 'loading') {
        gsap.to([profileRef.current, securityRef.current, aiRef.current, chartRef.current, notifRef.current], {
          opacity: 1, duration: 0.4, stagger: 0.05,
        });
        gsap.to(aiRef.current, {
          boxShadow: '0 0 20px rgba(99,102,241,0.5)',
          repeat: -1, yoyo: true, duration: 0.8, ease: 'sine.inOut',
        });
      } else if (state === 'success') {
        gsap.to([profileRef.current, securityRef.current, aiRef.current, chartRef.current, notifRef.current], {
          opacity: 1, scale: 1.02, duration: 0.5, stagger: 0.06, ease: 'back.out(1.5)',
        });
      } else if (state === 'error') {
        gsap.to(securityRef.current, { opacity: 1, x: '+=6', duration: 0.07, repeat: 5, yoyo: true, ease: 'none' });
      } else {
        // idle — restore
        gsap.to([profileRef.current, securityRef.current, aiRef.current, chartRef.current, notifRef.current], {
          opacity: 1, scale: 1, duration: 0.4,
        });
      }
    },
    pulse() {
      if (!pulseRef.current) return;
      gsap.fromTo(pulseRef.current,
        { scale: 0.8, opacity: 0.8 },
        { scale: 2.5, opacity: 0, duration: 0.6, ease: 'power2.out' }
      );
    },
  }));

  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center select-none overflow-hidden">
      {/* Ambient background orbs */}
      <div className="absolute top-[-15%] left-[-15%] w-72 h-72 rounded-full bg-brand-600/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-60 h-60 rounded-full bg-brand-400/15 blur-[80px] pointer-events-none" />

      {/* Particles layer */}
      <div ref={particlesRef} className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-brand-400/40"
            style={{
              left: `${10 + (i * 7.5) % 80}%`,
              top: `${15 + (i * 11) % 70}%`,
              animation: `float ${4 + (i % 3)}s ease-in-out ${i * 0.4}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Central pulse ring (typing indicator) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          ref={pulseRef}
          className="w-16 h-16 rounded-full border-2 border-brand-400/40 opacity-0"
        />
      </div>

      {/* Widget grid */}
      <div className="relative z-10 w-full max-w-xs space-y-3 px-4">

        {/* Profile / identity widget */}
        <div
          ref={profileRef}
          className="rounded-2xl border border-surface-700/60 bg-surface-900/80 backdrop-blur-md p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="h-2.5 w-24 bg-surface-700 rounded-full mb-1.5" />
            <div className="h-2 w-16 bg-surface-800 rounded-full" />
          </div>
          <div className="w-2 h-2 rounded-full bg-success-400 shrink-0" />
        </div>

        {/* Row: AI status + notifications */}
        <div className="grid grid-cols-2 gap-3">
          <div
            ref={aiRef}
            className="rounded-2xl border border-surface-700/60 bg-surface-900/80 backdrop-blur-md p-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-4 h-4 text-brand-400" />
              <span className="text-xs text-surface-400 font-medium">AI Engine</span>
            </div>
            <div className="flex gap-1 items-end h-6">
              {[3, 5, 4, 6, 3, 5, 4].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-brand-500/60 rounded-sm"
                  style={{ height: `${h * 4}px`, animation: `float ${1.5 + i * 0.2}s ease-in-out ${i * 0.1}s infinite` }}
                />
              ))}
            </div>
          </div>

          <div
            ref={notifRef}
            className="rounded-2xl border border-surface-700/60 bg-surface-900/80 backdrop-blur-md p-3"
          >
            <div className="flex items-center gap-2 mb-2">
              <Bell className="w-4 h-4 text-brand-400" />
              <span className="text-xs text-surface-400 font-medium">Alerts</span>
            </div>
            <div className="space-y-1.5">
              {['Report ready', 'Slot confirmed'].map((t) => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-success-400 shrink-0" />
                  <span className="text-[10px] text-surface-500 truncate">{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Security widget */}
        <div
          ref={securityRef}
          className="rounded-2xl border border-surface-700/60 bg-surface-900/80 backdrop-blur-md p-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-success-500/15 border border-success-500/25 flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-success-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-surface-300 mb-1">Secure Access</p>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex-1 h-1.5 rounded-full bg-success-500/50" />
              ))}
            </div>
          </div>
        </div>

        {/* Chart widget */}
        <div
          ref={chartRef}
          className="rounded-2xl border border-surface-700/60 bg-surface-900/80 backdrop-blur-md p-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-brand-400" />
              <span className="text-xs text-surface-400 font-medium">Reports</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-3 h-3 text-brand-400" />
              <span className="text-[10px] text-brand-400 font-semibold">+12 this week</span>
            </div>
          </div>
          <div className="flex items-end gap-1.5 h-8">
            {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm bg-gradient-to-t from-brand-600/60 to-brand-400/40"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

WorkspacePreview.displayName = 'WorkspacePreview';
export default WorkspacePreview;
