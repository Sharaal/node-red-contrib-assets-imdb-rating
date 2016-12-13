const imdb = require('imdb-api');

module.exports = (RED) => {
  RED.nodes.registerType('assets-imdb-rating', function NODE(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.status({});

    node.on('input', async (msg) => {
      node.status({ fill: 'grey', shape: 'dot', text: 'requesting...' });
      const assets = msg.payload;

      if (!Array.isArray(assets)) {
        node.status({ fill: 'yellow', shape: 'dot', text: 'payload not an assets array' });
        node.warn('payload not an assets array');
        return;
      }

      try {
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
        node.status({});
      } catch (e) {
        node.status({ fill: 'yellow', shape: 'dot', text: 'requesting error' });
        node.warn(`requesting error (${e.message})`);
      }

      node.send(msg);
    });
  });
};
