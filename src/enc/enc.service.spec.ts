import { Test, TestingModule } from '@nestjs/testing';
import { EncService } from './enc.service';

describe('EncService', () => {
  let service: EncService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncService],
    }).compile();

    service = module.get<EncService>(EncService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
