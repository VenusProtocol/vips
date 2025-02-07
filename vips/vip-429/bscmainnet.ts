import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, NORMAL_TIMELOCK, CHAINLINK_ORACLE, RESILIENT_ORACLE } =
  NETWORK_ADDRESSES["zksyncmainnet"];

export const COMPTROLLER = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";
export const CHAINLINK_STALE_PERIOD = 26 * 60 * 60; // 26 hours
export const USDM_CHAINLINK_FEED = "0x6Ab6c24f9312a6cB458761143D373A8f11573C4B";
export const WUSDM_ERC4626_ORACLE = "0x7Fb95a0B7b933A9F3Fe3Ead4b69B0267BD8Fe55F";

export const tokens = {
  USDM: {
    address: "0x7715c206A14Ac93Cb1A6c0316A6E5f8aD7c9Dc31",
    decimals: 18,
    symbol: "USDM",
  },
  wUSDM: {
    address: "0xA900cbE7739c96D2B153a273953620A701d5442b",
    decimals: 18,
    symbol: "wUSDM",
  },
};

export const newMarket = {
  vToken: {
    address: "0x183dE3C349fCf546aAe925E1c7F364EA6FB4033c",
    name: "Venus wUSDM (Core)",
    symbol: "vwUSDM_Core",
    underlying: tokens["wUSDM"],
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.75", 18),
    liquidationThreshold: parseUnits("0.78", 18),
    supplyCap: parseUnits("5000000", 18),
    borrowCap: parseUnits("4000000", 18),
    reserveFactor: parseUnits("0.25", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("10000", 18),
    vTokenReceiver: "0xFfCf33Ed3fc6B7eC7d4F6166cC1B86d4F42Af192",
  },
  interestRateModel: {
    address: "0x40a0DEC6AcA207F45212B14dE1312cEae6FB3E5A",
    base: "0",
    multiplier: "0.06875",
    jump: "2.5",
    kink: "0.8",
  },
};

const vip429 = (overrides: { chainlinkStalePeriod?: number }) => {
  const meta = {
    version: "v2",
    title: "VIP-429 [ZKsync] New wUSDM market in the Core pool",
    description: `#### Summary

If passed, following the Community proposal “[List wUSDM to Core Pool to Venus on Ethereum Mainnet, Arbitrum, Optimism, and zkSync](https://community.venus.io/t/list-wusdm-to-core-pool-to-venus-on-ethereum-mainnet-arbitrum-optimism-and-zksync/4682)” and [the associated snapshot](https://snapshot.org/#/s:venus-xvs.eth/proposal/0xd5a26298a00854960790ccd4adee6e6a709931dec5169b54bb66f1ffd4698c31), this VIP adds a market for [wUSDM](https://explorer.zksync.io/address/0xa900cbe7739c96d2b153a273953620a701d5442b) into the Core pool on ZKsync Era.

#### Description

#### Risk parameters

Following [Chaos Labs recommendations](https://community.venus.io/t/list-wusdm-to-core-pool-to-venus-on-ethereum-mainnet-arbitrum-optimism-and-zksync/4682/6), the risk parameters for the new market are:

Underlying token: [wUSDM](https://explorer.zksync.io/address/0xa900cbe7739c96d2b153a273953620a701d5442b)

- Borrow cap: 4,000,000 wUSDM
- Supply cap: 5,000,000 wUSDM
- Collateral factor: 75%
- Liquidation threshold: 78%
- Reserve factor: 25%

Bootstrap liquidity: 10,000 wUSDM provided by [Mountain Protocol](https://explorer.zksync.io/address/0xFfCf33Ed3fc6B7eC7d4F6166cC1B86d4F42Af192).

Interest rate curve for the new market:

- kink: 80%
- base (yearly): 0%
- multiplier (yearly): 6.875%
- jump multiplier (yearly): 250%

#### Oracles configuration

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [ZKsync Era](https://explorer.zksync.io/address/0xDe564a4C887d5ad315a19a96DC81991c98b12182) is used for wUSDM, using under the hood the conversion rate for wUSDM/USDM provided by the [ERC4626Oracle](https://explorer.zksync.io/address/0x7Fb95a0B7b933A9F3Fe3Ead4b69B0267BD8Fe55F), and the USDM/USD price provided by Chainlink ([feed](https://era.zksync.network/address/0x6Ab6c24f9312a6cB458761143D373A8f11573C4B)).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Core pool on ZKsync Era, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to ZKsync Sepolia, and used in the Venus Protocol testnet deployment

#### Deployed contracts

Mainnet

- vwUSDM_Core: [0x183dE3C349fCf546aAe925E1c7F364EA6FB4033c](https://explorer.zksync.io/address/0x183dE3C349fCf546aAe925E1c7F364EA6FB4033c)
- wUSDM_ERC4626Oracle: [0x7Fb95a0B7b933A9F3Fe3Ead4b69B0267BD8Fe55F](https://explorer.zksync.io/address/0x7Fb95a0B7b933A9F3Fe3Ead4b69B0267BD8Fe55F)

Testnet

- Testnet vwUSDM_Core: [0x63abcB1f579dB71b4b8A1E182adbA2F131b75681](https://sepolia.explorer.zksync.io/address/0x63abcB1f579dB71b4b8A1E182adbA2F131b75681)
- wUSDM_ERC4626Oracle: [0xf1dD9549556F3fae6d8bf4F3283b1D9d2bfb996B](https://sepolia.explorer.zksync.io/address/0xf1dD9549556F3fae6d8bf4F3283b1D9d2bfb996B)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/462)
- [Deployment to ZKsync Sepolia](https://sepolia.explorer.zksync.io/tx/0x5792edf83d352c5499b111a64fa63ca407da24eba136541b6371cb3f3afe2000)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  const chainlinkStalePeriod = overrides?.chainlinkStalePeriod || CHAINLINK_STALE_PERIOD;

  return makeProposal(
    [
      // Oracle config
      {
        target: CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[tokens["USDM"].address, USDM_CHAINLINK_FEED, chainlinkStalePeriod]],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            tokens["USDM"].address,
            [CHAINLINK_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            tokens["wUSDM"].address,
            [WUSDM_ERC4626_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },

      // Market
      {
        target: newMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarket.vToken.address,
        signature: "setReserveFactor(uint256)",
        params: [newMarket.riskParameters.reserveFactor],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [newMarket.vToken.underlying.address, newMarket.initialSupply.amount, NORMAL_TIMELOCK],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, newMarket.initialSupply.amount],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            newMarket.vToken.address,
            newMarket.riskParameters.collateralFactor,
            newMarket.riskParameters.liquidationThreshold,
            newMarket.initialSupply.amount,
            newMarket.initialSupply.vTokenReceiver,
            newMarket.riskParameters.supplyCap,
            newMarket.riskParameters.borrowCap,
          ],
        ],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarket.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: newMarket.vToken.address,
        signature: "setProtocolSeizeShare(uint256)",
        params: [newMarket.riskParameters.protocolSeizeShare],
        dstChainId: LzChainId.zksyncmainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip429;
