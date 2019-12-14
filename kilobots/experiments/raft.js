{
class Robot extends Kilobot {
  constructor(defunct, isEndpoint, linkDist, endpointCount) {
    super();
    this.abilityBellmanFordRouting = new AbilityBellmanFordRouting(this, defunct, isEndpoint, linkDist);
    this.endpointCount = endpointCount;
    // this.defunct = defunct;
    // this.isEndpoint = isEndpoint;
    // this.linkDist = linkDist;

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

    this.abilityBellmanFordRouting.setup();
    // this.routingTable = {};
    // this.userPackets = [];
    // this.offset = this.rand_soft();
    // if(this.isEndpoint) {
    //   // add self
    //   this.routingTable[this.kilo_uid] = {
    //     cost: 0,
    //     link: null,
    //   };
    // }
  }

  setColor(c) {
    this.lastColorUpdatedAt = this.kilo_ticks;
    this.set_color(c);
  }

  loop() {
    this.abilityBellmanFordRouting.loop();
    this.updateColors();

    if(!this.abilityBellmanFordRouting.isEndpoint) {
      return;
    }

    /*
    if(this.abilityBellmanFordRouting.defunct) {
      if(this.kilo_ticks % 50 == 0 && this.rand_soft() > 252) {
        // get back to work
        this.abilityBellmanFordRouting.defunct = false;
      }
    } else if (this.abilityBellmanFordRouting.isEndpoint) {
      if(this.kilo_ticks % (100 + this.rand_soft()) == 0 && this.rand_soft() > 250) {
        this.abilityBellmanFordRouting.defunct = true;
      }
    }
    */

    if(this.abilityBellmanFordRouting.defunct) {
      return;
    }

    switch(this.raftState) {
      case this.raftStates.Routing:
        if(Object.keys(this.abilityBellmanFordRouting.routingTable).length > this.endpointCount * 0.5) {
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
    this.abilityBellmanFordRouting.message_rx(message, distance);

    if(this.abilityBellmanFordRouting.defunct) return;

    if(distance > this.abilityBellmanFordRouting.linkDist)
      return;

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
          // TODO: should I become a follower of p.src???
          // this.raftLeaderID = p.src;
        }

        if(
          (this.amCandidate() || this.amFollower()) && this.isLeader(p)
          && p.data.raftTerm >= this.raftTerm
        ) {
          this.becomeFreshFollower(p.data.raftTerm);
          this.raftVote = p.src;
        }

        if(
          this.amCandidate() && this.isFollower(p)
          && p.data.raftVote == this.kilo_uid
        ) {
          this.raftVotes[p.src] = true;
          // console.log(this.kilo_uid, "votes", Object.keys(this.raftVotes).length);
        }

        // vote (only once in this term)
        if(
          this.amFollower() && this.isCandidate(p)
          && this.raftTerm == p.data.raftTerm
          && this.raftVote == null
        ) {
          this.raftVote = p.src;

          if(this.abilityBellmanFordRouting.routingTable[p.src]) {
            this.abilityBellmanFordRouting.userPackets.push({
              data: {
                raftSenderState: this.raftState,
                raftTerm: this.raftTerm,
                raftVote: this.raftVote,
              },
              link: this.abilityBellmanFordRouting.routingTable[p.src].link, // choose link
              dest: p.src,
              src: this.kilo_uid,
            });
          };
        }

        if(
          this.amFollower() && (this.isLeader(p) || this.isCandidate(p))
        ) {
          let hops = this.abilityBellmanFordRouting.routingTable[p.src] && this.abilityBellmanFordRouting.routingTable[p.src].cost;
          this.resetTimeout(hops || 10);
        }
      }
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
    let ids = Object.keys(this.abilityBellmanFordRouting.routingTable).filter(id => id != this.kilo_uid);
    for(let i = 0; i < ids.length; i++) {
      let packetDestID = ids[i];
      this.abilityBellmanFordRouting.userPackets.push({
        data: {
          raftSenderState: this.raftState,
          raftTerm: this.raftTerm,
        },
        link: this.abilityBellmanFordRouting.routingTable[packetDestID].link, // choose link
        dest: packetDestID, // copy dest
        src: this.kilo_uid,
      });
    }
  }

  becomeFreshLeader() {
    // console.log(this.kilo_uid, "becoming leader", this.raftTerm);
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

    let maxHops = Math.max.apply(null, Object.keys(this.abilityBellmanFordRouting.routingTable).map(id => this.abilityBellmanFordRouting.routingTable[id].cost));
    this.resetTimeout(2 * maxHops);

    // console.log(this.kilo_uid, "becoming candidate", this.raftTerm);

    {
      let ids = Object.keys(this.abilityBellmanFordRouting.routingTable).filter(id => id != this.kilo_uid);
      for(let i = 0; i < ids.length; i++) {
        let packetDestID = ids[i];
        this.abilityBellmanFordRouting.userPackets.push({
          data: {
            raftSenderState: this.raftState,
            raftTerm: this.raftTerm,
          },
          link: this.abilityBellmanFordRouting.routingTable[packetDestID].link, // choose link
          dest: packetDestID, // copy dest
          src: this.kilo_uid,
        });
      }
    }
  }

  becomeFreshFollower(term) {
    // console.log(this.kilo_uid, "becoming follower");
    this.raftTerm = term; 
    this.raftVote = null;
    this.raftState = this.raftStates.Follower; 
    // this.raftLeaderID = leaderID;

    let maxHops = Math.max.apply(null, Object.keys(this.abilityBellmanFordRouting.routingTable).map(id => this.abilityBellmanFordRouting.routingTable[id].cost));
    this.resetTimeout(maxHops);
  }

  message_tx() {
    return this.abilityBellmanFordRouting.message_tx();
  }

  resetTimeout(hops) {
    this.raftElectionTimeoutAt = this.kilo_ticks + 15*hops + 60 + this.rand_soft();
  }

  updateColors() {
    if(this.abilityBellmanFordRouting.defunct) {
      this.set_color(this.RGB(1, 1, 1));
    } else if(this.abilityBellmanFordRouting.isEndpoint) {
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
    } else if(this.abilityBellmanFordRouting.userPackets.length > 0) {
      let idx = Math.floor(this.abilityBellmanFordRouting.userPackets.length * this.rand_soft()/256);

      if(this.abilityBellmanFordRouting.userPackets[idx].data.raftVote) {
        let id = this.abilityBellmanFordRouting.userPackets[idx].data.raftVote;
        this.setColor(this.COLORS[id % this.COLORS_CANDIDATE.length]);
      } else {
        let id = this.abilityBellmanFordRouting.userPackets[idx].src;
        this.setColor(this.COLORS[id % this.COLORS.length]);
      }

      // this.setColor(this.RGB(2, 2, 2));
    } else if(Object.keys(this.abilityBellmanFordRouting.routingTable).length > 0) {
      this.set_color(this.RGB(0, 0, 0));
    } else {
      this.set_color(this.RGB(1, 1, 1));
    }
  }
}

window['ExperimentRaft'] = class {
  constructor() {
    this.runnerOptions = {
      limitSpeed: !true,
      traversedPath: true,
      // traversedPathLen: 100,
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
          tick: b.robot.kilo_ticks,
          routingTable: b.robot.abilityBellmanFordRouting.routingTable,
          robot: b.robot,
          events: b.robot.events,
        });
        ev.stopPropagation();
      });
    }
  }

  createRobots(newRobotFunc, newLightFunc, RADIUS, NEIGHBOUR_DISTANCE, TICKS_BETWEEN_MSGS) {
    this.MathRandom = new Math.seedrandom(1234);
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
    }

    robotSpecs.forEach(s => {
      if(s.defunct) return;

      newRobotFunc({
        x: s.pos.x + (AbilityFuncs.gradientNoise(this.MathRandom)-0.5)*RADIUS*0.5,
        y: s.pos.y + (AbilityFuncs.gradientNoise(this.MathRandom)-0.5)*RADIUS*0.5,
      },
        this.MathRandom() * 2*Math.PI,
        new Robot(s.defunct, s.isEndpoint, this.INITIAL_DIST*1.5, endpointCount),
      );
    });
  }
}
}
