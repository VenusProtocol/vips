import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const WBETH = "0xa2e3356610840701bdf5611a53974510ae27e2e1";
const VWBETH = "0x6CFdEc747f37DAf3b87a35a1D9c8AD3063A1A8A0";
const INITIAL_FUNDING = parseUnits("5.499943", 18);
const INITIAL_VTOKENS = parseUnits("5.499943", 8);
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const VTOKEN_RECEIVER = "0x7d3217feb6f310f7e7b7c8ee130db59dcad1dd45";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const BINANCE_ORACLE_NEW = "0xe38AbE42948ef249E84f4e935e4f56483C1EE3B9";
const BINANCE_PROXY_ADMIN = "0x1BB765b741A5f3C2A338369DAb539385534E3343";
const MAX_STALE_PERIOD = 60 * 25;

export const vip129 = (maxStalePeriod?: number) => {
  const meta = {
    version: "v2",
    title: "VIP-129 Add WBETH Market",
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
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [WBETH, INITIAL_FUNDING, NORMAL_TIMELOCK],
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
        params: [VTOKEN_RECEIVER, INITIAL_VTOKENS],
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
