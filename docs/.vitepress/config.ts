import { defineConfig } from 'vitepress'

export default defineConfig({
  base: '/quran-muaalem/',
  locales: {
    root: {
      label: 'العربية',
      link: '/',
      lang: 'ar',
      title: 'المعلّم القرآني',
      description: 'توثيق مشروع المعلم القرآني وأدوات quran-transcript',
      themeConfig: {
        nav: [
          { text: 'البدء', link: '/getting-started' },
          { text: 'المعلّم القرآني', link: '/muaalem/' },
          { text: 'Quran Transcript', link: '/quran-transcript/' },
          { text: 'النموذج', link: '/model/' },
          { text: 'المسار الصوتي', link: '/pipeline/' },
          { text: 'التدريب', link: '/training/' },
          { text: 'المطور', link: '/dev/' },
          { text: 'الملحق', link: '/appendix/' },
        ],
        sidebar: [
          {
            text: 'البدء',
            link: '/getting-started',
          },
          {
            text: 'المعلّم القرآني',
            items: [
              { text: 'نظرة عامة', link: '/muaalem/' },
              { text: 'واجهة Gradio', link: '/muaalem/gradio-ui' },
              { text: 'واجهة بايثون', link: '/muaalem/python-api' },
              { text: 'المخرجات', link: '/muaalem/output' },
            ],
          },
          {
            text: 'النموذج والمعمارية',
            items: [
              { text: 'نظرة عامة', link: '/model/' },
              { text: 'المعمارية', link: '/model/architecture' },
              { text: 'الأوزان والصيغة', link: '/model/weights' },
            ],
          },
          {
            text: 'مسار الرسم الصوتي',
            items: [
              { text: 'نظرة عامة', link: '/pipeline/' },
              { text: 'خصائص المصحف', link: '/pipeline/moshaf-attributes' },
            ],
          },
          {
            text: 'Quran Transcript',
            items: [
              { text: 'نظرة عامة', link: '/quran-transcript/' },
              { text: 'التثبيت', link: '/quran-transcript/installation' },
              { text: 'الاستخدام', link: '/quran-transcript/usage' },
              { text: 'الرسم الصوتي', link: '/quran-transcript/phonetics' },
              { text: 'الأدوات', link: '/quran-transcript/tools' },
            ],
          },
          {
            text: 'البيانات والتدريب',
            items: [
              { text: 'نظرة عامة', link: '/training/' },
              { text: 'مصادر البيانات', link: '/training/data-sources' },
              { text: 'خطوات المسار', link: '/training/pipeline' },
              { text: 'التقييم والقياسات', link: '/training/evaluation' },
            ],
          },
          {
            text: 'للمطورين',
            items: [
              { text: 'نظرة عامة', link: '/dev/' },
              { text: 'الاختبارات', link: '/dev/tests' },
              { text: 'المساهمة', link: '/dev/contributing' },
            ],
          },
          {
            text: 'الملحق',
            items: [
              { text: 'الورقة العلمية', link: '/appendix/paper' },
              { text: 'الترخيص', link: '/appendix/license' },
              { text: 'الأسئلة الشائعة', link: '/appendix/faq' },
            ],
          },
        ],
        outlineTitle: 'على هذه الصفحة',
      },
    },
    en: {
      label: 'English',
      link: '/en/',
      lang: 'en',
      title: 'Quran Muaalem',
      description: 'Docs for the Quran Muaalem model and the quran-transcript toolkit',
      themeConfig: {
        nav: [
          { text: 'Getting Started', link: '/en/getting-started' },
          { text: 'Quran Muaalem', link: '/en/muaalem/' },
          { text: 'Quran Transcript', link: '/en/quran-transcript/' },
          { text: 'Model', link: '/en/model/' },
          { text: 'Pipeline', link: '/en/pipeline/' },
          { text: 'Training', link: '/en/training/' },
          { text: 'Developer', link: '/en/dev/' },
          { text: 'Appendix', link: '/en/appendix/' },
        ],
        sidebar: [
          {
            text: 'Getting Started',
            link: '/en/getting-started',
          },
          {
            text: 'Quran Muaalem',
            items: [
              { text: 'Overview', link: '/en/muaalem/' },
              { text: 'Gradio UI', link: '/en/muaalem/gradio-ui' },
              { text: 'Python API', link: '/en/muaalem/python-api' },
              { text: 'Outputs', link: '/en/muaalem/output' },
            ],
          },
          {
            text: 'Model and Architecture',
            items: [
              { text: 'Overview', link: '/en/model/' },
              { text: 'Architecture', link: '/en/model/architecture' },
              { text: 'Weights and Dtype', link: '/en/model/weights' },
            ],
          },
          {
            text: 'Phonetic Pipeline',
            items: [
              { text: 'Overview', link: '/en/pipeline/' },
              { text: 'Moshaf Attributes', link: '/en/pipeline/moshaf-attributes' },
            ],
          },
          {
            text: 'Quran Transcript',
            items: [
              { text: 'Overview', link: '/en/quran-transcript/' },
              { text: 'Installation', link: '/en/quran-transcript/installation' },
              { text: 'Usage', link: '/en/quran-transcript/usage' },
              { text: 'Phonetics', link: '/en/quran-transcript/phonetics' },
              { text: 'Tools', link: '/en/quran-transcript/tools' },
            ],
          },
          {
            text: 'Training and Data',
            items: [
              { text: 'Overview', link: '/en/training/' },
              { text: 'Data Sources', link: '/en/training/data-sources' },
              { text: 'Pipeline Steps', link: '/en/training/pipeline' },
              { text: 'Evaluation and Metrics', link: '/en/training/evaluation' },
            ],
          },
          {
            text: 'Developer',
            items: [
              { text: 'Overview', link: '/en/dev/' },
              { text: 'Tests', link: '/en/dev/tests' },
              { text: 'Contributing', link: '/en/dev/contributing' },
            ],
          },
          {
            text: 'Appendix',
            items: [
              { text: 'Paper', link: '/en/appendix/paper' },
              { text: 'License', link: '/en/appendix/license' },
              { text: 'FAQ', link: '/en/appendix/faq' },
            ],
          },
        ],
      },
    },
  },
  themeConfig: {
    socialLinks: [
      { icon: 'github', link: 'https://github.com/obadx/quran-muaalem' },
    ],
  },
})
