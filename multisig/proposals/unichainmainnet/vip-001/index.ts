import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { unichainmainnet } = NETWORK_ADDRESSES;

export const ACM = "0x1f12014c497a9d905155eB9BfDD9FaC6885e61d0";

const REDSTONE_ETH_FEED = "";
const REDSTONE_USDC_FEED = "";
const WETH = "0x4200000000000000000000000000000000000006";
const USDC = "0x078D782b760474a361dDA0AF3839290b0EF57AD6";

export const BOUND_VALIDATOR = "0xfdaA5dEEA7850997dA8A6E2F2Ab42E60F1011C19";

const STALE_PERIOD = "";

const vip001 = () => {
  return makeProposal([
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [unichainmainnet.RESILIENT_ORACLE, "pause()", unichainmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [unichainmainnet.RESILIENT_ORACLE, "unpause()", unichainmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [unichainmainnet.RESILIENT_ORACLE, "setOracle(address,address,uint8)", unichainmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [unichainmainnet.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", unichainmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [unichainmainnet.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", unichainmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [unichainmainnet.REDSTONE_ORACLE, "setTokenConfig(TokenConfig)", unichainmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [unichainmainnet.REDSTONE_ORACLE, "setDirectPrice(address,uint256)", unichainmainnet.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", unichainmainnet.GUARDIAN],
    },
    {
      target: unichainmainnet.RESILIENT_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: unichainmainnet.REDSTONE_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: unichainmainnet.REDSTONE_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[WETH, REDSTONE_ETH_FEED, STALE_PERIOD]],
    },
    {
      target: unichainmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          WETH,
          [
            unichainmainnet.REDSTONE_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: unichainmainnet.REDSTONE_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[USDC, REDSTONE_USDC_FEED, STALE_PERIOD]],
    },
    {
      target: unichainmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          USDC,
          [
            unichainmainnet.REDSTONE_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: unichainmainnet.REDSTONE_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [unichainmainnet.XVS, parseUnits("7", 18)],
    },
    {
      target: unichainmainnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          unichainmainnet.XVS,
          [
            unichainmainnet.REDSTONE_ORACLE,
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
