/*global ROT, ROTMAGUS*/
function ROTMAGUS() {
  'use strict';

  var map, view;
  map = new ROTMAGUS.Map();
  view = new ROTMAGUS.View();
  map.addObserver(view);

}
