const Heightmap = {
  add: function (layer) {
    const noise = new ROT.Noise.Simplex();
    const map = [
      [],
      [], 
      []
    ];
    let x, y, z;
    for (x = 0; x < layer.layer.width; x += 1) {
      for (y = 0; y < layer.layer.height; y += 1) {

        // determine the height level of the tile with a random noise based on
        // its position, first with a very high, level 128 smoothness to 
        // determine the higher and lowed parts of the map, then with a low, 
        // level 32 smoothness to generate the detailed features, and finally
        // convert it to integer, resulting in a height map with 3 well-defined
        // levels: 0 lakes/deep forest, 1 grasslands, 2 mountains/deserts
        z = ~~(noise.get(x / 128, y / 128) + noise.get(x / 32, y / 32)) + 1;

        // sort the connecting features to separate groups
        this.sort(map, x, y, z);
      }
    }
    return map;
  },
  sort: function (map, x, y, z) {
    let i, j;
    let extension = false;
    for (i = 0; i < map[z].length; i += 1) {

      // check all the separate shapes      
      if (map[z][i].includes(x + ',' + (y - 1))) {

        // if the top neighbor of the current tile has the same height, extend
        // the shape of the neighboring feature with the current tile
        extension = true;
        map[z][i].push(x + ',' + y);
        for (j = 1; j < map[z].length; j += 1) {

          // check all the separate features again except the neighboring one
          if (map[z][j].includes((x - 1) + ',' + y) && i !== j) {

            // if the left neighbor of the current tile also has the same 
            // height, concatenate the two neighboring shapes in the first 
            // shape, remove the second one, and stop looking for additional 
            // neighbors
            map[z][i] = map[z][i].concat(map[z][j]);            
            map[z].splice(map[z].indexOf(map[z][j]), 1);
            break;
          }
        }
        break;
      } else if(map[z][i].includes((x - 1) + ',' + y)) {

        // if the top neighbor of the current tile does not have the same 
        // height, but the left one has, extend the shape of the neighboring
        // feature with the current tile, and stop looking for additional 
        // neighbors
        extension = true;
        map[z][i].push(x + ',' + y);
        for (j = 1; j < map[z].length; j += 1) {

          // check all the separate features again except the neighboring one
          if (map[z][j].includes(x + ',' + (y - 1)) && i !== j) {

            // if the top neighbor of the current tile also has the same 
            // height, concatenate the two neighboring shapes in the first 
            // shape, remove the second one, and stop looking for additional 
            // neighbors
            map[z][i] = map[z][i].concat(map[z][j]);
            map[z].splice(map[z].indexOf(map[z][j]), 1);
            break;
          }
        }
        break;
      }
    }
    if (!extension) {

      // if no neighbor has the same height add the current tile as a new 
      // feature of that height level
      map[z].push([x + ',' + y]);
    }
  }
};