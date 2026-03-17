/**
 * @fileoverview
 * Animated Asana logo icon component for React applications.
 *
 * This file provides multiple variants of the Asana logo:
 * - AnimatedAsana: Core animated component with customizable behavior
 * - TriggerableAsana: Pre-configured to animate on hover
 * - ControlledAsana: Pre-configured for external state control
 * - StaticAsana: Static version for server-side rendering
 *
 * The animation shows three circles morphing into one and back, using
 * Motion (the successor to Framer Motion) for smooth animations.
 *
 * @requires React
 * @requires motion/react
 */

import React, {
  useCallback,
  useEffect,
  useState,
  useMemo,
  useRef,
} from "react";
import type { JSX } from "react";
import { motion } from "motion/react";

/** SVG element props for icon components */
export type IconProps = React.SVGProps<SVGSVGElement>;

/** Animation phase type - defines the visual state of the icon */
type AnimationPhase = "three-circles" | "one-circle";

/** Spring animation configuration */
interface SpringConfig {
  /** Spring stiffness (higher = faster, more bouncy) */
  stiffness?: number;
  /** Spring damping (higher = less oscillation) */
  damping?: number;
  /** Spring mass (higher = more inertia) */
  mass?: number;
}

/** Props for the Asana icon component with animation capabilities */
export interface AsanaIconProps extends IconProps {
  /** Control animation trigger from outside the component */
  trigger?: boolean;
  /** Whether to use mouse hover to trigger animation (defaults to true) */
  useTrigger?: boolean;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Custom spring animation configuration */
  springConfig?: SpringConfig;
  /** Whether to prioritize rendering this component */
  priority?: boolean;
}

/**
 * Animated Asana logo icon component
 *
 * A customizable SVG icon that animates between a three-circle and one-circle state.
 * The animation can be triggered by hover or controlled externally.
 *
 * @example
 * // Basic usage with hover trigger
 * <AnimatedAsana className="w-6 h-6" />
 *
 * @example
 * // Controlled by external state
 * const [isActive, setIsActive] = useState(false);
 * <AnimatedAsana trigger={isActive} useTrigger={false} />
 *
 * @param {AsanaIconProps} props - Component props
 * @returns {JSX.Element} Animated Asana icon
 */
export function AnimatedAsana({
  trigger = false,
  useTrigger = true, // Enable hover trigger by default
  animationDuration = 400, // Default animation duration
  springConfig = {
    stiffness: 180,
    damping: 15,
    mass: 1,
  },
  priority = false, // Default non-priority
  ...props
}: AsanaIconProps): JSX.Element {
  void priority;
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [animationPhase, setAnimationPhase] =
    useState<AnimationPhase>("three-circles");

  // Timer reference to track and manage animation sequence
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Flag to track if animation was started
  const animationStartedRef = useRef<boolean>(false);

  // Determine the effective trigger state
  const effectiveTrigger = useMemo<boolean>(
    () => trigger || (useTrigger && isHovered),
    [trigger, useTrigger, isHovered],
  );

  // Optimize spring animation config with memoization
  const springTransition = useMemo(
    () => ({
      type: "spring" as const,
      stiffness: springConfig.stiffness,
      damping: springConfig.damping,
      mass: springConfig.mass,
    }),
    [springConfig.stiffness, springConfig.damping, springConfig.mass],
  );

  // Optimize event handlers with useCallback
  const handleMouseEnter = useCallback(() => {
    if (useTrigger) {
      setIsHovered(true);
    }
  }, [useTrigger]);

  const handleMouseLeave = useCallback(() => {
    if (useTrigger) {
      setIsHovered(false);
    }
  }, [useTrigger]);

  // Control animation sequence based on effective trigger state changes
  useEffect(() => {
    // Clear any existing timers when trigger state changes
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }

    if (effectiveTrigger) {
      // Mark animation as started
      animationStartedRef.current = true;

      // Phase 1: Three circles transform into one circle
      setAnimationPhase("one-circle");

      // Phase 2: One circle transforms back to three circles after delay
      animationTimerRef.current = setTimeout(() => {
        setAnimationPhase("three-circles");
        animationTimerRef.current = null;
      }, animationDuration);
    } else if (animationStartedRef.current) {
      // When trigger is removed and animation was started,
      // ensure we return to three circles state
      setAnimationPhase("three-circles");
      animationStartedRef.current = false;
    }

    // Cleanup function to clear timeout if component unmounts during animation
    return () => {
      if (animationTimerRef.current) {
        clearTimeout(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    };
  }, [effectiveTrigger, animationDuration]);

  // Optimize animation configuration objects
  const centerCircleAnimation = useMemo(
    () => ({
      opacity: animationPhase === "one-circle" ? 1 : 0,
      scale: animationPhase === "one-circle" ? 1 : 0,
    }),
    [animationPhase],
  );

  const topCircleAnimation = useMemo(
    () => ({
      opacity: animationPhase === "three-circles" ? 1 : 0,
      y: animationPhase === "three-circles" ? 0 : 4.5,
      scale: animationPhase === "three-circles" ? 1 : 0,
    }),
    [animationPhase],
  );

  const leftBottomCircleAnimation = useMemo(
    () => ({
      opacity: animationPhase === "three-circles" ? 1 : 0,
      x: animationPhase === "three-circles" ? 0 : 5,
      y: animationPhase === "three-circles" ? 0 : -4.5,
      scale: animationPhase === "three-circles" ? 1 : 0,
    }),
    [animationPhase],
  );

  const rightBottomCircleAnimation = useMemo(
    () => ({
      opacity: animationPhase === "three-circles" ? 1 : 0,
      x: animationPhase === "three-circles" ? 0 : -5,
      y: animationPhase === "three-circles" ? 0 : -4.5,
      scale: animationPhase === "three-circles" ? 1 : 0,
    }),
    [animationPhase],
  );

  return (
    <svg
      width="1em"
      height="1em"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color="currentColor"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="img"
      aria-label="Asana logo"
      style={{ touchAction: "none" }} // Improve touch experience on mobile
      data-testid="asana-icon" // For testing
      {...props}
    >
      {/* Center circle - displayed in the first animation phase */}
      <motion.circle
        cx={12}
        cy={12}
        r={6}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ opacity: 0, scale: 0 }}
        animate={centerCircleAnimation}
        transition={{
          opacity: { duration: 0.2 },
          scale: { ...springTransition, duration: 0.3 },
        }}
      />

      {/* Top circle */}
      <motion.path
        d="M12 11.5C14.2091 11.5 16 9.70914 16 7.5C16 5.29086 14.2091 3.5 12 3.5C9.79086 3.5 8 5.29086 8 7.5C8 9.70914 9.79086 11.5 12 11.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ opacity: 1, y: 0, scale: 1 }}
        animate={topCircleAnimation}
        transition={{
          ...springTransition,
          delay: animationPhase === "three-circles" ? 0.1 : 0,
        }}
      />

      {/* Bottom left circle */}
      <motion.path
        d="M7 20.5C9.20914 20.5 11 18.7091 11 16.5C11 14.2909 9.20914 12.5 7 12.5C4.79086 12.5 3 14.2909 3 16.5C3 18.7091 4.79086 20.5 7 20.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        animate={leftBottomCircleAnimation}
        transition={{
          ...springTransition,
          delay: animationPhase === "three-circles" ? 0.15 : 0.05,
        }}
      />

      {/* Bottom right circle */}
      <motion.path
        d="M17 20.5C19.2091 20.5 21 18.7091 21 16.5C21 14.2909 19.2091 12.5 17 12.5C14.7909 12.5 13 14.2909 13 16.5C13 18.7091 14.7909 20.5 17 20.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
        animate={rightBottomCircleAnimation}
        transition={{
          ...springTransition,
          delay: animationPhase === "three-circles" ? 0.2 : 0.1,
        }}
      />
    </svg>
  );
}

/**
 * Variant of AnimatedAsana that automatically uses hover triggering
 *
 * @example
 * <TriggerableAsana className="w-6 h-6" />
 *
 * @param {Omit<AsanaIconProps, 'useTrigger'>} props - Component props excluding useTrigger
 * @returns {JSX.Element} Hover-triggerable Asana icon
 */
export const TriggerableAsana = React.memo(function TriggerableAsana(
  props: Omit<AsanaIconProps, "useTrigger">,
): JSX.Element {
  return <AnimatedAsana useTrigger={true} {...props} />;
});

/**
 * Variant of AnimatedAsana that is fully controlled by external state
 *
 * @example
 * const [isActive, setIsActive] = useState(false);
 * <ControlledAsana trigger={isActive} />
 *
 * @param {Omit<AsanaIconProps, 'useTrigger'>} props - Component props excluding useTrigger
 * @returns {JSX.Element} Externally controlled Asana icon
 */
export const ControlledAsana = React.memo(function ControlledAsana(
  props: Omit<AsanaIconProps, "useTrigger">,
): JSX.Element {
  return <AnimatedAsana useTrigger={false} {...props} />;
});

/**
 * Static version of the Asana icon for server-side rendering
 *
 * @example
 * // In a server component:
 * <StaticAsana className="w-6 h-6" />
 *
 * @param {Omit<IconProps, 'trigger' | 'useTrigger'>} props - Component props
 * @returns {JSX.Element} Static Asana icon
 */
export function StaticAsana(
  props: Omit<IconProps, "trigger" | "useTrigger">,
): JSX.Element {
  return (
    <svg
      width="1em"
      height="1em"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      color="currentColor"
      role="img"
      aria-label="Asana logo"
      {...props}
    >
      <path
        d="M12 11.5C14.2091 11.5 16 9.70914 16 7.5C16 5.29086 14.2091 3.5 12 3.5C9.79086 3.5 8 5.29086 8 7.5C8 9.70914 9.79086 11.5 12 11.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M7 20.5C9.20914 20.5 11 18.7091 11 16.5C11 14.2909 9.20914 12.5 7 12.5C4.79086 12.5 3 14.2909 3 16.5C3 18.7091 4.79086 20.5 7 20.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M17 20.5C19.2091 20.5 21 18.7091 21 16.5C21 14.2909 19.2091 12.5 17 12.5C14.7909 12.5 13 14.2909 13 16.5C13 18.7091 14.7909 20.5 17 20.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

/**
 * Animation phase constants for testing and reference
 * @const {Object} ANIMATION_PHASES
 */
export const ANIMATION_PHASES = {
  /** Three separate circles state */
  THREE_CIRCLES: "three-circles" as const,
  /** Single unified circle state */
  ONE_CIRCLE: "one-circle" as const,
};
