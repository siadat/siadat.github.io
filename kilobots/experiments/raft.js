{
class Robot extends Kilobot {
  constructor(defunct, isEndpoint, /*isSender,*/ sendData, INITIAL_DIST, endpointCount) {
    super();
    this.endpointCount = endpointCount;
    this.defunct = defunct;
    this.isEndpoint = isEndpoint;
    this.linkDist = INITIAL_DIST * 1.2;
    // this.isSender = isSender;
    // this.sendData = sendData;

    this.raftStates = {
      Routing: "Routing",
      Candidate: "Candidate",
      Follower: "Follower",
      Leader: "Leader",
    };

    this.COLORS = [
      this.RGB(3, 0, 0), // red
      this.RGB(3, 0, 3), // magenta
      // this.RGB(0, 0, 3), // blue
      this.RGB(0, 3, 3), // cyan
      this.RGB(0, 3, 0), // green
      this.RGB(3, 3, 0), // yellow
    ];

    this.COLORS_FOLLOWER = [
      this.RGB(3, 2, 2), // red
      this.RGB(3, 2, 3), // magenta
      // this.RGB(2, 2, 3), // blue
      this.RGB(2, 3, 3), // cyan
      this.RGB(2, 3, 2), // green
      this.RGB(3, 3, 2), // yellow
    ];

    this.COLORS_CANDIDATE = [
      this.RGB(1, 0, 0), // red
      this.RGB(1, 0, 1), // magenta
      // this.RGB(0, 0, 1), // blue
      this.RGB(0, 1, 1), // cyan
      this.RGB(0, 1, 0), // green
      this.RGB(1, 1, 0), // yellow
    ];

  }

  setup() {
    // "When servers start up, they begin as followers"
    this.raftState = this.raftStates.Routing;
    this.raftTerm = 0;
    // this.raftLeaderID = null;
    this.raftVote = null;

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

    /*
    */

    if(!this.isEndpoint) {
      return;
    }

    switch(this.raftState) {
      case this.raftStates.Routing:
        if(Object.keys(this.routingTable).length == this.endpointCount || this.kilo_ticks > this.routingTimeoutAt) {
          // routing table is not complete
          this.becomeFreshFollower(this.raftTerm);
          return;
        }
        break;

      case this.raftStates.Follower:

        if(this.kilo_ticks > this.raftElectionTimeoutAt) {
          this.becomeFreshCandidate();
        }

        break;

      case this.raftStates.Candidate:
        if(Object.keys(this.raftVotes).length > this.endpointCount * 0.5) { // quorum
          this.becomeFreshLeader();
        }

        if(this.kilo_ticks  > this.raftElectionTimeoutAt) {
          this.becomeFreshCandidate()
        } 

        break;

      case this.raftStates.Leader:
        if(this.raftLeaderTick % 120 == 0) {
          this.sendKeepalives();
        }
        this.raftLeaderTick++;
        break;
    }
  }

  message_rx(message, distance) {
    if(this.defunct) return;

    if(distance > this.linkDist)
      return;

    // routing
    for(let i = 0; i < message.vector.length; i++) {
      let destID = message.vector[i].id;
      let destCost = message.vector[i].cost;

      let currBestCost = this.routingTable[destID] && this.routingTable[destID].cost;

      if(currBestCost == null || destCost + distance < currBestCost) {
        this.routingTable[destID] = {
          cost: destCost + distance/1.0 /* RADIUS = 1.0 */,
          link: message.id,
        }
        this.routingTimeoutAt = this.kilo_ticks + 150 + this.rand_soft();
      }
    }

    let neighborPackets = message.userPackets;
    for(let j = 0; j < neighborPackets.length; j++) {
      let p = neighborPackets[j];

      if(p.link != this.kilo_uid) // not for me
        continue;

      if(p.dest == this.kilo_uid) { // I am the dest!
        if(p.data.raftTerm < this.raftTerm) {
          // obsolete term, ignore this request
          continue;
        }

        if(p.data.raftTerm > this.raftTerm) {
          this.becomeFreshFollower(p.data.raftTerm);
        }

        if(
          this.amCandidate() && this.isLeader(p)
          && p.data.raftTerm >= this.raftTerm
        ) {
          this.becomeFreshFollower(p.data.raftTerm);
          // this.raftLeaderID = p.src;
        }

        if(
          this.amCandidate() && this.isFollower(p)
          && p.data.raftVote == this.kilo_uid
        ) {
          this.raftVotes[p.src] = true;
          console.log(this.kilo_uid, "votes", Object.keys(this.raftVotes).length);
        }

        // vote (only once in this term)
        if(
          this.amFollower() && this.isCandidate(p)
          && this.raftTerm == p.data.raftTerm
          && this.raftVote == null
        ) {
          this.raftVote = p.src;

          this.userPackets.push({
            data: {
              raftSenderState: this.raftState,
              raftTerm: this.raftTerm,
              raftVote: this.raftVote,
            },
            link: this.routingTable[p.src].link, // choose link
            dest: p.src,
            src: this.kilo_uid,
          });
        }

        if(
          this.amFollower() && (this.isLeader(p) || this.isCandidate(p))
        ) {
          this.resetTimeout(this.routingTable[p.src].cost);
        }
      }

      if(!this.routingTable[p.dest]) // I don't know how to send it
        continue;

      // p.history.push(this.kilo_uid);
      this.userPackets.push({
        data: p.data,
        dest: p.dest, // copy dest
        src: p.src, // copy src
        link: this.routingTable[p.dest].link, // choose link
        // history: p.history // copy dest
      });
    }

    this.updateColors();
  }

  isLeader(p) { return p.data.raftSenderState == this.raftStates.Leader; }
  isFollower(p) { return p.data.raftSenderState == this.raftStates.Follower; }
  isCandidate(p) { return p.data.raftSenderState == this.raftStates.Candidate; }

  amLeader() { return this.raftState == this.raftStates.Leader; }
  amFollower() { return this.raftState == this.raftStates.Follower; }
  amCandidate() { return this.raftState == this.raftStates.Candidate; }

  sendKeepalives() {
    let ids = Object.keys(this.routingTable).filter(id => id != this.kilo_uid);
    for(let i = 0; i < ids.length; i++) {
      let packetDestID = ids[i];
      this.userPackets.push({
        data: {
          raftSenderState: this.raftState,
          raftTerm: this.raftTerm,
        },
        link: this.routingTable[packetDestID].link, // choose link
        dest: packetDestID, // copy dest
        src: this.kilo_uid,
      });
    }
  }

  becomeFreshLeader() {
    console.log(this.kilo_uid, "becoming leader", this.raftTerm);
    this.raftState = this.raftStates.Leader;
    this.raftLeaderTick = 0;
    // this.raftLeaderID = null;
  }

  becomeFreshCandidate() {
    this.raftState = this.raftStates.Candidate;
    this.raftTerm++;
    this.raftVotes = {};
    this.raftVotes[this.kilo_uid] = true; // vote for myself
    // this.raftLeaderID = null;

    let maxHops = Math.max.apply(null, Object.keys(this.routingTable).map(id => this.routingTable[id].cost));
    this.resetTimeout(2 * maxHops);

    console.log(this.kilo_uid, "becoming candidate", this.raftTerm);

    {
      let ids = Object.keys(this.routingTable).filter(id => id != this.kilo_uid);
      for(let i = 0; i < ids.length; i++) {
        let packetDestID = ids[i];
        this.userPackets.push({
          data: {
            raftSenderState: this.raftState,
            raftTerm: this.raftTerm,
          },
          link: this.routingTable[packetDestID].link, // choose link
          dest: packetDestID, // copy dest
          src: this.kilo_uid,
        });
      }
    }
  }

  becomeFreshFollower(term) {
    console.log(this.kilo_uid, "becoming follower");
    this.raftTerm = term; 
    this.raftVote = null;
    this.raftState = this.raftStates.Follower; 
    // this.raftLeaderID = leaderID;

    let maxHops = Math.max.apply(null, Object.keys(this.routingTable).map(id => this.routingTable[id].cost));
    this.resetTimeout(maxHops);
  }

  message_tx() {
    if(this.defunct) return null;

    let msg = {
      id: this.kilo_uid,
      vector: Object.keys(this.routingTable).map(id => {return {id: id, cost: this.routingTable[id].cost}}),
      userPackets: this.userPackets,
    };

    this.userPackets = [];
    return msg;
  }

  resetTimeout(hops) {
    this.raftElectionTimeoutAt = this.kilo_ticks + 5*hops + 60 + 2*this.rand_soft();
  }

  updateColors() {
    if(/*this.isSender ||*/ this.isEndpoint) {
      if(this.amLeader()) {
        this.setColor(this.COLORS[this.kilo_uid % this.COLORS.length]);
      } else if(this.amCandidate()) {
        this.setColor(this.COLORS_CANDIDATE[this.kilo_uid % this.COLORS_CANDIDATE.length]);
      } else {
        if(this.raftVote != null) {
          this.setColor(this.COLORS_FOLLOWER[this.raftVote % this.COLORS_FOLLOWER.length]);
        } else {
          this.setColor(this.COLORS_FOLLOWER[this.kilo_uid % this.COLORS_FOLLOWER.length]);
        }
      }
    } else if(this.userPackets.length > 0) {
      // let idx = Math.floor(this.userPackets.length * this.rand_soft()/256);
      // this.setColor(this.COLORS[this.userPackets[idx].dest % this.COLORS.length]);
      this.setColor(this.RGB(2, 2, 2));
    } else if(Object.keys(this.routingTable).length > 0) {
      this.set_color(this.RGB(1, 1, 1));
    } else {
      this.set_color(this.RGB(0, 0, 0));
    }
  }
}

window['ExperimentRaft'] = class {
  constructor() {
    this.runnerOptions = {
      limitSpeed: !true,
      traversedPath: true,
      // traversedPathLen: 100,
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
    let endpointCount = 17;

    for(let i = 0; i < endpointCount; i++) {
      let idx = Math.floor(this.MathRandom() * functioningRobots.length);
      functioningRobots[idx].isEndpoint = true;
      // functioningRobots[idx].isSender = true; // i == 0 || i == 20-1;
      // functioningRobots[idx].sendData = i;
    }

    robotSpecs.forEach(s => {
      if(s.defunct) return;

      newRobotFunc({
        x: s.pos.x + (AbilityFuncs.gradientNoise(this.MathRandom)-0.5)*RADIUS*0.5,
        y: s.pos.y + (AbilityFuncs.gradientNoise(this.MathRandom)-0.5)*RADIUS*0.5,
      },
        this.MathRandom() * 2*Math.PI,
        new Robot(s.defunct, s.isEndpoint, /*s.isSender,*/ s.sendData, this.INITIAL_DIST, endpointCount),
        // new RobotGradientFormation(s.isEndpoint, this.INITIAL_DIST), // s.defunct, s.isEndpoint),
      );
    });
  }
}
}
