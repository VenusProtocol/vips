import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RESILIENT_ORACLE = "0x8f3618c4F0183e14A218782c116fb2438571dAC9";
export const BINANCE_ORACLE = "0xB09EC9B628d04E1287216Aa3e2432291f50F9588";
export const BOUND_VALIDATOR = "0xd1f80C371C6E2Fa395A5574DB3E3b4dAf43dadCE";
export const DEFAULT_PROXY_ADMIN = "0xF77bD1D893F67b3EB2Cd256239c98Ba3F238fb52";

export const RESILIENT_ORACLE_IMPLEMENTATION = "0x47981520753d592a42Ac9521b5396C3c7FA04408";
export const BINANCE_ORACLE_IMPLEMENTATION = "0x05CEE4B936C654be43993D3A8Baa76c8fdd5BeCC";
export const BOUND_VALIDATOR_IMPLEMENTATION = "0xe630fa259c893D9a1d8b1d61EdFB1B59EF574df4";

export const vip495 = () => {
  const meta = {
    version: "v2",
    title: "VIP-495 [opBNB] Capped Oracles and Cached Prices",
    description: `#### Summary

If passed, following the community proposal “[Provide Support for Capped Oracles for Enhanced Security](https://community.venus.io/t/provide-support-for-capped-oracles-for-enhanced-security/5092)” ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xcd64c64eee56e75b56a0a0b84f1ffa2b4ea5fb2be76cca96a155137c46305c07)), this VIP will upgrade the implementations of the following contracts on opBNB, including support for Capped Oracles and Cached Prices:

- ResilientOracle
- BinanceOracle
- BoundValidator

#### Description

**Capped Oracles** are a type of price oracle designed to limit the maximum value (or growth) of an asset's reported price to protect against manipulation or sudden volatility.

Capped Oracles set an upper bound (a "cap") on the price that can be reported for an asset in the protocol. This mechanism helps mitigate the risk of price manipulation—especially for low-liquidity or volatile assets—which could otherwise allow users to borrow excessively or liquidate positions unfairly. By capping the price, the protocol ensures that users can't exploit sudden, artificial price spikes to increase their borrowing power or trigger liquidations.

[Venus Correlated token oracles](https://docs-v4.venus.io/technical-reference/reference-oracle/correlated-token-oracles) calculate the USD price of assets strongly correlated with other assets, for example [wstETH](https://help.lido.fi/en/articles/5231836-what-is-lido-s-wsteth) and [stETH](https://help.lido.fi/en/articles/5230610-what-is-steth), taking into account the onchain exchange rate between the correlated assets. Specifically, Capped Oracles limit the considered growth of that exchange rate on correlated assets.

This VIP doesn’t enable Capped Oracles for any market on opBNB. It only upgrades the oracle contracts to support that feature.

**Cached Prices** is a new feature integrated into the Venus oracle contracts, that reduces the gas consumed by the functions that collect and return the prices, using [Transient Storage](https://soliditylang.org/blog/2024/01/26/transient-storage/) to cache the prices in the smart contract memory. This drastically reduces the needed gas when the price for one asset is requested more than one time in the same transaction (common behaviour during liquidations or complex transactions).

This VIP doesn’t enable Cached Prices for any market on opBNB. It only upgrades the oracle contracts to support that feature.

The deployment and configuration of the Capped Oracles and Cached Prices will be performed in several phases. It requires the upgrade of the base contracts (ResilientOracle, BoundValidator, ChainlinkOracle, BinanceOracle and RedStoneOracle).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits**: [Certik](https://www.certik.com/), [Quantstamp](https://quantstamp.com/) and [Fairyproof](https://www.fairyproof.com/) have audited the deployed code
- **VIP execution simulation**: in a simulation environment, validating the new implementations are properly set on opBNB, and the asset prices don’t change
- **Deployment on testnet**: the same upgrade has been performed on opBNB testnet, and used in the Venus Protocol testnet deployment

#### Audit reports

- [Certik audit audit report](https://github.com/VenusProtocol/oracle/blob/d6497b924d6255db8aa664076b703713296439d0/audits/125_capped_cached_certik_20250430.pdf) (2025/04/30)
- [Quantstamp](https://github.com/VenusProtocol/oracle/blob/d6497b924d6255db8aa664076b703713296439d0/audits/127_capped_cached_quantstamp_20250325.pdf) (2025/03/25)
- [Fairyproof audit report](https://github.com/VenusProtocol/oracle/blob/d6497b924d6255db8aa664076b703713296439d0/audits/126_capped_cached_fairyproof_20250319.pdf) (2025/03/19)

#### Deployed contracts

opBNB mainnet

- [New ResilientOracle implementation](https://opbnbscan.com/address/0xA75688E4F2f9f9a43ccB35ffb0E31376A37c2cAA)
- [New BinanceOracle implementation](https://opbnbscan.com/address/0x05CEE4B936C654be43993D3A8Baa76c8fdd5BeCC)
- [New BoundValidator implementation](https://opbnbscan.com/address/0xe630fa259c893D9a1d8b1d61EdFB1B59EF574df4)

opBNB testnet

- [New ResilientOracle implementation](https://testnet.opbnbscan.com/address/0xAF83f9C9d849B6FF3A33da059Bf14A0E85493eb4)
- [New BinanceOracle implementation](https://testnet.opbnbscan.com/address/0xCFbE7121c4Fb550502854B8c69f88f817D34AaB2)
- [New BoundValidator implementation](https://testnet.opbnbscan.com/address/0x73b615e88fDAe39fb8ED12d0dFeFBCDF5BA0E312)

#### References

- [Capped Oracles and Cached Prices feature](https://github.com/VenusProtocol/oracle/pull/239)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/550)
- [Upgrade on opBNB testnet](https://testnet.opbnbscan.com/tx/0x278a90072c0517dace52eb22072fc23e590a59fa1c58c2a3c46124502eda4c80)
- [Technical article about Capped Oracles](https://docs-v4.venus.io/technical-reference/reference-technical-articles/capped-oracles)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE, RESILIENT_ORACLE_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BINANCE_ORACLE, BINANCE_ORACLE_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR, BOUND_VALIDATOR_IMPLEMENTATION],
        dstChainId: LzChainId.opbnbmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip495;
