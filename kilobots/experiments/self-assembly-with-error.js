{
const MAX_NEIGHBOURS = 60;
const VACANT = -1;

const NO_GRAD = 10000;
const NO_POS = 100000;

const STATIONARY = 1;
const NOT_STATIONARY = 0;

const calculateDistancePerf = function(x1, x2, y1, y2) {
  return Math.sqrt(
    (x1 - x2) ** 2 + (y1 - y2) ** 2
    // Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)
  );
}

const calculateDistance = function(pos1, pos2) {
  return Math.sqrt(
    Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
  );
}

const round = function(x) {
  // radius is 1, so a resolution of 0.1 is good enough
  return Math.round(x * 10)/10.0;
}

const pow2 = x => x*x;

if(false){
	function fetchAndInstantiate(url, importObject) {
		return fetch(url).then(response =>
			response.arrayBuffer()
		).then(bytes =>
			WebAssembly.instantiate(bytes, importObject)
		).then(results =>
			results.instance
		);
	}
	var go = new Go();
	var mod = fetchAndInstantiate("/robust.wasm", go.importObject);
	window.onload = function() {
		mod.then(function(instance) {
			go.run(instance);
		});
	};
}


let triangle_p_x = new Float64Array(4);
let triangle_p_y = new Float64Array(4);
let triangle_x = new Float64Array(3);
let triangle_y = new Float64Array(3);

let triangle_e = new Float64Array(3);
let triangle_a = new Float64Array(3);
let triangle_e2 = new Float64Array(3);

/*
let ACOS_RESOLUTION = 10000;
let acosArray = new Float64Array(ACOS_RESOLUTION );
// let acosArray = {}; // new Float64Array(100);

for(let i = 0; i < ACOS_RESOLUTION; i++) {
  let v = 2.0 * i/ACOS_RESOLUTION - 1.0;
  let angle = Math.acos(v);
  acosArray[i] = angle;
}

function arccos(x) {
  let v = ACOS_RESOLUTION*(x*0.5 + 0.5);
  return Math.floor(v);
}
  */

// To enable WASM:
//   window.isTriangleRobustC = Module.cwarp('isTriangleRobustC', 'number', ['number', 'number', 'number', 'number', 'number', 'number']);

// window.isTriangleRobustC_JS_counter = 0;
window.isTriangleRobustC = (x0, y0, x1, y1, x2, y2) => {
  // window.isTriangleRobustC_JS_counter++;
  triangle_e2[0] = (x1 - x2)**2 + (y1 - y2)**2;
  triangle_e2[1] = (x0 - x2)**2 + (y0 - y2)**2;
  triangle_e2[2] = (x0 - x1)**2 + (y0 - y1)**2;

  triangle_e[0] = Math.sqrt(triangle_e2[0]);
  triangle_e[1] = Math.sqrt(triangle_e2[1]);
  triangle_e[2] = Math.sqrt(triangle_e2[2]);

  triangle_a[0] = Math.acos((triangle_e2[1] + triangle_e2[2] - triangle_e2[0]) / (2 * triangle_e[1] * triangle_e[2]));
  triangle_a[1] = Math.acos((triangle_e2[0] + triangle_e2[2] - triangle_e2[1]) / (2 * triangle_e[0] * triangle_e[2]));
  triangle_a[2] = Math.acos((triangle_e2[1] + triangle_e2[0] - triangle_e2[2]) / (2 * triangle_e[1] * triangle_e[0]));

  let minAngle = Math.min(triangle_a[0], triangle_a[1], triangle_a[2]);
  let minEdge  = Math.min(triangle_e[0], triangle_e[1], triangle_e[2]);

  if(isNaN(minAngle)) return false;
  return minAngle > Math.PI * 15 / 180;
}

window.isTriangleRobust = (points_x, points_y) => {
  triangle_e2[0] = (points_x[1] - points_x[2])**2 + (points_y[1] - points_y[2])**2;
  triangle_e2[1] = (points_x[0] - points_x[2])**2 + (points_y[0] - points_y[2])**2;
  triangle_e2[2] = (points_x[0] - points_x[1])**2 + (points_y[0] - points_y[1])**2;

  triangle_e[0] = Math.sqrt(triangle_e2[0]);
  triangle_e[1] = Math.sqrt(triangle_e2[1]);
  triangle_e[2] = Math.sqrt(triangle_e2[2]);

  triangle_a[0] = Math.acos((triangle_e2[1] + triangle_e2[2] - triangle_e2[0]) / (2 * triangle_e[1] * triangle_e[2]));
  triangle_a[1] = Math.acos((triangle_e2[0] + triangle_e2[2] - triangle_e2[1]) / (2 * triangle_e[0] * triangle_e[2]));
  triangle_a[2] = Math.acos((triangle_e2[1] + triangle_e2[0] - triangle_e2[2]) / (2 * triangle_e[1] * triangle_e[0]));

  let minAngle = Math.min(triangle_a[0], triangle_a[1], triangle_a[2]);
  let minEdge  = Math.min(triangle_e[0], triangle_e[1], triangle_e[2]);

  if(isNaN(minAngle)) return false;
  return minAngle > Math.PI * 15 / 180;
}

window.isTriangleRobustASMJS = (points_x, points_y) => {
  triangle_e2[0] = (points_x[1] - points_x[2])**2 + (points_y[1] - points_y[2])**2;
  triangle_e2[1] = (points_x[0] - points_x[2])**2 + (points_y[0] - points_y[2])**2;
  triangle_e2[2] = (points_x[0] - points_x[1])**2 + (points_y[0] - points_y[1])**2;

  triangle_e[0] = Math.sqrt(triangle_e2[0]);
  triangle_e[1] = Math.sqrt(triangle_e2[1]);
  triangle_e[2] = Math.sqrt(triangle_e2[2]);

  triangle_a[0] = Math.acos((triangle_e2[1] + triangle_e2[2] - triangle_e2[0]) / (2 * triangle_e[1] * triangle_e[2]));
  triangle_a[1] = Math.acos((triangle_e2[0] + triangle_e2[2] - triangle_e2[1]) / (2 * triangle_e[0] * triangle_e[2]));
  triangle_a[2] = Math.acos((triangle_e2[1] + triangle_e2[0] - triangle_e2[2]) / (2 * triangle_e[1] * triangle_e[0]));

  let minAngle = Math.fround(Math.min(triangle_a[0], triangle_a[1], triangle_a[2]));
  let minEdge  = Math.fround(Math.min(triangle_e[0], triangle_e[1], triangle_e[2]));

  if(isNaN(minAngle)) return 0|0;
  return (minAngle > Math.PI * 15 / 180)|0;
}

const States = {
  Start                  : 'Start',
  WaitToMove             : 'WaitToMove',
  MoveWhileOutside       : 'MoveWhileOutside',
  MoveWhileInside        : 'MoveWhileInside',
  // MoveWhileInsideParking: 'MoveWhileInsideParking',
  JoinedShape            : 'JoinedShape',
}

class GradientAndAssemblyWithErrorRobot extends Kilobot {
  constructor(opts) {
    super();
    this.gradientDist = opts.gradientDist;
    this.initialDist = opts.initialDist;
    this.HESITATE_DURATION = 2 * opts.ticksBetweenMsgs;
    this.NEIGHBOUR_EXPIRY = 2 * opts.ticksBetweenMsgs;
    this.DESIRED_SHAPE_DIST = 3.1*opts.radius;
    this.NEARBY_MOVING_DISTANCE = 4*this.DESIRED_SHAPE_DIST;

    this.shapeDesc = opts.shapeDesc;
    this.isSeed = opts.isSeed;
    this.isGradientSeed = opts.isGradientSeed;
    this.shapePos = opts.shapePos;

    this.isStationary = STATIONARY;
    this.posConfidence = 0;
    this.prevNearestNeighDist = Infinity;
    this.stats = {};
    this.events = [];
    this.lastExpireCheck = -1;
    this.isInsideShape = opts.isInsideShape;
    this.edgeFollowingStartedAt = null;
    // this.robotsIveEdgeFollowed = [];
    this.robotsIveEdgeFollowed = {};
    // this.lastRobotIveEdgeFollowed = null;

    {
      // ints:
      this.neighbors_id = new Int32Array(MAX_NEIGHBOURS);
      this.neighbors_grad = new Int32Array(MAX_NEIGHBOURS);
      this.neighbors_seen_at = new Int32Array(MAX_NEIGHBOURS);
      this.neighbors_pos_confidence = new Int32Array(MAX_NEIGHBOURS);

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

    this.switchToState(States.Start);

    this.COLORS = [
      this.RGB(3, 0, 0), // red
      this.RGB(3, 0, 3), // magenta
      this.RGB(0, 0, 3), // blue
      this.RGB(0, 3, 3), // cyan
      this.RGB(0, 3, 0), // green
      this.RGB(3, 3, 0), // yellow
    ];

    // this.COLORS_INTENSE = [
    //   this.RGB(3, 0, 0), // red
    //   this.RGB(3, 0, 3), // magenta
    //   this.RGB(0, 0, 3), // blue
    //   this.RGB(0, 3, 3), // cyan
    //   this.RGB(0, 3, 0), // green
    //   this.RGB(3, 3, 0), // yellow
    // ];

  }

  setup() {
    this.myGradient = NO_GRAD;
    this.hesitateData = {};
    this.counter = 0;
    // this.posHistory = [];
    // this.localizeCounter = 0;

    this.set_color(this.RGB(0, 0, 0));

    if(this.isSeed) {
      this.posConfidence = 10;
    }
  }


  newEvent(s) {
    if(true) {
      if(this.events[this.events.length - 1] == s) return;
      this.events.push(s);
    }
  }

  set_colors_for_gradient(g) {
    if(g == NO_GRAD) {
      this.set_color(this.RGB(3, 3, 3));
      return;
    }

    this.set_color(this.COLORS[g % this.COLORS.length]);
  }

  getFirstRobustQuadrilateralIndexes() {
    if(this._cached_robust_quad) {
      return this.robust_quad;
    }

    let indexes = [];
    for(let i = 0; i < MAX_NEIGHBOURS; i++) {
      if(this.neighbors_id[i] == VACANT) continue;
      if(this.counter >= this.neighbors_seen_at[i] + this.NEIGHBOUR_EXPIRY) continue;

      if(this.neighbors_is_seed[i]) {
        indexes.push(i);
        continue;
      }

      if(this.neighbors_pos_confidence[i] < 10)
        continue;

      if(this.neighbors_pos_x[i] == NO_POS)
        continue;

      if(this.neighbors_pos_y[i] == NO_POS)
        continue;

      if(this.neighbors_is_stationary[i] != STATIONARY)
        continue;

      if(this.neighbors_grad[i] == NO_GRAD)
        continue;

      if(this.myGradient == NO_GRAD)
        continue;

      if(this.neighbors_grad[i] >= this.myGradient)
        continue;

      indexes.push(i);
    }

    // indexes.sort((i1, i2) => {
    //   return +(
    //     this.neighbors_dist[i1] * (this.neighbors_is_seed[i1] ? 0.001 : 1)
    //     -
    //     this.neighbors_dist[i2] * (this.neighbors_is_seed[i2] ? 0.001 : 1)
    //   );
    // })

    this.closestRobustNeighborsCandidates = indexes;

    let ncount = indexes.length;
    if(ncount < 4) {
      this.robust_quad = null;
      this._cached_robust_quad = true;
      return this.robust_quad;
    }

    let trianlge_idx = 0;
    let robustTriangles = 0;

    for(let i = 0; i < ncount; i++) {
      triangle_p_x[0] = this.neighbors_pos_x[indexes[i]];
      triangle_p_y[0] = this.neighbors_pos_y[indexes[i]];
      for(let j = i+1; j < ncount; j++) {
        triangle_p_x[1] = this.neighbors_pos_x[indexes[j]];
        triangle_p_y[1] = this.neighbors_pos_y[indexes[j]];
        for(let k = j+1; k < ncount; k++) {
          triangle_p_x[2] = this.neighbors_pos_x[indexes[k]];
          triangle_p_y[2] = this.neighbors_pos_y[indexes[k]];
          for(let l = k+1; l < ncount; l++) {
            triangle_p_x[3] = this.neighbors_pos_x[indexes[l]];
            triangle_p_y[3] = this.neighbors_pos_y[indexes[l]];

            robustTriangles = 0;
            for(let skippedIdx = 0; skippedIdx < triangle_p_x.length; skippedIdx++) {

              trianlge_idx = 0;
              for(let includedIdx = 0; includedIdx < triangle_p_x.length; includedIdx++) {
                if(includedIdx != skippedIdx) {
                  triangle_x[trianlge_idx] = triangle_p_x[includedIdx];
                  triangle_y[trianlge_idx] = triangle_p_y[includedIdx];
                  trianlge_idx++;
                }
              }
              // if(window.isTriangleRobustC(triangle_x[0], triangle_y[0], triangle_x[1], triangle_y[1], triangle_x[2], triangle_y[2])) {
              if(window.isTriangleRobust(triangle_x, triangle_y)) {
                robustTriangles++;
              } else {
                break;
              }
            }

            if(robustTriangles == 4) {
              this._cached_robust_quad = true;
              this.robust_quad = [
                indexes[i],
                indexes[j],
                indexes[k],
                indexes[l],
              ];
              return this.robust_quad;
            }
          }
        }
      }
    }

    this._cached_robust_quad = true;
    this.robust_quad = null;
    return this.robust_quad;
  }

  getFirstRobustQuadrilateralIds() {
    let indexes = this.getFirstRobustQuadrilateralIndexes();
    if(!indexes) return indexes;

    return indexes.map(i => this.neighbors_id[i]);
  }



  gradientFormation() {
    if(this.myGradient == NO_GRAD) {
      this.hesitate("movement");
      this.isStationary = STATIONARY;
      this.unmark();
    }

    if(this.isGradientSeed) {
      this.setGradient(0);
      // this.myGradient = 0;
      return;
    }

    let grad = Infinity;

    for(let i = 0; i < MAX_NEIGHBOURS; i++) {
      if(this.neighbors_id[i] == VACANT) continue;
      if(this.counter >= this.neighbors_seen_at[i] + this.NEIGHBOUR_EXPIRY) continue;

      if(this.neighbors_dist[i] > this.gradientDist)
        continue;

      if(this.neighbors_grad[i] == NO_GRAD)
        continue;

      if(this.neighbors_is_stationary[i] != STATIONARY)
        continue;

      if(this.neighbors_grad[i] < grad)
        grad = this.neighbors_grad[i]; 
    }

    if(grad < Infinity)
      this.setGradient(grad + 1);
  }

  getNearestNeighborIndex() {
    let nnIndex = null;
    for(let i = 0; i < MAX_NEIGHBOURS; i++) {
      if(this.neighbors_id[i] == VACANT) continue;
      if(this.counter >= this.neighbors_seen_at[i] + this.NEIGHBOUR_EXPIRY) continue;

      // TODO: UNCOMMEN THIS to test limiting to stationary neighbors (this is used by doEdgeFollow)
      if(this.neighbors_is_stationary[i] != STATIONARY) continue;

      if(nnIndex == null) {
        nnIndex = i;
        continue;
      }

      if(this.neighbors_dist[i] < this.neighbors_dist[nnIndex]) {
        nnIndex = i
        continue;
      }
    }

    return nnIndex;
  }


  getMostCompetitiveWaitingNeighborIndex() {
    let bestIndex = null;
    for(let i = 0; i < MAX_NEIGHBOURS; i++) {
      if(this.neighbors_id[i] == VACANT) continue;
      if(this.counter >= this.neighbors_seen_at[i] + this.NEIGHBOUR_EXPIRY) continue;

      // TODO: why limit to this.gradientDist???
      // if(this.neighbors_dist[i] > this.gradientDist) continue;

      if(this.neighbors_grad[i] == NO_GRAD)
        continue;

      if(this.neighbors_state[i] != States.WaitToMove)
        continue;

      if(bestIndex == null) {
        bestIndex = i;
        continue;
      }

      if(this.neighbors_grad[i] > this.neighbors_grad[bestIndex]) {
        bestIndex = i;
        continue;
      }

      if(this.neighbors_grad[i] == this.neighbors_grad[bestIndex] && this.neighbors_id[i] > this.neighbors_id[bestIndex]) {
        bestIndex = i;
        continue;
      }
    }

    return bestIndex;
  }

  localizeSimpleExact(closestNeighborIndexes) {
    let x = [null];
    let y = [null];
    let r = [null];

    for(let j = 0; j < closestNeighborIndexes.length; j++) {
      let i = closestNeighborIndexes[j];
      let nx = this.neighbors_pos_x[i];
      let ny = this.neighbors_pos_y[i];
      let nd = this.neighbors_dist[i];
      x.push(nx)
      y.push(ny)
      r.push(nd)
    }

    let A = (-2 * x[1] + 2 * x[2]);
    let B = (-2 * y[1] + 2 * y[2]);

    let D = (-2 * x[2] + 2 * x[3]);
    let E = (-2 * y[2] + 2 * y[3]);

    let C = pow2(r[1]) - pow2(r[2]) - pow2(x[1]) + pow2(x[2]) - pow2(y[1]) + pow2(y[2]);
    let F = pow2(r[2]) - pow2(r[3]) - pow2(x[2]) + pow2(x[3]) - pow2(y[2]) + pow2(y[3]);

    let newPosX = (C*E - F*B) / (A*E - B*D);
    let newPosY = (C*D - F*A) / (B*D - A*E);

    if(!isNaN(newPosX) && !isNaN(newPosY)) {
      this.shapePos.x = newPosX;
      this.shapePos.y = newPosY;
    }
	}

  localize() {
    if(this.isSeed) return;

    let closestNeighborIndexes = this.getFirstRobustQuadrilateralIndexes();

    if(!closestNeighborIndexes || closestNeighborIndexes.length < 3) {
      // this.posConfidence -= 1;
      return;
    }

    if(this.shapePos.x == NO_POS || this.shapePos.y == NO_POS) {
      // we do this only once
      this.localizeSimpleExact(closestNeighborIndexes);
      return;
    }

    let posx = this.shapePos.x;
    let posy = this.shapePos.y;
    let v = {x: 0, y: 0};

    for(let j = 0; j < closestNeighborIndexes.length; j++) {
      let i = closestNeighborIndexes[j];
      let nx = this.neighbors_pos_x[i];
      let ny = this.neighbors_pos_y[i];

      let c = Math.sqrt((posx-nx)*(posx-nx) + (posy-ny)*(posy-ny));

      let v = {x: 0, y: 0};
      if(c != 0) {
        v.x = (posx - nx)/c;
        v.y = (posy - ny)/c;
      }

      let nd = this.neighbors_dist[i];
      let n = {
        x: nx + nd * v.x,
        y: ny + nd * v.y,
      }
      posx = posx + (n.x - posx)/4;
      posy = posy + (n.y - posy)/4;
    }
    this.shapePos.x = posx;
    this.shapePos.y = posy;
    this.posConfidence += 1;
  }

  seenRecentMovingNeighborsIndex() {
    for(let i = 0; i < MAX_NEIGHBOURS; i++) {
      if(this.neighbors_id[i] == VACANT) continue;
      if(this.counter >= this.neighbors_seen_at[i] + this.NEIGHBOUR_EXPIRY) continue;

      if(this.neighbors_is_stationary[i] == STATIONARY) continue;
      if(this.neighbors_dist[i] > this.NEARBY_MOVING_DISTANCE) continue;

      if(this.neighbors_robotsIveEdgeFollowed[i][this.kilo_uid])
        return i;

      if(this.robotsIveEdgeFollowed[this.neighbors_id[i]])
        continue;

      return i;
    }

    return null;
  }


  setGradient(newValue) {
    if(this.myGradient == newValue) {
      return;
    }

    this.myGradient = newValue;
    this.set_colors_for_gradient(this.myGradient);
  }

  doEdgeFollow() {
    if(this.edgeFollowingStartedAt == null) {
      this.edgeFollowingStartedAt = this.counter;
    }
    // this.edgeFollowingAge++;
    let nnIndex = this.getNearestNeighborIndex();
    if(nnIndex == null) return;

    // let dist = this.robotsIveEdgeFollowed[this.neighbors_id[nnIndex]];
    // if(!dist) {
    //   this.robotsIveEdgeFollowed[this.neighbors_id[nnIndex]] = this.neighbors_dist[nnIndex];
    // }

    this.robotsIveEdgeFollowed[this.neighbors_id[nnIndex]] = true;
    // this.lastRobotIveEdgeFollowed = this.neighbors_dist[nnIndex];

    // if(this.robotsIveEdgeFollowed[this.robotsIveEdgeFollowed.length - 1] != this.neighbors_id[nnIndex])
    //   this.robotsIveEdgeFollowed.push(this.neighbors_id[nnIndex]);

    let desiredDist = this.DESIRED_SHAPE_DIST;
    if(this.neighbors_grad[nnIndex] < 1) {
      desiredDist = this.DESIRED_SHAPE_DIST * 1.5;
    }
    // if(this.neighbors_grad[nnIndex] > 5 && this.neighbors_state[nnIndex] == States.JoinedShape) {
    //   desiredDist = this.DESIRED_SHAPE_DIST * 0.9;
    // }

    let tooClose = this.neighbors_dist[nnIndex] < desiredDist;
    let gettingFarther = this.prevNearestNeighDist < this.neighbors_dist[nnIndex];

    let edgeFollowingData = `id=${this.neighbors_id[nnIndex]}:dist=${this.neighbors_dist[nnIndex]}:seenAt=${this.neighbors_seen_at[nnIndex]}`;
    let noNewData = this.lastEdgeFollowingData && edgeFollowingData == this.lastEdgeFollowingData;
    this.lastEdgeFollowingData = edgeFollowingData;

    // let noNewData = this.prevNearestNeighDist == this.neighbors_dist[nnIndex];
    this.prevNearestNeighDist = this.neighbors_dist[nnIndex];

    if(noNewData) {
      if(this.stats.motors_left != null) {
        this.set_motors(this.stats.motors_left, this.stats.motors_right);
      }
      return;
    }

    if(tooClose) {
      if(gettingFarther) {
        this.stats.action = 'straight';
        this.stats.motors_left = this.kilo_straight_left;
        this.stats.motors_right = this.kilo_straight_right;
        this.set_motors(this.kilo_straight_left, this.kilo_straight_right);
      } else {
        this.stats.action = 'left-get-farther';
        this.stats.motors_left = this.kilo_turn_left;
        this.stats.motors_right = 0;
        this.set_motors(this.kilo_turn_left, 0);
      }
    } else {
      if(gettingFarther) {
        this.stats.action = 'right-get-close';
        this.stats.motors_left = 0;
        this.stats.motors_right = this.kilo_turn_right;
        this.set_motors(0, this.kilo_turn_right);
      } else {
        this.stats.action = 'straight';
        this.stats.motors_left = this.kilo_straight_left;
        this.stats.motors_right = this.kilo_straight_right;
        this.set_motors(this.kilo_straight_left, this.kilo_straight_right);
      }
    }

  }

  switchToState(newState, reason) {
    if(this.state != newState) {
      let msg = `switching to ${newState}`;
      if(reason) {
        msg += `, reason: ${reason}`;
      }
      this.newEvent(msg);
      // this._graphics_must_update = true;
      this.state = newState;
    }
  }

  loop() {
    // this._cached_robust_quad = false;
    this.counter++;

    if(false){
      if(this.kilo_uid % 2 == 0)
        this.set_motors(this.kilo_turn_left, 0);
      else
        this.set_motors(0, this.kilo_turn_right);
      this.gradientFormation();
      this.localize();
      return;
    }

    switch(this.state) {

      case States.Start:
        this.gradientFormation();
        this.localize();

        if(this.isSeed) {
          this.switchToState(States.JoinedShape, "isSeed");
          return;
        }

        this.switchToState(States.WaitToMove);
        break;

      case States.WaitToMove:
        this.isStationary = STATIONARY;
        this.gradientFormation();
        this.localize();
        // break; // <

        if(this.isHesitating("movement")) {
          return;
        }

        //  if(this.seenRecentMovingOrPausedNeighbors())
        if(this.seenRecentMovingNeighborsIndex() != null) {
          // if(this.seenRecentMovingNeighborsIndex())
          // this.edgeFollowingAge = this._uid;
          this.hesitate("movement");
          this.isStationary = STATIONARY;
          this.unmark();
          return;
        }

        {
          let hgnIndex = this.getMostCompetitiveWaitingNeighborIndex();
          if(hgnIndex == null) {
            this.switchToState(States.MoveWhileOutside, "no competing neighbors");
            break;
          }

          if(this.myGradient > this.neighbors_grad[hgnIndex]) {
            this.switchToState(States.MoveWhileOutside, `my grad > my neighbors, ie ${this.neighbors_id[hgnIndex]}`);
          } else if(this.myGradient == this.neighbors_grad[hgnIndex]) {
            if(this.kilo_uid > this.neighbors_id[hgnIndex]) {
              this.switchToState(States.MoveWhileOutside, `equal grads, but my ID is larger than ${this.neighbors_id[hgnIndex]}`);
            }
          } else {
            this.newEvent(`still waiting, because either ${this.neighbors_id[hgnIndex]} ruled!`);
          }
        }
        break;
      case States.MoveWhileOutside:
        this.localize();
        this.gradientFormation();

        if(this.isInsideShape(this.shapePos)) {
          // this.myGradient = NO_GRAD;
          this.switchToState(States.MoveWhileInside, "inside shape");
        }

        // let movingNeighborIndex = this.seenRecentMovingNeighborsIndex();
        // if(movingNeighborIndex != null) {
        //   this.switchToState(States.WaitToMove, `saw someone  else moving: ${this.neighbors_id[movingNeighborIndex]}`);
        //   // this.edgeFollowingAge = this._uid;
        //   // this.hesitate("movement");
        //   this.isStationary = STATIONARY;
        //   this.unmark();
        //   return;
        // }

        this.mark();
        this.isStationary = NOT_STATIONARY;
        this.doEdgeFollow();
        break;
      case States.MoveWhileInside:
        this.localize();
        this.gradientFormation();
        this.mark();
        this.isStationary = NOT_STATIONARY;
        this.doEdgeFollow();

        /*
        {
          this.switchToState(States.JoinedShape, "just joined");
          return
        }
        */


        if(!this.isInsideShape(this.shapePos)) {
          this.switchToState(States.JoinedShape, "went out");
          return;
        }

        {
          let nnIndex = this.getNearestNeighborIndex();
          if(nnIndex != null && this.neighbors_grad[nnIndex] >= this.myGradient /*&& this.neighbors_grad[nnIndex] != 1*/) {
            this.switchToState(States.JoinedShape, `my grad ${this.myGradient} >= closest neighbor ${this.neighbors_grad[nnIndex]}`);
            return;
          }
        }

        break;
      case States.JoinedShape:
        this.unmark();
        this.isStationary = STATIONARY;
        this.localize();
        // this.set_color(this.RGB(3, 1, 1));

        // if(!this.isSeed) {
        //   this.set_color(this.COLORS_INTENSE[this.myGradient % this.COLORS_INTENSE.length]);
        // }

        if(this.isSeed)
          this.gradientFormation();
        break;
    }
  }

  hesitate(what) {
    this.hesitateData[what] = this.counter + this.HESITATE_DURATION*(this.rand_soft()/255.0*0.2);
  }

  isHesitating(what) {
    let at = this.hesitateData[what];
    if(at != undefined && this.counter < at + this.HESITATE_DURATION) {
      return true;
    }
    delete(this.hesitateData[what]);
    return false;
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
      console.error("did not found a place to add neighbor info");
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
  }

  message_tx() {
    return {
      grad: this.myGradient,
      isStationary: this.isStationary,
      robotUID: this.kilo_uid,
      shapePos: this.shapePos,
      posConfidence: this.posConfidence,
      isSeed: this.isSeed,
      state: this.state,
      // edgeFollowingAge: this.edgeFollowingAge,
      robotsIveEdgeFollowed: this.robotsIveEdgeFollowed,
      // lastRobotIveEdgeFollowed: this.lastRobotIveEdgeFollowed,
    };
  }
}

// ----

window['ExperimentAssemblyWithError'] = class {
  constructor() {
    this.selectedUID = null;
    this.drawLocalizationError = true;
    // this.COUNT = 4 + 140;
    this.COUNT = 4 + 196/2 + 30 + 10;

    this.runnerOptions = {
      limitSpeed: !true,
      traversedPath: true,
      darkMode: false,
    }
  }

  clickedOutside() {
    this.selectedUID = null;
  }

  createRobots(newRobotFunc, newLightFunc, RADIUS, NEIGHBOUR_DISTANCE, TICKS_BETWEEN_MSGS) {
    this.NEIGHBOUR_DISTANCE = NEIGHBOUR_DISTANCE;
    const INITIAL_DIST = 3.1 * RADIUS; // this.NEIGHBOUR_DISTANCE/11*3;
    const GRADIENT_DIST = 1.3*INITIAL_DIST;
    this.RADIUS = RADIUS;
    // this._ShapeScale = 1.25*this.RADIUS; // 1.5*this.RADIUS
    this._ShapeScale = 1.2*this.RADIUS; // 1.5*this.RADIUS
    let ShapeDescReadable = [
      "           ###                                      ",
      "          #####                                     ",
      "          #####                                     ",
      "          ######                   ####             ",
      "          ######                 ######             ",
      "          #######               #######             ",
      "          ########            #########             ",
      "           #########       ############             ",
      "           ###########  #############               ",
      "           ##########################               ",
      "           #########################                ",
      "            ######################                  ",
      "            #####################                   ",
      "            ####################                    ",
      "            ####################                    ",
      "           #####################                    ",
      "         #######################                    ",
      "        #######################                     ",
      "      #########################                     ",
      "    ###########################                     ",
      "  #############################                     ",
      " ###############################                    ",
      "################################                    ",
      "#################################                   ",
      " #####   #########################                  ",
      "            #######################                 ",
      "             #######################                ",
      "              #######################               ",
      "              #########################             ",
      "              ############   ###########            ",
      "              #########         ########            ",
      "              ########            ######            ",
      "              #######               ####            ",
      "             #######                 ###            ",
      "             #######                                ",
      "             ######                                 ",
      "             ######                                 ",
      "             #####                                  ",
      "             #####                                  ",
      "             ####                                   ",
    ];
    this.ShapeDesc = ShapeDescReadable.map(line => line.split(''));

    this.RootSeedPos = {
      x: 0,
      y: 0,
    };

    this.ShapePosOffset = {x: 0, y: 0};
    let _ShapePosRootIndexes = {x: 0, y: 0};

    if(true) {
      let trimmed = false;
      let rowCount = this.ShapeDesc.length;
      for(let rowi = rowCount-1; rowi >= 0; rowi--) {
        if(trimmed) {
          break;
        }
        for(let coli = 0; coli < this.ShapeDesc[rowi].length; coli++) {
          if(this.ShapeDesc[rowi][coli] == '#') {
            this.ShapeDesc = this.ShapeDesc.slice(0, rowi+1);
            _ShapePosRootIndexes = {
              x: coli,
              y: 0,
            };
            this.ShapePosOffset = {
              x: this.RootSeedPos.x - _ShapePosRootIndexes.x*this._ShapeScale,
              y: this.RootSeedPos.y - _ShapePosRootIndexes.y*this._ShapeScale,
            };
            trimmed = true;
            break;
          }
        }
      }
    }

    let MathRandom = new Math.seedrandom(1234);
    const noise = function(magnitude) {
      return magnitude * (MathRandom()-0.5);
    }
    const shapePosToPhysPos = (shapePos) => {
      return {
        x: this.RootSeedPos.x + shapePos.x,
        y: this.RootSeedPos.y + shapePos.y,
      };
    }

    const isInsideShape = (pos) => {
      if(pos.x == NO_POS || pos.y == NO_POS) return false;
      let i = Math.floor(+(pos.x-this.ShapePosOffset.x)/this._ShapeScale);
      let j = Math.floor(-(pos.y-this.ShapePosOffset.y)/this._ShapeScale);
      j = this.ShapeDesc.length - 1 - j;
      return this.ShapeDesc[j] && this.ShapeDesc[j][i] == '#';
    }

    let PERFECT = false;
    let bodyCounter = 0;
    [
      {isSeed: true, isRoot: false, x: 0*INITIAL_DIST/2, y: INITIAL_DIST/2 * 0},
      {isSeed: true, isRoot: false, x: 2*INITIAL_DIST/2, y: INITIAL_DIST/2 * 0},
      {isSeed: true, isRoot: true, x: 1*INITIAL_DIST/2, y: INITIAL_DIST/2 * +Math.sqrt(3)},
      {isSeed: true, isRoot: false, x: 1*INITIAL_DIST/2, y: INITIAL_DIST/2 * -Math.sqrt(3)},
    ].forEach(shapePos => {
      bodyCounter++;

      if(!PERFECT) {
        shapePos.x += noise(0.2 * INITIAL_DIST);
        shapePos.y += noise(0.2 * INITIAL_DIST);
      }

      newRobotFunc(
        shapePosToPhysPos(shapePos),
        MathRandom() * 2*Math.PI,
        new GradientAndAssemblyWithErrorRobot({
          gradientDist: GRADIENT_DIST,
          initialDist: INITIAL_DIST,
          ticksBetweenMsgs: TICKS_BETWEEN_MSGS,
          radius: this.RADIUS,

          isInsideShape: isInsideShape,
          shapePos: shapePos.isSeed ? {x: shapePos.x, y: shapePos.y} : {x: NO_POS, y: NO_POS},
          isGradientSeed: shapePos.isSeed && shapePos.isRoot,
          isSeed: shapePos.isSeed,
        }),
      );
    });

    const createNewRobot = (pos) => {
      // hexagrid[`${candidate.x}:${candidate.y}`] = TAKEN;
      // hexagridCursor.x = candidate.x;
      // hexagridCursor.y = candidate.y;
      // let pos = gridPosToPhysPos(candidate);

      // if(!PERFECT) {
      //   pos.x += noise(0.2 * INITIAL_DIST);
      //   pos.y += noise(0.2 * INITIAL_DIST);
      // }

      newRobotFunc(
        pos,
        MathRandom() * 2*Math.PI,
        new GradientAndAssemblyWithErrorRobot({
          gradientDist: GRADIENT_DIST,
          initialDist: INITIAL_DIST,
          ticksBetweenMsgs: TICKS_BETWEEN_MSGS,
          radius: this.RADIUS,

          isInsideShape: isInsideShape,
          shapePos: {x: NO_POS, y: NO_POS},
          isSeed: false,
        }),
      );
    }

    let gridPosToPhysPos = (gridPos) => {
      let pos = {
        x: (this.RootSeedPos.x + INITIAL_DIST/2),
        y: (this.RootSeedPos.y + Math.sqrt(3) * INITIAL_DIST/2 + 2*INITIAL_DIST/2),
      };

      pos.x += gridPos.x * INITIAL_DIST + (gridPos.y%2==0 ? -INITIAL_DIST/2 : 0);
      pos.y += gridPos.y * INITIAL_DIST * Math.sqrt(3)/2;
      return pos;
    }

    if(false) {

      const TAKEN = true;
      let hexagrid = {
        // '-1:0': TAKEN,
        // '-2:0': TAKEN,
        // '-3:0': TAKEN,
        // '2:0': TAKEN,
        // '3:0': TAKEN,
      };
      let hexagridCursor = {
        x: 0,
        y: 0,
      };


      let assemblyCount = this.COUNT - bodyCounter;
      let hexaNeighbors = [
        [0,   -1], [+1,-1],
        [-1, 0], /*cursor*/ [+1, 0],
        [0,   +1], [+1,+1],
      ];

      createNewRobot(hexagridCursor);
      for(let i = 0; i < assemblyCount; i++) {
        let candidates = hexaNeighbors.map(adjacentPoint => {
          let candidate = {
            x: hexagridCursor.x + adjacentPoint[0],
            y: hexagridCursor.y + adjacentPoint[1],
          }

          if(hexagrid[`${candidate.x}:${candidate.y}`] == TAKEN)
            return null;

          if(true) {
            if(candidate.y < 0) return null;
          } else {
            let seedAreaWidth = Math.floor(this.NEIGHBOUR_DISTANCE/INITIAL_DIST) * 2;
            if(candidate.x < -seedAreaWidth/2 || candidate.x > +seedAreaWidth/2 || candidate.y < 0) {
              for(let rowi = 0; rowi < this.ShapeDesc.length; rowi++) {
                let row = this.ShapeDesc[rowi];
                for(let coli = 0; coli < row.length; coli++) {
                  if(row[coli] != '#')
                    continue;
                  let p = {
                    x: this.ShapePosOffset.x + coli*this._ShapeScale,
                    y: this.ShapePosOffset.y - (this.ShapeDesc.length-1 - rowi)*this._ShapeScale,
                  }
                  let d = calculateDistance(gridPosToPhysPos(candidate), p);
                  if(d < 4*INITIAL_DIST) {
                    return null;
                    // let distToOrigin = calculateDistance(gridPosToPhysPos(candidate), gridPosToPhysPos({x: 0, y: 0}));
                    // return {
                    //   x: candidate.x,
                    //   y: candidate.y,
                    //   dist: distToOrigin * 10000,
                    // };
                  }
                }
              }
            }
          }

          let distToOrigin = calculateDistance(gridPosToPhysPos(candidate), gridPosToPhysPos({x: 0, y: 0}));

          return {
            x: candidate.x,
            y: candidate.y,
            dist: distToOrigin,
          };
        }).filter(x => x != null).sort((a, b) => a.dist - b.dist);

        let best = candidates[0];

        if(best == null) {
          console.error("'best' should not be null");
          return;
        }

        createNewRobot(best);
      }
    }

    let assemblyCount = this.COUNT - bodyCounter;
    for(let rowi = 0; assemblyCount > 0; rowi++) {
      // let colCount = Math.pow(rowi, 1.1);

      let left = -Math.floor(rowi/1);
      let right = Math.pow(rowi, 1.1) + 2;

      for(let coli = left; coli < right && assemblyCount > 0; coli++) {
        assemblyCount--;
        createNewRobot(gridPosToPhysPos({x: coli, y: rowi}));
      }
    }
  }

  setupGraphics(
    PIXI,
    Box2D,
    pixiApp,
    platformGraphics,
    bodies,
    bodyIDs,
    setDisplayedData,
    zIndexOf,
  ) {
    for(let i = 0; i < bodyIDs.length; i++) {
      let b = bodies[bodyIDs[i]];
      let g = b.g;

      g.interactive = true;
      g.buttonMode = true;
      g.on('pointerdown', (ev) => {
        this.selectedUID = b.robot._uid;

        let convertIndexesToNeighbors = (indexes) => {
          return indexes.map(i => {
            return {
              id: b.robot.neighbors_id[i],
              grad: b.robot.neighbors_grad[i],
              seen_at: b.robot.neighbors_seen_at[i],
              is_stationary: b.robot.neighbors_is_stationary[i],
              dist: b.robot.neighbors_dist[i],
            }
          }).sort((a, b) => a.id - b.id).filter(x => x.id != VACANT);
        }

        console.log({
          uid: b.robot._uid,
          state: b.robot.state,
          grad: b.robot.myGradient,
          counter: b.robot.counter,
          isSeed: b.robot.isSeed,
          hesitateData: b.robot.hesitateData,
          shapePos: b.robot.shapePos,
          neighbors: convertIndexesToNeighbors(Array.from(b.robot.neighbors_id).map((id, i) => i)),
          // neighbors: b.robot.neighbors,
          closestRobustNeighbors: b.robot.getFirstRobustQuadrilateralIds && b.robot.getFirstRobustQuadrilateralIds(),
          closestRobustNeighborsCandidates: convertIndexesToNeighbors(Array.from(b.robot.closestRobustNeighborsCandidates)),
          isStationary: b.robot.isStationary,
          robot: b.robot,
          events: b.robot.events,
        });
        ev.stopPropagation();
      });
    }

    const DRAW_SHAPE_DESCRIPTION = true;
    if(DRAW_SHAPE_DESCRIPTION) {
      // position vectors
      let g = new PIXI.Graphics()
      g.zIndex = zIndexOf('Shape');
      g.alpha = 0.3;
      g.lastView = null;

      platformGraphics.addChild(g);
      pixiApp.ticker.add(() => {
        if(this.equalZooms(g.lastView, this.V)) return;
        g.lastView = this.copyView(this.V);

        g.clear();
        if(!DRAW_SHAPE_DESCRIPTION) return;

        let highlightJoined = false;

        let shapeMarks = {};
        if(highlightJoined) {
          for(let i = 0; i < bodyIDs.length; i++) {
            let b = bodies[bodyIDs[i]];
            let p = b.body.GetPosition();
            let i = Math.floor(+(p.get_x() - this.ShapePosOffset.x)/this._ShapeScale);
            let j = Math.floor(-(p.get_y() - this.ShapePosOffset.y)/this._ShapeScale);
            let key = `${this.ShapeDesc.length - 1 - j}:${i}`;
            shapeMarks[key] = (shapeMarks[key] || 0) + 1
          }
        }

        g.lineStyle(0, 0x000000);
        g.beginFill(0x888888, 0.5);

        for(let rowi = 0; rowi < this.ShapeDesc.length; rowi++) {
          let row = this.ShapeDesc[rowi];
          for(let coli = 0; coli < row.length; coli++) {
            if(row[coli] != '#') {
              continue;
            }
            if(highlightJoined) {
              if(shapeMarks[`${rowi}:${coli}`]) {
                g.beginFill(0x008800);
              } else {
                g.beginFill(0x888888);
              }
            }

            let x = this.ShapePosOffset.x + coli*this._ShapeScale;
            let y = this.ShapePosOffset.y - (this.ShapeDesc.length-1 - rowi)*this._ShapeScale;
            g.drawRect(
              +this.V.ZOOM * x,
              +this.V.ZOOM * y - this.V.ZOOM * this._ShapeScale,
              +(this.V.ZOOM * this._ShapeScale - 1),
              +(this.V.ZOOM * this._ShapeScale - 1),
            );
          }
        }
      });
    }

    if(this.drawLocalizationError) {
      // position vectors
      let g = new PIXI.Graphics()
      g.zIndex = zIndexOf('LocalizationError');
      g.alpha = 0.75;
      let color = 0x008400;

      platformGraphics.addChild(g);
      pixiApp.ticker.add(() => {
        g.clear();
        if(!this.drawLocalizationError) return;

        let correctlyLocalizedCount = 0;
        for(let i = 0; i < bodyIDs.length; i++) {
          let b = bodies[bodyIDs[i]];
          let shapePos = b.robot.shapePos;
          if(shapePos.x == NO_POS || shapePos.y == NO_POS) continue;

          let pos = b.position;
          if(!b.position && b.getData) {
            let data = b.getData();
            pos = data.pos;
          }

          let posActual = {
            x: + pos.x * this.V.ZOOM,
            y: + pos.y * this.V.ZOOM,
          }
          let posEstimated = {
            x: + (this.RootSeedPos.x + shapePos.x) * this.V.ZOOM,
            y: + (this.RootSeedPos.y + shapePos.y) * this.V.ZOOM,
          }
          let dist = calculateDistancePerf(posActual.x, posEstimated.x, posActual.y, posEstimated.y);
          if(dist < this.RADIUS*this.V.ZOOM) correctlyLocalizedCount++;

          color = 0xff0000;
          let thickness = this.RADIUS*this.V.ZOOM * 0.2; // 2
          g.endFill();
          g.lineStyle(thickness, color);

          if(this.selectedUID && this.selectedUID != b.robot._uid) {
            g.lineStyle(thickness, color, 0.3);
          }

          const MAX = 100000;
          if(posEstimated.x > +MAX) posEstimated.x = +MAX;
          if(posEstimated.x < -MAX) posEstimated.x = -MAX;
          if(posEstimated.y > +MAX) posEstimated.y = +MAX;
          if(posEstimated.y < -MAX) posEstimated.y = -MAX;

          g.moveTo(posActual.x, posActual.y);
          g.lineTo(posEstimated.x, posEstimated.y);

          if(false) {
            g.endFill();
            g.lineStyle(1, color);
            g.drawCircle(posEstimated.x, posEstimated.y, this.V.ZOOM * this.RADIUS);

            {
              let crossPoints = [posEstimated, posActual];
              let fullSize = this.V.ZOOM * this.RADIUS * 0.2;
              for(let i = 0, len = crossPoints.length; i < len; i++) {
                let p = crossPoints[i];
                let r = fullSize;
                g.endFill();
                g.lineStyle(thickness, i == 0 ? color : 0x000000, 1);
                g.moveTo(p.x - r, p.y + 0);
                g.lineTo(p.x + r, p.y + 0);
                g.moveTo(p.x + 0,         p.y - r);
                g.lineTo(p.x + 0,         p.y + r);
              };
            }
          }
        }
        setDisplayedData('Well localized', `${correctlyLocalizedCount}/${Object.keys(bodies).length} robots`);
      });
    }

    if(false){ // neighbor area
      let g = new PIXI.Graphics()
      g.zIndex = zIndexOf('NeighborRegion');
      g.alpha = 1;
      platformGraphics.addChild(g);
      pixiApp.ticker.add(() => {
        g.clear();

        for(let i = 0; i < bodyIDs.length; i++) {
          let b = bodies[bodyIDs[i]];
          if(b.robot.state != States.MoveWhileOutside && b.robot.state != States.MoveWhileInside)
            continue;

          let pos = b.position;
          if(!b.position && b.getData) {
            let data = b.getData();
            pos = data.pos;
          }
          g.beginFill(0xffffff, 0.1);
          g.drawCircle(
            pos.x * this.V.ZOOM,
            pos.y * this.V.ZOOM,
            this.NEIGHBOUR_DISTANCE * this.V.ZOOM,
          );
        }

      });
    }

    { // robust quadlateral
      let g = new PIXI.Graphics()
      g.zIndex = zIndexOf('RobustQuadlateral');
      g.alpha = 1;
      platformGraphics.addChild(g);
      pixiApp.ticker.add(() => {
        g.clear();
        if(!this.selectedUID) return;

        let b = bodies[this.selectedUID];
        let quadlateral = b.robot.getFirstRobustQuadrilateralIds && b.robot.getFirstRobustQuadrilateralIds();
        if(!quadlateral) {
          return;
        }

        let bodyPositions = Array.from(quadlateral).map(id => bodies[id].body.GetPosition());

        g.lineStyle(this.V.ZOOM * this.RADIUS/4/4, 0xffffff);
        bodyPositions.forEach(p => {
          g.moveTo(
            + b.body.GetPosition().get_x()*this.V.ZOOM,
            + b.body.GetPosition().get_y()*this.V.ZOOM,
          );
          g.lineTo(
            + p.get_x()*this.V.ZOOM,
            + p.get_y()*this.V.ZOOM,
          );
        });


        g.lineStyle(this.V.ZOOM * this.RADIUS/4, 0xffffff);
        [
          [1, 2],
          [1, 3],
          [1, 4],
          [2, 3],
          [2, 4],
          [3, 4],
        ].forEach(indexes => {
          let p1 = bodyPositions[indexes[0]-1];
          let p2 = bodyPositions[indexes[1]-1];
          g.moveTo(
            + p1.get_x()*this.V.ZOOM,
            + p1.get_y()*this.V.ZOOM,
          );
          g.lineTo(
            + p2.get_x()*this.V.ZOOM,
            + p2.get_y()*this.V.ZOOM,
          );
        });
      });
    }
  }
}

const forEachObj = function(obj, f) {
  let i = 0;
  Object.keys(obj).forEach(k => {
    let item = obj[k];
    f(item, k, i);
    i++;
  });
}
}
