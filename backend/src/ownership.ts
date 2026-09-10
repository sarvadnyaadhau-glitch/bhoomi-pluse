import { query } from './db.js'

/** Verify a farm belongs to the authenticated user. */
export async function farmBelongsToUser(farmId: string, userId: string): Promise<boolean> {
  const { rows } = await query('SELECT owner_id FROM farms WHERE id = $1', [farmId])
  return rows.length > 0 && rows[0].owner_id === userId
}

/** Verify a field belongs to the authenticated user (through its farm). */
export async function fieldBelongsToUser(fieldId: string, userId: string): Promise<boolean> {
  const { rows } = await query(
    `SELECT f.owner_id FROM fields fi JOIN farms f ON fi.farm_id = f.id WHERE fi.id = $1`,
    [fieldId]
  )
  return rows.length > 0 && rows[0].owner_id === userId
}

/** Get the farm_id for a field, verifying ownership. Returns null if not owned. */
export async function getOwnedFieldFarm(fieldId: string, userId: string): Promise<string | null> {
  const { rows } = await query(
    `SELECT f.owner_id, fi.farm_id FROM fields fi JOIN farms f ON fi.farm_id = f.id WHERE fi.id = $1`,
    [fieldId]
  )
  if (rows.length === 0 || rows[0].owner_id !== userId) return null
  return rows[0].farm_id
}
