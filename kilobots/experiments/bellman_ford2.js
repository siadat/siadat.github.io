{
class Robot extends Kilobot {
  constructor(defunct, isEndpoint, linkDist) {
    super();
    this.abilityBellmanFordRouting = new AbilityBellmanFordRouting(this, defunct, isEndpoint, linkDist);
  }

  setup() {
    this.abilityBellmanFordRouting.setup();
  }

  loop() {
    // if(!this.abilityBellmanFordRouting.defunct) {
    //   this.set_motors(this.kilo_turn_left, 0);
    // }

    this.abilityBellmanFordRouting.loop();
    this.abilityBellmanFordRouting.sendSomething();
    this.abilityBellmanFordRouting.updateColors();

    if(this.abilityBellmanFordRouting.defunct) {
      if(this.kilo_ticks % 50 == 0 && this.rand_soft() > 252) {
        // get back to work
        this.abilityBellmanFordRouting.defunct = false;
      }
    } else if (!this.abilityBellmanFordRouting.isEndpoint) {
      if(this.kilo_ticks % (100 + this.rand_soft()) == 0 && this.rand_soft() > 250) {
        this.abilityBellmanFordRouting.defunct = true;
      }
    }
  }

  message_rx(message, distance) {
    this.abilityBellmanFordRouting.message_rx(message, distance);
    this.abilityBellmanFordRouting.updateColors();
  }

  message_tx() {
    return this.abilityBellmanFordRouting.message_tx();
  }
}

window['ExperimentBellmanFord2'] = class {
  // AKA Distance Vector (DV) protocol
  // A distributed routing protocol (i.e., each node is NOT aware of the whole
  // network topology, as it is the case in the Link-State routing protocol)
  //
  // every switch has a maximum of 6 links
  // all nodes keep a table of the best link-cost for all end-points

  constructor() {
    this.runnerOptions = {
      limitSpeed: true,
      traversedPath: false,
      // traversedPathLen: 100,
      darkMode: !false,
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
          routingTable: b.robot.routingTable,
          robot: b.robot,
          events: b.robot.events,
        });
        ev.stopPropagation();
      });
    }
  }

  createRobots(newRobotFunc, newLightFunc, RADIUS, NEIGHBOUR_DISTANCE, TICKS_BETWEEN_MSGS) {
    this.MathRandom = new Math.seedrandom(5);
    this.INITIAL_DIST = 2.1*RADIUS;
    this.noise = function(magnitude) {
      return magnitude * (this.MathRandom()-0.5);
    }

    let width = 20;
    let height = 20;

    let workingCounter = 0;

    let minI = -Math.floor(height/2);
    let maxI = +Math.floor(height/2);

    let minJ = -Math.floor(width/2);
    let maxJ = +Math.floor(width/2);

    let robotSpecs = [];
    for(let i = minI; i < maxI; i++) {
      for(let j = minJ; j < maxJ; j++) {
        let defunct = false;

        // if(this.MathRandom() > 0.55) defunct = true;

        // if(AbilityFuncs.gradientNoise(this.MathRandom) > 0.5)
        //   defunct = true;

        robotSpecs.push({
          pos: AbilityFuncs.toHexaGrid({x: j, y: i}, this.INITIAL_DIST),
          defunct: defunct,
        });
      }
    }

    let functioningRobots = robotSpecs.filter(s => !s.defunct)

    for(let i = 0; i < 3; i++) {
      let idx = Math.floor(this.MathRandom() * functioningRobots.length);
      functioningRobots[idx].isEndpoint = true;
    }

    robotSpecs.forEach(s => {
      if(s.defunct) return;

      newRobotFunc({
        x: s.pos.x + (AbilityFuncs.gradientNoise(this.MathRandom)-0.5)*RADIUS*0.5,
        y: s.pos.y + (AbilityFuncs.gradientNoise(this.MathRandom)-0.5)*RADIUS*0.5,
      },
        this.MathRandom() * 2*Math.PI,
        new Robot(s.defunct, s.isEndpoint, this.INITIAL_DIST * 1.5),
        // new RobotGradientFormation(s.isEndpoint, this.INITIAL_DIST), // s.defunct, s.isEndpoint),
      );
    });
  }
}
}
