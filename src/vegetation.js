const Vegetation = {
  add: function (layer, areas) {
    const noise = new ROT.Noise.Simplex();
    areas.forEach(function (area) {
      area.forEach(function (position) {
        let XY = position.split(',');
        let density = noise.get(XY[0] / 64, XY[1] / 64) * 2 + 2;
        let tile;
        if (Math.random() * density > 2) {
          tile = layer.putTileAt(Math.random() > 0.3 ? 17 : 16, XY[0], XY[1]);
          if (!mapdebug) {
            tile.properties = {
              unpassable: true,
              opaque: true
            }
          }
        } else if (Math.random() * density < 0.03) {
          layer.putTileAt(Math.random() > 0.5 ? 1 : 2, XY[0], XY[1]);
        } else {
          layer.putTileAt(0, XY[0], XY[1]);
        }
      }, {
        layer: layer,
        noise: noise
      });
    }, {
      layer: layer,
      noise: noise
    });
  }
};