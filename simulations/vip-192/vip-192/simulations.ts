import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, pretendExecutingVip, testVip } from "../../../src/vip-framework";
import { fetchVTokenStorageCore, performVTokenBasicActions, storageLayout } from "../../../src/vtokenUpgradesHelper";
import { CORE_MARKETS, vip192 } from "../../../vips/vip-192/vip-192";
import COMPTROLLER_ABI from "./abi/COMPTROLLER.json";
import MOCK_TOKEN_ABI from "./abi/MOCK_TOKEN_ABI.json";
import VTOKEN_ABI from "./abi/VTOKEN_ABI.json";

const NEW_VBEP20_DELEGATE_IMPL = "0xc3279442a5aCaCF0A2EcB015d1cDDBb3E0f3F775";
const ACCESS_CONTROL_MANAGER = "0x4788629ABc6cFCA10F9f969efdEAa1cF70c23555";
const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

let vToken: ethers.Contract;
let underlying: ethers.Contract;
let user: SignerWithAddress;
let impersonatedTimelock: SignerWithAddress;
const postVipStorage: storageLayout[] = [];
const preVipStorage: storageLayout[] = [];
const provider = ethers.provider;
const mintAmount = parseUnits("200", 18);
const borrowAmount = parseUnits("50", 18);
const repayAmount = parseUnits("50", 18);
const redeemAmount = parseUnits("50", 18);

forking(32915411, () => {
  describe("Pre VIP simulations", async () => {
    before(async () => {
      [user] = await ethers.getSigners();
      impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("3"));
      await mine(CORE_MARKETS.length * 4 + 4); // Number of Vip steps
    });
    for (const market of CORE_MARKETS) {
      it(`Save pre VIP storage snapshot of ${market.name}`, async () => {
        user = await initMainnetUser(market.holder, ethers.utils.parseEther("5"));

        vToken = new ethers.Contract(market.address, VTOKEN_ABI, provider);
        const comptroller = new ethers.Contract(await vToken.comptroller(), COMPTROLLER_ABI, provider);
        underlying = new ethers.Contract(await vToken.underlying(), MOCK_TOKEN_ABI, provider);

        await comptroller.connect(impersonatedTimelock)._setMarketBorrowCaps([market.address], [parseUnits("2", 48)]);
        await comptroller.connect(impersonatedTimelock)._setMarketSupplyCaps([market.address], [parseUnits("2", 48)]);
        await comptroller.connect(impersonatedTimelock)._setCollateralFactor(market.address, parseUnits("0.95", 18));

        // Some actions are paused
        if (market.name != "vBETH" && market.name != "vSXP" && market.name != "vBUSD") {
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
        }
        const state = await fetchVTokenStorageCore(vToken, user.address);

        delete state.totalReserves;
        delete state.pendingOwner;
        delete state.owner;

        preVipStorage.push(state);
      });
    }
  });
});

forking(32915411, () => {
  const ProxyAdminInterface = [
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "oldImplementation",
          type: "address",
        },
        {
          indexed: false,
          internalType: "address",
          name: "newImplementation",
          type: "address",
        },
      ],
      name: "NewImplementation",
      type: "event",
    },
  ];
  testVip("VIP-192 Core  VToken Upgrade of AIA", vip192(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [VTOKEN_ABI, ProxyAdminInterface],
        ["NewImplementation", "NewProtocolShareReserve", "NewReduceReservesBlockDelta", "NewAccessControlManager"],
        [23, 23, 23, 23],
      );
    },
  });
});

forking(32915411, () => {
  describe("Post VIP simulations", async () => {
    before(async () => {
      await pretendExecutingVip(vip192());
      [user] = await ethers.getSigners();
    });

    for (const market of CORE_MARKETS) {
      it(`Save post VIP storage snapshot of ${market.name}`, async () => {
        user = await initMainnetUser(market.holder, ethers.utils.parseEther("5"));

        vToken = new ethers.Contract(market.address, VTOKEN_ABI, provider);
        const comptroller = new ethers.Contract(await vToken.comptroller(), COMPTROLLER_ABI, provider);
        underlying = new ethers.Contract(await vToken.underlying(), MOCK_TOKEN_ABI, provider);

        await comptroller.connect(impersonatedTimelock)._setMarketBorrowCaps([market.address], [parseUnits("2", 48)]);
        await comptroller.connect(impersonatedTimelock)._setMarketSupplyCaps([market.address], [parseUnits("2", 48)]);
        await comptroller.connect(impersonatedTimelock)._setCollateralFactor(market.address, parseUnits("0.95", 18));

        // Some actions are paused
        if (market.name != "vBETH" && market.name != "vSXP" && market.name != "vBUSD") {
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
        }
        const state = await fetchVTokenStorageCore(vToken, user.address);

        delete state.totalReserves;
        delete state.pendingOwner;
        delete state.owner;

        expect(await vToken.implementation()).equals(NEW_VBEP20_DELEGATE_IMPL);
        expect(await vToken.protocolShareReserve()).equals(PROTOCOL_SHARE_RESERVE);
        expect(await vToken.accessControlManager()).equals(ACCESS_CONTROL_MANAGER);
        expect(await vToken.admin()).equals(NORMAL_TIMELOCK);

        postVipStorage.push(state);
      });
    }

    it("Should match pre and post storage", async () => {
      for (let i = 0; i < preVipStorage.length; i++) {
        expect(preVipStorage[i]).to.deep.equal(postVipStorage[i]);
      }
    });
  });
});

// In very first operation after upgrade the reserves will be reduced (delta > lastReduceReservesBlockNumber(0)).
forking(32915411, () => {
  describe("Post VIP simulations", async () => {
    before(async () => {
      await pretendExecutingVip(vip192());
    });

    for (const market of CORE_MARKETS) {
      if (market.name != "vBUSD") {
        it(`Reduce reserves in ${market.name}`, async () => {
          vToken = new ethers.Contract(market.address, VTOKEN_ABI, provider);
          underlying = new ethers.Contract(await vToken.underlying(), MOCK_TOKEN_ABI, provider);

          const reservesPrior = await vToken.totalReserves();
          const psrBalPrior = await underlying.balanceOf(PROTOCOL_SHARE_RESERVE);
          await expect(vToken.connect(impersonatedTimelock).accrueInterest()).to.be.emit(vToken, "ReservesReduced");
          const reservesAfter = await vToken.totalReserves();
          const psrBalAfter = await underlying.balanceOf(PROTOCOL_SHARE_RESERVE);

          expect(psrBalAfter).greaterThan(psrBalPrior + reservesPrior);
          expect(reservesAfter).equals(0);
          await expect(vToken.connect(impersonatedTimelock).accrueInterest()).to.not.be.emit(vToken, "ReservesReduced");
        });
      }
    }
  });
});
