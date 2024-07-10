import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip042, { BOUND_VALIDATOR, SFrxETHOracle } from "../../../proposals/ethereum/vip-042";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import CHAINLINK_ORACLE_ABI from "./abi/chainlinkOracle.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";
import SFRAXETH_ORACLE_ABI from "./abi/sFrxETHOracle.json";

const { ethereum } = NETWORK_ADDRESSES;

const RESILIENT_ORACLE = ethereum.RESILIENT_ORACLE;
const CHAINLINK_ORACLE = ethereum.CHAINLINK_ORACLE;
const REDSTONE_ORACLE = ethereum.REDSTONE_ORACLE;
const NORMAL_TIMELOCK = ethereum.NORMAL_TIMELOCK;

forking(20267718, async () => {
  const provider = ethers.provider;
  let resilientOracle: Contract;
  let chainLinkOracle: Contract;
  let redstoneOracle: Contract;
  let boundValidator: Contract;
  let sfrxETHOracle: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
      chainLinkOracle = new ethers.Contract(CHAINLINK_ORACLE, CHAINLINK_ORACLE_ABI, provider);
      redstoneOracle = new ethers.Contract(REDSTONE_ORACLE, CHAINLINK_ORACLE_ABI, provider);
      boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
      sfrxETHOracle = new ethers.Contract(SFrxETHOracle, SFRAXETH_ORACLE_ABI, provider);
    });

    it("should have no pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await chainLinkOracle.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await redstoneOracle.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await boundValidator.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip042());
    });

    it("correct pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await chainLinkOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await redstoneOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await boundValidator.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await sfrxETHOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
    });
  });
});
