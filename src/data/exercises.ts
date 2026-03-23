export interface Exercise {
  name: string;
  videoUrls: string[];
  notes?: string;
}

export const DAY_1_EXERCISES: Exercise[] = [
  {
    name: "Atsispaudimai",
    videoUrls: ["https://www.youtube.com/shorts/ptvFBAycQy0"],
    notes:
      "Su pilnu, lėtu nusileidimu žemyn. Pakilti nuo kelių ir alkūnes galima šiek tiek labiau atvesti į šonus.",
  },
  {
    name: "Negyvas vabalas",
    videoUrls: ["https://www.youtube.com/watch?v=o4GKiEoYClI"],
  },
  {
    name: "Pec fly rankų suvedimas su hanteliais",
    videoUrls: [
      "https://www.youtube.com/shorts/a9vQ_hwIksU",
      "https://www.youtube.com/shorts/rk8YayRoTRQ",
    ],
  },
  {
    name: "Spaudimas pečiams su hanteliais",
    videoUrls: ["https://www.youtube.com/shorts/FghebqCF_o8"],
  },
  {
    name: "Rankų tiesimas tricepsui",
    videoUrls: ["https://www.youtube.com/shorts/4NWWB0f0vzQ"],
  },
  {
    name: "Step ups",
    videoUrls: ["https://www.youtube.com/shorts/vHbZkqQLuw0"],
  },
  {
    name: "Kojų tiesimas",
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
    name: "Plaukimas",
    videoUrls: ["https://www.youtube.com/shorts/O62CXinmDW0"],
    notes:
      "Atliekame vieną ranką tiesiant, kitą traukiant prie šono, su mažu pasisukimu į sulenktos rankos pusę.",
  },
  {
    name: "Dubens kėlimas",
    videoUrls: ["https://www.youtube.com/shorts/tv9dFw4zPA0"],
    notes: "Su guma ant kelių.",
  },
  {
    name: "Pritūpimai su žingsniu į šoną",
    videoUrls: ["https://www.youtube.com/shorts/IHf66Y_3BKk"],
    notes: "Su guma ant kelių.",
  },
  {
    name: "Prisitraukimai treniruoklyje",
    videoUrls: ["https://www.youtube.com/shorts/WLzut1ZxxTY"],
  },
  {
    name: "Horizontali trauka nugarai su maišu",
    videoUrls: ["https://www.youtube.com/shorts/GYVMUoXtpR4"],
  },
  {
    name: "Atvedimas kojoms į šalis treniruoklyje",
    videoUrls: [
      "https://www.youtube.com/watch?v=9vwOZFBVYjM",
      "https://www.youtube.com/shorts/ExbqB6rOJ98",
    ],
  },
  {
    name: "Pritūpimai treniruoklyje",
    videoUrls: ["https://www.youtube.com/watch?v=eVexZxVN6kc"],
  },
  {
    name: "Dubens kėlimas viena koja",
    videoUrls: [
      "https://www.youtube.com/shorts/GjLaHYQE0C4",
      "https://www.youtube.com/shorts/_i6qpcI1Nw4",
    ],
    notes: "Arba su štanga.",
  },
];

export function getExercisesForDay(day: number): Exercise[] {
  return day === 1 ? DAY_1_EXERCISES : DAY_2_EXERCISES;
}
