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

class AbilityBellmanFordRouting {
  constructor(robot, defunct, isEndpoint, linkDist) {

    this.robot = robot;
    this.defunct = defunct;
    this.isEndpoint = isEndpoint;
    this.linkDist = linkDist

    this.COLORS = [
      this.robot.RGB(3, 0, 0), // red
      this.robot.RGB(3, 0, 3), // magenta
      // this.robot.RGB(0, 0, 3), // blue
      this.robot.RGB(0, 3, 3), // cyan
      this.robot.RGB(0, 3, 0), // green
      this.robot.RGB(3, 3, 0), // yellow
    ];
  }

  setup() {
    this.routingTable = {};
    this.userPackets = [];
    this.offset = this.robot.rand_soft();

    if(this.isEndpoint) {
      // add self
      this.routingTable[this.robot.kilo_uid] = {
        cost: 0,
        expireAt: Infinity,
        link: null,
      };
    }

    // if(this.defunct) {
    //   this.robot.set_color(this.robot.RGB(0, 0, 0));
    // } else {
    //   // if(this.isEndpoint) {
    //   //   this.robot.set_color(this.robot.RGB(3, 0, 0));
    //   // } else {
    //   //   this.robot.set_color(this.robot.RGB(0, 0, 0));
    //   // }
    // }
  }

  setColor(c) {
    this.lastColorUpdatedAt = this.robot.kilo_ticks;
    // this.lastColor2 = this.lastColor1;
    // this.lastColor1 = c;
    this.robot.set_color(c);
  }

  loop() {
    this.expireRoutes();
  }

  expireRoutes() {
    Object.keys(this.routingTable).forEach(id => {
      if(this.robot.kilo_ticks > this.routingTable[id].expireAt) {
        delete(this.routingTable[id]);
      }
    });
  }

  message_tx() {
    if(this.defunct) return null;

    let msg = {
      id: this.robot.kilo_uid,
      vector: Object.keys(this.routingTable).map(id => {return {id: id, cost: this.routingTable[id].cost}}),
      userPackets: this.userPackets,
    };


    // if(this.lastPacketSent == null || this.robot.kilo_ticks > this.lastPacketSent + 30) {
      this.userPackets = [];
    // }
    return msg;
  }

  message_rx(message, distance) {
    if(this.defunct) return;

    if(distance > this.linkDist)
      return;

    for(let i = 0; i < message.vector.length; i++) {
      let destID = message.vector[i].id;
      let destCost = message.vector[i].cost;

      let currBestCost = this.routingTable[destID] && this.routingTable[destID].cost;
      let currBestExpireAt = this.routingTable[destID] && this.routingTable[destID].expireAt;

      if(
        (currBestCost == null)
        ||
        (destCost + distance <= currBestCost)
        ||
        (this.robot.kilo_ticks > currBestExpireAt)
      ) {
        this.routingTable[destID] = {
          cost: destCost + distance,
          expireAt: this.robot.kilo_ticks + 60,
          link: message.id,
        }
      }
    }

    let neighborPackets = message.userPackets;

    for(let j = 0; j < neighborPackets.length; j++) {
      let p = neighborPackets[j];
      if(p.link != this.robot.kilo_uid) // not for me
        continue;

      if(p.dest == this.robot.kilo_uid) // it is me!
        continue;

      if(!this.routingTable[p.dest]) // I don't know how to send it
        continue;

      // p.history.push(this.robot.kilo_uid);
      this.userPackets.push({
        data: p.data,
        dest: p.dest, // copy dest
        src: p.src,
        link: this.routingTable[p.dest].link, // choose link
        // history: p.history // copy dest
      });
    }
  }

  sendSomething() {
    if(!this.isEndpoint) return;

    if((this.robot.kilo_ticks + this.offset) % 200 == 0) {
      let ids = Object.keys(this.routingTable).filter(id => id != this.robot.kilo_uid);
      let idx = Math.floor(this.robot.kilo_ticks/240) % ids.length;
      let packetDestID = ids[idx];

      if(this.routingTable[packetDestID]) {
        this.userPackets.push({
          data: 1,
          dest: packetDestID,
          src: this.robot.kilo_uid,
          link: this.routingTable[packetDestID].link,
          // history: [this.robot.kilo_uid],
        });
      }
    }
  }

  getColorForID(id) {
    return this.COLORS[id % this.COLORS.length];
  }

  updateColors() {
    if(this.defunct) {
      this.robot.set_color(this.robot.RGB(1, 1, 1));
    } else if(this.isEndpoint) {
      this.setColor(this.getColorForID(this.robot.kilo_uid));
    } else if(this.userPackets.length == 1) {
      this.setColor(this.getColorForID(this.userPackets[0].dest));
      // this.setColor(this.COLORS[this.userPackets[0].dest % this.COLORS.length]);
    } else if(this.userPackets.length > 1) {
      // this.setColor(this.robot.RGB(3, 3, 3));
      // let idx = Math.floor(this.userPackets.length * this.robot.rand_soft()/256);
      // this.setColor(this.COLORS[this.userPackets[idx].dest % this.COLORS.length]);
      let idx = Math.floor(this.userPackets.length * this.robot.rand_soft()/256);
      this.setColor(this.getColorForID(this.userPackets[idx].dest));
      // this.setColor(this.COLORS[this.userPackets[idx].dest % this.COLORS.length]);
    } else if(Object.keys(this.routingTable).length > 0) {

      if(this.lastColorUpdatedAt == null) { // || this.robot.kilo_ticks > this.lastColorUpdatedAt + 240) {
        this.robot.set_color(this.robot.RGB(0, 0, 0));
      } else {
        this.robot.set_color(this.robot.RGB(0, 0, 0));

        // this.robot.set_color(this.robot.RGB(0, 1, 2));
        // if(this.robot.kilo_ticks < this.lastColorUpdatedAt + 60) {
        //   this.robot.set_color(this.robot.RGB(0, 1, 2));
        //   // this.robot.set_color(this.lastColor2);
        // } else {
        //   this.robot.set_color(this.robot.RGB(1, 1, 1));
        // }
      }

    } else {
      this.robot.set_color(this.robot.RGB(1, 1, 1));
    }
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

  // ----

  static matrixTranslate (m, x, y) {
    m.tx += x;
    m.ty += y;
  }

  static matrixRotate(m, angle) {
    var cos = Math.cos(angle);
    var sin = Math.sin(angle);

    var a1 = m.a;
    var c1 = m.c;
    var tx1 = m.tx;

    m.a = (a1 * cos) - (m.b * sin);
    m.b = (a1 * sin) + (m.b * cos);
    m.c = (c1 * cos) - (m.d * sin);
    m.d = (c1 * sin) + (m.d * cos);
    m.tx = (tx1 * cos) - (m.ty * sin);
    m.ty = (tx1 * sin) + (m.ty * cos);
  }

  static matrixApply(m, pos) {
    let newPos = {x: 0, y: 0};

    var x = pos.x;
    var y = pos.y;

    newPos.x = (m.a * x) + (m.c * y) + m.tx;
    newPos.y = (m.b * x) + (m.d * y) + m.ty;

    return newPos;
  }

  static rotatePoint(angle, origin, pos) {
    let m = {
      a: 1,
      b: 0,
      c: 0,
      d: 1,
      tx: 0,
      ty: 0,
    };

    this.matrixTranslate(m, -origin.x, -origin.y)
    this.matrixRotate(m, angle);
    let newPos = this.matrixApply(m, pos);
    this.matrixTranslate(m, +origin.x, +origin.y)
    return this.matrixApply(m, pos);
  }
}
