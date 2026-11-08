import Header from "@/components/production/Header";
import Footer from "@/components/production/Footer";
export default function SiteLayout({children}:{children:React.ReactNode}){return <><Header/><main>{children}</main><Footer/></>}
