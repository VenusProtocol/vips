import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { makeProposal } from "src/utils";

const { VTREASURY, NORMAL_TIMELOCK } = NETWORK_ADDRESSES.ethereum;

export const LBTC = "0x8236a87084f8B84306f72007F36F2618A5634494";
export const WBTC = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
export const WBTC_RECEIVER = "0xCb09Ab3F6254437d225Ed3CABEBe0949782E2372";
const INITIAL_SUPPLY = parseUnits("0.106", 8);
const WBTC_TO_TRANSFER = parseUnits("0.006", 8);

export const vip071 = () => {
  return makeProposal([
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [LBTC, INITIAL_SUPPLY, NORMAL_TIMELOCK],
    },
    {
      target: VTREASURY,
      signature: "withdrawTreasuryToken(address,uint256,address)",
      params: [WBTC, WBTC_TO_TRANSFER, WBTC_RECEIVER],
    },
  ]);
};

export default vip071;
