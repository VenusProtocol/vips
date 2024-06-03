import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { makeProposal } from "../../../../src/utils";

const { opbnbtestnet } = NETWORK_ADDRESSES;

const VTOKEN_BEACON = "0xcc633492097078Ae590C0d11924e82A23f3Ab3E2";
const VTOKEN_IMPL = "0xd1fC255c701a42b8eDe64eE92049444FF23626A0";
const VTOKEN_IMPL_TEMPORARY = "0xB8b90d642878C0561A85D96b540F7F0309293022";

const vWBNB = "0xD36a31AcD3d901AeD998da6E24e848798378474e";
const vWBNB_NEW_UNDERLYING = "0x4200000000000000000000000000000000000006";

const vip011 = () => {
  return makeProposal([
    {
      target: VTOKEN_BEACON,
      signature: "upgradeTo(address)",
      params: [VTOKEN_IMPL_TEMPORARY],
    },
    {
      target: vWBNB,
      signature: "setUnderlyingToken(address)",
      params: [vWBNB_NEW_UNDERLYING],
    },
    {
      target: VTOKEN_BEACON,
      signature: "upgradeTo(address)",
      params: [VTOKEN_IMPL],
    },
    {
      target: opbnbtestnet.RESILIENT_ORACLE,
      signature: "setTokenConfig((address,address[3],bool[3]))",
      params: [
        [
          vWBNB_NEW_UNDERLYING,
          [
            opbnbtestnet.BINANCE_ORACLE,
            "0x0000000000000000000000000000000000000000",
            "0x0000000000000000000000000000000000000000",
          ],
          [true, false, false],
        ],
      ],
    },
  ]);
};

export default vip011;
