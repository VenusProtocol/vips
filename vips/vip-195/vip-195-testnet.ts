import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

const COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
const UNI = "0x8D2f061C75780d8D91c10A7230B907411aCBC8fC";
const VUNI = "0x48ef03b6E6A8984cA0D561EE9c85407653EE6107";
const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
const UNI_HOLDER = "0x9cc6F5f16498fCEEf4D00A350Bd8F8921D304Dc9";
const INITIAL_FUNDING = parseUnits("1", 18); // to be revised
const INITIAL_VTOKENS = parseUnits("1", 8);

export const vip195Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-195 Add UNI Market",
    description: `
    VIP
    Risk parameters suggested by Chaos lab:
    Supply cap: 50,000 (full tokens)
    Borrow cap: 30,000 (full tokens)
    Collateral factor: 55%
    Reserve factor: 25%
    XVS rewards:
      borrowers: 81250000000000
      suppliers: 81250000000000
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
        params: [UNI, parseUnits("4.10", 18)],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            UNI,
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
        params: [VUNI],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VUNI], [parseUnits("50000", 18)]],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VUNI], [parseUnits("30000", 18)]],
      },

      {
        target: COMPTROLLER,
        signature: "_setVenusSpeeds(address[],uint256[],uint256[])",
        params: [[VUNI], ["81250000000000"], ["81250000000000"]],
      },

      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VUNI, parseUnits("0.55", 18)],
      },

      {
        target: UNI,
        signature: "faucet(uint256)",
        params: [INITIAL_FUNDING],
      },

      {
        target: UNI,
        signature: "approve(address,uint256)",
        params: [VUNI, 0],
      },

      {
        target: UNI,
        signature: "approve(address,uint256)",
        params: [VUNI, INITIAL_FUNDING],
      },
      {
        target: VUNI,
        signature: "mint(uint256)",
        params: [INITIAL_FUNDING],
      },

      {
        target: VUNI,
        signature: "transfer(address,uint256)",
        params: [UNI_HOLDER, INITIAL_VTOKENS],
      },

      {
        target: VUNI,
        signature: "_setReserveFactor(uint256)",
        params: ["250000000000000000"],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
