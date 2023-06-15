import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const NEW_VTUSD = "0xEFAACF73CE2D38ED40991f29E72B12C74bd4cf23";
const OLD_VTUSD = "0x3A00d9B02781f47d033BAd62edc55fBF8D083Fb0";
const VTUSD_RESETTER = "0x37E42bDf1C52A0F515b4A1e80b44F67Bc25c8a75"; // A contract that updates the symbol and name
const VTOKEN_IMPLEMENTATION = "0xc01902DBf72C2cCBFebADb9B7a9e23577893D3A3"; // Original implementation
const NEW_TUSD = "0xB32171ecD878607FFc4F8FC0bCcE6852BB3149E0";
const INITIAL_FUNDING = parseUnits("10000", 18);
const INITIAL_VTOKENS = parseUnits("10000", 8);
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const TUSD_HOLDER = "0x6f057A858171e187124ddEDF034dAc63De5dE5dB";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";

export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKETS: 7,
};

export const vip128Testnet = () => {
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
          ["0", "868055555555556"],
          ["0", "868055555555556"],
        ],
      },

      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [NEW_TUSD, "1000000000000000000"],
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
        target: NEW_TUSD,
        signature: "transferFrom(address,address,uint256)",
        params: [TUSD_HOLDER, NORMAL_TIMELOCK, INITIAL_FUNDING],
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
        params: [TUSD_HOLDER, INITIAL_VTOKENS],
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
