import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const FDUSD = "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409";
const FDUSD_CHAINLINK_FEED = "0x390180e80058a8499930f0c13963ad3e0d86bfc9";
const VFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
const CHAINLINK_ORACLE = "0x1B2103441A0A108daD8848D8F5d790e4D402921F";
const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
const BINANCE_ORACLE = "0x594810b741d136f1960141C0d8Fb4a91bE78A820";
const BOUND_VALIDATOR = "0x6E332fF0bB52475304494E4AE5063c1051c7d735";
const VENUS_TREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const ACCESS_CONTROL_MANAGER = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const USDT = "0x55d398326f99059fF775485246999027B3197955";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
const INITIAL_FUNDING = parseUnits("10000", 18);
const COMMUNITY_WALLET_FUNDING = parseUnits("10000", 18);
const INITIAL_VTOKENS = parseUnits("10000", 8);
const BORROW_CAP = parseUnits("4400000", 18);
const SUPPLY_CAP = parseUnits("5500000", 18);
const REWARDS_SUPPLY_SPEED = 173611111111111;
const REWARDS_BORROW_SPEED = 173611111111111;
const COLLATERAL_FACTOR = parseUnits("0.75", 18);
const RESERVES_BLOCK_DELTA = 28800;
const RESERVE_FACTOR = parseUnits("0.1", 18);
const DEVIATION_LOWER_BOUND = parseUnits("0.99", 18);
const DEVIATION_UPPER_BOUND = parseUnits("1.01", 18);

export const vip221 = () => {
  const meta = {
    version: "v2",
    title: "VIP-221 Add FDUSD Market",
    description: `
    VIP
    Risk parameters suggested by Chaos lab:
    Supply cap: 5,500,000 (full tokens)
    Borrow cap: 4,400,000 (full tokens)
    Collateral factor: 75%
    Reserve factor: 10%
    XVS rewards:
      borrowers: 173611111111111
      suppliers: 173611111111111
    `,
    forDescription: "I agree that Venus Protocol should proceed with the Add UNI Market",
    againstDescription: "I do not think that Venus Protocol should proceed with the Add UNI Market",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with the Add UNI Market or not",
  };

  return makeProposal(
    [     
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[FDUSD, FDUSD_CHAINLINK_FEED, 88200]], // 24.5 hours max stale period
      },
      // {
      //   target: BINANCE_ORACLE,
      //   signature: "setMaxStalePeriod(string,uint256)",
      //   params: [["FDUSD", "1500"]], // 25 minutes max stale period
      // },
      // {
      //   target: BOUND_VALIDATOR,
      //   signature: "setValidateConfig((address,uint256,uint256))",
      //   params: [[FDUSD, DEVIATION_UPPER_BOUND, DEVIATION_LOWER_BOUND]],
      // },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            FDUSD,
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
        signature: "_supportMarket(address)",
        params: [VFDUSD],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VFDUSD], [SUPPLY_CAP]],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VFDUSD], [BORROW_CAP]],
      },

      {
        target: COMPTROLLER,
        signature: "_setVenusSpeeds(address[],uint256[],uint256[])",
        params: [[VFDUSD], [REWARDS_SUPPLY_SPEED], [REWARDS_BORROW_SPEED]],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VFDUSD, COLLATERAL_FACTOR],
      },
      // // Checking if permissions are granted for that
      // {
      //   target: ACCESS_CONTROL_MANAGER,
      //   signature: "giveCallPermission(address,string,address)",
      //   params: [VFDUSD, "setReduceReservesBlockDelta(uint256)", NORMAL_TIMELOCK],
      // },

      // // Checking if permissions are granted for that
      // {
      //   target: ACCESS_CONTROL_MANAGER,
      //   signature: "giveCallPermission(address,string,address)",
      //   params: [VFDUSD, "_setReserveFactor(uint256)", NORMAL_TIMELOCK],
      // },
      {
        target: VFDUSD,
        signature: "setAccessControlManager(address)",
        params: [ACCESS_CONTROL_MANAGER],
      },
      {
        target: VFDUSD,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: VFDUSD,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [RESERVES_BLOCK_DELTA],
      },
      {
        target: VFDUSD,
        signature: "_setReserveFactor(uint256)",
        params: [RESERVE_FACTOR],
      },

      {
        target: VENUS_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [FDUSD, INITIAL_FUNDING, NORMAL_TIMELOCK],
      },

      {
        target: FDUSD,
        signature: "approve(address,uint256)",
        params: [VFDUSD, 0],
      },

      {
        target: FDUSD,
        signature: "approve(address,uint256)",
        params: [VFDUSD, INITIAL_FUNDING],
      },
      {
        target: VFDUSD,
        signature: "mint(uint256)",
        params: [INITIAL_FUNDING],
      },

      {
        target: VFDUSD,
        signature: "transfer(address,uint256)",
        params: [VENUS_TREASURY, INITIAL_VTOKENS],
      },

      {
        target: VENUS_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, COMMUNITY_WALLET_FUNDING, COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
