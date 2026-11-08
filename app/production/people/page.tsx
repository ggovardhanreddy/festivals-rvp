import SiteLayout from "@/components/production/SiteLayout";
import SectionHeading from "@/components/production/SectionHeading";
import ContentGrid from "@/components/production/ContentGrid";
import {getPublishedContent} from "@/lib/production/content";
export const revalidate = 60;
export default async function Page(){
 const items=await getPublishedContent("people",100);
 return <SiteLayout><section className="section"><div className="container"><SectionHeading eyebrow="OUR COMMUNITY" title={<> Many families. One community. </>} description="Celebrate the people and contributions that make our village."/><ContentGrid items={items}/></div></section></SiteLayout>;
}
