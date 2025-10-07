import "dotenv/config";

import { faker } from "@faker-js/faker";
import dayjs from "dayjs";
import { eq, sql } from "drizzle-orm";

import { dentalSpecialties } from "../constants/dental-specialties";
import { db } from ".";
import {
  appointmentsTable,
  clinicsTable,
  doctorsTable,
  evolutionTable,
  patientsAnamnesisTable,
  patientsTable,
  transactionCategoriesTable,
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

    // --- Dados das clínicas ---
    const clinicsData = [
      { name: "Odontologia Fraguas", code: "FRAGUAS" },
      { name: "Odontologia Santos", code: "SANTOS" },
    ];

    // --- Encontrar ou criar usuário demo ---
    const userEmail = "demo@doutordigital.com";
    let user = await db.query.usersTable.findFirst({
      where: eq(usersTable.email, userEmail),
    });

    if (!user) {
      console.log(`👤 Criando usuário demo: ${userEmail}`);
      [user] = await db
        .insert(usersTable)
        .values({
          id: faker.string.uuid(),
          email: userEmail,
          name: "Usuário Demo",
          image: "",
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();
    }

    console.log(`✅ Usuário ${userEmail} encontrado/criado.`);

    // --- Processar cada clínica ---
    for (const clinicData of clinicsData) {
      console.log(`\n🏥 Processando clínica: ${clinicData.name}`);

      // Encontrar ou criar clínica
      let clinic = await db.query.clinicsTable.findFirst({
        where: eq(clinicsTable.name, clinicData.name),
      });

      if (!clinic) {
        console.log(`🏗️ Criando clínica: ${clinicData.name}`);
        [clinic] = await db
          .insert(clinicsTable)
          .values({
            name: clinicData.name,
          })
          .returning();
      }

      // Associar usuário à clínica se não estiver associado
      const existingAssociation = await db.query.usersToClinicsTable.findFirst({
        where: eq(usersToClinicsTable.clinicId, clinic.id),
      });

      if (!existingAssociation) {
        console.log(`🔗 Associando usuário à clínica ${clinic.name}`);
        await db.insert(usersToClinicsTable).values({
          userId: user.id,
          clinicId: clinic.id,
        });
      }

      await populateClinicData(clinic);
    }

    console.log(
      "\n🎉 Processo de seed concluído com sucesso para todas as clínicas!",
    );
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao executar o seed:", error);
    process.exit(1);
  }
}

async function populateTransactionCategories(clinicId: string) {
  console.log("📊 Populando categorias de transação...");

  // Verificar se já existem categorias para esta clínica
  const existingCategories =
    await db.query.transactionCategoriesTable.findFirst({
      where: eq(transactionCategoriesTable.clinicId, clinicId),
    });

  if (existingCategories) {
    console.log("✅ Categorias de transação já existem para esta clínica.");
    return;
  }

  // Categorias de RECEITA (income)
  const incomeCategories = [
    "Receita de Consultas",
    "Receita de Tratamentos",
    "Receita de Procedimentos",
  ];

  // Categorias de DESPESA (expense)
  const expenseCategories = [
    "Salários e Encargos",
    "Materiais de Consumo",
    "Equipamentos e Manutenção",
    "Aluguel e Utilidades",
    "Marketing e Publicidade",
    "Impostos e Taxas",
  ];

  // Inserir categorias de receita
  for (const category of incomeCategories) {
    await db.insert(transactionCategoriesTable).values({
      clinicId,
      name: category,
      type: "income",
    });
  }

  // Inserir categorias de despesa
  for (const category of expenseCategories) {
    await db.insert(transactionCategoriesTable).values({
      clinicId,
      name: category,
      type: "expense",
    });
  }

  console.log(
    `✅ ${incomeCategories.length + expenseCategories.length} categorias de transação criadas.`,
  );
}

async function populateClinicData(clinic: { id: string; name: string }) {
  console.log(`📊 Populando dados para ${clinic.name}...`);

  // --- Limpando dados antigos da clínica ---
  console.log("🗑️ Limpando dados antigos da clínica...");
  await db
    .delete(appointmentsTable)
    .where(eq(appointmentsTable.clinicId, clinic.id));

  await db.execute(
    sql`DELETE FROM "patients_anamnesis" WHERE "patient_id" IN (SELECT id FROM patients WHERE clinic_id = ${clinic.id})`,
  );
  await db.execute(
    sql`DELETE FROM "evolution" WHERE "patient_id" IN (SELECT id FROM patients WHERE clinic_id = ${clinic.id})`,
  );

  await db.delete(patientsTable).where(eq(patientsTable.clinicId, clinic.id));
  await db.delete(doctorsTable).where(eq(doctorsTable.clinicId, clinic.id));
  await db
    .delete(transactionCategoriesTable)
    .where(eq(transactionCategoriesTable.clinicId, clinic.id));
  console.log("✅ Dados antigos limpos.");

  // --- Populando categorias de transação ---
  await populateTransactionCategories(clinic.id);

  // --- Gerando Dentistas ---
  const NUM_DENTISTS = 15; // Reduzido para dividir entre as clínicas
  const createdDentists = [];
  console.log(`🦷 Gerando ${NUM_DENTISTS} dentistas para ${clinic.name}...`);
  for (let i = 0; i < NUM_DENTISTS; i++) {
    const [dentist] = await db
      .insert(doctorsTable)
      .values({
        clinicId: clinic.id,
        name: faker.person.fullName(),
        specialty: getRandomItem(dentalSpecialties),
        appointmentPriceInCents: getRandomNumber(100, 500) * 100,
        availableFromWeekDay: 1, // Segunda-feira
        availableToWeekDay: 5, // Sexta-feira
        availableFromTime: "08:00:00",
        availableToTime: "18:00:00",
      })
      .returning();
    createdDentists.push(dentist);
  }
  console.log(
    `✅ ${createdDentists.length} dentistas criados para ${clinic.name}.`,
  );

  // --- Gerando Pacientes ---
  const NUM_PATIENTS = 300; // Reduzido para dividir entre as clínicas
  const createdPatients = [];
  console.log(`👤 Gerando ${NUM_PATIENTS} pacientes para ${clinic.name}...`);
  for (let i = 0; i < NUM_PATIENTS; i++) {
    const sex = getRandomItem(["male", "female"] as const);
    const [patient] = await db
      .insert(patientsTable)
      .values({
        clinicId: clinic.id,
        name: faker.person.fullName({ sex }),
        email: faker.internet.email().toLowerCase(),
        phoneNumber: faker.phone.number({ style: "national" }),
        sex: sex,
        cpf: `${getRandomNumber(100, 999)}.${getRandomNumber(
          100,
          999,
        )}.${getRandomNumber(100, 999)}-${getRandomNumber(10, 99)}`,
        birthDate: faker.date.birthdate({ min: 18, max: 80, mode: "age" }),
      })
      .returning();
    createdPatients.push(patient);
  }
  console.log(
    `✅ ${createdPatients.length} pacientes criados para ${clinic.name}.`,
  );

  // --- Gerando Anamnese e Evolução para os primeiros 100 pacientes ---
  console.log(`📝 Gerando dados de anamnese e evolução para ${clinic.name}...`);
  for (const patient of createdPatients.slice(0, 100)) {
    const randomDoctor = getRandomItem(createdDentists);

    // Criar uma ficha de anamnese mais completa
    await db.insert(patientsAnamnesisTable).values({
      patientId: patient.id,
      doctorId: randomDoctor.id,
      reasonConsultation: faker.lorem.sentence(),
      systemicDiseases: faker.datatype.boolean() ? faker.lorem.words(3) : "",
      medicationUsage: faker.datatype.boolean() ? faker.lorem.words(4) : "",
      allergies: faker.datatype.boolean() ? faker.lorem.words(2) : "",
      previousSurgeries: faker.datatype.boolean()
        ? faker.lorem.sentence(2)
        : "",
      habits: faker.lorem.words(3),
      oralHygiene: "Escova 3x ao dia, usa fio dental.",
      previousDentalProblems: faker.lorem.sentence(3),
      currentTreatment: "",
      familyHistory: faker.lorem.sentence(2),
      mentalConditions: "",
      observations: faker.lorem.sentence(),
      hasAllergies: faker.datatype.boolean(),
      usesMedication: faker.datatype.boolean(),
      hadPreviousSurgeries: faker.datatype.boolean(),
      smokes: faker.datatype.boolean(),
      drinksAlcohol: faker.datatype.boolean(),
      isPregnant: patient.sex === "female" ? faker.datatype.boolean() : false,
      createdAt: faker.date.past({ years: 2 }),
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
  console.log(`✅ Anamnese e evolução criadas para ${clinic.name}.`);

  // --- Gerando Agendamentos ---
  const NUM_APPOINTMENTS = 1000; // Reduzido para dividir entre as clínicas
  console.log(
    `🗓️ Gerando ${NUM_APPOINTMENTS} agendamentos para ${clinic.name}...`,
  );
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
      endDate: dayjs(appointmentDate).add(30, "minutes").toDate(),
      appointmentPriceInCents: randomDoctor.appointmentPriceInCents,
    });
  }
  console.log(
    `✅ ${NUM_APPOINTMENTS} agendamentos criados para ${clinic.name}.`,
  );
  console.log(`🎉 Dados da clínica ${clinic.name} populados com sucesso!`);
}

seed();
