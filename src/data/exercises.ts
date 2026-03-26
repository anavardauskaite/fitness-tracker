export interface Exercise {
  name: string;
  videoUrls: string[];
  notes?: string;
  repsOnly?: boolean;
}

export const DAY_1_EXERCISES: Exercise[] = [
  {
    name: "Push ups",
    videoUrls: ["https://www.youtube.com/shorts/ptvFBAycQy0"],
    notes:
      "Su pilnu, lėtu nusileidimu žemyn. Pakilti nuo kelių ir alkūnes galima šiek tiek labiau atvesti į šonus.",
    repsOnly: true,
  },
  {
    name: "Dead bug",
    videoUrls: ["https://www.youtube.com/watch?v=o4GKiEoYClI"],
  },
  {
    name: "Pec Fly (dumbbell)",
    videoUrls: [
      "https://www.youtube.com/shorts/a9vQ_hwIksU",
      "https://www.youtube.com/shorts/rk8YayRoTRQ",
    ],
  },
  {
    name: "Shoulder press (dumbbell)",
    videoUrls: ["https://www.youtube.com/shorts/FghebqCF_o8"],
  },
  {
    name: "Cable Triceps Extension",
    videoUrls: ["https://www.youtube.com/shorts/4NWWB0f0vzQ"],
  },
  {
    name: "Step ups",
    videoUrls: ["https://www.youtube.com/shorts/vHbZkqQLuw0"],
  },
  {
    name: "Leg extension",
    videoUrls: ["https://youtube.com/shorts/uM86QE59Tgc"],
  },
  {
    name: "Leg press",
    videoUrls: ["https://www.youtube.com/shorts/EotSw18oR9w"],
  },
];

export const DAY_2_EXERCISES: Exercise[] = [
  {
    name: "Superman",
    videoUrls: ["https://www.youtube.com/shorts/bEKj1qsoPTY"],
  },
  {
    name: "Lat Pulldown (on stomach)",
    videoUrls: ["https://www.youtube.com/shorts/O62CXinmDW0"],
  },
  {
    name: "Glute bridge",
    videoUrls: ["https://www.youtube.com/shorts/tv9dFw4zPA0"],
    notes: "With resistant band on knees.",
    repsOnly: true,
  },
  {
    name: "Squat Step Outs",
    videoUrls: ["https://www.youtube.com/shorts/IHf66Y_3BKk"],
    notes: "With resistant band on knees.",
    repsOnly: true,
  },
  {
    name: "Assisted pull up",
    videoUrls: ["https://www.youtube.com/shorts/WLzut1ZxxTY"],
  },
  {
    name: "Sandbag Row",
    videoUrls: ["https://www.youtube.com/shorts/GYVMUoXtpR4"],
  },
  {
    name: "Hip Abduction",
    videoUrls: [
      "https://www.youtube.com/watch?v=9vwOZFBVYjM",
      "https://www.youtube.com/shorts/ExbqB6rOJ98",
    ],
  },
  {
    name: "Hack Squat",
    videoUrls: ["https://www.youtube.com/watch?v=eVexZxVN6kc"],
  },
  {
    name: "Single Leg Hip Thrust",
    videoUrls: [
      "https://www.youtube.com/shorts/GjLaHYQE0C4",
      "https://www.youtube.com/shorts/_i6qpcI1Nw4",
    ],
    repsOnly: true,
  },
];

export function getExercisesForDay(day: number): Exercise[] {
  return day === 1 ? DAY_1_EXERCISES : DAY_2_EXERCISES;
}
