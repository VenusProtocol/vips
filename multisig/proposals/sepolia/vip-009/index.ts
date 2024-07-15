import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { sepolia } = NETWORK_ADDRESSES;

const WSTETH_ADDRESS = "0x9b87ea90fdb55e1a0f17fbeddcf7eb0ac4d50493";
const WSTETH_ORACLE = "0x92E7F73B0d57902fDC453E8aef990EdEe827b0BF";

// VIP: Configures the new oracle wstETH oracle
const vip009 = () => {
  return makeProposal([
    {
      target: sepolia.RESILIENT_ORACLE,
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
