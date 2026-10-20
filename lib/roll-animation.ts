export const SPIN_DURATION = 5600;

// Integrate one continuous velocity curve: smooth acceleration, steady speed,
// then a long quartic coast to zero. Linear interpolation between samples keeps
// the compositor in control without per-frame React renders or timer chains.
export function reelKeyframes(start: number, end: number): Keyframe[] {
  const acceleration = 0.1;
  const cruise = 0.18;
  const braking = 1 - acceleration - cruise;
  const distance = acceleration / 2 + cruise + braking / 4;

  return Array.from({ length: 121 }, (_, index) => {
    const time = index / 120;
    let travelled: number;
    let velocity: number;
    if (time < acceleration) {
      const u = time / acceleration;
      travelled = acceleration * (u ** 3 - u ** 4 / 2);
      velocity = 3 * u ** 2 - 2 * u ** 3;
    } else if (time < acceleration + cruise) {
      travelled = acceleration / 2 + time - acceleration;
      velocity = 1;
    } else {
      const u = (time - acceleration - cruise) / braking;
      travelled =
        acceleration / 2 + cruise + (braking * (1 - (1 - u) ** 4)) / 4;
      velocity = (1 - u) ** 3;
    }
    return {
      offset: time,
      transform: `translateX(${index === 120 ? end : start + ((end - start) * travelled) / distance}px)`,
      filter: `blur(${(velocity * 0.65).toFixed(3)}px)`,
    };
  });
}

export function reducedReelKeyframes(start: number, end: number): Keyframe[] {
  // Fade between positions rather than rapidly travelling across the screen.
  return [
    { transform: `translateX(${start}px)`, opacity: 1, offset: 0 },
    { transform: `translateX(${start}px)`, opacity: 0, offset: 0.45 },
    { transform: `translateX(${end}px)`, opacity: 0, offset: 0.5 },
    { transform: `translateX(${end}px)`, opacity: 1, offset: 1 },
  ];
}
