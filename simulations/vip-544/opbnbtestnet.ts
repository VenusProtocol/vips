import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import vip544, {
  ACCESS_CONTROL_MANAGER_OPBNBTESTNET,
  ANY_TARGET_CONTRACT,
  MARKET_CAP_RISK_STEWARD_OPBNBTESTNET,
} from "../../vips/vip-544/bsctestnet1";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import ISOLATED_POOL_COMPTROLLER_ABI from "./abi/IsolatedPoolComptroller.json";
import OMNICHAIN_GOVERNANCE_EXECUTOR_ABI from "./abi/OmnichainGovernanceExecutor.json";
import VENUS_RISK_STEWARD_RECEIVER_ABI from "./abi/VenusRiskStewardReceiver.json";

const { opbnbtestnet } = NETWORK_ADDRESSES;

forking(56951686, async () => {
  const provider = ethers.provider;
  let executor: Contract;
  let lastProposalReceived: BigNumber;
  const acm = new ethers.Contract(ACCESS_CONTROL_MANAGER_OPBNBTESTNET, ACCESS_CONTROL_MANAGER_ABI, provider);

  const isolatedPoolComptroller = new ethers.Contract(
    "0x2FCABb31E57F010D623D8d68e1E18Aed11d5A388",
    ISOLATED_POOL_COMPTROLLER_ABI,
    provider,
  );

  before(async () => {
    executor = new ethers.Contract(
      opbnbtestnet.OMNICHAIN_GOVERNANCE_EXECUTOR,
      OMNICHAIN_GOVERNANCE_EXECUTOR_ABI,
      provider,
    );

    lastProposalReceived = await executor.lastProposalReceived();
    await pretendExecutingVip(await vip544());
  });

  testForkedNetworkVipCommands("vip544 Configuring Risk Stewards", await vip544(), {
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
      expect(await acm.hasRole(supplyCapRoleHash, MARKET_CAP_RISK_STEWARD_OPBNBTESTNET)).to.be.true;

      const borrowCapRole = ethers.utils.solidityPack(
        ["address", "string"],
        [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])"],
      );
      const borrowCapRoleHash = ethers.utils.keccak256(borrowCapRole);
      expect(await acm.hasRole(borrowCapRoleHash, MARKET_CAP_RISK_STEWARD_OPBNBTESTNET)).to.be.true;
    });

    it("Market Cap Risk Steward should be able to set supply and borrow caps on markets", async () => {
      await impersonateAccount(MARKET_CAP_RISK_STEWARD_OPBNBTESTNET);
      await setBalance(MARKET_CAP_RISK_STEWARD_OPBNBTESTNET, parseUnits("1000000", 18));

      await expect(
        isolatedPoolComptroller
          .connect(await ethers.getSigner(MARKET_CAP_RISK_STEWARD_OPBNBTESTNET))
          .setMarketSupplyCaps(["0xe3923805f6E117E51f5387421240a86EF1570abC"], ["15000000000000000000000000"]),
      ).to.emit(isolatedPoolComptroller, "NewSupplyCap");
      await expect(
        isolatedPoolComptroller
          .connect(await ethers.getSigner(MARKET_CAP_RISK_STEWARD_OPBNBTESTNET))
          .setMarketBorrowCaps(["0xe3923805f6E117E51f5387421240a86EF1570abC"], ["9500000000000000000000000"]),
      ).to.emit(isolatedPoolComptroller, "NewBorrowCap");
    });
  });
});
