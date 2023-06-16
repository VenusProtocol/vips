import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const NEW_VTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
const OLD_VTUSD = "0x08CEB3F4a7ed3500cA0982bcd0FC7816688084c3";
const VTUSD_RESETTER = "0xF766FC1f685a396ed6b99550A803ef39eC5B4135"; // A contract that updates the symbol and name
const VTOKEN_IMPLEMENTATION = "0x13f816511384D3534783241ddb5751c4b7a7e148"; // Original implementation
const NEW_TUSD = "0x40af3827F39D0EAcBF4A168f8D4ee67c121D11c9";
const INITIAL_FUNDING = parseUnits("10000", 18);
const INITIAL_VTOKENS = parseUnits("10000", 8);
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const MAX_STALE_PERIOD = 60 * 60 * 24; // 24 hours
const ORACLE_FEED = "0xa3334A9762090E827413A7495AfeCE76F41dFc06";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const VTOKEN_RECEIVER = "0xBCb742AAdb031dE5de937108799e89A392f07df";

export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKETS: 7,
};

export const vip128 = () => {
  const meta = {
    version: "v2",
    title: "VIP-128 TUSD Contract Migration",
    description: `
    VIP
      Pause the following actions in the OLD TUSD market: mint, borrow, enter markets
      Update symbol and name of the OLD TUSD market, using the previously deployed contract
      Set Reserve Factor to 100% in the OLD TUSD market
      Set Collateral Factor to 55% in the OLD TUSD market
      Add the market for (new) TUSD to the Comptroller
      Comptroller._supportMarket
      Configure the rest of parameters in the (new) TUSD market:
      Comptroller._setMarketSupplyCaps
      Comptroller._setMarketBorrowCaps
      Comptroller._setVenusSpeeds
      Mint an initial amount of VTUSD tokens in the new market
      Accept the admin of the VTUSD market
      Configure the price feed in the ResilientOracle for the new VToken contract (previously deployed), using the same configuration that we have for TUSD:
      Type of oracle: Chainlink
      Feed: 0xa3334a9762090e827413a7495afece76f41dfc06
      Max stale period: 24 hours
    
    Parameters:
      New VTUSD market:
      Collateral Factor: 0%
      Reserve Factor: 10%
      Borrow Cap: 600,000 TUSD
      Supply Cap: 1,000,000 TUSD
      OLD VTUSD market:
      Collateral Factor: 55%
      Reserve factor: 100%
      New symbol: vTUSDOLD
      New name: Venus TUSDOLD
    `,
    forDescription: "I agree that Venus Protocol should proceed with the TUSD contract migration",
    againstDescription: "I do not think that Venus Protocol should proceed with the TUSD contract migration",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the TUSD contract migration or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[OLD_VTUSD], [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKETS], true],
      },
      {
        target: OLD_VTUSD,
        signature: "_setImplementation(address,bool,bytes)",
        params: [VTUSD_RESETTER, false, "0x"],
      },
      {
        target: OLD_VTUSD,
        signature: "_setImplementation(address,bool,bytes)",
        params: [VTOKEN_IMPLEMENTATION, false, "0x"],
      },
      {
        target: OLD_VTUSD,
        signature: "_setReserveFactor(uint256)",
        params: [parseUnits("1", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [OLD_VTUSD, parseUnits("0.55", 18)],
      },

      {
        target: COMPTROLLER,
        signature: "_supportMarket(address)",
        params: [NEW_VTUSD],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[NEW_VTUSD], [parseUnits("1000000", 18)]],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[NEW_VTUSD], [parseUnits("600000", 18)]],
      },

      {
        target: COMPTROLLER,
        signature: "_setVenusSpeeds(address[],uint256[],uint256[])",
        params: [
          [OLD_VTUSD, NEW_VTUSD],
          ["0", "217013888888889"],
          ["0", "217013888888889"],
        ],
      },

      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[NEW_TUSD, ORACLE_FEED, MAX_STALE_PERIOD]],
      },

      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            NEW_TUSD,
            [
              CHAINLINK_ORACLE,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [NEW_VTUSD, 0],
      },

      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [NEW_TUSD, INITIAL_FUNDING, NORMAL_TIMELOCK],
      },

      {
        target: NEW_TUSD,
        signature: "approve(address,uint256)",
        params: [NEW_VTUSD, 0],
      },

      {
        target: NEW_TUSD,
        signature: "approve(address,uint256)",
        params: [NEW_VTUSD, INITIAL_FUNDING],
      },

      {
        target: NEW_VTUSD,
        signature: "mint(uint256)",
        params: [INITIAL_FUNDING],
      },

      {
        target: NEW_VTUSD,
        signature: "transfer(address,uint256)",
        params: [VTOKEN_RECEIVER, INITIAL_VTOKENS],
      },

      {
        target: NEW_VTUSD,
        signature: "_acceptAdmin()",
        params: [],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
