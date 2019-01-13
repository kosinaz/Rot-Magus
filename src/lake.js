const Lake = {
  put: function (noise, x, y, layer) {
    let tile;

    // most of the times
    if (noise.get(x, y) < 0.9) {

      // put down water
      tile = layer.putTileAt(12, x, y);
      tile.properties = {
        unpassable: true
      };

    // sometimes
    } else if (noise.get(x, y) < 0.99) {

      // put down lily
      tile = layer.putTileAt(13, x, y);
      tile.properties = {
        unpassable: true,
        lake: true
      };

    // rarely
    } else if (noise.get(x, y) < 0.995) {

      // put down stones
      tile = layer.putTileAt(11, x, y);
      tile.properties = {
        lake: true
      };

    // even less of the times
    } else {

      // put down floor
      tile = layer.putTileAt(9, x, y);
    }

    // save the tile for later use
    return tile;
  }
};