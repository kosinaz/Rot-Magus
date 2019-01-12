const River = {
  put: function (layer, tile, noise) {
    let a, min;

    // calculate an astar map around the spring with a 4 direction topology
    a = new ROT.Path.AStar(tile.x, tile.y, function (x, y) {

      // get the tile at the next step
      let tile = layer.getTileAt(x, y);

      // if there is a tile
      if (tile) {

        // let the river flow there if there is a passable or water tile there
        return !tile.properties.unpassable || tile.index === 12;
      }

      // prevent the river flowing there every other times
      return false;
    }.bind({
      layer: layer
    }), {
      topology: 4
    });

    // target every stony water tile that is not a spring
    layer.forEachTile(function (tile) {
      let path = [];

      // if there is a stony water tile that is not a spring
      if (tile.index === 11 && !tile.properties.spring) {

        // find the shortest path to that tile
        a.compute(tile.x, tile.y, function (x, y) {

          // add the tile to the path
          path.push({
            x: x,
            y: y
          });
        }.bind({
          path: path
        }));

        // if there is no shortest path to compare or this path is shorter,
        // than the shortest path
        if (!min || path.length > 0 && path.length < min.length) {

          // save this path as the shortest path
          min = path;
        }
      }
    }, {
      layer: layer,
      a: a,
      min: min
    });

    // if the shortest path exists
    if (min && min.length > 0) {

      // get every tile of the path
      min.forEach(function (XY) {
        let tile;

        // 5% of the times
        if (noise.get(XY.x, XY.y) > 0.9) { 

          // put down a stony water
          tile = layer.putTileAt(11, XY.x, XY.y);

        // other 5% of the times
        } else if (noise.get(XY.x, XY.y) < -0.9) {

          // put down a lily
          tile = layer.putTileAt(13, XY.x, XY.y);
          tile.properties = {
            unpassable: true
          }

        // every other time
        } else {

          // put down water
          tile = layer.putTileAt(12, XY.x, XY.y);
          tile.properties = {
            unpassable: true
          }
        }
      }, {
        layer: layer,
        noise: noise
      })
    }
  }
};