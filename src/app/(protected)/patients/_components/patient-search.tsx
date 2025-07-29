import React, { useState } from "react";

type Patient = {
    id: string;
    name: string;
    email?: string;
};

type PatientSearchProps = {
    patients: Patient[];
};

const PatientSearch: React.FC<PatientSearchProps> = ({ patients }) => {
    const [query, setQuery] = useState("");

    const filteredPatients = patients.filter((patient) =>
        patient.name.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div>
            <input
                type="text"
                placeholder="Buscar paciente..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="border p-2 rounded w-full mb-4"
            />
            <ul>
                {filteredPatients.length === 0 ? (
                    <li>Nenhum paciente encontrado.</li>
                ) : (
                    filteredPatients.map((patient) => (
                        <li key={patient.id} className="py-2 border-b">
                            <strong>{patient.name}</strong>
                            {patient.email && <div className="text-sm text-gray-500">{patient.email}</div>}
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
};

export default PatientSearch;