export type TimeSlot = {
  start: string;
  end: string;
};

export type Member = {
  id: string;
  name: string;
  color: string;
  schedule: {
    id?: number;
    date: string;
    available: boolean;
    timeSlots?: TimeSlot[];
  }[];
};

export type Venue = {
  id: string;
  name: string;
  category: string;
  crowdLevel: "low" | "medium" | "high";
  requiresReservation: boolean;
  indoor: boolean;
  rating: number;
  openingHours: {
    start: string;
    end: string;
  };
};

export type DbSchedule = {
  id: number;
  name: string;
  date: string;
  start_time: string;
  end_time: string;
  user_id: number;
};
