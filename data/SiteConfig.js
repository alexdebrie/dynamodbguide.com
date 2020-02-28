module.exports = {
  lessonsDir: "lessons", // The name of the directory that contains lessons or docs.
  siteTitle: "DynamoDB, explained.", // Site title.
  siteTitleAlt: "A Primer on DynamoDB", // Alternative site title for SEO.
  siteLogo: "/logos/dynamodb.svg", // Logo used for SEO and manifest.
  siteUrl: "https://www.dynamodbguide.com", // Domain of your website without pathPrefix.
  pathPrefix: "/", // Prefixes all links. For cases when deployed to example.github.io/gatsby-advanced-starter/.
  siteDescription: "A Primer on the DynamoDB NoSQL database.", // Website description used for RSS feeds/meta description tag.
  siteRss: "/rss.xml", // Path to the RSS file.
//  siteFBAppID: "1825356251115265", // FB Application ID for using app insights
  googleAnalyticsID: "UA-111332094-1", // GA tracking ID.
  disqusShortname: "dynamodbguide", // Disqus shortname.
  postDefaultCategoryID: "Tech", // Default category for posts.
  // Links to social profiles/projects you want to display in the author segment/navigation bar.
  userName: "Alex DeBrie",
  userLinks: [
    {
      label: "GitHub",
      url: "https://github.com/alexdebrie",
      iconClassName: "fa fa-github"
    },
    {
      label: "Twitter",
      url: "https://twitter.com/alexbdebrie",
      iconClassName: "fa fa-twitter"
    },
    {
      label: "Email",
      url: "mailto:alexdebrie1@gmail.com",
      iconClassName: "fa fa-envelope"
    },
  ],
  copyright: "Copyright © 2018. Alex DeBrie", // Copyright string for the footer of the website and RSS feed.
  themeColor: "#c62828", // Used for setting manifest and progress theme colors.
  backgroundColor: "#e0e0e0", // Used for setting manifest background color.
  // TODO: Move this literally anywhere better.
  toCChapters: ["", "Introduction", "Single-Item Actions", "Multi-Item Actions", "Advanced Topics", "Operations", "Data Modeling Examples", "Additional Concepts", "Comparisons", "Resources"] // Used to generate the Table Of Contents. Index 0 should be blank.
};
