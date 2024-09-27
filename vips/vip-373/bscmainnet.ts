import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const TOKEN_REDEEMER = "0xC53ffda840B51068C64b2E052a5715043f634bcd";
export const COMMUNITY_WALLET = "0xc444949e0054a23c44fc45789738bdf64aed2391";
export const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const VUSDC_AMOUNT = parseUnits("1022560", 8); // close to 25000 USDC, taking into account 1 USDC = 40.9 vUSDC with exchange rate of 244489614500844742686609163
const USDC_AMOUNT = parseUnits("25000", 18);

const vip373 = () => {
  const meta = {
    version: "v2",
    title: "VIP-373 Bootstrap liquidity for the Optimism markets",
    description: `#### Summary

If passed, this VIP will transfer 25,000 USDC from the [Venus Treasury on BNB Chain](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to the [Community wallet](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391). These tokens will be used for the bootstrap liquidity of the new Venus markets on Optimism: USDC, USDT, WETH, WBTC, OP, following the [Chaos labs recommendations](https://community.venus.io/t/deploy-venus-protocol-on-op-mainnet/4512/9).

#### Description

The transferred tokens will be partially used by the Community wallet to get the rest of the needed tokens for the bootstrap liquidity in the new Venus markets to be deployed to Optimism.

The next steps will be:

- Transfer USDC to the Community wallet. This VIP
- The Community wallet:
    - swaps 5,000 USDC for USDT
    - swaps 5,000 USDC for WBTC
    - swaps 5,000 USDC for WETH
    - swaps 5,000 USDC for OP
- The Community wallet sends to the [Venus Treasury on Optimism](https://optimistic.etherscan.io/address/0x104c01EB7b4664551BE6A9bdB26a8C5c6Be7d3da) 100% of the received tokens after swapping USDC

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/393)
- [Deploy Venus Protocol on OP Mainnet](https://community.venus.io/t/deploy-venus-protocol-on-op-mainnet/4512)
- Snapshot “[Deploy Venus Protocol on OP Mainnet](https://snapshot.org/#/venus-xvs.eth/proposal/0xe2e59410d7c010600ec869132980f10a8694d78e9ece4b3702f973d1e0ecc93f)”
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [VUSDC, VUSDC_AMOUNT, TOKEN_REDEEMER],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "redeemUnderlyingAndTransfer(address,address,uint256,address)",
        params: [VUSDC, COMMUNITY_WALLET, USDC_AMOUNT, TREASURY],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip373;
