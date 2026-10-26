// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract ZSToken {
    string public name = "ZHYToken";
    string public symbol = "ZHY";
    uint8 public decimals = 18;
    uint256 public totalSupply;
    address public owner;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    modifier onlyOwner() {
        require(msg.sender == owner, "ZSToken: not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function mint(address _to, uint256 _amount) public onlyOwner {
        require(_to != address(0), "ZSToken: mint to zero");
        totalSupply += _amount;
        balanceOf[_to] += _amount;
        emit Transfer(address(0), _to, _amount);
    }

    function burn(uint256 _amount) public onlyOwner {
        require(balanceOf[msg.sender] >= _amount, "ZSToken: burn exceeds balance");
        totalSupply -= _amount;
        balanceOf[msg.sender] -= _amount;
        emit Transfer(msg.sender, address(0), _amount);
    }

    function transfer(address to, uint256 value) public returns (bool) {
        require(to != address(0), "ZSToken: transfer to zero");
        require(balanceOf[msg.sender] >= value, "ZSToken: insufficient balance");
        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) public returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) public returns (bool) {
        require(balanceOf[from] >= value, "ZSToken: insufficient balance");
        require(allowance[from][msg.sender] >= value, "ZSToken: insufficient allowance");
        allowance[from][msg.sender] -= value;
        balanceOf[from] -= value;
        balanceOf[to] += value;
        emit Transfer(from, to, value);
        return true;
    }
}
