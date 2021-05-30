const isFlag = (arg) => /^\-+[\w\d]+/.test(arg);

module.exports = isFlag;
