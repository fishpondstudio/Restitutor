import { filterInPlace } from "@project/shared/src/utils/Helper";
import type { Province } from "../definitions/Province";
import type { ILoan } from "../definitions/ProvinceState";
import type { SaveGame } from "../GameState";
import { EmptyGameAction } from "./EmptyGameAction";
import type { IGameAction } from "./GameAction";

export function RepayLoanAction(loan: ILoan, province: Province, save: SaveGame): IGameAction {
   const state = save.state.provinces[province];
   if (!state) {
      return EmptyGameAction;
   }
   if (!state.loans.includes(loan)) {
      return EmptyGameAction;
   }
   return {
      cost: { gold: loan.principal + loan.interest },
      execute: () => {
         filterInPlace(state.loans, (l) => l !== loan);
      },
   };
}
