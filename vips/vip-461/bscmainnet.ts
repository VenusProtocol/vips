import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const NETWORK_ADDRESSES_BASE = NETWORK_ADDRESSES["basemainnet"];
const NETWORK_ADDRESSES_ZKSYNC = NETWORK_ADDRESSES["zksyncmainnet"];

export const COMPTROLLER_CORE_BASE = "0x0C7973F9598AA62f9e03B94E92C967fD5437426C";
export const COMPTROLLER_CORE_ZKSYNC = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
export const CHAINLINK_STALE_PERIOD = 60 * 60 * 26; // 26 Hours
export const CHAINLINK_WSTETH_FEED_BASE = "0xB88BAc61a4Ca37C43a3725912B1f472c9A5bc061";
export const CHAINLINK_WSTETH_FEED_ZKSYNC = "0x24a0C9404101A8d7497676BE12F10aEa356bAC28";
export const WETH_ADDRESS_BASE = "0x4200000000000000000000000000000000000006";
export const wstETH_ONE_JUMP_ORACLE_BASE = "0x007e6Bd6993892b39210a7116506D6eA417B7565";
export const wstETH_ONE_JUMP_ORACLE_ZKSYNC = "0xd2b4352A3C1C452D9D4D11B4F19e28476128798f";
export const vTokenReceiverWstETH_BASE = "0x5A9d695c518e95CD6Ea101f2f25fC2AE18486A61";
export const vTokenReceiverWstETH_ZKSYNC = "0x65B05f4fCa066316383b0FE196C76C873a4dFD02";
type Token = {
  address: string;
  decimals: number;
  symbol: string;
};

type Market = {
  vToken: {
    address: string;
    name: string;
    symbol: string;
    underlying: Token;
    decimals: number;
    exchangeRate: BigNumber;
    comptroller: string;
  };
  riskParameters: {
    collateralFactor: BigNumber;
    liquidationThreshold: BigNumber;
    supplyCap: BigNumber;
    borrowCap: BigNumber;
    reserveFactor: BigNumber;
    protocolSeizeShare: BigNumber;
  };
  initialSupply: {
    amount: BigNumber;
    vTokensToBurn: BigNumber;
    vTokenReceiver: string;
  };
  interestRateModel: {
    address: string;
    base: string;
    multiplier: string;
    jump: string;
    kink: string;
  };
};

// Core Pool configuration BASE
export const token_BASE = {
  address: "0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452",
  decimals: 18,
  symbol: "wstETH",
};

// Core Pool configuration ZKSYNC
export const token_ZKSYNC = {
  wstETH: {
    address: "0x703b52F2b28fEbcB60E1372858AF5b18849FE867",
    decimals: 18,
    symbol: "wstETH",
  },
  WETH: {
    address: "0x5aea5775959fbc2557cc8789bc1bf90a239d9a91",
    decimals: 18,
    symbol: "WETH",
  },
};

export const zksyncMarket: Market = {
  vToken: {
    address: "0x03CAd66259f7F34EE075f8B62D133563D249eDa4",
    name: "Venus wstETH (Core)",
    symbol: "vwstETH_Core",
    underlying: token_ZKSYNC["wstETH"],
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE_ZKSYNC,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.71", 18),
    liquidationThreshold: parseUnits("0.76", 18),
    supplyCap: parseUnits("350", 18),
    borrowCap: parseUnits("35", 18),
    reserveFactor: parseUnits("0.25", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("2.5", 18),
    vTokenReceiver: vTokenReceiverWstETH_ZKSYNC,
    vTokensToBurn: parseUnits("0.0037", 8), // Approximately $10
  },
  interestRateModel: {
    address: "0x42053cb8Ee2cBbfCEDF423C79A50CF56c9C9424f",
    base: "0",
    multiplier: "0.09",
    jump: "3",
    kink: "0.45",
  },
};

export const baseMarket: Market = {
  vToken: {
    address: "0x133d3BCD77158D125B75A17Cb517fFD4B4BE64C5",
    name: "Venus wstETH (Core)",
    symbol: "vwstETH_Core",
    underlying: token_BASE,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE_BASE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.785", 18),
    liquidationThreshold: parseUnits("0.81", 18),
    supplyCap: parseUnits("2600", 18),
    borrowCap: parseUnits("260", 18),
    reserveFactor: parseUnits("0.25", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("2.5", 18),
    vTokensToBurn: parseUnits("0.0037", 8),
    vTokenReceiver: vTokenReceiverWstETH_BASE,
  },
  interestRateModel: {
    address: "0x527c29aAfB367fAd5AFf97855EBFAa610AA514CA",
    base: "0",
    multiplier: "0.09",
    jump: "3",
    kink: "0.45",
  },
};

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

const vip454 = (overrides: { chainlinkStalePeriod?: number }) => {
  const meta = {
    version: "v2",
    title: "VIP-461 [Base][ZKsync] New wstETH markets in the Core pool",
    description: `#### Summary

If passed, this VIP will add the wstETH market to the Core pool on [Base](https://basescan.org/address/0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452) and [ZKsync Era](https://explorer.zksync.io/address/0x703b52f2b28febcb60e1372858af5b18849fe867), following the Community proposals:

- [wstETH as collateral on Venus Protocol BASE Core Pool](https://community.venus.io/t/wsteth-as-collateral-on-venus-protocol-base-core-pool/4746) ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x3f39a2b42358f0715ce06bf3ddc837c3312db437827ba74d0985f72fb63735a8))
- [List Lido wstETH on ZKSync Core Pool](https://community.venus.io/t/list-lido-wsteth-on-zksync-core-pool/4842) ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x2f82e79a40cdea9a0aa561c1f07e8fd48d528a27cccf8d976e897fe33807e51f))

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/wsteth-as-collateral-on-venus-protocol-base-core-pool/4746/12), the risk parameters for the new market on Base are:

Underlying token: [wstETH](https://basescan.org/address/0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452)

- Borrow cap: 260 wstETH
- Supply cap: 2,600 wstETH
- Collateral factor: 78.5%
- Liquidation threshold: 81%
- Reserve factor: 25%

Bootstrap liquidity: 2.5 wstETH, provided by the [Lido project](https://basescan.org/address/0x5a9d695c518e95cd6ea101f2f25fc2ae18486a61)

Following [Chaos Labs recommendations](https://community.venus.io/t/wsteth-as-collateral-on-venus-protocol-base-core-pool/4746/12), the risk parameters for the new market on ZKsync Era are:

Underlying token: [wstETH](https://explorer.zksync.io/address/0x703b52f2b28febcb60e1372858af5b18849fe867)

- Borrow cap: 35 wstETH
- Supply cap: 350 wstETH
- Collateral factor: 71%
- Liquidation threshold: 76%
- Reserve factor: 25%

Bootstrap liquidity: 2.5 wstETH, provided by the [Lido project](https://explorer.zksync.io/address/0x65B05f4fCa066316383b0FE196C76C873a4dFD02)

Interest rate curves for the new markets are:

- kink: 45%
- base (yearly): 0%
- multiplier (yearly): 9%
- jump multiplier (yearly): 300%

**Oracles configuration**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Base](https://basescan.org/address/0xcBBf58bD5bAdE357b634419B70b215D5E9d6FbeD) is used for wstETH on Base, and the ResilientOracle deployed to [ZKsync Era](https://explorer.zksync.io/address/0xDe564a4C887d5ad315a19a96DC81991c98b12182) is used for wstETH on ZKsync Era, with the following configuration. The OneJumpOracle is used to get the USD price of wstETH in both cases, first getting the conversion rate wstETH/stETH using the feeds from Chainlink, and then getting the USD price using the Chainlink price feed for ETH/USD.

- MAIN oracle for wstETH on Base
    - Contract: [OneJumpOracle](https://basescan.org/address/0x007e6Bd6993892b39210a7116506D6eA417B7565)
    - CORRELATED_TOKEN: [wstETH](https://basescan.org/address/0xc1CBa3fCea344f92D9239c08C0568f6F2F0ee452)
    - UNDERLYING_TOKEN: [WETH](https://basescan.org/address/0x4200000000000000000000000000000000000006) (assuming 1 stETH is equal to 1 ETH)
    - INTERMEDIATE_ORACLE: [ChainlinkOracle](https://basescan.org/address/0x6F2eA73597955DB37d7C06e1319F0dC7C7455dEb), using its price feed [wstETH/stETH](https://basescan.org/address/0xB88BAc61a4Ca37C43a3725912B1f472c9A5bc061)
- MAIN oracle for wstETH on ZKsync Era
    - Contract: [OneJumpOracle](https://explorer.zksync.io/address/0xd2b4352A3C1C452D9D4D11B4F19e28476128798f)
    - CORRELATED_TOKEN: [wstETH](https://explorer.zksync.io/address/0x703b52f2b28febcb60e1372858af5b18849fe867)
    - UNDERLYING_TOKEN: [WETH](https://explorer.zksync.io/address/0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91) (assuming 1 stETH is equal to 1 ETH)
    - INTERMEDIATE_ORACLE: [ChainlinkOracle](https://explorer.zksync.io/address/0x4FC29E1d3fFFbDfbf822F09d20A5BE97e59F66E5), using its price feed [wstETH/stETH](https://explorer.zksync.io/address/0x24a0C9404101A8d7497676BE12F10aEa356bAC28)

#### Security and additional considerations

We applied the following security procedures for this VIP:

- **Audit**: Certik, Peckshield, Hacken and Code4rena have audited the market code.
- **VIP execution simulation**: in a simulation environment, validating the new markets are properly added to the Core pool on Base and ZKsync Era, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to Base Sepolia and ZKsync Sepolia, and used in the Venus Protocol testnet deployment

#### Audit reports

- [Certik audit report](https://github.com/VenusProtocol/oracle/blob/93a79c97e867f61652fc063abb5df323acc9bed4/audits/116_WeETHAccountantOracle_certik_20240823.pdf) (2024/08/23)
- [Certik audit report](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/036_isolatedPools_certik_20230619.pdf) (2023/June/19)
- [Code4rena contest](https://code4rena.com/contests/2023-05-venus-protocol-isolated-pools) (2023/May/05)
- [Hacken audit report](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/016_isolatedPools_hacken_20230426.pdf) (2023/April/26)
- [Peckshield audit report 1](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/003_isolatedPools_peckshield_20230112.pdf) (2023/January/12)
- [Peckshield audit report 2](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/037_isolatedPools_peckshield_20230625.pdf) (2023/June/25)

#### Deployed contracts

- Base
    - Mainnet vwstETH_Core: [0x133d3BCD77158D125B75A17Cb517fFD4B4BE64C5](https://basescan.org/address/0x133d3BCD77158D125B75A17Cb517fFD4B4BE64C5)
    - Sepolia vwstETH_Core: [0x40A30E1B01e0CF3eE3F22f769b0E437160550eEa](https://sepolia.basescan.org/address/0x40A30E1B01e0CF3eE3F22f769b0E437160550eEa)
- ZKsync
    - Era vwstETH_Core: [0x03CAd66259f7F34EE075f8B62D133563D249eDa4](https://explorer.zksync.io/address/0x03CAd66259f7F34EE075f8B62D133563D249eDa4)
    - Sepolia vwstETH_Core: [0x853ed4e6ab3a6747d71Bb79eDbc0A64FF87D31BF](https://sepolia.explorer.zksync.io/address/0x853ed4e6ab3a6747d71Bb79eDbc0A64FF87D31BF)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/506)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };
  const chainlinkStalePeriod = overrides?.chainlinkStalePeriod || CHAINLINK_STALE_PERIOD;
  return makeProposal(
    [
      // BASE PROPOSAL
      {
        target: NETWORK_ADDRESSES_BASE["CHAINLINK_ORACLE"],
        signature: "setTokenConfig((address,address,uint256))",
        params: [[baseMarket.vToken.underlying.address, CHAINLINK_WSTETH_FEED_BASE, chainlinkStalePeriod]],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: NETWORK_ADDRESSES_BASE["RESILIENT_ORACLE"],
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            baseMarket.vToken.underlying.address,
            [wstETH_ONE_JUMP_ORACLE_BASE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: baseMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: NETWORK_ADDRESSES_BASE["VTREASURY"],
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [
          baseMarket.vToken.underlying.address,
          baseMarket.initialSupply.amount,
          NETWORK_ADDRESSES_BASE["NORMAL_TIMELOCK"],
        ],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: baseMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [NETWORK_ADDRESSES_BASE["POOL_REGISTRY"], baseMarket.initialSupply.amount],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: NETWORK_ADDRESSES_BASE["POOL_REGISTRY"],
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            baseMarket.vToken.address,
            baseMarket.riskParameters.collateralFactor,
            baseMarket.riskParameters.liquidationThreshold,
            baseMarket.initialSupply.amount,
            NETWORK_ADDRESSES_BASE["NORMAL_TIMELOCK"],
            baseMarket.riskParameters.supplyCap,
            baseMarket.riskParameters.borrowCap,
          ],
        ],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: baseMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [NETWORK_ADDRESSES_BASE["POOL_REGISTRY"], 0],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: baseMarket.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, baseMarket.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.basemainnet,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(baseMarket.initialSupply.amount, baseMarket.vToken.exchangeRate);
        const vTokensRemaining = vTokensMinted.sub(baseMarket.initialSupply.vTokensToBurn);
        return {
          target: baseMarket.vToken.address,
          signature: "transfer(address,uint256)",
          params: [baseMarket.initialSupply.vTokenReceiver, vTokensRemaining],
          dstChainId: LzChainId.basemainnet,
        };
      })(),
      // ZKSYNC PROPOSAL
      {
        target: NETWORK_ADDRESSES_ZKSYNC["CHAINLINK_ORACLE"],
        signature: "setTokenConfig((address,address,uint256))",
        params: [[token_ZKSYNC["wstETH"].address, CHAINLINK_WSTETH_FEED_ZKSYNC, chainlinkStalePeriod]],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: NETWORK_ADDRESSES_ZKSYNC["RESILIENT_ORACLE"],
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            token_ZKSYNC["wstETH"].address,
            [wstETH_ONE_JUMP_ORACLE_ZKSYNC, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },

      {
        target: zksyncMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: NETWORK_ADDRESSES_ZKSYNC["VTREASURY"],
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [
          token_ZKSYNC["wstETH"].address,
          zksyncMarket.initialSupply.amount,
          NETWORK_ADDRESSES_ZKSYNC["NORMAL_TIMELOCK"],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: zksyncMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [NETWORK_ADDRESSES_ZKSYNC["POOL_REGISTRY"], zksyncMarket.initialSupply.amount],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: NETWORK_ADDRESSES_ZKSYNC["POOL_REGISTRY"],
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            zksyncMarket.vToken.address,
            zksyncMarket.riskParameters.collateralFactor,
            zksyncMarket.riskParameters.liquidationThreshold,
            zksyncMarket.initialSupply.amount,
            NETWORK_ADDRESSES_ZKSYNC["NORMAL_TIMELOCK"],
            zksyncMarket.riskParameters.supplyCap,
            zksyncMarket.riskParameters.borrowCap,
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: zksyncMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [NETWORK_ADDRESSES_ZKSYNC["POOL_REGISTRY"], 0],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: zksyncMarket.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, zksyncMarket.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.zksyncmainnet,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(
          zksyncMarket.initialSupply.amount,
          zksyncMarket.vToken.exchangeRate,
        );
        const vTokensRemaining = vTokensMinted.sub(zksyncMarket.initialSupply.vTokensToBurn);
        return {
          target: zksyncMarket.vToken.address,
          signature: "transfer(address,uint256)",
          params: [zksyncMarket.initialSupply.vTokenReceiver, vTokensRemaining],
          dstChainId: LzChainId.zksyncmainnet,
        };
      })(),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip454;
