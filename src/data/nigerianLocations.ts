export interface LocationArea {
  label: string;
  value: string;
}

export interface NigerianCity {
  label: string;
  value: string;
  state: string;
  areas: LocationArea[];
}

export const nigerianCities: NigerianCity[] = [
  // ─── FCT ABUJA ───
  {
    label: "Abuja (FCT)",
    value: "abuja",
    state: "FCT",
    areas: [
      { label: "Asokoro", value: "asokoro" },
      { label: "Maitama", value: "maitama" },
      { label: "Wuse 2", value: "wuse-2" },
      { label: "Wuse", value: "wuse" },
      { label: "Garki", value: "garki" },
      { label: "Gwarinpa", value: "gwarinpa" },
      { label: "Jabi", value: "jabi" },
      { label: "Kado", value: "kado" },
      { label: "Lugbe", value: "lugbe" },
      { label: "Kubwa", value: "kubwa" },
      { label: "Lokogoma", value: "lokogoma" },
      { label: "Apo", value: "apo" },
      { label: "Durumi", value: "durumi" },
      { label: "Kaura", value: "kaura" },
      { label: "Nbora", value: "nbora" },
      { label: "Nyanya", value: "nyanya" },
      { label: "Karu", value: "karu" },
      { label: "Katampe", value: "katampe" },
      { label: "Dawaki", value: "dawaki" },
    ],
  },

  // ─── LAGOS ───
  {
    label: "Lagos",
    value: "lagos",
    state: "Lagos",
    areas: [
      { label: "Victoria Island", value: "victoria-island" },
      { label: "Ikoyi", value: "ikoyi" },
      { label: "Lekki Phase 1", value: "lekki-phase-1" },
      { label: "Lekki", value: "lekki" },
      { label: "Banana Island", value: "banana-island" },
      { label: "Eko Atlantic", value: "eko-atlantic" },
      { label: "Surulere", value: "surulere" },
      { label: "Yaba", value: "yaba" },
      { label: "Ikeja", value: "ikeja" },
      { label: "Ikeja GRA", value: "ikeja-gra" },
      { label: "Maryland", value: "maryland" },
      { label: "Ajah", value: "ajah" },
      { label: "Abraham Adesanya", value: "abraham-adesanya" },
      { label: "Sangotedo", value: "sangotedo" },
      { label: "Chevron", value: "chevron" },
      { label: "Osapa London", value: "osapa" },
      { label: "Gbagada", value: "gbagada" },
      { label: "Magodo", value: "magodo" },
      { label: "Ojodu Berger", value: "ojodu" },
      { label: "Ogba", value: "ogba" },
      { label: "Agege", value: "agege" },
      { label: "Mushin", value: "mushin" },
      { label: "Oshodi", value: "oshodi" },
      { label: "Alimosho", value: "alimosho" },
      { label: "Epe", value: "epe" },
      { label: "Ibeju-Lekki", value: "ibeju-lekki" },
      { label: "Badagry", value: "badagry" },
    ],
  },

  // ─── PORT HARCOURT / RIVERS ───
  {
    label: "Port Harcourt (Rivers)",
    value: "port-harcourt",
    state: "Rivers",
    areas: [
      { label: "GRA Phase 1", value: "gra-phase-1" },
      { label: "GRA Phase 2", value: "gra-phase-2" },
      { label: "GRA Phase 3", value: "gra-phase-3" },
      { label: "Old GRA", value: "old-gra" },
      { label: "New GRA", value: "new-gra" },
      { label: "Rumuola", value: "rumuola" },
      { label: "Rumuodara", value: "rumuodara" },
      { label: "Rumuigbo", value: "rumuigbo" },
      { label: "Rumueme", value: "rumueme" },
      { label: "Diobu", value: "diobu" },
      { label: "Trans Amadi", value: "trans-amadi" },
      { label: "Borikiri", value: "borikiri" },
      { label: "Woji", value: "woji" },
      { label: "Peter Odili", value: "peter-odili" },
      { label: "Eliozu", value: "eliozu" },
      { label: "Obio-Akpor", value: "obio-akpor" },
    ],
  },

  // ─── KANO ───
  {
    label: "Kano",
    value: "kano",
    state: "Kano",
    areas: [
      { label: "Nassarawa GRA", value: "nassarawa-gra" },
      { label: "Bompai", value: "bompai" },
      { label: "Sabon Gari", value: "sabon-gari" },
      { label: "Fagge", value: "fagge" },
      { label: "Gwale", value: "gwale" },
      { label: "Tarauni", value: "tarauni" },
      { label: "Kumbotso", value: "kumbotso" },
      { label: "Sharada", value: "sharada" },
    ],
  },

  // ─── IBADAN / OYO ───
  {
    label: "Ibadan (Oyo)",
    value: "ibadan",
    state: "Oyo",
    areas: [
      { label: "Bodija", value: "bodija" },
      { label: "Oluyole Estate", value: "oluyole" },
      { label: "Ring Road", value: "ring-road" },
      { label: "Agodi GRA", value: "agodi-gra" },
      { label: "Jericho GRA", value: "jericho-gra" },
      { label: "Challenge", value: "challenge" },
      { label: "Iyaganku GRA", value: "iyaganku-gra" },
      { label: "Dugbe", value: "dugbe" },
      { label: "Agege Road", value: "agege-road" },
      { label: "Moniya", value: "moniya" },
    ],
  },

  // ─── ENUGU ───
  {
    label: "Enugu",
    value: "enugu",
    state: "Enugu",
    areas: [
      { label: "GRA", value: "enugu-gra" },
      { label: "Independence Layout", value: "independence-layout" },
      { label: "Trans Ekulu", value: "trans-ekulu" },
      { label: "Abakpa Nike", value: "abakpa" },
      { label: "New Haven", value: "new-haven" },
      { label: "Achara Layout", value: "achara-layout" },
    ],
  },

  // ─── BENIN CITY / EDO ───
  {
    label: "Benin City (Edo)",
    value: "benin-city",
    state: "Edo",
    areas: [
      { label: "GRA", value: "benin-gra" },
      { label: "Ugbor", value: "ugbor" },
      { label: "Oba Market Road", value: "oba-market" },
      { label: "Sapele Road", value: "sapele-road" },
      { label: "Upper Siluko", value: "upper-siluko" },
    ],
  },

  // ─── KADUNA ───
  {
    label: "Kaduna",
    value: "kaduna",
    state: "Kaduna",
    areas: [
      { label: "GRA", value: "kaduna-gra" },
      { label: "Malali", value: "malali" },
      { label: "Barnawa", value: "barnawa" },
      { label: "Television", value: "television" },
      { label: "Sabon Tasha", value: "sabon-tasha" },
    ],
  },

  // ─── DELTA / ASABA ───
  {
    label: "Asaba (Delta)",
    value: "asaba",
    state: "Delta",
    areas: [
      { label: "GRA", value: "asaba-gra" },
      { label: "Cable Point", value: "cable-point" },
      { label: "Nnebisi Road", value: "nnebisi-road" },
      { label: "Okpanam Road", value: "okpanam-road" },
    ],
  },

  // ─── ANAMBRA / AWKA ───
  {
    label: "Awka (Anambra)",
    value: "awka",
    state: "Anambra",
    areas: [
      { label: "GRA", value: "awka-gra" },
      { label: "Amawbia", value: "amawbia" },
      { label: "Ifite", value: "ifite" },
      { label: "Aroma", value: "aroma" },
    ],
  },

  // ─── IMO / OWERRI ───
  {
    label: "Owerri (Imo)",
    value: "owerri",
    state: "Imo",
    areas: [
      { label: "GRA", value: "owerri-gra" },
      { label: "New Owerri", value: "new-owerri" },
      { label: "Ikenegbu", value: "ikenegbu" },
      { label: "Aladinma", value: "aladinma" },
    ],
  },

  // ─── CROSS RIVER / CALABAR ───
  {
    label: "Calabar (Cross River)",
    value: "calabar",
    state: "Cross River",
    areas: [
      { label: "GRA", value: "calabar-gra" },
      { label: "Calabar South", value: "calabar-south" },
      { label: "Satellite Town", value: "satellite-town-calabar" },
      { label: "State Housing", value: "state-housing-calabar" },
    ],
  },

  // ─── BAYELSA / YENAGOA ───
  {
    label: "Yenagoa (Bayelsa)",
    value: "yenagoa",
    state: "Bayelsa",
    areas: [
      { label: "Swali", value: "swali" },
      { label: "Onopa", value: "onopa" },
      { label: "Ekeki", value: "ekeki" },
      { label: "Opolo", value: "opolo" },
    ],
  },

  // ─── ABIA / UMUAHIA ───
  {
    label: "Umuahia (Abia)",
    value: "umuahia",
    state: "Abia",
    areas: [
      { label: "GRA", value: "umuahia-gra" },
      { label: "Ibeku", value: "ibeku" },
      { label: "Ubani", value: "ubani" },
    ],
  },

  // ─── NASSARAWA ───
  {
    label: "Lafia (Nassarawa)",
    value: "lafia",
    state: "Nassarawa",
    areas: [
      { label: "GRA", value: "lafia-gra" },
      { label: "Lafia Township", value: "lafia-township" },
    ],
  },
];

// Flatten all areas for quick lookup by city value
export const getAreasForCity = (cityValue: string): LocationArea[] => {
  const city = nigerianCities.find((c) => c.value === cityValue);
  return city ? city.areas : [];
};
