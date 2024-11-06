import { parseUnits } from "ethers/lib/utils";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const LST_BNB_COMPTROLLER = "0xd933909A4a2b7A4638903028f44D1d38ce27c352";
export const CORE_COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const vstkBNB = "0xcc5D9e502574cda17215E70bC0B4546663785227";
export const vMATIC = "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8";
export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};
export const RESERVE_FACTOR = parseUnits("1", 18);
export const COLLATERAL_FACTOR = 0;
export const LIQUIDATION_THRESHOLD = parseUnits("0.93", 18);
export const vstkBNB_SUPPLY_CAP = 0;
export const vstkBNB_BORROW_CAP = 0;
export const vMATIC_SUPPLY_CAP = parseUnits("5500000", 18);
export const vMATIC_BORROW_CAP = parseUnits("250000", 18);

export const vip375 = () => {
  const meta = {
    version: "v2",
    title: "VIP-375 Risk Parameters Adjustment (stkBNB, MATIC, zkSync caps)",
    description: `If passed, this VIP will perform the following actions as per Chaos Labs’ latest recommendations in this Venus community forum publication: [Chaos Labs - Deprecate stkBNB - 09/25/24](https://community.venus.io/t/chaos-labs-deprecate-stkbnb-09-25-24/4584).

- Pause supply, borrow and enter market actions in the [vstkBNB market](https://bscscan.com/address/0xcc5D9e502574cda17215E70bC0B4546663785227)
- Set borrow and supply caps to 0
- Increase vstkBNB Reserve Factor to 100%
- Reduce CF from 75% to 0%

Moreover, it would update the following caps on zkSync Era, following this forum publication: [Chaos Labs - Risk Parameter Updates - 09/25/24](https://community.venus.io/t/chaos-labs-risk-parameter-updates-09-25-24/4586):

- [USDC.e (Core pool)](https://explorer.zksync.io/address/0x1aF23bD57c62A99C59aD48236553D0Dd11e49D2D):
    - increase supply cap from 5M USDC.e to 6M USDC.e
    - increase borrow cap from 4.2M USDC.e to 5.4M USDC.e
- [ZK (Core pool)](https://explorer.zksync.io/address/0x697a70779C1A03Ba2BD28b7627a902BFf831b616): increase supply cap from 25M ZK to 35M ZK
- [WETH (Core pool)](https://explorer.zksync.io/address/0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8): increase supply cap from 2,000 WETH to 3,000 WETH

And finally, it would update the following caps on BNB Chain, following this forum publication: [Chaos Labs - Risk Parameter Updates: MATIC on BNB - 09/25/24](https://community.venus.io/t/chaos-labs-risk-parameter-updates-matic-on-bnb-09-25-24/4585):

- [MATIC (Core pool)](https://bscscan.com/address/0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8):
    - decrease supply cap from 10M MATIC to 5.5M MATIC
    - decrease borrow cap from 1M MATIC to 250K MATIC

Review the Chaos Labs’ recommendations for a deeper analysis.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/396](https://github.com/VenusProtocol/vips/pull/396)

#### Disclaimer for zkSync Era VIPs

Privilege commands on zkSync Era will be executed by the [](https://etherscan.io/address/0x285960C5B22fD66A736C7136967A3eB15e93CC67)[Guardian wallet](https://explorer.zksync.io/address/0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa), until the [Multichain Governance](https://docs-v4.venus.io/technical-reference/reference-technical-articles/multichain-governance) contracts are fully enabled. If this VIP passes, [](https://app.safe.global/transactions/tx?safe=eth:0x285960C5B22fD66A736C7136967A3eB15e93CC67&id=multisig_0x285960C5B22fD66A736C7136967A3eB15e93CC67_0x79ca5d7ef82648f5c52054aa996356da270a60e95a959c595ee3c29defc6a4ca)[this](https://app.safe.global/transactions/tx?safe=zksync:0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa&id=multisig_0x751Aa759cfBB6CE71A43b48e40e1cCcFC66Ba4aa_0x047e668610a1d6906903e4152bb114be57a49af4fa117ba42b7e575e8ceb5b78) multisig transaction will be executed. Otherwise, it will be rejected.`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: LST_BNB_COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[vstkBNB], [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET], true],
      },
      {
        target: vstkBNB,
        signature: "setReserveFactor(uint256)",
        params: [RESERVE_FACTOR],
      },
      {
        target: LST_BNB_COMPTROLLER,
        signature: "setCollateralFactor(address,uint256,uint256)",
        params: [vstkBNB, COLLATERAL_FACTOR, LIQUIDATION_THRESHOLD],
      },
      {
        target: LST_BNB_COMPTROLLER,
        signature: "setMarketBorrowCaps(address[],uint256[])",
        params: [[vstkBNB], [vstkBNB_BORROW_CAP]],
      },
      {
        target: LST_BNB_COMPTROLLER,
        signature: "setMarketSupplyCaps(address[],uint256[])",
        params: [[vstkBNB], [vstkBNB_SUPPLY_CAP]],
      },
      {
        target: CORE_COMPTROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vMATIC], [vMATIC_BORROW_CAP]],
      },
      {
        target: CORE_COMPTROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vMATIC], [vMATIC_SUPPLY_CAP]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip375;
