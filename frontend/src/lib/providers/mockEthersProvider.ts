import { ethers } from 'ethers';

class MockContract {
  // Mock contract methods and properties
}

class MockEthersProvider {
  // Mock provider methods and properties
}

const mockContractInstance = new MockContract();
const mockProviderInstance = new MockEthersProvider();

export const MockEthersProviderInstance = {
  getContract: jest.fn().mockReturnValue(mockContractInstance),
  // Mock other methods of the EthersProvider class
};

export const MockContractInstance = {
  // Mock contract methods
};

export const MockData = {
  // Mock JSON data
};
