import { constants } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;

export const { ACCESS_CONTROL_MANAGER, GUARDIAN, NORMAL_TIMELOCK, RESILIENT_ORACLE } = bsctestnet;

export const ATLAS_ORACLE = "0x7F00af2f30a55e79311392C98fBBfA629D19b3A5";
export const APRO_ORACLE = "0x309bC6e25672fDBCFa09D76bAA68be59f215f98d"; // pending owner is the Normal Timelock

// Chainlink, RedStone, Atlas and APRO are all ChainlinkOracle instances sharing these ACM-gated setters.
// setTokenConfig also covers the ResilientOracle and subsumes setOracle/enableOracle there.
export const ORACLE_PERMISSIONS = ["setTokenConfig(TokenConfig)", "setDirectPrice(address,uint256)"];

// hBNB — DigiFT Hash Global BNB Yield Fund Token. No feed on testnet, so pin a direct price on Atlas.
export const HBNB = "0xCbfDC27d225Dd3F58DD19C3d37347d043458dcC8";
export const HBNB_PRICE = parseUnits("613.43", 18); // live BNB/USD reading on testnet at authoring time

export const vip654 = () => {
  const meta = {
    version: "v2",
    title: "VIP-654 [BNB Chain Testnet] Guardian oracle permissions, APRO oracle onboarding and hBNB price",
    description: `#### Summary

If passed, this VIP will:

1. Grant the Guardian the oracle-configuration permissions (setTokenConfig and setDirectPrice) against the ACM wildcard address, so they apply to every oracle instance.
2. Onboard the newly deployed APRO oracle: accept its ownership and grant the Normal Timelock permission to configure it.
3. Configure hBNB (DigiFT Hash Global BNB Yield Fund Token) in the ResilientOracle, priced by the Atlas oracle. Testnet has no hBNB feed, so a fixed direct price is set instead.`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // 1. Guardian gets the oracle-configuration surface across every oracle instance.
      ...ORACLE_PERMISSIONS.map(signature => ({
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [constants.AddressZero, signature, GUARDIAN],
      })),

      // 2. Onboard the APRO oracle: the Normal Timelock is already its pending owner.
      { target: APRO_ORACLE, signature: "acceptOwnership()", params: [] },
      ...ORACLE_PERMISSIONS.map(signature => ({
        target: ACCESS_CONTROL_MANAGER,
        signature: "giveCallPermission(address,string,address)",
        params: [APRO_ORACLE, signature, NORMAL_TIMELOCK],
      })),

      // 3. hBNB: direct price on the Atlas oracle, routed as MAIN in the ResilientOracle.
      {
        target: ATLAS_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [HBNB, HBNB_PRICE],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3],bool))",
        params: [[HBNB, [ATLAS_ORACLE, constants.AddressZero, constants.AddressZero], [true, false, false], false]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip654;
