import { makeProposal } from "../../../src/utils";
import { ADDRESSES } from "../../helpers/config";

const { sepoliaContracts } = ADDRESSES;

const REDSTONE_XVS_FEED = "0x0d7697a15bce933cE8671Ba3D60ab062dA216C60";

export const oracleAssetConfig2 = () => {
  return makeProposal([
    { target: sepoliaContracts.REDSTONE_ORACLE, signature: "acceptOwnership()", params: [] },
    {
      target: sepoliaContracts.REDSTONE_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[sepoliaContracts.XVS, REDSTONE_XVS_FEED, 86400]],
    },
    {
      target: sepoliaContracts.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          sepoliaContracts.XVS,
          [
            sepoliaContracts.REDSTONE_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: sepoliaContracts.CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [sepoliaContracts.CRV, "500000000000000000"],
    },
    {
      target: sepoliaContracts.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          sepoliaContracts.CRV,
          [
            sepoliaContracts.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
    {
      target: sepoliaContracts.CHAINLINK_ORACLE,
      signature: "setDirectPrice(address,uint256)",
      params: [sepoliaContracts.crvUSD, "1000000000000000000"],
    },
    {
      target: sepoliaContracts.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          sepoliaContracts.crvUSD,
          [
            sepoliaContracts.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
  ]);
};
