import { NETWORK_ADDRESSES } from "../../../src/networkAddresses";
import { makeProposal } from "../../../src/utils";

const { sepolia } = NETWORK_ADDRESSES;

const VTOKEN_BEACON = "0x0463a7E5221EAE1990cEddB51A5821a68cdA6008";
const VTOKEN_IMPL_TEMPORARY = "0xB7cbE6b4108b063D849481399eB7E10681Fffb8d";
const VTOKEN_IMPL = "0xa4Fd54cACdA379FB7CaA783B83Cc846f8ac0Faa6";

const vWETH = "0xc2931B1fEa69b6D6dA65a50363A8D75d285e4da9";
const vWETH_NEW_UNDERLYING = "0x7b79995e5f793a07bc00c21412e50ecae098e7f9";
const CHAINLINK_ETH_FEED = "0x694AA1769357215DE4FAC081bf1f309aDC325306";

export const vip011 = () => {
  return makeProposal([
    {
      target: VTOKEN_BEACON,
      signature: "upgradeTo(address)",
      params: [VTOKEN_IMPL_TEMPORARY],
    },
    {
      target: vWETH,
      signature: "setUnderlyingToken(address)",
      params: [vWETH_NEW_UNDERLYING],
    },
    {
      target: VTOKEN_BEACON,
      signature: "upgradeTo(address)",
      params: [VTOKEN_IMPL],
    },
    {
      target: sepolia.CHAINLINK_ORACLE,
      signature: "setTokenConfig((address,address,uint256))",
      params: [[vWETH_NEW_UNDERLYING, CHAINLINK_ETH_FEED, 144000]],
    },
    {
      target: sepolia.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          vWETH_NEW_UNDERLYING,
          [
            sepolia.CHAINLINK_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
  ]);
};
