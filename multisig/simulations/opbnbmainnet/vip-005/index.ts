import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import { ethers } from "hardhat";

import { NETWORK_ADDRESSES } from "../../../../src/networkAddresses";
import { initMainnetUser } from "../../../../src/utils";
import { forking, pretendExecutingVip } from "../../../../src/vip-framework/index";
import vip005, { VenusMarket } from "../../../proposals/opbnbmainnet/vip-005";
import ACM_ABI from "./abi/accessControlManager.json";
import PSR_ABI from "./abi/protocolShareReserve.json";
import VTOKEN_ABI from "./abi/vToken.json";

const { opbnbmainnet } = NETWORK_ADDRESSES;

const ACM = "0xA60Deae5344F1152426cA440fb6552eA0e3005D6";
const PROTOCOL_SHARE_RESERVE = "0xA2EDD515B75aBD009161B15909C19959484B0C1e";
const POOL_REGISTRY = "0x345a030Ad22e2317ac52811AC41C1A63cfa13aEe";
const VTREASURY = "0xDDc9017F3073aa53a4A8535163b0bf7311F72C52";
const OPBNBMAINNET_MULTISIG = opbnbmainnet.NORMAL_TIMELOCK;

const MARKETS: VenusMarket[] = [
  {
    name: "VToken_vBTCB_Core",
    address: "0xED827b80Bd838192EA95002C01B5c6dA8354219a",
  },
  {
    name: "VToken_vETH_Core",
    address: "0x509e81eF638D489936FA85BC58F52Df01190d26C",
  },
  {
    name: "VToken_vUSDT_Core",
    address: "0xb7a01Ba126830692238521a1aA7E7A7509410b8e",
  },
  {
    name: "VToken_vFDUSD_Core",
    address: "0x13B492B8A03d072Bab5C54AC91Dba5b830a50917",
  },
  {
    name: "VToken_vWBNB_Core",
    address: "0x53d11cB8A0e5320Cd7229C3acc80d1A0707F2672",
  },
];

forking(17382200, () => {
  let protocolShareReserve: Contract;
  let accessControlManager: Contract;
  let psrSigner: SignerWithAddress;

  before(async () => {
    protocolShareReserve = await ethers.getContractAt(PSR_ABI, PROTOCOL_SHARE_RESERVE);
    accessControlManager = await ethers.getContractAt(ACM_ABI, ACM);

    psrSigner = await initMainnetUser(PROTOCOL_SHARE_RESERVE, ethers.utils.parseEther("1"));
    await pretendExecutingVip(await vip005());
  });

  describe("Post tx checks", () => {
    it("PSR owner should be multisig", async () => {
      const owner = await protocolShareReserve.owner();
      expect(owner).equals(OPBNBMAINNET_MULTISIG);
    });
    it("PSR should have correct ACM reference", async () => {
      const acm = await protocolShareReserve.accessControlManager();
      expect(acm).equals(ACM);
    });
    it("PSR should have correct PoolRegistry reference", async () => {
      expect(await protocolShareReserve.poolRegistry()).to.equal(POOL_REGISTRY);
    });
    it("Verify Multisig permissions for PSR", async () => {
      expect(
        await accessControlManager
          .connect(psrSigner)
          .isAllowedToCall(OPBNBMAINNET_MULTISIG, "addOrUpdateDistributionConfigs(DistributionConfig[])"),
      ).to.be.true;

      expect(
        await accessControlManager
          .connect(psrSigner)
          .isAllowedToCall(OPBNBMAINNET_MULTISIG, "removeDistributionConfig(Schema,address)"),
      ).to.be.true;
    });
    it("Validate PSR distribution config", async () => {
      expect(await protocolShareReserve.totalDistributions()).to.equal(2);
      expect(await protocolShareReserve.getPercentageDistribution(VTREASURY, 0)).to.equal(10000);
      expect(await protocolShareReserve.getPercentageDistribution(VTREASURY, 1)).to.equal(10000);
    });

    MARKETS.forEach(market => {
      describe(`${market.name}`, () => {
        let vToken: Contract;

        before(async () => {
          vToken = await ethers.getContractAt(VTOKEN_ABI, market.address);
        });

        it(`Validate PSR reference in ${market.name} market `, async () => {
          expect(await vToken.protocolShareReserve()).to.equal(PROTOCOL_SHARE_RESERVE);
        });
      });
    });
  });
});
