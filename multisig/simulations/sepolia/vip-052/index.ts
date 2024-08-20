import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { checkIsolatedPoolsComptrollers } from "src/vip-framework/checks/checkIsolatedPoolsComptrollers";
import { checkVToken } from "src/vip-framework/checks/checkVToken";
import { checkInterestRate } from "src/vip-framework/checks/interestRateModel";
import { forking, pretendExecutingVip } from "src/vip-framework/index";

import { weETHs, vip052, ACCOUNTANT_ORACLE, MOCK_ACCOUNTANT } from "../../../proposals/sepolia/vip-052";
import RESILIENT_ORACLE_ABI from "./abi/ResilientOracle.json";

const { sepolia } = NETWORK_ADDRESSES;

forking(6536889, async () => {
  let resilientOracle: Contract;

  before(async () => {
    await impersonateAccount(sepolia.NORMAL_TIMELOCK);
    await setBalance(sepolia.NORMAL_TIMELOCK, parseUnits("1000", 18));

    resilientOracle = await ethers.getContractAt(RESILIENT_ORACLE_ABI, sepolia.RESILIENT_ORACLE);
  });

  describe("Pre-VIP behavior", () => {
    it("check price", async () => {
      await expect(resilientOracle.getPrice(weETHs)).to.be.reverted;
    });
  });

  describe("Post-VIP behavior", async () => {
    before(async () => {
      await pretendExecutingVip(await vip052());
    });

    it("check price", async () => {
      expect(await resilientOracle.getPrice(weETHs)).to.be.closeTo(parseUnits("2662", 18), parseUnits("1", 18));
    });
  });
});
