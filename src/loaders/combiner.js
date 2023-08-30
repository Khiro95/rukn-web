const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

module.exports = function(source) {
    const options = this.getOptions();
    const callback = this.async();

    const compsPath = path.resolve(options.componentsPath || 'src/components');

    const comps = [];
    const promises = [];

    const importModulePromise = promisify(
        (req, callback) => this.importModule(req, { publicPath: options.publicPath || '' }, callback));

    for (const file of fs.readdirSync(compsPath)) {
        if (file.endsWith('.html')) {
            this.addDependency(path.resolve(compsPath, file));
            const contentPromise = importModulePromise(path.resolve(compsPath, file))
                .then(src => comps.push(src.default || src));
            promises.push(contentPromise);
        }
    }

    const mainHtmlPromise = importModulePromise(this.resourcePath)
        .then(src => source = src.default || src);
    promises.push(mainHtmlPromise);

    Promise.all(promises)
        .then(() => {
            source = source.replace('</body>', `</body>\n${comps.join('\n')}\n`);
            callback(null, source/*`module.exports = \`${source}\``*/);
        })
        .catch(err => callback(err, null));
}