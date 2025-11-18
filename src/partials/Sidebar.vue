<template>
  <div class="min-w-fit">
    <!-- Sidebar backdrop (mobile only) -->
    <div
      class="fixed inset-0 bg-gray-900/30 z-40 lg:hidden lg:z-auto transition-opacity duration-200"
      :class="sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'"
      aria-hidden="true"
    ></div>

    <!-- Sidebar -->
    <div
      id="sidebar"
      ref="sidebar"
      class="flex lg:flex! flex-col absolute z-40 left-0 top-0 lg:static lg:left-auto lg:top-auto lg:translate-x-0 h-[100dvh] overflow-y-scroll lg:overflow-y-auto no-scrollbar w-64 lg:w-20 lg:sidebar-expanded:!w-64 2xl:w-64! shrink-0 bg-gradient-to-b from-slate-900 to-slate-800 dark:from-gray-900 dark:to-gray-800 p-4 transition-all duration-200 ease-in-out shadow-xl"
      :class="sidebarOpen ? 'translate-x-0' : '-translate-x-64'"
    >
      <!-- Sidebar header -->
      <div class="flex justify-between mb-10 pr-3 sm:px-2">
        <!-- Close button -->
        <button
          ref="trigger"
          class="lg:hidden text-gray-400 hover:text-white transition-colors"
          @click.stop="$emit('close-sidebar')"
          aria-controls="sidebar"
          :aria-expanded="sidebarOpen"
        >
          <span class="sr-only">Close sidebar</span>
          <svg
            class="w-6 h-6 fill-current"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.7 18.7l1.4-1.4L7.8 13H20v-2H7.8l4.3-4.3-1.4-1.4L4 12z"
            />
          </svg>
        </button>

        <!-- Logo -->
        <router-link class="block" to="/">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg"
            >
              <svg
                class="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
                />
              </svg>
            </div>
            <span
              class="text-xl font-bold text-white lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200"
            >
              AquaGuard
            </span>
          </div>
        </router-link>
      </div>

      <!-- Links -->
      <div class="space-y-8">
        <!-- Main Navigation -->
        <div>
          <h3 class="text-xs uppercase text-gray-400 font-semibold pl-3 mb-3">
            <span
              class="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6"
              aria-hidden="true"
              >•••</span
            >
            <span class="lg:hidden lg:sidebar-expanded:block 2xl:block"
              >Main Menu</span
            >
          </h3>
          <ul class="mt-3 space-y-1">
            <!-- Dashboard -->
            <router-link
              to="/"
              custom
              v-slot="{ href, navigate, isExactActive }"
            >
              <li
                class="px-3 py-2 rounded-lg mb-0.5 last:mb-0 transition-all duration-200"
                :class="
                  isExactActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/10 shadow-md'
                    : 'hover:bg-white/5'
                "
              >
                <a
                  class="block text-gray-100 truncate transition"
                  :href="href"
                  @click="navigate"
                >
                  <div class="flex items-center">
                    <svg
                      class="shrink-0 w-5 h-5"
                      :class="isExactActive ? 'text-blue-400' : 'text-gray-400'"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"
                      />
                    </svg>
                    <span
                      class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200"
                    >
                      Dashboard
                    </span>
                  </div>
                </a>
              </li>
            </router-link>

            <!-- Locations -->
            <router-link
              to="/locations"
              custom
              v-slot="{ href, navigate, isActive }"
            >
              <li
                class="px-3 py-2 rounded-lg mb-0.5 last:mb-0 transition-all duration-200"
                :class="
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/10 shadow-md'
                    : 'hover:bg-white/5'
                "
              >
                <a
                  class="block text-gray-100 truncate transition"
                  :href="href"
                  @click="navigate"
                >
                  <div class="flex items-center">
                    <svg
                      class="shrink-0 w-5 h-5"
                      :class="isActive ? 'text-blue-400' : 'text-gray-400'"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                      />
                    </svg>
                    <span
                      class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200"
                    >
                      Locations
                    </span>
                  </div>
                </a>
              </li>
            </router-link>

            <!-- Samples -->
            <router-link
              to="/samples"
              custom
              v-slot="{ href, navigate, isActive }"
            >
              <li
                class="px-3 py-2 rounded-lg mb-0.5 last:mb-0 transition-all duration-200"
                :class="
                  isActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/10 shadow-md'
                    : 'hover:bg-white/5'
                "
              >
                <a
                  class="block text-gray-100 truncate transition"
                  :href="href"
                  @click="navigate"
                >
                  <div class="flex items-center">
                    <svg
                      class="shrink-0 w-5 h-5"
                      :class="isActive ? 'text-blue-400' : 'text-gray-400'"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M7 2v2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-1V2h-2v2H9V2H7zm0 6h10v10H7V8z"
                      />
                    </svg>
                    <span
                      class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200"
                    >
                      Water Samples
                    </span>
                  </div>
                </a>
              </li>
            </router-link>

            <!-- Analysis -->
            <router-link
              to="/analysis"
              custom
              v-slot="{ href, navigate, isExactActive }"
            >
              <li
                class="px-3 py-2 rounded-lg mb-0.5 last:mb-0 transition-all duration-200"
                :class="
                  isExactActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/10 shadow-md'
                    : 'hover:bg-white/5'
                "
              >
                <a
                  class="block text-gray-100 truncate transition"
                  :href="href"
                  @click="navigate"
                >
                  <div class="flex items-center">
                    <svg
                      class="shrink-0 w-5 h-5"
                      :class="isExactActive ? 'text-blue-400' : 'text-gray-400'"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"
                      />
                    </svg>
                    <span
                      class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200"
                    >
                      WQI Analysis
                    </span>
                  </div>
                </a>
              </li>
            </router-link>

            <!-- Reports -->
            <router-link
              to="/reports"
              custom
              v-slot="{ href, navigate, isExactActive }"
            >
              <li
                class="px-3 py-2 rounded-lg mb-0.5 last:mb-0 transition-all duration-200"
                :class="
                  isExactActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/10 shadow-md'
                    : 'hover:bg-white/5'
                "
              >
                <a
                  class="block text-gray-100 truncate transition"
                  :href="href"
                  @click="navigate"
                >
                  <div class="flex items-center">
                    <svg
                      class="shrink-0 w-5 h-5"
                      :class="isExactActive ? 'text-blue-400' : 'text-gray-400'"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"
                      />
                    </svg>
                    <span
                      class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200"
                    >
                      Reports
                    </span>
                  </div>
                </a>
              </li>
            </router-link>

            <!-- Alerts -->
            <router-link
              to="/alerts"
              custom
              v-slot="{ href, navigate, isExactActive }"
            >
              <li
                class="px-3 py-2 rounded-lg mb-0.5 last:mb-0 transition-all duration-200"
                :class="
                  isExactActive
                    ? 'bg-gradient-to-r from-blue-500/20 to-violet-500/10 shadow-md'
                    : 'hover:bg-white/5'
                "
              >
                <a
                  class="block text-gray-100 truncate transition"
                  :href="href"
                  @click="navigate"
                >
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <svg
                        class="shrink-0 w-5 h-5"
                        :class="
                          isExactActive ? 'text-blue-400' : 'text-gray-400'
                        "
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
                        />
                      </svg>
                      <span
                        class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200"
                      >
                        Alerts
                      </span>
                    </div>
                    <!-- Badge -->
                    <div
                      class="flex shrink-0 ml-2 lg:hidden lg:sidebar-expanded:flex 2xl:flex"
                    >
                      <span
                        class="inline-flex items-center justify-center h-5 text-xs font-medium text-white bg-red-500 px-2 rounded-full"
                        v-if="unreadAlerts > 0"
                      >
                        {{ unreadAlerts }}
                      </span>
                    </div>
                  </div>
                </a>
              </li>
            </router-link>
          </ul>
        </div>

        <!-- Quick Actions -->
        <div>
          <h3 class="text-xs uppercase text-gray-400 font-semibold pl-3 mb-3">
            <span
              class="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6"
              aria-hidden="true"
              >•••</span
            >
            <span class="lg:hidden lg:sidebar-expanded:block 2xl:block"
              >Quick Actions</span
            >
          </h3>
          <ul class="mt-3 space-y-1">
            <!-- Add Sample -->
            <router-link to="/samples/new" custom v-slot="{ href, navigate }">
              <li
                class="px-3 py-2 rounded-lg mb-0.5 last:mb-0 transition-all duration-200 hover:bg-white/5"
              >
                <a
                  class="block text-gray-100 truncate transition"
                  :href="href"
                  @click="navigate"
                >
                  <div class="flex items-center">
                    <svg
                      class="shrink-0 w-5 h-5 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                    </svg>
                    <span
                      class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200"
                    >
                      Add New Sample
                    </span>
                  </div>
                </a>
              </li>
            </router-link>
          </ul>
        </div>

        <!-- System -->
        <div>
          <h3 class="text-xs uppercase text-gray-400 font-semibold pl-3 mb-3">
            <span
              class="hidden lg:block lg:sidebar-expanded:hidden 2xl:hidden text-center w-6"
              aria-hidden="true"
              >•••</span
            >
            <span class="lg:hidden lg:sidebar-expanded:block 2xl:block"
              >System</span
            >
          </h3>
          <ul class="mt-3 space-y-1">
            <!-- Settings -->
            <li
              class="px-3 py-2 rounded-lg mb-0.5 last:mb-0 transition-all duration-200 hover:bg-white/5"
            >
              <a class="block text-gray-100 truncate transition cursor-pointer">
                <div class="flex items-center">
                  <svg
                    class="shrink-0 w-5 h-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
                    />
                  </svg>
                  <span
                    class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200"
                  >
                    Settings
                  </span>
                </div>
              </a>
            </li>

            <!-- Help -->
            <li
              class="px-3 py-2 rounded-lg mb-0.5 last:mb-0 transition-all duration-200 hover:bg-white/5"
            >
              <a class="block text-gray-100 truncate transition cursor-pointer">
                <div class="flex items-center">
                  <svg
                    class="shrink-0 w-5 h-5 text-gray-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"
                    />
                  </svg>
                  <span
                    class="text-sm font-medium ml-4 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200"
                  >
                    Help & Support
                  </span>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <!-- Expand / collapse button -->
      <div class="pt-3 hidden lg:inline-flex 2xl:hidden justify-end mt-auto">
        <div class="w-12 pl-4 pr-3 py-2">
          <button
            class="text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/5"
            @click.prevent="sidebarExpanded = !sidebarExpanded"
          >
            <span class="sr-only">Expand / collapse sidebar</span>
            <svg
              class="shrink-0 fill-current sidebar-expanded:rotate-180 transition-transform duration-200"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
            >
              <path
                d="M15 16a1 1 0 0 1-1-1V1a1 1 0 1 1 2 0v14a1 1 0 0 1-1 1ZM8.586 7H1a1 1 0 1 0 0 2h7.586l-2.793 2.793a1 1 0 1 0 1.414 1.414l4.5-4.5A.997.997 0 0 0 12 8.01M11.924 7.617a.997.997 0 0 0-.217-.324l-4.5-4.5a1 1 0 0 0-1.414 1.414L8.586 7M12 7.99a.996.996 0 0 0-.076-.373Z"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- User Profile (Bottom) -->
      <div class="mt-auto pt-3 border-t border-gray-700">
        <div
          class="px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 cursor-pointer"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center text-white font-semibold"
            >
              {{ userInitials }}
            </div>
            <div
              class="lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100 duration-200 flex-1"
            >
              <div class="text-sm font-medium text-white">{{ userName }}</div>
              <div class="text-xs text-gray-400">{{ userRole }}</div>
            </div>
            <svg
              class="w-4 h-4 text-gray-400 lg:opacity-0 lg:sidebar-expanded:opacity-100 2xl:opacity-100"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M7 10l5 5 5-5z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const props = defineProps({
  sidebarOpen: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["close-sidebar"]);

const router = useRouter();
const authStore = useAuthStore();

const trigger = ref(null);
const sidebar = ref(null);

const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
const sidebarExpanded = ref(
  storedSidebarExpanded === null ? false : storedSidebarExpanded === "true"
);

// Mock data - replace with real data from store
const unreadAlerts = computed(() => 0 ); // From alerts store
const userName = computed(() => authStore.user?.name || "Admin User");
const userRole = computed(() => authStore.user?.role || "Administrator");
const userInitials = computed(() => {
  if (!userName.value) return "AU";
  return userName.value
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
});

// Close on click outside
const clickHandler = ({ target }) => {
  if (!sidebar.value || !trigger.value) return;
  if (
    !props.sidebarOpen ||
    sidebar.value.contains(target) ||
    trigger.value.contains(target)
  )
    return;
  emit("close-sidebar");
};

// Close if the esc key is pressed
const keyHandler = ({ keyCode }) => {
  if (!props.sidebarOpen || keyCode !== 27) return;
  emit("close-sidebar");
};

onMounted(() => {
  document.addEventListener("click", clickHandler);
  document.addEventListener("keydown", keyHandler);
});

onUnmounted(() => {
  document.removeEventListener("click", clickHandler);
  document.removeEventListener("keydown", keyHandler);
});

watch(sidebarExpanded, () => {
  localStorage.setItem("sidebar-expanded", sidebarExpanded.value);
  if (sidebarExpanded.value) {
    document.querySelector("body").classList.add("sidebar-expanded");
  } else {
    document.querySelector("body").classList.remove("sidebar-expanded");
  }
});
</script>

<style scoped>
/* Scrollbar styling */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Sidebar expanded class handling */
@media (min-width: 1024px) {
  .sidebar-expanded .lg\\:sidebar-expanded\\:opacity-100 {
    opacity: 1;
  }

  .sidebar-expanded .lg\\:sidebar-expanded\\:block {
    display: block;
  }

  .sidebar-expanded .lg\\:sidebar-expanded\\:hidden {
    display: none;
  }

  .sidebar-expanded .lg\\:sidebar-expanded\\:flex {
    display: flex;
  }

  .sidebar-expanded .lg\\:sidebar-expanded\\:rotate-180 {
    transform: rotate(180deg);
  }
}
</style>
