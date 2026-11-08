import SiteLayout from "@/components/production/SiteLayout";
import SectionHeading from "@/components/production/SectionHeading";
import ContentGrid from "@/components/production/ContentGrid";
import {getPublishedContent} from "@/lib/production/content";
export const revalidate = 60;
export default async function Page(){
 const items=await getPublishedContent("festivals",100);
 return <SiteLayout><section className="section"><div className="container"><SectionHeading eyebrow="CELEBRATING TOGETHER" title={<> Our festivals. Our shared memories. </>} description="Explore the celebrations and traditions that bring families together."/><ContentGrid items={items}/></div></section></SiteLayout>;
}
