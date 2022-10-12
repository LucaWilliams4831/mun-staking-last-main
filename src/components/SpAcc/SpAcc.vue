<template>
  <!-- {{ userTheme }}
  {{variable}}
  <SpButton @click="variable = !variable" style="background: #fff; color: #000">
    Dark/light
  </SpButton> -->
  <input
    @change="toggleTheme"
    id="checkbox"
    type="checkbox"
    class="switch-checkbox"
  />
  <label for="checkbox" class="switch-label">
    <span>🌙</span>
    <span>☀️</span>
    <div
      class="switch-toggle"
      :class="{ 'switch-toggle-checked': userTheme === 'dark-theme' }"
    ></div>
  </label>
  <div class="sp-acc">
    <div
      v-if="wallet"
      class="sp-nav-link selected account-dropdown-button"
      style="display: flex; align-items: center"
      @click="state.accountDropdown = !state.accountDropdown"
    >
      <div class="hide-on-small" style="display: flex; align-items: center">
        <SpProfileIcon :address="state.keplrParams?.bech32Address" />
        <span style="margin-left: 12px; margin-right: 12px">
          {{ getAccName() }}
        </span>
      </div>
      <SpChevronDownIcon />
    </div>
    <div
      v-else
      class="sp-nav-link"
      style="display: flex; align-items: center"
      @click="state.connectWalletModal = true"
    >
      Connect wallet
    </div>
    <SpAccDropdown
      v-if="state.accountDropdown"
      :wallet="wallet"
      :accName="getAccName()"
      @disconnect="disconnect"
      @close="state.accountDropdown = false"
    />
    <SpModal
      :visible="state.connectWalletModal"
      :closeIcon="false"
      :cancelButton="false"
      :submitButton="false"
      @close="state.connectWalletModal = false"
      @submit="state.connectWalletModal = false"
      style="text-align: center"
    >
      <template v-slot:header>
        <div v-if="state.modalPage === 'connect'">
          <SpKeplrIcon />
          <h3 v-if="isKeplrAvailable">Connect your wallet</h3>
          <h3 v-else>Install Keplr</h3>
        </div>
        <div v-else-if="state.modalPage === 'connecting'">
          <div class="description-grey">Opening Keplr</div>
          <h3>Connecting</h3>
        </div>
        <div v-else-if="state.modalPage === 'error'">
          <SpWarningIcon style="margin-bottom: 20px" />
          <h3>Keplr cannot launch</h3>
        </div>
      </template>
      <template v-slot:body>
        <div style="max-width: 320px; text-align: center; margin: auto">
          <div v-if="state.modalPage === 'connect'">
            <p v-if="isKeplrAvailable">
              Connect your Keplr wallet via the Keplr browser extension to use
              this app.
            </p>
            <p v-else>
              Install & connect your Keplr wallet via the Keplr browser
              extension to use this app.
            </p>
          </div>
          <div v-else-if="state.modalPage === 'connecting'">
            <div style="margin-top: 2rem">
              <SpSpinner />
            </div>
            <SpButton
              aria-label="Cancel"
              type="secondary"
              @click="state.modalPage = 'connect'"
              style="margin-top: 3rem"
            >
              Cancel
            </SpButton>
            <div class="external-link" style="margin-top: 2rem">
              Having trouble opening Keplr?
            </div>
          </div>
          <div v-else-if="state.modalPage === 'error'" style="padding: 20px 0">
            <div class="external-link">
              <span>Keplr troubleshooting</span>
              <SpExternalArrowIcon style="margin-left: 0.5rem" />
            </div>
          </div>
        </div>
      </template>
      <template v-if="isKeplrAvailable" v-slot:footer>
        <div v-if="state.modalPage === 'connect'">
          <SpButton
            aria-label="Connect Keplr"
            type="primary"
            @click="tryToConnectToKeplr"
          >
            Connect Keplr
          </SpButton>
        </div>
        <div
          v-if="state.modalPage === 'error'"
          style="gap: 10px; display: flex; justify-content: center"
        >
          <SpButton
            aria-label="Connect Keplr"
            type="secondary"
            @click="state.connectWalletModal = false"
          >
            Cancel
          </SpButton>
          <SpButton
            aria-label="Connect Keplr"
            type="primary"
            @click="state.modalPage = 'connect'"
          >
            Try again
          </SpButton>
        </div>
      </template>
    </SpModal>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed, onMounted } from "vue";
import { useStore } from "vuex";

import SpModal from "../SpModal";
import SpButton from "../SpButton";
import SpAccDropdown from "../SpAccDropdown";
import SpSpinner from "../SpSpinner";
import SpProfileIcon from "../SpProfileIcon";
import SpKeplrIcon from "../SpKeplrIcon";
import SpWarningIcon from "../SpWarningIcon";
import SpExternalArrowIcon from "../SpExternalArrow";
import SpChevronDownIcon from "../SpChevronDown";

import useKeplr from "../../composables/useKeplr";
import { Wallet } from "../../utils/interfaces";

export interface State {
  modalPage: string;
  connectWalletModal: boolean;
  accountDropdown: boolean;
  keplrParams: { name: String; bech32Address: String };
}

export let initialState: State = {
  modalPage: "connect",
  connectWalletModal: false,
  accountDropdown: false,
  keplrParams: { name: "", bech32Address: "" },
};

export default defineComponent({
  name: "SpAcc",

  components: {
    SpModal,
    SpButton,
    SpSpinner,
    SpProfileIcon,
    SpAccDropdown,
    SpKeplrIcon,
    SpWarningIcon,
    SpExternalArrowIcon,
    SpChevronDownIcon,
  },

  setup() {
    // $s
    let $s = useStore();

    // state
    let state = reactive(initialState);

    // composables
    let {
      connectToKeplr,
      isKeplrAvailable,
      getOfflineSigner,
      getKeplrAccParams,
      listenToAccChange,
    } = useKeplr({ $s });

    // computed
    let wallet = computed<Wallet>(() => $s.getters["common/wallet/wallet"]);
    let chainId = computed<string>(() => $s.getters["common/env/chainId"]);

    // dark/ligth mode convert
    let ConvertTheme = (): void => {
      console.log("luca dark button clicked");
    };

    // actions
    let signInWithKeplr = async (offlineSigner: any) =>
      $s.dispatch("common/wallet/connectWithKeplr", offlineSigner);
    let signOut = async () => $s.dispatch("common/wallet/signOut");

    // methods
    let tryToConnectToKeplr = (): void => {
      state.modalPage = "connecting";

      let onKeplrConnect = async () => {
        let { name, bech32Address } = await getKeplrAccParams(chainId.value);
        state.keplrParams.name = name;
        state.keplrParams.bech32Address = bech32Address;

        let offlineSigner = getOfflineSigner(chainId.value);
        signInWithKeplr(offlineSigner);

        listenToAccChange(onKeplrConnect);

        state.connectWalletModal = false;
        state.modalPage = "connect";
      };

      let onKeplrError = (): void => {
        state.modalPage = "error";
      };

      connectToKeplr(onKeplrConnect, onKeplrError);
    };
    let getAccName = (): string => {
      if (wallet.value?.name === "Keplr Integration") {
        return state.keplrParams?.name + "";
      } else {
        return "";
      }
    };
    let disconnect = (): void => {
      state.accountDropdown = false;

      signOut();
    };

    // check if already connected
    onMounted(async () => {
      if (chainId.value) {
        try {
          await tryToConnectToKeplr();
        } catch (e) {
          console.warn("Keplr not connected");
        }
      }
    });

    return {
      ConvertTheme,
      isKeplrAvailable,
      tryToConnectToKeplr,
      disconnect,
      state,
      wallet,
      getAccName,
    };
  },

  // data() {
  //   return {
  //     userTheme: localStorage.getItem("user-theme"),
  //     variable: false
  //   };
  // },

  // methods: {
  //   toggleTheme(theme) {
  //     localStorage.setItem("user-theme", theme);

  //     this.userTheme = localStorage.getItem("user-theme");
  //     // if (activeTheme === "light-theme") {
  //     //   this.setTheme("dark-theme");
  //     // } else {
  //     //   this.setTheme("light-theme");
  //     // }
  //   },
  // },
  mounted() {
    const initUserTheme = this.getTheme() || this.getMediaPreference();
    this.setTheme(initUserTheme);
  },

  data() {
    return {
      userTheme: "light-theme",
    };
  },

  methods: {
    toggleTheme() {
      const activeTheme = localStorage.getItem("user-theme");
      if (activeTheme === "light-theme") {
        this.setTheme("dark-theme");
      } else {
        this.setTheme("light-theme");
      }
    },

    getTheme() {
      return localStorage.getItem("user-theme");
    },

    setTheme(theme) {
      localStorage.setItem("user-theme", theme);
      this.userTheme = theme;
      document.documentElement.className = theme;
    },

    getMediaPreference() {
      const hasDarkPreference = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      if (hasDarkPreference) {
        return "dark-theme";
      } else {
        return "light-theme";
      }
    },
  },
});
</script>

<style scoped lang="scss">
.switch-checkbox {
  display: none;
}

.switch-label {
  align-items: center;
  background: #ddd;
  border: calc(4rem * 0.025) solid #cacaca;
  border-radius: 4rem;
  cursor: pointer;
  display: flex;
  font-size: calc(4rem * 0.3);
  height: 34px;
  position: relative;
  padding: calc(4rem * 0.1);
  transition: background 0.5s ease;
  justify-content: space-between;
  width: 79px;
  z-index: 1;
}

.switch-toggle {
  position: absolute;
  background-color: #000;
  border-radius: 50%;
  top: 6px;
  left: 4px;
  height: 20px;
  width: 20px;
  transform: translateX(0);
  transition: transform 0.3s ease, background-color 0.5s ease;
}

.switch-toggle-checked {
  transform: translateX(49px) !important;
}

.navbar-wrapper {
  display: flex;
  justify-content: space-between;
  position: absolute;
  height: 80px;
  left: 0;
  right: 0;
  top: 0;
}

.navbar-section {
  display: flex;
  padding: 20px;
  align-items: center;
}

.sp-nav-link {
  font-size: 16px;
  line-height: 130%;
  font-weight: 400;
  text-decoration: none;
  cursor: pointer;
  margin: 0 1rem;
  transition: font-weight 0.2s ease, color 0.2s ease;
}

.sp-nav-link:hover {
  opacity: 0.8;
}

.sp-nav-link.selected {
  font-weight: 600;
}

.description-grey {
  font-size: 13px;
  line-height: 153.8%;
}

.external-link {
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
}

.external-link:hover {
  opacity: 0.8;
}

@media (max-width: 600px) {
  .hide-on-small {
    display: none !important;
  }
}
</style>
