import { useEffect, useRef, RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Hook for reveal animations on scroll
export function useScrollReveal(
  options: {
    threshold?: number;
    duration?: number;
    delay?: number;
    y?: number;
    scale?: number;
    stagger?: number;
  } = {}
) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const { threshold = 0.1, duration = 0.8, delay = 0, y = 50, scale = 1, stagger = 0 } = options;

    gsap.set(element.children, { opacity: 0, y, scale: scale < 1 ? scale : 1 });

    const animation = gsap.to(element.children, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration,
      delay,
      stagger,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: `top ${100 - threshold * 100}%`,
        toggleActions: 'play none none none',
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [options]);

  return ref;
}

// Hook for hero text animation
export function useHeroAnimation() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timeline = gsap.timeline({ delay: 0.3 });

    // Title animation - split by words
    if (titleRef.current) {
      const words = titleRef.current.querySelectorAll('.word');
      timeline.from(words, {
        opacity: 0,
        y: 60,
        rotateX: -90,
        stagger: 0.08,
        duration: 0.8,
        ease: 'power3.out',
      });
    }

    // Subtitle
    if (subtitleRef.current) {
      timeline.from(
        subtitleRef.current,
        {
          opacity: 0,
          y: 30,
          duration: 0.6,
          ease: 'power3.out',
        },
        '-=0.4'
      );
    }

    // CTA buttons
    if (ctaRef.current) {
      timeline.from(
        ctaRef.current.children,
        {
          opacity: 0,
          y: 30,
          stagger: 0.1,
          duration: 0.5,
          ease: 'power3.out',
        },
        '-=0.3'
      );
    }

    return () => {
      timeline.kill();
    };
  }, []);

  return { heroRef, titleRef, subtitleRef, ctaRef };
}

// Hook for staggered card animations
export function useStaggerAnimation(staggerDelay = 0.1) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || container.children.length === 0) return;

    const cards = Array.from(container.children);

    gsap.from(cards, {
      opacity: 0,
      y: 80,
      scale: 0.95,
      stagger: staggerDelay,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: container,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [staggerDelay]);

  return containerRef;
}

// Hook for floating animation
export function useFloatingAnimation(
  ref: RefObject<HTMLElement>,
  options: {
    y?: number;
    duration?: number;
    delay?: number;
  } = {}
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const { y = 10, duration = 3, delay = 0 } = options;

    const animation = gsap.to(element, {
      y: -y,
      duration,
      delay,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    return () => {
      animation.kill();
    };
  }, [ref, options]);
}

// Hook for parallax effect
export function useParallax(
  ref: RefObject<HTMLElement>,
  speed: number = 0.5
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const animation = gsap.to(element, {
      y: () => window.innerHeight * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
      },
    });

    return () => {
      animation.kill();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, [ref, speed]);
}

// Hook for counter animation
export function useCounterAnimation(
  ref: RefObject<HTMLElement>,
  endValue: number,
  duration: number = 2
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const animation = gsap.to(element, {
      innerHTML: endValue,
      duration,
      ease: 'power2.out',
      snap: { innerHTML: 1 },
      scrollTrigger: {
        trigger: element,
        start: 'top 90%',
        toggleActions: 'play none none none',
      },
    });

    return () => {
      animation.kill();
    };
  }, [ref, endValue, duration]);
}

// Hook for magnetic effect on hover
export function useMagneticEffect(
  ref: RefObject<HTMLElement>,
  strength: number = 0.3
) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * strength;
      const deltaY = (e.clientY - centerY) * strength;

      gsap.to(element, {
        x: deltaX,
        y: deltaY,
        duration: 0.3,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.3)',
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref, strength]);
}

export { gsap, ScrollTrigger };
