function Adventurer(game) {
  this.game = game;
  this.x = ROT.RNG.getUniformInt(0, ROT.DEFAULT_WIDTH);
  this.y = ROT.RNG.getUniformInt(0, ROT.DEFAULT_HEIGHT);
  this.char = '@';
  this.drawFOV();
}

Adventurer.prototype.act = function() {
  this.drawFOV();
  this.game.engine.lock();
  window.addEventListener('keydown', this);
}

Adventurer.prototype.drawFOV = function() {
  var x, y;
  for (x = 0; x < ROT.DEFAULT_WIDTH; x += 1) {
    for (y = 0; y < ROT.DEFAULT_HEIGHT; y += 1) {
      this.game.display.draw(x, y, '');
    }
  }
  var ps = new ROT.FOV.PreciseShadowcasting(function (x, y) {
    if(this.game.terrain[x + ',' + y]) {
      return this.game.terrain[x + ',' + y].transparent;
    }
    return true;
  }.bind(this));
  var offset = Math.floor(this.game.display.getOptions().height / 2);
  ps.compute(this.x, this.y, offset, function(x, y) {
    var c = '.';
    if (this.game.actors[x + ',' + y]) {
      c = this.game.actors[x + ',' + y].char;
    } else if (this.game.terrain[x + ',' + y]) {
      c = this.game.terrain[x + ',' + y].char;
    }
    this.game.display.draw(x - this.x + offset, y - this.y + offset, c);
  }.bind(this));
}

Adventurer.prototype.handleEvent = function(e) {
  var x = this.x;
  var y = this.y;
  switch (e.keyCode) {
    case 37:
      x -= 1;
      break;
    case 38:
      y -= 1;
      break;
    case 39:
      x += 1;
      break;
    case 40:
      y += 1;
      break;
  }
  if (!this.game.actors[x + ',' + y] &&
    (!this.game.terrain[x + ',' + y] ||
    (this.game.terrain[x + ',' + y] &&
    this.game.terrain[x + ',' + y].passable))) {
      this.game.actors[this.x + ',' + this.y] = null;
      this.x = x;
      this.y = y;
      this.game.actors[this.x + ',' + this.y] = this;
  }
  window.removeEventListener("keydown", this);
  this.game.engine.unlock();
}
