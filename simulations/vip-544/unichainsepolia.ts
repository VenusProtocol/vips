import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import { ANY_TARGET_CONTRACT } from "../../vips/vip-544/bsctestnet1";
import vip544, {
  ACCESS_CONTROL_MANAGER_UNICHAINSEPOLIA,
  MARKET_CAP_RISK_STEWARD_UNICHAINSEPOLIA,
} from "../../vips/vip-544/bsctestnet2";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import ISOLATED_POOL_COMPTROLLER_ABI from "./abi/IsolatedPoolComptroller.json";
import OMNICHAIN_GOVERNANCE_EXECUTOR_ABI from "./abi/OmnichainGovernanceExecutor.json";
import VENUS_RISK_STEWARD_RECEIVER_ABI from "./abi/VenusRiskStewardReceiver.json";

const { unichainsepolia } = NETWORK_ADDRESSES;

forking(16844634, async () => {
  const provider = ethers.provider;
  let executor: Contract;
  let lastProposalReceived: BigNumber;
  const acm = new ethers.Contract(ACCESS_CONTROL_MANAGER_UNICHAINSEPOLIA, ACCESS_CONTROL_MANAGER_ABI, provider);

  const isolatedPoolComptroller = new ethers.Contract(
    "0xFeD3eAA668a6179c9E5E1A84e3A7d6883F06f7c1",
    ISOLATED_POOL_COMPTROLLER_ABI,
    provider,
  );

  before(async () => {
    executor = new ethers.Contract(
      unichainsepolia.OMNICHAIN_GOVERNANCE_EXECUTOR,
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
      expect(await acm.hasRole(supplyCapRoleHash, MARKET_CAP_RISK_STEWARD_UNICHAINSEPOLIA)).to.be.true;

      const borrowCapRole = ethers.utils.solidityPack(
        ["address", "string"],
        [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])"],
      );
      const borrowCapRoleHash = ethers.utils.keccak256(borrowCapRole);
      expect(await acm.hasRole(borrowCapRoleHash, MARKET_CAP_RISK_STEWARD_UNICHAINSEPOLIA)).to.be.true;
    });

    it("Market Cap Risk Steward should be able to set supply and borrow caps on markets", async () => {
      await impersonateAccount(MARKET_CAP_RISK_STEWARD_UNICHAINSEPOLIA);
      await setBalance(MARKET_CAP_RISK_STEWARD_UNICHAINSEPOLIA, parseUnits("1000000", 18));

      await expect(
        isolatedPoolComptroller
          .connect(await ethers.getSigner(MARKET_CAP_RISK_STEWARD_UNICHAINSEPOLIA))
          .setMarketSupplyCaps(["0x2d8814e1358D71B6B271295893F7409E3127CBBf"], ["25000000000000"]),
      ).to.emit(isolatedPoolComptroller, "NewSupplyCap");
      await expect(
        isolatedPoolComptroller
          .connect(await ethers.getSigner(MARKET_CAP_RISK_STEWARD_UNICHAINSEPOLIA))
          .setMarketBorrowCaps(["0x2d8814e1358D71B6B271295893F7409E3127CBBf"], ["19000000000000"]),
      ).to.emit(isolatedPoolComptroller, "NewBorrowCap");
    });
  });
});
