import { randomUUID } from "crypto";
import dayjs from "dayjs";

import { db } from ".";
import {
  appointmentsTable,
  clinicsTable,
  doctorsTable,
  patientsTable,
  usersTable,
  usersToClinicsTable,
} from "./schema";
import { dentalSpecialties } from "@/constants/dental-specialties";

async function seed() {
  try {
    // Criar usuário demo
    const [user] = await db
      .insert(usersTable)
      .values({
        id: randomUUID(),
        name: "Usuário Demo",
        email: "demo@doutordigital.com",
        emailVerified: true,
        plan: "essential",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Criar clínica demo
    const [clinic] = await db
      .insert(clinicsTable)
      .values({
        id: randomUUID(),
        name: "Clínica Odontológica Demo",
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Relacionar usuário com clínica
    await db.insert(usersToClinicsTable).values({
      userId: user.id,
      clinicId: clinic.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Criar dentistas demo
    const dentists = [
      {
        name: "Dra. Ana Silva",
        specialty: "Ortodontia",
        appointmentPriceInCents: 25000, // R$ 250,00
      },
      {
        name: "Dr. Carlos Santos",
        specialty: "Implantodontia",
        appointmentPriceInCents: 35000, // R$ 350,00
      },
      {
        name: "Dra. Marina Oliveira",
        specialty: "Endodontia",
        appointmentPriceInCents: 30000, // R$ 300,00
      },
    ];

    const createdDentists = await Promise.all(
      dentists.map(async (dentist) => {
        const [created] = await db
          .insert(doctorsTable)
          .values({
            id: randomUUID(),
            clinicId: clinic.id,
            name: dentist.name,
            specialty: dentist.specialty,
            appointmentPriceInCents: dentist.appointmentPriceInCents,
            availableFromWeekDay: 1, // Segunda
            availableToWeekDay: 5, // Sexta
            availableFromTime: "09:00:00",
            availableToTime: "18:00:00",
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        return created;
      }),
    );

    // Criar pacientes demo
    const patients = [
      {
        name: "João Pereira",
        email: "joao@email.com",
        phone: "(11) 98765-4321",
      },
      {
        name: "Maria Costa",
        email: "maria@email.com",
        phone: "(11) 98765-4322",
      },
      {
        name: "Pedro Santos",
        email: "pedro@email.com",
        phone: "(11) 98765-4323",
      },
      {
        name: "Lucia Ferreira",
        email: "lucia@email.com",
        phone: "(11) 98765-4324",
      },
    ];

    const createdPatients = await Promise.all(
      patients.map(async (patient) => {
        const [created] = await db
          .insert(patientsTable)
          .values({
            id: randomUUID(),
            clinicId: clinic.id,
            name: patient.name,
            email: patient.email,
            phone: patient.phone,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();
        return created;
      }),
    );

    // Criar alguns agendamentos demo
    const appointments = [
      {
        doctorId: createdDentists[0].id,
        patientId: createdPatients[0].id,
        date: dayjs().add(1, "day").hour(10).minute(0).second(0).toDate(),
        appointmentPriceInCents: createdDentists[0].appointmentPriceInCents,
      },
      {
        doctorId: createdDentists[1].id,
        patientId: createdPatients[1].id,
        date: dayjs().add(2, "day").hour(14).minute(30).second(0).toDate(),
        appointmentPriceInCents: createdDentists[1].appointmentPriceInCents,
      },
      {
        doctorId: createdDentists[2].id,
        patientId: createdPatients[2].id,
        date: dayjs().add(3, "day").hour(16).minute(0).second(0).toDate(),
        appointmentPriceInCents: createdDentists[2].appointmentPriceInCents,
      },
    ];

    await Promise.all(
      appointments.map(async (appointment) => {
        await db.insert(appointmentsTable).values({
          id: randomUUID(),
          clinicId: clinic.id,
          ...appointment,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }),
    );

    console.log("✅ Seed concluído com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao executar seed:", error);
    process.exit(1);
  }
}

seed();
