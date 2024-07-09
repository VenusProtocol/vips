import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { forking, pretendExecutingVip } from "src/vip-framework";

import vip020, { BOUND_VALIDATOR } from "../../../proposals/opbnbtestnet/vip-020";
import BINANCE_ORACLE_ABI from "./abi/binanceOracle.json";
import BOUND_VALIDATOR_ABI from "./abi/boundValidator.json";
import RESILIENT_ORACLE_ABI from "./abi/resilientOracle.json";

const { opbnbtestnet } = NETWORK_ADDRESSES;

const RESILIENT_ORACLE = opbnbtestnet.RESILIENT_ORACLE;
const BINANCE_ORACLE = opbnbtestnet.BINANCE_ORACLE;
const NORMAL_TIMELOCK = opbnbtestnet.NORMAL_TIMELOCK;

forking(33636631, async () => {
  const provider = ethers.provider;
  let resilientOracle: Contract;
  let chainLinkOracle: Contract;
  let boundValidator: Contract;

  describe("Pre-VIP behavior", async () => {
    before(async () => {
      resilientOracle = new ethers.Contract(RESILIENT_ORACLE, RESILIENT_ORACLE_ABI, provider);
      chainLinkOracle = new ethers.Contract(BINANCE_ORACLE, BINANCE_ORACLE_ABI, provider);
      boundValidator = new ethers.Contract(BOUND_VALIDATOR, BOUND_VALIDATOR_ABI, provider);
    });

    it("should have no pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await chainLinkOracle.pendingOwner()).to.equal(ethers.constants.AddressZero);
      expect(await boundValidator.pendingOwner()).to.equal(ethers.constants.AddressZero);
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip020());
    });

    it("correct pending owner", async () => {
      expect(await resilientOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await chainLinkOracle.pendingOwner()).to.equal(NORMAL_TIMELOCK);
      expect(await boundValidator.pendingOwner()).to.equal(NORMAL_TIMELOCK);
    });
  });
});
