/*global ROT, ROTMAGUS*/
ROTMAGUS.prototype.View = function () {
  'use strict';

  var tileSet = document.createElement('img');
  tileSet.src = 'tileset.png';

  /** @private */
  this.display = new ROT.Display({
    width: 21,
    height: 21,
    layout: 'tile',
    tileWidth: 24,
    tileHeight: 21,
    tileSet: tileSet,
    tileMap: {
      "@": [0, 0],
      ".": [0, 21],
      "#": [0, 42],
      "M": [0, 63],
      "*": [0, 84]
    }
  });

  document.body.appendChild(this.display.getContainer());

};
ROTMAGUS.View.prototype = ROTMAGUS.Subject();

ROTMAGUS.View.prototype.onNotify = function (subject, note) {
  'use strict';
  switch (note) {
  case 'show':
    this.setCenter(subject.center);
    this.show(subject.cells);
    window.addEventListener('click', this);
    window.addEventListener('mousemove', this);
    break;
  }
};

ROTMAGUS.View.prototype.handleEvent = function (e) {
  'use strict';
  switch (e.type) {
  case 'click':
    this.notify('order', {
      from: this.getCenter(),
      to: this.display.eventToPosition(e)
    });
    break;
  }
};
