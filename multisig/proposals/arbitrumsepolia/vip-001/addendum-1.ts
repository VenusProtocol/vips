import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

export const OLD_XVS = "0x47fA6E9F717c9eB081c4734FfB5a1EcD70508891";
export const NEW_XVS = "0x877Dc896e7b13096D3827872e396927BbE704407";

const vip001 = () => {
  return makeProposal([
    {
      target: arbitrumsepolia.CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [OLD_XVS, "0"],
    },
    {
      target: arbitrumsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          OLD_XVS,
          [
            arbitrumsepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [false, false, false],
        ],
      ],
    },
    {
      target: arbitrumsepolia.CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [NEW_XVS, "10000000000000000000"],
    },
    {
      target: arbitrumsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          NEW_XVS,
          [
            arbitrumsepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
  ]);
};

export default vip001;
