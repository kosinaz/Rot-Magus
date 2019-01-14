const House = {
  put: function (noise, x, y, layer) {
    new ROT.Map.Digger(30,30, {roomWidth: [3, 5], dugPercentage: 0.5});
    let n, i, tile;
    n = noise.get(x, y);
    x -= 2;
    y -= 2;
    for (i = 0; i < 5; i += 1) {
      tile = layer.putTileAt(n > 0 ? 19 : 22, x + i, y);
      if (tile) {
        tile.properties = {
          unpassable: true,
          opaque: true
        };
      }
      tile = layer.putTileAt(n > 0 ? 19 : 22, x + i, y + 3);
      if (tile) {
        tile.properties = {
          unpassable: true,
          opaque: true
        };
      }
    }
    for (i = 0; i < 4; i += 1) {
      tile = layer.putTileAt(n > 0 ? 19 : 22, x, y + i);
      if (tile) {
        tile.properties = {
          unpassable: true,
          opaque: true
        };
      }
      tile = layer.putTileAt(n > 0 ? 19 : 22, x + 4, y + i);
      if (tile) {
        tile.properties = {
          unpassable: true,
          opaque: true
        };
      }
    }
    for (i = 1; i < 4; i += 1) {
      tile = layer.putTileAt(n > 0.5 ? 7 : 9, x + i, y + 1);
      if (tile) {
        tile.properties = {
          unpassable: false,
          opaque: false
        };
      }
      tile = layer.putTileAt(n > 0.5 ? 7 : 9, x + i, y + 2);
      if (tile) {
        tile.properties = {
          unpassable: false,
          opaque: false
        };
      }
    }
    tile = layer.putTileAt(n > 0 ? 14 : 15, x + 2, y + 3);
    if (tile) {
      tile.properties = {
        opaque: true
      };
    }
  }
};