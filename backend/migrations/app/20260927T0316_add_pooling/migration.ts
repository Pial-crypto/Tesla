#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/04ff1b6a15a62fc7f8d6cc2c5abaa56c7f62cf265fc09cda56fa8cfe5784c631/contract';
import endContract from '../../snapshots/04ff1b6a15a62fc7f8d6cc2c5abaa56c7f62cf265fc09cda56fa8cfe5784c631/contract.json' with { type: 'json' };
import type { Contract as Start } from '../../snapshots/6b0ae6a4db04ec2305feea8b4f72c9e83a08816bdc5d3bc2490e81e20805fd51/contract';
import startContract from '../../snapshots/6b0ae6a4db04ec2305feea8b4f72c9e83a08816bdc5d3bc2490e81e20805fd51/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<Start, End> {
  override readonly startContractJson = startContract;
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createTable({
        schema: 'public',
        table: 'Pool',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('pickupZone', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('OPEN'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('vehicleId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Pool_status_check_34662d3c',
            "\"status\" IN ('OPEN', 'DRIVER_ARRIVED', 'STARTED', 'COMPLETED')",
          ),
        ],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Pool',
        index: 'Pool_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Pool',
        index: 'Pool_vehicleId_idx_e2df58fc',
        columns: ['vehicleId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Ride',
        index: 'Ride_poolId_idx_d8a048f6',
        columns: ['poolId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Pool',
        foreignKey: {
          name: 'Pool_vehicleId_fkey',
          columns: ['vehicleId'],
          references: { schema: 'public', table: 'Vehicle', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Ride',
        foreignKey: {
          name: 'Ride_poolId_fkey',
          columns: ['poolId'],
          references: { schema: 'public', table: 'Pool', columns: ['id'] },
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
