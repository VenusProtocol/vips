import { expect } from "chai";
import { ethers } from "hardhat";
import { LzChainId } from "src/types";
import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import vip533, { rewardDistributors } from "../../vips/vip-533/bscmainnet";
import REWARD_DISTRIBUTOR_ABI from "./abi/RewardDistributor.json";

export const allRewardDistributors = [
  {
    address: "0x886767B62C7ACD601672607373048FFD96Cf27B2",
    markets: [
      "0x0Ec5488e4F8f319213a14cab188E01fB8517Faa8",
      "0x672208C10aaAA2F9A6719F449C4C8227bc0BC202",
      "0xd8AdD9B41D4E1cd64Edad8722AB0bA8D35536657",
      "0x325cEB02fe1C2fF816A83a5770eA0E88e2faEcF2",
      "0x256AdDBe0a387c98f487e44b85c29eb983413c5e",
      "0x4fAfbDc4F2a9876Bd1764827b26fb8dc4FD1dB95",
      "0x25C20e6e110A1cE3FEbaCC8b7E48368c7b2F0C91",
      "0x17142a05fe678e9584FA1d88EfAC1bF181bF7ABe",
      "0xE36Ae842DbbD7aE372ebA02C8239cd431cC063d6",
      "0xa836ce315b7A6Bb19397Ee996551659B1D92298e",
      "0x5e35C312862d53FD566737892aDCf010cb4928F7",
      "0x13eB80FDBe5C5f4a7039728E258A6f05fb3B912b",
      "0x17C07e0c232f2f80DfDbd7a95b942D893A4C5ACb",
      "0xa0EE2bAA024cC3AA1BC9395522D07B7970Ca75b3",
      "0x0c6B19287999f1e31a5c0a44393b24B62D2C0468",
      "0x8C3e3821259B82fFb32B2450A95d2dcbf161C24E",
      "0x8716554364f20BCA783cb2BAA744d39361fd1D8d",
      "0x7c8ff7d2A1372433726f879BD945fFb250B94c65",
      "0xc42E4bfb996ED35235bda505430cBE404Eb49F77",
      "0xf87c0a64dc3a8622D6c63265FA29137788163879",
      "0x475d0C68a8CD275c15D1F01F4f291804E445F677",
      "0x520d67226Bc904aC122dcE66ed2f8f61AA1ED764",
      "0xba3916302cBA4aBcB51a01e706fC6051AaF272A0",
    ],
  },
  {
    address: "0x1e25CF968f12850003Db17E0Dba32108509C4359",
    markets: [
      "0xA854D35664c658280fFf27B6eDC6C4195c3229B3",
      "0xE0ee5dDeBFe0abe0a4Af50299D68b74Cec31668e",
      "0xDB6C345f864883a8F4cae87852Ac342589E76D1B",
      "0xF9E9Fe17C00a8B96a8ac20c4E344C8688D7b947E",
      "0xb4933AF59868986316Ed37fa865C829Eba2df0C7",
      "0xEF26C64bC06A8dE4CA5D31f119835f9A1d9433b9",
      "0xc82780Db1257C788F262FBbDA960B3706Dfdcaf2",
      "0x4a240F0ee138697726C8a3E43eFE6Ac3593432CB",
    ],
  },
];

forking(22937517, async () => {
  describe("Post-VIP behaviour", async () => {
    it("check speed", async () => {
      for (const distributor of rewardDistributors) {
        if (distributor.chainId !== LzChainId.ethereum) continue;

        const rewardDistributor = new ethers.Contract(distributor.address, REWARD_DISTRIBUTOR_ABI, ethers.provider);

        for (const market of distributor.markets) {
          const supplySpeed = await rewardDistributor.rewardTokenSupplySpeeds(market);
          const borrowSpeed = await rewardDistributor.rewardTokenBorrowSpeeds(market);

          expect(supplySpeed != 0 || borrowSpeed != 0).to.be.true;
        }
      }
    });
  });

  testForkedNetworkVipCommands("VIP 533", await vip533());

  describe("Post-VIP behaviour", async () => {
    it("check speed", async () => {
      for (const distributor of allRewardDistributors) {
        const rewardDistributor = new ethers.Contract(distributor.address, REWARD_DISTRIBUTOR_ABI, ethers.provider);

        for (const market of distributor.markets) {
          const supplySpeed = await rewardDistributor.rewardTokenSupplySpeeds(market);
          const borrowSpeed = await rewardDistributor.rewardTokenBorrowSpeeds(market);

          expect(supplySpeed == 0 && borrowSpeed == 0).to.be.true;
        }
      }
    });
  });
});
