class SimplexMap {
  constructor() {
    this.noise = new ROT.Noise.Simplex();
  }
  getTileIndexAt(x, y) {

    // set the tile as grass by default
    let tileIndex = 0;

    // set a position-based low-frequency noise 
    // increase its amplitude to narrow down its median to a few tiles 
    // round it to the nearest integer
    // return the lowest values
    if (~~(this.noise.get((x) / 96, (y) / 96) * 8) < -6) {

      let n = this.noise.get(x, y);

      if (!~~(this.noise.get((x) / 48, (y) / 48) * 16)) {

        if (n > -0.6 && n < 0.6) {
          tileIndex = 11;
        } else if (n < -0.7) {
          tileIndex = 16;
        } else if (n > 0.7) {
          tileIndex = 13;
        } else {
          tileIndex = 0;
        }
      } else {

        if (n > -0.6 && n < 0.6) {
          tileIndex = 12;
        } else if (n < -0.8) {
          tileIndex = 11;
        } else if (n > 0.8) {
          tileIndex = 13;
        } else if (n > 0.75) {
          tileIndex = 16;
        } else {
          tileIndex = 0;
        }
      }


      // set a position-based low-frequency noise 
      // increase its amplitude to narrow down its median to a few tiles 
      // round it to the nearest integer
      // return the median
    } else if (!~~(this.noise.get((x) / 96, (y) / 96) * 8)) {

      let n = this.noise.get(x, y);
      if (!~~(this.noise.get((x) / 48, (y) / 48) * 16)) {

        
          tileIndex = 5;
       
      } else {

        // set the tile as rock
        tileIndex = 21;
      }


      // set a position-based low-frequency noise 
      // increase its amplitude to narrow down its median to one tile 
      // round it to the nearest integer
      // return the median
    } else if (!~~(this.noise.get((x) / 48, (y) / 48) * 16)) {


      // set the tile as grass
      tileIndex = 0;

      // set a position-based noise 
      // increase its amplitude
      // round it to the nearest integer
      // return the median
    } else if (!~~(this.noise.get(x, y) * 16)) {

      // set the tile as tree or bush or flowers
      let n = this.noise.get(x, y);
      if (n > -0.01 && n < 0.01) {
        tileIndex = 17;
      } else if (n < -0.03) {
        tileIndex = 1;
      } else if (n > 0.03) {
        tileIndex = 2;
      } else {
        tileIndex = 16;
      }
    }
    return tileIndex;
  }
}