import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { basesepolia } = NETWORK_ADDRESSES;

export const TREASURY = "0x07e880DaA6572829cE8ABaaf0f5323A4eFC417A6";
export const ACM = "0x724138223D8F76b519fdE715f60124E7Ce51e051";
export const BOUND_VALIDATOR = "0xC76284488E57554A457A75a8b166fB2ADAB430dB";

const vip000 = () => {
  return makeProposal([
    {
      target: TREASURY,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.RESILIENT_ORACLE, "pause()", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.RESILIENT_ORACLE, "unpause()", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.RESILIENT_ORACLE, "setOracle(address,address,uint8)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.RESILIENT_ORACLE, "enableOracle(address,uint8,bool)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.RESILIENT_ORACLE, "setTokenConfig(TokenConfig)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.CHAINLINK_ORACLE, "setTokenConfig(TokenConfig)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [basesepolia.CHAINLINK_ORACLE, "setDirectPrice(address,uint256)", basesepolia.GUARDIAN],
    },
    {
      target: ACM,
      signature: "giveCallPermission(address,string,address)",
      params: [BOUND_VALIDATOR, "setValidateConfig(ValidateConfig)", basesepolia.GUARDIAN],
    },
    {
      target: basesepolia.RESILIENT_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: basesepolia.CHAINLINK_ORACLE,
      signature: "acceptOwnership()",
      params: [],
    },
    {
      target: BOUND_VALIDATOR,
      signature: "acceptOwnership()",
      params: [],
    },
  ]);
};

export default vip000;
