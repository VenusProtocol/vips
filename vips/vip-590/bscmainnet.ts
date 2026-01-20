import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bscmainnet, ethereum, arbitrumone } = NETWORK_ADDRESSES;

export const BSC_PSR = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const BSC_RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
export const BSC_XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";
export const BSC_USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
export const BSC_USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
export const BSC_BTCB_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
export const BSC_ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
export const BSC_BNB_BURNING_CONVERTER = "0x9eF79830e626C8ccA7e46DCEd1F90e51E7cFCeBE";

export const ETHEREUM_PSR = "0x8c8c8530464f7D95552A11eC31Adbd4dC4AC4d3E";
export const ETHEREUM_USDC_PRIME_CONVERTER = "0xcEB9503f10B781E30213c0b320bCf3b3cE54216E";
export const ETHEREUM_USDT_PRIME_CONVERTER = "0x4f55cb0a24D5542a3478B0E284259A6B850B06BD";
export const ETHEREUM_WBTC_PRIME_CONVERTER = "0xDcCDE673Cd8988745dA384A7083B0bd22085dEA0";
export const ETHEREUM_WETH_PRIME_CONVERTER = "0xb8fD67f215117FADeF06447Af31590309750529D";
export const ETHEREUM_XVS_VAULT_CONVERTER = "0x1FD30e761C3296fE36D9067b1e398FD97B4C0407";

export const ARBITRUM_PSR = "0xF9263eaF7eB50815194f26aCcAB6765820B13D41";
export const ARBITRUM_USDC_PRIME_CONVERTER = "0x6553C9f9E131191d4fECb6F0E73bE13E229065C6";
export const ARBITRUM_USDT_PRIME_CONVERTER = "0x435Fac1B002d5D31f374E07c0177A1D709d5DC2D";
export const ARBITRUM_WBTC_PRIME_CONVERTER = "0xF91369009c37f029aa28AF89709a352375E5A162";
export const ARBITRUM_WETH_PRIME_CONVERTER = "0x4aCB90ddD6df24dC6b0D50df84C94e72012026d0";
export const ARBITRUM_XVS_VAULT_CONVERTER = "0x9c5A7aB705EA40876c1B292630a3ff2e0c213DB1";

export const vip590 = () => {
  const meta = {
    version: "v2",
    title: "VIP-600 New tokenomics",
    description: `New tokenomics`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: BSC_PSR,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 4000, bscmainnet.VTREASURY],
            [0, 0, BSC_BNB_BURNING_CONVERTER],
            [1, 6000, bscmainnet.VTREASURY],
            [1, 0, BSC_BNB_BURNING_CONVERTER],
          ],
        ],
      },
      {
        target: ETHEREUM_PSR,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 0, ETHEREUM_USDC_PRIME_CONVERTER],
            [0, 0, ETHEREUM_USDT_PRIME_CONVERTER],
            [0, 0, ETHEREUM_WBTC_PRIME_CONVERTER],
            [0, 0, ETHEREUM_WETH_PRIME_CONVERTER],
            [0, 0, ETHEREUM_XVS_VAULT_CONVERTER],
            [1, 0, ETHEREUM_XVS_VAULT_CONVERTER],
            [0, 10000, ethereum.VTREASURY],
            [1, 10000, ethereum.VTREASURY],
          ],
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ARBITRUM_PSR,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 0, ARBITRUM_USDC_PRIME_CONVERTER],
            [0, 0, ARBITRUM_USDT_PRIME_CONVERTER],
            [0, 0, ARBITRUM_WBTC_PRIME_CONVERTER],
            [0, 0, ARBITRUM_WETH_PRIME_CONVERTER],
            [0, 0, ARBITRUM_XVS_VAULT_CONVERTER],
            [1, 0, ARBITRUM_XVS_VAULT_CONVERTER],
            [0, 10000, arbitrumone.VTREASURY],
            [1, 10000, arbitrumone.VTREASURY],
          ],
        ],
        dstChainId: LzChainId.arbitrumone,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip590;
