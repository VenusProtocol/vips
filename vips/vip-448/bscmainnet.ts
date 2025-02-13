import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, NORMAL_TIMELOCK } = NETWORK_ADDRESSES["ethereum"];

export const COMPTROLLER_CORE = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";

type Token = {
  address: string;
  decimals: number;
  symbol: string;
};

export const token = {
  address: "0x917ceE801a67f933F2e6b33fC0cD1ED2d5909D88",
  decimals: 18,
  symbol: "weETHs",
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
    address: "0xc42E4bfb996ED35235bda505430cBE404Eb49F77",
    name: "Venus weETHs (Core)",
    symbol: "vweETHs_Core",
    underlying: token,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_CORE,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.70", 18),
    liquidationThreshold: parseUnits("0.75", 18),
    supplyCap: parseUnits("700", 18),
    borrowCap: parseUnits("0", 18),
    reserveFactor: parseUnits("0.25", 18),
    protocolSeizeShare: parseUnits("0.05", 18),
  },
  initialSupply: {
    amount: parseUnits("2", 18),
    vTokenReceiver: "0x3e8734ec146c981e3ed1f6b582d447dde701d90c",
  },
  interestRateModel: {
    address: "0xae838dEB13Ff67681704AA69e31Da304918Ee43D",
    base: "0",
    multiplier: "0.09",
    jump: "0.75",
    kink: "0.45",
  },
};

const vip448 = () => {
  const meta = {
    version: "v2",
    title: "VIP-448 [Ethereum] New weETHs market in the Core pool",
    description: `#### Summary

If passed, this VIP will add the [weETHs](https://etherscan.io/token/0x917cee801a67f933f2e6b33fc0cd1ed2d5909d88) ([ether.fi](https://ether.fi/)) market to the Core pool on Ethereum, following the Community proposal “[Add weETHs as a supported collateral asset on Venus ETH Mainnet CORE Pool](https://community.venus.io/t/add-weeths-as-a-supported-collateral-asset-on-venus-eth-mainnet-core-pool/4796)” and [the associated snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xa8539572cd43e22f29f485727f7f05d98433f82984a9d1fa58677194b4157330).

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/add-weeths-as-a-supported-collateral-asset-on-venus-eth-mainnet-core-pool/4796/7), the risk parameters for the new market are:

Underlying token: [weETHs](https://etherscan.io/token/0x917cee801a67f933f2e6b33fc0cd1ed2d5909d88)

- Borrow cap: 0 weETHs
- Supply cap: 700 weETHs
- Collateral factor: 70%
- Liquidation threshold: 75%
- Reserve factor: 25%

Bootstrap liquidity: 2 weETHs, provided by the market supporter [0x3e8734ec146c981e3ed1f6b582d447dde701d90c](https://etherscan.io/address/0x3e8734ec146c981e3ed1f6b582d447dde701d90c)

The interest rate curve for the new market is not relevant because the asset is not borrowable, but these parameters will be set anyway:

- kink: 45%
- base (yearly): 0%
- multiplier (yearly): 9%
- jump multiplier (yearly): 75%

**Oracles configuration**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [Ethereum](https://etherscan.io/address/0xd2ce3fb018805ef92b8C5976cb31F84b4E295F94) is used for weETHs, with the following configuration. The WeETHAccountantOracle is used to get the USD price of weETHs, first getting the conversion rate weETHs/WETH from the Accountant contract, managed by ether.fi, and then getting the USD price using the [Chainlink price feed for ETH/USD](https://etherscan.io/address/0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419).

- MAIN oracle
    - Contract: [WeETHAccountantOracle](https://etherscan.io/address/0x132f91AA7afc590D591f168A780bB21B4c29f577)
    - CORRELATED_TOKEN: [weETHs](https://etherscan.io/token/0x917cee801a67f933f2e6b33fc0cd1ed2d5909d88)
    - UNDERLYING_TOKEN: [WETH](https://etherscan.io/address/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2)
    - ACCOUNTANT: [0xbe16605B22a7faCEf247363312121670DFe5afBE](https://etherscan.io/address/0xbe16605B22a7faCEf247363312121670DFe5afBE)

#### Security and additional considerations

We applied the following security procedures for this VIP:

- **Audit**: Certik, Peckshield, Hacken and Code4rena have audited the market code. Certik has audited the WeETHAccountantOracle.
- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the Core pool on Ethereum, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to Sepolia, and used in the Venus Protocol testnet deployment

#### Audit reports

- [Certik audit report](https://github.com/VenusProtocol/oracle/blob/93a79c97e867f61652fc063abb5df323acc9bed4/audits/116_WeETHAccountantOracle_certik_20240823.pdf) (2024/08/23)
- [Certik audit report](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/036_isolatedPools_certik_20230619.pdf) (2023/June/19)
- [Code4rena contest](https://code4rena.com/contests/2023-05-venus-protocol-isolated-pools) (2023/May/05)
- [Hacken audit report](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/016_isolatedPools_hacken_20230426.pdf) (2023/April/26)
- [Peckshield audit report 1](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/003_isolatedPools_peckshield_20230112.pdf) (2023/January/12)
- [Peckshield audit report 2](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/037_isolatedPools_peckshield_20230625.pdf) (2023/June/25)

#### Deployed contracts

- Mainnet vweETHs_Core: [0xc42E4bfb996ED35235bda505430cBE404Eb49F77](https://etherscan.io/address/0xc42E4bfb996ED35235bda505430cBE404Eb49F77)
- Sepolia vweETHs_Core: [0x81aab41B868f8b5632E8eE6a98AdA7a7fDBc8823](https://sepolia.etherscan.io/address/0x81aab41B868f8b5632E8eE6a98AdA7a7fDBc8823)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/484)
- [Code of WeETHAccountantOracle](https://github.com/VenusProtocol/oracle/blob/develop/contracts/oracles/WeETHAccountantOracle.sol)
- [Deployment to Sepolia](https://sepolia.etherscan.io/tx/0x5db0b6903047dd490e7697b09edf703cda5ee460c35e09efed786c7386452b06)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: market.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["7200"],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: market.vToken.address,
        signature: "setReserveFactor(uint256)",
        params: [market.riskParameters.reserveFactor],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryToken(address,uint256,address)",
        params: [market.vToken.underlying.address, market.initialSupply.amount, NORMAL_TIMELOCK],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, market.initialSupply.amount],
        dstChainId: LzChainId.ethereum,
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
        dstChainId: LzChainId.ethereum,
      },
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: COMPTROLLER_CORE,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[market.vToken.address], [2], true],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip448;
