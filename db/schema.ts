import { sqliteTable, text, integer, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
export const riverLanterns=sqliteTable('river_lanterns',{id:text('id').primaryKey(),visitor:text('visitor').notNull(),room:text('room').notNull(),area:text('area').notNull(),name:text('name').notNull(),wish:text('wish').notNull(),starts:integer('starts').notNull(),created:integer('created').notNull()},t=>[index('lantern_room').on(t.room,t.area,t.starts),index('lantern_visitor').on(t.visitor,t.created)]);
export const lanternRounds=sqliteTable('lantern_rounds',{id:text('id').primaryKey(),room:text('room').notNull(),area:text('area').notNull(),name:text('name').notNull(),starts:integer('starts').notNull()},t=>[uniqueIndex('lantern_round_place').on(t.room,t.area)]);
export const accounts=sqliteTable('accounts',{id:text('id').primaryKey(),email:text('email').notNull().unique(),salt:text('salt').notNull(),password:text('password').notNull(),verified:integer('verified').notNull().default(0),created:integer('created').notNull()});
export const accountSessions=sqliteTable('account_sessions',{token:text('token').primaryKey(),account:text('account').notNull(),expires:integer('expires').notNull()});
export const accountAttempts=sqliteTable('account_attempts',{bucket:text('bucket').notNull(),created:integer('created').notNull()},t=>[index('account_attempt_bucket').on(t.bucket,t.created)]);
export const gestures = sqliteTable('gestures', {
  id:text('id').primaryKey(), sender:text('sender').notNull(), target:text('target').notNull(),
  room:text('room').notNull(), area:text('area').notNull(), name:text('name').notNull(), kind:text('kind').notNull(), created:integer('created').notNull(),
},t=>[index('gesture_target').on(t.target,t.created)]);
export const visitors = sqliteTable('visitors', {
  id: text('id').primaryKey(), token: text('token').notNull(), room: text('room').notNull(), area: text('area').notNull(),
  name: text('name').notNull(), color: text('color').notNull(), x: real('x').notNull(), z: real('z').notNull(), yaw: real('yaw').notNull(),
  action: text('action').notNull(), seat: integer('seat'), seen: integer('seen').notNull(), inviteAt: integer('invite_at').notNull().default(0)
}, t => [uniqueIndex('visitor_seat').on(t.room,t.area,t.seat), index('visitor_room').on(t.room,t.seen)]);
export const tickets = sqliteTable('tickets', {
  id: text('id').primaryKey(), visitor: text('visitor').notNull(), room: text('room').notNull(), color: text('color').notNull(),
  starts: integer('starts').notNull(), ends: integer('ends').notNull(), completed: integer('completed').notNull().default(0),
}, t => [index('ticket_visitor').on(t.visitor)]);
