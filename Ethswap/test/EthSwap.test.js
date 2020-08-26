const Token = artifacts.require('Token');
const EthSwap = artifacts.require('EthSwap');

function tokens(n) {
  return web3.utils.toWei(n, 'ether');
}

contract('EthSwap', ([deployer, investor]) => {
  let token, ethSwap;
  before(async () => {
    token = await Token.new();
    ethSwap = await EthSwap.new(token.address);
  });
  describe('Token deployment', async () => {
    it('Token has a name', async () => {
      const name = await token.name();
      assert.equal(name, 'DApp Token');
    });
  });

  describe('EthSwap deployment', async () => {
    it('contract has a name', async () => {
      const name = await ethSwap.name();
      assert.equal(name, 'EthSwap Instant Exchange');
    });

    it('contract has tokens', async () => {
      await token.transfer(ethSwap.address, tokens('1000000'));
      const balance = await token.balanceOf(ethSwap.address);
      assert.equal(balance, tokens('1000000'));
    });
  });

  describe('buytokens()', async () => {
    let result;
    before(async () => {
      result = await ethSwap.buyTokens({
        from: investor,
        value: web3.utils.toWei('1', 'ether'),
      });
    });

    it('Purchase of token verification', async () => {
      const investorBalance = await token.balanceOf(investor);
      assert.equal(investorBalance.toString(), tokens('100'));
      const ethSwapBalance = await token.balanceOf(ethSwap.address);
      assert.equal(ethSwapBalance, tokens('999900'));
      const ethSwapEtherBalance = await web3.eth.getBalance(ethSwap.address);
      assert.equal(ethSwapEtherBalance, web3.utils.toWei('1', 'ether'));
      const event = result.logs[0].args;
      assert.equal(event.account, investor);
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens('100').toString());
      assert.equal(event.rate.toString(), '100');
    });
  });

  describe('selltokens()', async () => {
    let result;
    before(async () => {
      await token.approve(ethSwap.address, tokens('100'), {
        from: investor,
      });
      result = await ethSwap.sellTokens(tokens('100'), {
        from: investor,
      });
    });

    it('Purchase of token verification', async () => {
      const investorBalance = await token.balanceOf(investor);
      assert.equal(investorBalance.toString(), tokens('0'));
      const ethSwapBalance = await token.balanceOf(ethSwap.address);
      assert.equal(ethSwapBalance, tokens('1000000'));
      const ethSwapEtherBalance = await web3.eth.getBalance(ethSwap.address);
      assert.equal(ethSwapEtherBalance, web3.utils.toWei('0', 'ether'));
      const event = result.logs[0].args;
      assert.equal(event.account, investor);
      assert.equal(event.token, token.address);
      assert.equal(event.amount.toString(), tokens('100').toString());
      assert.equal(event.rate.toString(), '100');
    });
  });
});
