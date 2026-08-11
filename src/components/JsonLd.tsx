import { SITE_NAME, SITE_URL } from "@/lib/site";

type SocialLink = { href: string };

export function JsonLdPerson({
  email,
  socialLinks,
}: {
  email: string;
  socialLinks: SocialLink[];
}) {
  const sameAs = socialLinks.map((l) => l.href).filter(Boolean);
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: "Nicolas Ayala",
        alternateName: "Nico Ayala",
        url: SITE_URL,
        email,
        jobTitle: "Graphic and interface designer",
        worksFor: {
          "@type": "Organization",
          name: SITE_NAME,
        },
        sameAs,
      },
      {
        "@type": "ProfessionalService",
        "@id": `${SITE_URL}/#service`,
        name: SITE_NAME,
        url: SITE_URL,
        image: `${SITE_URL}/opengraph-image`,
        areaServed: {
          "@type": "Country",
          name: "Argentina",
        },
        founder: { "@id": `${SITE_URL}/#person` },
        provider: { "@id": `${SITE_URL}/#person` },
        serviceType: [
          "Graphic design",
          "Interface design",
          "Brand identity",
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
