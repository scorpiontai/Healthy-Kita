import { Test, TestingModule } from '@nestjs/testing';
import { AischemaService } from './aischema.service';

describe('AischemaService', () => {
  let service: AischemaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AischemaService],
    }).compile();

    service = module.get<AischemaService>(AischemaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
