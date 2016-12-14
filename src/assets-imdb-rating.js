const DNode = require('node-red-contrib-dnode');
const imdb = require('imdb-api');

module.exports = DNode.createNode('assets-imdb-rating', (dnode) => {
  dnode.onInput(async (msg) => {
    const assets = msg.payload;
    if (!Array.isArray(assets)) {
      throw new Error('missing assets array in payload');
    }
    await Promise.all(
      assets
        .filter(asset => asset.title)
        .map(asset => new Promise((resolve) => {
          const originalTitle = asset.title
            .replace(' (Hot from the US)', '')
            .replace(/ \(Season .*\)/, '');
          imdb.get(originalTitle, (err, data) => {
            if (err) {
              asset.imdb = { rating: 'N/A' };
            } else {
              asset.imdb = { rating: data.rating };
            }
            if (asset.imdb.rating !== 'N/A') {
              asset.title += ` (${asset.imdb.rating})`;
            }
            resolve();
          });
        })),
    );
    dnode.sendMessage(msg);
  });
});
