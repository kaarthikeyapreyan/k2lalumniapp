export const mockDelay = (min: number = 300, max: number = 800): Promise<void> => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export const shouldFail = (failureRate: number = 0.05): boolean => {
  return Math.random() < failureRate;
};
