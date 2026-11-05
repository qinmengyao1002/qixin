import { sqliteTable, text, integer, real, uniqueIndex, index } from 'drizzle-orm/sqlite-core';
export const visitors = sqliteTable('visitors', {
  id: text('id').primaryKey(), token: text('token').notNull(), room: text('room').notNull(), area: text('area').notNull(),
  name: text('name').notNull(), color: text('color').notNull(), x: real('x').notNull(), z: real('z').notNull(), yaw: real('yaw').notNull(),
  action: text('action').notNull(), seat: integer('seat'), seen: integer('seen').notNull(), inviteAt: integer('invite_at').notNull().default(0)
}, t => [uniqueIndex('visitor_seat').on(t.room,t.area,t.seat), index('visitor_room').on(t.room,t.seen)]);
export const tickets = sqliteTable('tickets', {
  id: text('id').primaryKey(), visitor: text('visitor').notNull(), room: text('room').notNull(), color: text('color').notNull(),
  starts: integer('starts').notNull(), ends: integer('ends').notNull(), completed: integer('completed').notNull().default(0),
}, t => [index('ticket_visitor').on(t.visitor)]);
