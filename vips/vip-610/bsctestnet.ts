import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { ProposalType } from "src/types";
import { makeProposal } from "src/utils";

const { bsctestnet } = NETWORK_ADDRESSES;
export const SWAP_HELPER = "0x3Bf0Eb0663BeCe17d95FE33736762bFD20f488b2";
export const LEVERAGE_STRATEGIES_MANAGER = "0xfc8810B0f1144D5A1F6231aFDb8B51F31c0bc8A7";
export const RELATIVE_POSITION_MANAGER = "0xF01CA5Ad6152d932Ed19FB28b285529399dA8166";
export const POSITION_ACCOUNT = "0x03590ef916d538049Ed15f2690A01F70c2A02954";

export const vUSDC = "0xD5C4C2e2facBEB59D0216D0595d63FcDc6F9A1a7";
export const vUSDT = "0xb7526572FFE56AB9D7489838Bf2E18e3323b441A";

export const TIMELOCKS_AND_GUARDIAN = [
  bsctestnet.NORMAL_TIMELOCK,
  bsctestnet.FAST_TRACK_TIMELOCK,
  bsctestnet.CRITICAL_TIMELOCK,
  bsctestnet.GUARDIAN,
];

const giveAcmPermissions = (fnSignature: string, timelocks = TIMELOCKS_AND_GUARDIAN) =>
  timelocks.map(timelock => ({
    target: bsctestnet.ACCESS_CONTROL_MANAGER,
    signature: "giveCallPermission(address,string,address)",
    params: [RELATIVE_POSITION_MANAGER, fnSignature, timelock],
  }));

export const vip610 = () => {
  const meta = {
    version: "v2",
    title: "VIP-610 [BNB Chain] Configure Relative Position Manager",
    description: "VIP-610 [BNB Chain] Configure Relative Position Manager",
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      // Extra testnet setup: accept ownership of SwapHelper, LeverageStrategiesManager and whitelist for flash loans
      {
        target: SWAP_HELPER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: LEVERAGE_STRATEGIES_MANAGER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: RELATIVE_POSITION_MANAGER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: bsctestnet.UNITROLLER,
        signature: "setWhiteListFlashLoanAccount(address,bool)",
        params: [LEVERAGE_STRATEGIES_MANAGER, true],
      },
      // ACM permissions
      ...giveAcmPermissions("partialPause()"),
      ...giveAcmPermissions("partialUnpause()"),
      ...giveAcmPermissions("completePause()"),
      ...giveAcmPermissions("completeUnpause()"),
      ...giveAcmPermissions("setPositionAccountImplementation(address)"),
      ...giveAcmPermissions("setProportionalCloseTolerance(uint256)"),
      ...giveAcmPermissions("addDSAVToken(address)"),
      ...giveAcmPermissions("setDSAVTokenActive(uint8,bool)"),
      ...giveAcmPermissions("executePositionAccountCall(address,address[],bytes[])"),
      {
        target: RELATIVE_POSITION_MANAGER,
        signature: "setPositionAccountImplementation(address)",
        params: [POSITION_ACCOUNT],
      },
      // Add DSA vTokens (USDC, USDT)
      {
        target: RELATIVE_POSITION_MANAGER,
        signature: "addDSAVToken(address)",
        params: [vUSDC],
      },
      {
        target: RELATIVE_POSITION_MANAGER,
        signature: "addDSAVToken(address)",
        params: [vUSDT],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default vip610;
