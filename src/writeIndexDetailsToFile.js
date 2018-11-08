const fs = require('mz/fs');

module.exports = async (file, data) => {
  const contents = JSON.stringify(data, null, 2)
  await fs.writeFile(file, contents);
}