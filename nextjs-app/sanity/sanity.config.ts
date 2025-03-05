import { defineConfig } from 'sanity'
import { deskTool } from 'sanity/desk'
import { visionTool } from '@sanity/vision'
import { presentationTool } from 'sanity/presentation'
import post from './schemas/post'  // Direct import
import videoEmbed from './schemas/videoEmbeds'  // Direct import

export default defineConfig({
  projectId: 'p9w7i98p',
  dataset: 'production-data',
  basePath: '/studio',
  plugins: [
    deskTool(),
    visionTool(),
    presentationTool({
      previewUrl: {
        draftMode: {
          enable: '/api/preview',
        },
        origin: 'http://localhost:3000',
      },
    }),
  ],
  schema: {
    types: [post, videoEmbed],  // Direct references
  },
  cors: {
    allowedOrigins: [
      'https://doityourself.bot',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3333',
      'http://localhost:4000',
    ],
  },
})