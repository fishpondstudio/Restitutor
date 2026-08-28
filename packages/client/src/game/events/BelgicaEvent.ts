import { $t, L } from "../../utils/i18n";
import { Province } from "../definitions/Province";
import { minCoreTileCondition, victoryCountCondition, warPowerCondition } from "../logic/MissionLogic";
import { getProvinceResource } from "../logic/ProvinceLogic";
import { EventImage } from "./EventImages";
import type { IGameEventConfig } from "./GameEvents";

export const BelgicaEvent = {
   Belgica1: {
      name: () => $t(L.AugustaTreverorumCityOfEmperors),
      wikipedia: "Trier",
      image: EventImage.AncientRome,
      desc: () => $t(L.AugustaTreverorumCityOfEmperorsDesc),
      condition: {
         province: ["Belgica"],
         year: [300, 300],
      },
      buttons: [
         {
            label: () => $t(L.AdornTheImperialCapital),
            resources: { gold: -1000 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.2, duration: 3 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.BaskInImperialFavor),
            modifiers: {
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Belgica2: {
      name: () => $t(L.TheWeavingHousesOfTrier),
      image: EventImage.Weavers,
      desc: () => $t(L.TheWeavingHousesOfTrierDesc),
      condition: {
         province: ["Belgica"],
         year: [265, 265],
      },
      buttons: [
         {
            label: () => $t(L.ExpandTheImperialWorkshops),
            resources: { gold: -500 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            trades: {
               Lugdunensis: { offer: { theyOffer: "gold", weOffer: "garments" }, extraProfit: 0.5 },
            },
         },
         {
            label: () => $t(L.TaxTheClothTrade),
            resources: { gold: 500 },
            modifiers: {
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Belgica3: {
      name: () => $t(L.ThePurpleIsRaisedAtTrier),
      image: EventImage.HeroTriumph,
      desc: () => $t(L.ThePurpleIsRaisedAtTrierDesc),
      condition: {
         province: ["Belgica"],
         year: [350, 350],
      },
      buttons: [
         {
            label: () => $t(L.BackTheUsurpersBid),
            resources: { gold: 500 },
            modifiers: {
               WarPower: { type: "multiply", value: 0.2, duration: 3 * 12 },
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.StayLoyalToTheLawfulEmperor),
            resources: { diplomatic: -50, consulPoint: 1 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
      ],
   },
   Belgica4: {
      name: () => $t(L.TheOldGodsOfTheTreveri),
      image: EventImage.DruidRitual,
      desc: () => $t(L.TheOldGodsOfTheTreveriDesc),
      condition: {
         province: ["Belgica"],
         year: [320, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1ChristianInfluenceIsAtLeast$2, Province.Belgica.name(), "20"),
               value: getProvinceResource("christianity", province, save) >= 20,
            },
         ],
      },
      buttons: [
         {
            label: () => $t(L.CastDownTheOldShrines),
            resources: { christianity: 15 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.TolerateTheAncientRites),
            resources: { christianity: -10 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.LetTheOldAndNewFaithMingle),
            resources: { administrative: -50 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Belgica5: {
      name: () => $t(L.AthanasiusInExileAtTrier),
      wikipedia: "Athanasius_of_Alexandria",
      image: EventImage.JeromeStudy,
      desc: () => $t(L.AthanasiusInExileAtTrierDesc),
      condition: {
         province: ["Belgica"],
         year: [335, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1ChristianInfluenceIsAtLeast$2, Province.Belgica.name(), "20"),
               value: getProvinceResource("christianity", province, save) >= 20,
            },
         ],
      },
      buttons: [
         {
            label: () => $t(L.ShelterTheExiledBishop),
            resources: { christianity: 10 },
            modifiers: {
               ChristianityYearly: { type: "add", value: 1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.KeepHimAtArmsLength),
            resources: { diplomatic: -50 },
            modifiers: {
               Stability: { type: "add", value: 5, duration: 2 * 12 },
            },
         },
      ],
   },
   Belgica6: {
      name: () => $t(L.ValentinianFortifiesTheRhine),
      wikipedia: "Valentinian_I",
      image: EventImage.Watchtower,
      desc: () => $t(L.ValentinianFortifiesTheRhineDesc),
      condition: {
         province: ["Belgica"],
         year: [367, 367],
      },
      buttons: [
         {
            label: () => $t(L.BuildTheFrontierForts),
            resources: { gold: -1000 },
            modifiers: {
               Defense: { type: "multiply", value: 0.2, duration: 3 * 12 },
            },
         },
         {
            label: () => $t(L.RelyOnTheFieldArmyInstead),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Defense: { type: "multiply", value: -0.05, duration: 2 * 12 },
            },
         },
      ],
   },
   Belgica7: {
      name: () => $t(L.TheGlassworksOfTheRhineland),
      image: EventImage.GiltCup,
      desc: () => $t(L.TheGlassworksOfTheRhinelandDesc),
      condition: {
         province: ["Belgica"],
         year: [200, 200],
      },
      buttons: [
         {
            label: () => $t(L.EndowTheGlassblowersWorkshops),
            resources: { gold: -500 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
               TradeProfit: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.TaxTheGlassTrade),
            resources: { gold: 500 },
            modifiers: {
               Stability: { type: "add", value: -5, duration: 2 * 12 },
            },
         },
      ],
   },
   Belgica8: {
      name: () => $t(L.TheMartyrdomOfNicasiusAtReims),
      wikipedia: "Nicasius_of_Rheims",
      image: EventImage.StephenStoning,
      desc: () => $t(L.TheMartyrdomOfNicasiusAtReimsDesc),
      condition: {
         province: ["Belgica"],
         year: [407, Number.POSITIVE_INFINITY],
         conditions: (province, save) => [
            {
               name: $t(L.$1ChristianInfluenceIsAtLeast$2, Province.Belgica.name(), "20"),
               value: getProvinceResource("christianity", province, save) >= 20,
            },
         ],
      },
      buttons: [
         {
            label: () => $t(L.VenerateTheMartyredBishop),
            resources: { christianity: 15 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.RebuildTheRavagedCity),
            resources: { gold: -500 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Belgica9: {
      name: () => $t(L.TheCourtDepartsTrier),
      wikipedia: "Praetorian_prefecture_of_Gaul",
      image: EventImage.RuinedColonnade,
      desc: () => $t(L.TheCourtDepartsTrierDesc),
      condition: {
         province: ["Belgica"],
         year: [420, 420],
      },
      buttons: [
         {
            label: () => $t(L.PetitionToKeepTheCourt),
            resources: { diplomatic: -50, consulPoint: 1 },
            modifiers: {
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.InvestInTheCitysOwnTrades),
            resources: { gold: -500 },
            modifiers: {
               TileOutput: { type: "multiply", value: 0.1, duration: 2 * 12 },
               LandTax: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.AcceptTheCitysDiminishedLot),
            resources: { administrative: 50 },
            modifiers: {
               Stability: { type: "add", value: -10, duration: 2 * 12 },
            },
         },
      ],
   },
   Belgica10: {
      name: () => $t(L.TheGranariesOfTheRhineArmy),
      image: EventImage.FieldHarvest,
      desc: () => $t(L.TheGranariesOfTheRhineArmyDesc),
      condition: {
         province: ["Belgica"],
         year: [230, 230],
      },
      buttons: [
         {
            label: () => $t(L.ShoulderTheBurdenOfTheAnnona),
            resources: { gold: -300 },
            modifiers: {
               Manpower: { type: "multiply", value: 0.1, duration: 2 * 12 },
               Prestige: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
         },
         {
            label: () => $t(L.PetitionForReliefFromTheLevy),
            resources: { gold: 300 },
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
               Prestige: { type: "multiply", value: -0.1, duration: 2 * 12 },
            },
         },
      ],
   },
   Belgica11: {
      name: () => $t(L.SouthwardIntoLugdunensis),
      image: EventImage.BattleOfIssus,
      desc: () => $t(L.SouthwardIntoLugdunensisDesc),
      condition: {
         province: ["Belgica"],
         year: [Number.NEGATIVE_INFINITY, 220],
         annexAndCore: { Lugdunensis: 2 },
      },
      buttons: [
         {
            label: () => $t(L.PressSouthAlongTheGreatRoads),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            casusBelli: {
               Lugdunensis: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
         },
         {
            label: () => $t(L.SecureOurSouthernMarches),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
            casusBelli: {
               Lugdunensis: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
         },
      ],
   },
   Belgica12: {
      name: () => $t(L.NorthwardIntoGermania),
      image: EventImage.PompeiiFalls,
      desc: () => $t(L.NorthwardIntoGermaniaDesc),
      condition: {
         province: ["Belgica"],
         annexAndCore: { Germania: 4 },
      },
      buttons: [
         {
            label: () => $t(L.CarryOurStandardsIntoGermania),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            casusBelli: {
               Germania: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
         },
         {
            label: () => $t(L.FortifyTheRhineFrontier),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
            casusBelli: {
               Germania: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
         },
      ],
   },
   Belgica13: {
      name: () => $t(L.AcrossTheSeaToBritannia),
      image: EventImage.NavalBattle,
      desc: () => $t(L.AcrossTheSeaToBritanniaDesc),
      condition: {
         province: ["Belgica"],
         annexAndCore: { Britannia: 4 },
      },
      buttons: [
         {
            label: () => $t(L.PrepareTheChannelCrossing),
            modifiers: {
               WarPower: { type: "multiply", value: 0.1, duration: 2 * 12 },
            },
            casusBelli: {
               Britannia: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
         },
         {
            label: () => $t(L.SecureTheGallicShore),
            modifiers: {
               Stability: { type: "add", value: 10, duration: 2 * 12 },
            },
            casusBelli: {
               Britannia: { casusBelli: "ConquestMission", duration: 10 * 12 },
            },
         },
      ],
   },
   Belgica14: {
      name: () => $t(L.BelgicaAscendant),
      image: EventImage.CivicTriumph,
      desc: () => $t(L.BelgicaAscendantDesc),
      condition: {
         province: ["Belgica"],
         conditions: (province, save) => [
            minCoreTileCondition(20, province, save),
            warPowerCondition(10_000, province, save),
            victoryCountCondition(10, province, save),
         ],
      },
      buttons: [
         {
            label: () => $t(L.RewardTheVeteransWhoWonOurRealm),
            resources: {
               generalSkillPoint: 5,
               military: 100,
            },
         },
         {
            label: () => $t(L.BindOurConquestsToUs),
            resources: {
               diplomatic: 100,
               administrative: 100,
            },
         },
      ],
   },
} as const satisfies Record<string, IGameEventConfig>;
