const House = {
  put: function (noise, x, y, layer) {
    let n, i, tile;

    // get the local noise value
    n = noise.get(x, y);

    // start to build the house on the left instead of the center
    x -= 2;

    // start to build the house on the top instead of the middle
    y -= 2;

    // make the horizontal walls 5 tile long
    for (i = 0; i < 5; i += 1) {

      // put down the top wall with a 50%-50% chance of stone or wood
      tile = layer.putTileAt(n > 0 ? 19 : 22, x + i, y);
      if (tile) {
        tile.properties = {
          unpassable: true,
          opaque: true
        };
      }

      // put down the bottom wall with a 50%-50% chance of stone or wood
      tile = layer.putTileAt(n > 0 ? 19 : 22, x + i, y + 3);
      if (tile) {
        tile.properties = {
          unpassable: true,
          opaque: true
        };
      }
    }
    
    // make the vertical walls 5 tile long
    for (i = 0; i < 4; i += 1) {

      // put down the left wall with a 50%-50% chance of stone or wood
      tile = layer.putTileAt(n > 0 ? 19 : 22, x, y + i);
      if (tile) {
        tile.properties = {
          unpassable: true,
          opaque: true
        };
      }

      // put down the right wall with a 50%-50% chance of stone or wood
      tile = layer.putTileAt(n > 0 ? 19 : 22, x + 4, y + i);
      if (tile) {
        tile.properties = {
          unpassable: true,
          opaque: true
        };
      }
    }

    // put down 3 pairs of floor tiles 
    for (i = 1; i < 4; i += 1) {

      // put down first row of floor with a 50%-50% chance of stone or wood
      tile = layer.putTileAt(n > 0.5 ? 7 : 9, x + i, y + 1);
      if (tile) {
        tile.properties = {
          unpassable: false,
          opaque: false
        };
      }

      // put down second row of floor with a 50%-50% chance of stone or wood
      tile = layer.putTileAt(n > 0.5 ? 7 : 9, x + i, y + 2);
      if (tile) {
        tile.properties = {
          unpassable: false,
          opaque: false
        };
      }
    }

    // put down the door on the middle of the bottom wall with a 50%-50% chance
    // of iron or wood
    tile = layer.putTileAt(n > 0 ? 14 : 15, x + 2, y + 3);
    if (tile) {      
      tile.properties = {
        opaque: true
      };
    }

    // put down the beginning of a road under the door
    tile = layer.putTileAt(4, x + 2, y + 4);
    if (tile) {
      tile.properties = {
        road: true
      };
    }
  }
};