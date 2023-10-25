import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { expectEvents, initMainnetUser } from "../../../src/utils";
import { forking, testVip } from "../../../src/vip-framework";
import { CORE_MARKETS, vip193 } from "../../../vips/vip-193/vip-193";
import MOCK_TOKEN_ABI from "./abi/MOCK_TOKEN_ABI.json";
import VTOKEN_ABI from "./abi/VTOKEN_ABI.json";

const PROTOCOL_SHARE_RESERVE = "0xCa01D5A9A248a830E9D93231e791B1afFed7c446";
const NORMAL_TIMELOCK = "0x939bD8d64c0A9583A7Dcea9933f7b21697ab6396";

let vToken: ethers.Contract;
let underlying: ethers.Contract;
let impersonatedTimelock: SignerWithAddress;
const provider = ethers.provider;

forking(32906245, () => {
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
  testVip("VIP-193 Core VToken Upgrade of AIA Part - 2", vip193(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [VTOKEN_ABI, ProxyAdminInterface],
        ["NewImplementation", "NewProtocolShareReserve", "NewReduceReservesBlockDelta", "NewAccessControlManager"],
        [3, 3, 3, 3],
      );
    },
  });

  describe("Post VIP simulations", async () => {
    before(async () => {
      impersonatedTimelock = await initMainnetUser(NORMAL_TIMELOCK, ethers.utils.parseEther("3"));
      [user] = await ethers.getSigners();
    });
    for (const market of CORE_MARKETS) {
      it(`Reduce reserves in ${market.name}`, async () => {
        vToken = new ethers.Contract(market.address, VTOKEN_ABI, provider);
        underlying = new ethers.Contract(await vToken.underlying(), MOCK_TOKEN_ABI, provider);

        const reservesPrior = await vToken.totalReserves();
        const psrBalPrior = await underlying.balanceOf(PROTOCOL_SHARE_RESERVE);

        // In very first operation after upgrade the reserves will be reduced (delta > lastReduceReservesBlockNumber(0)).
        expect(await vToken.connect(impersonatedTimelock).accrueInterest()).to.be.emit(vToken, "ReservesReduced");
        const reservesAfter = await vToken.totalReserves();
        const psrBalAfter = await underlying.balanceOf(PROTOCOL_SHARE_RESERVE);

        expect(psrBalAfter).greaterThan(psrBalPrior + reservesPrior);
        expect(reservesAfter).equals(0);
      });
    }
  });
});
