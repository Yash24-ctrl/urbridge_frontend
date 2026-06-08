export const COUNSELLOR_SELECTION_KEY = "selectedCounsellor";

export const COUNSELLORS = [
  {
    id: "ravi-shah",
    name: "Ravi Shah",
    email: "neuronetsystems01@gmail.com",
    title: "AI Career Counsellor",
    experience: "5 Years",
    rating: 5,
    stars: "★★★★★",
    initials: "RS",
  },
];

export function findCounsellorByEmail(email) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  return COUNSELLORS.find((counsellor) => counsellor.email.toLowerCase() === normalizedEmail);
}

export function normalizeCounsellorSelection(selection) {
  if (!selection) {
    return COUNSELLORS[0];
  }

  return findCounsellorByEmail(selection.email) || COUNSELLORS[0];
}
