import { expect } from 'chai';
import WitAIHelper from '../src/wit_ai';
import traitsObject from './test_data/traits';

describe('WitAIHelper.AnalyzeTraits function Tests', () => {
  it('should successfully return trait with the highest confidence', () => {
    const { value } = WitAIHelper.AnalyzeTraits(traitsObject[0]);
    expect(value).equals('true');
  });
});
