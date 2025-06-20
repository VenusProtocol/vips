import { BigNumber } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};

export const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
export const REDUCE_RESERVES_BLOCK_DELTA_BSC = "28800";

export const asBNBMarketSpec = {
  vToken: {
    address: "0x73F506Aefd5e169D48Ea21A373B9B0a200E37585",
    name: "Venus asBNB",
    symbol: "vasBNB",
    underlying: {
      address: "0xc625f060ad25f4A6c2d9eBF30C133dB61B7AF072",
      symbol: "asBNB",
      decimals: 18,
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: bsctestnet.UNITROLLER,
    isLegacyPool: true,
  },
  interestRateModel: {
    model: "jump",
    baseRatePerYear: "0",
    multiplierPerYear: "0.09",
    jumpMultiplierPerYear: "2",
    kink: "0.5",
  },
  initialSupply: {
    amount: parseUnits("0.14", 18), // 0.14 asBNB
    vTokensToBurn: parseUnits("0.14", 8), // 0.14 vasBNB
    vTokenReceiver: bsctestnet.VTREASURY,
  },
  riskParameters: {
    supplyCap: parseUnits("2000", 18), // 2000 asBNB
    borrowCap: parseUnits("0", 18), // 0 asBNB
    collateralFactor: parseUnits("0.72", 18),
    reserveFactor: parseUnits("0.1", 18),
  },
};

export const convertAmountToVTokens = (amount: BigNumber, exchangeRate: BigNumber) => {
  const EXP_SCALE = parseUnits("1", 18);
  return amount.mul(EXP_SCALE).div(exchangeRate);
};

export const vip518 = () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-518 [BNB Chain] New asBNB market in the Core pool",
    description: `#### Summary

If passed, this VIP will add the [asBNB](https://bscscan.com/address/0x77734e70b6E88b4d82fE632a168EDf6e700912b6) market to the [Core pool on BNB Chain](https://app.venus.io/#/core-pool?chainId=56), following the Community proposal “[Support USDF/asBNB from Aster on Venus Core Pool of BNB Chain](https://community.venus.io/t/support-usdf-asbnb-from-aster-on-venus-core-pool-of-bnb-chain/5035)” ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0x07c8120b7a01b90df5531543d6ed6ead21af7367fc9f1ec445ef9403f089e5c7)).

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/support-usdf-asbnb-from-aster-on-venus-core-pool-of-bnb-chain/5035/8), the risk parameters for the new market are:

Underlying token: [asBNB](https://bscscan.com/address/0x77734e70b6E88b4d82fE632a168EDf6e700912b6)

- Borrow cap: 0 asBNB
- Supply cap: 2,000 asBNB
- Collateral factor: 72%
- Reserve factor: 10%
- Liquidation Penalty: 10%

The interest rate curve for the new market is not relevant because the asset is not borrowable, but these parameters will be set anyway:

- kink: 50%
- base (yearly): 0%
- multiplier (yearly): 9%
- jump multiplier (yearly): 200%

**Oracles configuration**

The [ResilientOracle](https://docs-v4.venus.io/risk/resilient-price-oracle) deployed to [BNB Chain](https://bscscan.com/address/0x6592b5DE802159F3E74B2486b091D11a8256ab8A) is used for asBNB, with the following configuration

- asBNB
    - Main oracle: [AsBNBOracle](https://bscscan.com/address/0x652B90D1d45a7cD5BE82c5Fb61a4A00bA126dde5), that will internally use the ratio asBNB/slisBNB
- slisBNB
    - Main oracle: [SlisBNBOracle](https://bscscan.com/address/0xDDE6446E66c786afF4cd3D183a908bCDa57DF9c1), that will internally use the ratio slisBNB/BNB provided by [StakeManager contract](https://bscscan.com/address/0x1adB950d8bB3dA4bE104211D5AB038628e477fE6)
- BNB
    - Main oracle: [RedStoneOracle](https://bscscan.com/address/0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a) ([feed](https://bscscan.com/address/0x8dd2D85C7c28F43F965AE4d9545189C7D022ED0e))
    - Pivot oracle: [ChainlinkOracle](https://bscscan.com/address/0x1B2103441A0A108daD8848D8F5d790e4D402921F) ([feed](https://bscscan.com/address/0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aeE))
    - Fallback oracle: [BinanceOracle](https://bscscan.com/address/0x594810b741d136f1960141C0d8Fb4a91bE78A820)

#### Security and additional considerations

We applied the following security procedures for this VIP:

- **Audit**: Certik, Peckshield, Hacken and Code4rena have audited the market code. Certik has audited the AsBNBOracle code
- **VIP execution simulation**: in a simulation environment, validating the new markets are properly added to the Core pool on BNB Chain, with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to BNB testnet, and used in the Venus Protocol testnet deployment

#### Audit reports

- [Certik audit report of AsBNBOracle (2025/March/20)](https://github.com/VenusProtocol/oracle/blob/e33dd9b60a29d3e69df554136383a6477fa904c5/audits/128_AsBNBOracle_certik_20250320.pdf)
- [Certik audit report](https://github.com/VenusProtocol/oracle/blob/93a79c97e867f61652fc063abb5df323acc9bed4/audits/116_WeETHAccountantOracle_certik_20240823.pdf) (2024/08/23)
- [Certik audit report](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/036_isolatedPools_certik_20230619.pdf) (2023/June/19)
- [Code4rena contest](https://code4rena.com/contests/2023-05-venus-protocol-isolated-pools) (2023/May/05)
- [Hacken audit report](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/016_isolatedPools_hacken_20230426.pdf) (2023/April/26)
- [Peckshield audit report 1](https://github.com/VenusProtocol/isolated-pools/blob/c801e898e034e313e885c5d486ed27c15e7e2abf/audits/003_isolatedPools_peckshield_20230112.pdf) (2023/January/12)
- [Peckshield audit report 2](https://github.com/VenusProtocol/isolated-pools/blob/1d60500e28d4912601bac461870c754dd9e72341/audits/037_isolatedPools_peckshield_20230625.pdf) (2023/June/25)

#### Deployed contracts

- Mainnet VToken_vasBNB: [0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF](https://bscscan.com/address/0xCC1dB43a06d97f736C7B045AedD03C6707c09BDF)
- Testnet VToken_vasBNB: [0x73F506Aefd5e169D48Ea21A373B9B0a200E37585](https://testnet.bscscan.com/address/0x73F506Aefd5e169D48Ea21A373B9B0a200E37585)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/577)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Add Market for asBNB
      {
        target: asBNBMarketSpec.vToken.comptroller,
        signature: "_supportMarket(address)",
        params: [asBNBMarketSpec.vToken.address],
      },
      {
        target: asBNBMarketSpec.vToken.comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[asBNBMarketSpec.vToken.address], [asBNBMarketSpec.riskParameters.supplyCap]],
      },
      {
        target: asBNBMarketSpec.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[asBNBMarketSpec.vToken.address], [asBNBMarketSpec.riskParameters.borrowCap]],
      },
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "setAccessControlManager(address)",
        params: [bsctestnet.ACCESS_CONTROL_MANAGER],
      },
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA_BSC],
      },
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "_setReserveFactor(uint256)",
        params: [asBNBMarketSpec.riskParameters.reserveFactor],
      },
      {
        target: asBNBMarketSpec.vToken.comptroller,
        signature: "_setCollateralFactor(address,uint256)",
        params: [asBNBMarketSpec.vToken.address, asBNBMarketSpec.riskParameters.collateralFactor],
      },
      {
        target: asBNBMarketSpec.vToken.underlying.address,
        signature: "faucet(uint256)",
        params: [asBNBMarketSpec.initialSupply.amount],
      },
      {
        target: asBNBMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [asBNBMarketSpec.vToken.address, asBNBMarketSpec.initialSupply.amount],
      },
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "mintBehalf(address,uint256)",
        params: [bsctestnet.NORMAL_TIMELOCK, asBNBMarketSpec.initialSupply.amount],
      },
      {
        target: asBNBMarketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [asBNBMarketSpec.vToken.address, 0],
      },
      {
        target: asBNBMarketSpec.vToken.address,
        signature: "transfer(address,uint256)",
        params: [asBNBMarketSpec.initialSupply.vTokenReceiver, asBNBMarketSpec.initialSupply.vTokensToBurn],
      },
      // Pause asBNB market
      {
        target: asBNBMarketSpec.vToken.comptroller,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[asBNBMarketSpec.vToken.address], [Actions.BORROW], true],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip518;
