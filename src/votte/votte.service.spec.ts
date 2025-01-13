import { Test, TestingModule } from '@nestjs/testing';
import { VotteService } from './votte.service';

describe('VotteService', () => {
  let service: VotteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VotteService],
    }).compile();

    service = module.get<VotteService>(VotteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
