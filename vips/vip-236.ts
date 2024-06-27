import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const BNB_TREASURY = "0xf322942f644a996a617bd29c16bd7d231d9f35e9";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";

export const BTC = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";

export const BTC_AMOUNT = parseUnits("0.3", 18);
export const ETH_AMOUNT = parseUnits("15", 18);
export const USDT_AMOUNT = parseUnits("40000", 18);

export const vip236 = () => {
  const meta = {
    version: "v2",
    title: "VIP-236 Bootstrap liquidity for the Ethereum deployment",
    description: `#### Summary

If passed, this VIP will transfer from the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to the [Community wallet](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391) these tokens:

- 0.3 BTCB
- 15 ETH
- 40,000 USDT

These tokens will be used for the bootstrap liquidity of the new Venus markets on Ethereum.

#### Description

The transferred tokens will be partially used by the Community wallet to get the rest of the needed tokens for the bootstrap liquidity in the new Venus markets to be deployed to Ethereum.

The next steps will be:

- Transfer BTC, ETH and USDT to the Community wallet. This VIP
- The Community wallet:
    - swaps 20,000 USDT for 20,000 USDC
    - stakes 5 ETH on [Lido](https://lido.fi/), getting [stETH](https://etherscan.io/address/0xae7ab96520de3a18e5e111b5eaab095312d7fe84) tokens
    - wraps the stETH tokens to get [wstETH](https://etherscan.io/address/0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0) tokens, using [https://stake.lido.fi/wrap](https://stake.lido.fi/wrap)
- The Community wallet sends to the [Venus Treasury on Ethereum](https://etherscan.io/address/0xFD9B071168bC27DBE16406eC3Aba050Ce8Eb22FA):
    - 0.3 BTC
    - 20,000 USDT
    - 20,000 USDC (obtained in the previous step)
    - 10 ETH
    - 100% of the wstETH tokens obtained in the previous step

#### References

- [Repository](https://github.com/VenusProtocol/token-bridge)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/162)
- [[VRC] Deploy Venus Protocol on Ethereum Mainnet](https://community.venus.io/t/vrc-deploy-venus-protocol-on-ethereum-mainnet/3885)
- Snapshot ["Deploy Venus Protocol on Ethereum Mainnet"](https://snapshot.org/#/venus-xvs.eth/proposal/0x68be3a2cf0d4e72459c286ecb3dfae7d6f489ba9d962747987be3a46771a0df2)
- [Proposal: Support wstETH and stETH collateral on Venus on ETH Mainnet](https://community.venus.io/t/proposal-support-wsteth-and-steth-collateral-on-venus-on-eth-mainnet/3914/1)
- Snapshot “[Proposal: Support wstETH as collateral on Venus on ETH Mainnet](https://snapshot.org/#/venus-xvs.eth)”
- [Documentation](https://docs-v4.venus.io/)`,

    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BTC, BTC_AMOUNT, COMMUNITY_WALLET],
      },
      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, ETH_AMOUNT, COMMUNITY_WALLET],
      },
      {
        target: BNB_TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, USDT_AMOUNT, COMMUNITY_WALLET],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
