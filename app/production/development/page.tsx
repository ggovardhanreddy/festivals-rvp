import SiteLayout from "@/components/production/SiteLayout";
import SectionHeading from "@/components/production/SectionHeading";
import ContentGrid from "@/components/production/ContentGrid";
import {getPublishedContent} from "@/lib/production/content";
export const revalidate = 60;
export default async function Page(){
 const items=await getPublishedContent("development",100);
 return <SiteLayout><section className="section"><div className="container"><SectionHeading eyebrow="BUILDING TOMORROW" title={<> Progress through community action. </>} description="Follow verified initiatives, milestones and community priorities."/><ContentGrid items={items}/></div></section></SiteLayout>;
}
