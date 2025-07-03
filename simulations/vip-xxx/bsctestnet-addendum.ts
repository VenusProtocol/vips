import { expect } from "chai";
import { ethers } from "hardhat";
import { forking, testVip } from "src/vip-framework";

import { vip599_Addendum } from "./../../vips/vip-xxx/bsctestnet-addendum";

forking(56835644, async () => {
  testVip("vip-599-addendum", await vip599_Addendum(), {});
});
