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
  Events: {
    href: 'https://www.zapatacomputing.com/events/',
    target: '_blank',
    rel: 'noopener noreferrer'
  }
};


module.exports = {
  pathPrefix: '/docs',
  plugins: [
    {
      resolve: 'gatsby-theme-apollo-docs',
      options: {
        navConfig,
        footerNavConfig,
        root: __dirname,
        siteName: 'Orquestra Docs',
        pageTitle: 'Orquestra Platform',
        subtitle: 'Basics',
        menuTitle: 'Orquestra Platform',
        description: 'how to use the orquestra platform',
        githubRepo: 'zapatacomputing/orquestra-docs',
        baseDir: 'intro',
        twitterHandle: 'ZapataComputing',
        logoLink: 'https://www.orquestra.io/docs/',
        sidebarCategories: {
          null: ['index','basics/platform','basics/why-workflows', 'basics/glossary'],
          Tutorial: ['tutorial/helloworkflow','tutorial/hydrogen-vqe','tutorial/qcbm', 'tutorial/qaoa', 'tutorial/lstm' ],
          Resources: ['quantum-resources/interfaces', 'quantum-resources/variational_loop'],
        }
      }
    }
  ]
};
