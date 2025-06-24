import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, Event } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip522, {
  ACM_OPBNB,
  ERC4626_FACTORY_OPBNB,
  PROXY_ADMIN_OPBNB,
  PSR_OPBNB,
  PSR_OPBNB_NEW_IMPLEMENTATION,
} from "../../vips/vip-522/bsctestnet";
import ACM_ABI from "./abi/ACM.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import PROXY_ADMIN_ABI from "./abi/DefaultProxyAdmin.json";
import ERC20_ABI from "./abi/ERC20.json";
import ERC4626_ABI from "./abi/ERC4626.json";
import ERC4626FACTORY_ABI from "./abi/ERC4626Factory.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";
import REWARD_TOKEN_ABI from "./abi/RewardToken.json";

const { opbnbtestnet } = NETWORK_ADDRESSES;
const DEPLOYER = "0x4c65A0342C8E632209147345c973A18f6A8c1979";
const BLOCK_NUMBER = 68008267;
const PSR_OPBNB_OLD_IMPLEMENTATION = "0xD91a8d928413daEc12028800cb934562138b8b36";
const USDT_HOLDER = "0x9cc6f5f16498fceef4d00a350bd8f8921d304dc9";
const USDT_CORE = "0x8ac9B3801D0a8f5055428ae0bF301CA1Da976855";
const VUSDT_CORE = "0xe3923805f6E117E51f5387421240a86EF1570abC";
const COMPTROLLER_CORE = "0x2FCABb31E57F010D623D8d68e1E18Aed11d5A388";

forking(BLOCK_NUMBER, async () => {
  const provider = ethers.provider;
  let erc4626Factory: Contract;
  let defaultProxyAdmin: Contract;
  let usdt: Contract;
  let comptroller: Contract;
  let venusERC4626: Contract;
  let usdtHolder: SignerWithAddress;
  let userSigner: SignerWithAddress;

  before(async () => {
    erc4626Factory = new ethers.Contract(ERC4626_FACTORY_OPBNB, ERC4626FACTORY_ABI, provider);
    defaultProxyAdmin = new ethers.Contract(PROXY_ADMIN_OPBNB, PROXY_ADMIN_ABI, provider);

    // Initialize signers
    userSigner = await initMainnetUser(await ethers.provider.getSigner().getAddress(), parseUnits("2"));
    usdtHolder = await initMainnetUser(USDT_HOLDER, parseUnits("2"));

    // Get testnet contracts
    usdt = new ethers.Contract(USDT_CORE, ERC20_ABI, provider);
    comptroller = new ethers.Contract(COMPTROLLER_CORE, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("ERC4626Factory owner should be the Deployer", async () => {
      expect(await erc4626Factory.owner()).to.be.equals(DEPLOYER);
    });

    it("ERC4626Factory pending owner should be Normal Timelock", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(opbnbtestnet.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory should have correct ACM", async () => {
      expect(await erc4626Factory.accessControlManager()).to.be.equals(ACM_OPBNB);
    });

    it("ERC4626Factory rewardRecipient should be the deployer", async () => {
      expect(await erc4626Factory.rewardRecipient()).to.be.equals(DEPLOYER);
    });

    it("old PSR implementation should be correct", async () => {
      expect(await defaultProxyAdmin.getProxyImplementation(PSR_OPBNB)).to.be.equals(PSR_OPBNB_OLD_IMPLEMENTATION);
    });
  });

  testForkedNetworkVipCommands("Accept ownerships for ERC4626Factory", await vip522(), {
    callbackAfterExecution: async txResponse => {
      await expectEvents(
        txResponse,
        [ERC4626FACTORY_ABI, ACM_ABI],
        ["OwnershipTransferred", "PermissionGranted", "RewardRecipientUpdated"],
        [1, 4, 1],
      );
    },
  });

  describe("Post-VIP behaviour", async () => {
    it("ERC4626Factory ownership transferred to Normal Timelock", async () => {
      expect(await erc4626Factory.owner()).to.be.equals(opbnbtestnet.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory pending owner should be zero address", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(ethers.constants.AddressZero);
    });

    it("ERC4626Factory rewardRecipient should be the PSR", async () => {
      expect(await erc4626Factory.rewardRecipient()).to.be.equals(PSR_OPBNB);
    });

    it("new PSR implementation should be correct", async () => {
      expect(await defaultProxyAdmin.getProxyImplementation(PSR_OPBNB)).to.be.equals(PSR_OPBNB_NEW_IMPLEMENTATION);
    });

    it("check for claimRewards", async () => {
      // Deploy VenusERC4626
      const tx = await erc4626Factory.connect(userSigner).createERC4626(VUSDT_CORE);
      const receipt = await tx.wait();

      const createERC4626Event = receipt.events?.find((e: Event) => e.event === "CreateERC4626");
      const venusERC4626Address = createERC4626Event?.args?.vault;

      // Deploy VenusERC4626 once we set PSR as rewardRecipient
      venusERC4626 = new ethers.Contract(venusERC4626Address, ERC4626_ABI, provider);

      // Fund user with USDT
      await usdt.connect(usdtHolder).transfer(await userSigner.getAddress(), parseUnits("1000", 18));
      await usdt.connect(userSigner).approve(venusERC4626Address, parseUnits("10000", 18));

      const depositAmount = parseUnits("1000", 18);

      // Make a deposit to start earning rewards
      await venusERC4626.connect(userSigner).deposit(depositAmount, await userSigner.getAddress());
      await mine(10000000);

      const distributors = await comptroller.getRewardDistributors();
      if (distributors.length === 0) {
        console.log("No active reward distributors - skipping test");
        return;
      }

      const distributor = new ethers.Contract(distributors[0], REWARD_DISTRIBUTOR_ABI, provider);
      const rewardTokenAddress = await distributor.rewardToken();
      const rewardToken = new ethers.Contract(rewardTokenAddress, REWARD_TOKEN_ABI, provider);

      const initialPsrBalance = await rewardToken.balanceOf(PSR_OPBNB);

      await expect(venusERC4626.connect(userSigner).claimRewards()).to.emit(venusERC4626, "ClaimRewards");

      // Check balances (Reward balance will be 0 as the rewardTokenSupplySpeeds is 0 for the reward Token)
      const finalPsrBalance = await rewardToken.balanceOf(PSR_OPBNB);
      expect(finalPsrBalance).to.equal(initialPsrBalance);
    });
  });
});
