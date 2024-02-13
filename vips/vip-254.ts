import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const TREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";
const WBNB = "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c";
export const USDT = "0x55d398326f99059fF775485246999027B3197955";
export const COMMUNITY_WALLET = "0xc444949e0054A23c44Fc45789738bdF64aed2391";
export const OPBNB_BRIDGE = "0xF05F0e4362859c3331Cb9395CBC201E3Fa6757Ea";
const WBNB_AMOUNT = parseUnits("45", 18);
export const BRIDGE_ASSETS = [
  {
    name: "BTCB",
    localAddress: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c",
    remoteAddress: "0x7c6b91d9be155a6db01f749217d76ff02a7227f2",
    amount: parseUnits("0.3", 18),
  },

  {
    name: "ETH",
    localAddress: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8",
    remoteAddress: "0xe7798f023fc62146e8aa1b36da45fb70855a77ea",
    amount: parseUnits("5", 18),
  },

  {
    name: "USDT",
    localAddress: "0x55d398326f99059fF775485246999027B3197955",
    remoteAddress: "0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3",
    amount: parseUnits("10000", 18),
  },

  {
    name: "FDUSD",
    localAddress: "0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409",
    remoteAddress: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    amount: parseUnits("1000", 18), // TBC
  },
];

export const vip254 = () => {
  const meta = {
    version: "v2",
    title: "VIP-254 Bootstrap liquidity for the opBNB deployment",
    description: `If passed, this VIP will performance the following actions:

- withdraw 0.3 BTC, 5 ETH, 10,000 USDT and 45 BNB from the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) on BNB chain, and bridge them to the [Venus Treasury on opBNB](https://opbnbscan.com/address/0xDDc9017F3073aa53a4A8535163b0bf7311F72C52)
- transfer 10,000 USDT from the [Venus Treasury](https://bscscan.com/address/0xf322942f644a996a617bd29c16bd7d231d9f35e9) (on BNB chain) to the [Community wallet](https://bscscan.com/address/0xc444949e0054A23c44Fc45789738bdF64aed2391). These tokens will be converted by the Community wallet to FDUSD and sent to the [Venus Treasury on opBNB](https://opbnbscan.com/address/0xDDc9017F3073aa53a4A8535163b0bf7311F72C52)

These tokens will be used for the bootstrap liquidity of the new Venus markets on opBNB.

After the execution of this VIP, and the manual operation by the Community wallet, the balance of the Venus Treasury on opBNB will be:

- 0.3 [BTCB](https://opbnbscan.com/token/0x7c6b91d9be155a6db01f749217d76ff02a7227f2)
- 5 [ETH](https://opbnbscan.com/token/0xe7798f023fc62146e8aa1b36da45fb70855a77ea)
- 10,000 [USDT](https://opbnbscan.com/token/0x9e5aac1ba1a2e6aed6b32689dfcf62a509ca96f3)
- 10,000 [FDUSD](https://opbnbscan.com/token/0x50c5725949a6f0c72e6c4a641f24049a917db0cb)
- 45 BNB

#### References

- [Repository](https://github.com/VenusProtocol/token-bridge)
- [VIP simulation](https://github.com/VenusProtocol/vips/pull/203)
- [Deploy Venus Protocol on opBNB - community proposal](https://community.venus.io/t/deploy-venus-protocol-on-opbnb/3995)
- Snapshot ["Deploy Venus Protocol on opBNB"](https://snapshot.org/#/venus-xvs.eth/proposal/0xbde3c7b8acf4bba025ad838f3f515c9d9e6f4c2eb0e68fca7f37234baf4ed103)
- [Documentation](https://docs-v4.venus.io/)`,
    forDescription: "Execute this proposal",
    againstDescription: "Do not execute this proposal",
    abstainDescription: "Indifferent to execution",
  };

  return makeProposal(
    [
      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [USDT, parseUnits("10000", 18), COMMUNITY_WALLET],
      },

      ...BRIDGE_ASSETS.map(market => {
        return {
          target: TREASURY,
          signature: "withdrawTreasuryBEP20(address,uint256,address)",
          params: [market.localAddress, market.amount, NORMAL_TIMELOCK],
        };
      }),

      ...BRIDGE_ASSETS.map(market => {
        return {
          target: market.localAddress,
          signature: "approve(address,uint256)",
          params: [OPBNB_BRIDGE, market.amount],
        };
      }),

      ...BRIDGE_ASSETS.map(market => {
        return {
          target: OPBNB_BRIDGE,
          signature: "bridgeERC20To(address,address,address,uint256,uint32,bytes)",
          params: [market.localAddress, market.remoteAddress, TREASURY, market.amount, 1, "0x"],
        };
      }),

      ...BRIDGE_ASSETS.map(market => {
        return {
          target: market.localAddress,
          signature: "approve(address,uint256)",
          params: [OPBNB_BRIDGE, 0],
        };
      }),

      {
        target: TREASURY,
        signature: "withdrawTreasuryBEP20(address,uint256,address)",
        params: [WBNB, WBNB_AMOUNT, NORMAL_TIMELOCK],
      },

      {
        target: WBNB,
        signature: "withdraw(uint256)",
        params: [WBNB_AMOUNT],
      },
      {
        target: OPBNB_BRIDGE,
        signature: "bridgeETHTo(address,uint32,bytes)",
        params: [TREASURY, 1, "0x"],
        value: WBNB_AMOUNT.toString(),
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};
