const Highland = {
  add: function (layer, areas) {
    areas.forEach(function (area) {
      if (Math.random() > 0.3) {
        area.forEach(function (position) {
          let XY = position.split(',');
          let tile = layer.putTileAt(21, XY[0], XY[1]);
          if (!mapdebug) {
            tile.properties = {
              unpassable: true,
              opaque: true
            }
          }
        }, layer);
      } else {
        area.forEach(function (position) {
          let XY = position.split(',');
          if (Math.random() > 0.01) {
            layer.putTileAt(3, XY[0], XY[1]);         
          } else {
            let tile = layer.putTileAt(18, XY[0], XY[1]);
            if (!mapdebug) {
              tile.properties = {
                unpassable: true,
                opaque: true
              }
            }
          }
        }, layer);
      }
    }, layer);
  }
};