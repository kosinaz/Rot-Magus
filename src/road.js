const Road = {
  put: function (noise, x, y, layer) {
    let a, min;

    // calculate an astar map around the road with a 4 direction topology
    a = new ROT.Path.AStar(x, y, function (x, y) {

      // get the tile at the next step
      let tile = layer.getTileAt(x, y);

      // if there is a tile
      if (tile) {

        // let the road to be added if the tile is grass of stony water
        return !(tile.properties.unpassable 
          || tile.index === 1 
          || tile.index === 2);
      }

      // don't let the road to be added anyways
      return false;
    }.bind({
      layer: layer
    }), {
      topology: 4
    });

    // target every road tile
    layer.forEachTile(function (tile) {
      let path = [];

      // if the tile is the start tile
      if (tile.x === x && tile.y === y) {

        // skip this tile
        return;
      }

      // if there is a road tile
      if (tile.properties.road) {

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
      min: min,
      x: x,
      y: y
    });

    // if the shortest path exists
    if (min && min.length > 0) {

      // get every tile of the path
      min.forEach(function (XY, i, path) {

        let tile;

        // if this is the first or last tile of the path
        if (i === 0 || i === path.length - 1) {

          // skip this step
          return;
        }

        // if the tile current is stony water
        if (layer.getTileAt(XY.x, XY.y).index === 11) {

          // put down a bridge tile
          tile = layer.putTileAt(6, XY.x, XY.y);
          tile.properties = {
            bridge: true
          }

        // if any of the neighboring tiles is stony water or bridge
        } else if (layer.getTileAt(XY.x - 1, XY.y) &&
          (layer.getTileAt(XY.x - 1, XY.y).index === 11 ||
            layer.getTileAt(XY.x - 1, XY.y).properties.bridge) ||
          layer.getTileAt(XY.x + 1, XY.y) &&
          (layer.getTileAt(XY.x + 1, XY.y).index === 11 ||
            layer.getTileAt(XY.x + 1, XY.y).properties.bridge) ||
          layer.getTileAt(XY.x, XY.y - 1) &&
          (layer.getTileAt(XY.x, XY.y - 1).index === 11 ||
            layer.getTileAt(XY.x, XY.y - 1).properties.bridge) ||
          layer.getTileAt(XY.x, XY.y + 1) &&
          (layer.getTileAt(XY.x, XY.y + 1).index === 11 ||
            layer.getTileAt(XY.x, XY.y + 1).properties.bridge)) {

          // put down a bridge tile
          tile = layer.putTileAt(6, XY.x, XY.y);
          
        // if the tile is grass
        } else if (layer.getTileAt(XY.x, XY.y).index === 0) {

          // put down road
          layer.putTileAt(4, XY.x, XY.y);
        }
      }, {
        layer: layer,
        noise: noise
      })
    }    
  }
};