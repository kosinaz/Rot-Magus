const Grassland = {
  put: function (noise, x, y, layer) {

    // check if there is a grass tile on the left
    let tile = layer.getTileAt(x - 1, y);

    // give 50% chance to put down two trees next to each other
    if (tile && !tile.index || noise.get(x, y) > 0) {

      // check if there is a grass tile on the top
      tile = layer.getTileAt(x, y - 1);

      // give 50% chance to put down two trees on top of each other
      if (tile && !tile.index || noise.get(x, y) < 0) {

        // determine the density level of the tile with a random noise based on
        // its position, first with a high, level 32 smoothness to determine 
        // the position of the forests and plains with 50%-50% chance,
        // then with a low, level 4 smoothness to generate the details 
        if (noise.get(x / 32, y / 32) + noise.get(x / 4, y / 4) > 0.5) {

          // 75% of the times put down a tree, else put down a bush
          tile = layer.putTileAt(noise.get(x, y) < 0.5 ? 17 : 16, x, y);
          tile.properties = {
            opaque: true,
            unpassable: true
          };
        } 

        // on the least dense areas put down a floor instead of a tree or bush
        else if (noise.get(x / 32, y / 32) + noise.get(x / 4, y / 4) < -1.8) {
          
          // put down floor
          tile = layer.putTileAt(9, x, y);
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