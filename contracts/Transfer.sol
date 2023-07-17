// Voting.sol
pragma solidity ^0.8.0;

contract Transfer {
    function sendEther(address payable _recipient) public payable {
        require(msg.value > 0, "Amount must be greater than zero.");
        require(_recipient != address(0), "Invalid recipient address.");

        _recipient.transfer(msg.value);
    }
}
