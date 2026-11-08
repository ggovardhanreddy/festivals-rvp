import SiteLayout from "@/components/production/SiteLayout";
import SectionHeading from "@/components/production/SectionHeading";
import ContentGrid from "@/components/production/ContentGrid";
import {getPublishedContent} from "@/lib/production/content";
export const revalidate = 60;
export default async function Page(){
 const items=await getPublishedContent("gallery",100);
 return <SiteLayout><section className="section"><div className="container"><SectionHeading eyebrow="MOMENTS THAT STAY" title={<> A window into village life. </>} description="Photographs and videos preserve the moments words cannot fully capture."/><ContentGrid items={items}/></div></section></SiteLayout>;
}
