<template>
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

<style lang="scss" scoped>
.flag.flag-xx {
  background: #333;
  border: 1px solid #990000;
  height: 22px;
  box-sizing: border-box;
  margin-bottom: 5px;

  &:after {
    content: '?';
    text-align: center;
    display: block;
  }
}
</style>
