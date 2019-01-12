const Heightmap = {
  add: function (layer) {
    let x, y, z, tile;

    // generate a noise to use it throughout the whole procedural map generation
    const noise = new ROT.Noise.Simplex();

    // go through all tiles of the map
    for (x = 0; x < layer.layer.width; x += 1) {
      for (y = 0; y < layer.layer.height; y += 1) {

        // determine the height level of the tile with a random noise based on
        // its position, first with a very high, level 128 smoothness to 
        // determine the higher and lower parts of the map, then with a low, 
        // level 32 smoothness to generate the detailed features
        z = noise.get(x / 128, y / 128) + noise.get(x / 32, y / 32);

        // check if the tile is on the top level
        if (~~z === 1) {

          // put down mountain
          tile = Mountain.put(noise, x, y, layer);

        // check if the tile is on the mid level
        } else if (~~z === 0) {

          // put down grassland
          tile = Grassland.put(noise, x, y, layer);

        // check if the tile is on the bottom level
        } else {

          // put down lake
          tile = Lake.put(noise, x, y, layer);
        }

        // save the height for later use
        tile.z = z;
      }
    }
  }
};