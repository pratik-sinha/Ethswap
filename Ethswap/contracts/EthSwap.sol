// SPDX-License-Identifier: MIT
pragma solidity >=0.4.25 <0.7.0;

import './Token.sol';

contract EthSwap {
   string public name = "EthSwap Instant Exchange";
   uint public rate = 100;
   Token public token;

   event TokenPurchased(
       address account,
       address token,
       uint amount,
       uint rate
   );

   event TokenSold(
       address account,
       address token,
       uint amount,
       uint rate
   );

    constructor (Token _token) public {
        token = _token;
    }

    function  buyTokens()  public  payable {
        // Calculate number of tokens with rate
         uint tokens = msg.value * rate;
         // Check if the contract has required number of tokens to sell
         require(token.balanceOf(address(this)) >= tokens,"Insufficient tokens in exchange");
         //Transfer tokens to caller
        token.transfer(msg.sender, tokens);
        emit TokenPurchased(msg.sender,address(token),tokens,rate);
    }

    function  sellTokens(uint numberOfTokens)  public {
        //Check for sender having the tokens
        require(token.balanceOf(msg.sender) >= numberOfTokens,"Seller doesnt have sufficient tokens");
        //Calculate value of ether
        uint ethValue = numberOfTokens / rate;
        //Check if the contract has required value of ether
        require(address(this).balance >= ethValue,"Insufficient ether in exchange");
        //Transfer tokens from seller to exchange
        token.transferFrom(msg.sender,address(this),numberOfTokens);
        //Transfer ether to seller
        msg.sender.transfer(ethValue);
        emit TokenSold(msg.sender,address(token),numberOfTokens,rate);
    }
}