const abs = Math.abs;
const min = Math.min;
const ceil = Math.ceil;

const EPSILON = 0.0000001;

function PfromC(c: number): number {
   let ppon = 0;
   let ppbn = 0;
   let sum = 0;

   const fails = ceil(1 / c);

   for (let n = 1; n <= fails; n++) {
      ppon = min(1, n * c) * (1 - ppbn);
      ppbn += ppon;

      sum += n * ppon;
   }

   return 1 / sum;
}

function CfromP(p: number): number {
   let hi = p;
   let lo = 0;
   let mid = 0;
   let p1 = 0;
   let p2 = 1;

   while (true) {
      mid = (hi + lo) * 0.5;
      p1 = PfromC(mid);
      if (abs(p1 - p2) <= EPSILON) break;

      if (p1 > p) {
         hi = mid;
      } else {
         lo = mid;
      }

      p2 = p1;
   }

   return mid;
}

export interface IPrandState {
   cValue: number;
   progress: number;
}

export function createPrandState(chance: number): IPrandState {
   return {
      cValue: CfromP(chance),
      progress: 1,
   };
}

export function rollPrand(state: IPrandState, random = Math.random): boolean {
   const r = random();
   if (r < state.progress * state.cValue) {
      state.progress = 1;
      return true;
   }
   state.progress++;
   return false;
}

export function resetPrand(state: IPrandState): void {
   state.progress = 0;
}

export class Prand {
   state: IPrandState;
   random: () => number;

   static create(chance: number, random = Math.random): Prand {
      return new Prand(createPrandState(chance), random);
   }

   constructor(state: IPrandState, random = Math.random) {
      this.state = state;
      this.random = random;
   }

   roll(): boolean {
      return rollPrand(this.state, this.random);
   }

   reset(): void {
      resetPrand(this.state);
   }
}
