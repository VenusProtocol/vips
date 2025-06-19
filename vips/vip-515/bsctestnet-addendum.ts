import { ProposalMeta, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

import { ConversionAccessibility } from "./bsctestnet";

export const CONVERSION_INCENTIVE = 1e14;

const MockedUSDF = "0xC7a2b79432Fd3e3d5bd2d96A456c734AB93A0484";
export const WBNB = "0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd";
export const BURNING_CONVERTER = "0x42DBA48e7cCeB030eC73AaAe29d4A3F0cD4facba";

export const vip515addendum = () => {
  const meta: ProposalMeta = {
    version: "v2",
    title: "VIP-515 [BNB Chain] Addendum to configure USDF conversions on WBNBBurnConverter",
    description: `VIP-515 [BNB Chain] Addendum to configure USDF conversions on WBNBBurnConverter

If passed, this VIP will enable [BNB](https://bscscan.com/address/0xA07c5b74C9B40447a954e1466938b865b6BBea36) and [FDUSD](https://bscscan.com/address/0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba) markets on the Core pool (BNB Chain) as Prime Markets, following these community posts:

- [VRC: Enable BNB as a Prime Market on BNB Chain](https://community.venus.io/t/vrc-enable-bnb-as-a-prime-market-on-bnb-chain/5127) ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xb262d9574010ffbe2981bdaf96f26d9cb6769b4f048fb654b4e041f1d1d5f222))
- [Proposal: Add FDUSD as a Prime Market to the Venus Core Pool on BNB Chain](https://community.venus.io/t/proposal-add-fdusd-as-a-prime-market-to-the-venus-core-pool-on-bnb-chain/4989) ([snapshot](https://snapshot.box/#/s:venus-xvs.eth/proposal/0xc330c51fa8db6d1485290eacfcb49a493d9ebdf3041dd87be6b5da54a51ae2a7))

Moreover, the [BTCB](https://bscscan.com/address/0x882C173bC7Ff3b7786CA16dfeD3DFFfb9Ee7847B) and [ETH](https://bscscan.com/address/0xf508fCD89b8bd15579dc79A6827cB4686A3592c8) markets will be removed from the list of Prime Markets. The new reward distribution will be:

Complete analysis and details of these changes are available in the above publications.

**References**:

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/577)
- Execution on testnet ([BNB Chain](https://testnet.bscscan.com/tx/0x))`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Configure converters for USDF
      {
        target: BURNING_CONVERTER,
        signature: "setConversionConfigs(address,address[],(uint256,uint8)[])",
        params: [WBNB, [MockedUSDF], [[CONVERSION_INCENTIVE, ConversionAccessibility.ALL]]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip515addendum;
