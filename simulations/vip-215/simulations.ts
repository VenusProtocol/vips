import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { forking, pretendExecutingVip, testVip } from "../../src/vip-framework";
import { checkCorePoolComptroller } from "../../src/vip-framework/checks/checkCorePoolComptroller";
import { vip215 } from "../../vips/vip-215";
import IERC20_UPGRADABLE_ABI from "./abi/IERC20UpgradableAbi.json";
import VBEP20_DELEGATE_ABI from "./abi/VBep20DelegateAbi.json";
import COMPTROLLER_ABI from "./abi/comptroller.json";
import MOVE_DEBT_DELEGATE_ABI from "./abi/moveDebtDelegate.json";
import PRICE_ORACLE_ABI from "./abi/priceOracleAbi.json";
import { parseUnits } from "ethers/lib/utils";

const COMPTROLLER = "0xfd36e2c2a6789db23113685031d7f16329158384";
const DIAMOND_IMPL = "0xD93bFED40466c9A9c3E7381ab335a08807318a1b";
const BNB_BRIDGE_EXPLOITER = "0x489A8756C18C0b8B24EC2a2b9FF3D4d447F79BEc";
const VBUSD = "0x95c78222B3D6e262426483D42CfA53685A67Ab9D";
const VUSDC = "0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8";
const VUSDT = "0xfD5840Cd36d94D7229439859C0112a4185BC0255";
const MOVE_DEBT_DELEGATE = "0x89621C48EeC04A85AfadFD37d32077e65aFe2226";

forking(34258500, () => {
  testVip("VIP-215", vip215());
});

// Ressetting the fork to prevent oracle prices from getting stale
forking(34258500, () => {
  let comptroller: Contract;
  let busd: Contract;
  let usdc: Contract;
  let usdt: Contract;
  let vBUSD: Contract;
  let vUSDC: Contract;
  let vUSDT: Contract;

  let moveDebtDelegate: Contract;
  let oracle: Contract;

  before(async () => {
    const provider = ethers.provider;
    comptroller = new ethers.Contract(COMPTROLLER, COMPTROLLER_ABI, provider);
    [vBUSD, vUSDC, vUSDT] = [VBUSD, VUSDC, VUSDT].map((address: string) => {
      return new ethers.Contract(address, VBEP20_DELEGATE_ABI, provider);
    });
    [busd, usdc, usdt] = await Promise.all(
      [vBUSD, vUSDC, vUSDT].map(async (vToken: Contract) => {
        const underlying = await vToken.underlying();
        return new ethers.Contract(underlying, IERC20_UPGRADABLE_ABI, provider);
      }),
    );
    const oracleAddress = await comptroller.oracle();
    oracle = new ethers.Contract(oracleAddress, PRICE_ORACLE_ABI, provider);
    moveDebtDelegate = new ethers.Contract(MOVE_DEBT_DELEGATE, MOVE_DEBT_DELEGATE_ABI, provider);
    await pretendExecutingVip(vip215());
  });

  describe("Post-VIP contracts status", async () => {
    it("sets Comptroller implementation back to the diamond version", async () => {
      expect(await comptroller.comptrollerImplementation()).to.equal(DIAMOND_IMPL);
    });

    it("sets the delegate for BNB bridge exploiter", async () => {
      expect(await comptroller.approvedDelegates(BNB_BRIDGE_EXPLOITER, MOVE_DEBT_DELEGATE)).to.equal(true);
    });

    checkCorePoolComptroller();
  });
});
