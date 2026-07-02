import Head from "next/head";
import {
  buildCanonicalUrl,
  buildPageTitle,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  SITE_NAME,
  truncateMeta,
} from "../lib/seo";

export function SeoHead({
  title,
  description,
  canonicalPath,
  ogType = "website",
  ogImage,
  noindex = false,
  jsonLd,
  keywords,
}) {
  const pageTitle = buildPageTitle(title);
  const metaDescription = truncateMeta(description);
  const canonical = buildCanonicalUrl(canonicalPath);

  return (
    <Head>
      <title>{pageTitle}</title>
      <meta name="description" content={metaDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-image-preview:large" />
      )}
      <link rel="canonical" href={canonical} />

      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      {ogImage && <meta property="og:image" content={ogImage} />}
      {ogImage && <meta property="og:image:alt" content={title || SITE_NAME} />}

      <meta name="twitter:card" content={ogImage ? "summary_large_image" : "summary"} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}

      {jsonLd && (
        <>
          {(Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((schema) => (
            <script
              key={schema["@type"]}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
            />
          ))}
        </>
      )}
    </Head>
  );
}

export function DefaultSeoHead() {
  return (
    <SeoHead
      title="Discover Movies & TV Shows"
      description={DEFAULT_DESCRIPTION}
      canonicalPath="/home"
      keywords={DEFAULT_KEYWORDS}
    />
  );
}
