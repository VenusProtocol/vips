import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { POOL_REGISTRY, VTREASURY, RESILIENT_ORACLE, NORMAL_TIMELOCK } = NETWORK_ADDRESSES["bscmainnet"];

export const COMPTROLLER_LIQUID_STAKED_BNB_POOL = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
export const AS_BNB_ORACLE = "0x52375ACab348Fa3979503EB9ADB11D74560dEe99";

export const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
export const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
export const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
export const BTCB_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
export const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
export const XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";

export const BaseAssets = [
  "0x55d398326f99059fF775485246999027B3197955", // USDT RiskFundConverter BaseAsset
  "0x55d398326f99059fF775485246999027B3197955", // USDT USDTTokenConverter BaseAsset
  "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", // USDC USDCTokenConverter BaseAsset
  "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c", // BTCB BTCBTokenConverter BaseAsset
  "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", // ETH ETHTokenConverter BaseAsset
  "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63", // XVS XVSTokenConverter BaseAsset
];

export const CONVERSION_INCENTIVE = parseUnits("1", 14);

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

type Token = {
  address: string;
  decimals: number;
  symbol: string;
};

export const token = {
  address: "0x77734e70b6E88b4d82fE632a168EDf6e700912b6",
  decimals: 18,
  symbol: "asBNB",
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
    address: "0x4A50a0a1c832190362e1491D5bB464b1bc2Bd288",
    name: "Venus asBNB (Liquid Staked BNB)",
    symbol: "vasBNB_LiquidStakedBNB",
    underlying: token,
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: COMPTROLLER_LIQUID_STAKED_BNB_POOL,
  },
  riskParameters: {
    collateralFactor: parseUnits("0.87", 18),
    liquidationThreshold: parseUnits("0.90", 18),
    supplyCap: parseUnits("2000", 18),
    borrowCap: parseUnits("0", 18),
    reserveFactor: parseUnits("0.1", 18),
    protocolSeizeShare: parseUnits("0.0125", 18),
  },
  initialSupply: {
    amount: parseUnits("18", 18),
    vTokenReceiver: "0xa8c0C6Ee62F5AD95730fe23cCF37d1c1FFAA1c3f",
  },
  interestRateModel: {
    address: "0xf03DAB984aCC5761df5f71Cc67fEA8F185f578fd",
    base: "0",
    multiplier: "0.035",
    jump: "0.8",
    kink: "0.8",
  },
};

const vip469 = () => {
  const meta = {
    version: "v2",
    title: "VIP-469 [BNB Chain] New asBNB market in the Liquid Staked BNB pool",
    description: `#### Summary

If passed, this VIP will add the [asBNB](https://bscscan.com/address/0x77734e70b6E88b4d82fE632a168EDf6e700912b6) market to the [Liquid Staked BNB pool on BNB Chain](https://bscscan.com/address/0xd933909A4a2b7A4638903028f44D1d38ce27c352), following the Community proposal “[Proposal: Creating LISTA pool for BNB, slisBNB, asBNB, pt-slisBNB on Venus BNB chain](https://community.venus.io/t/proposal-creating-lista-pool-for-bnb-slisbnb-asbnb-pt-slisbnb-on-venus-bnb-chain/4879)” ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xf173dd65d223a71108221a43e28bcff8f4ce15496a85741e767c3c8cec3e7c20)).

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/proposal-creating-lista-pool-for-bnb-slisbnb-asbnb-pt-slisbnb-on-venus-bnb-chain/4879/9), the risk parameters for the new market are:

Underlying token: [asBNB](https://bscscan.com/address/0x77734e70b6E88b4d82fE632a168EDf6e700912b6)

- Borrow cap: 0 asBNB
- Supply cap: 2,000 asBNB
- Collateral factor: 87%
- Liquidation threshold: 90%
- Reserve factor: 10%
- Liquidation Penalty: 2.5%

Bootstrap liquidity: 18 asBNB, provided by [Astherus](https://bscscan.com/tx/0x2ad88b784256c026cdae9cee4321ed8e7399f036c6516eadf414a36aacb24d15).

The interest rate curve for the new market is not relevant because the asset is not borrowable, but these parameters will be set anyway:

- kink: 80%
- base (yearly): 0%
- multiplier (yearly): 3.5%
- jump multiplier (yearly): 80%

**Oracles configuration**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [BNB Chain](https://bscscan.com/address/0x6592b5DE802159F3E74B2486b091D11a8256ab8A) is used for asBNB, with the following configuration

- asBNB
    - Main oracle: [AsBNBOracle](https://bscscan.com/address/0x52375ACab348Fa3979503EB9ADB11D74560dEe99), that will internally use the ratio asBNB/slisBNB
- slisBNB
    - Main oracle: [SlisBNBOracle](https://bscscan.com/address/0xfE54895445eD2575Bf5386B90FFB098cBC5CA29A), that will internally use the ratio slisBNB/BNB provided by [StakeManager contract](https://bscscan.com/address/0x1adB950d8bB3dA4bE104211D5AB038628e477fE6)
- BNB
    - Main oracle: [RedStoneOracle](https://bscscan.com/address/0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a) ([feed](https://bscscan.com/address/0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e))
    - Pivot and fallback oracles: [ChainlinkOracle](https://bscscan.com/address/0x1B2103441A0A108daD8848D8F5d790e4D402921F) ([feed](https://bscscan.com/address/0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE))

**Security and additional considerations**

We applied the following security procedures for this VIP:

- **Audit:** Certik, Peckshield, Hacken and Code4rena have audited the market code. Certik has audited the AsBNBOracle code
- **VIP execution simulation**: in a simulation environment, validating the new markets are properly added to the Liquid Staked BNB pool on BNB Chain, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to BNB testnet, and used in the Venus Protocol testnet deployment

#### Audit reports

- [Certik audit report of AsBNBOracle](https://github.com/VenusProtocol/oracle/blob/e33dd9b60a29d3e69df554136383a6477fa904c5/audits/128_AsBNBOracle_certik_20250320.pdf) (2025/March/20)
- [Certik audit report](https://github.com/VenusProtocol/oracle/blob/93a79c97e867f61652fc063abb5df323acc9bed4/audits/116_WeETHAccountantOracle_certik_20240823.pdf) (2024/08/23)
- [Certik audit report](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/036_isolatedPools_certik_20230619.pdf) (2023/June/19)
- [Code4rena contest](https://code4rena.com/contests/2023-05-venus-protocol-isolated-pools) (2023/May/05)
- [Hacken audit report](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/016_isolatedPools_hacken_20230426.pdf) (2023/April/26)
- [Peckshield audit report 1](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/003_isolatedPools_peckshield_20230112.pdf) (2023/January/12)
- [Peckshield audit report 2](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/037_isolatedPools_peckshield_20230625.pdf) (2023/June/25)

#### Deployed contracts

- Mainnet VToken_vasBNB_LiquidStakedBNB: [0x4A50a0a1c832190362e1491D5bB464b1bc2Bd288](https://bscscan.com/address/0x4A50a0a1c832190362e1491D5bB464b1bc2Bd288)
- Sepolia VToken_vasBNB_LiquidStakedBNB: [0xc9D979AA6F3bE732A53a27188D74e929FD107187](https://testnet.bscscan.com/address/0xc9D979AA6F3bE732A53a27188D74e929FD107187)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/524)
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
            [AS_BNB_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
      },
      {
        target: market.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: ["28800"],
      },
      {
        target: market.vToken.address,
        signature: "setReserveFactor(uint256)",
        params: [market.riskParameters.reserveFactor],
      },
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [token.address, market.initialSupply.amount, NORMAL_TIMELOCK],
      },
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, market.initialSupply.amount],
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
            NORMAL_TIMELOCK,
            market.riskParameters.supplyCap,
            market.riskParameters.borrowCap,
          ],
        ],
      },
      {
        target: market.vToken.address,
        signature: "transfer(address,uint256)",
        params: [ethers.constants.AddressZero, parseUnits("0.01692047", 8)], // around $10
      },
      (() => {
        const vTokensMinted = convertAmountToVTokens(market.initialSupply.amount, market.vToken.exchangeRate);
        const vTokensRemaining = vTokensMinted.sub(parseUnits("0.01692047", 8));
        return {
          target: market.vToken.address,
          signature: "transfer(address,uint256)",
          params: [market.initialSupply.vTokenReceiver, vTokensRemaining],
        };
      })(),
      {
        target: market.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [POOL_REGISTRY, 0],
      },
      {
        target: COMPTROLLER_LIQUID_STAKED_BNB_POOL,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[market.vToken.address], [2], true],
      },
      {
        target: market.vToken.address,
        signature: "setProtocolSeizeShare(uint256)",
        params: [market.riskParameters.protocolSeizeShare],
      },
      {
        target: RISK_FUND_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[0], [token.address], [[CONVERSION_INCENTIVE, 1]]],
      },
      {
        target: USDT_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[1], [token.address], [[CONVERSION_INCENTIVE, 1]]],
      },
      {
        target: USDC_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[2], [token.address], [[CONVERSION_INCENTIVE, 1]]],
      },
      {
        target: BTCB_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[3], [token.address], [[CONVERSION_INCENTIVE, 1]]],
      },
      {
        target: ETH_PRIME_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[4], [token.address], [[CONVERSION_INCENTIVE, 1]]],
      },
      {
        target: XVS_VAULT_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [BaseAssets[5], [token.address], [[CONVERSION_INCENTIVE, 1]]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip469;
