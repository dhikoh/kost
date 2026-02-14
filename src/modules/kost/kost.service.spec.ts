import { Test, TestingModule } from '@nestjs/testing';
import { KostService } from './kost.service';

describe('KostService', () => {
  let service: KostService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [KostService],
    }).compile();

    service = module.get<KostService>(KostService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
