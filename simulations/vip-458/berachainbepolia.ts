import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { LzChainId } from "src/types";
import { expectEvents, getOmnichainProposalSenderAddress } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip458, {
  ACM,
  ACM_AGGREGATOR,
  BOUND_VALIDATOR,
  DEFAULT_ADMIN_ROLE,
  MOCK_USDCe,
  OMNICHAIN_EXECUTOR_OWNER,
  TREASURY,
  WBERA,
  WETH,
  XVS,
} from "../../vips/vip-458/bsctestnet";
import ACMAggregator_ABI from "./abi/ACMAggregator.json";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager_ABI.json";
import OMNICHAIN_EXECUTOR_OWNER_ABI from "./abi/OmnichainExecutorOwner_ABI.json";
import OMNICHAIN_GOVERNANCE_EXECUTOR_ABI from "./abi/OmnichainGovernanceExecutor_ABI.json";
import OWNERSHIP_ABI from "./abi/Ownership.json";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { berachainbepolia } = NETWORK_ADDRESSES;
const FAST_TRACK_TIMELOCK = "0x08Cf9d51df988F1E69174D22b7f93f97e1aAEbeE";
const CRITICAL_TIMELOCK = "0x2aae1073B2219729Ff8e5952887905A8da498062";

forking(3061990, async () => {
  const provider = ethers.provider;
  let lastProposalReceived: BigNumber;
  let executor: Contract;
  let executorOwner: Contract;
  let treasury: Contract;
  let resilientOracle: Contract;
  let chainlinkOracle: Contract;
  let redstoneOracle: Contract;
  let boundValidator: Contract;

  before(async () => {
    executor = new ethers.Contract(
      berachainbepolia.OMNICHAIN_GOVERNANCE_EXECUTOR,
      OMNICHAIN_GOVERNANCE_EXECUTOR_ABI,
      provider,
    );
    executorOwner = new ethers.Contract(OMNICHAIN_EXECUTOR_OWNER, OMNICHAIN_EXECUTOR_OWNER_ABI, provider);
    lastProposalReceived = await executor.lastProposalReceived();

    treasury = await ethers.getContractAt(OWNERSHIP_ABI, TREASURY);
    resilientOracle = new ethers.Contract(berachainbepolia.RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
    chainlinkOracle = new ethers.Contract(berachainbepolia.CHAINLINK_ORACLE, OWNERSHIP_ABI, provider);
    redstoneOracle = new ethers.Contract(berachainbepolia.REDSTONE_ORACLE, OWNERSHIP_ABI, provider);
    boundValidator = new ethers.Contract(BOUND_VALIDATOR, OWNERSHIP_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("Normal Timelock has default admin role", async () => {
      const acm = await ethers.getContractAt(ACCESS_CONTROL_MANAGER_ABI, ACM);
      const hasRole = await acm.hasRole(DEFAULT_ADMIN_ROLE, berachainbepolia.NORMAL_TIMELOCK);
      expect(hasRole).equals(true);
    });

    it("correct pending owner for oracles", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(berachainbepolia.NORMAL_TIMELOCK);
      expect(await chainlinkOracle.pendingOwner()).to.equal(berachainbepolia.NORMAL_TIMELOCK);
      expect(await redstoneOracle.pendingOwner()).to.equal(berachainbepolia.NORMAL_TIMELOCK);
      expect(await boundValidator.pendingOwner()).to.equal(berachainbepolia.NORMAL_TIMELOCK);
    });
  });

  testForkedNetworkVipCommands("vip458 configures bridge", await vip458(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [ACCESS_CONTROL_MANAGER_ABI], ["PermissionGranted"], [67]);
      await expectEvents(txResponse, [ACMAggregator_ABI], ["GrantPermissionsExecuted"], [1]);
    },
  });

  describe("Post-VIP behaviour", async () => {
    const acm = new ethers.Contract(ACM, ACCESS_CONTROL_MANAGER_ABI, provider);

    it("Proposal id should be incremented", async () => {
      expect(await executor.lastProposalReceived()).to.be.equals(lastProposalReceived.add(1));
    });
    it("proposal should be executed", async () => {
      const pId = await executor.lastProposalReceived();
      expect(await executor.state(pId)).to.be.equals(2);
    });
    it("check configuration", async () => {
      // Check Timelock configurations
      expect(await executor.proposalTimelocks(0)).equals(berachainbepolia.NORMAL_TIMELOCK);
      expect(await executor.proposalTimelocks(1)).equals(FAST_TRACK_TIMELOCK);
      expect(await executor.proposalTimelocks(2)).equals(CRITICAL_TIMELOCK);

      // Check trusted remote
      expect(await executor.trustedRemoteLookup(LzChainId.bsctestnet)).equals(
        ethers.utils.solidityPack(
          ["address", "address"],
          [getOmnichainProposalSenderAddress(), berachainbepolia.OMNICHAIN_GOVERNANCE_EXECUTOR],
        ),
      );

      // Check receiving limit
      expect(await executor.maxDailyReceiveLimit()).equals(100);
      expect(await executor.last24HourCommandsReceived()).equals(14);

      // Check function registry
      const functionSignatures: string[] = [
        "forceResumeReceive(uint16,bytes)",
        "pause()",
        "unpause()",
        "setSendVersion(uint16)",
        "setReceiveVersion(uint16)",
        "setMaxDailyReceiveLimit(uint256)",
        "setTrustedRemoteAddress(uint16,bytes)",
        "setPrecrime(address)",
        "setMinDstGas(uint16,uint16,uint256)",
        "setPayloadSizeLimit(uint16,uint256)",
        "setConfig(uint16,uint16,uint256,bytes)",
        "addTimelocks(ITimelock[])",
        "setTimelockPendingAdmin(address,uint8)",
        "retryMessage(uint16,bytes,uint64,bytes)",
        "setGuardian(address)",
        "setSrcChainId(uint16)",
      ];
      const getFunctionSelector = (signature: string): string => {
        return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(signature)).substring(0, 10);
      };

      for (const signature of functionSignatures) {
        const selector = getFunctionSelector(signature);
        expect(await executorOwner.functionRegistry(selector)).equals(signature);
      }
    });
    it("Default admin role must be revoked from ACMAggregator contract", async () => {
      expect(await acm.hasRole(DEFAULT_ADMIN_ROLE, ACM_AGGREGATOR)).to.be.false;
    });
    it("Guardian and all timelocks are allowed to call retryMessage ", async () => {
      const role = ethers.utils.solidityPack(
        ["address", "string"],
        [OMNICHAIN_EXECUTOR_OWNER, "retryMessage(uint16,bytes,uint64,bytes)"],
      );
      const roleHash = ethers.utils.keccak256(role);
      expect(await acm.hasRole(roleHash, berachainbepolia.GUARDIAN)).to.be.true;
      expect(await acm.hasRole(roleHash, berachainbepolia.NORMAL_TIMELOCK)).to.be.true;
      expect(await acm.hasRole(roleHash, FAST_TRACK_TIMELOCK)).to.be.true;
      expect(await acm.hasRole(roleHash, CRITICAL_TIMELOCK)).to.be.true;
    });

    it("Guardian is allowed to call forceResumeReceive but not timelocks", async () => {
      const role = ethers.utils.solidityPack(
        ["address", "string"],
        [OMNICHAIN_EXECUTOR_OWNER, "forceResumeReceive(uint16,bytes)"],
      );
      const roleHash = ethers.utils.keccak256(role);
      expect(await acm.hasRole(roleHash, berachainbepolia.GUARDIAN)).to.be.true;
      expect(await acm.hasRole(roleHash, berachainbepolia.NORMAL_TIMELOCK)).to.be.false;
      expect(await acm.hasRole(roleHash, FAST_TRACK_TIMELOCK)).to.be.false;
      expect(await acm.hasRole(roleHash, CRITICAL_TIMELOCK)).to.be.false;
    });
    it("Normal Timelock is allowed to call setSendVersion but not other timelocks and guardian", async () => {
      const role = ethers.utils.solidityPack(
        ["address", "string"],
        [OMNICHAIN_EXECUTOR_OWNER, "setSendVersion(uint16)"],
      );
      const roleHash = ethers.utils.keccak256(role);
      expect(await acm.hasRole(roleHash, berachainbepolia.GUARDIAN)).to.be.false;
      expect(await acm.hasRole(roleHash, berachainbepolia.NORMAL_TIMELOCK)).to.be.true;
      expect(await acm.hasRole(roleHash, FAST_TRACK_TIMELOCK)).to.be.false;
      expect(await acm.hasRole(roleHash, CRITICAL_TIMELOCK)).to.be.false;
    });

    it("correct owner for treasury and oracles", async () => {
      expect(await treasury.owner()).to.equal(berachainbepolia.NORMAL_TIMELOCK);
      expect(await resilientOracle.owner()).to.equal(berachainbepolia.NORMAL_TIMELOCK);
      expect(await chainlinkOracle.owner()).to.equal(berachainbepolia.NORMAL_TIMELOCK);
      expect(await redstoneOracle.owner()).to.equal(berachainbepolia.NORMAL_TIMELOCK);
      expect(await boundValidator.owner()).to.equal(berachainbepolia.NORMAL_TIMELOCK);
    });

    it("check price of tokens", async () => {
      const wethPrice = await resilientOracle.getPrice(WETH);
      const xvsPrice = await resilientOracle.getPrice(XVS);
      const wberaPrice = await resilientOracle.getPrice(WBERA);
      const usdcePrice = await resilientOracle.getPrice(MOCK_USDCe);
      expect(wethPrice).to.equal(ethers.utils.parseUnits("3000", 18));
      expect(xvsPrice).to.equal(ethers.utils.parseUnits("7", 18));
      expect(wberaPrice).to.equal(ethers.utils.parseUnits("6", 18));
      expect(usdcePrice).to.equal(ethers.utils.parseUnits("1", 30));
    });
  });
});
