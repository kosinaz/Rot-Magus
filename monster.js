function Monster(game) {
  this.game = game;
  this.x = ROT.RNG.getUniformInt(0, ROT.DEFAULT_WIDTH);
  this.y = ROT.RNG.getUniformInt(0, ROT.DEFAULT_HEIGHT);
  this.targetX = this.x;
  this.targetY = this.y;
  this.char = 'M';
  this.path = [];
}

Monster.prototype.act = function() {
  var x = this.x;
  var y = this.y;
  var ps = new ROT.FOV.PreciseShadowcasting(function (x, y) {
    if(this.game.terrain[x + ',' + y]) {
      return this.game.terrain[x + ',' + y].transparent;
    }
    return true;
  }.bind(this));
  ps.compute(this.x, this.y, 10, function(x, y) {
    if (this.game.actors[x + ',' + y]) {
      if (this.game.actors[x + ',' + y].char === '@') {
        this.targetX = x;
        this.targetY = y;
      }
    }
  }.bind(this));
  var astar = new ROT.Path.AStar(this.targetX, this.targetY, function(x, y) {
    if(this.game.terrain[x + ',' + y]) {
      return this.game.terrain[x + ',' + y].passable;
    }
    return true;
  }.bind(this), {topology: 4});
  this.path = [];
  astar.compute(x, y, function(x, y) {
    this.path.push([x, y]);
  }.bind(this));
  if (this.path.length > 1) {
    x = this.path[1][0];
    y = this.path[1][1];
  }
  if (!this.game.actors[x + ',' + y]) {
      this.game.actors[this.x + ',' + this.y] = null;
      this.x = x;
      this.y = y;
      this.game.actors[this.x + ',' + this.y] = this;
  }
}
