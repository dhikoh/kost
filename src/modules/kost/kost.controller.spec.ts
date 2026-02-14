import { Test, TestingModule } from '@nestjs/testing';
import { KostController } from './kost.controller';

describe('KostController', () => {
  let controller: KostController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KostController],
    }).compile();

    controller = module.get<KostController>(KostController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
