<template>
  <div class="container">
    <div class="row">
      <div class="col-md-12">
        <div class="row">
          <div class="col card-item">
            <p>Available</p>
            <div class="border-text">
              {{ parseFloat(state.balance / 1e6).toFixed(2) }} TMUN
            </div>
            <button @click="() => {state.modalOpen = true;                   
            state.validadd = 0;}">Stake</button>
          </div>
          <div class="col card-item">
            <p>Staked</p>
            <div class="border-text">
              {{ (total_staked / (1 * 1e6)).toFixed(2) }} TMUN
            </div>
            <div class="row">
              <div class="col-md-6">
                <button
                  class="border"
                  @click="() => {state.modalUndelegateOpen = true;
                  state.validadd = 0;}"
                >
                  Undelegate
                </button>
              </div>
              <div class="col-md-6">
                <button
                  class="border col-md-6"
                  @click="() => {state.modalRedelegateOpen = true;
                  state.validadd = 0;}"
                >
                  Redelegate
                </button>
              </div>
            </div>
          </div>
          <div class="col card-item">
            <p>Rewards</p>
            <div class="border-text">
              {{ (total_rewards / 1e6).toFixed(2) }} TMUN
            </div>
            <button @click="() => {state.modalRewardOpen = true;
            state.validadd = 0;}">Claim</button>
          </div>
          <div class="col card-item">
            <p>Unbonding</p>
            <div class="border-text">
              {{ (unbonding_amount / 1e6).toFixed(2) }} TMUN
            </div>
            <div class="transparent">
              Unbonding period: {{ unbondtime }}days
            </div>
          </div>
          <div class="col card-item">
            <p>Staking APR</p>
            <div class="border-text">86.87%</div>
          </div>
        </div>
      </div>
      <div class="col-md-12 validators-box">
        <div class="table-badge">
          <div>All Validators</div>
          <div>
            <button
              :class="state.show_active ? '' : 'border'"
              @click="
                () => {
                  state.show_active = true;
                }
              "
            >
              Active
            </button>
            <button
              :class="!state.show_active ? '' : 'border'"
              @click="
                () => {
                  state.show_active = false;
                }
              "
            >
              Inactive
            </button>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <td width="50%"><a>NAME</a></td>
              <td class="text-center"><a>VOTING POWER</a></td>
              <td class="text-center"><a>COMMISSION</a></td>
              <td class="text-center">ACTIONS</td>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="validator in validators.filter(
                (val) =>
                  val.status ===
                  (state.show_active
                    ? 'BOND_STATUS_BONDED'
                    : 'BOND_STATUS_UNBONDING')
              )"
              v-bind:key="validator"
            >
              <td>
                <span class="avatar-name">{{
                  validator.description.moniker
                }}</span>
              </td>
              <td class="text-center">
                {{ (validator.tokens / 1e6).toFixed(2) }} TMUN
              </td>
              <td class="text-center">
                {{
                  (validator.commission.commission_rates.rate * 100).toFixed(2)
                }}%
              </td>
              <td class="text-center">
                <a
                  @click="
                    () => {
                      state.modalManageOpen = true;
                      state.selectedvalidator = validator;
                      state.validadd = 1;
                    }
                  "
                  >Manage →</a
                >
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <SpModal
      :visible="state.modalOpen"
      :close-icon="true"
      :title="'Stake Tokens'"
      @close="state.modalOpen = false"
    >
      <template #body>
        <div class="modal-body">
          <div class="comment">
            Select a validator and amount of TMUN to stake.
          </div>

          <div>
            <div class="label">Validator</div>
            <div class="label">
              <input
                class="form-control"
                style="width: 100%"
                placeholder="Filter validators by keyword"
                @change="
                  (e) => {
                    state.filter_stake_text = e.target.value;
                  }
                "
              />
            </div>
            <select
              class="form-select"
              :options="validators"
              label="Default select example"
              @change="
                (e) => {
                  state.validator_address = e.target.value;
                }
              "
              :value="state.selectedvalidator.operator_address"
            >
              <option disabled value="">Select a validator</option>
              <option
                v-for="validator in validators.filter((val) => 
                  val.description.moniker.includes(state.filter_stake_text)
                )"
                :key="validator"
                :value="validator.operator_address"
              >
                {{ validator.description.moniker }}
              </option>
            </select>
          </div>
          <div>
            <div class="label">Amount to stake</div>
            <input
              type="number"
              min="0"
              :value="state.input_number"
              @change="(e) => (state.input_number = e.target.value)"
            />
            <span
              class="max-tag"
              :class="{
                gray: parseFloat(state.input_number) >= parseFloat(balance),
              }"
              @click="
                () => {
                  state.input_number = balance;
                }
              "
            >
              MAX
            </span>
          </div>
          <div class="desc">
            Available balance:
            <span>{{ parseFloat(balance).toFixed(2) }}</span> TMUN
          </div>
          <div class="button-group">
            <SpButton
              class="button-stake"
              @click="
                () => {
                  state.modalOpen = false;
                  sendMsgTx(1);
                }
              "
              ><span>Stake</span></SpButton
            >
            <SpButton
              class="button-cancel"
              @click="() => (state.modalOpen = false)"
              ><span>Cancel</span></SpButton
            >
          </div>
        </div>
      </template>
    </SpModal>
    <SpModal
      :visible="state.modalLoading"
      :close-icon="false"
      :title="'Progressing'"
    >
      <template #body>
        <div class="modal-body text-center">Please wait...</div>
      </template>
    </SpModal>
    <SpModal
      :visible="state.modalUndelegateOpen"
      :close-icon="true"
      :title="'Undelegate Tokens'"
      @close="state.modalUndelegateOpen = false"
    >
      <template #body>
        <div class="modal-body">
          <div class="comment">
            Select a validator and amount of TMUN to undelegate.
          </div>
          <div>
            <div class="label">Validator</div>
            <div class="label">
              <input
                class="form-control"
                style="width: 100%"
                placeholder="Filter validators by keyword"
                @change="
                  (e) => {
                    state.filter_undeligate_text = e.target.value;
                  }
                "
              />
            </div>
            <select
              class="form-select"
              aria-label="Default select example"
              @change="
                (e) => {
                  const dele = delegators_filter.find(
                    (item) =>
                      item.delegation.validator_address === e.target.value
                  );
                  state.max_value = dele.balance.amount / 1e6;
                  state.input_number =
                    parseFloat(state.input_number) >=
                    parseFloat(state.max_value)
                      ? state.max_value
                      : state.input_number;
                  state.validator_address = e.target.value;
                }
              "
             :value="state.selectedvalidator.operator_address" 
            >
              <option disabled value="">Select a validator</option>
              <option
                v-for="delegator in delegators_filter.filter((val) => 
                  val.name.includes(state.filter_undeligate_text)
                )"
                v-bind:key="delegator"
                :value="delegator.delegation.validator_address"
              >
                {{ delegator.name }}
              </option>
            </select>
          </div>
          <div>
            <div class="label">Amount to undelegate</div>
            <input
              type="number"
              min="0"
              :max="state.max_value / 1e6"
              :value="state.input_number"
              @change="(e) => (state.input_number = e.target.value)"
            />
            <span
              class="max-tag"
              :class="{
                gray:
                  parseFloat(state.input_number) >= parseFloat(state.max_value),
              }"
              @click="
                () => {
                  state.input_number = state.max_value;
                }
              "
            >
              MAX
            </span>
          </div>
          <div class="desc">
            Available balance: <span>{{ state.max_value }}</span> TMUN
          </div>
          <div class="desc">
              Unbonding period: {{ unbondtime }}days
          </div>
          <div class="button-group">
            <SpButton
              class="button-stake"
              @click="
                () => {
                  state.modalUndelegateOpen = false;
                  sendMsgTx(2);
                }
              "
              ><span>Undelegate</span></SpButton
            >
            <SpButton
              class="button-cancel"
              @click="() => (state.modalUndelegateOpen = false)"
              ><span>Cancel</span></SpButton
            >
          </div>
        </div>
      </template>
    </SpModal>
    <SpModal
      :visible="state.modalRedelegateOpen"
      :close-icon="true"
      :title="'Redelegate Tokens'"
      @close="state.modalRedelegateOpen = false"
    >
      <template #body>
        <div class="modal-body">
          <div class="comment">
            Select a new validator and amount of TMUN to Redelegate.
          </div>
          <div>
            <div class="label">Source Validator</div>
            <div class="label">
              <input
                class="form-control"
                style="width: 100%"
                placeholder="Filter validators by keyword"
                @change="
                  (e) => {
                    state.filter_src_val_text = e.target.value;
                  }
                "
              />
            </div>
            <select
              class="form-select"
              aria-label="Default select example"
              @change="
                (e) => {
                  const dele = delegators_filter.find(
                    (item) =>
                      item.delegation.validator_address === e.target.value
                  );
                  state.max_value = dele.balance.amount / 1e6;
                  state.input_number =
                    parseFloat(state.input_number) >=
                    parseFloat(state.max_value)
                      ? state.max_value
                      : state.input_number;
                  state.validator_address = e.target.value;
                }
              "
              
            >
              <option disabled value="">Select a validator</option>
              <option
                v-for="delegator in delegators_filter.filter((val) => 
                  val.name.includes(state.filter_src_val_text)
                )"
                v-bind:key="delegator"
                :value="delegator.delegation.validator_address"
              >
                {{ delegator.name }}
              </option>
            </select>
          </div>
          <div>
            <div class="label">Destination Validator</div>
            <div class="label">
              <input
                class="form-control"
                style="width: 100%"
                placeholder="Filter validators by keyword"
                @change="
                  (e) => {
                    state.filter_dest_val_text = e.target.value;
                  }
                "
              />
            </div>
            <select
              class="form-select"
              aria-label="Default select example"
              @change="
                (e) => {
                  state.revalidator_address = e.target.value;
                }
              "
              :value="state.selectedvalidator.operator_address"
            >
              <option disabled value="">Select a validator</option>
              <option
                v-for="validator in validators.filter((val) => 
                  val.description.moniker.includes(state.filter_dest_val_text)
                )"
                v-bind:key="validator"
                :value="validator.operator_address"
              >
                {{ validator.description.moniker }}
              </option>
            </select>
          </div>
          <div>
            <div class="label">Amount to undelegate</div>
            <input
              type="number"
              min="0"
              :max="state.max_value / 1e6"
              :value="state.input_number"
              @change="(e) => (state.input_number = e.target.value)"
            />
            <span
              class="max-tag"
              :class="{
                gray:
                  parseFloat(state.input_number) >= parseFloat(state.max_value),
              }"
              @click="
                () => {
                  state.input_number = state.max_value;
                }
              "
            >
              MAX
            </span>
          </div>
          <div class="desc">
            Staked balance: <span>{{ state.max_value }}</span> TMUN
          </div>
          <div class="button-group">
            <SpButton
              class="button-stake"
              @click="
                () => {
                  state.modalRedelegateOpen = false;
                  sendMsgTx(3);
                }
              "
              ><span>Redelegate</span></SpButton
            >
            <SpButton
              class="button-cancel"
              @click="() => (state.modalRedelegateOpen = false)"
              ><span>Cancel</span></SpButton
            >
          </div>
        </div>
      </template>
    </SpModal>
    <SpModal
      :visible="state.modalManageOpen"
      :close-icon="true"
      :title="'StakeLab'"
      @close="state.modalManageOpen = false"
    >
      <template #body>
        <div class="modal-body">
          <div class="comment">Staking Hub for Cosmos ecosystem</div>
          <hr />
          <div class="text-box">
            <div class="d-flex align-items-center justify-content-between">
              <div class="text-label">Voting Power</div>
              <div>
                <span
                  >{{
                    (state.selectedvalidator.tokens / 1e6).toFixed(2)
                  }}&nbsp;</span
                >TMUN
              </div>
            </div>
            <div class="d-flex align-items-center justify-content-between">
              <div class="text-label">Commission</div>
              <div>
                <span
                  >{{
                    (
                      state.selectedvalidator.commission.commission_rates.rate *
                      100
                    ).toFixed(2)
                  }}&nbsp;</span
                >%
              </div>
            </div>
          </div>
          <div class="button-group">
            <SpButton
              class="button-stake"
              @click="
                () => {
                  state.modalOpen = true;
                  state.modalManageOpen = false;
                }
              "
              ><span>Delegate</span></SpButton
            >
            <SpButton
              class="button-stake"
              @click="
                () => {
                  state.modalRedelegateOpen = true;
                  state.modalManageOpen = false;
                }
              "
              ><span>Redelegate</span></SpButton
            >
            <SpButton
              class="button-stake"
              @click="
                () => {
                  state.modalUndelegateOpen = true;
                  state.modalManageOpen = false;
                }
              "
              ><span>Undeletgate</span></SpButton
            >
            <SpButton
              class="button-cancel"
              @click="() => (state.modalManageOpen = false)"
              ><span>Cancel</span></SpButton
            >
          </div>
        </div>
      </template>
    </SpModal>

    <!--------------------------- get reward model ----------------------------------------------------------------------->

    <SpModal
      :visible="state.modalRewardOpen"
      :close-icon="true"
      :title="'Claim rewards'"
      @close="state.modalRewardOpen = false"
    >
      <template #body>
        <div class="modal-body">
          <div class="comment">Select a validator for getting reward</div>
          <div>
            <div class="label">Validator</div>
            <div class="label">
              <input
                class="form-control"
                style="width: 100%"
                placeholder="Filter validators by keyword"
                @change="
                  (e) => {
                    state.filter_claim_text = e.target.value;
                  }
                "
              />
            </div>
            <select
              class="form-select"
              aria-label="Default select example"
              @change="
                (e) => {
                  state.validator_address = e.target.value;
                }
              "
              
            >
              <option disabled value="">Select a validator</option>
              <option
                v-for="delegator in delegators_filter.filter((val) => 
                  val.name.includes(state.filter_claim_text)
                )"
                v-bind:key="delegator"
                :value="delegator.delegation.validator_address"
              >
                {{ delegator.name }} (
                {{
                  
                  (() => {
                   const amount =
                      this.rewards_list.rewards?.find(
                        (reward) =>
                          reward.validator_address ===
                          delegator.delegation.validator_address
                      )?.reward[0]?.amount || 0;
                    return (parseFloat(amount) / 1e6).toFixed(2);
                  })()
                }}
                TMUN )
                <!-- totalrewards_response.rewards[0].validator_address -->
              </option>
            </select>
          </div>
          <div class="desc">
            <!-- Available Reward amount: <span>{{ state.max_value  }}</span> TMUN -->
          </div>
          <div class="button-group">
            <SpButton
              class="button-stake"
              @click="
                () => {
                  state.modalRewardOpen = false;
                  sendMsgTx(4);
                }
              "
              ><span>Claim</span></SpButton
            >
            <SpButton
              class="button-cancel"
              @click="() => (state.modalRewardOpen = false)"
              ><span>Cancel</span></SpButton
            >
          </div>
        </div>
      </template>
    </SpModal>
    <!-------------------------------------------------------------------------------------------------->
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, toRaw, watch } from "vue";
import { useStore } from "vuex";
import { AssetForUI } from "../../composables/useAssets";
import { Amount } from "../../utils/interfaces";
import { useAddress, useAssets } from "../../composables";
import { notify } from "@kyvg/vue3-notification";

import BigNumber from "bignumber.js";
import SpAmountInput from "../SpAmountInput";
import SpDenom from "../SpDenom";
import SpModal from "../SpModal";
import { Validator } from "@cosmjs/tendermint-rpc";
import ValidatorsVue from "../../views/Validators.vue";

export interface DelegateTxData {
  receiver: string;
  amount: AssetForUI | undefined;
  memo: string;
  fees: Array<AssetForUI>;
}

export enum UI_STATE {
  "FRESH" = 1,
  "BOOTSTRAPED" = 2,
  "WALLET_LOCKED" = 3,
  "SEND" = 100,
  "SEND_ADD_TOKEN" = 101,
  "TX_SIGNING" = 300,
  "TX_SUCCESS" = 301,
  "TX_ERROR" = 302,
  "RECEIVE" = 400,
}

export interface State {
  tx: DelegateTxData;
  currentUIState: UI_STATE;
  advancedOpen: boolean;
  modalOpen: boolean;
  modalRewardOpen: boolean;
  modalManageOpen: boolean;
  modalRedelegateOpen: boolean;
  modalUndelegateOpen: boolean;
  modalLoading: boolean;
  selectedvalidator: Validator | undefined;
  input_number: number;
  max_value: number;
  filter_stake_text: string;
  filter_undeligate_text: string;
  filter_src_val_text: string;
  filter_dest_val_text: string;
  filter_claim_text: string;
  validator_address: string;
  revalidator_address: string;
  forceUpdate: boolean;
  validadd:number;
  show_active: boolean;
  balance: number;
}

export let initialState: State = {
  tx: {
    receiver: "",
    amount: undefined,
    memo: "",
    fees: [],
  },
  currentUIState: UI_STATE.SEND,
  advancedOpen: false,
  modalOpen: false,
  modalRewardOpen: false,
  modalManageOpen: false,
  modalRedelegateOpen: false,
  modalUndelegateOpen: false,
  modalLoading: false,
  selectedvalidator: undefined,
  input_number: 0,
  max_value: 0,
  filter_stake_text: "",
  filter_undeligate_text: "",
  filter_src_val_text: "",
  filter_dest_val_text: "",
  filter_claim_text: "",
  validator_address: "",
  revalidator_address: "",
  forceUpdate: false,
  show_active: true,
  balance: 0,
  validadd:0,
};

let that;
let state: State = reactive(initialState);
let amount: Amount = { denom: "utmun", amount: "10000000" };
let shownotify = (param: string) => {
  notify({
    title: param,
  });
};
export default defineComponent ({
  name: "SpStaking",

  components: { SpModal, SpDenom, SpAmountInput },
  setup() {
    // store
    let $s = useStore();

    // state
    let state: State = reactive(initialState);

    // composables
    let { address } = useAddress({ $s });
    
    let { balances } = useAssets({ $s, opts: { extractChannels: true } });
    let wallet = computed(() => {
      let a = JSON.parse(JSON.stringify(balances.value.assets.slice(0, 3)));

      let val = 0;
      if (a[0]?.amount?.amount) val = a[0]?.amount?.amount;
      return "" + val;
    });
    let resetTx = (): void => {
      state.currentUIState = UI_STATE.FRESH;
      state.forceUpdate = true;
      that.$forceUpdate();
    };
    let bootstrapTxAmount = () => {
      {

      }
    }
    //watch
    watch(
      () => address.value,
      async () => {
        
        resetTx();
      },
    );

  },
  data() {
    let $s = useStore();
    let { address } = useAddress({ $s });
    let { balances } = useAssets({ $s, opts: { extractChannels: true } });
    let total_staked = 0;
    let unbonding_amount = 0;
    let total_rewards = 0;
    let rewards_list = [];

    let balance = computed(() => {
      let a = JSON.parse(JSON.stringify(balances.value.assets.slice(0, 3)));

      let val = 0;
      if (a[0]?.amount?.amount) val = a[0]?.amount?.amount;

      if (balance.value && val !== balance.value) {
        state.forceUpdate = true;
      }

      return "" + val;
    });

    let hasAnyBalance = computed<boolean>(
      () =>
        balances.value.assets.length > 0 &&
        balances.value.assets.some((x) => parseAmount(x.amount.amount) > 0)
    );
    let handleTxFeesUpdate = ({ selected }) => {
      state.tx.fees = selected;
    };
    let parseAmount = (amount: string): number => {
      return amount == "" ? 0 : parseInt(amount);
    };
    let sendMsgDelegate = (opts: any) =>
      $s.dispatch("cosmos.staking.v1beta1/sendMsgDelegate", opts);

    let sendMsgUndelegate = (opts: any) =>
      $s.dispatch("cosmos.staking.v1beta1/sendMsgUndelegate", opts);

    let sendMsgRedelegate = (opts: any) =>
      $s.dispatch("cosmos.staking.v1beta1/sendMsgBeginRedelegate", opts);

    let sendMsgGetRewards = (opts: any) =>
      $s.dispatch(
        "cosmos.distribution.v1beta1/sendMsgWithdrawDelegatorReward",
        opts
      );
    //MsgWithdrawDelegatorReward

    return {
      state,
      hasAnyBalance,
      handleTxFeesUpdate,
      parseAmount,
      validators: [],
      delegators_filter: [],
      unbondtime: 0,
      balance,
      total_staked,
      unbonding_amount,
      total_rewards,
      rewards_list,
      sendMsgTx: async (index: number): Promise<void> => {
        if (address.value == "") {
          shownotify("Please connect a wallet.");
          throw new Error();
        }

        if (index !== 4 && state.input_number <= 0) {
          shownotify("Amount is not valid");
          throw new Error();
        }

        if (state.validator_address === "") {
          if(state.selectedvalidator === undefined)
          {
            shownotify("Validator Address is not valid");
            throw new Error();
          }else{
            state.validator_address = state.selectedvalidator.operator_address;
          }
        }
        
        if(index === 3 && state.revalidator_address === "")
          state.revalidator_address = state.selectedvalidator.operator_address;
        
        if (index === 3 && state.revalidator_address === "") {
          shownotify("Destination Validator Address is not valid");
          throw new Error();
        }
        
        state.validadd = 0;
        state.modalLoading = true;

        let fee: Array<Amount> = state.tx.fees.map((x: AssetForUI) => ({
          denom: "u" + x.amount.denom,
          amount: x.amount.amount == "" ? "0" : "" + state.input_number * 1e6,
        }));

        let memo = state.tx.memo;
        let send;

        amount.amount = "" + state.input_number * 1e6;
        


        let payload: any = {
          amount,
          delegator_address: address.value,
          validator_address: state.validator_address,
        };

        let repayload: any = {
          amount,
          validator_src_address: state.validator_address,
          validator_dst_address: state.revalidator_address,
          delegator_address: address.value,
        };

        let payRewardload: any = {
          delegator_address: address.value,
          validator_address: state.validator_address,
        };

        try {
          switch (index) {
            case 1:
              send = () =>
                sendMsgDelegate({
                  value: payload,
                  fee,
                  memo,
                });
              break;
            case 2:
              send = () =>
                sendMsgUndelegate({
                  value: payload,
                  fee,
                  memo,
                });
              break;
            case 3:
              send = () =>
                sendMsgRedelegate({
                  value: repayload,
                  fee,
                  memo,
                });
                break;
            case 4:
              send = () =>
                sendMsgGetRewards({
                  value: payRewardload,
                  fee,
                  memo,
                });
          }
          const txResult = await send();

          if (txResult.code) {
            throw new Error();
          }
          state.currentUIState = UI_STATE.TX_SUCCESS;
          state.modalLoading = false;
          state.validator_address = "";
          state.revalidator_address = "";

          state.input_number = 0;

          shownotify("Success");

          state.forceUpdate = true;
        } catch (e) {
          // console.error(e);
          shownotify("Somthing's wrong.");
          state.modalLoading = false;
          state.validator_address = "";
          state.revalidator_address = "";
          state.input_number = 0;
          state.currentUIState = UI_STATE.TX_ERROR;
        }
      },
    };
  },

  async mounted() {
    let $s = useStore();
    let { address } = useAddress({ $s });

    let queryValidators = (opts: any) =>
      $s.dispatch("cosmos.staking.v1beta1/QueryValidators", opts);

    let queryParams = (opts: any) =>
      $s.dispatch("cosmos.staking.v1beta1/QueryParams", opts);

    let queryDelegatorDelegations = (opts: any) =>
      $s.dispatch("cosmos.staking.v1beta1/QueryDelegatorDelegations", opts);

    let queryDelegatorUnbondingDelegations = (opts: any) =>
      $s.dispatch(
        "cosmos.staking.v1beta1/QueryDelegatorUnbondingDelegations",
        opts
      );

    let queryDelegatorRewards = (opts: any) =>
      $s.dispatch(
        "cosmos.distribution.v1beta1/QueryDelegationTotalRewards",
        opts
      );

    const res = await queryValidators({
      params: { status: "true" },
      options: { subscribe: true },
    });

    that = this;

    this.validators = res.validators;
    if(state.selectedvalidator === undefined)
      state.selectedvalidator = this.validators[0];
    const params = await queryParams({
      params: { status: "true" },
      options: { subscribe: true },
    });

    this.unbondtime = params.params.unbonding_time;
    this.unbondtime = this.unbondtime.substr(0, this.unbondtime.length - 1);
    this.unbondtime = Number(this.unbondtime) / (24 * 3600);

    if (address.value == "") {
      this.total_staked = 0;
      this.unbonding_amount = 0;
      this.total_rewards = 0;

      return;
    }
    //////////////////////////////////////// reward module////////////////////////////////
    const totalrewards_response = await queryDelegatorRewards({
      params: { delegator_address: address.value },
      options: { subscribe: true },
    });
    this.rewards_list = totalrewards_response;
    
    this.total_rewards = 0;
    for (let i = 0; i < totalrewards_response.rewards.length; i++) {
      if (totalrewards_response.rewards[i]?.reward[0]?.amount)
        this.total_rewards += Number(
          totalrewards_response.rewards[i].reward[0].amount
        );
    }

    ///////////////////////////////////////  reward module end //////////////////////////

    const delegators = await queryDelegatorDelegations({
      params: { delegator_addr: address.value },
      options: { subscribe: true },
    });

    this.total_staked = 0;
    if (delegators && delegators.delegation_responses) {
      for (let i = 0; i < delegators.delegation_responses.length; i++)
        this.total_staked += Number(
          delegators.delegation_responses[i].balance.amount
        );

      this.delegators_filter = delegators.delegation_responses
        .filter((item) => item.delegation.delegator_address === address.value)
        .map((item) => {
          const vld = this.validators.find((vl) => {
            return vl.operator_address === item.delegation.delegator_address;
          });

          if (vld.description) {
            item.name = vld.description.moniker;
          }
          return item;
        });
    }

    const unbonding = await queryDelegatorUnbondingDelegations({
      params: { delegator_addr: address.value },
      options: { subscribe: true },
    });
    this.unbonding_amount = 0;
    if (unbonding && unbonding.unbonding_responses) {
      for (let i = 0; i < unbonding.unbonding_responses.length; i++)
        for (
          let j = 0;
          j < unbonding.unbonding_responses[i].entries.length;
          j++
        )
          this.unbonding_amount += Number(
            unbonding.unbonding_responses[i].entries[j].balance
          );
    }
    state.filter_src_val_text = "";
    
    // const totalrewards = await queryDelegatorRewards({
    //   params: { delegatorAddress: address.value },
    //   options: { subscribe: true },
    // });
    
  },

  async updated() {
    
    if (state.forceUpdate) {
      let $s = useStore();
      let { address } = useAddress({ $s });
      let { balances } = useAssets({ $s, opts: { extractChannels: true } });

      let queryAllBalances = (opts: any) =>
        $s.dispatch("cosmos.bank.v1beta1/QueryAllBalances", opts);

      let queryValidators = (opts: any) =>
        $s.dispatch("cosmos.staking.v1beta1/QueryValidators", opts);

      let queryParams = (opts: any) =>
        $s.dispatch("cosmos.staking.v1beta1/QueryParams", opts);

      let queryDelegatorDelegations = (opts: any) =>
        $s.dispatch("cosmos.staking.v1beta1/QueryDelegatorDelegations", opts);

      let queryDelegatorUnbondingDelegations = (opts: any) =>
        $s.dispatch(
          "cosmos.staking.v1beta1/QueryDelegatorUnbondingDelegations",
          opts
        );
      let queryDelegatorRewards = (opts: any) =>
        $s.dispatch(
          "cosmos.distribution.v1beta1/QueryDelegationTotalRewards",
          opts
        );

      state.forceUpdate = false;

      const balances_new = await queryAllBalances({
        params: { address: address.value },
        options: { subscribe: true },
      });

      state.balance = balances_new.balances[0].amount;

      const res = await queryValidators({
        params: { status: "true" },
        options: { subscribe: true },
      });

      this.validators = res.validators;
      if(state.selectedvalidator === undefined)
        state.selectedvalidator = this.validators[0];
      const params = await queryParams({
        params: { status: "true" },
        options: { subscribe: true },
      });

      this.unbondtime = params.params.unbonding_time;
      this.unbondtime = this.unbondtime.substr(0, this.unbondtime.length - 1);
      this.unbondtime = Number(this.unbondtime) / (24 * 3600);
      if (address.value == "") {
        this.total_staked = 0;
        this.unbonding_amount = 0;

        return;
      }

      const delegators = await queryDelegatorDelegations({
        params: { delegator_addr: address.value },
        options: { subscribe: true },
      });

      if (delegators && delegators.delegation_responses) {
        this.delegators_filter = delegators.delegation_responses
          .filter((item) => item.delegation.delegator_address === address.value)
          .map((item) => {
            const vld = this.validators.find((vl) => {
              return vl.operator_address === item.delegation.validator_address;
            });

            if (vld.description) {
              item.name = vld.description.moniker;
            }
            return item;
          });
        this.total_staked = 0;
        for (let i = 0; i < delegators.delegation_responses.length; i++)
          this.total_staked += Number(
            delegators.delegation_responses[i].balance.amount
          );
      }

      const unbonding = await queryDelegatorUnbondingDelegations({
        params: { delegator_addr: address.value },
        options: { subscribe: true },
      });
      this.unbonding_amount = 0;

      if (unbonding && unbonding.unbonding_responses) {
        for (let i = 0; i < unbonding.unbonding_responses.length; i++)
          for (
            let j = 0;
            j < unbonding.unbonding_responses[i].entries.length;
            j++
          )
            this.unbonding_amount += Number(
              unbonding.unbonding_responses[i].entries[j].balance
            );
      }

      const totalrewards_response = await queryDelegatorRewards({
        params: { delegator_address: address.value },
        options: { subscribe: true },
      });
      
      this.rewards_list = totalrewards_response;
      
      this.total_rewards = 0;
      for (let i = 0; i < totalrewards_response.rewards.length; i++) {
        if (totalrewards_response.rewards[i]?.reward[0]?.amount)
        this.total_rewards += Number(
          totalrewards_response.rewards[i].reward[0].amount
        );
      }
      
    }
    state.filter_src_val_text = "";
  },
});
</script>

<style scoped>

.row {
  display: flex;
  flex-wrap: wrap;
}
.body{
  background: black;
  color: white;
}
.col {
  flex-grow: 1;
  padding: 20px;
}

.card-item {
  padding: 8px;
}

.card-item p {
  font-size: 16px;
  font-weight: 500;
  text-align: center;
}

.card-item .border-text {
  border: 1px solid #ddd;
  border-radius: 1rem;
  font-size: 20px;
  font-weight: 800;
  padding: 12px 0;
  text-align: center;
}

.card-item button {
  background: #db2777 ;
  border: none;
  border-radius: 1rem;
  color: white;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  margin-top: 10px;
  padding: 12px 0;
  width: 100%;
  text-align: center;
}

.card-item button:hover {
  opacity: 0.8;
}

.card-item button.border {
  border: 1px solid #db2777;
  background: transparent;
  color: #db2777;
  padding: 10px 0;
}

.card-item button.border:hover {
  background: #db2777;
  color: white;
  opacity: 1;
}

.card-item .transparent {
  width: 100%;
  font-size: 14px;
  font-weight: 500;
  margin-top: 10px;
  padding: 12px 0;
  text-align: center;
}

.validators-box table {
  width: 100%;
}

.text-center {
  text-align: center;
}

.table-badge {
  align-items: center;
  border: 1px solid #ddd;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  display: flex;
  font-size: 20px;
  justify-content: space-between;
  margin-top: 30px;
  padding: 16px;
}

.table-badge button {
  font-size: 14px;
  background: #db2777;
  border-radius: 1rem;
  border: 1px solid #db2777;
  color: white;
  cursor: pointer;
  font-weight: 800;
  padding: 10px 20px;
  margin-left: 16px;
}

.table-badge button:hover {
  opacity: 0.8;
}

.table-badge button.border {
  background: transparent;
  color: #db2777;
}

.table-badge button.border:hover {
  background: #db2777;
  color: white;
  font-weight: 800;
  opacity: 1;
}

table {
  font-size: 14px;
  font-weight: 500;
  border-spacing: 0px;
  border-left: 1px solid rgb(158, 147, 147);
  border-right: 1px solid rgb(158, 147, 147);
}

table td {
  padding: 10px;
  border: none;
  border-bottom: 1px solid rgb(158, 147, 147);
}

table tbody td {
  padding: 16px 10px;
}

table a {
  color: #db2777 ;
  font-weight: 700;
  cursor: pointer;
}

table a:hover {
  opacity: 0.8;
}

.comment {
  color: #aaa;
  margin-top: -10px;
  margin-bottom: 20px;
  text-align: center;
}

.notification {
  padding: 15px 26px;
  border: 1px solid #c24c4c;
  border-radius: 1rem;
  margin-bottom: 10px;
}

.notification .title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 700;
}

.notification .title svg {
  width: 26px;
  height: 26px;
  color: #c24c4c;
  padding: 0;
}

.modal-body .label {
  margin-top: 20px;
  margin-bottom: 5px;
  font-weight: 700;
}

.modal-body .desc {
  margin-top: 20px;
  margin-bottom: 20px;
}

.modal-body select {
  width: 100%;
  border: 1px solid #aaa;
  border-radius: 0.5rem;
  padding: 10px;
}

.modal-body input {
  border: 1px solid #aaa;
  border-radius: 0.5rem;
  margin-right: 10px;
  padding: 10px;
}

.modal-body .max-tag {
  color: white;
  background: #db2777;
  border-radius: 0.5rem;
  padding: 5px 10px;
}

.modal-body .max-tag.gray {
  background: #ccc;
}

.modal-body .button-group .button-stake {
  background-color: #db2777;
  border: none;
  color: white;
  margin-right: 10px;
}

.modal-body .button-group .button-cancel {
  background-color: #666;
  border: none;
  color: white;
  margin-right: 10px;
}

.d-flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}

.justify-content-between {
  justify-content: space-between;
}

.text-box {
  padding: 20px 0;
}

.text-box > div {
  margin-bottom: 10px;
}

.text-center {
  text-align: center;
}

</style>
