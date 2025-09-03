// src/db/seed.ts
import "dotenv/config";

import { faker } from "@faker-js/faker";
import { randomUUID } from "crypto";
import dayjs from "dayjs";
import { eq, sql } from "drizzle-orm";

import { dentalSpecialties } from "@/constants/dental-specialties";

import { db } from ".";
import {
  appointmentsTable,
  doctorsTable,
  evolutionTable,
  patientsAnamnesisTable,
  patientsTable,
  usersTable,
  usersToClinicsTable,
} from "./schema";

const getRandomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomItem = <T>(arr: readonly T[]) =>
  arr[Math.floor(Math.random() * arr.length)];

async function seed() {
  try {
    console.log("🌱 Começando o processo de seed...");

    // --- Encontrar o usuário e a clínica existentes ---
    const userEmail = "demo@doutordigital.com";
    const user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, userEmail),
    });

    if (!user) {
      throw new Error(
        `Usuário com e-mail ${userEmail} não encontrado. Por favor, crie-o primeiro através da interface da aplicação.`,
      );
    }

    const userToClinic = await db.query.usersToClinicsTable.findFirst({
      where: eq(usersToClinicsTable.userId, user.id),
      with: {
        clinic: true,
      },
    });

    if (!userToClinic?.clinic) {
      throw new Error(
        `Nenhuma clínica encontrada para o usuário ${userEmail}. Por favor, crie-a primeiro através da interface.`,
      );
    }

    const clinic = userToClinic.clinic;
    console.log(
      `✅ Usuário e clínica "${clinic.name}" encontrados. Populando dados...`,
    );

    // --- Limpando dados antigos da clínica ---
    console.log("🗑️ Limpando dados antigos da clínica...");
    await db
      .delete(appointmentsTable)
      .where(eq(appointmentsTable.clinicId, clinic.id));

    // CORREÇÃO: Usando o nome correto da coluna do banco de dados ("patient_id")
    await db.execute(
      sql`DELETE FROM "patients_anamnesis" WHERE "patient_id" IN (SELECT id FROM patients WHERE clinic_id = ${clinic.id})`,
    );
    await db.execute(
      sql`DELETE FROM "evolution" WHERE "patient_id" IN (SELECT id FROM patients WHERE clinic_id = ${clinic.id})`,
    );

    await db.delete(patientsTable).where(eq(patientsTable.clinicId, clinic.id));
    await db.delete(doctorsTable).where(eq(doctorsTable.clinicId, clinic.id));
    console.log("✅ Dados antigos limpos.");

    // --- Gerando Dentistas ---
    const NUM_DENTISTS = 20;
    const createdDentists = [];
    console.log(`🦷 Gerando ${NUM_DENTISTS} dentistas...`);
    for (let i = 0; i < NUM_DENTISTS; i++) {
      const [dentist] = await db
        .insert(doctorsTable)
        .values({
          clinicId: clinic.id,
          name: faker.person.fullName(),
          specialty: getRandomItem(dentalSpecialties),
          appointmentPriceInCents: getRandomNumber(100, 500) * 100,
          availableFromWeekDay: 1,
          availableToWeekDay: 5,
          availableFromTime: "08:00:00",
          availableToTime: "18:00:00",
        })
        .returning();
      createdDentists.push(dentist);
    }
    console.log(`✅ ${createdDentists.length} dentistas criados.`);

    // --- Gerando Pacientes ---
    const NUM_PATIENTS = 500;
    const createdPatients = [];
    console.log(`👤 Gerando ${NUM_PATIENTS} pacientes...`);
    for (let i = 0; i < NUM_PATIENTS; i++) {
      const sex = getRandomItem(["male", "female"] as const);
      const [patient] = await db
        .insert(patientsTable)
        .values({
          clinicId: clinic.id,
          name: faker.person.fullName({ sex }),
          email: faker.internet.email().toLowerCase(),
          phoneNumber: faker.phone.number("##9########"), // <-- CORREÇÃO APLICADA AQUI
          sex: sex,
          cpf: `${getRandomNumber(100, 999)}.${getRandomNumber(100, 999)}.${getRandomNumber(100, 999)}-${getRandomNumber(10, 99)}`,
          birthDate: faker.date.birthdate({ min: 18, max: 80, mode: "age" }),
        })
        .returning();
      createdPatients.push(patient);
    }
    console.log(`✅ ${createdPatients.length} pacientes criados.`);

    // --- Gerando Anamnese e Evolução para alguns pacientes ---
    console.log("📝 Gerando dados de anamnese e evolução...");
    for (const patient of createdPatients.slice(0, 150)) {
      // Gera para os primeiros 150 pacientes
      const randomDoctor = getRandomItem(createdDentists);

      // Criar uma ficha de anamnese
      await db.insert(patientsAnamnesisTable).values({
        patientId: patient.id,
        doctorId: randomDoctor.id,
        reasonConsultation: faker.lorem.sentence(),
        hasAllergies: faker.datatype.boolean(),
        allergies: faker.lorem.words(3),
        usesMedication: faker.datatype.boolean(),
        medicationUsage: faker.lorem.words(4),
        smokes: faker.datatype.boolean(),
        drinksAlcohol: faker.datatype.boolean(),
        oralHygiene: "Escova 3x ao dia, usa fio dental.",
        updatedAt: new Date(),
      });

      // Criar múltiplas entradas de evolução
      const numEvolutions = getRandomNumber(1, 5);
      for (let i = 0; i < numEvolutions; i++) {
        await db.insert(evolutionTable).values({
          patientId: patient.id,
          doctorId: getRandomItem(createdDentists).id,
          date: faker.date.past({ years: 2 }),
          description: faker.lorem.paragraph(),
          observations: faker.lorem.sentence(),
        });
      }
    }
    console.log("✅ Anamnese e evolução criadas.");

    // --- Gerando Agendamentos ---
    const NUM_APPOINTMENTS = 2000;
    console.log(`🗓️ Gerando ${NUM_APPOINTMENTS} agendamentos...`);
    for (let i = 0; i < NUM_APPOINTMENTS; i++) {
      const randomDoctor = getRandomItem(createdDentists);
      const randomPatient = getRandomItem(createdPatients);
      const appointmentDate = faker.date.between({
        from: dayjs().subtract(6, "month").toDate(),
        to: dayjs().add(6, "month").toDate(),
      });
      appointmentDate.setHours(getRandomNumber(8, 17));
      appointmentDate.setMinutes(getRandomItem([0, 30]));
      appointmentDate.setSeconds(0);
      await db.insert(appointmentsTable).values({
        clinicId: clinic.id,
        doctorId: randomDoctor.id,
        patientId: randomPatient.id,
        date: appointmentDate,
        appointmentPriceInCents: randomDoctor.appointmentPriceInCents,
      });
    }
    console.log(`✅ ${NUM_APPOINTMENTS} agendamentos criados.`);

    console.log("🎉 Processo de seed concluído com sucesso!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao executar o seed:", error);
    process.exit(1);
  }
}

seed();