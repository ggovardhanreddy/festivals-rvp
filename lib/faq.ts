import {
  OFFICIAL_TITLE,
  SITE_NAME,
  VILLAGE_ALSO_KNOWN_AS,
  VILLAGE_NAME,
} from "./site";

/** Static FAQ for JSON-LD + optional UI reuse. */
export const SITE_FAQS = [
  {
    question: `What is ${VILLAGE_ALSO_KNOWN_AS}?`,
    answer: `${VILLAGE_ALSO_KNOWN_AS} (${VILLAGE_NAME}) is a village under ${OFFICIAL_TITLE} in Sambepalle (Sambepalli) Mandal, YSR Kadapa (Annamayya) District, Andhra Pradesh. This site is its official digital home, stewarded by ${SITE_NAME}.`,
  },
  {
    question: "Where can I find festival photos and videos?",
    answer:
      "Open Gallery for festival-first browsing, or Events & Birthdays for upcoming celebrations. Year archives are under Annual Archive.",
  },
  {
    question: "How do I contact the village / RVP Youth?",
    answer:
      "Use the Contact page to open an email to the community inbox, or visit the village address and Ramalayam map linked there.",
  },
  {
    question: "How are member photos and birthdays used?",
    answer:
      "Member listings celebrate the community. See the Privacy Policy for what is published and how to request changes.",
  },
  {
    question: "రెడ్డివారిపల్లి అంటే ఏమిటి?",
    answer: `${VILLAGE_ALSO_KNOWN_AS} (${VILLAGE_NAME}) సంబేపల్లి మండలం, వై.ఎస్.ఆర్ కడప (అన్నమయ్య) జిల్లా, ఆంధ్రప్రదేశ్‌లోని గ్రామం. ఈ సైట్ ${SITE_NAME} సంరక్షణలో గ్రామ అధికారిక డిజిటల్ గృహం — పండుగలు, సభ్యులు, గ్యాలరీ, వారసత్వం.`,
  },
] as const;
