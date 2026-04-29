export const MAX_DATE_SPAN_DAYS = 366;
export const MAX_FUNNEL_STEPS = 6;

export const assertTimeWindow = (days: number) => {
  if (days < 1 || days > MAX_DATE_SPAN_DAYS) {
    throw new RangeError(`LAST requires 1..${MAX_DATE_SPAN_DAYS} days`);
  }
};

export const assertFunnelSteps = (n: number) => {
  if (n < 2 || n > MAX_FUNNEL_STEPS) {
    throw new RangeError(`FUNNEL requires 2..${MAX_FUNNEL_STEPS} steps`);
  }
};
