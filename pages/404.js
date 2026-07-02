import { SeoHead } from "../components/SeoHead";

export default function Custom404() {
  return (
    <>
      <SeoHead
        title="Page Not Found"
        description="The page you are looking for does not exist. Browse trending movies and TV shows on Bombe."
        canonicalPath="/404"
        noindex
      />
      <div className="text-center pt-24 text-textprimary">
        <h1 className="text-2xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-md">Oops! The page you’re looking for doesn’t exist.</p>
      </div>
    </>
  );
}
