/*global ROT, ROTMAGUS*/
ROTMAGUS = {};
ROTMAGUS.Subject = function () {
  'use strict';

  /** @private */
  this.observers = [];
};

ROTMAGUS.Subject.prototype.addObserver = function (observer) {
  'use strict';
  this.observers.push(observer);
};

ROTMAGUS.Subject.prototype.removeObserver = function (observer) {
  'use strict';
  this.observers.splice(this.observers.indexOf(observer), 1);
};

ROTMAGUS.Subject.prototype.notify = function (note, subject) {
  'use strict';
  var i;
  for (i = 0; i < this.observers.length; i += 1) {
    this.observers[i].onNotify(note, subject);
  }
};
