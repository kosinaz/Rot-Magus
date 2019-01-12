const Start = {
  put: function (groundLayer, features) {

    // create a dynamic layer for the tilemap layer in the map of features
    const featureLayer = features.createDynamicLayer();

    // find the start on the feature map
    let start = features.findObject('features', obj => obj.name === 'start');

    // get all its tiles within the dimensions of the start location
    featureLayer.forEachTile(function (tile) {

      // hide it
      tile.alpha = 0;

      // shift the tile index to the expected state
      tile.index -= 1;

      // put down the tile around the center of the map
      groundLayer.putTileAt(tile, tile.x + 122, tile.y + 122);
    }, {
      featureLayer: featureLayer,
      groundLayer: groundLayer
    }, start.x, start.y, start.width / 24, start.height / 21);
  }
};