import { getSiteUrl } from "../lib/seo";

export async function getServerSideProps({ res }) {
  const siteUrl = getSiteUrl();

  const robots = `User-agent: *
Allow: /
Disallow: /watchList
Disallow: /favorites
Disallow: /history
Disallow: /profile
Disallow: /buddies
Disallow: /rooms
Disallow: /recommended

Sitemap: ${siteUrl}/sitemap.xml
`;

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "public, s-maxage=86400, stale-while-revalidate");
  res.write(robots);
  res.end();

  return { props: {} };
}

export default function RobotsTxt() {
  return null;
}
