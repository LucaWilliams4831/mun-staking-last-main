<template>
  <div>
    <notifications />
    <SpTheme>
      <SpNavbar
        :links="navbarLinks"
        :active-route="router.currentRoute.value.path"
      >
      </SpNavbar>

      <router-view />
    </SpTheme>
  </div>
</template>

<script lang="ts">
import { SpNavbar, SpTheme } from "./starportvue";
import SpDarkThemeButton from "./components/SpDarkThemeButton";
import { computed, onBeforeMount } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

export default {
  components: { SpTheme, SpNavbar, SpDarkThemeButton },

  setup() {
    // store
    let $s = useStore();

    // router
    let router = useRouter();

    // state
    let navbarLinks = [
      // { name: 'AirdropData', url: '/airdrop' },
      // { name: 'CoinData', url: '/coin' },
      // { name: 'TokenData', url: '/token' },
      { name: "Staking", url: "/staking" },
      //      { name: 'Staking', url: '/staking' }
    ];

    // computed
    let address = computed(() => $s.getters["common/wallet/address"]);

    // lh
    onBeforeMount(async () => {
      await $s.dispatch("common/env/init");

      router.push("staking");
    });

    return {
      navbarLinks,
      // router
      router,
      // computed
      address,
    };
  },
};
</script>

<style scoped lang="scss">
@import "./styles/app.scss";
</style>
