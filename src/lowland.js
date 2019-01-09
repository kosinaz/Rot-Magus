const Lowland = {
  add: function (layer, areas) {
    areas.forEach(function (area) {
      area.forEach(function (position) {
        let XY = position.split(',');
        let tile = layer.putTileAt(12, XY[0], XY[1]);
        if (!mapdebug) {
          tile.properties = {
            unpassable: true
          }
        }
      }, layer);
    }, layer);
  }
};