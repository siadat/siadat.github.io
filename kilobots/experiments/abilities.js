class AbilityPhototaxis {
  setup(robot) {
    this.direction = robot.rand_soft() % 2;
    this.last_value1 = null;
    this.last_value2 = null;
    this.last_updated = robot.rand_soft();
    this.PERIOD = 0;
  }

  doAntiphototaxis(robot) {
    this.anti = true;
    this.loop(robot, robot.get_ambientlight());
  }

  doPhototaxis(robot) {
    this.anti = false;
    this.loop(robot, robot.get_ambientlight());
  }

  loop(robot, value) {
    if(robot.kilo_ticks % 3 == 0)
      return;

    switch(this.direction) {
      case 0: robot.set_motors(0, robot.kilo_turn_right); break;
      case 1: robot.set_motors(robot.kilo_turn_left, 0); break;
      case 2: robot.set_motors(robot.kilo_straight_left, robot.kilo_straight_right); break;
    }

    if(robot.kilo_ticks < this.last_updated + 5 + this.PERIOD)
      return;

    this.last_updated = robot.kilo_ticks;
    // let value = this.get_ambientlight();

    let wantToGetClose = !this.anti;
    let wantToGetFar = this.anti;
    let isGettingFar = value <= this.last_value1;
    let isGettingClose = value >= this.last_value1;
    let wasGettingFar = this.last_value1 <= this.last_value2;
    let wasGettingClose = this.last_value1 >= this.last_value2;

    let noChange = value == this.last_value1 && value == this.last_value2;

    if(noChange) {
      this.direction = robot.kilo_uid % 2;
    } else if(
      this.last_value1 != null
      &&
      this.last_value2 != null
      &&
      (
        (wantToGetClose && isGettingFar && wasGettingClose)
        ||
        (wantToGetFar && isGettingClose && wasGettingFar)
      )
    ) {
      this.direction = (this.direction + 1) % 2;
      this.PERIOD = (this.PERIOD + 1) % 3;
    }

    this.last_value2 = this.last_value1;
    this.last_value1 = value;
  }
}

  /*

    const MAX_NEIGHBOURS = 60;
    const VACANT = -1;
    const NO_GRAD = 10000;
    const NO_POS = 100000;
    const STATIONARY = 1;
    const NOT_STATIONARY = 0;

class AbilityNeighborTracking {
  constructor() {
    {
      // ints:
      this.neighbors_id = new Int32Array(MAX_NEIGHBOURS);
      this.neighbors_grad = new Int32Array(MAX_NEIGHBOURS);
      this.neighbors_seen_at = new Int32Array(MAX_NEIGHBOURS);
      this.neighbors_pos_confidence = new Int32Array(MAX_NEIGHBOURS);
      this.neighbors_consensus_counter = new Int32Array(MAX_NEIGHBOURS);

      // floats:
      this.neighbors_dist = new Float64Array(MAX_NEIGHBOURS);
      this.neighbors_pos_x = new Float64Array(MAX_NEIGHBOURS);
      this.neighbors_pos_y = new Float64Array(MAX_NEIGHBOURS);

      // boolean:
      this.neighbors_is_seed = new Int32Array(MAX_NEIGHBOURS);
      this.neighbors_is_stationary = new Int32Array(MAX_NEIGHBOURS);

      // other:
      this.neighbors_state = new Array(); // string, TODO: change to int
      this.neighbors_robotsIveEdgeFollowed = new Array();

      for(let i = 0; i < MAX_NEIGHBOURS; i++) {
        this.neighbors_id[i] = VACANT;
        this.neighbors_grad[i] = NO_GRAD;
        this.neighbors_pos_x[i] = NO_POS;
        this.neighbors_pos_y[i] = NO_POS;
        this.neighbors_is_stationary[i] = STATIONARY;
      }
    }
  }
  message_rx(message, distance) {

    let index = -1;
    let existing = false;
    for(let i = 0; i < MAX_NEIGHBOURS; i++) {
      if(this.neighbors_id[i] == message.robotUID) {
        index = i;
        existing = true;
        break;
      }

      if(index == -1) { // do it only once
        if(this.neighbors_id[i] == VACANT || this.counter >= this.neighbors_seen_at[i] + this.NEIGHBOUR_EXPIRY) {
          index = i;
        }
      }
    }

    if(index == -1) {
      // console.error("did not found a place to add neighbor info");
      return;
    }

    if(existing
      && this.neighbors_grad[index] == message.grad
      && round(this.neighbors_dist[index]) == round(distance)
      && round(this.neighbors_pos_x[index]) == round(message.shapePos.x)
      && round(this.neighbors_pos_y[index]) == round(message.shapePos.y)
    ) {
    } else {
      this._cached_robust_quad = false;
    }

    this.neighbors_id[index] = message.robotUID;
    this.neighbors_grad[index] = message.grad;
    this.neighbors_state[index] = message.state;
    this.neighbors_seen_at[index] = this.counter;
    this.neighbors_dist[index] = distance;
    this.neighbors_pos_x[index] = message.shapePos.x;
    this.neighbors_pos_y[index] = message.shapePos.y;
    this.neighbors_is_seed[index] = message.isSeed;
    this.neighbors_is_stationary[index] = message.isStationary;
    this.neighbors_robotsIveEdgeFollowed[index] = message.robotsIveEdgeFollowed;
    this.neighbors_pos_confidence[index] = message.posConfidence;
    this.neighbors_consensus_counter[index] = message.consensusCounter;
  }
}
*/

class AbilityAttractAndAvoid {
  setup(robot) {
    this.direction = robot.rand_soft() % 2;
    this.last_value1 = null;
    this.last_value2 = null;
    this.last_updated = robot.rand_soft();
    this.PERIOD = 0;
    this.WAIT_DURATION = 5;
  }

  doAvoid(robot, value) {
    this.minimize = false;
    this.loop(robot, value);
  }

  doAttract(robot, value) {
    this.minimize = true;
    this.loop(robot, value);
  }

  loop(robot, value) {
    // this.didSomething = 0;
    // if(robot.kilo_ticks % this.WAIT_DURATION != 0) return;

    switch(this.direction) {
      case 0: robot.set_motors(0, robot.kilo_turn_right); break;
      case 1: robot.set_motors(robot.kilo_turn_left, 0); break;
      case 2: robot.set_motors(robot.kilo_straight_left, robot.kilo_straight_right); robot.set_color(robot.RGB(3, 0, 0)); break;
    }

    if(robot.kilo_ticks < this.last_updated + 0 + this.PERIOD)
      return;

    // if(this.direction == 2) //  && isGettingFar)
    //   return;

    this.last_updated = robot.kilo_ticks;

    let wantToMinimize = this.minimize;
    let wantToMaximize = !this.minimize;
    let isGettingSmall = value <= this.last_value1;
    let isGettingLarge = value >= this.last_value1;
    let wasGettingSmall = this.last_value1 <= this.last_value2;
    let wasGettingLarge = this.last_value1 >= this.last_value2;

    let noChange = Math.abs(value - this.last_value1) <= 0.1 && Math.abs(value - this.last_value2) <= 0.1;

    const MIN_VALUE = 0; // 2.01 * 1 /* RADIUS */;
    // console.log(wantToMaximize , isGettingLarge , wasGettingSmall);

    if(noChange) {
      // this.direction = robot.kilo_uid % 2;
    } else if(
      this.last_value1 != null
      &&
      this.last_value2 != null
      &&
      (
        (wantToMinimize && isGettingSmall && wasGettingLarge)
        ||
        (wantToMaximize && isGettingLarge && wasGettingSmall)
      )
    ) {
      // this.didSomething = 1;
      if(value > MIN_VALUE) {
        this.direction = (this.direction + 1) % 2;
        // this.direction = 2;
        // this.WAIT_DURATION = 1;
        this.PERIOD = (this.PERIOD + 1) % 3;
      }
    }

    this.last_value2 = this.last_value1;
    this.last_value1 = value;
  }
}

// node_modules/pixi.js/dist/pixi.js: Polygon.prototype.contains
class AbilityFuncs {
  static isPointInPolygon(polygonPoints, x, y) {
    let inside = false;

    // use some raycasting to test hits
    // https://github.com/substack/point-in-polygon/blob/master/index.js
    let length = polygonPoints.length / 2;

    for (let i = 0, j = length - 1; i < length; j = i++)
    {
      let xi = polygonPoints[i * 2];
      let yi = polygonPoints[(i * 2) + 1];
      let xj = polygonPoints[j * 2];
      let yj = polygonPoints[(j * 2) + 1];
      let intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * ((y - yi) / (yj - yi))) + xi);

      if (intersect)
      {
        inside = !inside;
      }
    }

    return inside;
  }

  static clockwiseAngle(p1, p2) {
    let dot = p1.x*p2.x + p1.y*p2.y;
    let det = p1.x*p2.y - p1.y*p2.x;
    return Math.atan2(det, dot);
  }

  static subtract(v1, v2) {
    return {
      x: v1.x - v2.x,
      y: v1.y - v2.y,
    }
  }

  static angleOfThreePoints(p1, p2, p3) {
    // p1 is the vertex
    let p12 = Math.sqrt(Math.pow(p1.x-p2.x, 2) + Math.pow(p1.y-p2.y, 2));
    let p13 = Math.sqrt(Math.pow(p1.x-p3.x, 2) + Math.pow(p1.y-p3.y, 2));
    let p23 = Math.sqrt(Math.pow(p2.x-p3.x, 2) + Math.pow(p2.y-p3.y, 2));
    return Math.acos(
      (Math.pow(p12, 2) + Math.pow(p13, 2) - Math.pow(p23, 2))
      /
      (2 * p12 * p13)
    );
  }

  static gradientNoise(randomFunc) {
    if(this.perlinNoiseValue == null) {
      this.perlinNoiseValue = 0.5;
    }

    this.perlinNoiseValue += (randomFunc()-0.5)/2;
    if(this.perlinNoiseValue > 1) this.perlinNoiseValue = 1;
    if(this.perlinNoiseValue < 0) this.perlinNoiseValue = 0;
    return this.perlinNoiseValue;
  }

  static toHexaGrid(gridPos, INITIAL_DIST) {
    let pos = {
      x: INITIAL_DIST/2,
      y: Math.sqrt(3) * INITIAL_DIST/2 + 2*INITIAL_DIST/2,
    };

    pos.x += gridPos.x * INITIAL_DIST + (gridPos.y%2==0 ? -INITIAL_DIST/2 : 0);
    pos.y += gridPos.y * INITIAL_DIST * Math.sqrt(3)/2;
    return pos;
  }
}
