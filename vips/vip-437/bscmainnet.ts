import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, NORMAL_TIMELOCK, RESILIENT_ORACLE } = NETWORK_ADDRESSES["basemainnet"];

export const COMPTROLLER_CORE = "0x0C7973F9598AA62f9e03B94E92C967fD5437426C";
export const wsuperOETHb_Oracle = "0x2ad7dFf3380A0b75dC0bB1f3B38C105AB5B6D818";

type Token = {
  address: string;
  decimals: number;
  symbol: string;
};

export const token = {
  address: "0x7FcD174E80f264448ebeE8c88a7C4476AAF58Ea6",
  decimals: 18,
  symbol: "wsuperOETHb",
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

export const market: Market = {
  vToken: {
    address: "0x75201D81B3B0b9D17b179118837Be37f64fc4930",
    name: "Venus wsuperOETHb (Core)",
    symbol: "vwsuperOETHb_Core",
    underlying: token,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.73", 18),
    liquidationThreshold: parseUnits("0.78", 18),
    supplyCap: parseUnits("2000", 18),
    borrowCap: parseUnits("0", 18),
    reserveFactor: parseUnits("0.2", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("0.3", 18),
    vTokenReceiver: "0x3c112E20141B65041C252a68a611EF145f58B7bc",
  },
  interestRateModel: {
    address: "0x527c29aAfB367fAd5AFf97855EBFAa610AA514CA",
    base: "0",
    multiplier: "0.09",
    jump: "3",
    kink: "0.45",
  },
};

const vip437 = () => {
  const meta = {
    version: "v2",
    title: "VIP-437 [Base] New wsuperOETHb market in the Core pool",
    description: `#### Summary

If passed, this VIP will add a market for [wsuperOETHb](https://basescan.org/address/0x7FcD174E80f264448ebeE8c88a7C4476AAF58Ea6) into the Core pool on Base, following the Community proposal “[wsuperOETHb as a collateral asset on Venus Protocol BASE Core Pool](https://community.venus.io/t/wsuperoethb-as-a-collateral-asset-on-venus-protocol-base-core-pool/4744)” and [the associated snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xcd8fac77a4a641828606a42c9ae3179fb92d36f502426a388f8cff02bf2b88ba).

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/wsuperoethb-as-a-collateral-asset-on-venus-protocol-base-core-pool/4744/11), the risk parameters for the new market are:

Underlying token: [wsuperOETHb](https://basescan.org/address/0x7FcD174E80f264448ebeE8c88a7C4476AAF58Ea6)

- Borrow cap: 0 wsuperOETHb
- Supply cap: 2,000 wsuperOETHb
- Collateral factor: 73%
- Liquidation threshold: 78%
- Reserve factor: 20%

Bootstrap liquidity: 0.3 wsuperOETHb provided by the [Origin project](https://basescan.org/address/0x3c112E20141B65041C252a68a611EF145f58B7bc).

The interest rate curve for the new market is not relevant because the asset is not borrowable, but these parameters will be set anyway:

- kink: 45%
- base (yearly): 0%
- multiplier (yearly): 9%
- jump multiplier (yearly): 300%

**Oracles configuration**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Base](https://basescan.org/address/0xcBBf58bD5bAdE357b634419B70b215D5E9d6FbeD) is used for wsuperOETHb, using under the hood the conversion rate for wsuperOETHb/superOETHb provided by the [ERC4626Oracle](https://basescan.org/address/0x2ad7dFf3380A0b75dC0bB1f3B38C105AB5B6D818), assuming 1 superOETHb equals 1 ETH, and using the ETH/USD price provided by Chainlink ([feed](https://basescan.org/address/0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70)).

#### Security and additional considerations

We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Core pool on Base, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to Base sepolia, and used in the Venus Protocol testnet deployment

#### Deployed contracts

Base mainnet

- vwsuperOETHb_Core: [0x75201D81B3B0b9D17b179118837Be37f64fc4930](https://basescan.org/address/0x75201D81B3B0b9D17b179118837Be37f64fc4930)
- wsuperOETHb_ERC4626Oracle: [0x2ad7dFf3380A0b75dC0bB1f3B38C105AB5B6D818](https://basescan.org/address/0x2ad7dFf3380A0b75dC0bB1f3B38C105AB5B6D818)

Base sepolia

- vwsuperOETHb_Core: [0xF9d609ba31724E199ccaacaD3e3e7ED8462C20C5](https://sepolia.basescan.org/address/0xF9d609ba31724E199ccaacaD3e3e7ED8462C20C5)
- wsuperOETHb_ERC4626Oracle: [0x72050243b23a7f0f74D37e1B85Df9D6486D1a331](https://sepolia.basescan.org/address/0x72050243b23a7f0f74D37e1B85Df9D6486D1a331)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/471)
- Deployment to Base Sepolia
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            token.address,
            [wsuperOETHb_Oracle, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: market.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["86400"],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: market.vToken.address,
        signature: "setReserveFactor(uint256)",
        params: [market.riskParameters.reserveFactor],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [market.vToken.underlying.address, market.initialSupply.amount, NORMAL_TIMELOCK],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, market.initialSupply.amount],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: POOL_REGISTRY,
        signature: "addMarket((address,uint256,uint256,uint256,address,uint256,uint256))",
        params: [
          [
            market.vToken.address,
            market.riskParameters.collateralFactor,
            market.riskParameters.liquidationThreshold,
            market.initialSupply.amount,
            market.initialSupply.vTokenReceiver,
            market.riskParameters.supplyCap,
            market.riskParameters.borrowCap,
          ],
        ],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: market.vToken.address,
        signature: "setProtocolSeizeShare(uint256)",
        params: [market.riskParameters.protocolSeizeShare],
        dstChainId: LzChainId.basemainnet,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[market.vToken.address], [2], true],
        dstChainId: LzChainId.basemainnet,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip437;
