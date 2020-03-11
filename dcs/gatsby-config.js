const navConfig = {
  'Orquestra Basics': {
    url: 'https://www.orquestra.io/docs',
    description:
      'Learn about each part of the Orquestra platform and how they all work together.',
    omitLandingPage: true
  },
  'Orquestra Quantum Engine': {
    url: 'https://www.orquestra.io/docs/qe',
    description:
      'Submit workflows to a production-ready workflow management system.'
  },
  'Orquestra Data Correlation Service': {
    url: 'https://www.orquestra.io/docs/dcs',
    description:
      'Manage the entirety of your workflows output data and seamlessly build rich plots.'
  },
};

const footerNavConfig = {
  Blog: {
    href: 'https://www.zapatacomputing.com/blog/',
    target: '_blank',
    rel: 'noopener noreferrer'
  },
  Contribute: {
    href: 'https://www.orquestra.io/docs/community/'
  },
  Events: {
    href: 'https://www.zapatacomputing.com/events/',
    target: '_blank',
    rel: 'noopener noreferrer'
  }
};


module.exports = {
  pathPrefix: '/docs/dcs',
  plugins: [
    {
      resolve: 'gatsby-theme-apollo-docs',
      options: {
        navConfig,
        footerNavConfig,
        root: __dirname,
        siteName: 'Orquestra Docs',
        pageTitle: 'Orquestra Platform',
        subtitle: 'Data Correlation',
        menuTitle: 'Orquestra Platform',
        description: 'A guide to using the Orquestra Data Correlation Service',
        githubRepo: 'zapatacomputing/orquestra-docs',
        twitterHandle: 'ZapataComputing', 
        sidebarCategories: {
          null: ['index','data/why-artifacts'],
          'Data Management': [
            'data/correlation',
            'data/aggregation',
          ],
          'Fetching Data': [
            'data/json',
          ],
        }
      }
    }
  ]
};
