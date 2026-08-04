import data from "@/content/data/village-heritage.json";

export type VillageHeritagePerson = {
  name: string;
  role: string;
};

export type VillageHeritageData = typeof data;

export function loadVillageHeritage(): VillageHeritageData {
  return data;
}

export function villageHeritageAddressLine(
  address: VillageHeritageData["address"],
): string {
  return [
    address.village,
    address.post,
    `PIN ${address.pincode}`,
    address.mandal,
    address.district,
    address.state,
  ].join(", ");
}
