module.exports = () => {
  const now = Date.now();
  let sum = 0;
  for (let i = 0; i < 10e7; i += 1) {
    sum += i;
  }
  return {
    delay: Date.now() - now,
    sum,
  };
};
