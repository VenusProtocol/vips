import { mine, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../../src/vip-framework";
import { StorageLayout, fetchVTokenStorageIL, performVTokenBasicActions } from "../../../src/vtokenUpgradesHelper";
import { IL_MARKETS, vip194 } from "../../../vips/vip-194/vip-194";
import BEACON_ABI from "./abi/BEACON_ABI.json";
import COMPTROLLER_ABI from "./abi/COMPTROLLER.json";
import MOCK_TOKEN_ABI from "./abi/MOCK_TOKEN_ABI.json";
import VTOKEN_ABI from "./abi/VTOKEN_ABI.json";

const VTOKEN_BEACON = "0x2b8A1C539ABaC89CbF7E2Bc6987A0A38A5e660D4";
const NEW_IMPL_VTOKEN = "0x1Db646E1Ab05571AF99e47e8F909801e5C99d37B";
const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

let vToken: Contract;
let underlying: Contract;
let user: SignerWithAddress;
let impersonatedTimelock: SignerWithAddress;
const postVipStorage: StorageLayout[] = [];
const preVipStorage: StorageLayout[] = [];
const provider = ethers.provider;
const mintAmount = parseUnits("200", 18);
const borrowAmount = parseUnits("50", 18);
const repayAmount = parseUnits("50", 18);
const redeemAmount = parseUnits("50", 18);
forking(32940330, async () => {
  describe("Pre VIP simulations", async () => {
    before(async () => {
      impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("3"));
      await mine(IL_MARKETS.length * 2 + 2); // Number of Vip steps
    });
    for (const market of IL_MARKETS) {
      it(`Save pre VIP storage snapshot of ${market.name}`, async () => {
        user = await initMainnetUser(market.holder, ethers.utils.parseEther("2"));
        vToken = new ethers.Contract(market.address, VTOKEN_ABI, provider);
        const comptroller = new ethers.Contract(await vToken.comptroller(), COMPTROLLER_ABI, provider);
        underlying = new ethers.Contract(await vToken.underlying(), MOCK_TOKEN_ABI, provider);

        await comptroller.connect(impersonatedTimelock).setMarketBorrowCaps([market.address], [parseUnits("2", 38)]);
        await comptroller.connect(impersonatedTimelock).setMarketSupplyCaps([market.address], [parseUnits("2", 38)]);
        await comptroller
          .connect(impersonatedTimelock)
          .setCollateralFactor(market.address, parseUnits("0.8", 18), parseUnits("0.9", 18));

        await performVTokenBasicActions(
          market.address,
          user,
          mintAmount,
          borrowAmount,
          repayAmount,
          redeemAmount,
          vToken,
          underlying,
          false,
        );
        const state = await fetchVTokenStorageIL(vToken, user.address);

        delete state.protocolShareReserve;
        delete state.totalReserves;

        preVipStorage.push(state);
      });
    }
  });
});

forking(32940330, async () => {
  testVip("VIP-194 IL VToken Upgrade of AIA", await vip194(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(txResponse, [VTOKEN_ABI, BEACON_ABI], ["Upgraded", "NewReduceReservesBlockDelta"], [1, 25]);
    },
  });
});

forking(32940330, async () => {
  describe("Post VIP simulations", async () => {
    before(async () => {
      await pretendExecutingVip(await vip194());
    });

    for (const market of IL_MARKETS) {
      it(`Save post VIP storage snapshot of ${market.name}`, async () => {
        user = await initMainnetUser(market.holder, ethers.utils.parseEther("2"));
        await setBalance(user.address, ethers.utils.parseEther("5"));
        vToken = new ethers.Contract(market.address, VTOKEN_ABI, provider);
        const comptroller = new ethers.Contract(await vToken.comptroller(), COMPTROLLER_ABI, provider);
        underlying = new ethers.Contract(await vToken.underlying(), MOCK_TOKEN_ABI, provider);

        await comptroller.connect(impersonatedTimelock).setMarketBorrowCaps([market.address], [parseUnits("2", 38)]);
        await comptroller.connect(impersonatedTimelock).setMarketSupplyCaps([market.address], [parseUnits("2", 38)]);
        await comptroller
          .connect(impersonatedTimelock)
          .setCollateralFactor(market.address, parseUnits("0.8", 18), parseUnits("0.9", 18));

        await performVTokenBasicActions(
          market.address,
          user,
          mintAmount,
          borrowAmount,
          repayAmount,
          redeemAmount,
          vToken,
          underlying,
          false,
        );
        const state = await fetchVTokenStorageIL(vToken, user.address);

        delete state.protocolShareReserve;
        delete state.totalReserves;

        expect(await vToken.protocolShareReserve()).equals(PROTOCOL_SHARE_RESERVE);
        postVipStorage.push(state);
      });
    }

    it("Should match pre and post storage", async () => {
      for (let i = 0; i < preVipStorage.length; i++) {
        expect(preVipStorage[i]).to.deep.equal(postVipStorage[i]);
      }
    });

    it("Should change implementation", async () => {
      const beacon = new ethers.Contract(VTOKEN_BEACON, BEACON_ABI, provider);
      expect(await beacon.implementation()).equals(NEW_IMPL_VTOKEN);
    });
  });
});

// In very first operation after upgrade the reserves will be reduced (delta > lastReduceReservesBlockNumber(0)).
forking(32940330, async () => {
  describe("Post VIP simulations", async () => {
    before(async () => {
      await pretendExecutingVip(await vip194());
      impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("3"));
    });

    for (const market of IL_MARKETS) {
      it(`Reduce reserves in ${market.name}`, async () => {
        vToken = new ethers.Contract(market.address, VTOKEN_ABI, provider);
        underlying = new ethers.Contract(await vToken.underlying(), MOCK_TOKEN_ABI, provider);

        const cashPrior = await vToken.getCash();
        const reservesPrior = await vToken.totalReserves();
        const psrBalPrior = await underlying.balanceOf(PROTOCOL_SHARE_RESERVE);

        if (Number(cashPrior) > Number(reservesPrior) && reservesPrior != 0) {
          await expect(vToken.connect(impersonatedTimelock).accrueInterest()).to.be.emit(
            vToken,
            "SpreadReservesReduced",
          );
          const reservesAfter = await vToken.totalReserves();
          const psrBalAfter = await underlying.balanceOf(PROTOCOL_SHARE_RESERVE);

          expect(psrBalAfter).greaterThanOrEqual(psrBalPrior.add(reservesPrior));
          expect(reservesAfter).equals(0);
          await expect(vToken.connect(impersonatedTimelock).accrueInterest()).to.not.be.emit(
            vToken,
            "SpreadReservesReduced",
          );
        } else if (reservesPrior != 0) {
          await expect(vToken.connect(impersonatedTimelock).accrueInterest()).to.not.be.emit(
            vToken,
            "SpreadReservesReduced",
          );
          const reservesAfter = await vToken.totalReserves();
          const psrBalAfter = await underlying.balanceOf(PROTOCOL_SHARE_RESERVE);
          expect(psrBalAfter).equals(psrBalPrior);
          expect(reservesAfter).greaterThan(reservesPrior);
        }
      });
    }
  });
});
