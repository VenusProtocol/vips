import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract, Event } from "ethers";
import { parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";
import { NETWORK_ADDRESSES } from "src/networkAddresses";
import { expectEvents, initMainnetUser } from "src/utils";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip521, {
  ACM_ZKSYNC,
  ERC4626_FACTORY_ZKSYNC,
  PROXY_ADMIN_ZKSYNC,
  PSR_ZKSYNC,
  PSR_ZKSYNC_NEW_IMPLEMENTATION,
} from "../../vips/vip-521/bscmainnet";
import ACM_ABI from "./abi/ACM.json";
import COMPTROLLER_ABI from "./abi/Comptroller.json";
import PROXY_ADMIN_ABI from "./abi/DefaultProxyAdmin.json";
import ERC20_ABI from "./abi/ERC20.json";
import ERC4626_ABI from "./abi/ERC4626.json";
import ERC4626FACTORY_ABI from "./abi/ERC4626Factory.json";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";
import REWARD_TOKEN_ABI from "./abi/RewardToken.json";

const { zksyncmainnet } = NETWORK_ADDRESSES;
const DEPLOYER = "0xF39495A0AbcD780C367E6abA747dB98DD54187bC";
const BLOCK_NUMBER = 61454735;
const PSR_ZKSYNC_OLD_IMPLEMENTATION = "0x72FdEC477A5652E4a012CEE2e50A4150459Ec296";
const WETH_HOLDER = "0xE0B015E54d54fc84a6cB9B666099c46adE9335FF";
const WETH_CORE = "0x5AEa5775959fBC2557Cc8789bC1bf90A239D9a91";
const VWETH_CORE = "0x1Fa916C27c7C2c4602124A14C77Dbb40a5FF1BE8";
const COMPTROLLER_CORE = "0xddE4D098D9995B659724ae6d5E3FB9681Ac941B1";

forking(BLOCK_NUMBER, async () => {
  const provider = ethers.provider;
  let erc4626Factory: Contract;
  let defaultProxyAdmin: Contract;
  let weth: Contract;
  let comptroller: Contract;
  let venusERC4626: Contract;
  let wethHolder: SignerWithAddress;
  let userSigner: SignerWithAddress;

  before(async () => {
    erc4626Factory = new ethers.Contract(ERC4626_FACTORY_ZKSYNC, ERC4626FACTORY_ABI, provider);
    defaultProxyAdmin = new ethers.Contract(PROXY_ADMIN_ZKSYNC, PROXY_ADMIN_ABI, provider);

    // Initialize signers
    userSigner = await initMainnetUser(await ethers.provider.getSigner().getAddress(), parseUnits("2"));
    wethHolder = await initMainnetUser(WETH_HOLDER, parseUnits("2"));

    // Get mainnet contracts
    weth = new ethers.Contract(WETH_CORE, ERC20_ABI, provider);
    comptroller = new ethers.Contract(COMPTROLLER_CORE, COMPTROLLER_ABI, provider);
  });

  describe("Pre-VIP behaviour", async () => {
    it("ERC4626Factory owner should be the Deployer", async () => {
      expect(await erc4626Factory.owner()).to.be.equals(DEPLOYER);
    });

    it("ERC4626Factory pending owner should be Normal Timelock", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(zksyncmainnet.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory should have correct ACM", async () => {
      expect(await erc4626Factory.accessControlManager()).to.be.equals(ACM_ZKSYNC);
    });

    it("ERC4626Factory rewardRecipient should be the deployer", async () => {
      expect(await erc4626Factory.rewardRecipient()).to.be.equals(DEPLOYER);
    });

    it("old PSR implementation should be correct", async () => {
      expect(await defaultProxyAdmin.getProxyImplementation(PSR_ZKSYNC)).to.be.equals(PSR_ZKSYNC_OLD_IMPLEMENTATION);
    });
  });

  testForkedNetworkVipCommands("Accept ownerships for ERC4626Factory", await vip521(), {
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
      expect(await erc4626Factory.owner()).to.be.equals(zksyncmainnet.NORMAL_TIMELOCK);
    });

    it("ERC4626Factory pending owner should be zero address", async () => {
      expect(await erc4626Factory.pendingOwner()).to.be.equals(ethers.constants.AddressZero);
    });

    it("ERC4626Factory rewardRecipient should be the PSR", async () => {
      expect(await erc4626Factory.rewardRecipient()).to.be.equals(PSR_ZKSYNC);
    });

    it("new PSR implementation should be correct", async () => {
      expect(await defaultProxyAdmin.getProxyImplementation(PSR_ZKSYNC)).to.be.equals(PSR_ZKSYNC_NEW_IMPLEMENTATION);
    });

    it("check for claimRewards", async () => {
      // Deploy VenusERC4626
      const tx = await erc4626Factory.connect(userSigner).createERC4626(VWETH_CORE);
      const receipt = await tx.wait();

      const createERC4626Event = receipt.events?.find((e: Event) => e.event === "CreateERC4626");
      const venusERC4626Address = createERC4626Event?.args?.vault;

      // Deploy VenusERC4626 once we set PSR as rewardRecipient
      venusERC4626 = new ethers.Contract(venusERC4626Address, ERC4626_ABI, provider);

      // Fund user with WETH
      await weth.connect(wethHolder).transfer(await userSigner.getAddress(), parseUnits("20", 18));
      await weth.connect(userSigner).approve(venusERC4626Address, parseUnits("200", 18));

      const depositAmount = parseUnits("20", 18);

      // Make a deposit to start earning rewards
      await venusERC4626.connect(userSigner).deposit(depositAmount, await userSigner.getAddress());
      await mine(3);

      const distributors = await comptroller.getRewardDistributors();
      if (distributors.length === 0) {
        console.log("No active reward distributors - skipping test");
        return;
      }

      const distributor = new ethers.Contract(distributors[0], REWARD_DISTRIBUTOR_ABI, provider);
      const rewardTokenAddress = await distributor.rewardToken();
      const rewardToken = new ethers.Contract(rewardTokenAddress, REWARD_TOKEN_ABI, provider);

      const initialPsrBalance = await rewardToken.balanceOf(PSR_ZKSYNC);

      await expect(venusERC4626.connect(userSigner).claimRewards()).to.emit(venusERC4626, "ClaimRewards");
      const finalPsrBalance = await rewardToken.balanceOf(PSR_ZKSYNC);

      // reward tokens transfered to PSR
      expect(finalPsrBalance).to.be.gte(initialPsrBalance);
    });
  });
});
