import { Test, TestingModule } from '@nestjs/testing';
import { RandomcodeService } from './randomcode.service';

describe('RandomcodeService', () => {
  let service: RandomcodeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RandomcodeService],
    }).compile();

    service = module.get<RandomcodeService>(RandomcodeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
