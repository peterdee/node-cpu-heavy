module.exports = (heavier = false) => {
  const iterations = heavier ? 10e8 : 10e7;
  const now = Date.now();
  let sum = 0;
  for (let i = 0; i < iterations; i += 1) {
    sum += i;
  }
  return {
    delay: Date.now() - now,
    sum,
  };
};
