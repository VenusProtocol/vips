import { ProposalType } from "../../src/types";
import { makeProposal } from "../../src/utils";

export const BINANCE_ORACLE = "0x1AD1A94550308f9f85871c8b68ac8442C39EE60b";
export const CRITICAL_TIMELOCK = "0x213c446ec11e45b15a6E29C1C1b402B8897f606d";
export const RESILIENT_ORACLE = "0x6592b5DE802159F3E74B2486b091D11a8256ab8A";
export const SnBNB = "0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B";
export const HAY = "0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5";

export const vip250 = () => {
  const meta = {
    version: "v2",
    title: "VIP-250 Rebrand of HAY and SnBNB to lisUSD and slisBNB",
    description: `#### Summary

If passed, this VIP will configure the price feeds of the lisUSD and slisBNB tokens, reusing the configuration previously set for HAY and SnBNB, taking into account the already performed rebrand.

#### Details

Helio Protocol has been rebranded to Lista DAO, and then token symbols of [HAY](https://bscscan.com/token/0x0782b6d8c4551B9760e74c0545a9bCD90bdc41E5) & [SnBNB](https://bscscan.com/address/0xB0b84D294e0C75A6abe60171b70edEb2EFd14A1B) have been changed to lisUSD and slisBNB respectively. See the official announcement [here](https://medium.com/listadao/lista-is-coming-product-update-ae37b3869db0).

After executing this VIP, the markets for the lisUSD and slisBNB tokens should be available again in the Venus Protocol.

It’s needed to configure the maximum stale period for the new symbols in the BinanceOracle contract. This can be done only with a Normal VIP, not a Critical VIP. To reduce the time without access to the markets, this (Critical) VIP would set a new BinanceOracle contract instance for the tokens lisUSD and slisBNB, with the expected maximum stale periods configured. Another (Normal) VIP will be proposed in the following days to restore the use of the usual [BinanceOracle instance](https://bscscan.com/address/0x594810b741d136f1960141C0d8Fb4a91bE78A820) for these symbols.

#### References

- [VIP simulation](https://github.com/VenusProtocol/vips/pull/198)
- [New (temporary) BinanceOracle contract instance](https://bscscan.com/address/0x1AD1A94550308f9f85871c8b68ac8442C39EE60b)`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: BINANCE_ORACLE,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["lisUSD", 1500],
      },
      {
        target: BINANCE_ORACLE,
        signature: "setMaxStalePeriod(string,uint256)",
        params: ["slisBNB", 1500],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            SnBNB,
            [
              BINANCE_ORACLE,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [
          [
            HAY,
            [
              BINANCE_ORACLE,
              "0x0000000000000000000000000000000000000000",
              "0x0000000000000000000000000000000000000000",
            ],
            [true, false, false],
          ],
        ],
      },
    ],
    meta,
    ProposalType.CRITICAL,
  );
};

export default vip250;
