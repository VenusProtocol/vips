import { ethers } from "ethers";
import { parseUnits } from "ethers/lib/utils";

import { ProposalType } from "../../../src/types";
import { makeProposal } from "../../../src/utils";

const ZERO_ADDRESS = ethers.constants.AddressZero;

export const ACM = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
export const VAI = "0x5fFbE5302BadED40941A403228E6AD03f93752d9";
export const COMPTROLLER_BEACON = "0xdDDD7725C073105fB2AbfCbdeC16708fC4c24B74";
export const COMPTROLLER = "0x10b57706AD2345e590c2eA4DC02faef0d9f5b08B";
export const COMPTROLLER_NEW_IMPLEMENTATION = "0xc287536E7667c02C74D003b6Bf67eb920f513e4E";

export const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
export const VAI_CONTROLLER = "0xc257381a2d9f46a7b219d2d99650d32d0ad40c4d";
export const TREASURY = "0x8b293600c50d6fbdc6ed4251cc75ece29880276f";
export const TREASURY_GUARDIAN = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";
export const CHAINLINK_ORACLE = "0xCeA29f1266e880A1482c06eD656cD08C148BaA32";
export const RESILIENT_ORACLE = "0x3cD69251D04A28d887Ac14cbe2E14c52F3D57823";
export const PRIME_TOKEN = "0xe840F8EC2Dc50E7D22e5e2991975b9F6e34b62Ad";

export const BASE_RATE = parseUnits("3", 16);
export const FLOAT_RATE = parseUnits("50", 18);
export const VAI_MINT_CAP = parseUnits("16", 24);
export const INITIAL_VAI_MINT_RATE = parseUnits("1", 4);
export const TREASURY_PERCENT = parseUnits("1", 14);

export const VAIControllerVIP = () => {
  const meta = {
    version: "v1",
    title: "VIP for adding VAI support in Isolated Pools",
    description: `#### Summary
          If passed this VIP will perform the following actions:
          - The implementation of comptroller will be upgraded
          - VAI Controller is integrated to comptroller`,
    forDescription: "I agree that Venus Protocol should proceed with this proposal",
    againstDescription: "I do not think that Venus Protocol should proceed with this proposal",
    abstainDescription: "I am indifferent to whether Venus Protocol proceeds or not",
  };

  return makeProposal(
    [
      {
        target: COMPTROLLER_BEACON,
        signature: "upgradeTo(address)",
        params: [COMPTROLLER_NEW_IMPLEMENTATION],
      },
      {
        target: VAI_CONTROLLER,
        signature: "acceptOwnership()",
        params: [],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER, "setVAIMintRate(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER, "setMintCap(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER, "setBaseRate(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER, "setFloatRate(uint256)", NORMAL_TIMELOCK],
      },
      {
        target: ACM,
        signature: "giveCallPermission(address,string,address)",
        params: [VAI_CONTROLLER, "toggleOnlyPrimeHolderMint()", NORMAL_TIMELOCK],
      },
      {
        target: COMPTROLLER,
        signature: "setVAIController(address)",
        params: [VAI_CONTROLLER],
      },
      {
        target: VAI_CONTROLLER,
        signature: "setComptroller(address)",
        params: [COMPTROLLER],
      },
      {
        target: VAI_CONTROLLER,
        signature: "setVAIToken(address)",
        params: [VAI],
      },
      {
        target: VAI_CONTROLLER,
        signature: "setVAIMintRate(uint256)",
        params: [INITIAL_VAI_MINT_RATE],
      },
      {
        target: VAI_CONTROLLER,
        signature: "setMintCap(uint256)",
        params: [VAI_MINT_CAP],
      },
      {
        target: VAI_CONTROLLER,
        signature: "setPrimeToken(address)",
        params: [PRIME_TOKEN],
      },
      {
        target: VAI_CONTROLLER,
        signature: "setReceiver(address)",
        params: [TREASURY],
      },
      {
        target: VAI_CONTROLLER,
        signature: "setBaseRate(uint256)",
        params: [BASE_RATE],
      },
      {
        target: VAI_CONTROLLER,
        signature: "setFloatRate(uint256)",
        params: [FLOAT_RATE],
      },
      {
        target: VAI_CONTROLLER,
        signature: "setTreasuryData(address,address,uint256)",
        params: [TREASURY_GUARDIAN, TREASURY, TREASURY_PERCENT],
      },
      {
        target: VAI,
        signature: "rely(address)",
        params: [VAI_CONTROLLER],
      },

      // commands added as oracle for vai is not configured on bsctestnet
      {
        target: CHAINLINK_ORACLE,
        signature: "setDirectPrice(address,uint256)",
        params: [VAI, parseUnits("1", 18)],
      },
      {
        target: RESILIENT_ORACLE,
        signature: "setTokenConfig((address,address[3],bool[3]))",
        params: [[VAI, [CHAINLINK_ORACLE, ZERO_ADDRESS, ZERO_ADDRESS], [true, false, false]]],
      },
    ],
    meta,
    ProposalType.REGULAR,
  );
};

export default VAIControllerVIP;
