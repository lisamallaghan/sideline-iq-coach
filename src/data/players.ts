import type { Player } from "@/types";

export const MOCK_PLAYERS: Player[] = [
  { id: "p1", name: "Aoife Byrne", number: 1, position: "GK" },
  { id: "p2", name: "Ciara Nolan", number: 2, position: "FB" },
  { id: "p3", name: "Emma Doyle", number: 3, position: "FB" },
  { id: "p4", name: "Sinead Walsh", number: 4, position: "FB" },
  { id: "p5", name: "Niamh Kelly", number: 5, position: "HB" },
  { id: "p6", name: "Roisin Murphy", number: 6, position: "HB", isCaptain: true },
  { id: "p7", name: "Grace O'Connor", number: 7, position: "HB" },
  { id: "p8", name: "Sarah Hughes", number: 8, position: "MF" },
  { id: "p9", name: "Laura Fitzgerald", number: 9, position: "MF" },
  { id: "p10", name: "Katie Ryan", number: 10, position: "HF" },
  { id: "p11", name: "Orla Brennan", number: 11, position: "HF" },
  { id: "p12", name: "Megan Clarke", number: 12, position: "HF" },
  { id: "p13", name: "Hannah Lynch", number: 13, position: "FF" },
  { id: "p14", name: "Ellen Farrell", number: 14, position: "CF" },
  { id: "p15", name: "Aisling Kavanagh", number: 15, position: "FF" },
  { id: "p16", name: "Chloe Redmond", number: 16, position: "GK" },
  { id: "p17", name: "Amy Sheridan", number: 17, position: "HB" },
  { id: "p18", name: "Rachel Dunne", number: 18, position: "MF" },
  { id: "p19", name: "Leah Cummins", number: 19, position: "HF" },
  { id: "p20", name: "Beth Gallagher", number: 20, position: "FF" },
];

export const STARTING_XV = MOCK_PLAYERS.slice(0, 15).map((p) => p.id);
export const BENCH = MOCK_PLAYERS.slice(15).map((p) => p.id);