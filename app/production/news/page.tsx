import SiteLayout from "@/components/production/SiteLayout";
import SectionHeading from "@/components/production/SectionHeading";
import ContentGrid from "@/components/production/ContentGrid";
import {getPublishedContent} from "@/lib/production/content";
export const revalidate = 60;
export default async function Page(){
 const items=await getPublishedContent("news",100);
 return <SiteLayout><section className="section"><div className="container"><SectionHeading eyebrow="FROM THE VILLAGE" title={<> News & community updates. </>} description="Announcements, stories, events and updates from Reddivaripalli."/><ContentGrid items={items}/></div></section></SiteLayout>;
}
