function padTo(number, digits = 3) {
  if (number <= Math.pow(10, digits) - 1) {
    number = (new Array(digits).join('0') + number).slice(-digits);
  }
  return number;
}

module.exports = padTo;
