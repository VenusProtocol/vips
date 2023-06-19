import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const WBETH = "0xf9F98365566F4D55234f24b99caA1AfBE6428D44";
const VWBETH = "0x35566ED3AF9E537Be487C98b1811cDf95ad0C32b";
const INITIAL_FUNDING = parseUnits("5.499943", 18);
const INITIAL_VTOKENS = parseUnits("5.499943", 8);
const BINANCE_ORACLE = "0xB58BFDCE610042311Dc0e034a80Cc7776c1D68f5";
const BINANCE_ORACLE_NEW = "0x693A5ae5F9b8da5b8125f9BC0d8f04C7c63d2384";
const BINANCE_PROXY_ADMIN = "0xef480a5654b231ff7d80A0681F938f3Db71a6Ca6";
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const WBETH_HOLDER = "0x6f057A858171e187124ddEDF034dAc63De5dE5dB";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const MAX_STALE_PERIOD = 60 * 25;

export const vip128Testnet = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-128 Add WBETH Market",
    description: `
    VIP
    Risk parameters suggested by Quants:
    Supply cap: 300 (full tokens)
    Borrow cap: 200 (full tokens)
    Collateral factor: 50%
    Reserve factor: 20%
    Interest rate: Base0bps_Slope1000bps_Jump20000bps_Kink7500bps
    Initial supply:
    amount: 5499943000000000000 (already available in the VTreasury)
    vToken receiver: 0x7d3217feb6f310f7e7b7c8ee130db59dcad1dd45
  XVS rewards:
    borrowers: 596440972222220
    suppliers: 596440972222220
    `,
    forDescription: "I agree that Venus Protocol should proceed with the Add WBETH Market",
    againstDescription: "I do not think that Venus Protocol should proceed with the Add WBETH Market",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Add WBETH Market or not",
  };

  return makeProposal(
    [
      {
        target: BINANCE_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BINANCE_ORACLE, BINANCE_ORACLE_NEW],
      },

      {
        target: COMPTROLLER,
        signature: "_supportMarket(address)",
        params: [VWBETH],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VWBETH], [parseUnits("300", 18)]],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VWBETH], [parseUnits("200", 18)]],
      },

      {
        target: COMPTROLLER,
        signature: "_setVenusSpeeds(address[],uint256[],uint256[])",
        params: [[VWBETH], ["596440972222220"], ["596440972222220"]],
      },

      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["WBETH", maxStalePeriod || MAX_STALE_PERIOD],
      },

      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            WBETH,
            [
              BINANCE_ORACLE,
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
        params: [VWBETH, parseUnits("0.5", 18)],
      },

      {
        target: WBETH,
        signature: "transferFrom(address,address,uint256)",
        params: [WBETH_HOLDER, NORMAL_TIMELOCK, INITIAL_FUNDING],
      },

      {
        target: WBETH,
        signature: "approve(address,uint256)",
        params: [VWBETH, 0],
      },

      {
        target: WBETH,
        signature: "approve(address,uint256)",
        params: [VWBETH, INITIAL_FUNDING],
      },

      {
        target: VWBETH,
        signature: "mint(uint256)",
        params: [INITIAL_FUNDING],
      },

      {
        target: VWBETH,
        signature: "transfer(address,uint256)",
        params: [WBETH_HOLDER, INITIAL_VTOKENS],
      },

      {
        target: VWBETH,
        signature: "_acceptAdmin()",
        params: [],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
