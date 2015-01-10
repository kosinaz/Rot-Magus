/*global RM*/
RM.Item = function (type) {
  'use strict';
  this.type = type;
  if (type.count) {
    this.count = type.count;
  }
  this.tile = type.tile;
};
