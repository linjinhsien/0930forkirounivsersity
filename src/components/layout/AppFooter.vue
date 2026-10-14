<template>
  <footer class="border-t border-gray-200 bg-white">
    <div
      class="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
    >
      <p>{{ t('footer.tagline') }}</p>
      <div class="flex flex-wrap gap-x-4 gap-y-1">
        <RouterLink to="/settings" class="hover:text-blue-700 hover:underline">{{
          t('app.settings')
        }}</RouterLink>
        <a
          href="https://github.com/linjinhsien/0930forkirounivsersity/issues/new"
          class="hover:text-blue-700 hover:underline"
        >
          {{ t('footer.feedback') }}
        </a>
        <span>{{ t('footer.version') }}</span>
        <span>{{ t('footer.trademark') }}</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>
