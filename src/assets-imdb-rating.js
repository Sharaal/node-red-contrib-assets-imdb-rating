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
        .filter(asset => asset.searchTitle || asset.title)
        .map(asset => new Promise((resolve) => {
          imdb.get(asset.searchTitle || asset.title, (err, data) => {
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
