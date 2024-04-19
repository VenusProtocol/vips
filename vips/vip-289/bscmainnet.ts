import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
export const BNBxOracle = "0x46F8f9e4cb04ec2Ca4a75A6a4915b823b98A0aA1";
export const BNBx = "0x1bdd3cf7f79cfb8edbb955f20ad99211551ba275";
export const SlisBNBOracle = "0xfE54895445eD2575Bf5386B90FFB098cBC5CA29A";
export const SlisBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";
export const StkBNBOracle = "0xdBAFD16c5eA8C29D1e94a5c26b31bFAC94331Ac6";
export const StkBNB = "0xc2E9d07F66A89c44062459A47a0D2Dc038E4fb16";
export const WBETHOracle = "0x739db790c656E54590957Ed4d6B94665bCcb3456";
export const WBETH = "0xa2e3356610840701bdf5611a53974510ae27e2e1";
export const ankrBNB = "0x52f24a5e03aee338da5fd9df68d2b6fae1178827";
export const ankrBNBOracle = "0xb0FCf0d45C15235D4ebC30d3c01d7d0D72Fd44AB";

const vip289 = () => {
  const meta = {
    version: "v2",
    title: "VIP-289 Set custom oracles for markets with LST tokens (ankrBNB, BNBx, stkBNB, and slisBNB)",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            BNBx,
            [BNBxOracle, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
            [true, false, false],
          ],
        ],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            SlisBNB,
            [SlisBNBOracle, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
            [true, false, false],
          ],
        ],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            StkBNB,
            [StkBNBOracle, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
            [true, false, false],
          ],
        ],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            ankrBNB,
            [ankrBNBOracle, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
            [true, false, false],
          ],
        ],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip289;
