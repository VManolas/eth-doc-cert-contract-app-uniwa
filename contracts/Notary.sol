// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;
// pragma expression to specify a minimum compiler version (0.4.4) for this code. The code should compile with anything below version 0.5.0.
// pragma solidity ^0.4.4; 

// declare the Notary contract
contract Notary {

  // declare a struct datatype, instances of which will be used to store records of the documents we wish to fingerprint
  struct Record {
    // The struct has two entries of type uint, which is an unsigned 256-bit integer. 
    // The fields are a timestamp and the block number at which the transaction supplying the hash value of our files is mined.
    uint mineTime;
    uint blockNumber;
  }
  
  // state variable
  // This will actually be stored on the blockchain and maps 32-byte values, our SHA-256 hashes, 
  // to an instance of our previously declared Record struct. 
  // A mapping is essentially a hash table, which you may know from other programming languages. 
  // The SHA-256 hash will actually be used as the key to find the corresponding record.
  mapping (bytes32 => Record) private docHashes;
  
  // constructor of our contract. 
  // Constructors are called at contract deployment and serve for initialisation tasks. 
  // As our contract is very simple we do not need to do anything special here, so we just leave the constructor empty.
  constructor() public {
    // constructor
  }

  // function that is used to store records on the blockchain
  // Note that the function takes a hash value as an argument. We could send the actual file content to the contract and calculate the hash value in the contract code, but this would be a poorer design decision for a number of reasons: First of all, contract execution has an associated cost in gas, which is translated to Ether via the gas price, and is charged to the caller of the transaction. The more work to be done, the costlier the transaction will be. Secondly, users should not have to send their files across the network. There is no reason for user data to leave the owner’s machine, as SHA-256 hashes can be calculated locally. Finally, independent of transaction fees, sending large files over the network is just much more inefficient than sending the SHA-256 hash.
  // the addDocHash function is declared public, so that it can be accessed externally
  function addDocHash (bytes32 hash) public {
    // The memory keyword used in the local Record declaration means that it won’t be saved to storage
    Record memory newRecord = Record(block.timestamp, block.number);
    // Storing it is eventually achieved by saving the data to the docHashes mapping, which is an in-storage state variable
    docHashes[hash] = newRecord;
    // When the addDocHash function is called in a transaction, the same transaction is executed by all nodes trying to include the transaction in a new block. The winning miner node that eventually seals the block sets the correct block number and mine time. Note, that whilst the timestamp can be manipulated by the miner in theory, it still needs to be larger than the previous block’s and lower than the next block’s timestamp. Therefore, any discrepancies will be minimal.
  }
  
  // a way to verify wether a hash exists on the blockchain and retrieve the corresponding record

  // function findDocHash (bytes32 hash) public constant returns(uint, uint) {
  // One important fact to notice is the "constant" keyword in the findDocHash function declaration. This indicates that the function does not alter state and can therefore be executed in a call, rather than a transaction. Calls may read state of a local Ethereum node and do not have to be propagated through the network and mined. They therefore do not require any gas and are free to use.
  // ! Note: constant on functions used to be an alias to view, but this was dropped in version 0.5.0. --> picked from: https://docs.soliditylang.org/en/v0.8.13/contracts.html
  function findDocHash (bytes32 hash) public view returns(uint, uint) {
    // returns the corresponding mine time and block number for a given hash as a tuple (Solidity can have multiple return values)
    // If a hash is not in the mapping the code will return (0,0). We could in fact add a test wether the hash exists and throw an exception, but as (0,0) is a pretty clear indicator for failure to find a hash, we can deal with this off-chain in the client code
    return (docHashes[hash].mineTime, docHashes[hash].blockNumber);

    // A good rule of thumb is to only include code that benefits from the blockchain’s properties in your contract. The rest is better off in client side code.
  }

}
