import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const pufETH = "0xD9A442856C234a39a81a089C06451EBAa4306a72";
export const pufETHOracle = "0x4fCbfE445396f31005b3Fd2F6DE2A986d6E2dCB5";
export const ezETH_Chainlink_Oracle = "0x84FAe9909Fa1F259CB23Fa14FCdd1a35A0FE7EB8";
export const ezETH_Redstone_Oracle = "0xA6efeF98D9C4E9FF8193f80FbABF92AD92D50500";
export const ezETH = "0xbf5495Efe5DB9ce00f80364C8B423567e58d2110";
export const weETHsOracle = "0x47F7A7f3486b08A019E0c10Af969ADC4B6E415Cd";
export const weETHs = "0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88";
export const PTweETHOracle = "0xB89C0F93442C269271cB4e9Acd10E81D3fC237Ba";
export const PTweETH = "0x6ee2b5E19ECBa773a352E5B21415Dc419A700d1d";
export const weETH_ORACLE = "0xaB663D4a701229DFF407Eb4B45007921029072e9";
export const weETH = "0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee";
export const PTUSDeOracle = "0x4CD93DcD2E11835D06a45F7eF9F7225C249Bb6Db";
export const PTUSDe = "0x8A47b431A7D947c6a3ED6E42d501803615a97EAa";
export const PTsUSDeOracle = "0x51B83bbbdCa078b2497C41c9f54616D1aDBEF86F";
export const PTsUSDe = "0xE00bd3Df25fb187d6ABBB620b3dfd19839947b81";
export const sUSDeOracle = "0xaE847E81ff6dD2bdFB1fD563ccB4f848c74D2B70";
export const sUSDe = "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497";

export const DAYS_30 = 30 * 24 * 60 * 60;
export const increaseExchangeRateByPercentage = (
  exchangeRate: BigNumber,
  percentage: BigNumber, // BPS value (e.g., 10000 for 100%)
) => {
  const increaseAmount = exchangeRate.mul(percentage).div(10000);
  return exchangeRate.add(increaseAmount).toString();
};
export const getSnapshotGap = (
  exchangeRate: BigNumber,
  percentage: number, // BPS value (e.g., 10000 for 100%)
) => {
  // snapshot gap is percentage of the exchange rate
  const snapshotGap = exchangeRate.mul(percentage).div(10000);
  return snapshotGap.toString();
};

export const SECONDS_PER_YEAR = 31536000;
export const pufETH_InitialExchangeRate = parseUnits("1.049459890000000000", 18);
export const pufETH_Timestamp = 1749194547;
export const pufETH_GrowthRate = parseUnits("0.2231", 18); // 22.31%
export const pufETH_SnapshotGap = 185; // 1.85%
export const ezETH_Chainlink_InitialExchangeRate = parseUnits("1.050652627323072300", 18);
export const ezETH_Chainlink_Timestamp = 1749194547;
export const ezETH_Redstone_InitialExchangeRate = parseUnits("1.051864420000000000", 18);
export const ezETH_Redstone_Timestamp = 1749194547;
export const ezETH_GrowthRate = parseUnits("0.2351", 18); // 23.51%
export const ezETH_SnapshotGap = 196; // 1.96%
export const weETHs_InitialExchangeRate = parseUnits("1.027372657437767620", 18);
export const weETHs_Timestamp = 1749194547;
export const weETHs_GrowthRate = parseUnits("0.0452", 18); // 4.52%
export const weETHs_SnapshotGap = 38; // 0.38%
export const PTweETH_InitialExchangeRate = parseUnits("1.000000000000000000", 18);
export const PTweETH_Timestamp = 1749194547;
export const PTweETH_GrowthRate = SECONDS_PER_YEAR; // 0%
export const PTweETH_SnapshotGap = 400; // 4.00%
export const weETH_InitialExchangeRate = parseUnits("1.069206722806712756", 18);
export const weETH_Timestamp = 1749194547;
export const weETH_GrowthRate = parseUnits("0.053", 18); // 5.3%
export const weETH_SnapshotGap = 44; // 0.44%
export const PTUSDe_InitialExchangeRate = parseUnits("1", 18);
export const PTUSDe_Timestamp = 1749194547;
export const PTUSDe_GrowthRate = SECONDS_PER_YEAR; // 0%
export const PTUSDe_SnapshotGap = 400; // 4.00%
export const PTsUSDe_InitialExchangeRate = parseUnits("1", 18);
export const PTsUSDe_Timestamp = 1749194547;
export const PTsUSDe_GrowthRate = SECONDS_PER_YEAR; // 0%
export const PTsUSDe_SnapshotGap = 400; // 4.00%
export const sUSDe_InitialExchangeRate = parseUnits("1.176209554338116464", 18);
export const sUSDe_Timestamp = 1749194547;
export const sUSDe_GrowthRate = parseUnits("0.2827", 18); // 28.27%
export const sUSDe_SnapshotGap = 236; // 2.36%

export const vip511 = () => {
  const meta = {
    version: "v2",
    title: "VIP-511 [Ethereum] Capped Oracles and Cached Prices (2/2)",
    description: `#### Summary

If passed, following the community proposal “[Provide Support for Capped Oracles for Enhanced Security](https://community.venus.io/t/provide-support-for-capped-oracles-for-enhanced-security/5092)” ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xcd64c64eee56e75b56a0a0b84f1ffa2b4ea5fb2be76cca96a155137c46305c07)), this VIP will configure the caps on the prices for the following assets on Ethereum (following the [Chaos Labs recommendation](https://community.venus.io/t/provide-support-for-capped-oracles-for-enhanced-security/5092/8)):

- [ezETH](https://etherscan.io/address/0xbf5495Efe5DB9ce00f80364C8B423567e58d2110)
    - Maximum annual growth rate: 23.51%
    - Automatic snapshot period: 30 days (how frequently the reference value to calculate the cap in the price is updated)
    - Automatic snapshot update gap: 1.96% of the current exchange rate
- [pufETH](https://etherscan.io/address/0xD9A442856C234a39a81a089C06451EBAa4306a72)
    - Maximum annual growth rate: 22.31%
    - Automatic snapshot period: 30 days
    - Automatic snapshot update gap: 1.85%
- [sUSDe](https://etherscan.io/address/0x9D39A5DE30e57443BfF2A8307A4256c8797A3497)
    - Maximum annual growth rate: 28.27%
    - Automatic snapshot period: 30 days
    - Automatic snapshot update gap: 2.36%
- [PT-sUSDe-27MAR2025](https://etherscan.io/address/0xE00bd3Df25fb187d6ABBB620b3dfd19839947b81), [PT-USDe-27MAR2025](https://etherscan.io/address/0x8A47b431A7D947c6a3ED6E42d501803615a97EAa) and [PT-weETH-DEC24](https://etherscan.io/address/0x6ee2b5e19ecba773a352e5b21415dc419a700d1d)
    - Maximum annual growth rate: 0.00%
    - Automatic snapshot period: 30 days
    - Automatic snapshot update gap: 4.00%
- [weETHs](https://etherscan.io/address/0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88)
    - Maximum annual growth rate: 4.52%
    - Automatic snapshot period: 30 days
    - Automatic snapshot update gap: 0.38%
- [weETH](https://etherscan.io/address/0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee)
    - Maximum annual growth rate: 5.3%
    - Automatic snapshot period: 30 days
    - Automatic snapshot update gap: 0.44%

For [wstETH](https://etherscan.io/address/0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0), a new contract supporting caps will be configured in an upcoming VIP.

#### Description

**Capped Oracles** are a type of price oracle designed to limit the maximum value (or growth) of an asset's reported price to protect against manipulation or sudden volatility.

**Cached Prices** is a new feature integrated into the Venus oracle contracts, that reduces the gas consumed by the functions that collect and return the prices, using [Transient Storage](https://soliditylang.org/blog/2024/01/26/transient-storage/) to cache the prices in the smart contract memory. This VIP doesn’t enable Cached Prices for any market on the affected networks. It only upgrades the oracle contracts to support that feature.

More information about Capped Oracles and Cached Prices:

- [VIP-495 [opBNB] Capped Oracles and Cached Prices](https://app.venus.io/#/governance/proposal/495?chainId=56)
- [VIP-497 [Base][Optimism][Unichain] Capped Oracles and Cached Prices](https://app.venus.io/#/governance/proposal/497?chainId=56)
- [VIP-500 [Arbitrum][ZKSync] Capped Oracles and Cached Prices](https://app.venus.io/#/governance/proposal/500?chainId=56)
- [VIP-506 [Ethereum] Capped Oracles and Cached Prices (1/2)](https://app.venus.io/#/governance/proposal/506?chainId=56)
- [Technical article about Capped Oracles](https://docs-v4.venus.io/technical-reference/reference-technical-articles/capped-oracles)

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits**: [Certik](https://www.certik.com/), [Quantstamp](https://quantstamp.com/) and [Fairyproof](https://www.fairyproof.com/) have audited the deployed code
- **VIP execution simulation**: in a simulation environment, validating the new caps are properly set on Ethereum, and the asset prices don’t change
- **Deployment on testnet**: the same change has been performed on Sepolia, and used in the Venus Protocol testnet deployment

#### Audit reports

- [Certik audit audit report](https://github.com/VenusProtocol/oracle/blob/d6497b924d6255db8aa664076b703713296439d0/audits/125_capped_cached_certik_20250430.pdf) (2025/04/30)
- [Quantstamp](https://github.com/VenusProtocol/oracle/blob/d6497b924d6255db8aa664076b703713296439d0/audits/127_capped_cached_quantstamp_20250325.pdf) (2025/03/25)
- [Fairyproof audit report](https://github.com/VenusProtocol/oracle/blob/d6497b924d6255db8aa664076b703713296439d0/audits/126_capped_cached_fairyproof_20250319.pdf) (2025/03/19)

#### References

- [Capped Oracles and Cached Prices feature](https://github.com/VenusProtocol/oracle/pull/239)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/571)
- [VIP execution on Sepolia](https://sepolia.etherscan.io/tx/0xa041c8883c9d4c6540690379dd8ad869e8bc1bb76f725af7f0e2a48d2dc96c23)
- [Technical article about Capped Oracles](https://docs-v4.venus.io/technical-reference/reference-technical-articles/capped-oracles)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: pufETHOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(pufETH_InitialExchangeRate, BigNumber.from(pufETH_SnapshotGap)),
          pufETH_Timestamp,
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: pufETHOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [pufETH_GrowthRate, DAYS_30],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: pufETHOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(pufETH_InitialExchangeRate, pufETH_SnapshotGap)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ezETH_Chainlink_Oracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(ezETH_Chainlink_InitialExchangeRate, BigNumber.from(ezETH_SnapshotGap)),
          ezETH_Chainlink_Timestamp,
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ezETH_Chainlink_Oracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [ezETH_GrowthRate, DAYS_30],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ezETH_Chainlink_Oracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(ezETH_Chainlink_InitialExchangeRate, ezETH_SnapshotGap)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ezETH_Redstone_Oracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(ezETH_Redstone_InitialExchangeRate, BigNumber.from(ezETH_SnapshotGap)),
          ezETH_Redstone_Timestamp,
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ezETH_Redstone_Oracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [ezETH_GrowthRate, DAYS_30],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ezETH_Redstone_Oracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(ezETH_Redstone_InitialExchangeRate, ezETH_SnapshotGap)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: weETHsOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(weETHs_InitialExchangeRate, BigNumber.from(weETHs_SnapshotGap)),
          weETHs_Timestamp,
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: weETHsOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [weETHs_GrowthRate, DAYS_30],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: weETHsOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(weETHs_InitialExchangeRate, weETHs_SnapshotGap)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PTweETHOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(PTweETH_InitialExchangeRate, BigNumber.from(PTweETH_SnapshotGap)),
          PTweETH_Timestamp,
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PTweETHOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [PTweETH_GrowthRate, DAYS_30],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PTweETHOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(PTweETH_InitialExchangeRate, PTweETH_SnapshotGap)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: weETH_ORACLE,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(weETH_InitialExchangeRate, BigNumber.from(weETH_SnapshotGap)),
          weETH_Timestamp,
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: weETH_ORACLE,
        signature: "setGrowthRate(uint256,uint256)",
        params: [weETH_GrowthRate, DAYS_30],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: weETH_ORACLE,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(weETH_InitialExchangeRate, weETH_SnapshotGap)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PTUSDeOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(PTUSDe_InitialExchangeRate, BigNumber.from(PTUSDe_SnapshotGap)),
          PTUSDe_Timestamp,
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PTUSDeOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [PTUSDe_GrowthRate, DAYS_30],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PTUSDeOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(PTUSDe_InitialExchangeRate, PTUSDe_SnapshotGap)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PTsUSDeOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(PTsUSDe_InitialExchangeRate, BigNumber.from(PTsUSDe_SnapshotGap)),
          PTsUSDe_Timestamp,
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PTsUSDeOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [PTsUSDe_GrowthRate, DAYS_30],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: PTsUSDeOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(PTsUSDe_InitialExchangeRate, PTsUSDe_SnapshotGap)],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: sUSDeOracle,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(sUSDe_InitialExchangeRate, BigNumber.from(sUSDe_SnapshotGap)),
          sUSDe_Timestamp,
        ],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: sUSDeOracle,
        signature: "setGrowthRate(uint256,uint256)",
        params: [sUSDe_GrowthRate, DAYS_30],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: sUSDeOracle,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(sUSDe_InitialExchangeRate, sUSDe_SnapshotGap)],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip511;
