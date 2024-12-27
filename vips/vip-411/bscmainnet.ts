import { LzChainId } from "src/types";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const vUSDC_ARBITRUM_CORE = "0x7D8609f8da70fF9027E9bc5229Af4F6727662707";
export const vUSDT_ARBITRUM_CORE = "0xB9F9117d4200dC296F9AcD1e8bE1937df834a2fD";
export const vUSDC_ZKSYNC_CORE = "0x84064c058F2EFea4AB648bB6Bd7e40f83fFDe39a";
export const vUSDCe_ZKSYNC_CORE = "0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D";
export const vUSDT_ZKSYNC_CORE = "0x69cDA960E3b20DFD480866fFfd377Ebe40bd0A46";

export const vUSDC_ETHEREUM_CORE = "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb";
export const vUSDT_ETHEREUM_CORE = "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E";
export const vDAI_ETHEREUM_CORE = "0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657";
export const vcrvUSD_ETHEREUM_CORE = "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202";
export const vcrvUSD_ETHEREUM_CURVE = "0x2d499800239C4CD3012473Cb1EAE33562F0A6933";
export const vTUSD_ETHEREUM_CORE = "0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b";
export const vFRAX_ETHEREUM_CORE = "0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95";

export const vUSDC_BSC_CORE = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const vUSDT_BSC_CORE = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
export const vDAI_BSC_CORE = "0x334b3eCB4DCa3593BCCC3c7EBD1A1C1d1780FBF1";
export const vTUSD_BSC_CORE = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";
export const vUSDT_BSC_DEFI = "0x1D8bBDE12B6b34140604E18e9f9c6e14deC16854";
export const vUSDT_BSC_GAMEFI = "0x4978591f17670A846137d9d613e333C38dc68A37";
export const vUSDT_BSC_MEME = "0x4a9613D06a241B76b81d3777FCe3DDd1F61D4Bd0";
export const vUSDT_BSC_TRON = "0x281E5378f99A4bc55b295ABc0A3E7eD32Deba059";

export const ETHEREUM_TWO_KINKS_IRM = "0x4A786e4653Ff7DBA74D6dA0861350F233f2dA73b";
export const ARBITRUM_TWO_KINKS_IRM = "0x8fd05f11a175A9b7E6dDcA8Ee2713E2c7f94c011";
export const BSC_TWO_KINKS_IRM = "0x4D712A88Ff15a7147a9966c5ED2ccb392F1760c9";
export const ZKSYNC_TWO_KINKS_IRM = "0x61E98E6a1F37649543156DC995E0dfe466B31a2e";

export const BSC_DAI_TUSD_IRM = "0x0be3ca99FBBE16b86C3b00E2C4c30C3892F31647";
export const BSC_USDT_DEFI_GAMEFI_IRM = "0xB4b4eB2CDA57F304945A96123acae80Fb873a601";
export const BSC_USDT_MEME_IRM = "0xd109E4cbd098581Caa78fD3b259DEFaF14baBd06";
export const BSC_USDT_TRON_IRM = "0xF1606ac127E5759E2876b85138E69e0740B5E20c";
export const ETHEREUM_DAI_TUSD_FRAX_IRM = "0x675b3dF06a5F3A7d2f04e7852Dbf8f8d40959Ca9";
export const ETHEREUM_crvUSD_IRM = "0x837996e7d74222965ACf1fdd478926e07336a291";

export const vip411 = () => {
  const meta = {
    version: "v2",
    title: "VIP-411",
    description: ``,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: vUSDC_ARBITRUM_CORE,
        signature: "setInterestRateModel(address)",
        params: [ARBITRUM_TWO_KINKS_IRM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: vUSDT_ARBITRUM_CORE,
        signature: "setInterestRateModel(address)",
        params: [ARBITRUM_TWO_KINKS_IRM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: vUSDC_ZKSYNC_CORE,
        signature: "setInterestRateModel(address)",
        params: [ZKSYNC_TWO_KINKS_IRM],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: vUSDCe_ZKSYNC_CORE,
        signature: "setInterestRateModel(address)",
        params: [ZKSYNC_TWO_KINKS_IRM],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: vUSDT_ZKSYNC_CORE,
        signature: "setInterestRateModel(address)",
        params: [ZKSYNC_TWO_KINKS_IRM],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: vUSDC_ETHEREUM_CORE,
        signature: "setInterestRateModel(address)",
        params: [ETHEREUM_TWO_KINKS_IRM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: vUSDT_ETHEREUM_CORE,
        signature: "setInterestRateModel(address)",
        params: [ETHEREUM_TWO_KINKS_IRM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: vDAI_ETHEREUM_CORE,
        signature: "setInterestRateModel(address)",
        params: [ETHEREUM_DAI_TUSD_FRAX_IRM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: vTUSD_ETHEREUM_CORE,
        signature: "setInterestRateModel(address)",
        params: [ETHEREUM_DAI_TUSD_FRAX_IRM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: vFRAX_ETHEREUM_CORE,
        signature: "setInterestRateModel(address)",
        params: [ETHEREUM_DAI_TUSD_FRAX_IRM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: vcrvUSD_ETHEREUM_CORE,
        signature: "setInterestRateModel(address)",
        params: [ETHEREUM_crvUSD_IRM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: vcrvUSD_ETHEREUM_CURVE,
        signature: "setInterestRateModel(address)",
        params: [ETHEREUM_crvUSD_IRM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: vUSDC_BSC_CORE,
        signature: "_setInterestRateModel(address)",
        params: [BSC_TWO_KINKS_IRM],
      },
      {
        target: vUSDT_BSC_CORE,
        signature: "_setInterestRateModel(address)",
        params: [BSC_TWO_KINKS_IRM],
      },
      {
        target: vDAI_BSC_CORE,
        signature: "_setInterestRateModel(address)",
        params: [BSC_DAI_TUSD_IRM],
      },
      {
        target: vTUSD_BSC_CORE,
        signature: "_setInterestRateModel(address)",
        params: [BSC_DAI_TUSD_IRM],
      },
      {
        target: vUSDT_BSC_DEFI,
        signature: "setInterestRateModel(address)",
        params: [BSC_USDT_DEFI_GAMEFI_IRM],
      },
      {
        target: vUSDT_BSC_GAMEFI,
        signature: "setInterestRateModel(address)",
        params: [BSC_USDT_DEFI_GAMEFI_IRM],
      },
      {
        target: vUSDT_BSC_MEME,
        signature: "setInterestRateModel(address)",
        params: [BSC_USDT_MEME_IRM],
      },
      {
        target: vUSDT_BSC_TRON,
        signature: "setInterestRateModel(address)",
        params: [BSC_USDT_TRON_IRM],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip411;
