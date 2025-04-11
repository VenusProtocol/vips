import { LzChainId, ProposalType } from "src/types";
import { makeProposal } from "src/utils";

export const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
export const vFDUSD = "0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba";
export const vTUSD = "0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E";

export const ETH_COMPTROLLER = "0x687a01ecF6d3907658f7A7c714749fAC32336D1B";
export const ETH_vTUSD = "0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b";

export const Actions = {
  MINT: 0,
  BORROW: 2,
  ENTER_MARKET: 7,
};

export const vip478 = () => {
  const meta = {
    version: "v2",
    title: "VIP-478 Risk Parameters Adjustments (FDUSD, TUSD)",
    description: `This VIP will perform the following Risk Parameter actions as per [Chaos Labs’ latest recommendations](https://community.venus.io/t/fdusd-depeg-response/5019/4):

- [FDUSD (Core pool)](https://app.venus.io/#/core-pool/market/0xC4eF4229FEc74Ccfe17B2bdeF7715fAC740BA0ba?chainId=56): Resume MINT, BORROW and ENTER_MARKET
- [TUSD (Core pool) / BNB Chain](https://app.venus.io/#/core-pool/market/0xBf762cd5991cA1DCdDaC9ae5C638F5B5Dc3Bee6E?chainId=56), and [TUSD (Core pool) / Ethereum](https://app.venus.io/#/core-pool/market/0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b?chainId=1): Resume MINT, BORROW and ENTER_MARKET

Complete analysis and details of these recommendations are available in the above publication.

VIP simulation: [https://github.com/VenusProtocol/vips/pull/535](https://github.com/VenusProtocol/vips/pull/535)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER,
        signature: "_setActionsPaused(address[],uint8[],bool)",
        params: [[vFDUSD, vTUSD], [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET], false],
      },
      {
        target: ETH_COMPTROLLER,
        signature: "setActionsPaused(address[],uint8[],bool)",
        params: [[ETH_vTUSD], [Actions.MINT, Actions.BORROW, Actions.ENTER_MARKET], false],
        dstChainId: LzChainId.ethereum,
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip478;
