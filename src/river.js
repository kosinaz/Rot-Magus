const River = {
  put: function (noise, x, y, layer) {
    let a, min, i, tile;

    // calculate an astar map around the spring with a 4 direction topology
    a = new ROT.Path.AStar(x, y, function (x, y) {

      // get the tile at the next step
      let tile = layer.getTileAt(x, y);

      // if there is a tile
      if (tile) {

        // let the river flow there only if it is a water or grass tile
        return tile.index === 0 
        || tile.index === 11 
        || tile.index === 12 
        || tile.index === 13
      }

      // prevent the river flowing there every other times
      return false;
    }.bind({
      layer: layer
    }), {
      topology: 4
    });

    // target every lake tile
    layer.forEachTile(function (tile) {
      let path = [];

      // if there is a lake tile
      if (tile.properties.lake) {

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

        // if there is no shortest path to compare or this path is shorter
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
      for (i = min.length - 1; i > 0; i -= 1) {

        // if the river already reached a lake
        if (layer.getTileAt(min[i].x, min[i].y).index === 12) {

          // stop the river
          break;
        }

        // 15% of the times
        if (noise.get(min[i].x, min[i].y) > 0.7) { 

          // put down a stony water
          tile = layer.putTileAt(11, min[i].x, min[i].y);

        // other 15% of the times
        } else if (noise.get(min[i].x, min[i].y) < -0.7) {

          // put down a lily
          tile = layer.putTileAt(13, min[i].x, min[i].y);
          tile.properties = {
            unpassable: true
          }

        // every other time
        } else {

          // put down water
          tile = layer.putTileAt(12, min[i].x, min[i].y);
          tile.properties = {
            unpassable: true
          }
        }
      }
    }
  }
};