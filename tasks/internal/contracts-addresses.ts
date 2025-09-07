export function getContractsAddresses(networkName: string) {
  let usdcContractAddress;
  let usdtContractAddress;
  let daiContractAddress;
  let lotteryContractAddress;
  switch (networkName) {
    case 'localhost':
      usdcContractAddress = '0x610178dA211FEF7D417bC0e6FeD39F05609AD788';
      usdtContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
      daiContractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // fake really
      lotteryContractAddress = '0x124dDf9BdD2DdaD012ef1D5bBd77c00F05C610DA';
      break;
    case 'sepolia':
      usdcContractAddress = '0xf3c676992b96410c64dF5889C624DDC5340Af970';
      usdtContractAddress = '0x0E9a21c0bE9d1D5CF3B6A2547159a0F7F4101F61';
      daiContractAddress = '0x24B364722BFb6b9733a68874515072A8976ba4D7';
      lotteryContractAddress = '0xe192651742E7813BFE7E18B5Ed0fDc6bA35407e0';
      break;
    case 'polygonAmoy':
      usdcContractAddress = '0x297a729cf3D7f51f94d014394c7e6913d725167c';
      usdtContractAddress = '0x401AAB48A272F32581a0d60D486C2fc4A62d0CA3';
      daiContractAddress = '0xa885BCfDB70d1141F8BdB166ecCfC94890c13505';
      lotteryContractAddress = '0x83d2faa41786832A9d5D12A36b5b20427a111E51';
      break;
    case 'lineaSepolia':
      usdcContractAddress = '0xcd340fa24585E7D188A7bC88f9948C7c72765706';
      usdtContractAddress = '0x9db7580441300510ff232bB862712be1634EC8ba';
      daiContractAddress = '0x24e37B4Be471f5a25e415e62fA251177E7d45eAC';
      lotteryContractAddress = '0x32B237681de4D9b879477870798AFeb9cd7333cb';
      break;
    case 'optimismSepolia':
      usdcContractAddress = '0x1f96dDC246DA7D779f7dD3ccA8Fb332d2d9C77B6';
      usdtContractAddress = '0x772A690907987cD2D5290dA724C5eFB012D1590B';
      daiContractAddress = '0xb79b2407F45eF27a4De88d406Ca186D87421539e';
      lotteryContractAddress = '0x53563dfAD33E5ef109C11Dbe72c6239Fe667410C';
      break;
    case 'avalancheFuji':
      usdcContractAddress = '0x6901f64fe03A52D6c5529d16642a60475e71DB20';
      usdtContractAddress = '0x993D494C5BD799801A462F548f3d2a198ea7a235';
      daiContractAddress = '0x7C1F1365333d973aDa261f907EA23b679DC78520';
      lotteryContractAddress = '0x28DA0Cd38DaF924B7442A44B343C5991f6EfD2df';
      break;
    case 'baseSepolia':
      usdcContractAddress = '0x6901f64fe03A52D6c5529d16642a60475e71DB20';
      usdtContractAddress = '0x4029e3dd60A46A4116e0A1eBB3C597Fe0499AACa';
      daiContractAddress = '0x0E9a21c0bE9d1D5CF3B6A2547159a0F7F4101F61';
      lotteryContractAddress = '0x4bFb43F8092891751Fc2c6C6d5Ae8C517139829f';
      break;
    case 'arbitrumSepolia':
      usdcContractAddress = '0x1f96dDC246DA7D779f7dD3ccA8Fb332d2d9C77B6';
      usdtContractAddress = '0x4bFb43F8092891751Fc2c6C6d5Ae8C517139829f';
      daiContractAddress = '0x772A690907987cD2D5290dA724C5eFB012D1590B';
      lotteryContractAddress = '0x197195583E04BA353Fc0E99Da63108a46effB39c';
      break;
    default:
      throw new Error('Unknown network');
  }
  return { usdcContractAddress, usdtContractAddress, daiContractAddress, lotteryContractAddress };
}
