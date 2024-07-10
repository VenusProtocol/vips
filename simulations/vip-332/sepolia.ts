import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip042 from "../../multisig/proposals/sepolia/vip-042";
import vip332, { SEPOLIA_BOUND_VALIDATOR, SEPOLIA_sFrxETH_ORACLE } from "../../vips/vip-332/bsctestnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILLIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import SFRAXETH_ORACLE_ABI from "./abi/sFrxETHOracle.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(6276156, async () => {
  const provider = ethers.provider;
  let chainLinkOracle: Contract;
  let redstoneOracle: Contract;
  let resilientOracle: Contract;
  let boundValidator: Contract;
  let sfraxETH: Contract;

  before(async () => {
    chainLinkOracle = new ethers.Contract(sepolia.CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    redstoneOracle = new ethers.Contract(sepolia.REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);
    resilientOracle = new ethers.Contract(sepolia.RESILIENT_ORACLE, RESILLIENT_ORACLE_ABI, provider);
    boundValidator = new ethers.Contract(SEPOLIA_BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    sfraxETH = new ethers.Contract(SEPOLIA_sFrxETH_ORACLE, SFRAXETH_ORACLE_ABI, provider);
    await pretendExecutingVip(await vip042());
  });

  testForkedNetworkVipCommands("vip332 ownership & permission configuartions of oracles", await vip332(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [19]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("oracles should have correct owner", async () => {
      expect(await resilientOracle.owner()).equals(sepolia.NORMAL_TIMELOCK);
      expect(await chainLinkOracle.owner()).equals(sepolia.NORMAL_TIMELOCK);
      expect(await redstoneOracle.owner()).equals(sepolia.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).equals(sepolia.NORMAL_TIMELOCK);
      expect(await sfraxETH.owner()).equals(sepolia.NORMAL_TIMELOCK);
    });
  });
});
