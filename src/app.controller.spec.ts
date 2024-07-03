import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as fs from 'fs';
import { BadRequestException } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('testUpload', () => {
    it('should return 3', async () => {
      const file: Express.Multer.File = require('../test/file/test.json');
      fs.copyFileSync('test/sample/test.csv', 'test/file/test.csv');
      const result = await appController.uploadFile(file);
      expect(result).toBe(3);
    });

    it('should throw error', async () => {
      const file: Express.Multer.File = require('../test/file/error.json');
      fs.copyFileSync('test/sample/error.csv', 'test/file/error.csv');
      await expect(appController.uploadFile(file)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
