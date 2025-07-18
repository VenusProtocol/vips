import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId, ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { zksyncmainnet, bscmainnet } = NETWORK_ADDRESSES;
export const USDM = "0x7715c206A14Ac93Cb1A6c0316A6E5f8aD7c9Dc31";
export const PRICE = parseUnits("1", 18);

export const vMATIC = "0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8";
export const MATIC = "0xCC42724C6683B7E57334c4E856f4c9965ED682bD";
export const MATIC_FEED = "0x081195B56674bb87b2B92F6D58F7c5f449aCE19d";
export const MAX_STALE_PERIOD = 900; // 15 minutes
export const SUPPLY_CAP = parseUnits("2500000", 18);
export const BORROW_CAP = parseUnits("100000", 18);

export const vip531 = async (maxStalePeriod?: number) => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-531 [BNB Chain][ZKSync] Risk Parameters Adjustments (MATIC, wUSDM)",
    description: `If passed, this VIP will perform the changes recommended by Chaos Labs in the Venus community forum publication [Chaos Labs - MATIC and wUSDM Risk Update](https://community.venus.io/t/chaos-labs-matic-and-wusdm-risk-update/5216):

- [MATIC (Core pool)](https://app.venus.io/#/core-pool/market/0x5c9476FcD6a4F9a3654139721c949c2233bBbBc8?chainId=56) / BNB Chain:
    - Update the price feed, switching to a POL/USD feed. The [Chainlink feed for POL/USD](https://bscscan.com/address/0x081195B56674bb87b2B92F6D58F7c5f449aCE19d) will be used
    - Decrease the supply cap of MATIC, from 5,500,000 MATIC to 2,500,000 MATIC
    - Decrease the borrow cap of MATIC, from 250,000 MATIC to 100,000 MATIC
- [wUSDM (Core pool)](https://app.venus.io/#/core-pool/market/0x183dE3C349fCf546aAe925E1c7F364EA6FB4033c?chainId=324) / ZKSync:
    - Fix the price of USDM to $1 in ZKSync Era. The price of the [wUSDM](https://app.venus.io/#/core-pool/market/0x183dE3C349fCf546aAe925E1c7F364EA6FB4033c?chainId=324) asset depends on the USDM/USD price

Complete analysis and details of this recommendation are available in the above publication.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/592)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: zksyncmainnet.CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [USDM, PRICE],
        dstChainId: LzChainId.zksyncmainnet,
      },
      {
        target: bscmainnet.CHAINLINK_ORACLE,
        signature: "setTokenConfig((address,address,uint256))",
        params: [[MATIC, MATIC_FEED, maxStalePeriod || MAX_STALE_PERIOD]],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vMATIC], [SUPPLY_CAP]],
      },
      {
        target: bscmainnet.UNITROLLER,
        signature: "_setMarketBorrowCaps(address[],uint256[])",
        params: [[vMATIC], [BORROW_CAP]],
      },
    ],
    meta,
    ProposalType.FAST_TRACK,
  );
};

export default vip531;
