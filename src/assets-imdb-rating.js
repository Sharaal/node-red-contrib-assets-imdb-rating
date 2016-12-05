const imdb = require('imdb-api');

module.exports = (RED) => {
  RED.nodes.registerType('assets-imdb-rating', function NODE(config) {
    RED.nodes.createNode(this, config);
    const node = this;
    node.on('input', async (msg) => {
      const asset = msg.payload;
      if (!asset.title) {
        node.warn('no title in the payload');
        return;
      }
      asset.imdb = await new Promise((resolve) => {
        const originalTitle = asset.title
          .replace(' (Hot from the US)', '')
          .replace(/ \(Season .*\)/, '');
        imdb.get(originalTitle, (err, data) => {
          if (err) {
            resolve({ rating: 'N/A' });
          } else {
            resolve({ rating: data.rating });
          }
        });
      });
      if (asset.imdb.rating !== 'N/A') {
        asset.title += ` (${asset.imdb.rating})`;
      }
      node.send(msg);
    });
  });
};
