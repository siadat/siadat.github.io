{
const calculateDistancePerf = function(x1, x2, y1, y2) {
  return Math.sqrt(
    (x1 - x2) ** 2 + (y1 - y2) ** 2
    // Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2)
  );
}

function toHex(led) {
  let r = Math.floor(0xff * led.r / 3.0).toString(16);
  let g = Math.floor(0xff * led.g / 3.0).toString(16);
  let b = Math.floor(0xff * led.b / 3.0).toString(16);
  if(r.length == 1) r = `0${r}`;
  if(g.length == 1) g = `0${g}`;
  if(b.length == 1) b = `0${b}`;
  return `0x${r}${g}${b}`;
}

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
        this.abilityBellmanFordRouting.unfail();
      }
    } else if (!this.abilityBellmanFordRouting.isEndpoint) {
      if(this.kilo_ticks % (100 + this.rand_soft()) == 0 && this.rand_soft() > 250) {
        this.abilityBellmanFordRouting.fail();
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

    if(true) {
      // position vectors
      let g = new PIXI.Graphics()
      g.zIndex = zIndexOf('LocalizationError');
      g.alpha = 0.75;
      let color = 0x008400;

      platformGraphics.addChild(g);
      pixiApp.ticker.add(() => {
        g.clear();
        // g.removeChildren();

        let maxCost = 1;
        if(this.maxCost == null)
          this.maxCost = Infinity;

        for(let i = 0; i < bodyIDs.length; i++) {
          let b = bodies[bodyIDs[i]];
          let pos = b.position;
          if(!b.position && b.getData) {
            let data = b.getData();
            pos = data.pos;
          }
          if(!b.robot.abilityBellmanFordRouting.routingTable)
            continue;

          if(b.robot.abilityBellmanFordRouting.defunct) {
            // const t = new PIXI.Text(`F`, {fontSize: 1.0 * this.RADIUS* this.V.ZOOM, align: 'center', fill: 0xaaaaaa});
            // t.anchor.set(0.5);
            // t.position = {
            //   x: pos.x*this.V.ZOOM,
            //   y: pox.y*this.V.ZOOM,
            // }
            // g.addChild(t);
            continue;
          }

          let endpointIDs = Object.keys(b.robot.abilityBellmanFordRouting.routingTable);

          for(let j = 0; j < endpointIDs.length; j++) {

            let posFrom = {
              x: +pos.x * this.V.ZOOM,
              y: +pos.y * this.V.ZOOM,
            }

            let id = endpointIDs[j];
            let linkID = b.robot.abilityBellmanFordRouting.routingTable[id].link;
            let cost = b.robot.abilityBellmanFordRouting.routingTable[id].cost;
            if(cost > maxCost) {
              maxCost = cost;
            }
            if(linkID == null)
              continue;

            let b2 = bodies[linkID];
            let pos2 = bodies[linkID].position;
            if(!b2.position && b2.getData) {
              let data = b2.getData();
              pos2 = data.pos;
            }

            let dist = calculateDistancePerf(pos.x, pos2.x, pos.y, pos2.y);

            let alpha = (this.maxCost - cost*1.0) / this.maxCost;
            let posTo = {
              // x: + (pos.x + (pos2.x - pos.x) / dist * 1.0 * this.RADIUS) * this.V.ZOOM,
              // y: + (pos.y + (pos2.y - pos.y) / dist * 1.0 * this.RADIUS) * this.V.ZOOM,
              x: + pos2.x * this.V.ZOOM,
              y: + pos2.y * this.V.ZOOM,
            }

            /*
            let hasPendingPacket = false;
            for(let k = 0; k < b.robot.abilityBellmanFordRouting.userPackets.length; k++) {
              let packet = b.robot.abilityBellmanFordRouting.userPackets[k];
              if(packet.link == linkID) {
                console.log("YES");
                alpha = 2 * alpha;
                break;
              }
            }
            */

            // alpha = Math.pow(alpha, 2);
            let thickness = Math.pow(alpha, 2)*this.RADIUS*this.V.ZOOM * 0.5; // 2
            color = toHex(bodies[id].robot.led);
            g.lineStyle(thickness, color, Math.pow(alpha, 3));

            // if(this.selectedUID && this.selectedUID != b.robot._uid) {
            //   g.lineStyle(thickness, color, 0.3);
            // }

            g.endFill();
            g.moveTo(posFrom.x, posFrom.y);
            g.lineTo(posTo.x, posTo.y);


            g.lineStyle(0);
            g.beginFill(color, alpha);
            /*
            let angle = AbilityFuncs.clockwiseAngle({x: pos.x + 0, y: pos.y + this.RADIUS}, pos2);
            // if(angle < 0) angle += 2 * Math.PI;
            g.drawPolygon([
              [-0.5, +0],
              [+0.0, -1],
              [+0.5, +0],
            ].map(p => {
              let point = {
                x: p[0] * this.RADIUS,
                y: p[1] * this.RADIUS,
              }
              let newPos = AbilityFuncs.rotatePoint(angle, {x: 0, y: 0}, point);

              return [
                this.V.ZOOM * (pos.x + newPos.x),
                this.V.ZOOM * (pos.y + newPos.y),
              ]
            }).flat());
            */
            // g.drawCircle(posTo.x, posTo.y, this.RADIUS*0.1 * this.V.ZOOM);
          }
        }
        this.maxCost = maxCost;
      });
    }
  }

  createRobots(newRobotFunc, newLightFunc, RADIUS, NEIGHBOUR_DISTANCE, TICKS_BETWEEN_MSGS) {
    this.RADIUS = RADIUS;
    this.MathRandom = new Math.seedrandom(5);
    this.INITIAL_DIST = 2.5*RADIUS;
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
        x: s.pos.x + (AbilityFuncs.gradientNoise(this.MathRandom)-0.5)*RADIUS*0.75,
        y: s.pos.y + (AbilityFuncs.gradientNoise(this.MathRandom)-0.5)*RADIUS*0.75,
      },
        this.MathRandom() * 2*Math.PI,
        new Robot(s.defunct, s.isEndpoint, this.INITIAL_DIST * 1.5),
        // new RobotGradientFormation(s.isEndpoint, this.INITIAL_DIST), // s.defunct, s.isEndpoint),
      );
    });
  }
}
}
