import SiteLayout from "@/components/production/SiteLayout";
import SectionHeading from "@/components/production/SectionHeading";
import ContentGrid from "@/components/production/ContentGrid";
import {getPublishedContent} from "@/lib/production/content";
export const revalidate = 60;
export default async function Page(){
 const items=await getPublishedContent("temples",100);
 return <SiteLayout><section className="section"><div className="container"><SectionHeading eyebrow="FAITH & TRADITION" title={<> Places that hold our devotion. </>} description="Discover village temples, sacred places and their traditions."/><ContentGrid items={items}/></div></section></SiteLayout>;
}
