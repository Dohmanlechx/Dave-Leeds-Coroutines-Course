// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Coroutines Learning Notes',
  tagline: 'David\'s notes from Dave Leeds\' Kotlin Coroutines course',
  favicon: 'img/favicon.ico',

  // Deployed to GitHub Pages as a project site.
  url: 'https://dohmanlechx.github.io',
  baseUrl: '/Dave-Leeds-Coroutines-Course/',
  organizationName: 'Dohmanlechx',
  projectName: 'Dave-Leeds-Coroutines-Course',

  onBrokenLinks: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          routeBasePath: '/', // docs are the site root
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themes: [
    [
      // Offline/local search: builds a lunr index at build time and runs
      // entirely client-side, so it works on GitHub Pages with no external service.
      '@easyops-cn/docusaurus-search-local',
      /** @type {import('@easyops-cn/docusaurus-search-local').PluginOptions} */
      ({
        hashed: true,
        docsRouteBasePath: '/', // docs are the site root
        indexBlog: false,
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        respectPrefersColorScheme: false,
      },
      navbar: {
        title: 'Coroutines Learning Notes',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'tutorialSidebar',
            position: 'left',
            label: 'Notes',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `David's learning notes · Kotlin Coroutines & Concurrency by Dave Leeds (typealias.com)`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['kotlin', 'groovy'],
      },
    }),
};

export default config;
