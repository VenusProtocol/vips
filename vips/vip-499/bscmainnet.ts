import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { unichainmainnet } = NETWORK_ADDRESSES;

export const COMPTROLLER_CORE = "0xe22af1e6b78318e1Fe1053Edbd7209b8Fc62c4Fe";
export const WEETH_REDSTONE_FEED = "0xBf3bA2b090188B40eF83145Be0e9F30C6ca63689";
export const WSTETH_REDSTONE_FEED = "0xC3346631E0A9720582fB9CAbdBEA22BC2F57741b";
export const WEETH_ORACLE = "0xF9ECA470E2458Fe2B6FcAe660bEd1e2C0FB87E01";
export const WSTETH_ORACLE = "0x3938D6414c261C6F450f1bD059DF9af2BBfb603D";
export const VANGUARD_TREASURY = "0xf645a387180F5F74b968305dF81d54EB328d21ca";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
export const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
export const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
export const PRIME_LIQUIDITY_PROVIDER = "0x23c4F844ffDdC6161174eB32c770D4D8C07833F2";
export const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
export const VUSDC_AMOUNT_TO_WITHDRAW = parseUnits("7023314.39611841", 8); // 180,000 USDC
export const TOKEN_REDEEMER = "0xC53ffda840B51068C64b2E052a5715043f634bcd";
export const PLP_USDT_AMOUNT = parseUnits("330000", 18);
export const PLP_USDC_AMOUNT = parseUnits("180000", 18);
export const PLP_ETH_AMOUNT = parseUnits("31.78", 18);
export const PLP_BTCB_AMOUNT = parseUnits("0.37", 18);

const STALE_PERIOD_26H = 26 * 60 * 60; // heartbeat of 24H

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

type Token = {
  address: string;
  decimals: number;
  symbol: string;
};

export const weETH: Token = {
  address: "0x7DCC39B4d1C53CB31e1aBc0e358b43987FEF80f7",
  decimals: 18,
  symbol: "weETH",
};

export const wstETH: Token = {
  address: "0xc02fE7317D4eb8753a02c35fe019786854A92001",
  decimals: 18,
  symbol: "wstETH",
};

export const DAYS_30 = 30 * 24 * 60 * 60;

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
  cappedOracles: {
    exchangeRateValue: BigNumber;
    exchangeRateTimestamp: number;
    annualGrowthRate: BigNumber;
    snapshotIntervalInSeconds: number;
    snapshotGapBps: BigNumber;
  };
};

export const weETHMarket: Market = {
  vToken: {
    address: "0x0170398083eb0D0387709523baFCA6426146C218",
    name: "Venus weETH (Core)",
    symbol: "vweETH_Core",
    underlying: weETH,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.7", 18),
    liquidationThreshold: parseUnits("0.75", 18),
    supplyCap: parseUnits("4000", 18),
    borrowCap: parseUnits("400", 18),
    reserveFactor: parseUnits("0.4", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("3.614915477041407445", 18),
    vTokensToBurn: parseUnits("0.03694", 8), // around $100
    vTokenReceiver: unichainmainnet.VTREASURY,
  },
  interestRateModel: {
    address: "0xc2edB1e96e45178b901618B96142C2743Ed0e7B3",
    base: "0",
    multiplier: "0.09",
    jump: "3",
    kink: "0.45",
  },
  cappedOracles: {
    exchangeRateValue: parseUnits("1.06786522", 18),
    exchangeRateTimestamp: 1747675954,
    annualGrowthRate: parseUnits("0.053", 18), // 5.3%
    snapshotIntervalInSeconds: DAYS_30,
    snapshotGapBps: BigNumber.from("44"), // 0.44%
  },
};

export const wstETHMarket: Market = {
  vToken: {
    address: "0xbEC19Bef402C697a7be315d3e59E5F65b89Fa1BB",
    name: "Venus wstETH (Core)",
    symbol: "vwstETH_Core",
    underlying: wstETH,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.7", 18),
    liquidationThreshold: parseUnits("0.725", 18),
    supplyCap: parseUnits("14000", 18),
    borrowCap: parseUnits("7000", 18),
    reserveFactor: parseUnits("0.25", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("3.208916246034338443", 18),
    vTokensToBurn: parseUnits("0.03309", 8), // around $100
    vTokenReceiver: unichainmainnet.VTREASURY,
  },
  interestRateModel: {
    address: "0x5C7D8858a25778d992eE803Ce79F1eff60c1d9D1",
    base: "0",
    multiplier: "0.15",
    jump: "3",
    kink: "0.45",
  },
  cappedOracles: {
    exchangeRateValue: parseUnits("1.20307347", 18),
    exchangeRateTimestamp: 1747675954,
    annualGrowthRate: parseUnits("0.067", 18), // 6.7%
    snapshotIntervalInSeconds: DAYS_30,
    snapshotGapBps: BigNumber.from("55"), // 0.55%
  },
};

export const exchangeRatePercentage = (
  exchangeRate: BigNumber,
  percentage: BigNumber, // BPS value (e.g., 10000 for 100%)
) => {
  return exchangeRate.mul(percentage).div(10000);
};

export const increaseExchangeRateByPercentage = (
  exchangeRate: BigNumber,
  percentage: BigNumber, // BPS value (e.g., 10000 for 100%)
) => {
  const increaseAmount = exchangeRatePercentage(exchangeRate, percentage);
  return exchangeRate.add(increaseAmount).toString();
};

const vip499 = () => {
  const meta = {
    version: "v2",
    title:
      "VIP-499 [Unichain][BNB Chain] Add weETH and wstETH markets to the Core pool on Unichain, Prime funding and USD1 rewards",
    description: `If passed, this VIP will add markets for [weETH](https://uniscan.xyz/address/0x7DCC39B4d1C53CB31e1aBc0e358b43987FEF80f7) and [wstETH](https://uniscan.xyz/address/0xc02fE7317D4eb8753a02c35fe019786854A92001) to the Core pool on Unichain, following the Community proposals:

- [Proposal to Add Ether.fi’s weETH to Venus Core pool on Unichain](https://community.venus.io/t/proposal-to-add-ether-fi-s-weeth-to-venus-core-pool-on-unichain/5006) ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xe56a07ce811f7cb04f17b645faf1f18d111cf83e25b1ddeb03b4b65d210f3720))
- [List Lido wstETH on Unichain Core Pool](https://community.venus.io/t/list-lido-wsteth-on-unichain-core-pool/4983) ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x07975715c1d20426c5f0ee0694f39165a3fcb2257764c0d3b35288d5b9259363))

Moreover, this VIP will withdraw the following tokens from the [Venus Treasury on BNB Chain](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9):

- Prime funding, following the community proposal [Proposal: Fund Venus Prime Rewards on BNB Chain](https://community.venus.io/t/proposal-fund-venus-prime-rewards-on-bnb-chain/5115) ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x9876e5d3d9290407ad7c2864730a7684d187a8940f8d3f499a72cac3fce0910a)). The following tokens will be withdrawn from the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) on BNB Chain to the [PrimeLiquidityProvider contract on BNB Chain](https://bscscan.com/address/0x23c4F844ffDdC6161174eB32c770D4D8C07833F2) (where Prime rewards are stored).
    - 330,000 [USDT](https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955)
    - 180,000 [USDC](https://bscscan.com/address/0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d)
    - 31.78 [ETH](https://bscscan.com/address/0x2170Ed0880ac9A755fd29B2688956BD959F933F8)
    - 0.37 [BTCB](https://bscscan.com/address/0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c)
- Refund of 10,000 [USDT](https://bscscan.com/address/0x55d398326f99059fF775485246999027B3197955) to the [Vanguard Treasury](https://bscscan.com/address/0xf645a387180F5F74b968305dF81d54EB328d21ca), to compensate the funds spent to configure the rewards on the USD1 market, following the community proposal [USD1 Market Rewards Funding Proposal](https://community.venus.io/t/usd1-market-rewards-funding-proposal/5102) ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x9cf903e7da4865095680b5e6cb188a96f4c83d8a6bb09d93357553787604fb62)).

#### Description

**Risk parameters for weETH**

Following [Chaos Labs recommendations](https://community.venus.io/t/proposal-to-add-ether-fi-s-weeth-to-venus-core-pool-on-unichain/5006/6), the risk parameters for the new market are:

Underlying token: [weETH](https://uniscan.xyz/address/0x7DCC39B4d1C53CB31e1aBc0e358b43987FEF80f7)

- Borrow cap: 400 weETH
- Supply cap: 4,000 weETH
- Collateral factor: 70%
- Liquidation threshold: 75%
- Reserve factor: 40%

Bootstrap liquidity: 3.6149 weETH provided by the [Venus Treasury](https://uniscan.xyz/address/0x958F4C84d3ad523Fa9936Dc465A123C7AD43D69B) (Vanguard Treasury should be refunded with 10,000 USDT, because they provided the bootstrap liquidity [here](https://uniscan.xyz/tx/0xa7f8fc27e749ec7fc1b1460382537b795ce43eac209127d1b7ec5bb7f631bfa0)).

Interest rate curve for the new market:

- kink: 45%
- base (yearly): 0%
- multiplier (yearly): 9%
- jump multiplier (yearly): 300%

**Oracles configuration for weETH**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Unichain](https://uniscan.xyz/address/0x86D04d6FE928D888076851122dc6739551818f7E) is used for weETH, using the following configuration. The OneJumpOracle is used to get the USD price of weETH, first getting the conversion rate weETH/ETH using the feeds from RedStone, and then getting the USD price using the RedStone price feed for ETH/USD.

- MAIN oracle for weETH on Unichain
    - Contract: [OneJumpOracle](https://uniscan.xyz/address/0xF9ECA470E2458Fe2B6FcAe660bEd1e2C0FB87E01)
    - CORRELATED_TOKEN: [weETH](https://uniscan.xyz/address/0x7DCC39B4d1C53CB31e1aBc0e358b43987FEF80f7)
    - UNDERLYING_TOKEN: [WETH](https://uniscan.xyz/address/0x4200000000000000000000000000000000000006)
    - INTERMEDIATE_ORACLE: [RedStoneOracle](https://uniscan.xyz/address/0x4d41a36D04D97785bcEA57b057C412b278e6Edcc), using its price feed [weETH/ETH](https://uniscan.xyz/address/0xBf3bA2b090188B40eF83145Be0e9F30C6ca63689)

**Risk parameters for wstETH**

Following [Chaos Labs recommendations](https://community.venus.io/t/list-lido-wsteth-on-unichain-core-pool/4983/8), the risk parameters for the new market are:

Underlying token: [wstETH](https://uniscan.xyz/address/0xc02fE7317D4eb8753a02c35fe019786854A92001)

- Borrow cap: 7,000 wstETH
- Supply cap: 14,000 wstETH
- Collateral factor: 70%
- Liquidation threshold: 72.5%
- Reserve factor: 25%

Bootstrap liquidity: 3.2089 wstETH provided by the [Venus Treasury](https://uniscan.xyz/address/0x958F4C84d3ad523Fa9936Dc465A123C7AD43D69B) (Vanguard Treasury should be refunded with 10,000 USDT, because they provided the bootstrap liquidity [here](https://uniscan.xyz/tx/0x0ba6334cba34da549a1d7ceb2f93d110ba1c4904c7650262be750ee1cf2f3588)).

Interest rate curve for the new market:

- kink: 45%
- base (yearly): 0%
- multiplier (yearly): 15%
- jump multiplier (yearly): 300%

**Oracles configuration for wstETH**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Unichain](https://uniscan.xyz/address/0x86D04d6FE928D888076851122dc6739551818f7E) is used for wstETH, using the following configuration. The OneJumpOracle is used to get the USD price of wstETH, first getting the conversion rate wstETH/stETH using the feeds from RedStone, and then getting the USD price using the RedStone price feed for ETH/USD.

- MAIN oracle for wstETH on Unichain
    - Contract: [OneJumpOracle](https://uniscan.xyz/address/0x3938D6414c261C6F450f1bD059DF9af2BBfb603D)
    - CORRELATED_TOKEN: [wstETH](https://uniscan.xyz/address/0xc02fE7317D4eb8753a02c35fe019786854A92001)
    - UNDERLYING_TOKEN: [WETH](https://uniscan.xyz/address/0x4200000000000000000000000000000000000006) (assuming 1 stETH is equal to 1 ETH)
    - INTERMEDIATE_ORACLE: [RedStoneOracle](https://uniscan.xyz/address/0x4d41a36D04D97785bcEA57b057C412b278e6Edcc), using its price feed [wstETH/stETH](https://uniscan.xyz/address/0xC3346631E0A9720582fB9CAbdBEA22BC2F57741b)

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation:** in a simulation environment, validating the new markets are properly added to the Core pool on Unichain, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet:** the same markets have been deployed to testnet, and used in the Venus Protocol testnet deployment

#### Deployed contracts

Unichain mainnet:

- vweETH_Core: [0x0170398083eb0D0387709523baFCA6426146C218](https://uniscan.xyz/address/0x0170398083eb0D0387709523baFCA6426146C218)
- vwstETH_Core: [0xbEC19Bef402C697a7be315d3e59E5F65b89Fa1BB](https://uniscan.xyz/address/0xbEC19Bef402C697a7be315d3e59E5F65b89Fa1BB)

Unichain Sepolia testnet:

- vweETH_Core: [0xF46F0E1Fe165018EC778e0c61a71661f55aEa09B](https://sepolia.uniscan.xyz/address/0xF46F0E1Fe165018EC778e0c61a71661f55aEa09B)
- vwstETH_Core: [0xb24c9a851542B4599Eb6C1644ce2e245074c885f](https://sepolia.uniscan.xyz/address/0xb24c9a851542B4599Eb6C1644ce2e245074c885f)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/561)
- [Deployment of weETH and wstETH to Unichain Sepolia testnet](https://sepolia.uniscan.xyz/tx/0x86a9ca1bb2c01ca97d4adaa4b6620981d1d4560d8c3a41fcfc46525d748bd4cc)
- [Documentation](https://docs-v4.venus.io/)
`,
    forDescription: "Process to configure and launch the new markets",
    againstDescription: "Defer configuration and launch of the new markets",
    abstainDescription: "No opinion on the matter",
  };

  return makeProposal(
    [
      // Oracle config
      {
        target: WEETH_ORACLE,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(
            weETHMarket.cappedOracles.exchangeRateValue,
            weETHMarket.cappedOracles.snapshotGapBps,
          ),
          weETHMarket.cappedOracles.exchangeRateTimestamp,
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: WEETH_ORACLE,
        signature: "setGrowthRate(uint256,uint256)",
        params: [weETHMarket.cappedOracles.annualGrowthRate, weETHMarket.cappedOracles.snapshotIntervalInSeconds],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: WEETH_ORACLE,
        signature: "setSnapshotGap(uint256)",
        params: [
          exchangeRatePercentage(weETHMarket.cappedOracles.exchangeRateValue, weETHMarket.cappedOracles.snapshotGapBps),
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: WSTETH_ORACLE,
        signature: "setSnapshot(uint256,uint256)",
        params: [
          increaseExchangeRateByPercentage(
            wstETHMarket.cappedOracles.exchangeRateValue,
            wstETHMarket.cappedOracles.snapshotGapBps,
          ),
          wstETHMarket.cappedOracles.exchangeRateTimestamp,
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: WSTETH_ORACLE,
        signature: "setGrowthRate(uint256,uint256)",
        params: [wstETHMarket.cappedOracles.annualGrowthRate, wstETHMarket.cappedOracles.snapshotIntervalInSeconds],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: WSTETH_ORACLE,
        signature: "setSnapshotGap(uint256)",
        params: [
          exchangeRatePercentage(
            wstETHMarket.cappedOracles.exchangeRateValue,
            wstETHMarket.cappedOracles.snapshotGapBps,
          ),
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.REDSTONE_ORACLE,
        signature: "setTokenConfigs((address,address,uint256)[])",
        params: [
          [
            // weETH config
            [weETH.address, WEETH_REDSTONE_FEED, STALE_PERIOD_26H],
            // wstETH config
            [wstETH.address, WSTETH_REDSTONE_FEED, STALE_PERIOD_26H],
          ],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.RESILIENT_ORACLE,
        signature: "setTokenConfigs((address,address[3],bool[3],bool)[])",
        params: [
          [
            // weETH config
            [
              weETH.address,
              [WEETH_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
            // wstETH config
            [
              wstETH.address,
              [WSTETH_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
              [true, false, false],
              false,
            ],
          ],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },

      // <--- weETH Market --->
      // Market configurations
      {
        target: weETHMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [
          weETHMarket.vToken.underlying.address,
          weETHMarket.initialSupply.amount,
          unichainmainnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: weETH.address,
        signature: "approve(address,uint256)",
        params: [unichainmainnet.POOL_REGISTRY, 0],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: weETH.address,
        signature: "approve(address,uint256)",
        params: [unichainmainnet.POOL_REGISTRY, weETHMarket.initialSupply.amount],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            weETHMarket.vToken.address,
            weETHMarket.riskParameters.collateralFactor, // CF
            weETHMarket.riskParameters.liquidationThreshold, // LT
            weETHMarket.initialSupply.amount, // initial supply
            unichainmainnet.NORMAL_TIMELOCK, // vToken receiver
            weETHMarket.riskParameters.supplyCap, // supply cap
            weETHMarket.riskParameters.borrowCap, // borrow cap
          ],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: weETHMarket.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, weETHMarket.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.unichainmainnet,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(weETHMarket.initialSupply.amount, weETHMarket.vToken.exchangeRate);
        const vTokensRemaining = vTokensMinted.sub(weETHMarket.initialSupply.vTokensToBurn);
        return {
          target: weETHMarket.vToken.address,
          signature: "transfer(address,uint256)",
          params: [weETHMarket.initialSupply.vTokenReceiver, vTokensRemaining],
          dstChainId: LzChainId.unichainmainnet,
        };
      })(),

      // <--- wstETH Market --->
      // Market configurations
      {
        target: wstETHMarket.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: unichainmainnet.VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [
          wstETHMarket.vToken.underlying.address,
          wstETHMarket.initialSupply.amount,
          unichainmainnet.NORMAL_TIMELOCK,
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: wstETH.address,
        signature: "approve(address,uint256)",
        params: [unichainmainnet.POOL_REGISTRY, 0],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: wstETH.address,
        signature: "approve(address,uint256)",
        params: [unichainmainnet.POOL_REGISTRY, wstETHMarket.initialSupply.amount],
        dstChainId: LzChainId.unichainmainnet,
      },

      {
        target: unichainmainnet.POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            wstETHMarket.vToken.address,
            wstETHMarket.riskParameters.collateralFactor, // CF
            wstETHMarket.riskParameters.liquidationThreshold, // LT
            wstETHMarket.initialSupply.amount, // initial supply
            unichainmainnet.NORMAL_TIMELOCK, // vToken receiver
            wstETHMarket.riskParameters.supplyCap, // supply cap
            wstETHMarket.riskParameters.borrowCap, // borrow cap
          ],
        ],
        dstChainId: LzChainId.unichainmainnet,
      },
      {
        target: wstETHMarket.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, wstETHMarket.initialSupply.vTokensToBurn],
        dstChainId: LzChainId.unichainmainnet,
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(
          wstETHMarket.initialSupply.amount,
          wstETHMarket.vToken.exchangeRate,
        );
        const vTokensRemaining = vTokensMinted.sub(wstETHMarket.initialSupply.vTokensToBurn);
        return {
          target: wstETHMarket.vToken.address,
          signature: "transfer(address,uint256)",
          params: [wstETHMarket.initialSupply.vTokenReceiver, vTokensRemaining],
          dstChainId: LzChainId.unichainmainnet,
        };
      })(),
      {
        target: NETWORK_ADDRESSES.bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("30000", 18), VANGUARD_TREASURY],
      },
      {
        target: NETWORK_ADDRESSES.bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, PLP_USDT_AMOUNT, PRIME_LIQUIDITY_PROVIDER],
      },
      {
        target: NETWORK_ADDRESSES.bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [VUSDC, VUSDC_AMOUNT_TO_WITHDRAW, TOKEN_REDEEMER],
      },
      {
        target: TOKEN_REDEEMER,
        signature: "redeemUnderlyingAndTransfer(address,address,uint256,address)",
        params: [VUSDC, PRIME_LIQUIDITY_PROVIDER, PLP_USDC_AMOUNT, NETWORK_ADDRESSES.bscmainnet.VTREASURY],
      },
      {
        target: NETWORK_ADDRESSES.bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [ETH, PLP_ETH_AMOUNT, PRIME_LIQUIDITY_PROVIDER],
      },
      {
        target: NETWORK_ADDRESSES.bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [BTCB, PLP_BTCB_AMOUNT, PRIME_LIQUIDITY_PROVIDER],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip499;
