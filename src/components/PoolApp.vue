<template>
  <div id="app">
     <div class="top-menu-bar">
      <label for="hamburger" class='border-menu'></label>
      <input type="checkbox" id="hamburger"/>

      <div class='poolsdropdown'>
        <button class='simplebutton' :class="{'loading line': !initializedContracts && !['Stats', 'FAQ', 'Donate'].includes($route.name)}">[{{poolMenu[currentPool]}}]</button>
        <div class='dropdown'>
           <!--  <a :href="'//compound.localhost:8080'+$route.path" :class="{selected: currentPool == 'compound'}" @click="changePools('compound')">Compound</a>
            <a :href="'//usdt.localhost:8080'+$route.path" :class="{selected: currentPool == 'usdt'}" @click="changePools('usdt')">USDT</a>
            <a :href="'//y.localhost:8080'+$route.path" :class="{selected: currentPool == 'iearn'}" @click="changePools('iearn')">Y</a>
            <a :href="'//busd.localhost:8080'+$route.path" :class="{selected: currentPool == 'busd'}" @click="changePools('busd')">bUSD</a> -->

            <router-link :to="'/compound/' + ($route.path.split('/')[2] || '')  " :class="{selected: currentPool == 'compound'}">Compound</router-link>
            <!-- <router-link :to="'/usdt/' + ($route.path.split('/')[2] || '')  " :class="{selected: currentPool == 'usdt'}">USDT</router-link> -->
            <router-link :to="'/pax/' + ($route.path.split('/')[2] || '') " :class="{selected: currentPool == 'pax'}">PAX</router-link>
            <router-link :to="'/iearn/' + ($route.path.split('/')[2] || '') " :class="{selected: currentPool == 'iearn'}">Y</router-link>
            <router-link :to="'/busd/' + ($route.path.split('/')[2] || '')  " :class="{selected: currentPool == 'busd'}">bUSD</router-link>
            <router-link :to="'/susdv2/' + ($route.path.split('/')[2] || '') " :class="{selected: currentPool == 'susdv2'}">sUSD</router-link>
            <router-link :to="'/ren/' + ($route.path.split('/')[2] || '')">renBTC</router-link>
            <!-- <a href="https://iearn.finance/pool">sUSD</a> -->
            <p>____________</p>
            <router-link to='/'>Home</router-link>
            <router-link to='/trade'>Trade</router-link>
            <router-link to='/combinedstats'>All stats</router-link>
            <router-link to='/dailystats'>Daily stats</router-link>
            <router-link to='/volumepercoin'>Coin volumes</router-link>
            <a href="https://twitter.com/CurveFinance">#Twitter</a>
            <a href="https://t.me/curvefi">@Telegram</a>
            <a href="https://explore.duneanalytics.com/public/dashboards/RTH47mNjQcoLv5oG0HMDdI0iDq7BHxk1PzCRdwQB">Dune Analytics</a>
            <p>____________</p>
            <button class='simplebutton' @click = 'changeWallets'>Change wallet</button>
            <button id='changeAccounts' class='simplebutton' 
              v-show="['ledger', 'trezor'].includes(walletName)" 
              @click = 'changeAccounts'>Change accounts</button>
        </div>
      </div>

      <router-link to='/'>Root</router-link>
      <router-link to='/combinedstats' class='showmobile'>All stats</router-link>
      <router-link :to="'/'+currentPool" v-show="currentPool !='susd'">Buy and sell</router-link>
      <router-link :to="'/' + currentPool + '/deposit'" v-show="currentPool !='susd'">Deposit</router-link>
      <router-link :to="'/' + currentPool + '/withdraw'">Withdraw</router-link>
      <router-link :to="'/' + currentPool + '/withdraw_old'" v-show="currentPool == 'compound'">Withdraw old</router-link>
      <router-link to="/susd/withdraw" v-show="currentPool == 'susdv2' && oldBalance > 0">Withdraw old</router-link>
      <router-link :to="'/' + currentPool + '/stats'" v-show="currentPool !='susd'">Stats</router-link>
      <router-link :to="'/' + currentPool + '/profit'" v-show="currentPool !='susd'">Profit</router-link>
      <router-link :to="'/curvepay/' + currentPool">Pay</router-link>
      <div class='poolsdropdown right'>
        <span>?</span>
        <div class='dropdown'>
          <router-link to="/audits">Audits</router-link>
          <router-link to="/events">Events</router-link>
          <a :href="'https://etherscan.io/address/' + this.poolAddress">Pool contract</a>
          <a :href="'https://etherscan.io/address/' + this.tokenAddress">Token contract</a>
          <router-link :to="'/' + currentPool + '/faq'">FAQ</router-link>
          <router-link :to="'/' + currentPool + '/donate'">Donate</router-link>
          <a :href="'https://github.com/curvefi/curve-contract/tree/pool_'+gitBranches[currentPool]">git@</a>
          <a href="https://github.com/pengiundev/curve-vue">git@UI</a>
        </div>
      </div>
      <router-link to="/audits" class='showmobile'>Audits</router-link>
      <router-link to="/events" class='showmobile'>Events</router-link>
      <router-link :to="'/' + currentPool + '/faq'" class='showmobile'>FAQ</router-link>
      <router-link :to="'/' + currentPool + '/donate'" class='showmobile'>Donate</router-link>
      <a :href="'https://github.com/curvefi/curve-contract/tree/pool_'+gitBranches[currentPool]" class='showmobile'>git@</a>
      <a href="https://github.com/pengiundev/curve-vue" class='showmobile'>git@UI</a>
      <button class='simplebutton showmobile' @click = 'changeWallets'>Change wallet</button>
      <button id='changeAccounts' class='simplebutton showmobile' 
        v-show="['ledger', 'trezor'].includes(walletName)" 
        @click = 'changeAccounts'>Change accounts</button>
    </div>
    <div id="screen">
        <div :class="{'blue window': true, [$route.name]: true}">
            <h1><img :src="logoSrc" alt="🌀 Curve"></h1>
        </div>
        <div class="error window half-width info" id="error-window" v-show='error'>
          {{error}}
        </div>
        <router-view/>
    </div>
    <balances-info
    :class = '{[$route.name]: true}'
    :bal_info = 'bal_info'
    :total = 'balTotal'
    :l_info = 'l_info'
    :totalShare = 'totalShare'
    :staked_info = 'staked_info'
    :totalStake = 'totalStake'
    :fee = 'fee'
    :admin_fee = 'admin_fee'
    :currencies = 'currencies'
    v-if="!['Stats', 'FAQ', 'Donate', 'Root', 'CombinedStats'].includes($route.name)"/>
  </div>
</template>

<script>
  import BalancesInfo from '../components/BalancesInfo.vue'
  import { getters, contract as currentContract, changeContract, poolMenu } from '../contract'
  import init, { onboard } from '../init'
  import allabis from '../allabis'

  export default {
    data: () => ({
      gitBranches: {
        compound: 'compound',
        usdt: 'usdt',
        iearn: 'y',
        y: 'y',
        busd: 'busd',
        susd: 'susd_vulnerable',
        susdv2: 'susd_plain',
        pax: 'pax',
        tbtc: 'tbtc',
        ren: 'ren',
      }
    }),
    components: {
      BalancesInfo,
    },
    computed: {
      allGetters() {
        return getters;
      },
      ...getters,
      poolMenu() {
        return poolMenu;
      },
      poolAddress() {
        return allabis[this.currentPool].swap_address
      },
      tokenAddress() {
        return allabis[this.currentPool].token_address
      },
      publicPath() {
        return process.env.BASE_URL
      },
      logoSrc() {
        if(!currentContract.swapbtc) return this.publicPath + 'logo_optimized.svg'
        else return this.publicPath + 'logo_ren_beta_optimized.svg'
      },
    },
    methods: {
      changePools(pool) {
        changeContract(pool)
      },
      async changeWallets() {
        localStorage.removeItem('selectedWallet')
        currentContract.totalShare = 0
        init(false)
      },
      async changeAccounts() {
        return onboard.accountSelect();
      },
    },
  }
</script>

<style>
  #changeAccounts {
    margin-top: 0.3em;
  }
  a.showmobile {
    display: none;
  }
  @media only screen and (min-device-width : 320px) and (max-device-width : 730px) {
    #hamburger:checked ~ a.showmobile {
      display: block;
    }
  }
  h1 > img {
    height: 52.125px;
  }
</style>