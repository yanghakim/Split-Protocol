const {ethers} = require('hardhat');
require("dotenv").config({path: ".env"});

async function main(){
  const splitContract = await ethers.getContractFactory("Split");
  const swapContract = await ethers.getContractFactory("Swap");

  const deployedSplitContract = await splitContract.deploy();
  await deployedSplitContract.deployed();
  
  const deployedSwapContract = await swapContract.deploy(deployedSplitContract.address);
  await deployedSwapContract.deployed();

  await deployedSplitContract.setSwapContractAddress(deployedSwapContract.address);
  


  console.log('Split Contract deployed to:', deployedSplitContract.address);
  console.log('Swap Contract deployed to:', deployedSwapContract.address);


  storeContractData(deployedSplitContract, "Split");
  storeContractData(deployedSwapContract, "Swap");
}

// auto write contract abi.json after deployment
const storeContractData = (contract, contractName) => {
  const fs = require("fs");
  const contractDir = `${__dirname}/../abis`;

  if (!fs.existsSync(contractDir)) {
    fs.mkdirSync(contractDir);
  }

  const contractArtiacts = artifacts.readArtifactSync(contractName);

  
  
  fs.writeFileSync(
    contractDir + `/${contractName}.json`,
    JSON.stringify({ address: contract.address, ...contractArtiacts }, null, 2)
  );
};


main().then( () => process.exit(0))
.catch( error => {
  console.log(error);
  process.exit(1);
})