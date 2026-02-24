import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

export const vTUSD = "0xEFAACF73CE2D38ED40991f29E72B12C74bd4cf23";
export const OLD_SUPPLY_CAP = parseUnits("1000000", 18);
export const NEW_SUPPLY_CAP = parseUnits("1000000000", 18);

const vip478 = () => {
  const meta = {
    version: "v2",
    title: "VIP-478 Risk Parameters Adjustments (FDUSD, TUSD)",
    description: "Increase the supply cap for the TUSD market from 1,000,000 to 1,000,000,000",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: bsctestnet.UNITROLLER,
        signature: "_setMarketSupplyCaps(address[],uint256[])",
        params: [[vTUSD], [NEW_SUPPLY_CAP]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip478;
