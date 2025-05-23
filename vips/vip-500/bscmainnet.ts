import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const RESILIENT_ORACLE_ARBITRUM = "0xd55A98150e0F9f5e3F6280FC25617A5C93d96007";
export const CHAINLINK_ORACLE_ARBITRUM = "0x9cd9Fcc7E3dEDA360de7c080590AaD377ac9F113";
export const REDSTONE_ORACLE_ARBITRUM = "0xF792C4D3BdeF534D6d1dcC305056D00C95453dD6";
export const BOUND_VALIDATOR_ARBITRUM = "0x2245FA2420925Cd3C2D889Ddc5bA1aefEF0E14CF";
export const DEFAULT_PROXY_ADMIN_ARBITRUM = "0xF6fF3e9459227f0cDE8B102b90bE25960317b216";
export const RESILIENT_ORACLE_IMPLEMENTATION_ARBITRUM = "0x6B85803c8a2FE134AC1964879Bafd319E1279ff8";
export const CHAINLINK_ORACLE_IMPLEMENTATION_ARBITRUM = "0x4256f572B8738126466e864D453BCCD0281b3C6C";
export const REDSTONE_ORACLE_IMPLEMENTATION_ARBITRUM = "0x5cfCC7F674DbC64f21E66FdDE921B4467aB79aB2";
export const BOUND_VALIDATOR_IMPLEMENTATION_ARBITRUM = "0x20Fb908a61C000431C4FCb4A51FcB67b73a8A526";
export const weETH_ORACLE_ARBITRUM = "0x0afD33490fBcF537ede00F9Cc4607230bBf65774";
export const weETH_ARBITRUM = "0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe";
export const wstETHOracle_ARBITRUM = "0x17a5596DF05c7bfB2280D5B9cCcDAf711e957Ed4";
export const wstETH_ARBITRUM = "0x5979D7b546E38E414F7E9822514be443A4800529";
export const ACM_ARBITRUM = "0xD9dD18EB0cf10CbA837677f28A8F9Bda4bc2b157";
export const NORMAL_TIMELOCK_ARBITRUM = "0x4b94589Cc23F618687790036726f744D602c4017";
export const FASTTRACK_TIMELOCK_ARBITRUM = "0x2286a9B2a5246218f2fC1F380383f45BDfCE3E04";
export const CRITICAL_TIMELOCK_ARBITRUM = "0x181E4f8F21D087bF02Ea2F64D5e550849FBca674";
export const weETH_Initial_Exchange_Rate = parseUnits("1.067789208571946221", 18);
export const wstETH_Initial_Exchange_Rate = parseUnits("1.203073466794064368", 18);

export const RESILIENT_ORACLE_ZKSYNC = "0xDe564a4C887d5ad315a19a96DC81991c98b12182";
export const CHAINLINK_ORACLE_ZKSYNC = "0x4FC29E1d3fFFbDfbf822F09d20A5BE97e59F66E5";
export const REDSTONE_ORACLE_ZKSYNC = "0xFa1e65e714CDfefDC9729130496AB5b5f3708fdA";
export const BOUND_VALIDATOR_ZKSYNC = "0x51519cdCDDD05E2ADCFA108f4a960755D9d6ea8b";
export const DEFAULT_PROXY_ADMIN_ZKSYNC = "0x8Ea1A989B036f7Ef21bb95CE4E7961522Ca00287";
export const RESILIENT_ORACLE_IMPLEMENTATION_ZKSYNC = "0x9d04692c4f86a5fa52a5dd02F61a9cc9F685B9EB";
export const CHAINLINK_ORACLE_IMPLEMENTATION_ZKSYNC = "0xb20d1B03C62D2c8Dc150298b8D151AF022068347";
export const REDSTONE_ORACLE_IMPLEMENTATION_ZKSYNC = "0x3D45B3025c9Aa5c669B6F625592cd70b5E1F3F87";
export const BOUND_VALIDATOR_IMPLEMENTATION_ZKSYNC = "0xc79fE34320903dA7a19E6335417C7131293844ED";
export const wUSDM_ORACLE_ZKSYNC = "0x22cE94e302c8C80a6C2dCfa9Da6c5286e9f28692";
export const wUSDM_ZKSYNC = "0xA900cbE7739c96D2B153a273953620A701d5442b";
export const wstETHOracle_ZKSYNC = "0x2DAaeb94E19145BA7633cAB2C38c76fD8c493198";
export const wstETH_ZKSYNC = "0x703b52F2b28fEbcB60E1372858AF5b18849FE867";
export const zkETHOracle_ZKSYNC = "0x407dE1229BCBD2Ec876d063F3F93c4D8a38bd81a";
export const zkETH_ZKSYNC = "0xb72207E1FB50f341415999732A20B6D25d8127aa";
export const ACM_ZKSYNC = "0x526159A92A82afE5327d37Ef446b68FD9a5cA914";
export const NORMAL_TIMELOCK_ZKSYNC = "0x093565Bc20AA326F4209eBaF3a26089272627613";
export const FASTTRACK_TIMELOCK_ZKSYNC = "0x32f71c95BC8F9d996f89c642f1a84d06B2484AE9";
export const CRITICAL_TIMELOCK_ZKSYNC = "0xbfbc79D4198963e4a66270F3EfB1fdA0F382E49c";
export const zkETH_Initial_Exchange_Rate = parseUnits("1.011815149704219045", 18);
export const wUSDM_Initial_Exchange_Rate = parseUnits("1.077939040602540747", 18);

export const wSuperOETHb_ORACLE_BASE = "0xcd1d2C99642165440c2CC023AFa2092b487f033e";
export const wSuperOETHb_Initial_Exchange_Rate = parseUnits("1.058792829884507234", 18);

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

export const vip500 = () => {
  const meta = {
    version: "v2",
    title: "VIP-500 [Arbitrum][ZKSync] Capped Oracles and Cached Prices",
    description: `If passed, following the community proposal “[Provide Support for Capped Oracles for Enhanced Security](https://community.venus.io/t/provide-support-for-capped-oracles-for-enhanced-security/5092)” ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xcd64c64eee56e75b56a0a0b84f1ffa2b4ea5fb2be76cca96a155137c46305c07)), this VIP will upgrade the implementations of the following contracts on Arbitrum one and ZKSync Era, including support for Capped Oracles and Cached Prices:

- ResilientOracle
- ChainlinkOracle
- RedStoneOracle
- BoundValidator

Moreover, the oracles for the following assets are updated (following the [Chaos Labs recommendation](https://community.venus.io/t/provide-support-for-capped-oracles-for-enhanced-security/5092/5)):

- [ZKSync Era / zkETH](https://app.venus.io/#/core-pool/market/0xCEb7Da150d16aCE58F090754feF2775C23C8b631?chainId=324): using the [new implementation for the ZkETHOracle](https://github.com/VenusProtocol/oracle/pull/239):
    - Maximum annual growth rate: 7.3%
    - Automatic snapshot period: 30 days (how frequently the reference value to calculate the cap in the price is updated)
    - Automatic snapshot update gap: 0.44% of the current exchange rate
- [ZKSync Era / wUSDM](https://app.venus.io/#/core-pool/market/0x183dE3C349fCf546aAe925E1c7F364EA6FB4033c?chainId=324): using the [new implementation for the ERC4626Oracle](https://github.com/VenusProtocol/oracle/pull/239):
    - Maximum annual growth rate: 6.1%
    - Automatic snapshot period: 30 days
    - Automatic snapshot update gap: 0.49%
- [ZKSync Era / wstETH](https://app.venus.io/#/core-pool/market/0x03CAd66259f7F34EE075f8B62D133563D249eDa4?chainId=324): using the [new implementation for the OneJumpOracle](https://github.com/VenusProtocol/oracle/pull/239)
    - Maximum annual growth rate: 6.7%
    - Automatic snapshot period: 30 days
    - Automatic snapshot update gap: 0.55%
- [Arbitrum one / weETH](https://app.venus.io/#/isolated-pools/pool/0x52bAB1aF7Ff770551BD05b9FC2329a0Bf5E23F16/market/0x246a35E79a3a0618535A469aDaF5091cAA9f7E88?chainId=42161): using the [new implementation for the OneJumpOracle](https://github.com/VenusProtocol/oracle/pull/239)
    - Maximum annual growth rate: 5.3%
    - Automatic snapshot period: 30 days
    - Automatic snapshot update gap: 0.44%
- [Arbitrum one / wstETH](https://app.venus.io/#/lido-market?chainId=42161): using the [new implementation for the OneJumpOracle](https://github.com/VenusProtocol/oracle/pull/239)
    - Maximum annual growth rate: 6.7%
    - Automatic snapshot period: 30 days
    - Automatic snapshot update gap: 0.55%

Finally, the risk parameter “snapshot gap” will be set to 1.11% for the oracle of the [wSuperOETHb market on Base](https://app.venus.io/#/core-pool/market/0x75201D81B3B0b9D17b179118837Be37f64fc4930?chainId=8453), following the [Chaos Labs recommendations](https://community.venus.io/t/provide-support-for-capped-oracles-for-enhanced-security/5092/4). This had to be done in the [VIP-497](https://app.venus.io/#/governance/proposal/497?chainId=56).

#### Description

**Capped Oracles** are a type of price oracle designed to limit the maximum value (or growth) of an asset's reported price to protect against manipulation or sudden volatility.

**Cached Prices** is a new feature integrated into the Venus oracle contracts, that reduces the gas consumed by the functions that collect and return the prices, using [Transient Storage](https://soliditylang.org/blog/2024/01/26/transient-storage/) to cache the prices in the smart contract memory. This VIP doesn’t enable Cached Prices for any market on the affected networks. It only upgrades the oracle contracts to support that feature.

More information about Capped Oracles and Cached Prices:

- [VIP-495 [opBNB] Capped Oracles and Cached Prices](https://app.venus.io/#/governance/proposal/495?chainId=56)
- [Technical article about Capped Oracles](https://docs-v4.venus.io/technical-reference/reference-technical-articles/capped-oracles)

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **Audits:** [Certik](https://www.certik.com/), [Quantstamp](https://quantstamp.com/) and [Fairyproof](https://www.fairyproof.com/) have audited the deployed code
- **VIP execution simulation**: in a simulation environment, validating the new implementations are properly set on Arbitrum one and ZKSync Era, and the asset prices don’t change
- **Deployment on testnet**: the same upgrade has been performed on Arbitrum sepolia and ZKSync sepolia, and used in the Venus Protocol testnet deployment

Permissions are granted to Governance on Arbitrum one and ZKSync Era, to configure the new risk parameters related to Capped oracles.

#### Audit reports

- [Certik audit audit report](https://github.com/VenusProtocol/oracle/blob/d6497b924d6255db8aa664076b703713296439d0/audits/125_capped_cached_certik_20250430.pdf) (2025/04/30)
- [Quantstamp](https://github.com/VenusProtocol/oracle/blob/d6497b924d6255db8aa664076b703713296439d0/audits/127_capped_cached_quantstamp_20250325.pdf) (2025/03/25)
- [Fairyproof audit report](https://github.com/VenusProtocol/oracle/blob/d6497b924d6255db8aa664076b703713296439d0/audits/126_capped_cached_fairyproof_20250319.pdf) (2025/03/19)

#### Deployed contracts

Mainnet

- Arbitrum one
    - [New ResilientOracle implementation](https://arbiscan.io/address/0x6B85803c8a2FE134AC1964879Bafd319E1279ff8)
    - [New ChainlinkOracle implementation](https://arbiscan.io/address/0x4256f572B8738126466e864D453BCCD0281b3C6C)
    - [New RedStoneOracle implementation](https://arbiscan.io/address/0x5cfCC7F674DbC64f21E66FdDE921B4467aB79aB2)
    - [New BoundValidator implementation](https://arbiscan.io/address/0x20Fb908a61C000431C4FCb4A51FcB67b73a8A526)
    - [New oracle for weETH](https://arbiscan.io/address/0x0afD33490fBcF537ede00F9Cc4607230bBf65774)
    - [New oracle for wstETH](https://arbiscan.io/address/0x17a5596DF05c7bfB2280D5B9cCcDAf711e957Ed4)
- ZKSync Era
    - [New ResilientOracle implementation](https://explorer.zksync.io/address/0x9d04692c4f86a5fa52a5dd02F61a9cc9F685B9EB)
    - [New ChainlinkOracle implementation](https://explorer.zksync.io/address/0xb20d1B03C62D2c8Dc150298b8D151AF022068347)
    - [New RedStoneOracle implementation](https://explorer.zksync.io/address/0x3D45B3025c9Aa5c669B6F625592cd70b5E1F3F87)
    - [New BoundValidator implementation](https://explorer.zksync.io/address/0xc79fE34320903dA7a19E6335417C7131293844ED)
    - [New oracle for zkETH](https://explorer.zksync.io/address/0x407dE1229BCBD2Ec876d063F3F93c4D8a38bd81a)
    - [New oracle for wUSDM](https://sepolia.explorer.zksync.io/address/0x22cE94e302c8C80a6C2dCfa9Da6c5286e9f28692)
    - [New oracle for wstETH](https://sepolia.explorer.zksync.io/address/0x2DAaeb94E19145BA7633cAB2C38c76fD8c493198)

Testnet

- Arbitrum one
    - [New ResilientOracle implementation](https://sepolia.arbiscan.io/address/0x992127c0cd1af5c0Ae40995193ac1adA752C12a8)
    - [New ChainlinkOracle implementation](https://sepolia.arbiscan.io/address/0xc8614663Cc4ee868EF5267891E177586d7105D7F)
    - [New RedStoneOracle implementation](https://sepolia.arbiscan.io/address/0xbDd501dB1B0D6aab299CE69ef5B86C8578947AD0)
    - [New BoundValidator implementation](https://sepolia.arbiscan.io/address/0x2Ec432F123FEbb114e6fbf9f4F14baF0B1F14AbC)
    - [New oracle for weETH](https://sepolia.arbiscan.io/address/0x0E2a7C58e06d4924EF74fb14222aa087ECfc14D5)
    - [New oracle for wstETH](https://sepolia.arbiscan.io/address/0xFfc4869368a3954A1b933AC94471f12B7e83C24a)
- ZKSync Era
    - [New ResilientOracle implementation](https://sepolia.explorer.zksync.io/address/0x4eE2399B57796A94644E1dFb5e4751FaCbE05c2E)
    - [New ChainlinkOracle implementation](https://sepolia.explorer.zksync.io/address/0x58d8a589c111161dBb22742BF00671BEa1e32994)
    - [New RedStoneOracle implementation](https://sepolia.explorer.zksync.io/address/0x04D8444A4aDbE4697B2Ba6Dd7Cd174bf5a37098c)
    - [New BoundValidator implementation](https://sepolia.explorer.zksync.io/address/0x66e6744104fAa55C14A6CD356eF1016E50B907df)
    - [New oracle for zkETH](https://sepolia.explorer.zksync.io/address/0x4C7cA0B8A23d6ff73D7dd1f74096D25628f90348)
    - [New oracle for wUSDM](https://sepolia.explorer.zksync.io/address/0xBd09B8f1cD699F97d2c4387Fb6eA87853cF2A144)
    - [New oracle for wstETH](https://sepolia.explorer.zksync.io/address/0xE454a8795b0077C656B4a2B4C0e72C1f3959CfCA)

#### References

- [Capped Oracles and Cached Prices feature](https://github.com/VenusProtocol/oracle/pull/239)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/557)
- Upgrades on testnets
    - [Arbitrum Sepolia](https://sepolia.arbiscan.io/tx/0x2c75e291c0c2f790c99b09c0492b2ddd51ec0be472dc54f5941090f4f700ac89)
    - [ZKSync Sepolia](https://sepolia.explorer.zksync.io/tx/0x3098c181c0cad0b87e5d2930f3a228c6d95d3528858d4a39f2fd52ffff63a85b)
- [Technical article about Capped Oracles](https://docs-v4.venus.io/technical-reference/reference-technical-articles/capped-oracles)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: wSuperOETHb_ORACLE_BASE,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(wSuperOETHb_Initial_Exchange_Rate, 111)],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_ARBITRUM,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE_ARBITRUM, RESILIENT_ORACLE_IMPLEMENTATION_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: DEFAULT_PROXY_ADMIN_ARBITRUM,
        signature: "upgrade(address,address)",
        params: [CHAINLINK_ORACLE_ARBITRUM, CHAINLINK_ORACLE_IMPLEMENTATION_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: DEFAULT_PROXY_ADMIN_ARBITRUM,
        signature: "upgrade(address,address)",
        params: [REDSTONE_ORACLE_ARBITRUM, REDSTONE_ORACLE_IMPLEMENTATION_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: DEFAULT_PROXY_ADMIN_ARBITRUM,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR_ARBITRUM, BOUND_VALIDATOR_IMPLEMENTATION_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", NORMAL_TIMELOCK_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", NORMAL_TIMELOCK_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", NORMAL_TIMELOCK_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", CRITICAL_TIMELOCK_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", CRITICAL_TIMELOCK_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", CRITICAL_TIMELOCK_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", FASTTRACK_TIMELOCK_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", FASTTRACK_TIMELOCK_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ACM_ARBITRUM,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", FASTTRACK_TIMELOCK_ARBITRUM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: weETH_ORACLE_ARBITRUM,
        signature: "setSnapshot(uint256,uint256)",
        params: [increaseExchangeRateByPercentage(weETH_Initial_Exchange_Rate, BigNumber.from("44")), 1747682525],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: weETH_ORACLE_ARBITRUM,
        signature: "setGrowthRate(uint256,uint256)",
        params: [parseUnits("0.053", 18), DAYS_30],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: weETH_ORACLE_ARBITRUM,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(weETH_Initial_Exchange_Rate, 44)],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: RESILIENT_ORACLE_ARBITRUM,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            weETH_ARBITRUM,
            [weETH_ORACLE_ARBITRUM, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: wstETHOracle_ARBITRUM,
        signature: "setSnapshot(uint256,uint256)",
        params: [increaseExchangeRateByPercentage(wstETH_Initial_Exchange_Rate, BigNumber.from("55")), 1747682525],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: wstETHOracle_ARBITRUM,
        signature: "setGrowthRate(uint256,uint256)",
        params: [parseUnits("0.067", 18), DAYS_30],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: wstETHOracle_ARBITRUM,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(wstETH_Initial_Exchange_Rate, 55)],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: RESILIENT_ORACLE_ARBITRUM,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            wstETH_ARBITRUM,
            [wstETHOracle_ARBITRUM, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.arbitrumone,
      },

      {
        target: DEFAULT_PROXY_ADMIN_ZKSYNC,
        signature: "upgrade(address,address)",
        params: [RESILIENT_ORACLE_ZKSYNC, RESILIENT_ORACLE_IMPLEMENTATION_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_ZKSYNC,
        signature: "upgrade(address,address)",
        params: [CHAINLINK_ORACLE_ZKSYNC, CHAINLINK_ORACLE_IMPLEMENTATION_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_ZKSYNC,
        signature: "upgrade(address,address)",
        params: [REDSTONE_ORACLE_ZKSYNC, REDSTONE_ORACLE_IMPLEMENTATION_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: DEFAULT_PROXY_ADMIN_ZKSYNC,
        signature: "upgrade(address,address)",
        params: [BOUND_VALIDATOR_ZKSYNC, BOUND_VALIDATOR_IMPLEMENTATION_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", NORMAL_TIMELOCK_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", NORMAL_TIMELOCK_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", NORMAL_TIMELOCK_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", CRITICAL_TIMELOCK_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", CRITICAL_TIMELOCK_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", CRITICAL_TIMELOCK_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshot(uint256,uint256)", FASTTRACK_TIMELOCK_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setGrowthRate(uint256,uint256)", FASTTRACK_TIMELOCK_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: ACM_ZKSYNC,
        signature: "giveCallPermission(address,string,address)",
        params: [ethers.constants.AddressZero, "setSnapshotGap(uint256)", FASTTRACK_TIMELOCK_ZKSYNC],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: wUSDM_ORACLE_ZKSYNC,
        signature: "setSnapshot(uint256,uint256)",
        params: [increaseExchangeRateByPercentage(wUSDM_Initial_Exchange_Rate, BigNumber.from("49")), 1746787630],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: wUSDM_ORACLE_ZKSYNC,
        signature: "setGrowthRate(uint256,uint256)",
        params: [parseUnits("0.061", 18), DAYS_30],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: wUSDM_ORACLE_ZKSYNC,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(wUSDM_Initial_Exchange_Rate, 49)],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: RESILIENT_ORACLE_ZKSYNC,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            wUSDM_ZKSYNC,
            [wUSDM_ORACLE_ZKSYNC, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: wstETHOracle_ZKSYNC,
        signature: "setSnapshot(uint256,uint256)",
        params: [increaseExchangeRateByPercentage(wstETH_Initial_Exchange_Rate, BigNumber.from("55")), 1747682525],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: wstETHOracle_ZKSYNC,
        signature: "setGrowthRate(uint256,uint256)",
        params: [parseUnits("0.067", 18), DAYS_30],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: wstETHOracle_ZKSYNC,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(wstETH_Initial_Exchange_Rate, 55)],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: RESILIENT_ORACLE_ZKSYNC,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            wstETH_ZKSYNC,
            [wstETHOracle_ZKSYNC, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: zkETHOracle_ZKSYNC,
        signature: "setSnapshot(uint256,uint256)",
        params: [increaseExchangeRateByPercentage(zkETH_Initial_Exchange_Rate, BigNumber.from("44")), 1746787651],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: zkETHOracle_ZKSYNC,
        signature: "setGrowthRate(uint256,uint256)",
        params: [parseUnits("0.073", 18), DAYS_30],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: zkETHOracle_ZKSYNC,
        signature: "setSnapshotGap(uint256)",
        params: [getSnapshotGap(zkETH_Initial_Exchange_Rate, 44)],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: RESILIENT_ORACLE_ZKSYNC,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [
          [
            zkETH_ZKSYNC,
            [zkETHOracle_ZKSYNC, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
            false,
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip500;
