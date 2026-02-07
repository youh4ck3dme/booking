import React from 'react';

interface SEOProps {
  title: string;
  description: string;
  name?: string;
  type?: string;
}

export const SEO: React.FC<SEOProps> = ({ title, description, name, type }) => {
  return (
    <React.Fragment>
      {/* Standard metadata tags */}
      <title>{title}</title>
      <meta name='description' content={description} />
      
      {/* End standard metadata tags */}
      
      {/* Facebook tags */}
      <meta property="og:type" content={type || "website"} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      {/* End Facebook tags */}
      
      {/* Twitter tags */}
      <meta name="twitter:creator" content={name || "BookFlow"} />
      <meta name="twitter:card" content={type || "summary_large_image"} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {/* End Twitter tags */}

      {/* JSON-LD for Schema.org */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Service",
          "name": title,
          "description": description,
          "provider": {
            "@type": "LocalBusiness",
            "name": "BookFlow Business"
          }
        })}
      </script>
    </React.Fragment>
  );
};
