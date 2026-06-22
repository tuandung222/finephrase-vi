import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const config: Config = {
  title: 'FinePhrase VI',
  tagline: 'Bản dịch tiếng Việt "FinePhrase: The Synthetic Data Playbook: Generating Trillions of the Finest Tokens" của HuggingFace',
  favicon: 'img/logo.svg',

  // Set the production url of your site here
  url: 'https://tuandung222.github.io',
  // Set the /<projectName>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/finephrase-vi/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'tuandung222', // Usually your GitHub org/user name.
  projectName: 'finephrase-vi', // Usually your repo name.

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'vi',
    locales: ['vi'],
  },

  future: {
    v4: true,
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themes: ['@docusaurus/theme-mermaid'],

  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
      type: 'text/css',
      integrity:
        'sha384-n8MVdqiI7+t84GBSAlkZFP3qxmcArtr2WwHXYQJ90R9xg1f1TXEipb_mAGPge5yG',
      crossorigin: 'anonymous',
    },
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/logo.svg',
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'FinePhrase VI',
      logo: {
        alt: 'FinePhrase Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Playbook',
        },
        {
          href: 'https://github.com/tuandung222/finephrase-vi',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Mục lục',
          items: [
            {
              label: '1. Giới thiệu',
              to: '/docs/gioi_thieu',
            },
            {
              label: '2. Thiết lập',
              to: '/docs/thiet_lap',
            },
            {
              label: '3. Thí nghiệm',
              to: '/docs/thi_nghiem',
            },
            {
              label: '4. Phân tích',
              to: '/docs/phan_tich',
            },
          ],
        },
        {
          title: 'Chi tiết',
          items: [
            {
              label: '5. Hạ tầng',
              to: '/docs/ha_tang',
            },
            {
              label: '6. Mô hình FinePhrase',
              to: '/docs/finephrase',
            },
            {
              label: '7. Kết luận',
              to: '/docs/ket_luan',
            },
            {
              label: '8. Phụ lục',
              to: '/docs/phu_luc',
            },
          ],
        },
        {
          title: 'Cộng đồng',
          items: [
            {
              label: 'Hugging Face Space',
              href: 'https://huggingface.co/spaces/HuggingFaceFW/finephrase',
            },
            {
              label: 'GitHub Repository',
              href: 'https://github.com/tuandung222/finephrase-vi',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} FinePhrase VI. Bản dịch tiếng Việt từ Hugging Face.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['python', 'bash', 'json', 'yaml'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
