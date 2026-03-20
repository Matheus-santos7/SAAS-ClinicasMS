import { and, asc, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import {
  clinicProceduresTable,
  expenseTypesTable,
  vendorsTable,
} from "@/db/schema";

export async function getClinicProcedures(clinicId: string) {
  return db
    .select()
    .from(clinicProceduresTable)
    .where(
      and(
        eq(clinicProceduresTable.clinicId, clinicId),
        isNull(clinicProceduresTable.deletedAt),
      ),
    )
    .orderBy(asc(clinicProceduresTable.name));
}

export async function getExpenseTypesWithVendor(clinicId: string) {
  return db
    .select({
      id: expenseTypesTable.id,
      clinicId: expenseTypesTable.clinicId,
      name: expenseTypesTable.name,
      recurrenceType: expenseTypesTable.recurrenceType,
      notes: expenseTypesTable.notes,
      vendorId: expenseTypesTable.vendorId,
      createdAt: expenseTypesTable.createdAt,
      updatedAt: expenseTypesTable.updatedAt,
      deletedAt: expenseTypesTable.deletedAt,
      vendorName: vendorsTable.name,
    })
    .from(expenseTypesTable)
    .leftJoin(
      vendorsTable,
      eq(expenseTypesTable.vendorId, vendorsTable.id),
    )
    .where(
      and(
        eq(expenseTypesTable.clinicId, clinicId),
        isNull(expenseTypesTable.deletedAt),
      ),
    )
    .orderBy(asc(expenseTypesTable.name));
}

export async function getVendors(clinicId: string) {
  return db
    .select()
    .from(vendorsTable)
    .where(
      and(
        eq(vendorsTable.clinicId, clinicId),
        isNull(vendorsTable.deletedAt),
      ),
    )
    .orderBy(asc(vendorsTable.name));
}
