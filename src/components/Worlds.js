import World from './World';
import Butterfly from './Butterfly';
import { array } from '../util';
// import achievements from './achievements';
// achievements.add(['adventurer', 'backtracker']);

const MAXID = 2147483647;
// const STARTID = MAXID / 2;
const STARTID = MAXID * (Math.random());

export default function Worlds (initialId = STARTID) {
  const worldsExplored = {};
  const firstOffset = [ -0.025, 0.095 ];

  const ranks = [
    'first-time flyer',
    'little grasshopper',
    'speedy sailor ',
    'color scout',
    'pathfinder',
    'skipper',
    'globetrotter',
    'birdchaser',
    'wayfarer',
    'frequent flyer',
    'world explorer',
    'treetop surfer',
    'high flyer',
    'wind catcher'
  ];

  initialId = initialId % MAXID;

  let discovered = 0;

  const EXP = 1.53;

  // ranks.forEach((r, i) => {
  //   console.log(~~Math.pow(i, EXP), r);
  // });

  const api = {
    current: null,
    exit: null,
    _MIN_portals: [],
    _MIN_butterflies: [],
    depth: 0,
    enter (portal) {
      const currentWorld = this.current;
      const newWorld = portal.world;
      this.current = newWorld;
      this._MIN_portals = [];
      // newWorld.enter();

      if (portal.tail) {
        this._MIN_portals = portal.world.portals || [];
      } else {
        worldsExplored[newWorld.id] = true;

        const otherWorlds = array(newWorld._MIN_numChildren).map(i => {
          const newId = newWorld.id + 1 + i * newWorld._MIN_numChildren;
          const otherWorld = World(this, newId);
          otherWorld.depth = (newWorld.depth || 0) + 1;
          if (newWorld.first) otherWorld.offset = firstOffset;
          return otherWorld;
        });

        const tail = currentWorld ? {
          tail: true,
          explored: false,
          world: currentWorld,
          offset: newWorld.offset
        } : null;
        const portals = [];
        if (tail) portals.push(tail);
        otherWorlds.forEach(otherWorld => {
          portals.push({ tail: false, explored: false, world: otherWorld, offset: otherWorld.offset });
        });
        newWorld.portals = portals;
        this._MIN_portals = portals;
      }

      if (!portal.explored) discover();

      const explored = Object.keys(worldsExplored).length;
      this.explored = explored;
      this._MIN_butterflies = this._MIN_portals.map(p => Butterfly());
      this.depth = newWorld.depth;
      this._MIN_portals.forEach(portal => {
        portal._updated = false;
        if (portal.world.id in worldsExplored) portal.explored = true;
      });
    }
  };
  const world = World(api, 0.05, firstOffset);
  world.id = initialId;
  world._MIN_numChildren = 1;
  api.enter({ world, explored: false, tail: false, offset: [ 0, 0 ] });
  return api;

  function discover () {
    const idx = Math.min(~~Math.pow(discovered, 1 / EXP), ranks.length - 1);
    window.R.textContent = '— ' + ranks[idx];
    discovered++;
  }
}
