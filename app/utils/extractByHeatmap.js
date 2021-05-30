function extractByHeatmap(content, heatMap = [], min = 1) {
  let result = '';
  for (let index = 0; index < heatMap.length; index++) {
    if (heatMap[index] >= min) {
      result += content[index];
    }
  }
  return result;
}

module.exports = extractByHeatmap;
