const Heightmap = {
  add: function (layer) {
    const noise = new ROT.Noise.Simplex();
    const heightmap = [];
    let tile = {};
    let index = -1;
    let properties = {};
    let x, y;
    for (x = 0; x < layer.layer.width; x += 1) {
      heightmap[x] = [];
      for (y = 0; y < layer.layer.height; y += 1) {

        // generate a smooth map then apply 3 levels of erosion
        heightmap[x][y] =
          noise.get(x / 96, y / 96) * 256 -
          noise.get(x / 64, y / 64) * 64 -
          noise.get(x / 32, y / 32) * 64 -
          noise.get(x / 16, y / 16) * 64;
        if (heightmap[x][y] > 192) {
          if (Math.random() < 0.995) {

            // most of the times change the highest parts to mountain rocks
            index = 21;
            properties = {
              unpassable: true,
              opaque: true
            };
          }
          else {

            // sometimes put down a spring
            index = 11;
          }
        }
        else if (heightmap[x][y] < -192) {

          // fill the lowest parts with water
          index = 12;
          properties = {
            unpassable: true
          };
        }
        if (index !== -1) {

          // add the mountains, springs and lakes to the map
          tile = new Phaser.Tilemaps.Tile(layer, index, x, y, 24, 21, 24, 21);
          tile = layer.putTileAt(tile, x, y);
          tile.properties = properties;
        }
      }
    }
  }
};