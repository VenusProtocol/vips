import { ProposalType } from "../src/types";
import { makeProposal } from "../src/utils";

const CHAINLINK_ORACLE = "0xfc4e26B7fD56610E84d33372435F0275A359E8eF";
const RESILIENT_ORACLE = "0xD9D16795A92212662a2D44AAc810eC68fdE61076";

interface AssetConfig {
  name: string;
  address: string;
  price: string;
}

const ASSETS: AssetConfig[] = [
  {
    name: "TUSD",
    address: "0xfec3a63401eb9c1476200d7c32c4009be0154169",
    price: "1000000000000000000",
  },
];

export const vip111Testnet = () => {
  const meta = {
    version: "v2",
    title: "VIP-111 TUSD Price Configuration",
    description: `
    Configure Price Feed for TUSD
    `,
    forDescription: "I agree that Venus Protocol should proceed with this recommendation",
    againstDescription: "I do not think that Venus Protocol should proceed with this recommendation",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds with this recommendation or not",
  };

  return makeProposal(
    [
      ...ASSETS.map(asset => {
        return {
          target: CHAINLINK_ORACLE,
          signature: "setDirectPrice(address,uint256)",
          params: [asset.address, asset.price],
        };
      }),
      ...ASSETS.map(asset => {
        return {
          target: RESILIENT_ORACLE,
          signature: "setTokenConfig((address,address[3],bool[3]))",
          params: [
            [
              asset.address,
              [
                CHAINLINK_ORACLE,
                "0x0000000000000000000000000000000000000000",
                "0x0000000000000000000000000000000000000000",
              ],
              [true, false, false],
            ],
          ],
        };
      }),
    ],
    meta,
    ProposalType.REGULAR,
  );
};
