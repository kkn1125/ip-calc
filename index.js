const args = process.argv.slice(2);

function getCidr(subnetMaskIp) {
  return subnetMaskIp
    .split(".")
    .reduce(
      (acc, octet) => acc + ((+octet).toString(2).match(/1/g)?.length || 0),
      0
    );
}

function getCidrToIp(cidr) {
  const zero = 32 - cidr;
  const maskOctets = "1".repeat(cidr) + "0".repeat(zero);
  return maskOctets.match(/.{1,8}/g).map((octet) => parseInt(octet, 2));
}

function getIpToBinary(ip) {
  return ip.map((octet) => (+octet).toString(2).padStart(8, "0"));
}

function getIpNetwork(ip, subnetMaskIp) {
  return ip.map((octet, index) => octet & subnetMaskIp[index]);
}

function getIpBroadcast(networkIp, subnetMaskIp) {
  return networkIp.map((octet, index) => octet | (255 - subnetMaskIp[index]));
}

function getNetworkRanges(networkIp, cidr) {
  const ranges = [];
  const blockSize = Math.pow(2, 32 - cidr);
  const networkCount = Math.pow(2, cidr % 8);

  for (let i = 0; i < networkCount; i++) {
    const currentNetwork = [...networkIp];
    const thirdOctet =
      Math.floor(currentNetwork[2] + (i * blockSize) / 256) % 256;
    const fourthOctet = (currentNetwork[3] + i * blockSize) % 256;

    const networkStart = [...currentNetwork];
    networkStart[2] = thirdOctet;
    networkStart[3] = fourthOctet;

    const networkEnd = [...networkStart];
    networkEnd[2] = thirdOctet + Math.floor((blockSize - 1) / 256);
    networkEnd[3] = (fourthOctet + blockSize - 1) % 256;

    const usableStart = [...networkStart];
    usableStart[3] += 1;

    const usableEnd = [...networkEnd];
    usableEnd[3] -= 1;

    ranges.push({
      network: networkStart.join("."),
      broadcast: networkEnd.join("."),
      usableStart: usableStart.join("."),
      usableEnd: usableEnd.join("."),
    });
  }
  return ranges;
}

function calculate([ipAddr, cidrOrSubnetMask]) {
  const ip = ipAddr.split(".");
  let cidr, subnetMaskIp;

  // CIDR 또는 서브넷마스크 처리
  if (cidrOrSubnetMask.includes(".")) {
    cidr = getCidr(cidrOrSubnetMask);
    subnetMaskIp = cidrOrSubnetMask.split(".").map((octet) => +octet);
  } else {
    cidr = +cidrOrSubnetMask;
    subnetMaskIp = getCidrToIp(cidr);
  }

  // IP 유효성 검사
  ip.forEach((octet) => {
    if (octet < 0 || octet > 255) {
      throw new Error("유효하지 않은 IP 주소입니다");
    }
  });

  const networkIp = getIpNetwork(ip, subnetMaskIp);
  const broadcastIp = getIpBroadcast(networkIp, subnetMaskIp);
  const ipBinary = getIpToBinary(ip);
  const subnetMaskBinary = getIpToBinary(subnetMaskIp);

  const networkCount = Math.pow(2, cidr % 8);
  const ipPerNetwork = Math.pow(2, 32 - cidr) - 2;
  const totalIps = networkCount * ipPerNetwork;

  const ranges = getNetworkRanges(networkIp, cidr);

  console.log("\n=== IP 정보 ===");
  console.log(`IP 주소: ${ipAddr}`);
  console.log(`서브넷 마스크: ${subnetMaskIp.join(".")}`);
  console.log(`CIDR: /${cidr}`);
  console.log("\n=== 네트워크 정보 ===");
  console.log(`네트워크 그룹 개수: ${networkCount}개`);
  console.log(`네트워크당 할당 가능 IP: ${ipPerNetwork.toLocaleString()}개`);
  console.log(`총 할당 가능 IP: ${totalIps.toLocaleString()}개`);
  console.log("\n=== 주소 정보 ===");
  console.log(`네트워크 주소: ${networkIp.join(".")}`);
  console.log(`브로드캐스트 주소: ${broadcastIp.join(".")}`);
  console.log("\n=== 바이너리 표현 ===");
  console.log(`IP 바이너리: ${ipBinary.join(".")}`);
  console.log(`서브넷마스크 바이너리: ${subnetMaskBinary.join(".")}`);

  console.log("\n=== 네트워크 그룹별 IP 범위 ===");
  ranges.forEach((range, index) => {
    console.log(`\n[네트워크 그룹 ${index + 1}]`);
    console.log(`네트워크 주소: ${range.network}`);
    console.log(`시작 IP: ${range.usableStart}`);
    console.log(`종료 IP: ${range.usableEnd}`);
    console.log(`브로드캐스트 주소: ${range.broadcast}`);
  });
}

calculate(args);
