import React, { useEffect, useState } from "react";
import Web3 from "web3";
import {
  Box,
  Button,
  Select,
  MenuItem,
  InputLabel,
  TextField,
  FormControl,
  Divider,
  Alert,
} from "@mui/material";

const Transfer = ({ transferContract }) => {
  const [web3Instance, setWeb3Instance] = useState(null);
  //   const [accountAddress, setAccountAddress] = useState("");
  //   const [winner, setWinner] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [recipientAccount, setRecipientAccount] = useState("");
  const [transferAmount, setTransferAmount] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const initialize = async () => {
      const web3 = new Web3(window.ethereum);
      const accountsAddress = await web3.eth.getAccounts();
      console.log("accountsAddress", accountsAddress);
      const result = accountsAddress.map(async (account) => {
        // Get the account name and balance
        const balance = await web3.eth.getBalance(account);
        console.log("?????????????", account, balance);
        // const accountName = await web3.eth.personal.sign("My Account Name", account, ""); // Replace with your account name
        return {
          address: account,
          balance: web3.utils.fromWei(balance, "ether"),
        };
      });
      const accountsWithBalance = await Promise.all(result);
      console.log("=======================", accountsWithBalance);
      setWeb3Instance(web3);
      setAccounts(accountsWithBalance);
      setSelectedAccount(accountsAddress[0]);

      // Listen for account changes in MetaMask
      window.ethereum.on("accountsChanged", handleAccountChange);
    };

    initialize();
    return () => {
      // Clean up the event listener
      window.ethereum.removeListener("accountsChanged", handleAccountChange);
    };
  }, []);

  // useEffect(() => {
  //   (async () => {
  //     if (transferContract) {
  //       const candidates = await transferContract.methods.getCandidates().call();
  //       const _candidates = structToArray(candidates);
  //       setCandidates([..._candidates]);
  //       _candidates.sort((a, b) => {
  //         return Number(b.voteCount) - Number(a.voteCount);
  //       });
  //       const votes = _candidates.reduce((total, curr) => total + curr.voteCount, 0);
  //       setVotingResult(_candidates);
  //       // setWinner(_candidates.slice(0, 3));
  //       setTotalVotes(votes);
  //     }
  //   })();
  // }, [transferContract, voteCasted]);

  const handleAccountChange = (accounts) => {
    setSelectedAccount(accounts[0]);
  };

  const selectAccountChange = (event) => {
    setRecipientAccount(event.target.value);
    setErrorMessage("");
  };

  const handleInputChange = (event) => {
    const value = event.target.value.replace(/[^0-9]/g, ""); // Remove non-numeric characters
    setTransferAmount(value); // Update the input field value
  };

  const handleSubmit = async (event) => {
    console.log("hereeeee");
    event.preventDefault();

    // Perform validation
    if (!recipientAccount) {
      setErrorMessage("Please select an account");
      return;
    }

    try {
      console.log("selectedAccount", selectedAccount, recipientAccount);
      await transferContract.methods
        .sendEther(recipientAccount.address)
        .send({
          from: selectedAccount,
          value: web3Instance.utils.toWei(transferAmount, "ether"),
        })
        .on("transactionHash", (hash) => {
          // Transaction submitted, show loading or confirmation message
          console.log("Transaction Hash:", hash);
        })
        .on("confirmation", (confirmationNumber, receipt) => {
          // Transaction confirmed, show success message
          console.log("Transaction Confirmed");
          setSuccessMessage("Transferred Successfully");
        })
        .on("error", (error) => {
          // Transaction failed, show error message
          console.error("Transaction Failed:", error);
          setErrorMessage(error);
        });
    } catch (error) {
      console.log("err", error);
      setErrorMessage("Error sending ETher");
      return;
    }
    setRecipientAccount("");
  };

  return (
    <Box style={{ textAlign: "center" }}>
      <h2>Transfer Ether from account - {selectedAccount}</h2>
      {/* <Divider />
      <List style={{ width: "50%", margin: "0 auto" }}>
        {accounts &&
          accounts.length > 0 &&
          accounts.map((candidate, index) => {
            return (
              <ListItem key={index} style={{ textAlign: "center" }}>
                <ListItemText primary={candidate.name} />
                <LinearProgress
                  color="primary"
                  variant="determinate"
                  value={(parseInt(candidate.voteCount) / totalVotes) * 100 || 0}
                  sx={{ width: "50%" }}
                />
              </ListItem>
            );
          })}
      </List> */}
      <Divider />
      <Box p={4}>
        <FormControl>
          <div style={{ paddingBottom: 30 }}>
            <InputLabel>Select an Account</InputLabel>
            <Select
              value={recipientAccount}
              onChange={selectAccountChange}
              label="Select an Account"
              style={{ width: 200 }}
            >
              {accounts &&
                accounts.length > 0 &&
                accounts.map((account, index) => {
                  return (
                    <MenuItem key={index} value={account}>
                      {account.address} ({parseFloat(account.balance).toFixed(4)}ETH)
                    </MenuItem>
                  );
                })}
            </Select>
            {/* <Divider orientation="vertical" /> */}
            <TextField
              label="Number"
              type="text"
              onInput={handleInputChange}
              inputProps={{ pattern: "[0-9]*" }}
              value={transferAmount}
            />
          </div>
          {successMessage && <Alert severity="success">{successMessage}</Alert>}
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          <Button
            variant="contained"
            type="submit"
            disabled={recipientAccount && transferAmount > 0 ? false : true}
            onClick={handleSubmit}
          >
            Transfer
          </Button>
        </FormControl>
      </Box>
    </Box>
  );
};

export default Transfer;
