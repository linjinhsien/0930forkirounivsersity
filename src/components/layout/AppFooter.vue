<template>
  <footer class="border-t border-gray-200 bg-white">
    <div
      class="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-sm text-gray-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8"
    >
      <p>Learn Azure fundamentals, one architecture at a time.</p>
      <div class="flex flex-wrap gap-x-4 gap-y-1">
        <RouterLink to="/settings" class="hover:text-blue-700 hover:underline">Settings</RouterLink>
        <a
          href="https://github.com/linjinhsien/0930forkirounivsersity/issues/new"
          class="hover:text-blue-700 hover:underline"
        >
          Feedback
        </a>
        <span>Version 1.0</span>
        <span>Azure is a trademark of Microsoft Corporation.</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
