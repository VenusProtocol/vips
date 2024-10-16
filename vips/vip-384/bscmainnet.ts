import { BigNumberish } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const TWT = "0x4B0F1812e5Df2A09796481Ff14017e6005508003";
export const VTWT = "0x4d41a36D04D97785bcEA57b057C412b278e6Edcc";
export const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
export const ACCESS_CONTROL_MANAGER = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
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
export const AMOUNT_TO_REFUND = parseUnits("5000", 18);
export const INITIAL_FUNDING = parseUnits("4401.074", 18);
export const INITIAL_VTOKENS = parseUnits("4401.074", 8);

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
const { bscmainnet } = NETWORK_ADDRESSES;

export const vip384 = () => {
  const meta = {
    version: "v2",
    title: "VIP-384 [BNB Chain] Add support for TWT on Venus Core Pool",
    description: `#### Summary

If passed, this VIP will add a new market for the [TWT token](https://bscscan.com/address/0x4B0F1812e5Df2A09796481Ff14017e6005508003) on Venus Core Pool. Moreover, it will transfer 5,000 USDT to the [Community wallet](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391) to compensate for the [provision of the bootstrap liquidity for the market](https://bscscan.com/tx/0x11eefc53948862dd2f1888f6531de87451956c4c998a256181690c782d476641).

#### Description

Following [Chaos Labs recommendations](https://community.venus.io/t/chaos-labs-risk-parameter-updates-10-08-24/4606), the risk parameters for the new markets are:

- Underlying token: [TWT](https://bscscan.com/address/0x4B0F1812e5Df2A09796481Ff14017e6005508003)
- Borrow cap: 1,000,000 TWT
- Supply cap: 2,000,000 TWT
- Collateral factor: 50%
- Reserve factor: 25%

Bootstrap liquidity: 4,401 TWT - provided by the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9).

Interest rate curve for the new market:

- kink: 50%
- base (yearly): 2%
- multiplier (yearly): 20%
- jump multiplier (yearly): 300%

Oracle configuration:

- Main oracle: [Binance oracle](https://oracle.binance.com/data-feeds/detail/bsc/TWT-USD)

#### Security and additional considerations

No changes in the code are involved in this VIP. We applied the following security procedures for this upgrade:

- **VIP execution simulation**: in a simulation environment, validating the new market is properly added to the core pool with the right parameters and the expected bootstrap liquidity
- **Deployment on testnet**: the same market has been deployed to testnet, and used in the Venus Protocol testnet deployment

#### Deployed contracts

- Mainnet TWT market (vTWT): [0x4d41a36D04D97785bcEA57b057C412b278e6Edcc](https://bscscan.com/address/0x4d41a36D04D97785bcEA57b057C412b278e6Edcc)
- Testnet TWT market (vTWT): [0x95DaED37fdD3F557b3A5cCEb7D50Be65b36721DF](https://testnet.bscscan.com/address/0x95DaED37fdD3F557b3A5cCEb7D50Be65b36721DF)

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/410)
- [Testnet deployment](https://testnet.bscscan.com/tx/0x5af480c14229d75b13cff75901e00090c78dfae8f997f645be84990b36528977)
- Snapshot “[[BNB Chain] Add support for Trust Wallet (TWT) on Venus Core pool](https://snapshot.org/#/venus-xvs.eth/proposal/0xe58d6379604c1b27527d16dccf81ac66a1aba8c963e322dcaf79f2deb62c680e)”
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "Process to configure and launch the new market",
    againstDescription: "Defer configuration and launch of the new market",
    abstainDescription: "No opinion on the matter",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_supportMarket(address)",
        params: [VTWT],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[VTWT], [parseUnits("2000000", 18)]],
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[VTWT], [parseUnits("1000000", 18)]],
      },
      {
        target: COMPTROLLER,
        signature: "_setCollateralFactor(address,uint256)",
        params: [VTWT, parseUnits("0.5", 18)],
      },
      {
        target: VTWT,
        signature: "setAccessControlManager(address)",
        params: [ACCESS_CONTROL_MANAGER],
      },
      {
        target: VTWT,
        signature: "setProtocolShareReserve(address)",
        params: [PROTOCOL_SHARE_RESERVE],
      },
      {
        target: VTWT,
        signature: "setReduceReservesBlockDelta(uint256)",
        params: [28800],
      },
      {
        target: VTWT,
        signature: "_setReserveFactor(uint256)",
        params: ["250000000000000000"],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [TWT, INITIAL_FUNDING, bscmainnet.NORMAL_TIMELOCK],
      },
      {
        target: TWT,
        signature: "approve(address,uint256)",
        params: [VTWT, 0],
      },

      {
        target: TWT,
        signature: "approve(address,uint256)",
        params: [VTWT, INITIAL_FUNDING],
      },
      {
        target: VTWT,
        signature: "mint(uint256)",
        params: [INITIAL_FUNDING],
      },

      {
        target: VTWT,
        signature: "transfer(address,uint256)",
        params: [bscmainnet.VTREASURY, INITIAL_VTOKENS],
      },
      {
        target: bscmainnet.VTREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, AMOUNT_TO_REFUND, COMMUNITY_WALLET],
      },
      ...configureConverters([TWT]),
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip384;
