import { mine, setBalance } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, pretendExecutingVip, testVip } from "src/vip-framework";
import { StorageLayout, fetchVTokenStorageCore, performVTokenBasicActions } from "src/vtokenUpgradesHelper";

import { CORE_MARKETS, vip192Testnet } from "../../../vips/vip-192/vip-192-testnet";
import COMPTROLLER_ABI from "./abi/COMPTROLLER.json";
import MOCK_TOKEN_ABI from "./abi/MOCK_TOKEN_ABI.json";
import VTOKEN_ABI from "./abi/VTOKEN_ABI.json";

const { bscmainnet } = NETWORK_ADDRESSES;

const NEW_VBEP20_DELEGATE_IMPL = "0x8d79C8f4400fE68Fd17040539FE5e1706c1f2850";
const NORMAL_TIMELOCK = "0xce10739590001705F7FF231611ba4A48B2820327";
const PROTOCOL_SHARE_RESERVE = "0x25c7c7D6Bf710949fD7f03364E9BA19a1b3c10E3";
const ACCESS_CONTROL_MANAGER = "0x45f8a08F534f34A97187626E05d4b6648Eeaa9AA";
const TOKEN_HOLDER = "0x2Ce1d0ffD7E869D9DF33e28552b12DdDed326706";

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

forking(34517682, async () => {
  describe("Pre VIP simulations", async () => {
    before(async () => {
      [user] = await ethers.getSigners();
      impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("3"));
      await mine(CORE_MARKETS.length * 4 + 22); // Number of Vip steps
    });
    for (const market of CORE_MARKETS) {
      it(`Save pre VIP storage snapshot of ${market.name}`, async () => {
        if (!market.isMock) {
          user = await initMainnetUser(TOKEN_HOLDER, ethers.utils.parseEther("5"));
        } else {
          await setBalance(user.address, ethers.utils.parseEther("5"));
        }

        vToken = new ethers.Contract(market.address, VTOKEN_ABI, provider);
        const comptroller = new ethers.Contract(await vToken.comptroller(), COMPTROLLER_ABI, provider);
        underlying = new ethers.Contract(await vToken.underlying(), MOCK_TOKEN_ABI, provider);

        await comptroller.connect(impersonatedTimelock)._setMarketBorrowCaps([market.address], [parseUnits("2", 48)]);
        await comptroller.connect(impersonatedTimelock)._setMarketSupplyCaps([market.address], [parseUnits("2", 48)]);
        await comptroller.connect(impersonatedTimelock)._setCollateralFactor(market.address, parseUnits("0.95", 18));

        if (market.name == "vTRXOLD") {
          // Several actions are paused in vBUSD and vTUSDOLD
          await performVTokenBasicActions(
            market.address,
            user,
            mintAmount,
            borrowAmount,
            repayAmount,
            redeemAmount,
            vToken,
            underlying,
            market.isMock,
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

forking(34517682, async () => {
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
  testVip("VIP-192 Core  VToken Upgrade of AIA Part - 1", await vip192Testnet(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [VTOKEN_ABI, ProxyAdminInterface],
        ["NewImplementation", "NewProtocolShareReserve", "NewReduceReservesBlockDelta", "NewAccessControlManager"],
        [2, 2, 2, 2],
      );
    },
  });
});

forking(34517682, async () => {
  describe("Post VIP simulations", async () => {
    before(async () => {
      await pretendExecutingVip(await vip192Testnet(), bscmainnet.NORMAL_TIMELOCK);
      impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("3"));
      [user] = await ethers.getSigners();
    });

    for (const market of CORE_MARKETS) {
      it(`Save post VIP storage snapshot of ${market.name}`, async () => {
        if (!market.isMock) {
          user = await initMainnetUser(TOKEN_HOLDER, ethers.utils.parseEther("5"));
        } else {
          await setBalance(user.address, ethers.utils.parseEther("5"));
        }

        vToken = new ethers.Contract(market.address, VTOKEN_ABI, provider);
        const comptroller = new ethers.Contract(await vToken.comptroller(), COMPTROLLER_ABI, provider);
        underlying = new ethers.Contract(await vToken.underlying(), MOCK_TOKEN_ABI, provider);

        await comptroller.connect(impersonatedTimelock)._setMarketBorrowCaps([market.address], [parseUnits("2", 48)]);
        await comptroller.connect(impersonatedTimelock)._setMarketSupplyCaps([market.address], [parseUnits("2", 48)]);
        await comptroller.connect(impersonatedTimelock)._setCollateralFactor(market.address, parseUnits("0.95", 18));

        if (market.name == "vTRXOLD") {
          // Several actions are paused in vBUSD and vTUSDOLD
          await performVTokenBasicActions(
            market.address,
            user,
            mintAmount,
            borrowAmount,
            repayAmount,
            redeemAmount,
            vToken,
            underlying,
            market.isMock,
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
forking(34517682, async () => {
  describe("Post VIP simulations", async () => {
    before(async () => {
      await pretendExecutingVip(await vip192Testnet(), bscmainnet.NORMAL_TIMELOCK);
    });

    for (const market of CORE_MARKETS) {
      it(`Reduce reserves in ${market.name}`, async () => {
        vToken = new ethers.Contract(market.address, VTOKEN_ABI, provider);
        underlying = new ethers.Contract(await vToken.underlying(), MOCK_TOKEN_ABI, provider);

        const cashPrior = await vToken.getCash();
        const reservesPrior = await vToken.totalReserves();
        const psrBalPrior = await underlying.balanceOf(PROTOCOL_SHARE_RESERVE);
        if (Number(cashPrior) > Number(reservesPrior)) {
          await expect(vToken.connect(impersonatedTimelock).accrueInterest()).to.be.emit(vToken, "ReservesReduced");
          const reservesAfter = await vToken.totalReserves();
          const psrBalAfter = await underlying.balanceOf(PROTOCOL_SHARE_RESERVE);

          expect(psrBalAfter).greaterThan(psrBalPrior + reservesPrior);
          expect(reservesAfter).equals(0);
          await expect(vToken.connect(impersonatedTimelock).accrueInterest()).to.not.be.emit(vToken, "ReservesReduced");
        } else {
          await expect(vToken.connect(impersonatedTimelock).accrueInterest()).to.not.be.emit(vToken, "ReservesReduced");
          const reservesAfter = await vToken.totalReserves();
          const psrBalAfter = await underlying.balanceOf(PROTOCOL_SHARE_RESERVE);
          expect(psrBalAfter).equals(psrBalPrior);
          expect(reservesAfter).greaterThan(reservesPrior);
        }
      });
    }
  });
});
