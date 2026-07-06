import { forking, testForkedNetworkVipCommands } from "src/vip-framework";

import { BASE_CORE } from "../../vips/vip-634/phase4Markets";
import vip647 from "../../vips/vip-647/bscmainnet";
import { checkDeprecationPostVip, checkDeprecationPreVip } from "./utils/checkDeprecation";

const FORK_BLOCK = 47410957;

forking(FORK_BLOCK, async () => {
  checkDeprecationPreVip([BASE_CORE]);

  testForkedNetworkVipCommands("VIP-647 Base", await vip647());

  checkDeprecationPostVip([BASE_CORE]);
});
