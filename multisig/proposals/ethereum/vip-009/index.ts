import { makeProposal } from "../../../../src/utils";

const WSTETH_ADDRESS = "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0";
const WSTETH_ORACLE = "0x987F64F99cA9441D9BD141a34E195818961cCBa6";
const RESILIENT_ORACLE = "0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94";

// VIP: Configures the new oracle wstETH oracle
const vip009 = () => {
  return makeProposal([
    {
      target: RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          WSTETH_ADDRESS,
          [WSTETH_ORACLE, "0x0000000000000000000000000000000000000000", "0x0000000000000000000000000000000000000000"],
          [true, false, false],
        ],
      ],
    },
  ]);
};

export default vip009;
