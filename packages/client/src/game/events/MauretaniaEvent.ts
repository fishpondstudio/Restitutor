import { $t, L } from "../../utils/i18n";
import { Province } from "../definitions/Province";
import { StraitOfGibraltarTiles } from "../definitions/TileConstants";
import { getTileName } from "../definitions/TileName";
import { RefreshTiles } from "../Events";
import { minCoreTileCondition, provinceResourceCondition } from "../logic/MissionLogic";
import { allCoreTileCondition, isCoreTileCondition } from "../logic/TileLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const MauretaniaEvent = {
   Mauretania1: {
      name: () => $t(L.TheBavaresCrossTheFrontier),
      wikipedia: "Bavares",
      image: EventImage.Watchtower,
      desc: () => $t(L.TheBavaresCrossTheFrontierDesc),
      condition: {
         province: ["Mauretania"],
         year: [253, 253],
      },
      buttons: [
         {
            label: () => $t(L.FortifyTheRoadThroughAuzia),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.RecruitAuxiliariesFromTheTribes),
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SendAPunitiveColumnInland),
            resources: { military: 100 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Mauretania2: {
      name: () => $t(L.MaximiansAtlasCampaign),
      wikipedia: "Maximian",
      image: EventImage.ImperialCity,
      desc: () => $t(L.MaximiansAtlasCampaignDesc),
      condition: {
         province: ["Mauretania"],
         year: [297, 297],
      },
      buttons: [
         {
            label: () => $t(L.GuideTheArmyIntoTheMountains),
            resources: { military: 75 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.NegotiateHostagesAndSafeRoads),
            resources: { diplomatic: 75 },
            modifiers: {
               Stability: { type: "add", value: 5, duration: 3 * 12 },
               Defense: { type: "multiply", value: 0.05, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.ShelterTheMountainCommunities),
            resources: { gold: -300 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Mauretania3: {
      name: () => $t(L.TheCouncilInTheHouseAtCirta),
      wikipedia: "First_Council_of_Cirta",
      image: EventImage.Donatism,
      desc: () => $t(L.TheCouncilInTheHouseAtCirtaDesc),
      condition: {
         province: ["Mauretania"],
         year: [305, 305],
      },
      buttons: [
         {
            label: () => $t(L.PublishTheCouncilsActs),
            resources: { administrative: 75 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PardonThoseWhoSurrenderedBooks),
            resources: { christianity: -5 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.BarTheCompromisedClergy),
            resources: { christianity: 15 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Mauretania4: {
      name: () => $t(L.TheMacarianMission),
      wikipedia: "Circumcellions",
      image: EventImage.Donatism,
      desc: () => $t(L.TheMacarianMissionDesc),
      condition: {
         province: ["Mauretania"],
         year: [347, 347],
      },
      buttons: [
         {
            label: () => $t(L.EscortTheImperialCommissioners),
            resources: { christianity: 15 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.KeepSoldiersOutOfTheChurches),
            resources: { christianity: -5 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.TurnTheAlmsIntoGrainRelief),
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Mauretania5: {
      name: () => $t(L.TheDonatistsReturnFromExile),
      wikipedia: "Donatism",
      image: EventImage.SaintConsecration,
      desc: () => $t(L.TheDonatistsReturnFromExileDesc),
      condition: {
         province: ["Mauretania"],
         year: [362, 362],
      },
      buttons: [
         {
            label: () => $t(L.RestoreTheReturningCongregations),
            resources: { christianity: 15 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.DivideTheDisputedProperties),
            resources: { diplomatic: -50, christianity: -5 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.UpholdTheCurrentOccupants),
            resources: { administrative: 75 },
            modifiers: {
               ChristianityYearly: { type: "add", value: -1, duration: 2 * 12 },
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
      ],
   },
   Mauretania6: {
      name: () => $t(L.FirmusRaisesTheKabylianHouses),
      wikipedia: "Firmus_(4th-century_rebel)",
      image: EventImage.HoratiiOath,
      desc: () => $t(L.FirmusRaisesTheKabylianHousesDesc),
      condition: {
         province: ["Mauretania"],
         year: [372, 372],
      },
      buttons: [
         {
            label: () => $t(L.RecognizeFirmusAsOurCommander),
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               WarPower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.HoldTheCitiesForRome),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ArbitrateAmongTheRivalHouses),
            resources: { diplomatic: 75 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               WarPower: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Mauretania7: {
      name: () => $t(L.TheDefectionFromGildo),
      wikipedia: "Gildonic_War",
      image: EventImage.BattleOfIssus,
      desc: () => $t(L.TheDefectionFromGildoDesc),
      condition: {
         province: ["Mauretania"],
         year: [398, 398],
      },
      buttons: [
         {
            label: () => $t(L.WelcomeTheDefectingContingents),
            modifiers: {
               Manpower: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.ConfiscateGildosEstates),
            resources: { gold: 750 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PetitionForAGeneralAmnesty),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
            },
         },
      ],
   },
   Mauretania8: {
      name: () => $t(L.TheSiegeOfHippoRegius),
      wikipedia: "Siege_of_Hippo_Regius",
      image: EventImage.BarbariansAtRome,
      desc: () => $t(L.TheSiegeOfHippoRegiusDesc),
      condition: {
         province: ["Mauretania"],
         year: [430, 430],
      },
      buttons: [
         {
            label: () => $t(L.ReinforceTheWallsOfHippo),
            resources: { gold: -500 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Manpower: { type: "multiply", value: 0.1, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.EvacuateCiviliansBySea),
            resources: { gold: -300 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               LandTax: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.SeekSafePassageFromGaiseric),
            resources: { diplomatic: 75 },
            modifiers: {
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Mauretania9: {
      name: () => $t(L.TheFoedusOfHippo),
      wikipedia: "Vandal_conquest_of_Roman_Africa",
      image: EventImage.ScipiosClemency2,
      desc: () => $t(L.TheFoedusOfHippoDesc),
      condition: {
         province: ["Mauretania"],
         year: [435, 435],
      },
      buttons: [
         {
            label: () => $t(L.RegisterTheFederateSettlements),
            modifiers: {
               LandTax: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PreserveTheMunicipalCharters),
            resources: { administrative: 75 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.MoveTheImperialFrontierEast),
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TradeProfit: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Mauretania10: {
      name: () => $t(L.TheProvincesBeyondTheSettlement),
      wikipedia: "Vandal_Kingdom",
      image: EventImage.ScipiosClemency1,
      desc: () => $t(L.TheProvincesBeyondTheSettlementDesc),
      condition: {
         province: ["Mauretania"],
         year: [442, 442],
      },
      buttons: [
         {
            label: () => $t(L.RestoreTheImperialTaxRolls),
            resources: { administrative: 100 },
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 3 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.EmpowerTheCityCouncils),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
               LandTax: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.BargainWithTheFrontierChiefs),
            resources: { diplomatic: 75 },
            modifiers: {
               Defense: { type: "multiply", value: 0.15, duration: 3 * 12 },
               Prestige: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Mauretania11: {
      name: () => $t(L.TheTwoShoresOfThePillars),
      image: EventImage.Gibraltar,
      desc: () => $t(L.TheTwoShoresOfThePillarsDesc),
      condition: {
         province: ["Mauretania"],
         annexAndCore: { Baetica: 2 },
         conditions: (province, save) => [allCoreTileCondition(StraitOfGibraltarTiles, province, save)],
      },
      buttons: [
         {
            label: () => $t(L.GovernTheShoresAsOneDistrict),
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 2 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.OpenTheStraitToMerchants),
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.MakeThePillarsOurWarGate),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Mauretania12: {
      name: () => $t(L.BaeticaUnderMauretanianRule),
      image: EventImage.HeroTriumph,
      desc: () => $t(L.BaeticaUnderMauretanianRuleDesc),
      condition: {
         province: ["Mauretania"],
         annexAndCore: { Baetica: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => $t(L.MakeBaeticaFundTheAdvance),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            casusBelli: {
               Lusitania: { casusBelli: "ConquestMission", duration: 5 * 12 },
               Tarraconensis: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.PlanTheConquestOfHispania),
            modifiers: {
               AdministrativePoint: { type: "add", value: 1, duration: 2 * 12 },
               DiplomaticPoint: { type: "add", value: 1, duration: 2 * 12 },
               MilitaryPoint: { type: "add", value: 1, duration: 2 * 12 },
            },
            casusBelli: {
               Lusitania: { casusBelli: "ConquestMission", duration: 5 * 12 },
               Tarraconensis: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Mauretania13: {
      name: () => $t(L.ThePriceOfPalma),
      image: EventImage.MediterraneanIsland,
      desc: () => $t(L.ThePriceOfPalmaDesc),
      condition: {
         province: ["Mauretania"],
         conditions: (province, save) => [
            provinceResourceCondition("gold", 10_000, province, save),
            isCoreTileCondition(8978513, "Tarraconensis", save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.PurchasePalmaAndItsHarbor),
            resources: { gold: -10_000 },
            custom: [
               {
                  desc: () => $t(L.$1Becomes$2sCoreTile, getTileName(8978513), Province.Mauretania.name()),
                  effect: (province, save) => {
                     const Palma = save.state.tiles.get(8978513);
                     if (Palma) {
                        Palma.province = province;
                        Palma.coreProvinces.add(province);
                     }
                     RefreshTiles.emit({ tiles: [8978513], options: { visual: true, indicator: true } });
                  },
               },
            ],
         },
         {
            label: () => $t(L.SubsidizeTarraconensianRule),
            resources: { gold: -1000 },
            attitudes: {
               Tarraconensis: { type: "add", value: 50, duration: 2 * 12 },
            },
         },
      ],
   },
   Mauretania14: {
      name: () => $t(L.TheRoadEastThroughAfrica),
      image: EventImage.CarthageCaptured,
      desc: () => $t(L.TheRoadEastThroughAfricaDesc),
      condition: {
         province: ["Mauretania"],
         annexAndCore: { Africa: 5 },
      },
      buttons: [
         {
            label: () => $t(L.DriveEastWithTheFrontierArmy),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
            casusBelli: {
               Africa: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.ClaimTheMantleOfAfrica),
            modifiers: {
               Prestige: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
            casusBelli: {
               Africa: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.PrepareEveryArmOfGovernment),
            resources: {
               administrative: 50,
               diplomatic: 50,
               military: 50,
            },
            casusBelli: {
               Africa: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Mauretania15: {
      name: () => $t(L.FromOceanToTheCentralSea),
      image: EventImage.MediterraneanHarbour,
      desc: () => $t(L.FromOceanToTheCentralSeaDesc),
      condition: {
         province: ["Mauretania"],
         annexAndCore: { Africa: Number.POSITIVE_INFINITY },
      },
      buttons: [
         {
            label: () => $t(L.ExtendOurLawsAcrossTheSea),
            modifiers: {
               AdministrativePoint: { type: "add", value: 1 },
            },
            casusBelli: {
               Sardinia: { casusBelli: "ConquestMission", duration: 5 * 12 },
               Sicilia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.BindTheIslandsToOurPorts),
            modifiers: {
               DiplomaticPoint: { type: "add", value: 1 },
            },
            casusBelli: {
               Sardinia: { casusBelli: "ConquestMission", duration: 5 * 12 },
               Sicilia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.EntrustTheAdvanceToTheFleet),
            modifiers: {
               MilitaryPoint: { type: "add", value: 1 },
            },
            casusBelli: {
               Sardinia: { casusBelli: "ConquestMission", duration: 5 * 12 },
               Sicilia: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
   Mauretania16: {
      name: () => $t(L.MauretaniaAscendant),
      image: EventImage.CivicTriumph,
      desc: () => $t(L.MauretaniaAscendantDesc),
      condition: {
         province: ["Mauretania"],
         conditions: (province, save) => [minCoreTileCondition(40, province, save)],
      },
      buttons: [
         {
            label: () => $t(L.SeizeAfricaByForceOfArms),
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
            casusBelli: {
               Africa: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.ProclaimOurRightToAfrica),
            modifiers: {
               Prestige: { type: "multiply", value: 0.2, duration: 2 * 12 },
            },
            casusBelli: {
               Africa: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
         {
            label: () => $t(L.MarshalTheRealmForInvasion),
            resources: {
               administrative: 50,
               diplomatic: 50,
               military: 50,
            },
            casusBelli: {
               Africa: { casusBelli: "ConquestMission", duration: 5 * 12 },
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
