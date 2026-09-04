export type VerificationStatus =
  | "verified"
  | "needs-verification"
  | "incomplete";

export type RelationshipType = "parent" | "child" | "spouse";

export type Person = {
  id: string;
  fullName: string;
  familyId: string;
  familyBranch: string;
  occupation: string | null;
  location: string | null;
  adapaduchu: boolean;
  deceased: boolean;
  married: boolean;
  verificationStatus: VerificationStatus;
  notes: string | null;
  photo: string | null;
  generation: number;
};

export type Relationship = {
  id: string;
  personId: string;
  relatedPersonId: string;
  relationshipType: RelationshipType;
  verificationStatus: VerificationStatus;
};

export type Family = {
  id: string;
  name: string;
  rootPersonIds: string[];
};

export type FamilyTreeDataset = {
  families: Family[];
  people: Person[];
  relationships: Relationship[];
};

export type SeedPerson = {
  id: string;
  fullName: string;
  occupation?: string | null;
  location?: string | null;
  adapaduchu?: boolean;
  deceased?: boolean;
  married?: boolean;
  verificationStatus?: VerificationStatus;
  notes?: string | null;
  spouses?: SeedPerson[];
  children?: SeedPerson[];
  informationNotYetProvided?: boolean;
};

export type SeedFamily = {
  id: string;
  name: string;
  roots: SeedPerson[];
};
