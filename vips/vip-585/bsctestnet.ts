import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet, sepolia, arbitrumsepolia } = NETWORK_ADDRESSES;

export const BSC_RISK_FUND_CONVERTER = "0x32Fbf7bBbd79355B86741E3181ef8c1D9bD309Bb";
export const BSC_XVS_VAULT_CONVERTER = "0x258f49254C758a0E37DAb148ADDAEA851F4b02a2";
export const BSC_USDC_PRIME_CONVERTER = "0x2ecEdE6989d8646c992344fF6C97c72a3f811A13";
export const BSC_USDT_PRIME_CONVERTER = "0xf1FA230D25fC5D6CAfe87C5A6F9e1B17Bc6F194E";
export const BSC_BTCB_PRIME_CONVERTER = "0x989A1993C023a45DA141928921C0dE8fD123b7d1";
export const BSC_ETH_PRIME_CONVERTER = "0xf358650A007aa12ecC8dac08CF8929Be7f72A4D9";
export const BSC_BURNING_CONVERTER = "0x42DBA48e7cCeB030eC73AaAe29d4A3F0cD4facba";
export const BSC_PSR = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const SEPOLIA_PSR = "0xbea70755cc3555708ca11219adB0db4C80F6721B";
export const SEPOLIA_USDC_PRIME_CONVERTER = "0x3716C24EA86A67cAf890d7C9e4C4505cDDC2F8A2";
export const SEPOLIA_USDT_PRIME_CONVERTER = "0x511a559a699cBd665546a1F75908f7E9454Bfc67";
export const SEPOLIA_WBTC_PRIME_CONVERTER = "0x8a3937F27921e859db3FDA05729CbCea8cfd82AE";
export const SEPOLIA_WETH_PRIME_CONVERTER = "0x274a834eFFA8D5479502dD6e78925Bc04ae82B46";
export const SEPOLIA_XVS_VAULT_CONVERTER = "0xc203bfA9dCB0B5fEC510Db644A494Ff7f4968ed2";

export const ARB_SEPOLIA_PSR = "0x09267d30798B59c581ce54E861A084C6FC298666";
export const ARB_SEPOLIA_USDC_PRIME_CONVERTER = "0xE88ed530597bc8D50e8CfC0EecAAFf6A93248C74";
export const ARB_SEPOLIA_USDT_PRIME_CONVERTER = "0xFC0ec257d3ec4D673cB4e2CD3827C202e75fd0be";
export const ARB_SEPOLIA_WBTC_PRIME_CONVERTER = "0x3089F46caf6611806caA39Ffaf672097156b893a";
export const ARB_SEPOLIA_WETH_PRIME_CONVERTER = "0x0d1e90c1F86CD1c1dF514B493c5985B3FD9CD6C8";
export const ARB_SEPOLIA_XVS_VAULT_CONVERTER = "0x99942a033454Cef6Ffb2843886C8b2E658E7D5fd";

export const vip585 = () => {
  const meta = {
    version: "v2",
    title: "VIP-90 New tokenomics",
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
            [0, 4000, bsctestnet.VTREASURY],
            [0, 0, BSC_BURNING_CONVERTER],
            [1, 6000, bsctestnet.VTREASURY],
            [1, 0, BSC_BURNING_CONVERTER],
          ],
        ],
      },
      {
        target: SEPOLIA_PSR,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 0, SEPOLIA_USDC_PRIME_CONVERTER],
            [0, 0, SEPOLIA_USDT_PRIME_CONVERTER],
            [0, 0, SEPOLIA_WBTC_PRIME_CONVERTER],
            [0, 0, SEPOLIA_WETH_PRIME_CONVERTER],
            [0, 0, SEPOLIA_XVS_VAULT_CONVERTER],
            [1, 0, SEPOLIA_XVS_VAULT_CONVERTER],
            [0, 10000, sepolia.VTREASURY],
            [1, 10000, sepolia.VTREASURY],
          ],
        ],
        dstChainId: LzChainId.sepolia,
      },
      {
        target: ARB_SEPOLIA_PSR,
        signature: "addOrUpdateDistributionConfigs((uint8,uint16,address)[])",
        params: [
          [
            [0, 0, ARB_SEPOLIA_USDC_PRIME_CONVERTER],
            [0, 0, ARB_SEPOLIA_USDT_PRIME_CONVERTER],
            [0, 0, ARB_SEPOLIA_WBTC_PRIME_CONVERTER],
            [0, 0, ARB_SEPOLIA_WETH_PRIME_CONVERTER],
            [0, 0, ARB_SEPOLIA_XVS_VAULT_CONVERTER],
            [1, 0, ARB_SEPOLIA_XVS_VAULT_CONVERTER],
            [0, 10000, arbitrumsepolia.VTREASURY],
            [1, 10000, arbitrumsepolia.VTREASURY],
          ],
        ],
        dstChainId: LzChainId.arbitrumsepolia,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip585;
