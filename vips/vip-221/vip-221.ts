import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const FDUSD = "0xcF27439fA231af9931ee40c4f27Bb77B83826F3C";
const VFDUSD = "0x885071905c270Eaf6626f14fc939161D2825784f";
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const VENUS_TREASURY = "0x8b293600C50D6fbdc6Ed4251cc75ECe29880276f";
const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
const ACCESS_CONTROL_MANAGER = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";
const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
const INITIAL_FUNDING = parseUnits("10000", 18);
const COMMUNITY_WALLET_FUNDING = parseUnits("10000", 18);
const INITIAL_VTOKENS = parseUnits("10000", 8);
const BORROW_CAP = parseUnits("4400000", 18);
const SUPPLY_CAP = parseUnits("5500000", 18);
const REWARDS_SUPPLY_SPEED = 173611111111111;
const REWARDS_BORROW_SPEED = 173611111111111;
const COLLATERAL_FACTOR = parseUnits("0.75", 18);
const RESERVES_BLOCK_DELTA = 100;
const RESERVE_FACTOR = parseUnits("0.1", 18);

export const vip221Testnet = () => {
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
        signature: "setDirectPrice(address,uint256)",
        params: [FDUSD, parseUnits("1", 18)],
      },
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
        target: FDUSD,
        signature: "faucet(uint256)",
        params: [INITIAL_FUNDING],
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
        target: USDT,
        signature: "allocateTo(address,uint256)",
        params: [VENUS_TREASURY, COMMUNITY_WALLET_FUNDING],
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
