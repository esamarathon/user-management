<template id="flag-dropdown" >
    <div class="lang-dropdown" tabindex="0" @keypress="jumpTo">
      <div class="flag-box">
        <span v-bind:class="'flag flag-'+selected"></span>
      </div>
      <div class="lang-dropdown-content">
        <ul>
          <li v-for="c in countries" v-on:click="onFlagChange(c.id, c.iso)" :key="c.id">
            <i v-bind:class="'flag flag-'+c.iso" ></i>
            <span style="text-transform: uppercase;"  >{{ c.nicename }}</span>
          </li>
        </ul>
      </div>
    </div>
</template>

<script src="./flag-dropdown.js">
</script>
