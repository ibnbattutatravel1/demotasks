#!/usr/bin/env node

/**
 * Initialize upload directories for Docker deployment
 * This script creates all necessary upload subdirectories
 * Run this on container startup to ensure directories exist
 */

const fs = require('fs')
const path = require('path')

const UPLOADS_BASE = path.join(process.cwd(), 'public', 'uploads')

const directories = [
  UPLOADS_BASE,
  path.join(UPLOADS_BASE, 'avatars'),
  path.join(UPLOADS_BASE, 'attachments'),
  path.join(UPLOADS_BASE, 'projects'),
  path.join(UPLOADS_BASE, 'communities'),
  path.join(UPLOADS_BASE, 'questionnaires'),
]

console.log('🚀 Initializing upload directories...')

directories.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
    console.log(`✅ Created: ${dir}`)
  } else {
    console.log(`✓ Exists: ${dir}`)
  }
})

console.log('✅ Upload directories initialized successfully!')
