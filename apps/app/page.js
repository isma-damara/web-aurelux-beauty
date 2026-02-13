import HomePage from "./home/home-page";
import { readContent } from "../lib/content-repository";

export const dynamic = "force-dynamic";

export default async function Page() {
  const content = await readContent();
  return <HomePage content={content} />;
}
