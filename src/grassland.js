const Grassland = {
  put: function (noise, x, y, layer) {
    let n = noise.get(x, y);

    // check if there is a grass tile on the left
    let tile = layer.getTileAt(x - 1, y);

    // give 25% chance to put down two trees next to each other
    if (tile && !tile.index || n > 0.5) {

      // check if there is a grass tile on the top
      tile = layer.getTileAt(x, y - 1);

      // give 25% chance to put down two trees on top of each other
      if (tile && !tile.index || n < -0.5) {

        // check if there is a grass tile on the top-left
        tile = layer.getTileAt(x - 1, y - 1);

        // give 25% chance to put down two trees diagonally to each other
        if (tile && !tile.index || -0.25 < n && n < 0.25) {

          // determine the density level of the tile with a random noise based 
          // on its position, first with a level 32 smoothness to determine 
          // the position of the forests and plains with 50%-50% chance,
          // then with a low, level 4 smoothness to generate the details 
          if (noise.get(x / 32, y / 32) + noise.get(x / 4, y / 4) > 0.5) {

            // 75% of the times put down a tree, else put down a bush
            tile = layer.putTileAt(n < 0.5 ? 17 : 16, x, y);
            tile.properties = {
              opaque: true,
              unpassable: true
            };
          } 

          // on the least dense areas put down a floor instead of a tree or bush
          else if (noise.get(x / 32, y / 32) + noise.get(x / 4, y / 4) < -1.7) {
            
            // put down floor
            tile = layer.putTileAt(9, x, y);
            tile.properties = {
              floor: true
            };
          }
          
          // on the more or less dense areas put down a flower
          else if (noise.get(x / 32, y / 32) + noise.get(x / 4, y / 4) < -1.6) {
            
            // 50% of the times put down a red flower, else a yellow flower
            tile = layer.putTileAt(noise.get(x, y) < 0 ? 1 : 2, x, y);
          } else {

            // every other time put down grass
            tile = layer.putTileAt(0, x, y);
          }
        } else {

          // every other time put down grass
          tile = layer.putTileAt(0, x, y);
        }
      } else {

        // every other time put grass under the existing tree
        tile = layer.putTileAt(0, x, y);
      }
    } else {

      // every other time put grass next to the existing tree
      tile = layer.putTileAt(0, x, y);
    } 
    
    // save the tile for later use
    return tile;
  }
};