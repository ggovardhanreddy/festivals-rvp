import type { SeedFamily, SeedPerson } from "./types";

const A = true;

function p(
  id: string,
  fullName: string,
  extra: Omit<SeedPerson, "id" | "fullName"> = {},
): SeedPerson {
  return { id, fullName, ...extra };
}

export const FAMILY_SEEDS: SeedFamily[] = [
  {
    id: "GUNDLURU_VENKATA_SUBBA_REDDY",
    name: "Gundluru Venkata Subba Reddy Family",
    roots: [
      p("g-subbareddy", "G Subbareddy", {
        children: [
          p("g-raghunatha-reddy", "G Raghunatha Reddy", {
            spouses: [p("g-padma", "G Padma")],
            children: [
              p("g-santhabushan-reddy", "G Santhabushan Reddy", {
                spouses: [
                  p("g-santhabushan-spouse", "G [Name]", {
                    verificationStatus: "incomplete",
                    notes: "Spouse name was not supplied.",
                  }),
                ],
                children: [
                  p("g-santhabushan-child-1", "G [Name]", { occupation: "Employee" }),
                  p("g-mishritha", "G Mishritha", { adapaduchu: A }),
                ],
              }),
              p("g-ramesh-kumar-reddy", "G Ramesh Kumar Reddy", {
                children: [
                  p("g-sarayu", "G Sarayu", { occupation: "Employee" }),
                  p("g-ramesh-kumar-child-2", "G [Name]", { occupation: "Student" }),
                ],
              }),
              p("g-uma-maheshwar-reddy", "G Uma Maheshwar Reddy", {
                spouses: [p("g-sushma", "G Sushma")],
                children: [
                  p("g-uma-maheshwar-child-1", "G [Name]", { occupation: "Student" }),
                  p("g-uma-maheshwar-child-2", "G [Name]", { occupation: "Student" }),
                ],
              }),
            ],
          }),
          p("g-devendra-reddy", "G Devendra Reddy", {
            spouses: [p("g-sandra-rani", "G Sandra Rani")],
            children: [
              p("g-hemanth-kumar-reddy", "G Hemanth Kumar Reddy", {
                spouses: [p("g-shruthi", "G Shruthi")],
                children: [
                  p("g-nihira", "G Nihira", { occupation: "Student" }),
                  p("g-hemanth-child-2", "G [Name]", { occupation: "Student" }),
                ],
              }),
              p("g-lohitha-reddy", "G Lohitha Reddy", { adapaduchu: A }),
            ],
          }),
          p("g-giridhar-gopal-reddy", "G Giridhar Gopal Reddy", {
            children: [
              p("g-amulya", "G Amulya", { occupation: "Student" }),
              p("g-anusha", "G Anusha", { occupation: "Student" }),
            ],
          }),
        ],
      }),
    ],
  },

  {
    id: "GUNDLURU_KONDA_REDDY",
    name: "Gundluru Konda Reddy Family",
    roots: [
      p("g-koda-reddy", "G Konda Reddy", {
        spouses: [p("thimmulamma", "Thimmulamma")],
        informationNotYetProvided: true,
        notes: "Children not listed under this couple.",
      }),
      p("g-narayana-reddy", "G Narayana Reddy", {
        children: [
          p("g-krishna-reddy", "G Krishna Reddy", {
            spouses: [p("g-krishna-reddy-shanthamma", "Shanthamma")],
            children: [
              p("g-madana-mohan-reddy", "G Madana Mohan Reddy", {
                children: [
                  p("g-madana-mohan-child-1", "G [Name]"),
                  p("g-madana-mohan-child-2", "G [Name]"),
                ],
              }),
              p("g-babu", "G Babu", {
                children: [
                  p("g-bhargavi", "G Bhargavi", { occupation: "Student" }),
                ],
              }),
            ],
          }),
          p("g-vasudeva-reddy", "G Vasudeva Reddy", {
            spouses: [p("padmavathamma", "Padmavathamma")],
            children: [
              p("g-sujana", "G Sujana", { adapaduchu: A }),
              p("g-sujatha", "G Sujatha", { adapaduchu: A }),
            ],
          }),
          p("g-jayachandra-reddy", "G Jayachandra Reddy", {
            spouses: [p("prabhavathamma", "Prabhavathamma")],
            children: [
              p("g-pushyanth-reddy", "G Pushyanth Reddy"),
              p("g-baby-harika", "G Baby Harika", { adapaduchu: A }),
            ],
          }),
          p("g-sahadeva-reddy", "G Sahadeva Reddy", {
            children: [
              p("g-nitesha", "G Nitesha", { adapaduchu: A }),
            ],
          }),
          p("g-ravi-kumar-reddy", "G Ravi Kumar Reddy", {
            spouses: [p("g-ravi-kumar-reddy-shanthamma", "Shanthamma")],
            children: [
              p("g-reddigayathri", "G Reddigayathri", { adapaduchu: A }),
              p("g-harish-kumar-reddy", "G Harish Kumar Reddy", { occupation: "Employee" }),
            ],
          }),
        ],
      }),
      p("g-venkataswami-reddy", "G Venkataswami Reddy", {
        spouses: [p("yashodamma", "Yashodamma")],
        children: [
          p("g-ramadevi", "G Ramadevi", { adapaduchu: A }),
          p("g-dhanunjaya-reddy", "G Dhanunjaya Reddy", {
            spouses: [p("g-dhanunjaya-uma", "Uma")],
            children: [
              p("g-dheeraj-kumar-reddy", "G Dheeraj Kumar Reddy", { occupation: "Employee" }),
              p("g-meghana", "G Meghana", { adapaduchu: A }),
            ],
          }),
          p("g-vijay-kumar-reddy", "G Vijay Kumar Reddy", {
            married: true,
            verificationStatus: "needs-verification",
            notes:
              "The supplied information indicates he is married and has Hema, but the exact relationship/details require verification.",
            children: [
              p("g-pranay-kumar-reddy", "G Pranay Kumar Reddy", { occupation: "Employee" }),
              p("g-akshay-kumar-reddy", "G Akshay Kumar Reddy", { occupation: "Student" }),
            ],
          }),
          p("g-uma-devi", "G Uma Devi", { adapaduchu: A }),
        ],
      }),
      p("g-venkata-ramana-reddy", "G Venkata Ramana Reddy", {
        spouses: [p("g-krishnamma", "G Krishnamma")],
        children: [
          p("g-rana-prathap-reddy", "G Rana Prathap Reddy", {
            spouses: [p("sulochana", "Sulochana")],
            children: [
              p("g-gnaneshwar-reddy", "G Gnaneshwar Reddy", { occupation: "Student" }),
              p("g-rana-prathap-child-2", "G [Name]", { occupation: "Student" }),
            ],
          }),
          p("g-rani", "G Rani", { adapaduchu: A }),
        ],
      }),
      p("g-sivarami-reddy", "G Sivarami Reddy", {
        spouses: [p("g-prameela", "G Prameela")],
        children: [
          p("g-govardhan-reddy", "G Govardhan Reddy", { occupation: "Employee" }),
        ],
      }),
    ],
  },

  {
    id: "KUNCHAPU",
    name: "Kunchapu Family",
    roots: [
      p("k-venkataramana", "K Venkataramana", {
        spouses: [p("kittu", "Kittu")],
        children: [
          p("k-balaji", "K Balaji", {
            children: [
              p("k-harshan-nandan", "K Harshan Nandan", { occupation: "Student" }),
              p("k-balaji-child-2", "K [Name]", { occupation: "Student" }),
            ],
          }),
          p("k-hemalatha", "K Hemalatha", { adapaduchu: A }),
        ],
      }),
      p("k-venkataswami", "K Venkataswami", {
        informationNotYetProvided: true,
        notes: "Spouse/children: Information not yet provided",
      }),
    ],
  },

  {
    id: "KOMMEPALLI",
    name: "Kommepalli Family",
    roots: [
      p("k-pedda-bal-reddy", "K Pedda Bal Reddy", {
        spouses: [p("chinniammi", "Chinniammi")],
        informationNotYetProvided: true,
        notes: "Family information: Information not yet provided",
      }),
      p("k-chinna-bal-reddy", "K Chinna Bal Reddy", {
        spouses: [p("k-chinna-bal-reddy-shanthamma", "Shanthamma")],
        informationNotYetProvided: true,
        notes: "Family information: Information not yet provided",
      }),
      p("k-krishna-reddy", "K Krishna Reddy", {
        spouses: [p("k-rathanamma", "K Rathanamma")],
        children: [
          p("k-venugopal-reddy", "K Venugopal Reddy", { location: "Kuwait" }),
        ],
      }),
    ],
  },

  {
    id: "KUDUM",
    name: "Kudum Family",
    roots: [
      p("k-ramanjulu", "K Ramanjulu", {
        spouses: [p("k-chandrakala", "K Chandrakala")],
        children: [
          p("k-prem-kumar", "K Prem Kumar", { occupation: "Student" }),
        ],
      }),
    ],
  },

  {
    id: "MARIMENI",
    name: "Marimeni Family",
    roots: [
      p("m-krishnaiah", "M Krishnaiah", {
        spouses: [p("saroja", "Saroja")],
        children: [
          p("m-ramesh", "M Ramesh", {
            spouses: [p("m-vijaya", "M Vijaya")],
            children: [
              p("m-vennela", "M Vennela", { occupation: "Student" }),
              p("m-kiranmai", "M Kiranmai", { occupation: "Student" }),
            ],
          }),
          p("m-nagarathna", "M Nagarathna", { adapaduchu: A, deceased: true }),
          p("m-surendra", "M Surendra", {
            children: [
              p("m-sweetie", "M Sweetie", { occupation: "Student" }),
              p("m-surendra-child-2", "M [Name]"),
              p("m-bharath", "M Bharath", { occupation: "Student" }),
              p("m-surendra-child-4", "M [Name]"),
            ],
          }),
          p("m-rajesh", "M Rajesh", {
            spouses: [p("m-praveena", "M Praveena")],
            children: [
              p("m-dithya-sree", "M Dithya Sree", { occupation: "Student" }),
            ],
          }),
        ],
      }),
      p("m-chinnappan", "M Chinnappan", {
        spouses: [p("m-anjinamma", "M Anjinamma")],
        children: [
          p("m-nagaveni", "M Nagaveni", { adapaduchu: A }),
          p("m-nagaraja", "M Nagaraja", {
            married: true,
            deceased: true,
            children: [
              p("m-gnana", "M Gnana", { occupation: "Student" }),
            ],
          }),
          p("m-subbu", "M Subbu", { adapaduchu: A }),
          p("m-geetha", "M Geetha", { adapaduchu: A }),
        ],
      }),
    ],
  },

  {
    id: "DEVAPATLA",
    name: "Devapatla Family",
    roots: [
      p("d-harinatha", "D Harinatha", {
        spouses: [p("d-reddemma", "D Reddemma")],
        children: [
          p("d-shantha-kumar", "D Shantha Kumar", {
            spouses: [
              p("d-shantha-kumar-spouse", "D [Spouse?]", {
                verificationStatus: "needs-verification",
                notes: "Spouse name was supplied as D [Spouse?].",
              }),
            ],
            children: [
              p("d-mokshith", "D Mokshith", { occupation: "Student" }),
              p("d-shantha-kumar-child-2", "D [Name]", { occupation: "Student" }),
            ],
          }),
          p("d-sharanya", "D Sharanya", {
            informationNotYetProvided: true,
            notes: "Additional information: Information not yet provided",
          }),
        ],
      }),
      p("d-manohar", "D Manohar", {
        spouses: [
          p("d-manohar-spouse", "D [Name]", { occupation: "Student" }),
        ],
        children: [
          p("d-manohar-child-1", "D [Name]", { occupation: "Student" }),
          p("d-manohar-child-2", "D [Name]", {
            verificationStatus: "needs-verification",
            notes: "Information not yet provided / relationship requires verification",
          }),
        ],
      }),
      p("d-viswanatha", "D Viswanatha", {
        children: [
          p("d-rukku", "D Rukku", { adapaduchu: A }),
          p("d-radha", "D Radha", { adapaduchu: A }),
        ],
      }),
    ],
  },

  {
    id: "MARIMENI_NADUPANNA",
    name: "Marimeni Nadupanna Family",
    roots: [
      p("m-nadupanna", "M Nadupanna", {
        children: [
          p("m-venkateswar", "M Venkateswar", {
            spouses: [p("m-venkateswar-spouse", "M [Spouse]")],
            children: [
              p("m-mahesh", "M Mahesh"),
              p("m-bhuvanseswari", "M Bhuvanseswari", { occupation: "Student" }),
            ],
          }),
          p("m-chintal", "M Chintal", {
            adapaduchu: A,
            spouses: [p("p-ramana", "P Ramana")],
            children: [
              p("p-tharun", "P Tharun", {
                married: true,
                children: [
                  p("p-tharun-child-1", "P [Name]"),
                  p("p-tharun-child-2", "P [Name]"),
                ],
              }),
              p("p-chintal-child-2", "P [Name]", { married: true }),
            ],
          }),
        ],
      }),
    ],
  },

  {
    id: "DEVAPATLA",
    name: "Devapatla Family",
    roots: [
      p("d-raja-reddy", "D Raja Reddy", {
        spouses: [p("sarojamma", "Sarojamma")],
        children: [
          p("d-venugopal-reddy", "D Venugopal Reddy", {
            spouses: [p("rangamma", "Rangamma")],
            children: [
              p("d-shiva-shankar-reddy", "D Shiva Shankar Reddy", { occupation: "Employee" }),
              p("d-santhosh-kumar-reddy", "D Santhosh Kumar Reddy", { occupation: "Employee" }),
            ],
          }),
        ],
      }),
    ],
  },

  {
    id: "DEVAPATLA",
    name: "Devapatla Family",
    roots: [
      p("d-venkataswami-reddy", "D Venkataswami Reddy", {
        spouses: [p("d-venkataswami-reddemma", "Reddemma")],
        children: [
          p("d-deva-kumar-reddy", "D Deva Kumar Reddy"),
        ],
      }),
    ],
  },

  {
    id: "DEVAPATLA",
    name: "Devapatla Family",
    roots: [
      p("d-chenna-reddy", "D Chenna Reddy", {
        children: [
          p("d-siva-shankar-reddy", "D Siva Shankar Reddy", {
            spouses: [
              p("d-siva-shankar-spouse", "D [Name]", { occupation: "Student" }),
            ],
            children: [
              p("d-siva-shankar-child-1", "D [Name]", { occupation: "Student" }),
              p("d-siva-shankar-child-2", "D [Name]", {
                occupation: "Student",
                verificationStatus: "needs-verification",
                notes: "Student / relationship requires verification",
              }),
            ],
          }),
        ],
      }),
    ],
  },

  {
    id: "DEVAPATLA",
    name: "Devapatla Family",
    roots: [
      p("d-rammohan-reddy", "D Rammohan Reddy", {
        spouses: [p("d-uma-devi", "D Uma Devi")],
        children: [
          p("d-akhil-kumar-reddy", "D Akhil Kumar Reddy", { occupation: "Employee" }),
          p("d-anil-kumar-reddy", "D Anil Kumar Reddy", { occupation: "Employee" }),
        ],
      }),
    ],
  },

  {
    id: "DEVAPATLA",
    name: "Devapatla Family",
    roots: [
      p("d-venkatanarayana", "D Venkatanarayana", {
        informationNotYetProvided: true,
        notes: "Branch listed; spouse/children: Information not yet provided",
      }),
      p("d-lakshanarayana", "D Lakshanarayana", {
        informationNotYetProvided: true,
        notes: "Branch listed; spouse/children: Information not yet provided",
      }),
      p("d-venkataramana-reddy", "D Venkataramana Reddy", {
        informationNotYetProvided: true,
        notes:
          "Distinct from J Venkatramana Reddy and G Venkata Ramana Reddy. The source also listed a 'D Venkataramana / Subbu' heading; that was not merged with M Subbu. Spouse/children: Information not yet provided",
      }),
    ],
  },

  {
    id: "JAGADAM",
    name: "Jagadam Family",
    roots: [
      p("j-raghava-reddy", "J Raghava Reddy", {
        spouses: [p("savathrimma", "Savathrimma")],
        children: [
          p("soubhagya", "Soubhagya", { adapaduchu: A }),
        ],
      }),
      p("j-eswar-reddy", "J Eswar Reddy", {
        children: [
          p("kavitha", "Kavitha", { adapaduchu: A }),
          p("anitha", "Anitha", { adapaduchu: A }),
        ],
      }),
      p("j-krishna-reddy", "J Krishna Reddy", {
        spouses: [p("j-rani", "Rani")],
        children: [
          p("j-niranjan-reddy", "J Niranjan Reddy", {
            spouses: [
              p("j-niranjan-spouse", "J [Name(s) not provided]", {
                verificationStatus: "needs-verification",
              }),
            ],
          }),
          p("j-sravani", "J Sravani", { adapaduchu: A }),
        ],
      }),
      p("j-venkatramana-reddy", "J Venkatramana Reddy", {
        children: [
          p("j-baby", "J Baby", { adapaduchu: A }),
          p("j-anil-kumar-reddy", "J Anil Kumar Reddy", { occupation: "Unemployed" }),
        ],
      }),
      p("j-gopi-reddy", "J Gopi Reddy", {
        informationNotYetProvided: true,
        notes: "Branch listed; spouse/children: Information not yet provided",
      }),
    ],
  },

  {
    id: "JAGILI",
    name: "Jagili Family",
    roots: [
      p("j-chinnareddenna", "J Chinnareddenna", {
        children: [
          p("j-ramesh-kumar", "J Ramesh Kumar", {
            occupation: "Doctor",
            spouses: [
              p("j-ramesh-kumar-spouse", "J [Name]", {
                occupation: "Homemaker/Housewife",
              }),
            ],
            children: [
              p("j-ramesh-kumar-child-1", "J [Name]"),
              p("j-ramesh-kumar-child-2", "J [Name]"),
            ],
          }),
          p("j-shiva", "J Shiva", {
            occupation: "Employee",
            spouses: [
              p("j-jyothi", "J Jyothi", { occupation: "Employee" }),
            ],
            children: [
              p("j-shiva-child-1", "J [Name]"),
              p("j-shiva-child-2", "J [Name]"),
            ],
          }),
        ],
      }),
      p("j-balaji", "J Balaji", {
        informationNotYetProvided: true,
        notes:
          "Listed as the Jagili Balaji branch. Not the same person as K Balaji. Spouse/children: Information not yet provided",
      }),
    ],
  },

  {
    id: "USIRIKAYALA",
    name: "Usirikayala Family",
    roots: [
      p("u-pedda-guruappa", "U Pedda Guruappa", {
        children: [
          p("u-nagendra", "U Nagendra", {
            spouses: [p("u-nagendra-spouse", "U [Name]")],
          }),
          p("u-guru", "U Guru", { occupation: "Employee" }),
        ],
      }),
      p("u-chinna-gurrappa", "U Chinna Gurrappa", {
        children: [
          p("u-gurumahesh", "U Gurumahesh", {
            occupation: "Employee",
            spouses: [p("u-gurumahesh-spouse", "U [Name]")],
          }),
          p("u-nagesh", "U Nagesh", { occupation: "Employee" }),
        ],
      }),
      p("u-adinarayana", "U Adinarayana", {
        spouses: [p("kalavati", "Kalavati")],
        children: [
          p("u-reddemma", "U Reddemma", { adapaduchu: A }),
          p("u-reddy-prasad", "U Reddy Prasad", { occupation: "Doctor" }),
        ],
      }),
    ],
  },

  {
    id: "CHINTHAMANI",
    name: "Chinthamani Family",
    roots: [
      p("c-jayanna", "C Jayanna", {
        spouses: [p("saraswathiamma", "Saraswathiamma")],
        children: [
          p("c-chennakrishnamma", "C Chennakrishnamma", { adapaduchu: A }),
          p("c-ramya-krishna", "C Ramya Krishna", { adapaduchu: A }),
          p("c-harinath", "C Harinath", {
            spouses: [p("mamatha", "Mamatha")],
            children: [
              p("c-thoshan-ram", "C Thoshan Ram"),
              p("c-harinath-child-2", "C [Name]"),
            ],
          }),
          p("c-rama", "C Rama", {
            spouses: [p("c-rama-reddemma", "Reddemma")],
            children: [
              p("c-ganesh-kumar", "C Ganesh Kumar", {
                spouses: [p("c-shyama", "C Shyama")],
                children: [
                  p("c-ganesh-kumar-child-1", "C [Name]"),
                  p("c-bhavesh", "C Bhavesh"),
                ],
              }),
              p("c-avinash", "C Avinash", {
                spouses: [p("saritha", "Saritha")],
                children: [
                  p("c-avinash-child-1", "C [Name]"),
                ],
              }),
            ],
          }),
        ],
      }),
      p("c-raja-gopal", "C Raja Gopal", {
        children: [
          p("c-raja-gopal-rama", "Rama"),
          p("c-anita", "C Anita", { adapaduchu: A }),
          p("c-narendra-kumar-raja-gopal", "C Narendra Kumar", {
            spouses: [p("lakshmi", "Lakshmi")],
            children: [
              p("c-narendra-kumar-raja-gopal-child-1", "C [Name]"),
            ],
          }),
        ],
      }),
      p("c-rammohan", "C Rammohan", {
        informationNotYetProvided: true,
        notes: "Children: Information not yet provided",
      }),
      p("c-ramamurthy", "C Ramamurthy", {
        spouses: [p("bharathi", "Bharathi")],
        children: [
          p("lokesh", "Lokesh", { occupation: "Student" }),
          p("bhavani", "Bhavani", { occupation: "Student" }),
        ],
      }),
      p("c-ramanjulu", "C Ramanjulu", {
        children: [
          p("gnanu", "Gnanu", { occupation: "Employee" }),
          p("narasimha", "Narasimha", { occupation: "Employee" }),
        ],
      }),
      p("c-ramakrishna", "C Ramakrishna", {
        spouses: [p("c-kumari", "C Kumari")],
        children: [
          p("c-narendra-kumar-ramakrishna", "C Narendra Kumar", {
            spouses: [p("sudha-rani", "Sudha Rani")],
            children: [
              p("c-praneeth", "C Praneeth", { occupation: "Student" }),
              p("c-narendra-kumar-ramakrishna-child-2", "C [Name]", { occupation: "Student" }),
            ],
          }),
          p("c-prasanna", "C Prasanna", { adapaduchu: A }),
        ],
      }),
      p("c-suresh-kumar", "C Suresh Kumar", {
        children: [
          p("c-suresh-child-1", "C [Name]", { occupation: "Student" }),
          p("c-nitesh", "C Nitesh", { occupation: "Student" }),
        ],
      }),
    ],
  },

  {
    id: "YERRAGOLLA",
    name: "Yerragolla Family",
    roots: [
      p("y-chandra", "Y Chandra", {
        spouses: [p("y-padmavathamma", "Y Padmavathamma")],
        children: [
          p("y-ramesh", "Y Ramesh", {
            children: [
              p("y-ammulu", "Y Ammulu", { occupation: "Student" }),
              p("y-keerthi", "Y Keerthi", { occupation: "Student" }),
            ],
          }),
          p("y-uma-maheshwar", "Y Uma Maheshwar", {
            children: [
              p("y-yogeswar", "Y Yogeswar"),
              p("y-pavani", "Y Pavani", { occupation: "Student" }),
            ],
          }),
          p("y-chenna-keshavulu", "Y Chenna Keshavulu", {
            spouses: [p("prabhavithi", "Prabhavithi")],
            children: [
              p("y-abhinav-chandra", "Y Abhinav Chandra", { occupation: "Student" }),
            ],
          }),
        ],
      }),
      p("y-suryanarayana", "Y Suryanarayana", {
        spouses: [p("y-sujathamma", "Y Sujathamma")],
        children: [
          p("y-satheesh-kumar", "Y Satheesh Kumar", {
            spouses: [p("amrutha", "Amrutha")],
            children: [
              p("y-pandu", "Y Pandu", { occupation: "Student" }),
              p("y-surya-prakash", "Y Surya Prakash", { occupation: "Student" }),
            ],
          }),
          p("y-naven-kumar", "Y Naven Kumar", {
            spouses: [p("girija", "Girija")],
            children: [
              p("y-rithvik-kumar", "Y Rithvik Kumar", { occupation: "Student" }),
            ],
          }),
          p("y-krishnamohan", "Y Krishnamohan", {
            married: true,
            informationNotYetProvided: true,
            notes: "Spouse/children: Information not yet provided",
          }),
        ],
      }),
    ],
  },

  {
    id: "GOUNIPALLI",
    name: "Gounipalli Family",
    roots: [
      p("gounipalli-chandra", "Gounipalli Chandra", {
        spouses: [p("gounipalli-chinnakka", "Chinnakka")],
        children: [
          p("ravanamma", "Gounipalli Ravanamma", {
            adapaduchu: A,
            spouses: [p("c-ramanjulu", "C Ramanjulu")],
            children: [
              p("gnanu", "Gnanu"),
              p("narasimha", "Narasimha"),
            ],
          }),
          p("gounipalli-ramesh", "Gounipalli Ramesh", {
            spouses: [p("gounipalli-chenna-krishnamma", "Chenna Krishnamma")],
            children: [
              p("hansika", "Hansika", { occupation: "Student" }),
              p("jaswanth", "Jaswanth", { occupation: "Student" }),
            ],
          }),
          p("gounipalli-raja", "Gounipalli Raja", {
            spouses: [
              p("gounipalli-meenakshi", "Meenakshi", { deceased: true }),
              p("gounipalli-vijaya", "Vijaya"),
            ],
            children: [
              p("harshitha", "Harshitha", { occupation: "Student" }),
              p("jaswytha", "Jaswytha", { occupation: "Student" }),
              p("locksmith-krishna", "Locksmith Krishna", { occupation: "Student" }),
            ],
          }),
        ],
      }),
    ],
  },
];
