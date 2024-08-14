import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { arbitrumsepolia } = NETWORK_ADDRESSES;

export const XVS = "0x877Dc896e7b13096D3827872e396927BbE704407";
const ACM = "0xa36AD96441cB931D8dFEAAaC97D3FaB4B39E590F";

const vip001 = () => {
  return makeProposal([
    {
      target: arbitrumsepolia.CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [XVS, "0"],
    },
    {
      target: arbitrumsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          XVS,
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
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumsepolia.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [arbitrumsepolia.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", arbitrumsepolia.NORMAL_TIMELOCK],
    },
    {
      target: arbitrumsepolia.REDSTONE_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: arbitrumsepolia.REDSTONE_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [XVS, "10000000000000000000"],
    },
    {
      target: arbitrumsepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          XVS,
          [
            arbitrumsepolia.REDSTONE_ORACLE,
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
