// aviationstack-mock.ts
// Mock local pour simuler l'API Aviationstack quand le quota est dépassé
// Utilisation : importer ce module à la place de l'appel réel en dev/test

export type FlightStatus = {
  flight_date: string;
  flight_status: string;
  departure: {
    airport: string;
    scheduled: string;
  };
  arrival: {
    airport: string;
    scheduled: string;
  };
  airline: {
    name: string;
  };
  flight: {
    number: string;
  };
};

export async function fetchFlightStatusMock(
  flightNumber: string
): Promise<FlightStatus> {
  // Simule une réponse typique de l'API Aviationstack
  return {
    flight_date: '2026-03-20',
    flight_status: 'scheduled',
    departure: {
      airport: 'YUL',
      scheduled: '2026-03-20T14:00:00-04:00',
    },
    arrival: {
      airport: 'CDG',
      scheduled: '2026-03-21T02:00:00+01:00',
    },
    airline: {
      name: 'Air France',
    },
    flight: {
      number: flightNumber,
    },
  };
}

// Pour l'intégration :
// if (process.env.AVIATIONSTACK_API_KEY === 'mock' || quotaDepasse) {
//   await fetchFlightStatusMock('AF347')
// } else {
//   // appel réel à l'API
// }
