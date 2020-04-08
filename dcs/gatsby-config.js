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
  'Orquestra Data Management': {
    url: 'https://www.orquestra.io/docs/data',
    description:
      'Manage the entirety of your workflow\'s output data and seamlessly build rich plots.'
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
  pathPrefix: '/dcs',
  plugins: [
    {
      resolve: 'gatsby-theme-apollo-docs',
      options: {
        navConfig,
        footerNavConfig,
        root: __dirname,
        baseUrl: 'https://www.orquestra.io/docs',
        siteName: 'Orquestra Docs',
        pageTitle: 'Orquestra Platform',
        subtitle: 'Data Management',
        menuTitle: 'Orquestra Platform',
        description: 'A guide to Orquestra\'s data management',
        githubRepo: 'zapatacomputing/orquestra-docs/dcs',
        twitterHandle: 'ZapataComputing', 
        sidebarCategories: {
          null: ['index'],
          'Data': [
            'data/artifacts',
            'data/taskdataobjects',
          ],
          'Data Management': [
            'data/correlation',
            'data/aggregation',
          ],
          'Fetching Data': [
            'data/json',
          ],
        }
      }
    },
    {
      resolve: 'gatsby-plugin-catch-links'
    }
  ]
};
