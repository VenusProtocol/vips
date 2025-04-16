import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { BigNumber, Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents } from "src/utils";
import { forking, pretendExecutingVip, testForkedNetworkVipCommands } from "src/vip-framework";

import { ANY_TARGET_CONTRACT } from "../../vips/vip-xxx/bsctestnet1";
import vipxxx, {
  ACCESS_CONTROL_MANAGER_ZKSYNCSEPOLIA,
  MARKET_CAP_RISK_STEWARD_ZKSYNCSEPOLIA,
} from "../../vips/vip-xxx/bsctestnet2";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import ISOLATED_POOL_COMPTROLLER_ABI from "./abi/IsolatedPoolComptroller.json";
import OMNICHAIN_GOVERNANCE_EXECUTOR_ABI from "./abi/OmnichainGovernanceExecutor.json";
import VENUS_RISK_STEWARD_RECEIVER_ABI from "./abi/VenusRiskStewardReceiver.json";

const { zksyncsepolia } = NETWORK_ADDRESSES;

forking(4898583, async () => {
  const provider = ethers.provider;
  let executor: Contract;
  let lastProposalReceived: BigNumber;
  const acm = new ethers.Contract(ACCESS_CONTROL_MANAGER_ZKSYNCSEPOLIA, ACCESS_CONTROL_MANAGER_ABI, provider);

  const isolatedPoolComptroller = new ethers.Contract(
    "0xC527DE08E43aeFD759F7c0e6aE85433923064669",
    ISOLATED_POOL_COMPTROLLER_ABI,
    provider,
  );

  before(async () => {
    executor = new ethers.Contract(
      zksyncsepolia.OMNICHAIN_GOVERNANCE_EXECUTOR,
      OMNICHAIN_GOVERNANCE_EXECUTOR_ABI,
      provider,
    );

    lastProposalReceived = await executor.lastProposalReceived();
    await pretendExecutingVip(await vipxxx());
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
      expect(await acm.hasRole(supplyCapRoleHash, MARKET_CAP_RISK_STEWARD_ZKSYNCSEPOLIA)).to.be.true;

      const borrowCapRole = ethers.utils.solidityPack(
        ["address", "string"],
        [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])"],
      );
      const borrowCapRoleHash = ethers.utils.keccak256(borrowCapRole);
      expect(await acm.hasRole(borrowCapRoleHash, MARKET_CAP_RISK_STEWARD_ZKSYNCSEPOLIA)).to.be.true;
    });

    it("Market Cap Risk Steward should be able to set supply and borrow caps on markets", async () => {
      await impersonateAccount(MARKET_CAP_RISK_STEWARD_ZKSYNCSEPOLIA);
      await setBalance(MARKET_CAP_RISK_STEWARD_ZKSYNCSEPOLIA, parseUnits("1000000", 18));

      await expect(
        isolatedPoolComptroller
          .connect(await ethers.getSigner(MARKET_CAP_RISK_STEWARD_ZKSYNCSEPOLIA))
          .setMarketSupplyCaps(["0x7Bfd185eF8380a72027bF65bFEEAb0242b147778"], ["25000000000000"]),
      ).to.emit(isolatedPoolComptroller, "NewSupplyCap");
      await expect(
        isolatedPoolComptroller
          .connect(await ethers.getSigner(MARKET_CAP_RISK_STEWARD_ZKSYNCSEPOLIA))
          .setMarketBorrowCaps(["0x7Bfd185eF8380a72027bF65bFEEAb0242b147778"], ["20000000000000"]),
      ).to.emit(isolatedPoolComptroller, "NewBorrowCap");
    });
  });
});
