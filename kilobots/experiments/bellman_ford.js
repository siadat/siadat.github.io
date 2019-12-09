{
class Robot extends Kilobot {
  constructor(defunct, isEndpoint, isSender, sendData, INITIAL_DIST) {
    super();
    this.defunct = defunct;
    this.isEndpoint = isEndpoint;
    this.linkDist = INITIAL_DIST * 1.2;
    this.isSender = isSender;
    // this.sendData = sendData;

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
    this.routingTable = {};
    this.userPackets = [];
    this.offset = this.rand_soft();

    if(this.isEndpoint) {
      // add self
      this.routingTable[this.kilo_uid] = {
        cost: 0,
        link: null,
      };
    }

    if(this.defunct) {
      this.set_color(this.RGB(0, 0, 0));
    } else {
      // if(this.isEndpoint || this.isSender) {
      //   this.set_color(this.RGB(3, 0, 0));
      // } else {
      //   this.set_color(this.RGB(0, 0, 0));
      // }
    }
  }

  setColor(c) {
    this.lastColorUpdatedAt = this.kilo_ticks;
    this.set_color(c);
  }

  loop() {
    if(this.defunct) return;

    this.updateColors();

    if(this.isSender && (this.kilo_ticks + this.offset) % 240 == 0) {
      let ids = Object.keys(this.routingTable).filter(id => id != this.kilo_uid);
      let idx = Math.floor(this.kilo_ticks/240) % ids.length;
      let packetDestID = ids[idx];

      if(this.routingTable[packetDestID]) {
        this.userPackets.push({
          data: 1, // this.sendData,
          dest: packetDestID,
          link: this.routingTable[packetDestID].link,
          // history: [this.kilo_uid],
        });
      }

    }
  }

  updateColors() {
    if(this.isSender || this.isEndpoint) {
      this.setColor(this.COLORS[this.kilo_uid % this.COLORS.length]);
    } else if(this.userPackets.length >= 1) {
      this.setColor(this.COLORS[this.userPackets[0].dest % this.COLORS.length]);
    } else if(Object.keys(this.routingTable).length > 0) {

      if(this.lastColorUpdatedAt == null) { // || this.kilo_ticks > this.lastColorUpdatedAt + 240) {
        this.set_color(this.RGB(1, 1, 1));
      } else {
        this.set_color(this.RGB(0, 1, 2));
        // this.setColor(this.RGB(1, 1, 1));
      }

    } else {
      this.set_color(this.RGB(0, 0, 0));
    }
  }

  message_rx(message, distance) {
    if(this.defunct) return;

    if(distance > this.linkDist)
      return;

    for(let i = 0; i < message.vector.length; i++) {
      let destID = message.vector[i].id;
      let destCost = message.vector[i].cost;

      let currBestCost = this.routingTable[destID] && this.routingTable[destID].cost;

      if(currBestCost == null || destCost + distance < currBestCost) {
        this.routingTable[destID] = {
          cost: destCost + distance,
          link: message.id,
        }
      }
    }

    let neighborPackets = message.userPackets;

    for(let j = 0; j < neighborPackets.length; j++) {
      let p = neighborPackets[j];
      if(p.link != this.kilo_uid) // not for me
        continue;

      if(p.dest == this.kilo_uid) // it is me!
        continue;

      if(!this.routingTable[p.dest]) // I don't know how to send it
        continue;

      // p.history.push(this.kilo_uid);
      this.userPackets.push({
        data: p.data,
        dest: p.dest, // copy dest
        link: this.routingTable[p.dest].link, // choose link
        // history: p.history // copy dest
      });
    }
    this.updateColors();
  }

  message_tx() {
    if(this.defunct) return null;

    let msg = {
      id: this.kilo_uid,
      vector: Object.keys(this.routingTable).map(id => {return {id: id, cost: this.routingTable[id].cost}}),
      userPackets: this.userPackets,
    };


    // if(this.lastPacketSent == null || this.kilo_ticks > this.lastPacketSent + 30) {
      this.userPackets = [];
    // }
    return msg;
  }
}

window['ExperimentBellmanFord'] = class {
  // AKA Distance Vector (DV) protocol
  // A distributed routing protocol (i.e., each node is NOT aware of the whole
  // network topology, as it is the case in the Link-State routing protocol)
  //
  // every switch has a maximum of 6 links
  // all nodes keep a table of the best link-cost for all end-points

  constructor() {
    this.runnerOptions = {
      limitSpeed: true,
      traversedPath: true,
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
    this.MathRandom = new Math.seedrandom(12345);
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

        if(this.MathRandom() > 0.55)
          defunct = true;

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
      functioningRobots[idx].isSender = true; // i == 0 || i == 20-1;
      // functioningRobots[idx].sendData = i;
    }

    robotSpecs.forEach(s => {
      if(s.defunct) return;

      newRobotFunc({
        x: s.pos.x + (AbilityFuncs.gradientNoise(this.MathRandom)-0.5)*RADIUS*0.5,
        y: s.pos.y + (AbilityFuncs.gradientNoise(this.MathRandom)-0.5)*RADIUS*0.5,
      },
        this.MathRandom() * 2*Math.PI,
        new Robot(s.defunct, s.isEndpoint, s.isSender, s.sendData, this.INITIAL_DIST),
        // new RobotGradientFormation(s.isEndpoint, this.INITIAL_DIST), // s.defunct, s.isEndpoint),
      );
    });
  }
}
}
