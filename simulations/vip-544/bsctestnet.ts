import { impersonateAccount, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { expectEvents } from "src/utils";
import { forking, testVip } from "src/vip-framework";

import vip544, {
  ACCESS_CONTROL_MANAGER_BSC_TESTNET,
  ANY_TARGET_CONTRACT,
  BSC_TESTNET_CORE_COMPTROLLER,
  MARKET_CAP_RISK_STEWARD_BSC_TESTNET,
  NORMAL_TIMELOCK_BSC_TESTNET,
} from "../../vips/vip-544/bsctestnet1";
import ACCESS_CONTROL_MANAGER_ABI from "./abi/AccessControlManager.json";
import COMPTROLLER_ABI from "./abi/Comproller.json";
import ISOLATED_POOL_COMPTROLLER_ABI from "./abi/IsolatedPoolComptroller.json";
import VENUS_RISK_STEWARD_RECEIVER_ABI from "./abi/VenusRiskStewardReceiver.json";

forking(48650752, async () => {
  const provider = ethers.provider;
  const acm = new ethers.Contract(ACCESS_CONTROL_MANAGER_BSC_TESTNET, ACCESS_CONTROL_MANAGER_ABI, provider);
  const comptroller = new ethers.Contract(BSC_TESTNET_CORE_COMPTROLLER, COMPTROLLER_ABI, provider);

  const isolatedPoolComptroller = new ethers.Contract(
    "0x1F4f0989C51f12DAcacD4025018176711f3Bf289",
    ISOLATED_POOL_COMPTROLLER_ABI,
    provider,
  );

  before(async () => {
    await setBalance(NORMAL_TIMELOCK_BSC_TESTNET, parseUnits("1000000", 18));
    await setBalance("0xCfD34AEB46b1CB4779c945854d405E91D27A1899", parseUnits("1000000", 18));
  });

  testVip("vip544 Configuring Risk Stewards", await vip544(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ACCESS_CONTROL_MANAGER_ABI, VENUS_RISK_STEWARD_RECEIVER_ABI],
        ["PermissionGranted", "RiskParameterConfigSet"],
        [18, 2],
      );
    },
  });

  describe("Post-VIP behavior", () => {
    it("Grants timelock permissions to setRiskParameterConfig on Market Cap Risk Steward", async () => {
      const supplyCapRole = ethers.utils.solidityPack(
        ["address", "string"],
        [ANY_TARGET_CONTRACT, "setMarketSupplyCaps(address[],uint256[])"],
      );
      const supplyCapRoleHash = ethers.utils.keccak256(supplyCapRole);
      expect(await acm.hasRole(supplyCapRoleHash, MARKET_CAP_RISK_STEWARD_BSC_TESTNET)).to.be.true;

      const borrowCapRole = ethers.utils.solidityPack(
        ["address", "string"],
        [ANY_TARGET_CONTRACT, "setMarketBorrowCaps(address[],uint256[])"],
      );
      const borrowCapRoleHash = ethers.utils.keccak256(borrowCapRole);
      expect(await acm.hasRole(borrowCapRoleHash, MARKET_CAP_RISK_STEWARD_BSC_TESTNET)).to.be.true;

      const supplyCapCorePoolRole = ethers.utils.solidityPack(
        ["address", "string"],
        [BSC_TESTNET_CORE_COMPTROLLER, "_setMarketSupplyCaps(address[],uint256[])"],
      );
      const supplyCapCorePoolRoleHash = ethers.utils.keccak256(supplyCapCorePoolRole);
      expect(await acm.hasRole(supplyCapCorePoolRoleHash, MARKET_CAP_RISK_STEWARD_BSC_TESTNET)).to.be.true;

      const borrowCapCorePoolRole = ethers.utils.solidityPack(
        ["address", "string"],
        [BSC_TESTNET_CORE_COMPTROLLER, "_setMarketSupplyCaps(address[],uint256[])"],
      );
      const borrowCapCorePoolRoleHash = ethers.utils.keccak256(borrowCapCorePoolRole);
      expect(await acm.hasRole(borrowCapCorePoolRoleHash, MARKET_CAP_RISK_STEWARD_BSC_TESTNET)).to.be.true;
    });

    it("Market Cap Risk Steward should be able to set supply and borrow caps on markets", async () => {
      await impersonateAccount(MARKET_CAP_RISK_STEWARD_BSC_TESTNET);
      await setBalance(MARKET_CAP_RISK_STEWARD_BSC_TESTNET, parseUnits("1000000", 18));
      await expect(
        comptroller
          .connect(await ethers.getSigner(MARKET_CAP_RISK_STEWARD_BSC_TESTNET))
          ._setMarketSupplyCaps(["0xeDaC03D29ff74b5fDc0CC936F6288312e1459BC6"], ["150000000000000000000000"]),
      ).to.emit(comptroller, "NewSupplyCap");
      await expect(
        comptroller
          .connect(await ethers.getSigner(MARKET_CAP_RISK_STEWARD_BSC_TESTNET))
          ._setMarketBorrowCaps(["0xeDaC03D29ff74b5fDc0CC936F6288312e1459BC6"], ["55000000000000000000000"]),
      ).to.emit(comptroller, "NewBorrowCap");

      await expect(
        isolatedPoolComptroller
          .connect(await ethers.getSigner(MARKET_CAP_RISK_STEWARD_BSC_TESTNET))
          .setMarketSupplyCaps(["0xef470AbC365F88e4582D8027172a392C473A5B53"], ["150000000000000000000000"]),
      ).to.emit(isolatedPoolComptroller, "NewSupplyCap");
      await expect(
        isolatedPoolComptroller
          .connect(await ethers.getSigner(MARKET_CAP_RISK_STEWARD_BSC_TESTNET))
          .setMarketBorrowCaps(["0xef470AbC365F88e4582D8027172a392C473A5B53"], ["55000000000000000000000"]),
      ).to.emit(isolatedPoolComptroller, "NewBorrowCap");
    });
  });
});
