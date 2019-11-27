class RobotLab0 extends Kilobot {
  setup() {
    this.counter = 0;
  }

  loop() {
    this.counter++;

    if(Math.floor(this.counter / 15) % 2 == 0) {
      this.set_color(this.RGB(3, 0, 0));
    } else {
      this.set_color(this.RGB(0, 0, 3));
    }
  }
}

window.ExperimentLab0 = class {
  constructor() {
    this.runnerOptions = {
      limitSpeed: true,
      traversedPath: true,
      traversedPathLen: 1000,
      darkMode: false,
    }
  }

  createRobots(newRobotFunc, newLightFunc, RADIUS, NEIGHBOUR_DISTANCE, TICKS_BETWEEN_MSGS) {
    let MathRandom = new Math.seedrandom(1234);
    for(let i = 0; i < 10; i++) {
      newRobotFunc({
          x: MathRandom(),
          y: MathRandom(),
        },
        0,
        new RobotLab0(),
      );
    }
  }
}

// ---

class RobotLab1_2 extends Kilobot {
  setup() {
    this.counter = 0;
  }

  loop() {
    this.counter++;

    let t = this.counter % (7 * 30);

    if(t < 2 * 30) {
      this.set_color(this.RGB(0, 3, 0));
      this.set_motors(this.kilo_straight_left, this.kilo_straight_right);
    } else if(t < 4 * 30) {
      this.set_color(this.RGB(3, 0, 0));
      this.spinup_motors();
      this.set_motors(this.kilo_turn_left, 0);
    } else if(t < 6 * 30) {
      this.set_color(this.RGB(0, 0, 3));
      this.spinup_motors();
      this.set_motors(0, this.kilo_turn_right);
    } else if(t < 7 * 30) {
      this.set_color(this.RGB(0, 0, 0));
      this.set_motors(0, 0);
    }
  }
}

window['ExperimentLab1.2'] = class {
  constructor() {
    this.runnerOptions = {
      limitSpeed: true,
      traversedPath: true,
      traversedPathLen: 1000,
      darkMode: false,
    }
  }

  createRobots(newRobotFunc, newLightFunc, RADIUS, NEIGHBOUR_DISTANCE, TICKS_BETWEEN_MSGS) {
    let MathRandom = new Math.seedrandom(1234);
    for(let i = 0; i < 10; i++) {
      newRobotFunc({
          x: MathRandom(),
          y: MathRandom(),
        },
        MathRandom() * 2*Math.PI,
        new RobotLab1_2(),
      );
    }
  }
}

// ---

class RobotLab1_3 extends Kilobot {
  setup() {
    this.States = {
      LeftRed: 0,
      RightBlue: 1,
      ForwardGreen: 2,
    };

    this.last_changed = this.kilo_ticks;
    this.state = this.States.ForwardGreen;
  }

  loop() {
    if(this.kilo_ticks < this.last_changed + 60)
      return;

    this.last_changed = this.kilo_ticks;

    switch(this.state) {
      case this.States.ForwardGreen:
        this.set_color(this.RGB(0, 3, 0));
        this.set_motors(this.kilo_straight_left, this.kilo_straight_right);
        this.state = this.States.LeftRed;
        break;
      case this.States.LeftRed:
        this.set_color(this.RGB(3, 0, 0));
        this.set_motors(this.kilo_turn_left, 0);
        this.state = this.States.RightBlue;
        break;
      case this.States.RightBlue:
        this.set_color(this.RGB(0, 0, 3));
        this.set_motors(0, this.kilo_turn_right);
        this.state = this.States.ForwardGreen;
        break;
    }
  }
}

window['ExperimentLab1.3'] = class {
  constructor() {
    this.runnerOptions = {
      limitSpeed: true,
      traversedPath: false,
      darkMode: false,
    }
  }

  createRobots(newRobotFunc, newLightFunc, RADIUS, NEIGHBOUR_DISTANCE, TICKS_BETWEEN_MSGS) {
    let MathRandom = new Math.seedrandom(1234);
    for(let i = 0; i < 10; i++) {
      newRobotFunc({
          x: MathRandom(),
          y: MathRandom(),
        },
        MathRandom() * 2*Math.PI,
        new RobotLab1_3(),
      );
    }
  }
}

// ---
class RobotSync extends Kilobot {
  setup() {
    this.PERIOD = 60;
    this.RESET_TIME_ADJUSTMENT_DIVIDER = 120;
    this.RESET_TIME_ADJUSTMENT_MAX = 30;

    let s = this.rand_soft(); // Math.floor(60 * this.rand_soft()/255);

		this.message = {data: [s]};
    this.last_reset = s;
		this.reset_time = s;
    this.reset_time_adjustment = 0;
	}

  loop() {
    // console.log(this.kilo_ticks, this.last_reset, this.kilo_ticks >= this.last_reset, this.kilo_ticks > (this.last_reset + 1));
    if(this.kilo_ticks >= this.reset_time) {

      this.reset_time_adjustment = (this.reset_time_adjustment / this.RESET_TIME_ADJUSTMENT_DIVIDER);

			// Apply a cap to the absolute value of the reset time adjustment.
			if (this.reset_time_adjustment < - this.RESET_TIME_ADJUSTMENT_MAX) {
				this.reset_time_adjustment = - this.RESET_TIME_ADJUSTMENT_MAX;
			} else if (this.reset_time_adjustment > this.RESET_TIME_ADJUSTMENT_MAX) {
				this.reset_time_adjustment = this.RESET_TIME_ADJUSTMENT_MAX;
			}

			this.last_reset = this.kilo_ticks;
			this.reset_time = this.kilo_ticks + this.PERIOD + this.reset_time_adjustment;

			this.reset_time_adjustment = 0;

			// Set the LED white and turn the motors on.
			this.set_color(this.RGB(2, 2, 3));
      // this.set_motors(this.kilo_straight_left, this.kilo_straight_right);

      // this.set_color(this.RGB(3, 0, 0));
      // this.last_reset = this.kilo_ticks;
    } else if (this.kilo_ticks > (this.last_reset + 1)) {
        this.set_color(this.RGB(0, 0, 0));
        this.set_motors(0, 0);
    }
    // else if (this.kilo_ticks) { this.set_color(this.RGB(0, 0, 0)); }

		if ((this.kilo_ticks - this.last_reset) < 255) {
			this.message.data[0] = this.kilo_ticks - this.last_reset;
			// this.message.crc = message_crc(&this.message);
		} else {
			// this.message.crc = 0;
    }
  }

  message_tx() {
    return this.message;
  }

	message_rx(m, d) {
		let my_timer = this.kilo_ticks - this.last_reset;
		let rx_timer = m.data[0];
		let timer_discrepancy = my_timer - rx_timer;

		// Reset time adjustment due to this message - to be combined with the
		// overall reset time adjustment.
		let rx_reset_time_adjustment = 0;

		if (timer_discrepancy > 0) {
			// The neighbor is trailing behind: move the reset time forward
			// (reset later).
			if (timer_discrepancy < (this.PERIOD / 2))
			{
				rx_reset_time_adjustment = timer_discrepancy;
			} else {
				// The neighbor is running ahead: move the reset time backward
				// (reset sooner).
				rx_reset_time_adjustment = - (this.PERIOD - timer_discrepancy) % this.PERIOD;
			}
		} else if (timer_discrepancy < 0) {
			// The neighbor is running ahead: move the reset time backward
			// (reset sooner).
			if (- timer_discrepancy < (this.PERIOD / 2)) {
				rx_reset_time_adjustment = timer_discrepancy;
			} else {
				// The neighbor is trailing behind: move the reset time forward
				// (reset later).
				rx_reset_time_adjustment = (this.PERIOD + timer_discrepancy) % this.PERIOD;
			}
		}

		// Combine the reset time adjustment due to this message with the overall
		// reset time adjustment.
		this.reset_time_adjustment = this.reset_time_adjustment + rx_reset_time_adjustment;
    // console.log(this.reset_time_adjustment);
	}
}

window['ExperimentSync'] = class {
  constructor() {
    this.runnerOptions = {
      limitSpeed: true,
      traversedPath: false,
      darkMode: true,
    }
  }

  gradientNoise() {
    if(this.perlinNoiseValue == null) {
      this.perlinNoiseValue = 0.5;
    }

    this.perlinNoiseValue += (this.MathRandom()-0.5)/2;
    if(this.perlinNoiseValue > 1) this.perlinNoiseValue = 1;
    if(this.perlinNoiseValue < 0) this.perlinNoiseValue = 0;
    return this.perlinNoiseValue;
  }

  createRobots(newRobotFunc, newLightFunc, RADIUS, NEIGHBOUR_DISTANCE, TICKS_BETWEEN_MSGS) {
    this.MathRandom = new Math.seedrandom(1234);
    this.INITIAL_DIST = 4.0*RADIUS;

    let s = 5;
    for(let i = -s; i < s; i++) {

      let jInc = null;
      let jCheck = null;

      let j = null;

      if(i % 2 == 1) {
        j = -s;
        jCheck = () => j < +s;
        jInc = () => j++;
      } else {
        j = +s-1;
        jCheck = () => j >= -s;
        jInc = () => j--;
      }

      for(; jCheck(); jInc()) {
        newRobotFunc({
          x: j * this.INITIAL_DIST + (this.gradientNoise()-0.5)*RADIUS*1,
          y: i * this.INITIAL_DIST + (this.gradientNoise()-0.5)*RADIUS*1,
        },
          this.MathRandom() * 2*Math.PI,
          new RobotSync(),
        );
      }
    }

  }
}

// --
class RobotGradientFormation extends Kilobot {
  constructor(isSeed, INITIAL_DIST) {
    super();
    this.isSeed = isSeed;
    this.INITIAL_DIST = INITIAL_DIST;
    this.COLORS = [
      this.RGB(3, 0, 0), // red
      this.RGB(3, 0, 3), // magenta
      this.RGB(0, 0, 3), // blue
      this.RGB(0, 3, 3), // cyan
      this.RGB(0, 3, 0), // green
      this.RGB(3, 3, 0), // yellow
    ];
  }

  setup() {
    if(this.isSeed) {
      // this.myGradient = 0;
      this.setGradient(0);
      // this.set_color(this.RGB(3, 3, 3));
    } else {
      this.myGradient = 1 + this.rand_soft();
    }
    this.gradientDist = 1.5*this.INITIAL_DIST;
    this.minNeighborValue = Infinity;
    this.updatedAt = this.rand_soft();
    this.PERIOD = 60;
  }

  doGradientFormation() {
    if(this.isSeed) {
      return;
    }

    let grad = Infinity;

    if(this.messageReceived) {
      if(this.messageReceivedData < this.minNeighborValue) {
        this.minNeighborValue = this.messageReceivedData;
      }
      this.messageReceived = false;
    }

    if(this.kilo_ticks > this.updatedAt + this.PERIOD) {
      if(this.minNeighborValue < Infinity) {
        this.setGradient(this.minNeighborValue + 1);
        this.minNeighborValue = Infinity;
      }
      this.updatedAt = this.kilo_ticks
    }
  }

  loop() {
    this.doGradientFormation();
  }

  set_colors_for_gradient(g) {
    if(g == null) {
      return;
    }
    this.set_color(this.COLORS[g % this.COLORS.length]);
  }

  setGradient(newValue) {
    if(this.myGradient == newValue) {
      return;
    }

    this.myGradient = newValue;
    this.set_colors_for_gradient(this.myGradient);
  }

  message_rx(message, distance) {
    if(distance > this.gradientDist) {
      return;
    }

    this.messageReceived = true;
    this.messageReceivedData = message;
    this.messageReceivedDist = distance;
  }

  message_tx() {
    return this.myGradient;
  }
}

window['ExperimentGradientFormation'] = class {
  constructor() {
    this.runnerOptions = {
      limitSpeed: false,
      darkMode: true,
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

        console.log({
          uid: b.robot._uid,
          grad: b.robot.myGradient,
          isSeed: b.robot.isSeed,
          events: b.robot.events,
        });
        ev.stopPropagation();
      });
    }
  }

  gridPosToPhysPos (gridPos) {
    let pos = {
      x: (this.RootSeedPos.x + this.INITIAL_DIST/2),
      y: (this.RootSeedPos.y + Math.sqrt(3) * this.INITIAL_DIST/2 + 2*this.INITIAL_DIST/2),
    };

    pos.x += gridPos.x * this.INITIAL_DIST + (gridPos.y%2==0 ? -this.INITIAL_DIST/2 : 0);
    pos.y += gridPos.y * this.INITIAL_DIST * Math.sqrt(3)/2;
    return pos;
  }

  hexagridPositions(count) {
    const TAKEN = true;
    let hexagrid = {};
    this.RootSeedPos = {x: 0, y: 0};

    let hexaNeighbors = [
               [0,   -1], [+1,-1],
      [-1, 0], /*cursor*/ [+1, 0],
               [0,   +1], [+1,+1],
    ];
    let hexagridCursor = {
      x: 0,
      y: 0,
    };
    let positions = [];
    for(let i = 0; i < count; i++) {
      let candidates = hexaNeighbors.map(adjacentPoint => {
        let candidate = {
          x: hexagridCursor.x + adjacentPoint[0],
          y: hexagridCursor.y + adjacentPoint[1],
        }

        if(hexagrid[`${candidate.x}:${candidate.y}`] == TAKEN)
          return null;

        /*
        if(false) {
          if(candidate.y < 0) return null;
        } else if(false) {
          let seedAreaWidth = Math.floor(this.NEIGHBOUR_DISTANCE/this.INITIAL_DIST) * 2;
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
                if(d < 4*this.INITIAL_DIST) {
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
        */

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

      hexagrid[`${best.x}:${best.y}`] = TAKEN;
      let pos = gridPosToPhysPos(best);

      hexagridCursor.x = best.x;
      hexagridCursor.y = best.y;

      // if(true /*!PERFECT*/) {
      //   pos.x += this.noise(0.2 * this.INITIAL_DIST);
      //   pos.y += this.noise(0.2 * this.INITIAL_DIST);
      // }

      positions.push(pos);
    }
    return positions;
  }

  gradientNoise() {
    if(this.perlinNoiseValue == null) {
      this.perlinNoiseValue = 0.5;
    }

    this.perlinNoiseValue += (this.MathRandom()-0.5)/2;
    if(this.perlinNoiseValue > 1) this.perlinNoiseValue = 1;
    if(this.perlinNoiseValue < 0) this.perlinNoiseValue = 0;
    return this.perlinNoiseValue;
  }

  createRobots(newRobotFunc, newLightFunc, RADIUS, NEIGHBOUR_DISTANCE, TICKS_BETWEEN_MSGS) {
    this.MathRandom = new Math.seedrandom(1234);
    this.INITIAL_DIST = 2.5*RADIUS;
    this.noise = function(magnitude) {
      return magnitude * (this.MathRandom()-0.5);
    }
    this.RootSeedPos = {x: 0, y: 0};
    // newLightFunc({x: 10 * this.INITIAL_DIST, y: 10 * this.INITIAL_DIST});

    let width = 32;
    let height = 32;

    for(let i = -Math.floor(height/2); i < +Math.floor(height/2); i++) {
      for(let j = -Math.floor(width/2); j < +Math.floor(width/2); j++) {
        let isSeed = false;
        let pos = this.gridPosToPhysPos({x: j, y: i});

        newRobotFunc({
          x: pos.x, //  + (this.gradientNoise()-0.5)*RADIUS*0.3,
          y: pos.y, //  + (this.gradientNoise()-0.5)*RADIUS*0.3,
        },
          this.MathRandom() * 2*Math.PI,
          new RobotGradientFormation(isSeed, this.INITIAL_DIST),
        );
      }
    }

    {
      let isSeed = true;
      newRobotFunc(this.gridPosToPhysPos({x: -1-Math.floor(width/2), y: -1}),
        this.MathRandom() * 2*Math.PI,
        new RobotGradientFormation(true, this.INITIAL_DIST),
      );
    }

    /*
    let positions = this.hexagridPositions(512);
    for(let i = 0; i < positions.length; i++) {
      let isSeed = i == positions.length-1;
      newRobotFunc({
          x: positions[i].x,
          y: positions[i].y,
        },
        this.MathRandom() * 2*Math.PI,
        new RobotGradientFormation(isSeed, this.INITIAL_DIST),
      );
    }
    */
  }
}

window['ExperimentPhototaxis2'] = class {
  constructor() {
   this.runnerOptions = {
      limitSpeed: false,
      traversedPath: false,
      // selectedUID: 23,
      darkMode: false,
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

        console.log({
          uid: b.robot._uid,
          direction: b.robot.direction,
          last_value: b.robot.last_value,
          events: b.robot.events,
        });
        ev.stopPropagation();
      });
    }
  }

  createRobots(newRobotFunc, newLightFunc, RADIUS, NEIGHBOUR_DISTANCE, TICKS_BETWEEN_MSGS) {
    this.MathRandom = new Math.seedrandom(1234);
    this.INITIAL_DIST = 5*RADIUS;


    let width = 10;
    let height = 10;

    // newLightFunc({x: +width*this.INITIAL_DIST, y: -height/10/2*this.INITIAL_DIST});
    // newLightFunc({x: -width*this.INITIAL_DIST, y: -height/10/2*this.INITIAL_DIST});

    newLightFunc({x: 0, y: -height/2*this.INITIAL_DIST});
    newLightFunc({x: 0, y: +height/2*this.INITIAL_DIST});

    for(let i = -Math.floor(height/2); i < +Math.floor(height/2); i++) {
      for(let j = -Math.floor(width/2); j < +Math.floor(width/2); j++) {

        newRobotFunc({
          x: j * this.INITIAL_DIST,
          y: i * this.INITIAL_DIST,
        },
          this.MathRandom() * 2*Math.PI,
          new RobotPhototaxis(false),
        );
      }
    }
  }
}

// phototaxis
class RobotPhototaxis extends Kilobot {
  constructor(anti) {
    super();
    this.anti = anti;
  }

  setup() {
    // AbilityPhototaxis is defined in experiments/abilities.js
    this.abilityPhototaxis = new AbilityPhototaxis();
    this.abilityPhototaxis.setup(this);
    if(this.anti) {
      this.set_color(this.RGB(0, 1, 2));
    } else {
      this.set_color(this.RGB(3, 2, 1));
    }
  }

  loop() {
    switch(this.anti) {
      case true: this.abilityPhototaxis.doAntiphototaxis(this); break;
      case false: this.abilityPhototaxis.doPhototaxis(this); break;
    }
  }
}

window['ExperimentPhototaxisAndAntiphototaxis'] = class {
  constructor() {
    this.runnerOptions = {
      limitSpeed: true,
      traversedPath: false,
      selectedUID: 5,
      darkMode: false,
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

        console.log({
          uid: b.robot._uid,
          direction: b.robot.direction,
          last_value1: b.robot.last_value1,
          events: b.robot.events,
        });
        ev.stopPropagation();
      });
    }
  }

  createRobots(newRobotFunc, newLightFunc, RADIUS, NEIGHBOUR_DISTANCE, TICKS_BETWEEN_MSGS) {
    this.MathRandom = new Math.seedrandom(1234);
    this.INITIAL_DIST = 5*RADIUS;


    let width = 10;
    let height = 10;

    newLightFunc({x: 0, y: -height/10/2*this.INITIAL_DIST});
    // newLightFunc({x: -width*this.INITIAL_DIST, y: -height/10/2*this.INITIAL_DIST});

    // newLightFunc({x: width*this.INITIAL_DIST, y: -height/2*this.INITIAL_DIST});
    // newLightFunc({x: width*this.INITIAL_DIST, y: +height/2*this.INITIAL_DIST});

    for(let i = -Math.floor(height/2); i < +Math.floor(height/2); i++) {
      for(let j = -Math.floor(width/2); j < +Math.floor(width/2); j++) {

        newRobotFunc({
          x: j * this.INITIAL_DIST,
          y: i * this.INITIAL_DIST,
        },
          this.MathRandom() * 2*Math.PI,
          new RobotPhototaxis(this.MathRandom() > 0.5),
        );
      }
    }
  }
}

class RobotTestAttractAndAvoid extends Kilobot {
  constructor(state) {
    super();
    this.state = state;

    {
      this.MAX_NEIGHBOURS = 60;
      this.VACANT = -1;
      this.NO_GRAD = 10000;
      this.NO_POS = 100000;
      this.STATIONARY = 1;
      this.NOT_STATIONARY = 0;

      // ints:
      this.neighbors_id = new Int32Array(this.MAX_NEIGHBOURS);
      this.neighbors_grad = new Int32Array(this.MAX_NEIGHBOURS);
      this.neighbors_seen_at = new Int32Array(this.MAX_NEIGHBOURS);
      this.neighbors_pos_confidence = new Int32Array(this.MAX_NEIGHBOURS);
      this.neighbors_consensus_counter = new Int32Array(this.MAX_NEIGHBOURS);

      // floats:
      this.neighbors_dist = new Float64Array(this.MAX_NEIGHBOURS);
      this.neighbors_pos_x = new Float64Array(this.MAX_NEIGHBOURS);
      this.neighbors_pos_y = new Float64Array(this.MAX_NEIGHBOURS);

      // boolean:
      this.neighbors_is_seed = new Int32Array(this.MAX_NEIGHBOURS);
      this.neighbors_is_stationary = new Int32Array(this.MAX_NEIGHBOURS);

      // other:
      this.neighbors_state = new Array(); // string, TODO: change to int
      this.neighbors_robotsIveEdgeFollowed = new Array();

      for(let i = 0; i < this.MAX_NEIGHBOURS; i++) {
        this.neighbors_id[i] = this.VACANT;
        this.neighbors_grad[i] = this.NO_GRAD;
        this.neighbors_pos_x[i] = this.NO_POS;
        this.neighbors_pos_y[i] = this.NO_POS;
        this.neighbors_is_stationary[i] = this.STATIONARY;
      }
    }

  }

  setup() {
    // AbilityPhototaxis is defined in experiments/abilities.js
    this.abilityAttract = new AbilityAttractAndAvoid();
    this.abilityAttract.setup(this);
  }

  loop() {
    if(this.kilo_ticks < 60)
      return;

    switch(this.state) {
      case "avoid":

        this.set_color(this.RGB(0, 1, 2));

        let csrIndex = this.getClosestStationaryRobotIndex();
        if(csrIndex != null) {
          this.abilityAttract.doAvoid(this, this.closestDist);
          this.closestDist = this.neighbors_dist[csrIndex];
          // this.last_value1 = this.abilityAttract.last_value1;
          // this.last_value2 = this.abilityAttract.last_value2;
          // this.didSomething = this.abilityAttract.didSomething;

          // console.log(this.closestDist);
          if(this.closestDist > 4) {
            this.state = "stationary";
          }
        }

        break;
      case "attract":
        this.set_color(this.RGB(3, 2, 1));
        this.abilityAttract.doAttract(this);
        break;
      case "stationary":
        this.set_color(this.RGB(0, 0, 0));
        break;
    }
  }

  getClosestStationaryRobotIndex() {
    let bestIndex = null;
    for(let i = 0; i < this.MAX_NEIGHBOURS; i++) {
      if(this.neighbors_id[i] == this.VACANT) continue;
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

  message_rx(message, distance) {

    let index = -1;
    let existing = false;
    for(let i = 0; i < this.MAX_NEIGHBOURS; i++) {
      if(this.neighbors_id[i] == message.robotUID) {
        index = i;
        existing = true;
        break;
      }

      if(index == -1) { // do it only once
        if(this.neighbors_id[i] == this.VACANT || this.counter >= this.neighbors_seen_at[i] + this.NEIGHBOUR_EXPIRY) {
          index = i;
        }
      }
    }

    if(index == -1) {
      // console.error("did not found a place to add neighbor info");
      return;
    }

    this.neighbors_id[index] = message.robotUID;
    this.neighbors_grad[index] = message.grad;
    this.neighbors_state[index] = message.state;
    this.neighbors_seen_at[index] = this.counter;
    this.neighbors_dist[index] = distance;
  }

  message_tx() {
    return {
      robotUID: this.kilo_uid,
      state: this.state,
    };
  }
}

window['ExperimentAbilities'] = class {
  constructor() {
    this.runnerOptions = {
      limitSpeed: true,
      traversedPath: false,
      selectedUID: 3,
      darkMode: false,
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

        console.log({
          uid: b.robot._uid,
          direction: b.robot.direction,
          last_value1: b.robot.last_value1,
          events: b.robot.events,
        });
        ev.stopPropagation();
      });
    }
  }

  createRobots(newRobotFunc, newLightFunc, RADIUS, NEIGHBOUR_DISTANCE, TICKS_BETWEEN_MSGS) {
    this.MathRandom = new Math.seedrandom(1234);
    this.INITIAL_DIST = 2.5*RADIUS;

    // newLightFunc({x: 0, y: -height/10/2*this.INITIAL_DIST});

    for(let j = 0; j < 4; j ++)
      for(let i = 0; i < 5; i ++) {
        let state = "stationary";
        if(i == 2 && j == 0)
          state = "avoid";
        newRobotFunc({
          x: i * this.INITIAL_DIST,
          y: j * this.INITIAL_DIST,
        },
          this.MathRandom() * 2*Math.PI,
          new RobotTestAttractAndAvoid(state),
        );
      }
  }
}

// follow the leader
class RobotFollowTheLeader extends Kilobot {
  constructor(id, RADIUS) {
    super();
    this.id = id;
    this.States = {
      Move: 'Move',
      Wait: 'Wait',
    };
    this.RADIUS = RADIUS;
    // this.abilityAttract = new AbilityAttractAndAvoid();
  }

  setup() {
    // this.abilityAttract.setup(this);
    if(this.id == 1) {
      this.amLeader = true;
      this.amTail = false;
    } else {
      this.amLeader = false;
      this.amTail = true; // until proven otherwise
    }

    if(this.amLeader) {
      this.set_color(this.RGB(0, 3, 0));
    } else {
      this.set_color(this.RGB(3, 3, 3));
    }

    if(this.id % 2 == 0) {
      this.switchState(this.States.Wait);
      this.frontRobotState = this.States.Move;
      this.backRobotState = this.States.Move;
    } else {
      this.switchState(this.States.Move);
      this.frontRobotState = this.States.Wait;
      this.backRobotState = this.States.Wait;
    }

    this.direction = 0;
    this.PERIOD = 0;
    this.last_updated = 30 * this.rand_soft()/255;
    this.stateChangedAt = 30 * this.rand_soft()/255;
    this.last_value = 0;
  }

  message_rx(message, distance) {
    if(message.id > this.id) {
      this.amTail = false;
    }

    if(message.id == this.id + 1) {
      this.backRobotState = message.state;
      this.backRobotDist = distance;
    } else if(message.id == this.id - 1) {
      this.frontRobotState = message.state;
      this.frontRobotDist = distance;
    }

    // if(this.kilo_ticks < this.stateChangedAt + 30)
    //   return;
    // this.stateChangedAt = this.kilo_ticks;

    switch(this.state) {
      case this.States.Wait:
        if(
          (
            (this.amLeader && this.backRobotDist < 3.5 * this.RADIUS)
            ||
            (!this.amLeader && this.frontRobotDist > 3.5 * this.RADIUS)
          )
          &&
          (this.frontRobotState == this.States.Wait || this.amLeader)
          &&
          (this.backRobotState == this.States.Wait || this.amTail)
        ){
          this.switchState(this.States.Move);
        }
        break;
      case this.States.Move:
        if(this.amLeader && this.backRobotDist > 3.5 * this.RADIUS) {
          this.switchState(this.States.Wait);
        }

        if(!this.amLeader && this.frontRobotDist < 3.5 * this.RADIUS) {
          this.switchState(this.States.Wait);
        }
        break;
    }
  }

  switchState(newState) {
    if(this.amLeader) {
      this.set_color(this.RGB(3, 0, 0));
    } else if(this.amTail) {
      this.set_color(this.RGB(0, 0, 3));
    } else {
      this.set_color(this.RGB(0, 2, 0));
    }
    switch(newState) {
      case this.States.Move:
        break;
      case this.States.Wait:
        break;
    }
    this.state = newState;
  }

  moveLeader() {
    // // random:
    // switch((3*this.rand_soft()/255)|0) {
    //   case 0: this.set_motors(0, this.kilo_turn_right); break;
    //   case 1: this.set_motors(this.kilo_turn_left, 0); break;
    //   case 2: this.set_motors(this.kilo_straight_left, this.kilo_straight_right); break;
    // }

    // orbit around -10*RADIUS,0
    if(this.kilo_ticks % 100 == 0) {
      this.set_motors(this.kilo_turn_left, 0);
    } else {
      this.set_motors(this.kilo_straight_left, this.kilo_straight_right);
    }
  }

  getCloserToFrontRobot() {
    // this.abilityAttract.doAttract(this, this.frontRobotDist);
    // return;

    switch(this.direction) {
      case 0: this.set_motors(0, this.kilo_turn_right); break;
      case 1: this.set_motors(this.kilo_turn_left, 0); break;
      case 2: this.set_motors(this.kilo_straight_left, this.kilo_straight_right); break;
    }

    if(this.kilo_ticks < this.last_updated + this.PERIOD)
      return;
    this.last_updated = this.kilo_ticks;

    let value = this.frontRobotDist;

    if(value > this.last_value) {
      this.direction = (this.direction + 1) % 2;
      this.PERIOD = (this.PERIOD + 1) % 2;
    }

    this.last_value = value;
  }

  loop() {
    if(this.kilo_ticks % 4 != 0)
      return;

    if(this.state == this.States.Move) {
      if(this.amLeader) {
        this.moveLeader();
      } else {
        this.getCloserToFrontRobot();
      }
    }

  }

  message_tx() {
    return {
      id: this.id,
      state: this.state,
    }
  }
}

window['ExperimentFollowTheLeader'] = class {
  constructor() {
    this.runnerOptions = {
      limitSpeed: false,
      traversedPath: true,
      traversedPathLen: 100,
      darkMode: false,
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
        console.log({
          uid: b.robot._uid,
          state: b.robot.state,
          amLeader: b.robot.amLeader,
          amTail: b.robot.amTail,
        });
        ev.stopPropagation();
      });
    }

    return;

    let g = new PIXI.Graphics()
    g.zIndex = zIndexOf('FollowTheLeader');
    g.alpha = 0.75;

    platformGraphics.addChild(g);
    pixiApp.ticker.add(() => {
      g.clear();

      for(let i = 0; i < bodyIDs.length-1; i++) {
        let b1 = bodies[bodyIDs[i+0]];
        let b2 = bodies[bodyIDs[i+1]];
        g.lineStyle(1, 0x000000);
        g.moveTo(
          b1.body.GetPosition().get_x() * this.V.ZOOM,
          b1.body.GetPosition().get_y() * this.V.ZOOM,
        );
        g.lineTo(
          b2.body.GetPosition().get_x() * this.V.ZOOM,
          b2.body.GetPosition().get_y() * this.V.ZOOM,
        );
      }
    });
  }

  createRobots(newRobotFunc, newLightFunc, RADIUS, NEIGHBOUR_DISTANCE, TICKS_BETWEEN_MSGS) {
    this.MathRandom = new Math.seedrandom(1234);
    this.INITIAL_DIST = 3*RADIUS;

    for(let i = 0; i < 6; i++) {
      let id = i+1;
      newRobotFunc({
        x: i * this.INITIAL_DIST,
        y: 0,
      },
        Math.PI, // this.MathRandom() * 2*Math.PI,
        new RobotFollowTheLeader(id, RADIUS),
      );
    }
  }
}

// newton
class RobotNewton extends Kilobot {
  constructor(id, RADIUS, left, right) {
    super();
    this.id = id;
    this.radius = RADIUS;
    this.left = left || 0;
    this.right = right || 0;
  }

  setup() {
    if(this.left > 0 || this.right > 0) {
      this.set_color(this.RGB(0, 0, 3));
    }
  }

  message_rx(message, distance) {
  }

  loop() {
    this.set_motors(this.left, this.right);
  }

  message_tx() {
    return null;
  }
}

window['ExperimentNewton'] = class {
  constructor() {
    this.runnerOptions = {
      limitSpeed: true,
      traversedPath: true,
      darkMode: false,
      selectedUID: 2,
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
        console.log({
          uid: b.robot._uid,
        });
        ev.stopPropagation();
      });
    }
  }

  createRobots(newRobotFunc, newLightFunc, RADIUS, NEIGHBOUR_DISTANCE, TICKS_BETWEEN_MSGS) {
    this.INITIAL_DIST = 2*RADIUS;

    newLightFunc({x: 0, y: -10 * this.INITIAL_DIST});

    this.MathRandom = new Math.seedrandom(1234);
    let rowHeight = 4 * RADIUS;
    let row = -2;
    let id = 0;

    row++;
    id++;
    newRobotFunc({
      x: 0 * this.INITIAL_DIST,
      y: row*rowHeight,
    },
      0,
      new RobotNewton(id, RADIUS, 0, 255),
    );

    id++;
    newRobotFunc({
      x: 4 * this.INITIAL_DIST,
      y: row*rowHeight,
    },
      0,
      new RobotNewton(id, RADIUS, 255, 0),
    );

    id++
    row++;
    newRobotFunc({
      x: 0 * this.INITIAL_DIST,
      y: row*rowHeight,
    },
      0,
      new RobotNewton(id, RADIUS, 255, 255),
    );

    row++;
    for(let i = -1; i < 2; i++) {
      id++;
      newRobotFunc({
        x: i * this.INITIAL_DIST,
        y: row*rowHeight,
      },
        0,
        new RobotNewton(id, RADIUS,
          i == 0 ? 255 : 0,
          i == 0 ? 255 : 0,
        ),
      );
    }

    row++;
    for(let i = -1; i < 3; i++) {
      id++;
      newRobotFunc({
        x: i * this.INITIAL_DIST,
        y: row*rowHeight,
      },
        0,
        new RobotNewton(id, RADIUS,
          i == 0 ? 255 : 0,
          i == 0 ? 255 : 0,
        ),
      );
    }

  }
}
