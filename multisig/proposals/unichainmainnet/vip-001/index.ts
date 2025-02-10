import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { unichainmainnet } = NETWORK_ADDRESSES;

export const ACM = "0x1f12014c497a9d905155eB9BfDD9FaC6885e61d0";

const REDSTONE_ETH_FEED = "0xe8D9FbC10e00ecc9f0694617075fDAF657a76FB2";
const REDSTONE_USDC_FEED = "0xD15862FC3D5407A03B696548b6902D6464A69b8c";
const REDSTONE_XVS_FEED = "0xb4fe9028A4D4D8B3d00e52341F2BB0798860532C";
const WETH = "0x4200000000000000000000000000000000000006";
const USDC = "0x078D782b760474a361dDA0AF3839290b0EF57AD6";

export const BOUND_VALIDATOR = "0xfdaA5dEEA7850997dA8A6E2F2Ab42E60F1011C19";

const STALE_PERIOD_26H = 26 * 60 * 60; // 26 hours (pricefeeds with heartbeat of 24 hr)
const STALE_PERIOD_7H = 7 * 60 * 60; // 7 hours (pricefeeds with heartbeat of 6 hr)
const STALE_PERIOD_4H = 4 * 60 * 60; // 4 hours (pricefeeds with heartbeat of 3 hr)

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
      params: [[WETH, REDSTONE_ETH_FEED, STALE_PERIOD_7H]],
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
      params: [[USDC, REDSTONE_USDC_FEED, STALE_PERIOD_4H]],
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
      signature: "setTokenConfig((address,address,uint256))",
      params: [[unichainmainnet.XVS, REDSTONE_XVS_FEED, STALE_PERIOD_26H]],
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
