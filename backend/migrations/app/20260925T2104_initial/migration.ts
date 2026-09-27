#!/usr/bin/env -S node
import type { Contract as End } from '../../snapshots/6b0ae6a4db04ec2305feea8b4f72c9e83a08816bdc5d3bc2490e81e20805fd51/contract';
import endContract from '../../snapshots/6b0ae6a4db04ec2305feea8b4f72c9e83a08816bdc5d3bc2490e81e20805fd51/contract.json' with { type: 'json' };
import {
  Migration,
  MigrationCLI,
  checkExpression,
  col,
  fn,
  lit,
  primaryKey,
} from '@prisma/orm-postgres/migration';

export default class M extends Migration<never, End> {
  override readonly endContractJson = endContract;

  override get operations() {
    return [
      this.createSchema({ schema: 'public' }),
      this.createTable({
        schema: 'public',
        table: 'Ride',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('destZone', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('farePaisa', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('fareSoloPaisa', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('passengerId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('paymentMethod', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('pickupZone', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('poolId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('seats', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('status', 'text', {
            notNull: true,
            default: lit('REQUESTED'),
            codecRef: { codecId: 'pg/text@1' },
          }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'Ride_paymentMethod_check_27e4f1ac',
            "\"paymentMethod\" IN ('CASH', 'TESLAPAY')",
          ),
          checkExpression(
            'Ride_status_check_7d653f80',
            "\"status\" IN ('REQUESTED', 'MATCHED', 'DRIVER_ARRIVED', 'STARTED', 'COMPLETED', 'CANCELLED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'RideEvent',
        columns: [
          col('actorId', 'int4', { codecRef: { codecId: 'pg/int4@1' } }),
          col('at', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('fromStatus', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('note', 'text', { codecRef: { codecId: 'pg/text@1' } }),
          col('rideId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('toStatus', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression(
            'RideEvent_fromStatus_check_e83b90d6',
            "\"fromStatus\" IN ('REQUESTED', 'MATCHED', 'DRIVER_ARRIVED', 'STARTED', 'COMPLETED', 'CANCELLED')",
          ),
          checkExpression(
            'RideEvent_toStatus_check_59d19a19',
            "\"toStatus\" IN ('REQUESTED', 'MATCHED', 'DRIVER_ARRIVED', 'STARTED', 'COMPLETED', 'CANCELLED')",
          ),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'User',
        columns: [
          col('createdAt', 'timestamptz', {
            notNull: true,
            default: fn('now()'),
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
          col('email', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('passwordHash', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('role', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
          col('updatedAt', 'timestamptz', {
            notNull: true,
            codecRef: { codecId: 'pg/timestamptz-string@1' },
          }),
        ],
        constraints: [
          primaryKey(['id']),
          checkExpression('User_role_check_af6cad8e', "\"role\" IN ('DRIVER', 'PASSENGER')"),
        ],
      }),
      this.createTable({
        schema: 'public',
        table: 'Vehicle',
        columns: [
          col('capacity', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('driverId', 'int4', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('id', 'SERIAL', { notNull: true, codecRef: { codecId: 'pg/int4@1' } }),
          col('name', 'text', { notNull: true, codecRef: { codecId: 'pg/text@1' } }),
        ],
        constraints: [primaryKey(['id'])],
      }),
      this.addUnique({
        schema: 'public',
        table: 'User',
        constraint: 'User_email_key',
        columns: ['email'],
      }),
      this.addUnique({
        schema: 'public',
        table: 'Vehicle',
        constraint: 'Vehicle_driverId_key',
        columns: ['driverId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Ride',
        index: 'Ride_createdAt_idx_9575dbd7',
        columns: ['createdAt'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Ride',
        index: 'Ride_passengerId_idx_21958ace',
        columns: ['passengerId'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'Ride',
        index: 'Ride_status_idx_e98638ab',
        columns: ['status'],
      }),
      this.createIndex({
        schema: 'public',
        table: 'RideEvent',
        index: 'RideEvent_rideId_idx_2125d498',
        columns: ['rideId'],
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Ride',
        foreignKey: {
          name: 'Ride_passengerId_fkey',
          columns: ['passengerId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'RideEvent',
        foreignKey: {
          name: 'RideEvent_rideId_fkey',
          columns: ['rideId'],
          references: { schema: 'public', table: 'Ride', columns: ['id'] },
        },
      }),
      this.addForeignKey({
        schema: 'public',
        table: 'Vehicle',
        foreignKey: {
          name: 'Vehicle_driverId_fkey',
          columns: ['driverId'],
          references: { schema: 'public', table: 'User', columns: ['id'] },
          onDelete: 'cascade',
        },
      }),
    ];
  }
}

MigrationCLI.run(import.meta.url, M);
