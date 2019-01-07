const Vegetation = {
  add: function (layer) {
    layer.weightedRandomize(0, 0, layer.width, layer.height, [{
      index: 0,
      weight: 100
    },
    {
      index: 1,
      weight: 1
    },
    {
      index: 2,
      weight: 1
    },
    {
      index: 16,
      weight: 3
    },
    {
      index: 17,
      weight: 10
    } // Tree
    ]);

    /**
     * Set the properties of every bush and tree
     */
    layer.forEachTile(function (tile) {
      if (tile.index === 16 || tile.index === 17) {
        if (!mapdebug) {
          tile.properties.unpassable = true;
          tile.properties.opaque = true;
        }
      }
    });
  }
};