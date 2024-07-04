import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const USDT = "0x55d398326f99059ff775485246999027b3197955";
export const USDC = "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d";
export const WBTC = "0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c";
export const WETH = "0x2170ed0880ac9a755fd29b2688956bd959f933f8";

export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";

export const WETH_AMOUNT = parseUnits("47.8788", 18);
export const WBTC_AMOUNT = parseUnits("0.2318", 18);
export const USDC_AMOUNT = parseUnits("14000", 18);
export const USDT_AMOUNT = parseUnits("14000", 18);

export const vip334 = () => {
  const meta = {
    version: "v2",
    title: "VIP-334 Ethereum: Token converters and Prime markets",
    description: `#### Summary

If passed, this VIP will transfer the tokens required for the deployment of Venus Prime on ETH Mainnet, as indicated in the following snapshot.

The tokens will be transferred to the community wallet (BEB20 address: [0xc444949e0054A23c44Fc45789738bdF64aed2391](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391)) where they will be bridged to ETH and sent to the Prime Distributor Contract in preparation for the program launch.

The tokens to be transferred are the following:
  - ETH: 47.8788 ($158,000)
  - BTC: 0.2318 ($14,000)
  - USDC: 14,000 ($14,000)
  - USDT: 14,000 ($14,000)

#### References
  - [VIP-326 Ethereum](https://app.venus.io/#/governance/proposal/326)
  - [Simulation](https://github.com/VenusProtocol/vips/pull/313)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT, COMMUNITY_WALLET],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDC, USDC_AMOUNT, COMMUNITY_WALLET],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [WBTC, WBTC_AMOUNT, COMMUNITY_WALLET],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [WETH, WETH_AMOUNT, COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip334;
