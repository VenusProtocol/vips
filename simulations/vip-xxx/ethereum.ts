import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import { ANY_TARGET_CONTRACT, MARKET_CAP_RISK_STEWARD_ETHEREUM } from "../../vips/vip-xxx/bscmainnet";
import vipxxx from "../../vips/vip-xxx/bscmainnet";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import ISOLATED_POOL_COMPTROLLER_ABI from "./abi/IsolatedPoolComptroller.json";
import OMNICHAIN_GOVERNANCE_EXECUTOR_ABI from "./abi/OmnichainGovernanceExecutor.json";
import VENUS_RISK_STEWARD_RECEIVER_ABI from "./abi/VenusRiskStewardReceiver.json";

const { ethereum } = NETWORK_ADDRESSES;

forking(22829643, async () => {
  const provider = ethers.provider;
  let executor: Contract;
  let lastProposalReceived: BigNumber;

  const acm = new ethers.Contract(ethereum.ACCESS_CONTROL_MANAGER, ACCESS_CONTROL_MANAGER_ABI, provider);

  const isolatedPoolComptroller = new ethers.Contract(
    "0x687a01ecF6d3907658f7A7c714749fAC32336D1B",
    ISOLATED_POOL_COMPTROLLER_ABI,
    provider,
  );

  before(async () => {
    executor = new ethers.Contract(ethereum.OMNICHAIN_GOVERNANCE_EXECUTOR, OMNICHAIN_GOVERNANCE_EXECUTOR_ABI, provider);

    lastProposalReceived = await executor.lastProposalReceived();
  });

  testForkedNetworkVipCommands("vipxxx Configuring Risk Stewards", await vipxxx(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI, VENUS_RISK_STEWARD_RECEIVER_ABI],
        ["PermissionGranted", "RiskParameterConfigSet"],
        [16, 2],
      );
    },
  });
  describe("Post-VIP behavior", () => {
    it("Proposal id should be incremented", async () => {
      expect(await executor.lastProposalReceived()).to.be.equals(lastProposalReceived.add(1));
    });

    it("proposal should be executed", async () => {
      const pId = await executor.lastProposalReceived();
      expect(await executor.state(pId)).to.be.equals(2);
    });

    it("Grants timelock permissions to setRiskParameterConfig on Market Cap Risk Steward", async () => {
      const supplyCapRole = ethers.utils.solidityPack(
        ["address", "string"],
        [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])"],
      );
      const supplyCapRoleHash = ethers.utils.keccak256(supplyCapRole);
      expect(await acm.hasRole(supplyCapRoleHash, MARKET_CAP_RISK_STEWARD_ETHEREUM)).to.be.true;

      const borrowCapRole = ethers.utils.solidityPack(
        ["address", "string"],
        [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])"],
      );
      const borrowCapRoleHash = ethers.utils.keccak256(borrowCapRole);
      expect(await acm.hasRole(borrowCapRoleHash, MARKET_CAP_RISK_STEWARD_ETHEREUM)).to.be.true;
    });

    it("Market Cap Risk Steward should be able to set supply and borrow caps on markets", async () => {
      await impersonateAccount(MARKET_CAP_RISK_STEWARD_ETHEREUM);
      await setBalance(MARKET_CAP_RISK_STEWARD_ETHEREUM, parseUnits("1000000", 18));

      await expect(
        isolatedPoolComptroller
          .connect(await ethers.getSigner(MARKET_CAP_RISK_STEWARD_ETHEREUM))
          .setMarketSupplyCaps(["0xa8e7f9473635a5CB79646f14356a9Fc394CA111A"], ["180000000000"]),
      ).to.emit(isolatedPoolComptroller, "NewSupplyCap");
      await expect(
        isolatedPoolComptroller
          .connect(await ethers.getSigner(MARKET_CAP_RISK_STEWARD_ETHEREUM))
          .setMarketBorrowCaps(["0xa8e7f9473635a5CB79646f14356a9Fc394CA111A"], ["150000000000"]),
      ).to.emit(isolatedPoolComptroller, "NewBorrowCap");
    });
  });
});
