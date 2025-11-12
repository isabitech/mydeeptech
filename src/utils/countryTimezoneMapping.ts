// Mapping of African countries to their primary timezones
export const countryTimezoneMapping: Record<string, string> = {
  // West Africa Time (WAT) - UTC+1
  algeria: "Africa/Algiers",
  angola: "Africa/Luanda",
  benin: "Africa/Porto-Novo",
  cameroon: "Africa/Douala",
  central_african_republic: "Africa/Bangui",
  chad: "Africa/Ndjamena",
  democratic_republic_of_congo: "Africa/Kinshasa",
  equatorial_guinea: "Africa/Malabo",
  gabon: "Africa/Libreville",
  niger: "Africa/Niamey",
  nigeria: "Africa/Lagos",
  republic_of_the_congo: "Africa/Brazzaville",
  tunisia: "Africa/Tunis",

  // Greenwich Mean Time (GMT) - UTC+0
  burkina_faso: "Africa/Ouagadougou",
  gambia: "Africa/Banjul",
  ghana: "Africa/Accra",
  guinea: "Africa/Conakry",
  guinea_bissau: "Africa/Bissau",
  ivory_coast: "Africa/Abidjan",
  liberia: "Africa/Monrovia",
  mali: "Africa/Bamako",
  mauritania: "Africa/Nouakchott",
  morocco: "Africa/Casablanca",
  senegal: "Africa/Dakar",
  sierra_leone: "Africa/Freetown",
  togo: "Africa/Lome",

  // Central Africa Time (CAT) - UTC+2
  botswana: "Africa/Gaborone",
  burundi: "Africa/Bujumbura",
  malawi: "Africa/Blantyre",
  mozambique: "Africa/Maputo",
  namibia: "Africa/Windhoek",
  rwanda: "Africa/Kigali",
  south_africa: "Africa/Johannesburg",
  eswatini: "Africa/Mbabane",
  zambia: "Africa/Lusaka",
  zimbabwe: "Africa/Harare",

  // East Africa Time (EAT) - UTC+3
  comoros: "Indian/Comoro",
  djibouti: "Africa/Djibouti",
  eritrea: "Africa/Asmara",
  ethiopia: "Africa/Addis_Ababa",
  kenya: "Africa/Nairobi",
  madagascar: "Indian/Antananarivo",
  mauritius: "Indian/Mauritius",
  seychelles: "Indian/Mahe",
  somalia: "Africa/Mogadishu",
  south_sudan: "Africa/Juba",
  sudan: "Africa/Khartoum",
  tanzania: "Africa/Dar_es_Salaam",
  uganda: "Africa/Kampala",

  // Egypt Time (EET) - UTC+2
  egypt: "Africa/Cairo",

  // Libya Time (EET) - UTC+2
  libya: "Africa/Tripoli",

  // Cape Verde Time (CVT) - UTC-1
  cape_verde: "Atlantic/Cape_Verde",

  // Sao Tome Time (GMT) - UTC+0
  sao_tome_and_principe: "Africa/Sao_Tome",

  // Lesotho Time (SAST) - UTC+2
  lesotho: "Africa/Maseru",
};

// Function to get timezone from country
export const getTimezoneByCountry = (countryValue: string): string | undefined => {
  return countryTimezoneMapping[countryValue];
};

// Function to get timezone display name
export const getTimezoneDisplayName = (timezone: string): string => {
  const timezoneNames: Record<string, string> = {
    "Africa/Algiers": "West Africa Time (WAT) - UTC+1",
    "Africa/Lagos": "West Africa Time (WAT) - UTC+1",
    "Africa/Douala": "West Africa Time (WAT) - UTC+1",
    "Africa/Luanda": "West Africa Time (WAT) - UTC+1",
    "Africa/Porto-Novo": "West Africa Time (WAT) - UTC+1",
    "Africa/Bangui": "West Africa Time (WAT) - UTC+1",
    "Africa/Ndjamena": "West Africa Time (WAT) - UTC+1",
    "Africa/Kinshasa": "West Africa Time (WAT) - UTC+1",
    "Africa/Malabo": "West Africa Time (WAT) - UTC+1",
    "Africa/Libreville": "West Africa Time (WAT) - UTC+1",
    "Africa/Niamey": "West Africa Time (WAT) - UTC+1",
    "Africa/Brazzaville": "West Africa Time (WAT) - UTC+1",
    "Africa/Tunis": "Central European Time (CET) - UTC+1",

    "Africa/Ouagadougou": "Greenwich Mean Time (GMT) - UTC+0",
    "Africa/Banjul": "Greenwich Mean Time (GMT) - UTC+0",
    "Africa/Accra": "Greenwich Mean Time (GMT) - UTC+0",
    "Africa/Conakry": "Greenwich Mean Time (GMT) - UTC+0",
    "Africa/Bissau": "Greenwich Mean Time (GMT) - UTC+0",
    "Africa/Abidjan": "Greenwich Mean Time (GMT) - UTC+0",
    "Africa/Monrovia": "Greenwich Mean Time (GMT) - UTC+0",
    "Africa/Bamako": "Greenwich Mean Time (GMT) - UTC+0",
    "Africa/Nouakchott": "Greenwich Mean Time (GMT) - UTC+0",
    "Africa/Casablanca": "Western European Time (WET) - UTC+0",
    "Africa/Dakar": "Greenwich Mean Time (GMT) - UTC+0",
    "Africa/Freetown": "Greenwich Mean Time (GMT) - UTC+0",
    "Africa/Lome": "Greenwich Mean Time (GMT) - UTC+0",
    "Africa/Sao_Tome": "Greenwich Mean Time (GMT) - UTC+0",

    "Africa/Gaborone": "Central Africa Time (CAT) - UTC+2",
    "Africa/Bujumbura": "Central Africa Time (CAT) - UTC+2",
    "Africa/Blantyre": "Central Africa Time (CAT) - UTC+2",
    "Africa/Maputo": "Central Africa Time (CAT) - UTC+2",
    "Africa/Windhoek": "West Africa Time (WAT) - UTC+1",
    "Africa/Kigali": "Central Africa Time (CAT) - UTC+2",
    "Africa/Johannesburg": "South Africa Standard Time (SAST) - UTC+2",
    "Africa/Mbabane": "South Africa Standard Time (SAST) - UTC+2",
    "Africa/Lusaka": "Central Africa Time (CAT) - UTC+2",
    "Africa/Harare": "Central Africa Time (CAT) - UTC+2",
    "Africa/Maseru": "South Africa Standard Time (SAST) - UTC+2",

    "Indian/Comoro": "East Africa Time (EAT) - UTC+3",
    "Africa/Djibouti": "East Africa Time (EAT) - UTC+3",
    "Africa/Asmara": "East Africa Time (EAT) - UTC+3",
    "Africa/Addis_Ababa": "East Africa Time (EAT) - UTC+3",
    "Africa/Nairobi": "East Africa Time (EAT) - UTC+3",
    "Indian/Antananarivo": "East Africa Time (EAT) - UTC+3",
    "Indian/Mauritius": "Mauritius Time (MUT) - UTC+4",
    "Indian/Mahe": "Seychelles Time (SCT) - UTC+4",
    "Africa/Mogadishu": "East Africa Time (EAT) - UTC+3",
    "Africa/Juba": "East Africa Time (EAT) - UTC+3",
    "Africa/Khartoum": "Central Africa Time (CAT) - UTC+2",
    "Africa/Dar_es_Salaam": "East Africa Time (EAT) - UTC+3",
    "Africa/Kampala": "East Africa Time (EAT) - UTC+3",

    "Africa/Cairo": "Eastern European Time (EET) - UTC+2",
    "Africa/Tripoli": "Eastern European Time (EET) - UTC+2",

    "Atlantic/Cape_Verde": "Cape Verde Time (CVT) - UTC-1",
  };

  return timezoneNames[timezone] || timezone;
};

export default countryTimezoneMapping;