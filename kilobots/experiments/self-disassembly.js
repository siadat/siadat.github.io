{
const MAX_NEIGHBOURS = 60;
const VACANT = -1;

const NO_GRAD = 10000;
const NO_POS = 100000;

const ADJACENT_DIST_FACTOR = 1.2;

const STATIONARY = 1;
const NOT_STATIONARY = 0;
const CONSENSUS_FINAL = 10;
const POS_CONFIDENCE_FINAL = 10;

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
  LocAndGrad                        : 'LocAndGrad',
  DoAntiphototaxis                  : 'Antiphototaxis',
  DoAntiphototaxisCollisionAvoidance: 'DoAntiphototaxisCollisionAvoidance',
  JoinedShape                       : 'JoinedShape',
}

class GradientAndDisassemblyRobot extends Kilobot {
  constructor(opts) {
    super();
    this.gradientDist = opts.gradientDist;
    this.initialDist = opts.initialDist;
    this.HESITATE_DURATION = 2 * opts.ticksBetweenMsgs;
    this.NEIGHBOUR_EXPIRY = 2 * opts.ticksBetweenMsgs;
    this.DESIRED_SHAPE_DIST = 3.1*opts.radius;
    this.NEARBY_MOVING_DISTANCE = 4*this.DESIRED_SHAPE_DIST;
    this.radius = opts.radius;

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

    this.switchToState(States.LocAndGrad);

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
    this.consensusCounter = 0;

    {
      // for phototaxis and antiphototaxis
      this.abilityPhototaxis = new AbilityPhototaxis();
      this.abilityPhototaxis.setup(this);
    }

    {
      // for collision avoidance
      this.abilityAvoid = new AbilityAttractAndAvoid();
      this.abilityAvoid.setup(this);

      // this.collisionAvoidanceDirection = 0;
      // this.collisionAvoidanceLastValue1 = null;
      // this.collisionAvoidanceLastValue2 = null;
      // this.collisionAvoidanceLastUpdated = this.rand_soft();
      // this.collisionAvoidancePeriod = 0;
    }

    // if(this.isGradientSeed) {
    //   this.set_color(this.RGB(3, 0, 0));
    // }
    if(this.isSeed) {
      this.set_color(this.RGB(3, 3, 3));
    } else {
      this.set_color(this.RGB(0, 0, 0));
    }

    if(this.isSeed) {
      this.posConfidence = POS_CONFIDENCE_FINAL;
      this.consensusCounter = 1;
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

      if(this.neighbors_pos_confidence[i] < POS_CONFIDENCE_FINAL)
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
    // if(!this.isSeed && !this.isGradientSeed) {
    //   this.set_colors_for_gradient(this.myGradient);
    // }
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

  doConsensus() {
    if(this.posConfidence < POS_CONFIDENCE_FINAL) {
      this.consensusCounter = 0;
      return;
    }

    let grad = Infinity;

    for(let i = 0; i < MAX_NEIGHBOURS; i++) {
      if(this.neighbors_id[i] == VACANT) continue;
      if(this.counter >= this.neighbors_seen_at[i] + this.NEIGHBOUR_EXPIRY) continue;

      if(this.neighbors_dist[i] > this.gradientDist)
        continue;

      if(this.neighbors_consensus_counter[i] < grad)
        grad = this.neighbors_consensus_counter[i]; 
    }

    if(grad < Infinity)
      this.consensusCounter = grad + 1;
  }

  getClosestStationaryRobotIndex() {
    let bestIndex = null;
    for(let i = 0; i < MAX_NEIGHBOURS; i++) {
      if(this.neighbors_id[i] == VACANT) continue;
      if(this.counter >= this.neighbors_seen_at[i] + this.NEIGHBOUR_EXPIRY) continue;

      if(!this.neighbors_is_stationary[i]) continue;

      if(this.neighbors_dist[i] > 2.5 * this.radius) continue;

      if(bestIndex == null) {
        bestIndex = i;
        continue;
      }

      if(this.neighbors_dist[i] < this.neighbors_dist[bestIndex]) {
        bestIndex = i;
        continue;
      }
    }

    return bestIndex;
  }

  loop() {
    // this._cached_robust_quad = false;
    this.counter++;

    switch(this.state) {

      case States.LocAndGrad:
        this.gradientFormation();
        this.localize();
        this.doConsensus();
        if(this.consensusCounter < CONSENSUS_FINAL) {
          break;
        }

        if(this.isInsideShape(this.shapePos.x, this.shapePos.y)) {
          this.switchToState(States.JoinedShape);
          break;
        }

        // this.switchToState(States.DoAntiphototaxisCollisionAvoidance);
        this.switchToState(States.DoAntiphototaxis);
        break;
      case States.DoAntiphototaxisCollisionAvoidance:
        this.set_color(this.RGB(3, 0, 0));
        this.isStationary = NOT_STATIONARY;

        {
          let csrIndex = this.getClosestStationaryRobotIndex();
          if(csrIndex == null) {
            this.switchToState(States.DoAntiphototaxis);
            break;
          }

          this.closestDist = this.neighbors_dist[csrIndex];

          if(this.isOkayToMove()) {
            this.isStationary = NOT_STATIONARY;
            this.abilityAvoid.doAvoid(this, this.closestDist); // doCollisionAvoidance();
          } else {
            this.isStationary = STATIONARY;
          }
        }
        break;
      case States.DoAntiphototaxis:
        this.set_color(this.RGB(3, 3, 0));

        {
          let csrIndex = this.getClosestStationaryRobotIndex();
          if(csrIndex != null) {
            this.switchToState(States.DoAntiphototaxisCollisionAvoidance);
            break;
          }

          if(this.isOkayToMove()) {
            this.isStationary = NOT_STATIONARY;
            this.abilityPhototaxis.doAntiphototaxis(this);
          } else {
            this.isStationary = STATIONARY;
          }
        }

        break;
      case States.JoinedShape:
        this.doConsensus();
        this.unmark();
        this.isStationary = STATIONARY;
        this.set_color(this.RGB(0, 0, 3));
        break;
    }
  }

  isOkayToMove() {
    let adjacentNeighborsCount = 0;
    for(let i = 0; i < MAX_NEIGHBOURS; i++) {
      if(this.neighbors_id[i] == VACANT) continue;
      if(this.counter >= this.neighbors_seen_at[i] + this.NEIGHBOUR_EXPIRY) continue;

      // if(this.neighbors_replicaID[i] != 1) continue;
      if(this.neighbors_dist[i] < this.initialDist*ADJACENT_DIST_FACTOR) {
        adjacentNeighborsCount++;
      }
    }

    if(adjacentNeighborsCount <= 4) {
      this.phototaxisConfidence = (this.phototaxisConfidence||0) + 1;
    } else {
      this.phototaxisConfidence = 0;
    }

    return this.phototaxisConfidence > 100;
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

  message_tx() {
    return {
      grad: this.myGradient,
      isStationary: this.isStationary,
      robotUID: this.kilo_uid,
      shapePos: this.shapePos,
      posConfidence: this.posConfidence,
      isSeed: this.isSeed,
      state: this.state,
      consensusCounter: this.consensusCounter,
      // edgeFollowingAge: this.edgeFollowingAge,
      robotsIveEdgeFollowed: this.robotsIveEdgeFollowed,
      // lastRobotIveEdgeFollowed: this.lastRobotIveEdgeFollowed,
    };
  }
}

// ----

window['ExperimentDisassembly'] = class {
  constructor() {
    this.selectedUID = null;
    this.drawLocalizationError = false;

    this.runnerOptions = {
      limitSpeed: false,
      traversedPath: false,
      darkMode: false,
      selectedUID: this.selectedUID,
    }
  }

  clickedOutside() {
    this.selectedUID = null;
  }

  // node_modules/pixi.js/dist/pixi.js: Polygon.prototype.contains
  isPointInPolygon(polygonPoints, x, y) {
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

  createRobots(newRobotFunc, newLightFunc, RADIUS, NEIGHBOUR_DISTANCE, TICKS_BETWEEN_MSGS) {
    this.NEIGHBOUR_DISTANCE = NEIGHBOUR_DISTANCE;
    const INITIAL_DIST = 3 * RADIUS; // this.NEIGHBOUR_DISTANCE/11*3;
    const GRADIENT_DIST = 1.5*INITIAL_DIST;
    this.RADIUS = RADIUS;
    this._ShapeScale = 2.3*this.RADIUS; // 1.5*this.RADIUS
    // this._ShapeScale = 0.9; // * this.RADIUS;
    let ShapeDescReadable = [
    // 012340123401234012340
      "                     ", // 0
      "         .4.         ", // 1
      "        .   .        ", // 2
      "        .   .        ", // 2
      "        .   .        ", // 2
      "        .   .        ", // 2
      "  2 ... 3   5 ... 6  ", // 3
      "   .            .    ", // 4
      "    .          .     ", // 4
      "     .    L   .      ", // 4
      "      1   C   7      ", // 5
      "     .         .     ", // 6
      "     .    9    .     ", // 6
      "     .   . .   .     ", // 6
      "     .  .   .  .     ", // 6
      "     . .     . .     ", // 7
      "     0.       .8     ", // 8
      "                     ", // 9
    ];

    console.log(ShapeDescReadable.join("\n"));

    let unorderedPoints = {};
    this.disassemblyLigt = {x: null, y: null};
    this.disassemblyCenter = {x: null, y: null};
    for(let rowi = 0; rowi < ShapeDescReadable.length; rowi++) {
      let line = ShapeDescReadable[rowi];
      let chars = line.split('');
      for(let coli = 0; coli < chars.length; coli++) {
        let ch = chars[coli];
        switch(ch) {
          case 'C':
            this.disassemblyCenter.x = coli;
            this.disassemblyCenter.y = rowi;
            break;
          case 'L':
            this.disassemblyLigt.x = coli;
            this.disassemblyLigt.y = rowi;
            break;
          case ' ': break;
          case '.': break;
          default: // numbers
            unorderedPoints[ch*1] = {
              x: coli,
              y: rowi,
            }
            break;
        }
      }
    }

    {
      // adjust light's position with center's position
      this.disassemblyLigt.x -= this.disassemblyCenter.x;
      this.disassemblyLigt.y -= this.disassemblyCenter.y;
      this.disassemblyLigt.x *= this._ShapeScale;
      this.disassemblyLigt.y *= this._ShapeScale;
    }

    this.disassemblyPolygon = new Array(2 * Object.keys(unorderedPoints).length);
    for(let i = 0; i < Object.keys(unorderedPoints).length; i++) {
      let x = unorderedPoints[i].x - this.disassemblyCenter.x;
      let y = unorderedPoints[i].y - this.disassemblyCenter.y;
      x *= this._ShapeScale;
      y *= this._ShapeScale;
      this.disassemblyPolygon[2 * i] = x;
      this.disassemblyPolygon[2 * i + 1] = y;
    }
    // window.experiment.isPointInPolygon(window.experiment.disassemblyPolygon, 10, 6)

    let MathRandom = new Math.seedrandom(1234);
    const noise = function(magnitude) {
      return magnitude * (MathRandom()-0.5);
    }

    const gradientNoise = () => {
      if(this.perlinNoiseValue == null) {
        this.perlinNoiseValue = 0.5;
      }

      this.perlinNoiseValue += (MathRandom()-0.5)/2;
      if(this.perlinNoiseValue > 1) this.perlinNoiseValue = 1;
      if(this.perlinNoiseValue < 0) this.perlinNoiseValue = 0;
      return this.perlinNoiseValue;
    }

    const isInsideShape = (x, y) => this.isPointInPolygon(this.disassemblyPolygon, x, y);

    let PERFECT = false;
    const gridPosToPhysPos = (gPos, row) => {
      let pos = {
        x: gPos.x * INITIAL_DIST*1.0 + INITIAL_DIST*(row%2==0 ? 0.5 : 0.0),
        y: gPos.y * INITIAL_DIST*0.5 * +Math.sqrt(3),
      };

      if(!PERFECT) {
        // pos.x += gradientNoise() * (0.2 * INITIAL_DIST);
        // pos.y += gradientNoise() * (0.2 * INITIAL_DIST);
      }

      return pos;
    }

    let rowCount = 16;
    let colCount = 16;

    let rootPos = {
      x: -1,
      y: -1,
    };

    let seedPoses = [
      {
        x: rootPos.x + 0,
        y: rootPos.y + 0,
      },
      {
        x: rootPos.x + 0,
        y: rootPos.y + 2,
      },
      {
        x: rootPos.x + 0,
        y: rootPos.y + 1,
      },
      {
        x: rootPos.x - 1,
        y: rootPos.y + 1,
      },
    ];

    let rowCounter = -1;
    for(let rowi = -rowCount/2; rowi < +rowCount/2; rowi++) {
      rowCounter++;
      for(let coli = -colCount/2; coli < +colCount/2; coli++) {


        let isRoot = rowi == rootPos.y && coli == rootPos.x;
        let isSeed = false;
        for(let i = 0; i < seedPoses.length; i++) {
          if(rowi == seedPoses[i].y && coli == seedPoses[i].x) {
            isSeed = true;
            break;
          }
        }

        let pos = gridPosToPhysPos({x: coli, y: rowi}, rowCounter);
        newRobotFunc(
          pos,
          MathRandom() * 2*Math.PI + Math.PI,
          new GradientAndDisassemblyRobot({
            gradientDist: GRADIENT_DIST,
            initialDist: INITIAL_DIST,
            ticksBetweenMsgs: TICKS_BETWEEN_MSGS,
            radius: this.RADIUS,

            isInsideShape: isInsideShape,
            shapePos: isSeed ? pos : {x: NO_POS, y: NO_POS},
            isGradientSeed: isSeed && isRoot,
            isSeed: isSeed,
          }),
        );
      }
    }

    newLightFunc(this.disassemblyLigt);
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
    V,
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
              consensusCounter: b.robot.neighbors_consensus_counter[i],
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
          consensusCounter: b.robot.consensusCounter,
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

    if(!false) {
      let g = new PIXI.Graphics()
      g.zIndex = zIndexOf('Shape');
      g.alpha = 0.3;
      // g.lastView = null;

      platformGraphics.addChild(g);
      pixiApp.ticker.add(() => {
        // if(this.equalZooms(g.lastView, this.V)) return;
        // g.lastView = this.copyView(this.V);

        g.clear();

        g.lineStyle(1, 0x000000, 1);
        g.beginFill(0x888888, 1);

        g.drawPolygon(this.disassemblyPolygon.map(n => n * V.ZOOM));
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
            x: + (shapePos.x) * this.V.ZOOM,
            y: + (shapePos.y) * this.V.ZOOM,
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
