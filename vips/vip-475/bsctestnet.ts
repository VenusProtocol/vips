import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BSCTESTNET_XVS_VAULT_PROXY = "0x9aB56bAD2D7631B2A857ccf36d998232A8b82280";
export const BSCTESTNET_COMPTROLLER = "0x94d1820b2D1c7c7452A163983Dc888CEC546b77D";
export const BSCTESTNET_XVS_MARKET = "0x6d6F697e34145Bb95c54E77482d97cc261Dc237E";
export const BSCTESTNET_XVS = "0xB9e0E753630434d7863528cc73CB7AC638a7c8ff";
export const BSCTESTNET_BTCB = "0xA808e341e8e723DC6BA0Bb5204Bafc2330d7B8e4";
export const BSCTESTNET_ETH = "0x98f7A83361F7Ac8765CcEBAB1425da6b341958a7";
export const BSCTESTNET_USDC = "0x16227D60f7a0e586C66B005219dfc887D13C9531";
export const BSCTESTNET_USDT = "0xA11c8D9DC9b66E209Ef60F0C8D969D3CD988782c";

export const BSCTESTNET_XVS_PER_BLOCK_REWARD = parseUnits("0.01", 18).div(2);
export const BSCTESTNET_BTCB_PER_BLOCK_REWARD = parseUnits("0.000001261574074074", 18).div(2);
export const BSCTESTNET_ETH_PER_BLOCK_REWARD = parseUnits("0.000024438657407407", 18).div(2);
export const BSCTESTNET_USDC_PER_BLOCK_REWARD = parseUnits("0.036881", 6).div(2);
export const BSCTESTNET_USDT_PER_BLOCK_REWARD = parseUnits("0.087191", 6).div(2);
export const BSCTESTNET_VAI_VAULT_RATE_PER_BLOCK = parseUnits("0.192", 18).div(2);

export const BSCTESTNET_DEFAULT_PROXY_ADMIN = "0x7877ffd62649b6a1557b55d4c20fcbab17344c91";
export const BSCTESTNET_PRIME_PROXY = "0xe840F8EC2Dc50E7D22e5e2991975b9F6e34b62Ad";
export const BSCTESTNET_PLP_PROXY = "0xAdeddc73eAFCbed174e6C400165b111b0cb80B7E";
export const BSCTESTNET_VAI_UNITROLLER = "0xf70C3C6b749BbAb89C081737334E74C9aFD4BE16";
export const BSCTESTNET_NEW_VAI_IMPLEMENTATION = "0x52558EED5d8f4c86cC2d5EC5DF155521db8d0D48";
export const BSCTESTNET_NEW_PLP_IMPLEMENTATION = "0xD2eBa310E843fC6dc242187501bDf7c0F6b46681";
export const BSCTESTNET_NEW_PRIME_IMPLEMENTATION = "0x73Ac7280b8f3EAF7F621c48ae2398733eD9fBC81";
export const BSCTESTNET_NEW_XVS_VAULT_IMPLEMENTATION = "0x471A33538D8A73fc7148F8B72A2A8BE6Ab9E3723";
export const BSCTESTNET_VTOKEN_BEACON = "0xBF85A90673E61956f8c79b9150BAB7893b791bDd";
export const BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION = "0x78Da3E30a896Afd5E04cBC98fE37b8f027098638";
export const BSCTESTNET_ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const BSCTESTNET_NEW_BLOCK_RATE = 21024000;

export const OPBNBTESTNET_VTOKEN_BEACON = "0xcc633492097078Ae590C0d11924e82A23f3Ab3E2";
export const OPBNBTESTNET_NEW_VTOKEN_IMPLEMENTATION = "0x25E034878C9873D780f2D82D22A25481aA8c74F6";
export const OPBNBTESTNET_NEW_XVS_VAULT_IMPLEMENTATION = "0x6E09f32F94B2d5056431710BA3eEF75aed40C3b1";
export const OPBNBTESTNET_XVS_VAULT_PROXY = "0xB14A0e72C5C202139F78963C9e89252c1ad16f01";
export const OPBNBTESTNET_XVS = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";
export const OPBNBTESTNET_ACM = "0x049f77F7046266d27C3bC96376f53C17Ef09c986";
const OPBNBTESTNET_NEW_BLOCK_RATE = 63072000;

export const vip475 = () => {
  const meta = {
    version: "v2",
    title:
      "Reduce the distribution speeds and upgrade implementations considering the update of the blockrate on BNB Chain",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BSCTESTNET_XVS_VAULT_PROXY,
        signature: "setAccessControl(address)",
        params: [BSCTESTNET_ACM],
      },
      {
        target: BSCTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [BSCTESTNET_XVS_VAULT_PROXY, "setBlocksPerYear(uint256)", NETWORK_ADDRESSES.bsctestnet.NORMAL_TIMELOCK],
      },

      {
        target: BSCTESTNET_XVS_VAULT_PROXY,
        signature: "setRewardAmountPerBlockOrSecond(address,uint256)",
        params: [BSCTESTNET_XVS, BSCTESTNET_XVS_PER_BLOCK_REWARD],
      },
      {
        target: BSCTESTNET_COMPTROLLER,
        signature: "_setVenusVAIVaultRate(uint256)",
        params: [BSCTESTNET_VAI_VAULT_RATE_PER_BLOCK],
      },
      {
        target: BSCTESTNET_PLP_PROXY,
        signature: "setTokensDistributionSpeed(address[],uint256[])",
        params: [
          [BSCTESTNET_BTCB, BSCTESTNET_ETH, BSCTESTNET_USDC, BSCTESTNET_USDT],
          [
            BSCTESTNET_BTCB_PER_BLOCK_REWARD,
            BSCTESTNET_ETH_PER_BLOCK_REWARD,
            BSCTESTNET_USDC_PER_BLOCK_REWARD,
            BSCTESTNET_USDT_PER_BLOCK_REWARD,
          ],
        ],
      },
      {
        target: BSCTESTNET_DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BSCTESTNET_PRIME_PROXY, BSCTESTNET_NEW_PRIME_IMPLEMENTATION],
      },
      {
        target: BSCTESTNET_DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BSCTESTNET_PLP_PROXY, BSCTESTNET_NEW_PLP_IMPLEMENTATION],
      },
      {
        target: BSCTESTNET_VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [BSCTESTNET_NEW_VTOKEN_IMPLEMENTATION],
      },
      {
        target: BSCTESTNET_XVS_VAULT_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [BSCTESTNET_NEW_XVS_VAULT_IMPLEMENTATION],
      },
      {
        target: BSCTESTNET_NEW_XVS_VAULT_IMPLEMENTATION,
        signature: "_become(address)",
        params: [BSCTESTNET_XVS_VAULT_PROXY],
      },
      {
        target: BSCTESTNET_VAI_UNITROLLER,
        signature: "_setPendingImplementation(address)",
        params: [BSCTESTNET_NEW_VAI_IMPLEMENTATION],
      },
      {
        target: BSCTESTNET_NEW_VAI_IMPLEMENTATION,
        signature: "_become(address)",
        params: [BSCTESTNET_VAI_UNITROLLER],
      },

      // set new block rate in xvs vault
      {
        target: BSCTESTNET_XVS_VAULT_PROXY,
        signature: "setBlocksPerYear(uint256)",
        params: [BSCTESTNET_NEW_BLOCK_RATE],
      },

      {
        target: OPBNBTESTNET_VTOKEN_BEACON,
        signature: "upgradeTo(address)",
        params: [OPBNBTESTNET_NEW_VTOKEN_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_XVS_VAULT_PROXY,
        signature: "_setPendingImplementation(address)",
        params: [OPBNBTESTNET_NEW_XVS_VAULT_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_NEW_XVS_VAULT_IMPLEMENTATION,
        signature: "_become(address)",
        params: [OPBNBTESTNET_XVS_VAULT_PROXY],
        dstChainId: LzChainId.opbnbtestnet,
      },
      {
        target: OPBNBTESTNET_ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [
          OPBNBTESTNET_XVS_VAULT_PROXY,
          "setBlocksPerYear(uint256)",
          NETWORK_ADDRESSES.opbnbtestnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.opbnbtestnet,
      },
      // set new block rate in xvs vault
      {
        target: OPBNBTESTNET_XVS_VAULT_PROXY,
        signature: "setBlocksPerYear(uint256)",
        params: [OPBNBTESTNET_NEW_BLOCK_RATE],
        dstChainId: LzChainId.opbnbtestnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip475;
