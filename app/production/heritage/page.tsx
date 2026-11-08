import SiteLayout from "@/components/production/SiteLayout";
import SectionHeading from "@/components/production/SectionHeading";
import ContentGrid from "@/components/production/ContentGrid";
import {getPublishedContent} from "@/lib/production/content";
export const revalidate = 60;
export default async function Page(){
 const items=await getPublishedContent("heritage",100);
 return <SiteLayout><section className="section"><div className="container"><SectionHeading eyebrow="OUR ROOTS" title={<> A heritage carried through generations. </>} description="Explore the stories, records and memories that shape our village."/><ContentGrid items={items}/></div></section></SiteLayout>;
}
