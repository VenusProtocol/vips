import { BigNumber } from "ethers";
import { Result, formatUnits, parseUnits } from "ethers/lib/utils";
import { ethers } from "hardhat";

import { forking } from "../../../src/vip-framework";
import COMPROLLER_ABI from "../abi/Comptroller.json";
import ERC20_ABI from "../abi/IERC20.json";
import VAI_CONTROLLER_ABI from "../abi/VAIController.json";
import VTOKEN_ABI from "../abi/VBep20.json";

const COMPTROLLER = "0xfD36E2c2a6789Db23113685031d7F16329158384";
const VAI_CONTROLLER = "0x004065D34C6b18cE4370ced1CeBDE94865DbFAFE";
const VTREASURY = "0xF322942f644A996A617BD29c16bd7d231d9F35E9";
const MULTICALL = "0xcA11bde05977b3631167028862bE2a173976CA11";
const VBNB = "0xA07c5b74C9B40447a954e1466938b865b6BBea36";
const ACCOUNT_LENS = "0x9659F447EB89C49E37f49f24979C0ee2c1a3c823";

const MULTICALL_ABI = [
  "function aggregate(tuple(address target, bytes callData)[] calls) public returns (uint256 blockNumber, bytes[] returnData)",
];

const ACCOUNT_LENS_ABI = [
  "function getSupplyAndBorrowsUsd(address comptroller, address account) external view returns (uint256 supplyUsd, uint256 borrowsUsd)",
];

const multicall = new ethers.Contract(MULTICALL, MULTICALL_ABI, ethers.provider);
const comptroller = new ethers.Contract(COMPTROLLER, COMPROLLER_ABI, ethers.provider);
const vaiController = new ethers.Contract(VAI_CONTROLLER, VAI_CONTROLLER_ABI, ethers.provider);
const accountLens = new ethers.Contract(ACCOUNT_LENS, ACCOUNT_LENS_ABI, ethers.provider);

const allAccounts = [
  "0x9c8f3cb0a022e6bdaaf3047f5f8db7f97b65d8af",
  "0x23ccc77aeb5c8be6820303d4a77a6a4f2fdba534",
  "0x404555fb2123b96627b68c9b1c5a3b4c9d36ef98",
  "0x9bf1b39fa47cfe771d9d128e8ffe3df9fb50eced",
  "0x2841a8d1f552eb5142d948944d6d6e8231e5ebcc",
  "0xe2c9439969fc07c7739c920cc298c404663c0ed7",
  "0x79d4afa8af6c3a4d78601320efccbea14a4b9baa",
  "0x1cd9e1c0905df2cb968c6d6059a8759fdc264e5d",
  "0xbaef9372a4973ee5c0701bac607a9bfecb0088ef",
  "0x565acc300ea63707f0713033b967a36892f70ebb",
  "0x351ebf35cc555490bd28d751bf6d54358773334d",
  "0x2c56a0fb49ce0ff4ff7fe39bc94b031c3cd78ce4",
  "0x9db07ba5467d6362de77c253cb758aea8a36619b",
  "0xa1ca4ed7d4252c6bea2f285e34819c2d80cac5c8",
  "0x76ce2da97a527c4012033084305ffb10346653bf",
  "0x1e20fc24471d02a9bff13453de9e3d8e67cc86b6",
  "0x69abf7d07de0a12aa314d1d43448ea0508c6af7a",
  "0x2bdfd0c77ecac63fabacb225fde5e3e078a4eae3",
  "0xca85abc41032e2f9de31c578e33da1318dde9671",
  "0x7261c1a6a47e596dfcf0e2f21140217acc5eded8",
  "0x735ab81c3370e20c12ec757fd4db0787092310b5",
  "0xf3f826735402c8ac133692e69a7d1d94c62f2a9d",
  "0x7b899b97afacd8b9654a447b4db016ba430f6d11",
  "0x8dcf5f960c38fd1861a4d036513adde829d63d81",
  "0x2f102886c106278863b16105d35c19a8e7322e74",
  "0x35c58f4846e5ea93b54dd4bc88577794d05df636",
  "0xb727387a9cf6f922203a713103ada4ebad782073",
  "0x667fe4a12662bef3a11add557ef4bd78e46f9ca2",
  "0x34cf7c3156511edece563e677dff64c21a1ccac5",
  "0x6f9ac5b3fa4308620c6763d9aa5a65446e75f5b5",
  "0x45e017b467a38f5d83094e60a1494d19655bec22",
  "0x249169274d1e6aa08db770f7c4e70644eb6f64f5",
  "0xe548c0d06ec0d3a40f4157269ed35fbdb779db1f",
  "0x40c7c2373885e206907bee7ce1e4beda9c50ad97",
  "0xe80bbb610de5c8e5aa9da3a2423ac18376d99ad5",
  "0x7729e13f92bc09791abf87da0b0103c1153af500",
  "0x107ac223d23fd8abed2b725c1d43b88aa33028d6",
  "0x5abce4c333508e326778c282b5610fbf6b49ffb5",
  "0x37ceb311e5d47178dd025b288db2e6449aaba3e1",
  "0x14f47b11aad2c9de8cb0728cd30556d578872f62",
  "0x797b00ff517ed9b755e8039ee092ba9d1890b9ae",
  "0xcd7868b784a7a6db12dd4f1c95f1e88bd6b986fc",
  "0x790dc2b78efbe91453c2e46d98662b2ec9aa48f0",
  "0xe62721e908b7cbd4f92a014d5ccf07adbf71933b",
  "0xca8ab9c66b8203a1ae6e6722745947786c1d8141",
  "0xb6217be0f1fcc4408cd33b68489d9c7817d81ecd",
  "0x3a60035cc5dcef0ed83da74827755bfafc8c10a8",
  "0x127c5a508b24eb7c198a4e89cf27ca2cf0315811",
  "0xc7722a05ada594b71e63b96b6268c4fd57d3d489",
  "0x6610e4611966c1454020875df69181eab03ae564",
  "0xb4c5ab51422404e52863a8bd594efe0ee4984818",
  "0x7e39da354b7880a8ba1777fc767b5e510472e2ad",
  "0x18327245022ed9db82b88de4a3a7129779a3c27c",
  "0x9ad2bce03c45e1463a4f76864436a3048086546e",
  "0x67c2a1c2b6a27be8f0e03810a0a7fcd98b097ae6",
  "0xd26d73d166e6a8c6e6f09e6bf28ff6ea24d15b1f",
  "0x7c875c2765125e9d1dd14cefdcf1790c2c68897b",
  "0x4db4c33b3571c5402774790eff5ca7763b6b792e",
  "0x14e8af8f64f5fd053db469ee7a15a4f98dad9ad5",
  "0xcf9d75350579e152787791d9449128c461c2ce95",
  "0x737d4b3f52cd0a341966d43d7924b427fef93f2c",
  "0x580c94f13317ba56d2bb2a0b4a9e118233499247",
  "0x2ed6c6c921eb1931a44a95f11404ddc2d24b0f27",
  "0xe7404e8c8c5607aea3ddfc6820c143bd21e750a1",
  "0x1b9b40975d6d64852d6de3a5b0cf795cc9e03f8d",
  "0x198470f81ef5cf37da68eb9b3cc2cd2ed5514869",
  "0x1e4592b53650e7a7e850c66ad7bb599cbe280bab",
  "0xa5eb4201b9bea6af5eb9c53cae4b9c3985c1b035",
  "0x23280d961a9e0f1e2e173d36d8695800fe58e0ba",
  "0x76dfb8072ffc9e79ecb6dcc01190d09864523079",
  "0x968ffad49bc7a30b785b49822152db52bc05bfbf",
  "0x9c2323b8a57da0bd3cbe325c7f4db05cbb896dbd",
  "0x3870b06837f7a0a49897347e5a62d7412db0fa28",
  "0x41bb7e07633303a66ddcb02a4f7e08264239062f",
  "0x20353723dc30abb40a8012bd173b6d01bf2d40d6",
  "0x8915cf710645794dad5eaee96b3e56675bf62651",
  "0x86324371bdda1fa4d71a60f615bd2d07a8f9a725",
  "0xc6fe1dd2a94379af454b6f966dce066b49bc5a3a",
  "0x2ae81f6141e02833b9e88b2eae4e265705634019",
  "0x98e241bd3be918e0d927af81b430be00d86b04f9",
  "0x76201de145eb4a8d0eb5815eda2acf82c511fa33",
  "0xb7fec949d0ed364092f4fe11ebde8e7da13cef29",
  "0x77a04ddb61bcdae88ae934bb2106116486f55cf7",
  "0xade79cc9b86b08ed0e6f498a0a9c2451fff7a40f",
  "0x988deeff18a67bcb111ccef81cedaa7ec83e2fd2",
  "0x908ba3f601220299ccd113b3511f82fee6032c01",
  "0x72a7b3960100ec37b725649d80df37fe273af028",
  "0xeb029304318426c37e2a8ea25af527a2e69c385d",
  "0xb9d3697bb207db2c8ab98884501231e62e21632c",
  "0x9b8e207f746bc5262618483caa7ec1ed99201476",
  "0x29234d86f9003fec7fc4d0643823c8d9d47ac943",
  "0xa1acaddd259649d470b42c95738e5e89c8d8a233",
  "0x5a3d90528ef860c445cd61fcc4f439149b76c0ce",
  "0xd2d4836ce7177c3098ad035556f2287def16d8f3",
  "0xec91a4d1c50e42b99ca94097e9c4668ec2b256f1",
  "0x6862c7bc19667c7b0c919080196beffd7367ddf0",
  "0xc591a9072eda0d2db2979af6f365d46180b2f6ed",
  "0xdcdb02fb3fe25bb28e86ccd1af17e14567fb8131",
  "0x45ebad8de2b2cf538d6842977326b942434d513f",
  "0xf81cca33e31e1e6365f71632171e4d2b125ede2a",
  "0x22f9f04aed1b2045f9183a3db0592ec6506d2020",
  "0x9fc2019edb6b6f52d7a5e17c96f90de437e57214",
  "0x1bdf46142f95784b5009bb9a559bccd7297ab9f9",
  "0xa12a607637c4e35ecb9c69f455e93e8e874bd74e",
  "0xe72817700907ab116bd8c1d37dd3b9a40c1c96f7",
  "0xc3ff43c7250a0343ba9049bbb0c731952f9fd32e",
  "0xe88c4cdc57486f54f2f6749de4737cf733ae45ae",
  "0xe47ed71c208f63d899204ba80294a9057c468df4",
  "0x8b2e3b199dbfbc8868d6983a2d681797f18b18dc",
  "0x801ef5a8579bab7b2d00f2d063763930e931ad56",
  "0xe93cf8983e318bc0c60e0758fd23dcb790e32e19",
  "0xa8e6c99f51e251d90dfa56301df50499fb72a156",
  "0x3a89336fa0abb14088a5812d16e2d69d7e7c455b",
  "0xdbcd11bb04cdd8eeefd0097a418ecd77a659aa95",
  "0x7584a28ed8a5b7c2fe361b3681c76141afdcc4ef",
  "0xc4d7d75c282c47ff073af9f616a916d708ffb34e",
  "0xbc3b137d9cb043ac1bdb718b155818da216b0612",
  "0xc4ad456769c28b193e21afd4bb5839877cdb7d18",
  "0x4e2525b997b630eb980d906a476e4bbfcb837f1f",
  "0x2153b504e24c7be7001dfa8c7e99753d2f76b7d5",
  "0x3ffd359b2d3416847d95a7f59270f1ed69fb3643",
  "0x4073bfdff7fb46b285d5f27ee7c97c7ad16506dc",
  "0x3280283f05a9788109207171a7174d93b4646153",
  "0x47e9c4fb5e89df43b556c0e8132699decf5690cd",
  "0x5e43ea31d5742c83989e2bb0150f7805b5563d6a",
  "0xd06cd78c722d0e71231604defd35b8ecb85682f5",
  "0x6b6b75607a7a5585946c57615b57da4407afe011",
  "0x643dd5714664d710dfc3b7a741ad271c29738b76",
  "0xe47215fdc9de6fabb9965a94f301836f9522b88a",
  "0xf43baa74b8f9047ba06cd357ff2c78d39f97a296",
  "0xd9a3c92a50f0f2e7545e4bd71c6b8172ba43c821",
  "0x8309167fbe39d9d1ac1319de64116dc888c67914",
  "0xa56da3f2f56a6ab19e60439507b83ec2a0ef9977",
  "0xede3b0f6e1b8948b4d9fdea214be2353f49ae474",
  "0x7e282aa1f6398ec47e445e9172c6d19f5e45f4fd",
  "0xc21ded1533a23108b070ce19f612d26dd96e23ae",
  "0x03dd789c22ad82fc9acc0b86ed08e0bfe0697313",
  "0x6f89130aadf2df351e1fadeb825e95769a3c1dac",
  "0xbb20d7fb3cf15f5db693cb23f3eac76f74e0e1ff",
  "0x39506f1ac3cdbb51cb4212d408d06d0ef2e8f93b",
  "0x0fba6f55ae77aefef51d94a2855a32c3036a5a40",
  "0x6b7a803bb85c7d1f67470c50358d11902d3169e0",
  "0x9cd54c9e3b11df9d9aa8b85223c44f7b14fd2201",
  "0x5939c08b04777559887ebc7c2c12dcdbb2db31e4",
  "0xafe1d384878af680dfe28164147399a96b4c2c37",
  "0xac77a490f5ed4e226b311c4745f6df6ffa277a99",
  "0xf1079a89e0bdbc1229c5e2c1e6721441b698d1f6",
  "0x7eb163e6d0562d8534ab198551b7bf8815371152",
  "0x3b052f0a3cfe703b63ac6fe688bbf16a67ecf738",
  "0x9896e0de6df819a8db7e2c3eb6454d435c487fba",
  "0x304e15aecbf27b4ab54014a1febcc922e66c9ffc",
  "0x84ddc9accd3dd04915b89b31072c7e588a97844b",
  "0x6224fdc568cb0982fbbdea66bb69d34159112cbd",
  "0x0ddda302c55fb33d14cd1dfba4eaacb92e6f9e03",
  "0x52272a4fb4e1e8646a41337a39c92e5cf3b8a578",
  "0xbd794fd10532b3d84b12018af8eeb351aa17711d",
  "0x447d8435ce1572c8b7c213f3622e9d5dc6456656",
  "0x3a425ec017f723028d8c1234f028c7fb14eea402",
  "0xb0dde7d1d326628148b708cfe6314e7d290790a1",
  "0xa2e8714f04e7b05209aa6db025c2026e829399a2",
  "0xad1babc32846660a14cc0e8f827eeb19f15cd7d4",
  "0x80ab20d6aced0dff7a52578a14ef503a235dea09",
  "0x30c70acd18e5203379eefe17d92ab60abb241443",
  "0x22a81f0499b42206884b9206d586d8eb1ac22d2a",
  "0xca37830aee0b59249b3c6583ed0522603d00f3ef",
  "0x0e66887191139a70edfcf34f5a22445a6470b6f6",
  "0xe1b843a85211aa037dc959232246b03e7f44aed4",
  "0x9a80db8298eda731a763d9e4cda2dd32b8f21d04",
  "0x99f4536cae3625054ac1dd8fe990cc7e1e55b76d",
  "0x1e85d99e182557960e2b86bb53ca417007eed16a",
  "0xd58bb0803f6add91ba146f8468d90e5740e8b625",
  "0x7fb9d9b4d85305878c8262bac93b325c5a565870",
  "0xcbdf6d5a2c191e793502680e835048d10a583598",
  "0x5fc8baf7724018a857164b167725cbda7ffb15da",
  "0x261afb1a86b5f7d47f0507fff26f4e5d0766f53f",
  "0x2c67b6108eaa28b64ea35df63eb18ce4614e098e",
  "0xac0c96c50bb4080bcb920a7c84dc23f0decddbd6",
  "0x395d2c9a76658d2566682f0f32e7711ecefee005",
  "0x498e090545aede10ce9cde90040f7f0bc401a9ef",
  "0x82e679f570250058077fd0f8b16bdc9991bb2625",
  "0xdd83eaa1a66369ab09b2642a1a130287c4ad8e40",
  "0xa2b7af6a969d354b9ce7f4f24099b55b4de75b3e",
  "0x0d02ad8b6b2b293fbb6019eb0632e2d9e7262581",
  "0x54fe512251a6b2fceb582455c69ee6a3e3961e64",
  "0xdfe2aedfcff1ad02b2f3748a84970f1b34cc3487",
  "0x9fc995ba59c0a74d38400a268f507ea189c29bee",
  "0x347a421071ae514a4072528a1518f22821ad4b8a",
  "0x7b4a19605cf074b0d4eff6ab87582c2dd1654cc9",
  "0x2b1dbbfd631f34270235e79d605a7db6860e68ce",
  "0x8432ffcc3b670020ba80d5be5f7ef4eef8f83234",
  "0xd8d4a214659ba8db1a5aa8a082ae20effb60321c",
  "0x5fee8d0b6fd0b9073a03137db1dd025c03aaf52a",
  "0x55f6dc97d739f52d66c7332c2f93016a4c9d852d",
  "0xbb3f76d9de40ed3bfcf4a1ee1c4b65250ac4aa53",
  "0x815862b59f243b47c6a958b608979d2bf07164a4",
  "0xd4c93418063ffe08c4a0bfcb91c6e439bbd08e09",
  "0x0e13fedf04712185432fd66402f0d2f8ab3e1a9f",
  "0x046cde42affac795ac0fe892750f0d956dd033f7",
  "0x4c76475a57961d26c549c89847d5dfd5f8e12084",
  "0x4bb129e1c30f8a85dfc3ef596f23fd5631246200",
  "0x527fd282c3cf32a4b64341925e686ad07b0eb4c8",
  "0xcc418b1a8fd0a2dcc8c8680ab53f878021e3e97a",
  "0xbe4753c5a30ba343a3d4c43079f8532cc48c2265",
  "0xeb7b89b0a5a1fe000c684f5be34ae78672043bda",
  "0x65ce7620c5d1169418ee2c8e39291f1f2dc60d99",
  "0x3e0bfddacdc2de361b6cd2dcad746f744ef5a6ba",
  "0x4b08b1914598778df35ee16d87dcff4ef8cc09e4",
  "0xa87bab9bb7b23b0640b8bd90e366c80cfba21ebb",
  "0xcc77c691ee27102e1d90df32e400ccf9f0c643f6",
  "0x91fe6cbafe363e38bdc8c2171ef5f21d1776f837",
  "0xcb79f124259da8e60883e3da5cc8ab73c202ac66",
  "0x5eee8c6508204590f4eeeb7b940db271572c8733",
  "0xf0337f0a42bf9796da016ed0fc119a302762e943",
  "0xf7659ad41f4418d7459846b06a4f5f038f8a0460",
  "0xf4fc9decadfac313c2669f8927801870d0b7ea4b",
  "0xb38a6184069cf136ee9d145c6acf564dd10fd195",
  "0x2981f3927c93ac67329b0bf5160a7a8bed14bea5",
  "0x36d70a0387aaacf3eb03667382af89e5334e1789",
  "0x9b6a1051286a1cb79cc951b3d6a045c342d0a2a9",
  "0xe9c1735b679fb0c2181f4eb5c2aca0a438084498",
  "0x655aa063ec68b18b9a7554a8084827fbc48917a2",
  "0x23db408d6a20ab4938118bccab6f694ec63ee001",
  "0xb0ca0469cc2eb1bd07e88a53bededbe0a6ed6a2e",
  "0xf3eb92e219d2629a1fd28af0df418de0cb859c66",
  "0x5178df0d2612da16e2b28baaca307d3177edfc60",
  "0xbad5c7fc22a5d755b9f18d9a45fb97e8a2d87569",
  "0xe60461918aa015ab244141545f56851ed10ffffb",
  "0x5c3306c73723b125ce210a8e9cd7be2a6e53e2c0",
  "0x37e1e4b215c2a1d026444899b90f0bf29ef12576",
  "0x03265d9aee65642c7c4e3790d680c3e469fe10c1",
  "0x1c634804ba4f83a66134cd92961066f7adc6b928",
  "0x56919a1f97188c732fce8f17b0114d3fd2600f35",
  "0x3bdf0f43f47ed7e0c2a57f1b21a862463612f46f",
  "0x6d621b4d888f09984bda48d6606474b4e985b500",
  "0xac88daeec4c986edd08e1792a58a5af2f46d0292",
  "0x49f37709ec3f43821fe9b73ecae23c954dc10284",
  "0x006668ea999f1477f257b64baaf0bb51a6e4cef3",
  "0x9020e26fd2c0d1978f44e4041df820bdbd7b6b47",
  "0x8018e5ce93fcceff7002c1d9b9b5f2a18f7a0002",
  "0xd88bc1091ad286d2d415280f571af753bd7247af",
  "0x9190281d94f2876c425680839fad3965e4de016c",
  "0xe4c2592d7095c54f9154143cc5778ab8bfd66f9e",
  "0x897faf9c43bdc4e8022f7d4e5bd457b38a964c99",
  "0xa2973e5ef30c1d8fafeff4d53b494ebb2a697f07",
  "0xd9232afd05bda842e7a79eb4c85f4c8b46939e49",
  "0xee831e11608d294c7cea1ce92842ea48c1f4f3d5",
  "0xe2dc6d9addae907a57bee67459a3c31876891ec7",
  "0x78f6c2458b53d0735208992c693bb2b2dafebb52",
  "0x3bb50717ba5491a35bbe902c86f16d77b85f3ee9",
  "0x025240adb2807492533b854de7764e85223c43e6",
  "0x0dd103cc94de87d19d4a11300f753cb327753d97",
  "0x10b30298cb9b393061a8b53f157054d64b8e0fd2",
  "0x899c107479cd8c5a897e7564de733b1dbab773c1",
  "0x567b3e6e49814300f80dfd22ca18cb972b43edd5",
  "0x980fe2dc5279701b603556c9245ebe3f41909ba9",
  "0x0886fbaad42a5b5bd847dde23497d928432a932f",
  "0x5aa1321eaf863cd701d3b0058316beb1b30b1406",
  "0x9fed9eb16c70b484dfd5b54e89e825800d621d7b",
  "0xc9cce1ae1a4d665debe5f819103bf53360b97570",
  "0x68a1735754f6a82e41b33b7942dadbc6dc1d569a",
  "0xd34bc82b9092f5334056dac1af8cd5d32abc6802",
  "0x746a95a9ba1521c5f2bc64034279968ea9113c9e",
  "0xb1f1bd5c278e4966912da53319ab4c2e6c6da13a",
  "0x6bcdf4a7818d05321db71545ebc05f5dbe86581e",
  "0x5d8ce0fb09a13835a04ddd0302324f9d49380287",
  "0xaec539a116fa75e8bdcf016d3c146a25bc1af93b",
  "0xa1424a713ea7cc8f8d1b390d894f5f3f2fbc0082",
  "0xeb7d4e71acd204edd3c05c55b420e353f226fd5a",
  "0x6034410659c02c0cef5c6dd3e4e392d6933678b3",
  "0x99123839de46a25c74b2131c99ce42c415c08d38",
  "0xaaa85d882c0aa0d5bc070dadeeb730aed3fe11c1",
  "0xdb82d5d8c7f7331c3a04425ccd9a91c67076db30",
  "0x84ad103b3df212c9ac7bb8612ebb102a7c89d31d",
  "0x46ad736261f37d64bd4a5d15a9f5cae0ce0e07f9",
  "0xdef61bfccf4440aefb4a70e77b7a45e382f5014b",
  "0xd12fffe498d4fda7a4e7b93f7a0fade34533b50f",
  "0x626cd6938c9645a5108100ca48ad4a5f9302079e",
  "0x67808cd3a04a3a06cc847d14e49f3298ffa1e391",
  "0xb72a82070497d543099e2149c06cf1cb9e436b48",
  "0x880cb647cf98a2f63e94244012ed5a3fb742e223",
  "0x8b6af5deafa172f296e8b0fdc2438b715eca88ba",
  "0xc4e42e770a362258fb172c5685b83c5e518587b7",
  "0xfd29989edf1556093ecd1f97284e54fd5cd6c885",
  "0x282b5bd902b356ec61c8d97eaa3c39e2166470bd",
  "0xf11b1e1d2afffde4bdad9131dcfdb7ecfe0f1a66",
  "0x5872b1d08c76497dd8b10c40c77d23815e599982",
  "0xcbe2c2b627d3eb39970d35b8806ed739790c1d0f",
  "0xe007c86a95801adccc6ba78d51255b6c428d26fa",
  "0xafee962e996e79048e55a1906f12b4663e2daaff",
  "0xd11ea24e640650727040c34a71cc89e4f8ed1c8c",
  "0xf091ef1d92595ddfc62438d31f7a6c6d23fca5c9",
  "0xb9068dd4152213940877d1c8bd5ff71356473a99",
  "0xf970d3b78adf0cdfd63d9dca2c4dbeca7554c695",
  "0x5f9819d38b7db58abf2472337bf76cb5b4bc5f5e",
  "0xf79b84ba047a3d754f3f7b01d29c91bec30a0020",
  "0x3125506cdcedea6bc231cc3a5158c61e2a09a6d1",
  "0xd6e821914c494ef28a88ada67fe982f98e420e3b",
  "0x3658bb1d80e4990e286e7eb4bca2c699f82f4d30",
  "0xad09b9102e96d823fd433a71a758bb78d352c8ce",
  "0x81ff9361a6b27954ef8d93afff5e333100ad5ce6",
  "0x8a44bb4fadc335febda28c73606e6270f8982fb9",
  "0xa6be2c4f9d32217413ea99b56819addab4765cdc",
  "0xc0ffa6361fbddbe751314fe9defeead3a668083b",
  "0xbed4f3e92e06b0e0efcc5ae6bdc14ef9bf97f8a4",
  "0x5f878156b2e982230a2c4c24615ab7169b775dd8",
  "0xed81e0df88419b853b015e3499cd13c7a14ff45c",
  "0x7765d6b62bb9e471ab125a2e1b247417308b1bab",
  "0x45aad5194ec51cba7ef231e345e2493789ae25bd",
  "0x8273479049c1beccd3e827c597a9668afe9db682",
  "0xecfa4334a731872f9c06f977bb1a4fa27dd04e76",
  "0x031010be201eca7cb5c4a6726b8a6a2d1895b26f",
  "0x9799f4c900642889f50a9256fcd351efcbf3b925",
  "0x55fcd7912cd8fc7ee3db9bb86c6b2a03738044fc",
  "0x9221cf5a464f3191240c4c88886275d97a45c711",
  "0xb88ba56cb2c282da41014a1e23b02da977e07b23",
  "0x8080f2e2f0c318484f16fcc4f672d2d123e4c7fc",
  "0x49fe0651abc53286e8b691165aeb42c1db2c5745",
  "0x21e5731bfa87bd7f8a6abc63504f8000c0ced992",
  "0x6ac4526fec3e4aa6b5758785e3ed6dff9dbd97f7",
  "0x70044a9522e62a51818957c61740e6e3de473a22",
  "0xd1a5d6b23e15e010a19f8a6e39fad78ab255bb9b",
  "0x822d0a914b4e38e49eab17d52912861463cff79c",
  "0x41d4882934ee4ca33cd675d9cf46b905a0588337",
  "0x7159c28faf17d0b447941550d81371b1b8f49ab2",
  "0x17dcdd137d155892f5fab670aedb8d14e31b79fc",
  "0xd104a179aba72984d967f49b7496fc6c3fe5789b",
  "0x1832f197c539142dec542b58c9da3f780bafe6e0",
  "0x7630f07eca45dffdddb138b630239a1361034d74",
  "0x89550d91d8bf8e08e87e6145dae309fa7b9fd61e",
  "0xb98fe52b9d7be52270ff6fb21d04ca2f160e56bd",
  "0x8ad07eca3c8d29166ad6db406e398087ab94893b",
  "0x63eaf190c611c0d24342aeba591dc717ed659539",
  "0x3eadb55cb2b7c30c6f966a33139b338a3affbdb0",
  "0x5bbd46106c35ada425857263844b792aeb708510",
  "0x754d07cc1bbc9e3e4240a60532c18c731347cbbf",
  "0x7521975154ad046a887ebf3066df2911ec75392f",
  "0x10f30e05a877e48503387391075dd693836d9701",
  "0xf4f44cbad3ec20f2f9a66dafd58058470b576f4f",
  "0xf2337d25604386598178d701fd1596b7cfd0e3f3",
  "0x77e99d7f63801dc088548b3635a6f080caba4fe7",
  "0x15ab8ae376e18f93fa773cab77f50ac886c62346",
  "0xcd3fca03b1c91e8b71f21c405646856b49d5e015",
  "0x3685798f1f52a93c8c971f7d4d611f1be87f459a",
  "0xa98ed62a5c1c9736f25d00c867311e4ea88949dc",
  "0x473477a15413a681d3a041afffdffee56734103a",
  "0x0bd68142afed52a77243bb4e5e1ac4f8f518a9a8",
  "0x4eb19ea75de0dfd109f17d9a0c3b9f8ec671403f",
  "0x5b37605ff7e145e44e462d7602082d81da819663",
  "0x633b0018a3f72e04674614e801075534382bc0b1",
  "0xada6d126e8e4819148be6c9680018242aab179a0",
  "0x32bf3e354a1707cab2f1aa31df5a83ae9b1d907e",
  "0x2e9d4e001fd48eb5d4210b98249cca7209cd6290",
  "0x168f7339be5cb41b2a2ed4b80f6a4bfdc77e93ca",
  "0x0d3153ee663b15755b5484b910de3967c6c06765",
  "0x42a0a42d46a621451031d678cf3b2f4a1cecad9b",
  "0x2da3a69bc85dc4681641dc67a3f17d1aca2bc19d",
  "0x502a49d16dcf4fe9fb7e2ac901cefcef81d97d48",
  "0xddb1b4b0bccfd257beb933952d41db8b1f058711",
  "0x88f8e249f882d5e38abb290eae5983f73c21ca33",
  "0x8fba08f59f810702c2c3a097cc9ce3f9882a66c1",
  "0x6f49e32951521ef8403ebc3ebef6b6c634453327",
  "0xfcc7b5f420610a24f05a0b59ec193da6dff0ab1f",
  "0xfa0230c07d086bee98abc86c14806386db4de612",
  "0xc9735568a1807a273f7f8836b0345520370f2f59",
  "0xa0255bfb02c17def888569a5502b0244908d4738",
  "0xb909bbc72fb7a46812aedbf170cee4781885e5fd",
  "0xf0d612fa114f606d933f34c8483a5be2bf5d32e8",
  "0x9841b03b69cbad2b35a5fb4cea5be6a90287ddb8",
  "0xcbc4802c0c1fa3f366477eeda0cd2682247f5dd1",
  "0x79d4b8f33bc95080d9759f91dd676e6229b3031d",
  "0xba7e6ee95fd0a987f321e1fa7cb308edb2760581",
  "0x52cad96c2337f135fcd8485ef33c95415743641a",
  "0x8ee0b73fc4de8a6f9d230af44f10a3484097c59d",
  "0xc57c270c5e44b9bbc2674cf44b3638a70e810f4d",
  "0x7edd85e46d913b34132a939f38e3156568ffc978",
  "0x9609d822b0a1582eab7a80a08b6d8ca36eb760e8",
  "0xb697c74fcd9f61fcdcbd7a5900e8b11a809daa89",
  "0x5709722ae55c7aa8945fd63400d9ecd0dcddca22",
  "0x1b2e6c79a0b9a1f19234d45d9a8db9ee57bc0b14",
  "0x56a7072504538302c9649a07c1c262f57c3d27e8",
  "0x3e297aab3fd80cf743735c5bbfca99413acb9462",
  "0x922f668e717f9692dee1c33bfc838853b07ca7e3",
  "0xf8e2d1215e8948cca239c6a8e089f640f66f6b24",
  "0xf1ef6884963e2e488c8492cd529cfbc9ef45e8a9",
  "0xb01103fb0f11a478dcb9acdf4f8670a20fb32604",
  "0x60b7fbf95fde47a2991363fec7b4b400157bc930",
  "0xe72c1b0fe3a79c8bf62b359301a0df07cfa1addc",
  "0xd4ca789f73d87aaf87d31b558ec7f1e159849ed6",
  "0x4f192ff1919eb03f7a1a5579666590630a9235c9",
  "0xefe5c7b612dbec75751598dd69321310b76d2486",
  "0x93bd9276f54327c79a93fd7ea619fc9601db8c0e",
  "0x93a655d9cbb94c736e578764c0888034f4f5376d",
  "0xd6238da2d793775f7f9a808079b6b92228acd4b5",
  "0x4be7fa3a44f8e8d9c4a30fc35e163c6ed50a1a66",
  "0x9777db832e73fb63e6f37bcf1a9ebf09b8b57f03",
  "0xedb440fd648eba2dec349809936a1ae759dfa877",
  "0xb85065e079a5541edbe425f54d9f982be1c5fb7f",
  "0x7b646165a87e891d1faae5efbb1ecf29a59ed2aa",
  "0x65a78e978c73b1153c516aaad5e77ed0d9827a8d",
  "0xa9364084f75af39c58569057f9381f8e16badad7",
  "0xb2812370f17465ae096ced55679428786734a678",
  "0xbb2053bf4326432e038fcf1d927922192ee5c22c",
  "0x6a7d995800c2d0e86c1433ed2214f93c2d457817",
  "0xce76bc8812f40d35dc89bb232c06d67e805cfb3b",
  "0xce8bb4e05bb0ad1138e92cd57a05b18e1c7eadcd",
  "0x19f0789834e300dfc2b4ffc971132e9e1e30e8f2",
  "0x8cfaee61fcaab73fdbae2ecc01066ad2e8986ebf",
  "0x43ceda18f8b0b983b24b17abdfbd526473426dcd",
  "0xb730af9d17ab3de0415716f03ee635198085c047",
  "0x73466ebcf08775daeec477cbbff91fe365e4a8a9",
  "0xdf4b25d605d7d622cd9d559baf355f4f18398e4e",
  "0x3bbe60e2443289d9a4cf82371d195f619e7a8f24",
  "0x85c87fb7e1d173c610502921e43377e74927c10c",
  "0x1584c6be371cf6b05f679b8ec2eeb09dfbf78e91",
  "0x7a39c251eb6ab0008ab7eb0d922f4e637fec6753",
  "0x1b74c63dcd8161c672e0835377159066c7db5458",
  "0x503660a1ca6726c64b319c753f1e2257bb79fd20",
  "0x9e53805da735c6b6bb401fdb78cc005f3e766d35",
  "0x477abbead96bcab67d44db51862140f16f42e710",
  "0x964f9a45fa2efaa072b8ff187d2aaebeb0a7b4d2",
  "0x3d17e013eaeca17aa4032da72fb0fd0ebb44dd9a",
  "0x6e3e5c6eb156053d0e1b1444f8c8b5b2d9595fe6",
  "0x3e50cda860cc9ff9444bb05a5bad62d5eec220fa",
  "0x404bb9e0a43eaa4d2346ac957b0c31b892dbeeda",
  "0x4b6a527ff48fdcf3846ba2d48c9f202142ea1415",
  "0xcbf00daf965e356ba5156783f7a649a53c1482ac",
  "0x33216ec83b87e941e68ca71d5de159d578706e5b",
  "0xb39ee33b9c93d58285178b5a1e237a1151ea188a",
  "0x9bd419cabe79b2c10d4ea15c8fe41922b43f8aa8",
  "0xd0d02a5c9a3d5892893e1ef6ff15d1a8c8006705",
  "0x7ea6595836902745b20d2c27ab368caddeeb8406",
  "0x3a5f8ebf741ac25b540905e62c7edcf399a7fb48",
  "0xaab5919d4715e8e3efc6aa6c4f171d25ba50fcc7",
  "0x12797d5934d9da3e1467c985734ea6ee51519617",
  "0x76ed54432c22529c77eb5c994ca9062a34396dfb",
  "0x2da5bd284042ec6f93028852bcffefa715fcafee",
  "0x0fe11130b1819e2e3e5e5308b9ea16ffda2032a6",
  "0x71b002685ca2366e07b6cc0022f94a59384db80c",
  "0x885cfdd68d3d97740db2f88efff12a8bf7d58c36",
  "0x641df72a9ea6321c5634a4484387fedb617a6405",
  "0x5eee7cec0f41e143c8f4f4ee4b80ca2d3b4d3272",
  "0x92e134e13512121aa5510113c1069b2b6f915bc6",
  "0x6ced104c505943815c63eb1390c20a0f11ce16ec",
  "0xa073ff6e697d7324b597626f6e77d728a8d9259a",
  "0xfa07e0d3667cfce84f4482bea525d00a2de7aa37",
  "0x00dbc69223b960a46d9bb523c75dce00d2224ebe",
  "0xbf31208466f166d6bd3295fc41f278599e800a1a",
  "0xd4b317fc585674a69315092d1e395b284de86759",
  "0x576f3283552988d1977852d6e1568e75278beca5",
  "0xa23dc35e15600800f41047bd50ffbca405b132b4",
  "0xa316b21f51d011c6a5cdfb76f7113b5dd5d90cff",
  "0x121fdd9937b25e0b64f4b392d4d58de29f6f54d9",
  "0x28b2bdedb47a966d3fc267831350be890d1a9e26",
  "0x21c3c26e466ea149d0d8c3a44e391ac6b5f7b306",
  "0x829c18d4f51191fb0f1b05c5d0e7fd07dec7455d",
  "0xdf0cfda3122215e4adecc56971a7bafa15b63e7d",
  "0xa9af5d893afb7eb69dbffe2a78b4d46be7c87000",
  "0xcf57f1519716aedcc802647b743235a0cdd44484",
  "0x9dee532ffd8115914e0a1382f33e8c97f7676d11",
  "0xaeae4c30c8b76d45a981fbaabce8407aa87e43a4",
  "0x39c1c52fe713cc6d14a943cf262bc2db8480bc12",
  "0x157005798cc5852a865081df039167c0265cbd01",
  "0x0e31c4a3769ea44087f72bf4e7029bd23185b723",
  "0x207fcdacf259ab1ef02c0807ea96f65443da1f60",
  "0x39bf2d0877bae3d2f2956da6643b6cacd3a6ed03",
  "0x62021ba553b09eb18d38b97345ee08ad98ae3c58",
  "0xea170221d5c3da5c29b032cd56ea03871d764c5c",
  "0x2c8f6a3ca5e867f20f27d29bf11862278ebdb704",
  "0xe1f251dfce460c9dc5e12b9da3c90f33f60f32d9",
  "0x2e9c565f4510bb84442d6b73fe38990bd3c2baaa",
  "0xba4f825341f5783a1320dfd3213f653f2bfab880",
  "0x683f8ef45f964b56cd22fa8cdbd2d12e62b522ae",
  "0x3d0f798c3b4ac8cb1b571709dfc0c261f16a0e82",
  "0xbe3784e99faa41a57ec7433da8f39c15ade7e947",
  "0x4f661f9c0772d27fea8180a7fb72ed66ec2843e7",
  "0x80955f1768fb44c729405ca6300b9ec145e9c834",
  "0x9f26ea95afec3f90324f2709e8141d80126b5424",
  "0x2c9924910b91e4be109f22879a13b8bfd4597cb1",
  "0x29968ed97842f8facbfdccfdb98bc34e6f53dbce",
  "0x554899d70454b0d16475124faff2b1d4e049e8f5",
  "0xf0b2908c638bc18f018933928d079f930a3c976d",
  "0x9ce0ff40851b76a195d3b1c8d86315c64bb1f9a3",
  "0xe84739113d1dab0ead0b4d58ad4df624f5edb176",
  "0x60b0f34c4d8e024a1928645ff8b861ecdca05fbc",
  "0x0ab37b0e9a9b86e108086039ee4af30a20dff0fb",
  "0x1a0b7c7576ad4adb1ac67c7f8248c51e219f9369",
  "0xdb70f9b835e109539c37c6d3d17efd9831bbcf66",
  "0xc9c634fbf2d40244fce970b5a1d1d3f087e5a2d3",
  "0x98941901ced735d1f94bb83ef2c8d1f4e692a127",
  "0x3cd3cd4f5aa2ad21761c96a5bb364e5fc94f9493",
  "0x91aade1006208a238162300bd69a62e3847b3885",
  "0x1e239ef94b2998dfcf22116910bdfd56aa6b0c58",
  "0x581771088bd69ac680d2e645a869e0a861685fd0",
  "0x86dda827bea57aafae167958b81e840fa57880a9",
  "0x3e2dd6c934273183571c5df21797d147f8075b0c",
  "0x62536beab62fbc342b7a494ad9911a16332e38df",
  "0x04935b86668dd28749c18a4e7c59d10a567da092",
  "0x7d47bdba3894b2a1292be21a01aa9f576560c7ca",
  "0x72aa2bb1e096f30dce46462106d7f7cd247a1ba1",
  "0x6e6b31cd8f3391e245c6f0237b448aca7215ca6b",
  "0x6c1bd31f89bb6b5e1a0d3e2b910ceac18f3014e3",
  "0x5e15bad3ce33ae199928f5848d7af9c3ecbf2e70",
  "0x81d58e18448474671745abb11a33adf4c22ad5da",
  "0x729f32743779bf252a2f51cf452972f16d283e43",
  "0xf36dd64eeef2f4d4a04ce892818fa011816fb91f",
  "0x632ccd1e82b97ea3cb16126b8c43881fa0cdd8d9",
  "0x1c3918f2df5ca686b17f6a19fdd09afde728706a",
  "0x9223bef40dfd906c467424dc0b951b26320d7d39",
  "0xfdd51096c33cfc675337d45770ec08b00ee7afa9",
  "0x4d09d01745062a01e87a04ebf2bfd4e97725ddd4",
  "0xf9313e1744820734e0d5ebd6a9ffe64834880d7b",
  "0x902e7aec9b7cc1fd44cd034223ad9ad65b1bb9b8",
  "0x9d8b09aac4e2ae73e30b38df179dc5824c55bdab",
  "0x89b9ae640fc21285dd0750f0e964e3e5c9b7b943",
  "0x2d221341dcc526f0665608a62dab63bca553886d",
  "0x9e74d656a99f459351eb756952ac21439262709b",
  "0xdf8e4b2a40301f3599f112f7630b2bc1321e955b",
  "0x894733b02ae0ea2735126bc65a5d40965bae0939",
  "0x273a9c509381ab946cb278029a83291eee000ab1",
  "0xe3b4dd8fbf5e3ad008e0e6453c37fb00592979dd",
  "0xfb98c01b757d6f427cf28f6ed5ac0027d831764f",
  "0x79e376c000645b2250507dd3d9d4f790db9303fa",
  "0x80e0b795ffe96bd8c04202d4098c1c6e4783414e",
  "0x5263caf28b83f59647ba996981ac4b5273ba4dff",
  "0x526c08c64490ab1473dd6f690b578f152dc26d8c",
  "0x97b806b25761775aad189985349f2c46fd7909dc",
  "0x21abbb66bd936c9af45ef6c3701668b0d204a01d",
  "0x33da1122b2d53cce1594a4a01eda81c3f1903267",
  "0xf3309d9f33b16535689f5eca3f6611010d9a5719",
  "0x440618abfa11fba00c65515a6e6430664e6fab67",
  "0x4fae21c8bda1bb4d42eb0b833f993ed138ee7cce",
  "0x9dfe5a8ef7b8796508f2d53c960e7bf37d2a312f",
  "0xf2c4bc9c1eece453810ab52bea2b1408440be054",
  "0x784a2cb27d2c8a5178cd9bf28b81a8f93d6bfca1",
  "0xfee51fd4b58abdafd28433d6cf70b85463e2945c",
  "0xe32e455e65280129dde53ecc5be8c4fa283d998f",
  "0x6bc65848bfa839005c65d4d49989fcca9925f4ce",
  "0x87bc3126c02b3f32d301e07b97076593c0373872",
  "0x02c9ef79676c17aece6a75a7fcdec5a2aa446630",
  "0xdcaa7d59a1fac11b3f8d2c719482d08c3e24600c",
  "0x6239c54f21def2651b929f891766409c281e2079",
  "0xa405191bc609f4f5da2f95538aa74e46684eb217",
  "0xbf8f127fa767ee3fa3050f6e02e682c6b2b45ba9",
  "0x9d73f63bf89f2d85c09e81472a376b6519f32483",
  "0x3c7275c3642276d4e17ec373e793fb382329455f",
  "0x2b3660602c7bed0e741b597bea84fe1706a4e1e8",
  "0x0b567ef79dca32df0db6a370e204a577f8dc14fa",
  "0x0166e394c5d12205464c2c6b3073abb04ebdfd3f",
  "0xbec4d9760b6071b096d552a6406919ec7c09560a",
  "0x9043eef5b6be9a5cee743f0a22d04ce1fb12bfc8",
  "0xa94b55a15120e329f8c59e2cbd6f085709dc4a4f",
  "0x943dd7f636594ec20501ea43951ecdea53f45f15",
  "0x81f174760bccf8ffd01bfb23e059e65effbcd653",
  "0x60da296178ef1ec1d3a10ef39b1a28db8a250206",
  "0x95f09cd9c36640f48298dc00034cf31221f06f8b",
  "0x90b69949f0a7ad74fe157042fdc11b899d55702a",
];

interface MarketData {
  address: string;
  exchangeRate: BigNumber;
  symbol: string;
  underlying: string;
}

interface AccountDebtData {
  account: string;
  debt: BigNumber;
}

interface MarketDebtData {
  market: MarketData;
  debts: AccountDebtData[];
  totalDebt: BigNumber;
  totalDebtInVTokens: BigNumber;
}

interface AccountSnapshotUsd {
  account: string;
  supplyUsd: BigNumber;
  borrowsUsd: BigNumber;
}

const getAccountSnapshots = async (accounts: ReadonlyArray<string>): Promise<AccountSnapshotUsd[]> => {
  const [, multicallResult] = await multicall.callStatic.aggregate(
    accounts.map(account => [
      accountLens.address,
      accountLens.interface.encodeFunctionData("getSupplyAndBorrowsUsd", [COMPTROLLER, account]),
    ]),
  );
  const snapshots: AccountSnapshotUsd[] = multicallResult.map(
    (r: Result, i: number): AccountSnapshotUsd => ({
      account: accounts[i],
      supplyUsd: accountLens.interface.decodeFunctionResult("getSupplyAndBorrowsUsd", r).supplyUsd,
      borrowsUsd: accountLens.interface.decodeFunctionResult("getSupplyAndBorrowsUsd", r).borrowsUsd,
    }),
  );
  return snapshots;
};

const getMarketsData = async () => {
  const marketAddresses = await comptroller.getAllMarkets();
  const markets: MarketData[] = [];
  for (const address of marketAddresses) {
    const vToken = new ethers.Contract(address, VTOKEN_ABI, ethers.provider);
    const exchangeRate = await vToken.callStatic.exchangeRateCurrent();
    const symbol = await vToken.symbol();
    const underlying = address == VBNB ? ethers.constants.AddressZero : await vToken.underlying();
    markets.push({ address, exchangeRate, symbol, underlying });
  }
  return markets;
};

const getMarketDebts = async (market: MarketData, accounts: ReadonlyArray<string>) => {
  const [signer] = await ethers.getSigners();
  const vToken = new ethers.Contract(market.address, VTOKEN_ABI, ethers.provider);
  vToken.connect(signer).accrueInterest();

  const [, multicallResult] = await multicall.callStatic.aggregate(
    accounts.map(account => [market.address, vToken.interface.encodeFunctionData("borrowBalanceStored", [account])]),
  );
  const debts: AccountDebtData[] = multicallResult
    .map(
      (r: string, i: number): AccountDebtData => ({
        account: accounts[i],
        debt: vToken.interface.decodeFunctionResult("borrowBalanceStored", r)[0],
      }),
    )
    .filter((acc: AccountDebtData) => acc.debt.gt(0));
  return debts;
};

const getVAIDebts = async (accounts: ReadonlyArray<string>) => {
  const [signer] = await ethers.getSigners();
  vaiController.connect(signer).accrueVAIInterest();
  const [, multicallResult] = await multicall.callStatic.aggregate(
    accounts.map(account => [
      vaiController.address,
      vaiController.interface.encodeFunctionData("getVAIRepayAmount", [account]),
    ]),
  );
  const debts: AccountDebtData[] = multicallResult
    .map(
      (r: string, i: number): AccountDebtData => ({
        account: accounts[i],
        debt: vaiController.interface.decodeFunctionResult("getVAIRepayAmount", r)[0],
      }),
    )
    .filter((acc: AccountDebtData) => acc.debt.gt(0));
  return debts;
};

const formatDebts = (marketDebtData: MarketDebtData[]) => {
  return Object.fromEntries(
    marketDebtData.map(({ market, debts }: MarketDebtData): [string, Record<string, string>] => {
      const accountDebts = Object.fromEntries(debts.map(({ account, debt }) => [account, debt.toString()]));
      return [market.symbol, accountDebts];
    }),
  );
};

const toVTokens = (underlyingAmount: BigNumber, exchangeRate: BigNumber) => {
  return underlyingAmount.mul(parseUnits("1", 18)).div(exchangeRate);
};

const balanceOf = async (token: string, account: string) => {
  if (token === ethers.constants.AddressZero) {
    return ethers.provider.getBalance(account);
  }
  const erc20 = new ethers.Contract(token, ERC20_ABI, ethers.provider);
  return erc20.balanceOf(account);
};

const computeTreasuryWithdrawals = async (
  marketDebtData: MarketDebtData[],
): Promise<{
  vTokenWithdrawals: Record<string, string>;
  underlyingWithdrawals: Record<string, string>;
  errors: string[];
}> => {
  const vTokenWithdrawals: Record<string, string> = {};
  const underlyingWithdrawals: Record<string, string> = {};
  const errors: string[] = [];
  for (const { market, totalDebt, totalDebtInVTokens } of marketDebtData) {
    const vTokenBalance = await balanceOf(market.address, VTREASURY);
    if (vTokenBalance.gt(totalDebtInVTokens)) {
      const marketLiquidity = await balanceOf(market.underlying, market.address);
      if (marketLiquidity.gt(totalDebt)) {
        vTokenWithdrawals[market.symbol] = totalDebtInVTokens.toString();
        continue;
      } else {
        errors.push(`Insufficient market liquidity to redeem ${market.symbol}`);
      }
    }
    const underlyingBalance = await balanceOf(market.underlying, VTREASURY);
    if (underlyingBalance.gt(totalDebt)) {
      underlyingWithdrawals[market.symbol] = totalDebt.toString();
      continue;
    }
    // We do not try to combine underlying withdrawals and vToken withdrawals
    errors.push(`Insufficient treasury balance to repay ${market.symbol} debt`);
  }
  return { vTokenWithdrawals, underlyingWithdrawals, errors };
};

const sumDebts = (debts: AccountDebtData[]) => {
  return debts.reduce((acc: BigNumber, { debt }: AccountDebtData) => acc.add(debt), BigNumber.from(0));
};

const main = async () => {
  const markets = await getMarketsData();
  /*const accountSnapshots = await getAccountSnapshots(allAccounts);
  const liquidatableAccountSnapshots = accountSnapshots.filter(({ supplyUsd, borrowsUsd }) =>
    borrowsUsd.lte(supplyUsd),
  );*/
  const underwaterAccounts = allAccounts; /*accountSnapshots
    .filter(({ supplyUsd, borrowsUsd }) => borrowsUsd.gt(supplyUsd))
    .map(({ account }) => account); */
  console.log("All accounts count", allAccounts.length);
  console.log("Underwater accounts count", underwaterAccounts.length);
  /*console.log("Excluded the following liquidatable accounts:");
  console.log(
    JSON.stringify(
      liquidatableAccountSnapshots.map(s => ({
        account: s.account,
        supplyUsd: formatUnits(s.supplyUsd, 18),
        borrowsUsd: formatUnits(s.borrowsUsd, 18),
      })),
      null,
      2,
    ),
  );*/
  const unfilteredMarketDebtData = await Promise.all(
    markets.map(async market => {
      const debts = await getMarketDebts(market, underwaterAccounts);
      const totalDebt = sumDebts(debts);
      const totalDebtInVTokens = toVTokens(totalDebt, market.exchangeRate);
      return { market, debts, totalDebt, totalDebtInVTokens };
    }),
  );
  const marketDebtData = unfilteredMarketDebtData.filter(({ totalDebtInVTokens }) => totalDebtInVTokens.gt(0));
  console.log(JSON.stringify(marketDebtData, null, 2));
  console.log(
    "const tokenConfigs = " +
      JSON.stringify(
        Object.fromEntries(markets.map(({ symbol, address, underlying }) => [symbol, { address, underlying }])),
        null,
        2,
      ),
  );
  console.log("const shortfalls = " + JSON.stringify(formatDebts(marketDebtData), null, 2));
  const { vTokenWithdrawals, underlyingWithdrawals, errors } = await computeTreasuryWithdrawals(marketDebtData);
  console.log("const vTokenWithdrawals = " + JSON.stringify(vTokenWithdrawals, null, 2));
  console.log("const underlyingWithdrawals = " + JSON.stringify(underlyingWithdrawals, null, 2));
  for (const error of errors) {
    console.warn(error);
  }

  const vaiDebts = await getVAIDebts(underwaterAccounts);
  const totalVAIDebt = sumDebts(vaiDebts);
  console.log(
    "const vaiDebts = " +
      JSON.stringify(Object.fromEntries(vaiDebts.map(({ account, debt }) => [account, debt.toString()])), null, 2),
  );
  console.log(`const totalVAIDebt = parseUnits("${formatUnits(totalVAIDebt, 18)}", 18);`);
};

// @kkirka: I couldn't make `hardhat run` preserve the --fork parameter: scripts are launched
// in a subprocess, so the configuration and custom params are reset. Thus, this script expects
// to be run in a test environment (i.e. `npx hardhat test --fork bscmainnet ./get-debt-data.ts`)
forking(39144000, () => {
  it("prints the data for the VIP", main);
});
