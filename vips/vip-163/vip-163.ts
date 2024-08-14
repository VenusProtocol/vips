import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const COMPTROLLER_BEACON = "0x38B4Efab9ea1bAcD19dC81f19c4D1C2F9DeAe1B2";
const COMPTROLLER_NEW_IMPLEMENTATION = "0x17a6ac4f7f01387303deB1D78f01aC0A0C1a75b0";
const HAY_REWARDS_DISTRIBUTOR = "0xA31185D804BF9209347698128984a43A67Ce6d11";
const SD_REWARDS_DISTRIBUTOR = "0xBE607b239a8776B47159e2b0E9E65a7F1DAA6478";
const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const STABLE_COINS_POOL = "0x94c1495cD4c557f1560Cbd68EAB0d197e6291571";
const LIQUID_STAKED_BNB_POOL = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
const HAY_TOKEN = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";
const SD_TOKEN = "0x3BC5AC0dFdC871B365d159f728dd1B9A0B5481E8";
const HAY_AMOUNT = "2000000000000000000000";
const SD_AMOUNT = "2000000000000000000000";
const MARKET_BNBx = "0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791";
const MARKET_HAY = "0xCa2D81AA7C09A1a025De797600A7081146dceEd9";

export const vip163 = () => {
  const meta = {
    version: "v2",
    title: "VIP-163 Isolated Lending Pools: Configure Liquidity Mining for BNBx and HAY",
    description: `**Summary**

If passed, this VIP will perform the following actions:

* Enable rewards in the following markets:
    * BNBx market in the Liquid Staked BNB pool for 30 days
    * HAY market in the Stablecoins pool for 28 days
* Upgrade the Comptroller implementation of the Isolated pools

**Description**

Following up on the [VIP-140](https://app.venus.io/governance/proposal/140), this VIP will enable the following new rewards. The specific rewards are:

* [vBNBx_LiquidStakedBNB](https://app.venus.io/#/isolated-pools/pool/0xd933909A4a2b7A4638903028f44D1d38ce27c352/market/0x5E21bF67a6af41c74C1773E4b473ca5ce8fd3791): 2,000 [SD](https://bscscan.com/address/0x3BC5AC0dFdC871B365d159f728dd1B9A0B5481E8) for 30 days, provided by the Stader labs team, only for the suppliers of the markets
* [vHAY_Stablecoins](https://app.venus.io/#/isolated-pools/pool/0x94c1495cD4c557f1560Cbd68EAB0d197e6291571/market/0xca2d81aa7c09a1a025de797600a7081146dceed9): 2,000 [HAY](https://bscscan.com/address/0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5) for 28 days, provided by the [Helio Protocol](https://helio.money/). 50/50 for suppliers/borrowers

The exact blocks where the new rewards will stop will be defined in a new VIP in the future.

The upgrade of the Comptroller contract in the Isolated pools will allow several RewardsDistributor contracts in one pool using the same reward token.

**Security and additional considerations**

We applied the following security procedures for this upgrade:

* **Unit tests**: validating the Comptroller is able to have several RewardsDistributor contracts associated using the same reward token
* **VIP simulation**: in a simulation environment, validating the VIP is executed as expected
* **Deployment on testnet**: the same VIP has been executed on testnet, with similar rewards in the Venus Protocol testnet deployment
* **Audit: Certik has audited the deployed code. [Report](https://github.com/VenusProtocol/isolated-pools/blob/ec1d8b32e120a0cc52acca8c8ca5bb922d805ac8/audits/069_comptroller_certik_20230824.pdf)**

**References**

* [Repository](https://github.com/VenusProtocol/isolated-pools)
* [VIP simulation](https://github.com/VenusProtocol/vips/pull/63)
* [Unit tests](https://github.com/VenusProtocol/isolated-pools/blob/develop/tests/hardhat/Rewards.ts)
* [VIP executed on testnet](https://testnet.bscscan.com/tx/0xb06be6ed9813e4e4c675702bd74bb0f75c897c25365d9eea3387520c9ff39257)
* [Documentation](https://docs-v4.venus.io/whats-new/reward-distributor)`,
    forDescription: "Process to configure Liquidity Mining",
    againstDescription: "Defer configuration of Liquidity Mining",
    abstainDescription: "No opinion on the matter",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [COMPTROLLER_NEW_IMPLEMENTATION],
      },
      {
        target: HAY_REWARDS_DISTRIBUTOR,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: SD_REWARDS_DISTRIBUTOR,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [HAY_TOKEN, HAY_AMOUNT, HAY_REWARDS_DISTRIBUTOR],
      },
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [SD_TOKEN, SD_AMOUNT, SD_REWARDS_DISTRIBUTOR],
      },
      {
        target: STABLE_COINS_POOL,
        signature: "addRewardsDistributor(address)",
        params: [HAY_REWARDS_DISTRIBUTOR],
      },
      {
        target: LIQUID_STAKED_BNB_POOL,
        signature: "addRewardsDistributor(address)",
        params: [SD_REWARDS_DISTRIBUTOR],
      },
      {
        target: HAY_REWARDS_DISTRIBUTOR,
        signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        params: [[MARKET_HAY], ["1240079365079365"], ["1240079365079365"]],
      },
      {
        target: SD_REWARDS_DISTRIBUTOR,
        signature: "setRewardTokenSpeeds(address[],uint256[],uint256[])",
        params: [[MARKET_BNBx], ["2314814814814814"], ["0"]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
