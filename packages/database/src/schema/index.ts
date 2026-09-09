import { pgEnum, pgTable, text, timestamp, uuid, numeric, boolean, jsonb } from 'drizzle-orm/pg-core';

export const userRole = pgEnum('user_role', ['farmer', 'provider', 'buyer', 'fpo_admin', 'enterprise_admin']);
export const farmStatus = pgEnum('farm_status', ['active', 'archived']);
export const sensorStatus = pgEnum('sensor_status', ['online', 'offline', 'calibration_required', 'error']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  phone: text('phone').unique(),
  email: text('email').unique(),
  name: text('name'),
  role: userRole('role').notNull().default('farmer'),
  language: text('language').notNull().default('en'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const farms = pgTable('farms', {
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: uuid('owner_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  village: text('village'),
  district: text('district'),
  state: text('state').default('Maharashtra'),
  latitude: numeric('latitude', { precision: 10, scale: 7 }),
  longitude: numeric('longitude', { precision: 10, scale: 7 }),
  areaAcres: numeric('area_acres', { precision: 10, scale: 3 }),
  boundaryGeoJson: jsonb('boundary_geo_json'),
  status: farmStatus('status').notNull().default('active'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const fields = pgTable('fields', {
  id: uuid('id').defaultRandom().primaryKey(),
  farmId: uuid('farm_id').notNull().references(() => farms.id),
  name: text('name').notNull(),
  areaAcres: numeric('area_acres', { precision: 10, scale: 3 }),
  boundaryGeoJson: jsonb('boundary_geo_json'),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const cropSeasons = pgTable('crop_seasons', {
  id: uuid('id').defaultRandom().primaryKey(),
  fieldId: uuid('field_id').notNull().references(() => fields.id),
  cropName: text('crop_name').notNull(),
  variety: text('variety'),
  sowingDate: timestamp('sowing_date', { withTimezone: true }),
  expectedHarvestDate: timestamp('expected_harvest_date', { withTimezone: true }),
  actualHarvestDate: timestamp('actual_harvest_date', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sensorDevices = pgTable('sensor_devices', {
  id: uuid('id').defaultRandom().primaryKey(),
  farmId: uuid('farm_id').notNull().references(() => farms.id),
  deviceUid: text('device_uid').notNull().unique(),
  name: text('name'),
  status: sensorStatus('status').notNull().default('offline'),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sensorReadings = pgTable('sensor_readings', {
  id: uuid('id').defaultRandom().primaryKey(),
  deviceId: uuid('device_id').notNull().references(() => sensorDevices.id),
  fieldId: uuid('field_id').references(() => fields.id),
  recordedAt: timestamp('recorded_at', { withTimezone: true }).notNull(),
  nitrogen: numeric('nitrogen'),
  phosphorus: numeric('phosphorus'),
  potassium: numeric('potassium'),
  ph: numeric('ph'),
  ec: numeric('ec'),
  soilMoisture: numeric('soil_moisture'),
  soilTemperature: numeric('soil_temperature'),
  airTemperature: numeric('air_temperature'),
  airHumidity: numeric('air_humidity'),
  quality: text('quality'),
  rawPayload: jsonb('raw_payload'),
});

export const farmEvents = pgTable('farm_events', {
  id: uuid('id').defaultRandom().primaryKey(),
  farmId: uuid('farm_id').notNull().references(() => farms.id),
  fieldId: uuid('field_id').references(() => fields.id),
  eventType: text('event_type').notNull(),
  occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
  title: text('title').notNull(),
  notes: text('notes'),
  payload: jsonb('payload'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const consents = pgTable('consents', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  purpose: text('purpose').notNull(),
  granted: boolean('granted').notNull().default(false),
  version: text('version').notNull(),
  grantedAt: timestamp('granted_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const schema = { users, farms, fields, cropSeasons, sensorDevices, sensorReadings, farmEvents, consents };
