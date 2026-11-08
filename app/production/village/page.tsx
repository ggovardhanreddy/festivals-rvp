import SiteLayout from "@/components/production/SiteLayout";
import SectionHeading from "@/components/production/SectionHeading";
import ContentGrid from "@/components/production/ContentGrid";
import {getPublishedContent} from "@/lib/production/content";
export const revalidate = 60;
export default async function Page(){
 const items=await getPublishedContent("village",100);
 return <SiteLayout><section className="section"><div className="container"><SectionHeading eyebrow="OUR VILLAGE" title={<> A place to belong. </>} description="Discover the landscape, everyday life and identity of Reddivaripalli."/><ContentGrid items={items}/></div></section></SiteLayout>;
}
