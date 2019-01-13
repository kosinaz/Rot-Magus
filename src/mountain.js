const Mountain = {
  put: function (noise, x, y, layer) {
    let tile;

    // most of the times
    if (noise.get(x, y) < 0.95) {

      // put down rock
      tile = layer.putTileAt(21, x, y);
      tile.properties = {
        opaque: true,
        unpassable: true
      };

    // sometimes
    } else if (noise.get(x, y) < 0.995) {

      // put down spring
      tile = layer.putTileAt(11, x, y);
      tile.properties = {
        spring: true
      };

    // rarely
    } else {

      // put down floor
      tile = layer.putTileAt(9, x, y);
    }

    // save the tile for later use
    return tile;
  }
};