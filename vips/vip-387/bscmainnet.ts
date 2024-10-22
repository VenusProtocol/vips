import { BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { NORMAL_TIMELOCK } from "src/vip-framework";

const { VTREASURY, RESILIENT_ORACLE, REDSTONE_ORACLE, UNITROLLER, ACCESS_CONTROL_MANAGER } =
  NETWORK_ADDRESSES.bscmainnet;
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const SOLVBTC = "0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7";
const SOLVBTC_VTOKEN = "0xf841cb62c19fCd4fF5CD0AaB5939f3140BaaC3Ea";
export const SOLVBTC_REDSTONE_FEED = "0xF5F641fF3c7E39876A76e77E84041C300DFa4550";
const SOLVBTC_MAX_STALE_PERIOD = 7 * 3600; // 7 hours
const REDUCE_RESERVES_BLOCK_DELTA = "28800";

const USDT = "0x55d398326f99059fF775485246999027B3197955";
const USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d";
const BTCB = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const XVS = "0xcF6BB5389c92Bdda8a3747Ddb454cB7a64626C63";
const ETH = "0x2170Ed0880ac9A755fd29B2688956BD959F933F8";
const RISK_FUND_CONVERTER = "0xA5622D276CcbB8d9BBE3D1ffd1BB11a0032E53F0";
const USDT_PRIME_CONVERTER = "0xD9f101AA67F3D72662609a2703387242452078C3";
const USDC_PRIME_CONVERTER = "0xa758c9C215B6c4198F0a0e3FA46395Fa15Db691b";
const BTCB_PRIME_CONVERTER = "0xE8CeAa79f082768f99266dFd208d665d2Dd18f53";
const ETH_PRIME_CONVERTER = "0xca430B8A97Ea918fF634162acb0b731445B8195E";
const XVS_VAULT_CONVERTER = "0xd5b9AE835F4C59272032B3B954417179573331E0";

export const EXPECTED_CONVERSION_INCENTIVE = 1e14;
export const converterBaseAssets = {
  [RISK_FUND_CONVERTER]: USDT,
  [USDT_PRIME_CONVERTER]: USDT,
  [USDC_PRIME_CONVERTER]: USDC,
  [BTCB_PRIME_CONVERTER]: BTCB,
  [ETH_PRIME_CONVERTER]: ETH,
  [XVS_VAULT_CONVERTER]: XVS,
};

const configureConverters = (fromAssets: string[], incentive: BigNumberish = EXPECTED_CONVERSION_INCENTIVE) => {
  enum ConversionAccessibility {
    NONE = 0,
    ALL = 1,
    ONLY_FOR_CONVERTERS = 2,
    ONLY_FOR_USERS = 3,
  }

  return Object.entries(converterBaseAssets).map(([converter, baseAsset]: [string, string]) => {
    const conversionConfigs = fromAssets.map(() => [incentive, ConversionAccessibility.ALL]);
    return {
      target: converter,
      signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
      params: [baseAsset, fromAssets, conversionConfigs],
    };
  });
};

export const marketSpec = {
  vToken: {
    address: SOLVBTC_VTOKEN,
    name: "Venus SolvBTC",
    symbol: "vSolvBTC",
    underlying: {
      address: SOLVBTC,
      decimals: 18,
      symbol: "SolvBTC",
    },
    decimals: 8,
    exchangeRate: parseUnits("1", 28),
    comptroller: UNITROLLER,
    isLegacyPool: true,
  },
  interestRateModel: {
    address: "0xf092558eD27Df036144f6d92cC657BAc9682A324",
    base: "0",
    multiplier: "0.09",
    jump: "2",
    kink: "0.5",
  },
  initialSupply: {
    amount: parseUnits("0.1572404", 18),
    vTokenReceiver: "0xD5bAa0C3d61Ba3f4899565f269e5f9b186AAf14B",
  },
  riskParameters: {
    supplyCap: parseUnits("100", 18),
    borrowCap: parseUnits("55", 18),
    collateralFactor: parseUnits("0.75", 18),
    reserveFactor: parseUnits("0.2", 18),
  },
};

export const vip387 = () => {
  const meta = {
    version: "v2",
    title: "VIP-387 [BNB Chain] Add support for SolvBTC on Venus Core Pool",
    description: `#### Summary

If passed, this VIP will add a new market for the [SolvBTC token](https://bscscan.com/address/0x4aae823a6a0b376de6a78e74ecc5b079d38cbcf7) on Venus Core Pool.

#### Description

**Risk parameters**

Following [Chaos Labs recommendations](https://community.venus.io/t/proposal-add-support-for-the-solvbtc-market-on-venus-core-pool/4525/11), the risk parameters for the new markets are:

- Underlying token: [SolvBTC](https://bscscan.com/address/0x4aae823a6a0b376de6a78e74ecc5b079d38cbcf7)
- Borrow cap: 55 SolvBTC
- Supply cap: 100 SolvBTC
- Collateral factor: 75%
- Reserve factor: 20%

Bootstrap liquidity: 0.1572404 SolvBTC - provided by the [SolvBTC project](https://solv.finance/).

Interest rate curve for the new market:

- kink: 50%
- base (yearly): 0
- multiplier (yearly): 9%
- jump multiplier (yearly): 200%

Oracle configuration:

- Main oracle: [RedStoneOracle](https://bscscan.com/address/0x8455EFA4D7Ff63b8BFD96AdD889483Ea7d39B70a)
- Feed: [0xF5F641fF3c7E39876A76e77E84041C300DFa4550](https://bscscan.com/address/0xF5F641fF3c7E39876A76e77E84041C300DFa4550)

#### Security and additional considerations

No changes in the code are involved in this VIP. We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the core pool with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to testnet, and used in the Venus Protocol testnet deployment

#### Deployed contracts

- **Mainnet SolvBTC market (vSolvBTC)**: [0x3e6d2c5b235070DAD569Bc40689C589db286F445](https://bscscan.com/address/0x3e6d2c5b235070DAD569Bc40689C589db286F445)
- **Testnet SolvBTC market (vSolvBTC)**: [0xA38110ae4451A86ab754695057d5B5a9BEAd0387](https://testnet.bscscan.com/address/0xA38110ae4451A86ab754695057d5B5a9BEAd0387)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/407)
- [Testnet deployment](https://testnet.bscscan.com/tx/0x8a6017f351c1e8b4ae5a34419a1e17fb51366ac04b02b0aec203e67135cd1eca)
- Snapshot “[[BNB Chain] Add support for the SolvBTC market on Venus Core Pool](https://snapshot.org/#/venus-xvs.eth/proposal/0xdd06e54960ca61ba0a39a9a00d6e18f5e6ee07e1e78d416af1d3e2f5a7b79c23)”
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Configure Oracle
      {
        target: REDSTONE_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[marketSpec.vToken.underlying.address, SOLVBTC_REDSTONE_FEED, SOLVBTC_MAX_STALE_PERIOD]],
      },

      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            marketSpec.vToken.underlying.address,
            [REDSTONE_ORACLE, ethers.constants.AddressZero, ethers.constants.AddressZero],
            [true, false, false],
          ],
        ],
      },

      // Add Market
      {
        target: marketSpec.vToken.comptroller,
        signature: "_supportMarket(address)",
        params: [marketSpec.vToken.address],
      },

      {
        target: marketSpec.vToken.comptroller,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[marketSpec.vToken.address], [marketSpec.riskParameters.supplyCap]],
      },

      {
        target: marketSpec.vToken.comptroller,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[marketSpec.vToken.address], [marketSpec.riskParameters.borrowCap]],
      },

      {
        target: marketSpec.vToken.comptroller,
        signature: "_setCollateralFactor(address,uint256)",
        params: [marketSpec.vToken.address, marketSpec.riskParameters.collateralFactor],
      },

      {
        target: marketSpec.vToken.address,
        signature: "setAccessControlManager(address)",
        params: [ACCESS_CONTROL_MANAGER],
      },
      {
        target: marketSpec.vToken.address,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },

      {
        target: marketSpec.vToken.address,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [REDUCE_RESERVES_BLOCK_DELTA],
      },
      {
        target: marketSpec.vToken.address,
        signature: "_setReserveFactor(uint256)",
        params: [marketSpec.riskParameters.reserveFactor],
      },

      // Mint initial supply
      {
        target: VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [marketSpec.vToken.underlying.address, marketSpec.initialSupply.amount, NORMAL_TIMELOCK],
      },
      {
        target: marketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [marketSpec.vToken.address, marketSpec.initialSupply.amount],
      },
      {
        target: marketSpec.vToken.address,
        signature: "mintBehalf(address,uint256)",
        params: [marketSpec.initialSupply.vTokenReceiver, marketSpec.initialSupply.amount],
      },
      {
        target: marketSpec.vToken.underlying.address,
        signature: "approve(address,uint256)",
        params: [marketSpec.vToken.address, 0],
      },

      ...configureConverters([marketSpec.vToken.underlying.address]),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip387;
