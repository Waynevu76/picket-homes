import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { parse } from 'csv-parse';
import { COLUMN_NAME, CSV_FILE_FAIL } from './config/constant';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  readFile(file: Express.Multer.File): Promise<number> {
    const set: Set<string> = new Set();
    return new Promise((resolve, reject) => {
      const errors = [];
      fs.createReadStream(file.path)
        .pipe(parse({ columns: true }))
        .on('data', (row) => {
          for (const column of COLUMN_NAME) {
            if (!row[column]) {
              errors.push(`Missing value for required column: ${column}`);
            }
          }
          if (!set.has(row['houseAddress'])) {
            set.add(row['houseAddress']);
          }
        })
        .on('end', () => {
          fs.unlinkSync(file.path);
          if (errors.length > 0) {
            const error = new Error();
            error.name = CSV_FILE_FAIL;
            error.message = errors.join(',');
            reject(error);
          } else {
            resolve(set.size);
          }
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<number> {
    try {
      const addressUnique = await this.readFile(file);
      return addressUnique;
    } catch (error) {
      if (error.name === CSV_FILE_FAIL) {
        throw new BadRequestException(error);
      } else {
        throw new Error(error);
      }
    }
  }
}
