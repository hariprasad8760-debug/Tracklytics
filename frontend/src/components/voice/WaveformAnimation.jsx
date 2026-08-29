/**
 * ============================================================================
 * FILE: src/components/voice/WaveformAnimation.jsx
 * ============================================================================
 * WHY THIS FILE IS NEEDED:
 *   Renders a premium animated audio waveform bar visualization.
 *   When listening: bars animate at different speeds/heights to simulate
 *   real audio activity. When idle: bars stay low and slow.
 * ============================================================================
 */

import React from 'react';

const BAR_COUNT = 28;

// Each bar gets a unique animation duration and delay for organic feel
const bars = Array.from({ length: BAR_COUNT }, (_, i) => ({
  id: i,
  delay: `${(i * 0.07).toFixed(2)}s`,
  duration: `${(0.6 + Math.random() * 0.7).toFixed(2)}s`,
  minH: 4 + Math.floor(Math.random() * 6),
  maxH: 20 + Math.floor(Math.random() * 30),
}));

export const WaveformAnimation = ({ isActive, color = '#a78bfa' }) => {
  return (
    <div
      className="flex items-center justify-center gap-[3px]"
      style={{ height: 56 }}
      aria-hidden="true"
    >
      {bars.map((bar) => (
        <div
          key={bar.id}
          style={{
            width: 3,
            borderRadius: 999,
            backgroundColor: color,
            minHeight: bar.minH,
            maxHeight: bar.maxH,
            height: bar.minH,
            opacity: isActive ? 0.85 : 0.25,
            animation: isActive
              ? `waveBar ${bar.duration} ${bar.delay} ease-in-out infinite alternate`
              : `waveBarIdle 2.5s ${bar.delay} ease-in-out infinite alternate`,
            transition: 'opacity 0.4s ease',
            '--bar-min': `${bar.minH}px`,
            '--bar-max': `${bar.maxH}px`,
          }}
        />
      ))}
      <style>{`
        @keyframes waveBar {
          0%   { height: var(--bar-min); }
          100% { height: var(--bar-max); }
        }
        @keyframes waveBarIdle {
          0%   { height: var(--bar-min); }
          100% { height: calc(var(--bar-min) + 6px); }
        }
      `}</style>
    </div>
  );
};

export default WaveformAnimation;
