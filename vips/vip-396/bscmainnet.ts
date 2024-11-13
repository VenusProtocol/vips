import { parseUnits } from "ethers/lib/utils";
import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";
import { CRITICAL_TIMELOCK, FAST_TRACK_TIMELOCK, NORMAL_TIMELOCK } from "src/vip-framework";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
export const BNB_AMOUNT = parseUnits("5", 18);

export const BSC_VETH_LST_IRM = "0x49a06B82b3c907AB140879F73f1d8dE262962c30";
export const BSC_vETH_CORE_IRM = "0x3aa125788FC6b9F801772baEa887aA40328015e9";
export const BSC_vETH_CORE = "0xf508fCD89b8bd15579dc79A6827cB4686A3592c8";
export const BSC_vETH_LST = "0xeCCACF760FEA7943C5b0285BD09F601505A29c05";

export const ARBITRUM_vETH_CORE = "0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0";
export const ARBITRUM_vETH_LST = "0x39D6d13Ea59548637104E40e729E4aABE27FE106";
export const ARBITRUM_IRM = "0x425dde630be832195619a06175ba45C827Dd3DCa";

export const ETHEREUM_vETH_CORE = "0x7c8ff7d2A1372433726f879BD945fFb250B94c65";
export const ETHEREUM_vETH_LST = "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2";
export const ETHEREUM_IRM = "0x2F81dAA9de0fD60fb9B105Cfc5b67A31Fda547b6";

export const OPBNB_vETH_CORE = "0x509e81eF638D489936FA85BC58F52Df01190d26C";
export const OPBNB_IRM = "0x0d75544019e3015eEbF61F26595D08d60f3aC841";

export const vFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const SUPPLY_CAP = parseUnits("100000000", 18);
export const BORROW_CAP = parseUnits("80000000", 18);

const vip396 = () => {
  const meta = {
    version: "v2",
    title: "VIP-396 Risk Parameters Adjustments (ETH, FDUSD)",
    description: `#### Description

If passed, this VIP will perform the following actions as per Chaos Labs’ latest recommendations in these Venus community forum publications:

[Chaos Labs - Risk Parameter Updates - 11/11/24](https://community.venus.io/t/chaos-labs-risk-parameter-updates-11-11-24/4718)

- BNB Chain
    - [ETH - Core pool](https://bscscan.com/address/0xf508fCD89b8bd15579dc79A6827cB4686A3592c8)
        - Current kink: 85%. Recommendation: 90%
        - Current multiplier: 0.0425. Recommendation: 0.03
        - Current jump multiplier: 2. Recommendation: 4.5
    - [ETH - Liquid Staked ETH](https://bscscan.com/address/0xeCCACF760FEA7943C5b0285BD09F601505A29c05)
        - Current kink: 80%. Recommendation: 90%
        - Current multiplier: 0.035. Recommendation: 0.03
        - Current jump multiplier: 0.8. Recommendation: 4.5
- Ethereum
    - [WETH - Core](https://etherscan.io/address/0x7c8ff7d2A1372433726f879BD945fFb250B94c65)
        - Current kink: 80%. Recommendation: 90%
        - Current multiplier: 0.09. Recommendation: 0.03
        - Current jump multiplier: 0.75. Recommendation: 4.5
    - [WETH - Liquid Staked ETH](https://etherscan.io/address/0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2)
        - Current jump multiplier: 0.8. Recommendation: 4.5
- Arbitrum
    - [WETH - Core](https://arbiscan.io/address/0x68a34332983f4Bf866768DD6D6E638b02eF5e1f0)
        - Current kink: 80%. Recommendation: 90%
        - Current multiplier: 0.035. Recommendation: 0.03
        - Current jump multiplier: 2.5. Recommendation: 4.5
    - [WETH - Liquid Staked ETH](https://arbiscan.io/address/0x39D6d13Ea59548637104E40e729E4aABE27FE106)
        - Current kink: 80%. Recommendation: 90%
        - Current multiplier: 0.035. Recommendation: 0.03
        - Current jump multiplier: 2.5. Recommendation: 4.5
- opBNB
    - [ETH - Core](https://opbnbscan.com/address/0x509e81eF638D489936FA85BC58F52Df01190d26C)
        - Current kink: 45%. Recommendation: 90%
        - Current jump multiplier: 1. Recommendation: 4.5

[Chaos Labs - Risk Parameter Updates - 11/13/24](https://community.venus.io/t/chaos-labs-risk-parameter-updates-11-13-24/4722)

- [FDUSD (Core pool)](https://bscscan.com/address/0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba):
    - Increase supply cap, from 45M FDUSD to 100M FDUSD
    - Increase borrow cap, from 40M FDUSD to 80M FDUSD

Complete analysis and details of these recommendations are available in the above publications.

Moreover, this VIP will transfer 5 BNB from the [Venus Treasury on BNB](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) to the timelock contracts ([Normal Timelock](https://bscscan.com/address/0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396), [Fast-track Timelock](https://bscscan.com/address/0x555ba73dB1b006F3f2C7dB7126d6e4343aDBce02) and [Critical Timelock](https://bscscan.com/address/0x213c446ec11e45b15a6E29C1C1b402B8897f606d)), to fund the cross-chain messages sent on this VIP and in the future.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/422](https://github.com/VenusProtocol/vips/pull/422)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [BNB_AMOUNT, NORMAL_TIMELOCK],
        value: "0",
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [BNB_AMOUNT, FAST_TRACK_TIMELOCK],
        value: "0",
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBNB(uint256,address)",
        params: [BNB_AMOUNT, CRITICAL_TIMELOCK],
        value: "0",
      },
      {
        target: BSC_vETH_CORE,
        signature: "_setInterestRateModel(address)",
        params: [BSC_vETH_CORE_IRM],
      },
      {
        target: BSC_vETH_LST,
        signature: "setInterestRateModel(address)",
        params: [BSC_VETH_LST_IRM],
      },
      {
        target: ARBITRUM_vETH_CORE,
        signature: "setInterestRateModel(address)",
        params: [ARBITRUM_IRM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ARBITRUM_vETH_LST,
        signature: "setInterestRateModel(address)",
        params: [ARBITRUM_IRM],
        dstChainId: LzChainId.arbitrumone,
      },
      {
        target: ETHEREUM_vETH_CORE,
        signature: "setInterestRateModel(address)",
        params: [ETHEREUM_IRM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: ETHEREUM_vETH_LST,
        signature: "setInterestRateModel(address)",
        params: [ETHEREUM_IRM],
        dstChainId: LzChainId.ethereum,
      },
      {
        target: OPBNB_vETH_CORE,
        signature: "setInterestRateModel(address)",
        params: [OPBNB_IRM],
        dstChainId: LzChainId.opbnbmainnet,
      },

      {
        target: COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vFDUSD], [SUPPLY_CAP]],
      },
      {
        target: COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vFDUSD], [BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip396;
