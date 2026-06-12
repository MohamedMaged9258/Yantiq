import { defineConfig } from 'vite';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main:         'index.html',
        app:          'src/pages/app.html',
        login:        'src/pages/login.html',
        register:     'src/pages/register.html',
        lesson:       'src/pages/lesson.html',
        pronunciation:'src/pages/pronunciation.html',
        quiz:         'src/pages/quiz.html',
        result:       'src/pages/result.html',
        badges:       'src/pages/badges.html',
        dashboard:    'src/pages/dashboard.html',
        placement:    'src/pages/placement.html',
        settings:     'src/pages/settings.html',
        wordLesson:   'src/pages/word-lesson.html',
        privacy:      'src/pages/privacy.html',
        resetPw:      'src/pages/reset-password.html',
        verifyEmail:  'src/pages/verify-email.html',
      }
    }
  }
});
