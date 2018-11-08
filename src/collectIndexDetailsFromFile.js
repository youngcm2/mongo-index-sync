const fs = require('mz/fs');
module.exports = async (file) => {

    const content = await fs.readFile(file);

    return JSON.parse(content);
}