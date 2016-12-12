const imdb = require('imdb-api');

module.exports = (RED) => {
  RED.nodes.registerType('assets-imdb-rating', function NODE(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    node.on('input', async (msg) => {
      const assets = msg.payload;

      if (!Array.isArray(assets)) {
        node.warn('payload is not an assets array');
        return;
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
          })
        )
      );

      node.send(msg);
    });
  });
};
