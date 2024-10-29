// Table to look up subnet masks and host counts based on CIDR.
const cidrTable = [
  { cidr: 32, hosts: 1, mask: "255.255.255.255" },
  { cidr: 31, hosts: 2, mask: "255.255.255.254" },
  { cidr: 30, hosts: 4, mask: "255.255.255.252" },
  { cidr: 29, hosts: 8, mask: "255.255.255.248" },
  { cidr: 28, hosts: 16, mask: "255.255.255.240" },
  { cidr: 27, hosts: 32, mask: "255.255.255.224" },
  { cidr: 26, hosts: 64, mask: "255.255.255.192" },
  { cidr: 25, hosts: 128, mask: "255.255.255.128" },
  { cidr: 24, hosts: 256, mask: "255.255.255.0" },
  { cidr: 23, hosts: 512, mask: "255.255.254.0" },
  { cidr: 22, hosts: 1024, mask: "255.255.252.0" },
  { cidr: 21, hosts: 2048, mask: "255.255.248.0" },
  { cidr: 20, hosts: 4096, mask: "255.255.240.0" },
  { cidr: 19, hosts: 8192, mask: "255.255.224.0" },
  { cidr: 18, hosts: 16384, mask: "255.255.192.0" },
  { cidr: 17, hosts: 32768, mask: "255.255.128.0" },
  { cidr: 16, hosts: 65536, mask: "255.255.0.0" },
  { cidr: 15, hosts: 131072, mask: "255.254.0.0" },
  { cidr: 14, hosts: 262144, mask: "255.252.0.0" },
  { cidr: 13, hosts: 524288, mask: "255.248.0.0" },
  { cidr: 12, hosts: 1048576, mask: "255.240.0.0" },
  { cidr: 11, hosts: 2097152, mask: "255.224.0.0" },
  { cidr: 10, hosts: 4194304, mask: "255.192.0.0" },
  { cidr: 9, hosts: 8388608, mask: "255.128.0.0" },
  { cidr: 8, hosts: 16777216, mask: "255.0.0.0" },
  { cidr: 7, hosts: 33554432, mask: "254.0.0.0" },
  { cidr: 6, hosts: 67108864, mask: "252.0.0.0" },
  { cidr: 5, hosts: 134217728, mask: "248.0.0.0" },
  { cidr: 4, hosts: 268435456, mask: "240.0.0.0" },
  { cidr: 3, hosts: 536870912, mask: "224.0.0.0" },
  { cidr: 2, hosts: 1073741824, mask: "192.0.0.0" },
  { cidr: 1, hosts: 2147483648, mask: "128.0.0.0" },
];

function ipToBinary(ip) {
  return ip
    .split(".")
    .map((octet) => (+octet).toString(2).padStart(8, "0"))
    .join("");
}

function binaryToIp(binary) {
  return binary
    .match(/.{8}/g)
    .map((octet) => parseInt(octet, 2))
    .join(".");
}

function calculate([ipAddr, cidr]) {
  cidr = +cidr;
  const ipBinary = ipToBinary(ipAddr);
  const cidrInfo = cidrTable.find((entry) => entry.cidr === cidr);

  if (!cidrInfo) {
    throw new Error("Invalid CIDR provided");
  }

  const subnetMaskBinary = ipToBinary(cidrInfo.mask);
  const networkBinary = ipBinary.substring(0, cidr) + "0".repeat(32 - cidr);
  const broadcastBinary = ipBinary.substring(0, cidr) + "1".repeat(32 - cidr);

  const networkIp = binaryToIp(networkBinary);
  const broadcastIp = binaryToIp(broadcastBinary);
  const totalHosts = cidrInfo.hosts;
  const assignableHosts = totalHosts - 2 > 0 ? totalHosts - 2 : 0;

  // console.log("\n# Calculated Network Information\n");
  // console.log(" * IP Address:           ", ipAddr);
  // console.log(" * CIDR Notation:        ", "/" + cidr);
  // console.log(" * Subnet Mask:          ", cidrInfo.mask);
  // console.log(" * Network Address:      ", networkIp);
  // console.log(" * Broadcast Address:    ", broadcastIp);
  // console.log(" * Number of Subnets:    ", Math.pow(2, cidr));
  // console.log(" * Assignable IP Count:  ", assignableHosts);
  // console.log(" * Total Hosts:          ", totalHosts);
  // console.log("");
  const results = [
    ["IP Address", ipAddr],
    ["CIDR Notation", "/" + cidr],
    ["Subnet Mask", cidrInfo.mask],
    ["Network Address", networkIp],
    ["Broadcast Address", broadcastIp],
    ["Number of Subnets", Math.pow(2, cidr)],
    ["Assignable IP Count", assignableHosts],
    ["Total Hosts", totalHosts],
  ];

  return results;
}

window.addEventListener("load", () => {
  const ipInput = document.getElementById("ip");
  const cidrInput = document.getElementById("cidr");
  const resultP = document.getElementById("result");

  ipInput.value = "192.168.1.1";
  cidrInput.value = "24";
  resultP.innerHTML = calculate([ipInput.value, cidrInput.value])
    .map((row) => row.join(": "))
    .join("<br />");

  window.addEventListener("input", () => {
    if (ipInput.value && cidrInput.value) {
      resultP.innerHTML = calculate([ipInput.value, cidrInput.value])
        .map((row) => row.join(": "))
        .join("<br />");
    }
  });
});
